import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_ANON_KEY must be set. These are safe to expose ' +
    'and are already configured on Render. Missing them means the server was ' +
    'started without its database configured.'
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  // Not throwing here on purpose: we want auth/read flows to still work in an
  // environment where the service key hasn't been added yet, but every write
  // that goes through supabaseAdmin will fail loudly and specifically, which
  // is far better than silently falling back to in-memory state.
  console.warn(
    '[Safespace] SUPABASE_SERVICE_ROLE_KEY is not set. Privileged backend ' +
    'operations (payment verification, admin actions, safeguarding case ' +
    'creation, payouts) will fail until it is added in Render → Environment. ' +
    'Get it from Supabase → Settings → API → service_role. Never expose it ' +
    'to the frontend or commit it to source control.'
  );
}

/**
 * ADMIN CLIENT — service_role key. Bypasses Row-Level Security entirely.
 *
 * Use ONLY for:
 *   - operations that are legitimately cross-user (admin verifying a
 *     provider, safety reviewer actioning a case that isn't their own)
 *   - operations RLS structurally cannot express (payment webhook writes,
 *     which have no authenticated user context at all)
 *
 * NEVER use this client to satisfy a request just because it's convenient —
 * every use of supabaseAdmin is a deliberate decision to bypass the RLS
 * policies already enforced in the database. If a route can instead use the
 * caller's own scoped client (see getSupabaseForRequest below), prefer that:
 * it means Postgres enforces the authorization, not application code, and
 * there is exactly one source of truth for "who can touch this row."
 */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, // falls back to anon (read-only-ish via RLS) if unset, rather than crashing at import time
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Builds a request-scoped Supabase client authenticated as the calling
 * user's own access token. Every query made through this client is subject
 * to the RLS policies and column grants already applied to the database —
 * e.g. a seeker calling .update() on provider_applications through this
 * client will have identity_verification_status silently rejected by
 * Postgres, not by application-level filtering. This is the same fix
 * pattern already applied to `profiles`.
 */
export function getSupabaseForToken(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

/**
 * Plain anon-key client with no user token attached yet -- used only for
 * the actions that happen *before* we have a session: sign-up, sign-in,
 * OTP verification, resend. Every other client-owned action after that
 * point should use getSupabaseForToken() instead.
 */
export const supabasePublic: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});
