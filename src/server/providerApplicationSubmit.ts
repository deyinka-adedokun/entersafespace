import type { Express } from 'express';
import { requireAuth } from './authMiddleware.js';

const APPLICANT_EDITABLE_FIELDS = [
  'legal_name', 'display_name', 'date_of_birth', 'email', 'phone', 'location',
  'preferred_languages', 'bio_introduction', 'listening_experience',
  'has_support_experience', 'support_experience_details', 'education_background',
  'certifications', 'languages_spoken', 'max_duration_capability',
  'weekly_availability_windows', 'is_over_18', 'identity_document_type'
] as const;

function pickApplicantFields(payload: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of APPLICANT_EDITABLE_FIELDS) {
    if (key in payload) out[key] = payload[key];
  }
  return out;
}

export function registerProviderApplicationSubmit(app: Express) {
  app.post('/api/v1/providers/application/submit', requireAuth, async (req, res) => {
    const safeFields = pickApplicantFields(req.body || {});

    const { data: existing } = await req.supabase!
      .from('provider_applications')
      .select('id')
      .eq('user_id', req.user!.id)
      .maybeSingle();

    // Submission-specific fields are forced server-side, never taken from
    // the request body -- exactly the fields the old Object.assign() call
    // let a client set directly.
    const submissionFields = {
      status: 'SUBMITTED',
      identity_verification_status: 'IN_REVIEW',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      code_of_conduct_accepted: true,
      code_of_conduct_accepted_at: new Date().toISOString()
    };

    const result = existing
      ? await req.supabase!
          .from('provider_applications')
          .update({ ...safeFields, ...submissionFields })
          .eq('user_id', req.user!.id)
          .select()
          .single()
      : await req.supabase!
          .from('provider_applications')
          .insert({ ...safeFields, ...submissionFields, user_id: req.user!.id })
          .select()
          .single();

    if (result.error) {
      return res.status(403).json({
        success: false,
        error: { code: 'SUBMISSION_FAILED', message: 'One or more fields in your request cannot be set directly.' }
      });
    }

    res.json({
      success: true,
      message: "Application submitted. Thank you. We'll review your application and guide you through the next steps.",
      data: { application: result.data }
    });
  });
}
