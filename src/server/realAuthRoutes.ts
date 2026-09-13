import type { Express } from 'express';
import { supabaseAdmin, supabasePublic, getSupabaseForToken } from './supabaseClients.js';
import { requireAuth } from './authMiddleware.js';

async function loadUserPayload(accessToken: string) {
  const scoped = getSupabaseForToken(accessToken);
  const { data: profile } = await scoped
    .from('profiles')
    .select('id, email, phone, display_name, role, status')
    .single();

  const { data: providerProfile } = await scoped
    .from('provider_profiles')
    .select('*')
    .eq('user_id', profile?.id)
    .maybeSingle();

  return { user: profile || null, providerProfile: providerProfile || null };
}

export function registerRealAuthRoutes(app: Express) {
  // -----------------------------------------------------------------------
  // REGISTER. Real Supabase Auth signup instead of an in-memory array with
  // a plaintext password. `role` is deliberately never read from the
  // request body -- the database trigger defaults every new signup to
  // SUPPORT_SEEKER regardless of what's sent, so nobody can register
  // themselves as ADMIN by adding a field to the request.
  // -----------------------------------------------------------------------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !EMAIL_RE.test(String(email).trim())) {
  return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address.' } });
}
  app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password, displayName, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Email and password are required.' } });
    }

    const { data, error } = await supabasePublic.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, phone } }
    });

    if (error) {
      const isDuplicate = /already registered|already exists/i.test(error.message);
      return res.status(400).json({
        success: false,
        error: {
          code: isDuplicate ? 'EMAIL_IN_USE' : 'REGISTRATION_FAILED',
          message: isDuplicate ? 'An account with this email address already exists.' : error.message
        }
      });
    }

    // If your Supabase project has "Confirm email" turned OFF, signUp()
    // returns an active session immediately and the user is already
    // logged in -- no OTP step needed at all.
    if (data.session) {
      const payload = await loadUserPayload(data.session.access_token);
      return res.json({
        success: true,
        message: 'Registration successful.',
        data: {
          ...payload,
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
          }
        }
      });
    }

    // Otherwise Supabase has sent a confirmation email and is waiting for
    // either the link to be clicked or the code to be submitted here.
    res.json({
      success: true,
      requiresOtp: true,
      message: 'Registration successful! Check your email to verify your account.',
      data: { email }
    });
  });

  // -----------------------------------------------------------------------
  // VERIFY OTP. Uses the real code Supabase generated, not a hardcoded
  // '123456' that worked for every account.
  // -----------------------------------------------------------------------
  app.post('/api/v1/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_OTP', message: 'Email and verification code are required.' } });
    }

    const { data, error } = await supabasePublic.auth.verifyOtp({ email, token: otp, type: 'signup' });

    if (error || !data.session) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired verification code.' } });
    }

    const payload = await loadUserPayload(data.session.access_token);
    res.json({
      success: true,
      message: 'Account verified successfully.',
      data: {
        ...payload,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // RESEND OTP.
  // -----------------------------------------------------------------------
  app.post('/api/v1/auth/resend-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_EMAIL', message: 'Email is required.' } });
    }
    const { error } = await supabasePublic.auth.resend({ type: 'signup', email });
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'RESEND_FAILED', message: error.message } });
    }
    res.json({ success: true, message: 'A new verification code has been sent.' });
  });

  // -----------------------------------------------------------------------
  // LOGIN. Real password check via Supabase Auth -- no 'Password123!'
  // universal bypass, no plaintext comparison.
  // -----------------------------------------------------------------------
  app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required.' } });
    }

    const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    const payload = await loadUserPayload(data.session.access_token);

    if (payload.user?.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended. Please contact safety support.' } });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        ...payload,
        // IMPORTANT: the frontend must store access_token and send it as
        // `Authorization: Bearer <access_token>` on every request from now
        // on -- this is what replaces the old global activeUserId.
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    });
  });

  // -----------------------------------------------------------------------
  // LOGOUT. Stateless JWTs -- the meaningful part of logout is the
  // frontend discarding the stored token. Nothing server-side to do.
  // -----------------------------------------------------------------------
  app.post('/api/v1/auth/logout', (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // -----------------------------------------------------------------------
  // PROFILE UPDATE. Uses the caller's own token -- RLS + the column-grant
  // restriction already on `profiles` means role/status can't be touched
  // here no matter what the request body contains.
  // -----------------------------------------------------------------------
  app.put('/api/v1/auth/profile', requireAuth, async (req, res) => {
    const { displayName, phone, preferredLanguage, preferredProviderId } = req.body;
    const updates: Record<string, unknown> = {};
    if (displayName) updates.display_name = displayName;
    if (phone) updates.phone = phone;
    if (preferredLanguage) updates.preferred_language = preferredLanguage;
    if (preferredProviderId !== undefined) updates.preferred_provider_id = preferredProviderId;

    const { data, error } = await req.supabase!
      .from('profiles')
      .update(updates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(403).json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Could not update profile.' } });
    }

    res.json({ success: true, message: 'Profile updated successfully.', data: { user: data } });
  });
    // -----------------------------------------------------------------------
  // FORGOT PASSWORD. Always responds success, whether or not the email
  // exists -- this prevents the endpoint being used to enumerate accounts.
  // -----------------------------------------------------------------------
  app.post('/api/v1/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_EMAIL', message: 'Email is required.' } });
    }

    await supabasePublic.auth.resetPasswordForEmail(email);
    // Deliberately ignore any error here (e.g. "user not found") and
    // always return the same response.

    res.json({
      success: true,
      message: 'If an account exists for that email, a reset code has been sent.'
    });
  });

  // -----------------------------------------------------------------------
  // RESET PASSWORD. Verifies the recovery token Supabase emailed, then
  // sets the new password via the service-role admin client.
  //
  // NOTE: for the emailed code to work here, the Supabase Dashboard's
  // "Reset Password" email template must include {{ .Token }} in its body
  // (Authentication -> Email Templates -> Reset Password).
  // -----------------------------------------------------------------------
  app.post('/api/v1/auth/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Email, code and new password are required.' } });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters.' } });
    }

    const { data, error } = await supabasePublic.auth.verifyOtp({ email, token, type: 'recovery' });
    if (error || !data.user) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset code.' } });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, { password: newPassword });
    if (updateError) {
      return res.status(500).json({ success: false, error: { code: 'RESET_FAILED', message: 'Could not update password. Please try again.' } });
    }

    res.json({ success: true, message: 'Password updated. You can now sign in.' });
  });
}
