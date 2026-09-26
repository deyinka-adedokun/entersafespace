import type { Express } from 'express';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from './supabaseClients.js';
import { attachAuth, requireAuth } from './authMiddleware.js';
import { fail, handle, receiveAvatar, sniffImage } from './routeHelpers.js';

// ---------------------------------------------------------------------------
// The signed-in person's own account details and profile photo.
//
// Seekers are anonymous to listeners, so their photo lives in the private
// 'seeker-avatars' bucket and is only ever returned to its owner as a
// short-lived signed URL.
// ---------------------------------------------------------------------------

const SEEKER_AVATAR_BUCKET = 'seeker-avatars';
const SIGNED_URL_SECONDS = 60 * 60;

/** The full user object the frontend expects, read from `profiles`. */
export async function buildUserPayload(userId: string) {
  const { data: p, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, phone, display_name, role, status, free_trial_used, preferred_language, preferred_provider_id, saved_payment_method, avatar_path, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!p) return null;

  let avatarUrl: string | undefined;
  if (p.avatar_path) {
    const { data: signed } = await supabaseAdmin.storage.from(SEEKER_AVATAR_BUCKET).createSignedUrl(p.avatar_path, SIGNED_URL_SECONDS);
    avatarUrl = signed?.signedUrl;
  }

  return {
    id: p.id,
    email: p.email,
    phone: p.phone || undefined,
    displayName: p.display_name,
    role: p.role,
    status: p.status,
    freeTrialUsed: Boolean(p.free_trial_used),
    preferredLanguage: p.preferred_language || undefined,
    preferredProviderId: p.preferred_provider_id || undefined,
    savedPaymentMethod: p.saved_payment_method || undefined,
    avatarUrl,
    createdAt: p.created_at
  };
}

export function registerProfileRoutes(app: Express) {
  // Problems the browser reports (audio failures, page errors), written to the
  // server log so they can be diagnosed. Nothing is stored. Clipped and
  // single-line so a client can't flood or forge log output.
  app.post('/api/v1/client-log', attachAuth, (req, res) => {
    const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').slice(0, max);
    const { kind, message, sessionId, detail } = req.body || {};
    const who = req.user ? `${req.user.role} ${req.user.id}` : 'anonymous';
    console.warn(`[Safespace][client] ${clean(kind, 40)} | ${who} | session ${clean(sessionId, 40) || '-'} | ${clean(message, 300)} | ${clean(detail, 500)}`);
    res.json({ success: true });
  });

  app.post('/api/v1/profile/avatar', requireAuth, receiveAvatar, handle('profile avatar', async (req, res) => {
    const userId = req.user!.id;
    const file = req.file;
    if (!file) return fail(res, 400, 'NO_FILE', 'Please choose a photo to upload.');
    const kind = sniffImage(file.buffer);
    if (!kind) return fail(res, 400, 'INVALID_IMAGE', 'Please upload a JPG, PNG or WebP image.');

    const { data: current } = await supabaseAdmin.from('profiles').select('avatar_path').eq('id', userId).single();

    const path = `${userId}/${randomUUID()}.${kind.ext}`;
    const { error: uploadError } = await supabaseAdmin.storage.from(SEEKER_AVATAR_BUCKET)
      .upload(path, file.buffer, { contentType: kind.contentType, upsert: false });
    if (uploadError) throw uploadError;

    const { error } = await supabaseAdmin.from('profiles').update({ avatar_path: path }).eq('id', userId);
    if (error) throw error;

    // Remove the previous photo so old pictures don't linger.
    if (current?.avatar_path && current.avatar_path.startsWith(`${userId}/`)) {
      const { error: removeError } = await supabaseAdmin.storage.from(SEEKER_AVATAR_BUCKET).remove([current.avatar_path]);
      if (removeError) console.error('[Safespace] old seeker avatar removal failed:', removeError);
    }

    res.json({ success: true, data: { user: await buildUserPayload(userId) } });
  }));
}
