import type { Express } from 'express';
import { attachAuth, requireAuth, requireAdmin } from './authMiddleware.js';
import { supabaseAdmin } from './supabaseClients.js';

export function registerExampleRoutes(app: Express) {
  app.post('/api/v1/auth/switch-role', (_req, res) => {
    res.status(410).json({
      success: false,
      error: { code: 'REMOVED', message: 'This endpoint has been permanently removed for security reasons.' }
    });
  });

  app.get('/api/v1/auth/me', attachAuth, async (req, res) => {
    if (!req.user) {
      return res.json({ success: true, data: { user: null, providerProfile: null } });
    }

    const { data: providerProfile } = await req.supabase!
      .from('provider_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    res.json({ success: true, data: { user: req.user, providerProfile: providerProfile || null } });
  });

  const APPLICANT_EDITABLE_FIELDS = [
    'legal_name', 'display_name', 'date_of_birth', 'email', 'phone', 'location',
    'preferred_languages', 'bio_introduction', 'listening_experience',
    'has_support_experience', 'support_experience_details', 'education_background',
    'certifications', 'languages_spoken', 'max_duration_capability',
    'weekly_availability_windows', 'is_over_18', 'identity_document_type',
    'code_of_conduct_accepted', 'code_of_conduct_accepted_at'
  ] as const;

  function pickApplicantFields(payload: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const key of APPLICANT_EDITABLE_FIELDS) {
      if (key in payload) out[key] = payload[key];
    }
    return out;
  }

  app.post('/api/v1/providers/application/save', requireAuth, async (req, res) => {
    const safeFields = pickApplicantFields(req.body || {});

    const { data: existing } = await req.supabase!
      .from('provider_applications')
      .select('id')
      .eq('user_id', req.user!.id)
      .maybeSingle();

    const result = existing
      ? await req.supabase!
          .from('provider_applications')
          .update({ ...safeFields, updated_at: new Date().toISOString() })
          .eq('user_id', req.user!.id)
          .select()
          .single()
      : await req.supabase!
          .from('provider_applications')
          .insert({ ...safeFields, user_id: req.user!.id })
          .select()
          .single();

    if (result.error) {
      return res.status(403).json({
        success: false,
        error: { code: 'FIELD_NOT_EDITABLE', message: 'One or more fields in your request cannot be set directly. Verification and training status are set by Safespace reviewers.' }
      });
    }

    res.json({ success: true, data: { application: result.data } });
  });

  app.post('/api/v1/admin/providers/:id/verify', requireAuth, requireAdmin, async (req, res) => {
    const { verificationStatus } = req.body;
    const allowed = ['APPLICANT', 'UNDER_REVIEW', 'VERIFIED', 'PROBATION', 'REJECTED', 'SUSPENDED'];
    if (!allowed.includes(verificationStatus)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Invalid verification status.' } });
    }

    const { data: provider, error } = await supabaseAdmin
      .from('provider_profiles')
      .update({ verification_status: verificationStatus, verified: verificationStatus === 'VERIFIED' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !provider) {
      return res.status(404).json({ success: false, error: { code: 'PROVIDER_NOT_FOUND', message: 'Listener profile not found.' } });
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: req.user!.id,
      actor_name: req.user!.displayName,
      action: 'PROVIDER_VERIFICATION_UPDATED',
      resource: 'PROVIDER_PROFILE',
      resource_id: provider.id,
      metadata: { to: verificationStatus, verified: provider.verified }
    });

    res.json({ success: true, message: `Listener verification set to ${verificationStatus}.`, data: { provider } });
  });
}
