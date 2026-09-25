import type { Express, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from './supabaseClients.js';
import { attachAuth, requireAuth, requireAdmin, type AuthenticatedUser } from './authMiddleware.js';

// ---------------------------------------------------------------------------
// Sessions, support requests, service-led matching and the provider-side
// calls they depend on -- all persisted in Supabase instead of in-memory
// arrays, and all keyed to the authenticated caller (req.user), never to a
// process-wide "current user".
//
// Writes go through supabaseAdmin because they are server-authoritative
// (timer, reservations, earnings) and cross users (a seeker's request
// reserves a provider). Every route checks the caller's right to act before
// touching data.
//
// Payments are still simulated here (see /extend and /sessions/create) --
// that is the open Flutterwave P0 and is deliberately not solved in this
// module.
// ---------------------------------------------------------------------------

// How long a matched provider is held for the seeker to press "Start talking".
const RESERVATION_MS = 10 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROVIDER_SET_STATUSES = ['AVAILABLE', 'AWAY', 'OFFLINE'];
const MAX_DURATION_OPTIONS = [15, 30, 60, 90];

type Row = Record<string, any>;

function fail(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ success: false, error: { code, message } });
}

function serverError(res: Response, context: string, error: unknown) {
  console.error(`[Safespace] ${context}:`, error);
  return fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
}

// --- Row mappers (snake_case DB rows -> the camelCase shapes the UI uses) ---

function mapPackage(r: Row) {
  return {
    id: r.id,
    name: r.name,
    durationSeconds: r.duration_seconds,
    durationMinutes: r.duration_minutes,
    priceNGN: Number(r.price_ngn),
    description: r.description,
    isFreeTrial: Boolean(r.is_free_trial),
    providerSharePercent: Number(r.provider_share_percent)
  };
}

function mapSession(r: Row) {
  return {
    id: r.id,
    seekerId: r.seeker_id,
    seekerDisplayName: r.seeker_display_name,
    providerId: r.provider_id,
    providerDisplayName: r.provider_display_name,
    providerAvatarUrl: r.provider_avatar_url || undefined,
    packageId: r.package_id,
    packageName: r.package_name,
    allocatedSeconds: r.allocated_seconds,
    consumedSeconds: r.consumed_seconds,
    status: r.status,
    startedAt: r.started_at || undefined,
    endedAt: r.ended_at || undefined,
    creditId: r.credit_id,
    isExtension: Boolean(r.is_extension),
    isFreeTrial: Boolean(r.is_free_trial),
    audioConnected: Boolean(r.audio_connected)
  };
}

function mapRequest(r: Row) {
  return {
    id: r.id,
    seekerId: r.seeker_id,
    packageId: r.package_id,
    supportReason: r.support_reason,
    languagePreference: r.language_preference || undefined,
    genderPreference: r.gender_preference || undefined,
    experiencePreference: r.experience_preference || undefined,
    status: r.status,
    createdAt: r.created_at,
    expiresAt: r.expires_at
  };
}

function mapExtension(r: Row) {
  return {
    id: r.id,
    sessionId: r.session_id,
    seekerId: r.seeker_id,
    packageId: r.package_id,
    packageName: r.package_name,
    durationSeconds: r.duration_seconds,
    durationMinutes: r.duration_minutes,
    amountNGN: Number(r.amount_ngn),
    providerShareNGN: Number(r.provider_share_ngn),
    paymentId: r.payment_id,
    status: r.status,
    createdAt: r.created_at,
    completedAt: r.completed_at || undefined
  };
}

function mapEarning(r: Row) {
  return {
    id: r.id,
    providerId: r.provider_id,
    sessionId: r.session_id,
    packageName: r.package_name,
    grossSessionValueNGN: Number(r.gross_session_value_ngn),
    providerSharePercent: Number(r.provider_share_percent),
    providerAmountNGN: Number(r.provider_amount_ngn),
    status: r.status,
    createdAt: r.created_at
  };
}

// Full provider profile -- only for the provider themself or admins.
function mapProvider(r: Row) {
  return {
    id: r.id,
    userId: r.user_id,
    displayName: r.display_name,
    bio: r.bio || '',
    avatarUrl: r.avatar_url || '',
    languages: r.languages || [],
    gender: r.gender,
    verified: Boolean(r.verified),
    verificationStatus: r.verification_status,
    availabilityStatus: r.availability_status,
    maxSessionMinutes: r.max_session_minutes,
    rating: Number(r.rating),
    ratingCount: r.rating_count,
    sessionsCompleted: r.sessions_completed,
    qualityScore: Number(r.quality_score),
    listeningAreas: r.listening_areas || [],
    currentSessionId: r.current_session_id || undefined,
    preferredSessionTypes: r.preferred_session_types || [],
    progressionLevel: r.progression_level || undefined,
    trainingCompleted: Boolean(r.training_completed),
    trainingModules: r.training_modules || []
  };
}

// What a matched seeker is allowed to see about their listener: no account
// id, no session pointers, no internal quality or training data.
function publicProvider(r: Row) {
  return {
    id: r.id,
    displayName: r.display_name,
    bio: r.bio || '',
    avatarUrl: r.avatar_url || '',
    languages: r.languages || [],
    gender: r.gender,
    verified: Boolean(r.verified),
    maxSessionMinutes: r.max_session_minutes,
    rating: Number(r.rating),
    ratingCount: r.rating_count,
    sessionsCompleted: r.sessions_completed,
    listeningAreas: r.listening_areas || []
  };
}

// --- Data helpers ---

async function getPackage(id: unknown) {
  if (typeof id !== 'string' || !id) return null;
  const { data, error } = await supabaseAdmin.from('session_packages').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function getFreeTrialUsed(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.from('profiles').select('free_trial_used').eq('id', userId).single();
  if (error) throw error;
  return Boolean(data.free_trial_used);
}

async function writeAudit(actor: AuthenticatedUser | null, action: string, resource: string, resourceId: string, metadata?: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    actor_id: actor?.id ?? null,
    actor_name: actor?.displayName ?? 'System',
    action,
    resource,
    resource_id: resourceId,
    metadata: metadata ?? null
  });
  // An audit write failing must not fail the user's action, but it must be visible.
  if (error) console.error('[Safespace] audit log write failed:', action, error);
}

// Seconds used so far, computed from the server clock -- never from how
// often a client happens to poll.
function elapsedSeconds(session: Row): number {
  if (!session.started_at) return session.consumed_seconds || 0;
  const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
  return Math.min(session.allocated_seconds, Math.max(0, elapsed));
}

function remainingOf(session: Row) {
  return Math.max(0, session.allocated_seconds - session.consumed_seconds);
}

async function releaseProvider(providerUserId: string, countCompleted: boolean) {
  const { data: provider } = await supabaseAdmin
    .from('provider_profiles')
    .select('id, sessions_completed')
    .eq('user_id', providerUserId)
    .maybeSingle();
  if (!provider) return;
  const updates: Row = { availability_status: 'AVAILABLE', current_session_id: null };
  if (countCompleted) updates.sessions_completed = (provider.sessions_completed || 0) + 1;
  const { error } = await supabaseAdmin.from('provider_profiles').update(updates).eq('id', provider.id);
  if (error) console.error('[Safespace] provider release failed:', error);
}

/**
 * Moves an ACTIVE session to COMPLETED exactly once. The conditional update
 * (status = 'ACTIVE') means that if the seeker, the provider and the stale
 * sweep all try at the same moment, only one of them records the earning.
 */
async function completeSession(session: Row, actor: AuthenticatedUser | null, reason: string): Promise<Row> {
  const consumed = elapsedSeconds(session);
  const { data: completed, error } = await supabaseAdmin
    .from('sessions')
    .update({ status: 'COMPLETED', ended_at: new Date().toISOString(), consumed_seconds: consumed })
    .eq('id', session.id)
    .eq('status', 'ACTIVE')
    .select()
    .maybeSingle();
  if (error) throw error;

  if (!completed) {
    // Someone else completed it first -- return the current state.
    const { data: current } = await supabaseAdmin.from('sessions').select('*').eq('id', session.id).single();
    return current;
  }

  const pkg = await getPackage(completed.package_id);
  if (pkg && Number(pkg.price_ngn) > 0 && completed.provider_id) {
    const share = Number(pkg.provider_share_percent);
    const { error: earningError } = await supabaseAdmin.from('provider_earnings').insert({
      provider_id: completed.provider_id,
      session_id: completed.id,
      package_name: pkg.name,
      gross_session_value_ngn: Number(pkg.price_ngn),
      provider_share_percent: share,
      provider_amount_ngn: Number(pkg.price_ngn) * (share / 100),
      status: 'AVAILABLE'
    });
    if (earningError) console.error('[Safespace] earning write failed for session', completed.id, earningError);
  }

  if (completed.provider_id) await releaseProvider(completed.provider_id, true);
  await writeAudit(actor, 'SESSION_END', 'SESSION', completed.id, { reason, consumedSeconds: consumed });
  return completed;
}

/**
 * Housekeeping run before matching: finishes sessions whose time ran out
 * while nobody was polling, and frees providers held for seekers who never
 * pressed "Start talking".
 */
async function settleStale() {
  const { data: active } = await supabaseAdmin.from('sessions').select('*').eq('status', 'ACTIVE').limit(100);
  for (const s of active || []) {
    if (elapsedSeconds(s) >= s.allocated_seconds) {
      try { await completeSession(s, null, 'TIME_EXPIRED'); } catch (e) { console.error('[Safespace] stale session settle failed:', e); }
    }
  }

  const nowIso = new Date().toISOString();
  const { data: lapsed } = await supabaseAdmin
    .from('support_requests')
    .update({ status: 'EXPIRED' })
    .in('status', ['REQUESTED', 'MATCHING', 'MATCHED'])
    .is('session_id', null)
    .lt('expires_at', nowIso)
    .select('matched_provider_id');
  for (const r of lapsed || []) {
    if (!r.matched_provider_id) continue;
    await supabaseAdmin
      .from('provider_profiles')
      .update({ availability_status: 'AVAILABLE' })
      .eq('id', r.matched_provider_id)
      .eq('availability_status', 'BUSY')
      .is('current_session_id', null);
  }
}

// Loads a session the caller participates in, or sends the error response.
async function loadOwnSession(req: Request, res: Response, opts: { seekerOnly?: boolean } = {}): Promise<Row | null> {
  const id = req.params.id;
  if (!UUID_RE.test(id)) {
    fail(res, 404, 'SESSION_NOT_FOUND', 'Session does not exist.');
    return null;
  }
  const { data: session, error } = await supabaseAdmin.from('sessions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!session) {
    fail(res, 404, 'SESSION_NOT_FOUND', 'Session does not exist.');
    return null;
  }
  const userId = req.user!.id;
  const allowed = opts.seekerOnly ? session.seeker_id === userId : (session.seeker_id === userId || session.provider_id === userId);
  if (!allowed) {
    fail(res, 403, 'FORBIDDEN', opts.seekerOnly ? 'Only the seeker can do this for this session.' : 'You are not a participant in this session.');
    return null;
  }
  return session;
}

// Brings an ACTIVE session's clock up to date (and completes it if time is up).
async function syncClock(session: Row, actor: AuthenticatedUser, persist: boolean): Promise<Row> {
  if (session.status !== 'ACTIVE') return session;
  const consumed = elapsedSeconds(session);
  if (consumed >= session.allocated_seconds) {
    return completeSession(session, actor, 'TIME_EXPIRED');
  }
  if (!persist) return { ...session, consumed_seconds: consumed };
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update({ consumed_seconds: consumed })
    .eq('id', session.id)
    .eq('status', 'ACTIVE')
    .select()
    .maybeSingle();
  if (error) throw error;
  return data || session;
}

function sessionPayload(session: Row) {
  const remainingSeconds = remainingOf(session);
  return {
    session: mapSession(session),
    remainingSeconds,
    isLowCredit: remainingSeconds <= 300 && remainingSeconds > 0
  };
}

async function getOwnProvider(req: Request, res: Response): Promise<Row | null> {
  const { data, error } = await supabaseAdmin.from('provider_profiles').select('*').eq('user_id', req.user!.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    fail(res, 404, 'NOT_A_PROVIDER', 'No provider profile found for this account.');
    return null;
  }
  return data;
}

// Wraps async handlers so a thrown Supabase error becomes a 500 instead of
// an unhandled rejection that leaves the request hanging.
function handle(context: string, fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response) => {
    fn(req, res).catch(err => {
      if (!res.headersSent) serverError(res, context, err);
      else console.error(`[Safespace] ${context}:`, err);
    });
  };
}

export function registerSessionRoutes(app: Express) {
  // -------------------------------------------------------------------------
  // PACKAGES
  // -------------------------------------------------------------------------
  app.get('/api/v1/packages', attachAuth, handle('packages', async (req, res) => {
    const { data, error } = await supabaseAdmin.from('session_packages').select('*').order('duration_seconds');
    if (error) throw error;
    const freeTrialUsed = req.user ? await getFreeTrialUsed(req.user.id) : false;
    res.json({ success: true, data: { packages: (data || []).map(mapPackage), userFreeTrialEligible: !freeTrialUsed } });
  }));

  // -------------------------------------------------------------------------
  // SUPPORT REQUEST + SERVICE-LED MATCHING
  // Seekers never browse or pick listeners; the server picks one.
  // -------------------------------------------------------------------------
  app.post('/api/v1/support/request', requireAuth, handle('support request', async (req, res) => {
    const user = req.user!;
    const { packageId, supportReason, languagePreference, genderPreference, experiencePreference } = req.body;

    const pkg = await getPackage(packageId);
    if (!pkg) return fail(res, 400, 'INVALID_PACKAGE', 'Selected conversation package is invalid.');
    if (pkg.is_free_trial && await getFreeTrialUsed(user.id)) {
      return fail(res, 400, 'TRIAL_ALREADY_USED', 'You have already used your 3-minute free trial.');
    }

    await settleStale();

    const gender = ['male', 'female', 'no-preference'].includes(genderPreference) ? genderPreference : null;
    const { data: request, error: insertError } = await supabaseAdmin.from('support_requests').insert({
      seeker_id: user.id,
      package_id: pkg.id,
      support_reason: typeof supportReason === 'string' && supportReason.trim() ? supportReason.trim().slice(0, 500) : 'I just need someone to listen',
      language_preference: typeof languagePreference === 'string' ? languagePreference : null,
      gender_preference: gender,
      experience_preference: typeof experiencePreference === 'string' ? experiencePreference : null,
      status: 'MATCHING',
      expires_at: new Date(Date.now() + RESERVATION_MS).toISOString()
    }).select().single();
    if (insertError) throw insertError;

    // Hard constraints: verified, available, can take this length, not blocked, not themself.
    const [{ data: candidates, error: candidateError }, { data: blocks }, { data: seekerProfile }] = await Promise.all([
      supabaseAdmin.from('provider_profiles').select('*')
        .eq('verified', true)
        .eq('verification_status', 'VERIFIED')
        .eq('availability_status', 'AVAILABLE')
        .gte('max_session_minutes', pkg.duration_minutes)
        .neq('user_id', user.id),
      supabaseAdmin.from('user_blocks').select('blocker_user_id, blocked_user_id')
        .or(`blocker_user_id.eq.${user.id},blocked_user_id.eq.${user.id}`),
      supabaseAdmin.from('profiles').select('preferred_provider_id').eq('id', user.id).single()
    ]);
    if (candidateError) throw candidateError;

    const blockedUserIds = new Set((blocks || []).map(b => (b.blocker_user_id === user.id ? b.blocked_user_id : b.blocker_user_id)));
    const preferredProviderId = seekerProfile?.preferred_provider_id;

    // Soft ranking.
    const ranked = (candidates || [])
      .filter(p => !blockedUserIds.has(p.user_id))
      .map(p => {
        let score = Number(p.rating) * 20;
        if (request.language_preference && (p.languages || []).includes(request.language_preference)) score += 15;
        if (gender && gender !== 'no-preference' && p.gender === gender) score += 15;
        if (preferredProviderId && p.id === preferredProviderId) score += 30;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);

    // Atomic reservation: only succeeds if the provider is still AVAILABLE,
    // so two seekers can never be given the same listener.
    for (const { p } of ranked) {
      const { data: reserved } = await supabaseAdmin
        .from('provider_profiles')
        .update({ availability_status: 'BUSY' })
        .eq('id', p.id)
        .eq('availability_status', 'AVAILABLE')
        .select()
        .maybeSingle();
      if (!reserved) continue;

      const { data: matched, error: matchError } = await supabaseAdmin
        .from('support_requests')
        .update({ status: 'MATCHED', matched_provider_id: reserved.id })
        .eq('id', request.id)
        .select()
        .single();
      if (matchError) throw matchError;

      await writeAudit(user, 'MATCH_RESERVED', 'SUPPORT_REQUEST', request.id, { providerProfileId: reserved.id, packageId: pkg.id });
      return res.json({ success: true, data: { requestId: request.id, matched: true, provider: publicProvider(reserved), request: mapRequest(matched) } });
    }

    await supabaseAdmin.from('support_requests').update({ status: 'REQUESTED' }).eq('id', request.id);
    res.json({
      success: true,
      data: {
        requestId: request.id,
        matched: false,
        message: "We're expanding our search to find the right person for you.",
        candidateCount: 0,
        request: mapRequest({ ...request, status: 'REQUESTED' })
      }
    });
  }));

  // -------------------------------------------------------------------------
  // SESSIONS
  // -------------------------------------------------------------------------
  app.post('/api/v1/sessions/create', requireAuth, handle('session create', async (req, res) => {
    const user = req.user!;
    const { packageId, providerId } = req.body;
    if (typeof providerId !== 'string' || !UUID_RE.test(providerId)) {
      return fail(res, 400, 'INVALID_SESSION_PARAMS', 'Package or Provider not found.');
    }

    const pkg = await getPackage(packageId);
    if (!pkg) return fail(res, 400, 'INVALID_SESSION_PARAMS', 'Package or Provider not found.');

    // A session can only start from a live reservation the server made for
    // this seeker -- a client cannot name an arbitrary provider.
    const { data: request, error: requestError } = await supabaseAdmin
      .from('support_requests')
      .select('*')
      .eq('seeker_id', user.id)
      .eq('status', 'MATCHED')
      .eq('matched_provider_id', providerId)
      .eq('package_id', pkg.id)
      .is('session_id', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) {
      return fail(res, 409, 'MATCH_REQUIRED', 'This match is no longer held. Please request a listener again.');
    }

    if (pkg.is_free_trial) {
      if (await getFreeTrialUsed(user.id)) {
        return fail(res, 400, 'TRIAL_ALREADY_USED', 'You have already used your 3-minute free trial.');
      }
      const { error: trialError } = await supabaseAdmin.from('profiles').update({ free_trial_used: true }).eq('id', user.id);
      if (trialError) throw trialError;
    }

    const { data: provider, error: providerError } = await supabaseAdmin.from('provider_profiles').select('*').eq('id', providerId).single();
    if (providerError) throw providerError;

    // NOTE (open P0): paid packages start without a real payment. Flutterwave
    // verification belongs here once it exists.
    const { data: session, error: sessionError } = await supabaseAdmin.from('sessions').insert({
      seeker_id: user.id,
      seeker_display_name: user.displayName,
      provider_id: provider.user_id,
      provider_display_name: provider.display_name,
      provider_avatar_url: provider.avatar_url,
      package_id: pkg.id,
      package_name: pkg.name,
      allocated_seconds: pkg.duration_seconds,
      consumed_seconds: 0,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
      credit_id: `cred-${randomUUID()}`,
      is_free_trial: Boolean(pkg.is_free_trial),
      audio_connected: true
    }).select().single();
    if (sessionError) throw sessionError;

    await Promise.all([
      supabaseAdmin.from('support_requests').update({ session_id: session.id }).eq('id', request.id),
      supabaseAdmin.from('provider_profiles').update({ current_session_id: session.id, availability_status: 'BUSY' }).eq('id', provider.id)
    ]);
    await writeAudit(user, 'SESSION_START', 'SESSION', session.id, { package: pkg.name, providerProfileId: provider.id });

    res.json({ success: true, data: { session: mapSession(session), remainingSeconds: session.allocated_seconds } });
  }));

  // History must be registered before '/:id' so "history" isn't read as an id.
  app.get('/api/v1/sessions/history', requireAuth, handle('session history', async (req, res) => {
    const userId = req.user!.id;
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .or(`seeker_id.eq.${userId},provider_id.eq.${userId}`)
      .order('started_at', { ascending: false, nullsFirst: false })
      .limit(50);
    if (error) throw error;
    const sessions = (data || []).map(s => mapSession(s.status === 'ACTIVE' ? { ...s, consumed_seconds: elapsedSeconds(s) } : s));
    res.json({ success: true, data: { sessions } });
  }));

  app.get('/api/v1/sessions/:id', requireAuth, handle('session read', async (req, res) => {
    const session = await loadOwnSession(req, res);
    if (!session) return;
    const current = await syncClock(session, req.user!, false);
    res.json({ success: true, data: sessionPayload(current) });
  }));

  // The authoritative timer: time is measured from started_at on the
  // server, so polling frequency and the number of devices polling don't
  // change how fast credit is used.
  app.post('/api/v1/sessions/:id/heartbeat', requireAuth, handle('session heartbeat', async (req, res) => {
    const session = await loadOwnSession(req, res);
    if (!session) return;
    const current = await syncClock(session, req.user!, true);
    res.json({ success: true, data: sessionPayload(current) });
  }));

  app.post('/api/v1/sessions/:id/end', requireAuth, handle('session end', async (req, res) => {
    const session = await loadOwnSession(req, res);
    if (!session) return;
    const ended = session.status === 'ACTIVE' ? await completeSession(session, req.user!, 'ENDED_BY_PARTICIPANT') : session;
    res.json({ success: true, data: { session: mapSession(ended) } });
  }));

  // "Continue talking". NOTE (open P0): payment is still simulated here,
  // including the test-only simulate3DS / simulateFailure switches.
  app.post('/api/v1/sessions/:id/extend', requireAuth, handle('session extend', async (req, res) => {
    const session = await loadOwnSession(req, res, { seekerOnly: true });
    if (!session) return;
    const user = req.user!;
    const { packageId, paymentMethod, simulate3DS, simulateFailure, authOtp, clientRequestId } = req.body;

    const current = await syncClock(session, user, true);
    if (current.status !== 'ACTIVE') {
      return fail(res, 400, 'SESSION_ALREADY_ENDED', 'Session has already ended and cannot be extended.');
    }

    const pkg = await getPackage(packageId);
    if (!pkg || Number(pkg.price_ngn) <= 0) {
      return fail(res, 400, 'INVALID_PACKAGE', 'Valid paid extension package is required.');
    }

    const requestKey = typeof clientRequestId === 'string' && clientRequestId ? clientRequestId.slice(0, 100) : null;
    if (requestKey) {
      const { data: duplicate } = await supabaseAdmin
        .from('session_extensions')
        .select('id')
        .eq('session_id', session.id)
        .eq('payment_id', `pay-ext-${requestKey}`)
        .eq('status', 'COMPLETED')
        .maybeSingle();
      if (duplicate) {
        return fail(res, 400, 'DUPLICATE_EXTENSION_REQUEST', 'A duplicate extension request was detected and blocked.');
      }
    }

    const amount = Number(pkg.price_ngn);
    const providerShare = amount * (Number(pkg.provider_share_percent) / 100);
    const baseExtension = {
      session_id: session.id,
      seeker_id: user.id,
      package_id: pkg.id,
      package_name: pkg.name,
      duration_seconds: pkg.duration_seconds,
      duration_minutes: pkg.duration_minutes,
      amount_ngn: amount,
      provider_share_ngn: providerShare
    };

    if (simulate3DS && (!authOtp || String(authOtp).trim() !== '123456')) {
      const { data: ext, error } = await supabaseAdmin.from('session_extensions')
        .insert({ ...baseExtension, payment_id: `pay-3ds-${randomUUID()}`, status: 'REQUIRES_3DS' }).select().single();
      if (error) throw error;
      await writeAudit(user, 'PAYMENT_3DS_REQUIRED', 'SESSION_EXTENSION', ext.id, { amountNGN: amount });
      return res.status(202).json({
        success: false,
        requires3DS: true,
        extensionId: ext.id,
        message: 'Bank 3D-Secure authentication required. Please verify OTP (123456).'
      });
    }

    if (simulateFailure) {
      const { data: ext, error } = await supabaseAdmin.from('session_extensions')
        .insert({ ...baseExtension, payment_id: `pay-failed-${randomUUID()}`, status: 'FAILED' }).select().single();
      if (error) throw error;
      await writeAudit(user, 'PAYMENT_FAILED', 'SESSION_EXTENSION', ext.id, { reason: 'BANK_DECLINED', amountNGN: amount });
      return fail(res, 400, 'PAYMENT_FAILED', 'Payment authorization failed. Your session was not extended.');
    }

    const paymentId = `pay-ext-${requestKey || randomUUID()}`;
    const { data: extension, error: extError } = await supabaseAdmin.from('session_extensions').insert({
      ...baseExtension,
      payment_id: paymentId,
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    }).select().single();
    if (extError) throw extError;

    // Conditional on the allocation we read, so two concurrent extensions
    // can't overwrite each other's added time.
    const { data: extended, error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({ allocated_seconds: current.allocated_seconds + pkg.duration_seconds, is_extension: true })
      .eq('id', session.id)
      .eq('status', 'ACTIVE')
      .eq('allocated_seconds', current.allocated_seconds)
      .select()
      .maybeSingle();
    if (updateError) throw updateError;
    if (!extended) {
      await supabaseAdmin.from('session_extensions').update({ status: 'FAILED' }).eq('id', extension.id);
      return fail(res, 409, 'EXTENSION_CONFLICT', 'The session changed while extending. Please try again.');
    }

    await writeAudit(user, 'PAYMENT_SUCCESS', 'PAYMENT', paymentId, { amountNGN: amount, sessionId: session.id, packageId: pkg.id, paymentMethod: paymentMethod || 'CARD', simulated: true });
    await writeAudit(user, 'SESSION_EXTENSION_CREATED', 'SESSION_EXTENSION', extension.id, {
      sessionId: session.id,
      extensionMinutes: pkg.duration_minutes,
      totalAllocatedSeconds: extended.allocated_seconds
    });

    res.json({
      success: true,
      data: { session: mapSession(extended), extension: mapExtension(extension), remainingSeconds: remainingOf(extended) }
    });
  }));

  app.get('/api/v1/sessions/:id/extensions', requireAuth, handle('session extensions', async (req, res) => {
    const session = await loadOwnSession(req, res);
    if (!session) return;
    const { data, error } = await supabaseAdmin.from('session_extensions').select('*').eq('session_id', session.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: { extensions: (data || []).map(mapExtension) } });
  }));

  // Financial audit trail across all sessions -- admins only.
  app.get('/api/v1/session-extensions', requireAuth, requireAdmin, handle('all extensions', async (_req, res) => {
    const { data, error } = await supabaseAdmin.from('session_extensions').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    res.json({ success: true, data: { extensions: (data || []).map(mapExtension) } });
  }));

  app.post('/api/v1/sessions/:id/feedback', requireAuth, handle('session feedback', async (req, res) => {
    const session = await loadOwnSession(req, res, { seekerOnly: true });
    if (!session) return;
    if (!session.provider_id) return fail(res, 400, 'NO_PROVIDER', 'This session has no listener to rate.');

    const { rating, feltHeard, providerAgain, findSomeoneElse, professionalSupport, returnReason, comment } = req.body;
    const ratingValue = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const { data: feedback, error } = await supabaseAdmin.from('feedback').insert({
      id: randomUUID(),
      session_id: session.id,
      seeker_id: req.user!.id,
      provider_id: session.provider_id,
      rating: ratingValue,
      felt_heard: Boolean(feltHeard),
      provider_again: Boolean(providerAgain),
      find_someone_else: Boolean(findSomeoneElse),
      professional_support: Boolean(professionalSupport),
      return_reason: typeof returnReason === 'string' ? returnReason.slice(0, 500) : null,
      comment: typeof comment === 'string' ? comment.slice(0, 2000) : null,
      created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;

    let preferredRebookProviderId: string | null = null;
    if (providerAgain) {
      const { data: provider } = await supabaseAdmin.from('provider_profiles').select('id').eq('user_id', session.provider_id).maybeSingle();
      if (provider) {
        preferredRebookProviderId = provider.id;
        await supabaseAdmin.from('profiles').update({ preferred_provider_id: provider.id }).eq('id', req.user!.id);
      }
    }

    res.json({
      success: true,
      data: {
        feedback: {
          id: feedback.id,
          sessionId: feedback.session_id,
          seekerId: feedback.seeker_id,
          providerId: feedback.provider_id,
          rating: feedback.rating,
          feltHeard: feedback.felt_heard,
          providerAgain: feedback.provider_again,
          findSomeoneElse: feedback.find_someone_else,
          professionalSupport: feedback.professional_support,
          returnReason: feedback.return_reason || undefined,
          comment: feedback.comment || undefined,
          createdAt: feedback.created_at
        },
        preferredRebookProviderId
      }
    });
  }));

  // -------------------------------------------------------------------------
  // PROVIDER PORTAL (the calls a listener needs to take sessions)
  // -------------------------------------------------------------------------
  app.get('/api/v1/providers/me', requireAuth, handle('provider me', async (req, res) => {
    const provider = await getOwnProvider(req, res);
    if (!provider) return;
    const { data: earningRows, error } = await supabaseAdmin
      .from('provider_earnings').select('*').eq('provider_id', req.user!.id).order('created_at', { ascending: false });
    if (error) throw error;
    const earnings = (earningRows || []).map(mapEarning);
    const sum = (list: typeof earnings) => list.reduce((total, e) => total + e.providerAmountNGN, 0);
    res.json({
      success: true,
      data: {
        provider: mapProvider(provider),
        earnings,
        totalEarnedNGN: sum(earnings),
        availableBalanceNGN: sum(earnings.filter(e => e.status === 'AVAILABLE')),
        pendingBalanceNGN: sum(earnings.filter(e => e.status === 'PENDING')),
        // Payouts are not persisted yet; they move with the payments work.
        payouts: []
      }
    });
  }));

  app.post('/api/v1/providers/profile', requireAuth, handle('provider profile', async (req, res) => {
    const provider = await getOwnProvider(req, res);
    if (!provider) return;
    const { displayName, bio, languages, gender, listeningAreas, preferredSessionTypes, maxSessionMinutes } = req.body;

    // Verification, availability and quality fields are never client-writable.
    const updates: Row = {};
    if (typeof displayName === 'string' && displayName.trim()) updates.display_name = displayName.trim().slice(0, 80);
    if (typeof bio === 'string') updates.bio = bio.trim().slice(0, 1000);
    if (Array.isArray(languages)) updates.languages = languages.filter(l => typeof l === 'string').slice(0, 10);
    if (['male', 'female', 'non-binary', 'prefer-not-to-say'].includes(gender)) updates.gender = gender;
    if (Array.isArray(listeningAreas)) updates.listening_areas = listeningAreas.filter(a => typeof a === 'string').slice(0, 20);
    if (Array.isArray(preferredSessionTypes)) updates.preferred_session_types = preferredSessionTypes.filter(t => typeof t === 'string').slice(0, 10);
    if (MAX_DURATION_OPTIONS.includes(Number(maxSessionMinutes))) updates.max_session_minutes = Number(maxSessionMinutes);

    const { data, error } = await supabaseAdmin.from('provider_profiles').update(updates).eq('id', provider.id).select().single();
    if (error) throw error;
    res.json({ success: true, data: { provider: mapProvider(data) } });
  }));

  // Requests the service has matched to this listener that the seeker hasn't
  // started yet. Seekers are shown only by an anonymous tag.
  app.get('/api/v1/providers/incoming-requests', requireAuth, handle('provider incoming', async (req, res) => {
    const provider = await getOwnProvider(req, res);
    if (!provider) return;
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .select('*')
      .eq('matched_provider_id', provider.id)
      .eq('status', 'MATCHED')
      .is('session_id', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: packageRows } = await supabaseAdmin.from('session_packages').select('*');
    const packages = new Map((packageRows || []).map(p => [p.id, p]));
    const requests = (data || []).map(r => {
      const pkg = packages.get(r.package_id);
      const price = pkg ? Number(pkg.price_ngn) : 0;
      return {
        id: r.id,
        anonymousSeekerTag: `Seeker #${String(r.seeker_id).slice(-4)}`,
        supportReason: r.support_reason,
        packageId: r.package_id,
        packageName: pkg?.name || 'Support Session',
        durationMinutes: pkg?.duration_minutes || 0,
        grossPriceNGN: price,
        providerShareNGN: pkg ? price * (Number(pkg.provider_share_percent) / 100) : 0,
        languagePreference: r.language_preference || undefined,
        genderPreference: r.gender_preference || undefined,
        createdAt: r.created_at
      };
    });
    res.json({ success: true, data: { requests } });
  }));

  app.post('/api/v1/providers/availability', requireAuth, handle('provider availability', async (req, res) => {
    const provider = await getOwnProvider(req, res);
    if (!provider) return;
    const { status } = req.body;
    // BUSY is set only by the matching engine.
    if (!PROVIDER_SET_STATUSES.includes(status)) {
      return fail(res, 400, 'INVALID_STATUS', 'Availability must be AVAILABLE, AWAY or OFFLINE.');
    }
    if (provider.current_session_id) {
      return fail(res, 409, 'IN_SESSION', 'You are in a conversation. Your availability updates when it ends.');
    }
    if (status === 'AVAILABLE' && !(provider.verified && provider.verification_status === 'VERIFIED')) {
      return fail(res, 403, 'NOT_VERIFIED', 'Your listener profile must be verified before you can go available.');
    }
    const { data, error } = await supabaseAdmin.from('provider_profiles').update({ availability_status: status }).eq('id', provider.id).select().single();
    if (error) throw error;
    res.json({ success: true, data: { provider: mapProvider(data) } });
  }));

  app.post('/api/v1/providers/max-duration', requireAuth, handle('provider max duration', async (req, res) => {
    const provider = await getOwnProvider(req, res);
    if (!provider) return;
    const minutes = Number(req.body.maxMinutes);
    if (!MAX_DURATION_OPTIONS.includes(minutes)) {
      return fail(res, 400, 'INVALID_DURATION', 'Maximum session length must be 15, 30, 60 or 90 minutes.');
    }
    const { data, error } = await supabaseAdmin.from('provider_profiles').update({ max_session_minutes: minutes }).eq('id', provider.id).select().single();
    if (error) throw error;
    res.json({ success: true, data: { provider: mapProvider(data) } });
  }));

  // -------------------------------------------------------------------------
  // ADMIN: manual match
  // -------------------------------------------------------------------------
  app.post('/api/v1/admin/matching/assign', requireAuth, requireAdmin, handle('admin assign', async (req, res) => {
    const { requestId, providerId } = req.body;
    if (!UUID_RE.test(String(requestId)) || !UUID_RE.test(String(providerId))) {
      return fail(res, 404, 'INVALID_MATCH_TARGET', 'Request or Provider not found');
    }
    const [{ data: request }, { data: provider }] = await Promise.all([
      supabaseAdmin.from('support_requests').select('*').eq('id', requestId).maybeSingle(),
      supabaseAdmin.from('provider_profiles').select('*').eq('id', providerId).maybeSingle()
    ]);
    if (!request || !provider) return fail(res, 404, 'INVALID_MATCH_TARGET', 'Request or Provider not found');
    if (request.session_id) return fail(res, 409, 'ALREADY_STARTED', 'This request already has a session.');

    const { data: reserved } = await supabaseAdmin
      .from('provider_profiles').update({ availability_status: 'BUSY' })
      .eq('id', provider.id).eq('availability_status', 'AVAILABLE').select().maybeSingle();
    if (!reserved) return fail(res, 409, 'PROVIDER_UNAVAILABLE', 'That listener is not available right now.');

    const { data: matched, error } = await supabaseAdmin.from('support_requests')
      .update({ status: 'MATCHED', matched_provider_id: provider.id, expires_at: new Date(Date.now() + RESERVATION_MS).toISOString() })
      .eq('id', request.id).select().single();
    if (error) throw error;

    await writeAudit(req.user!, 'MANUAL_MATCH_ASSIGNED', 'SUPPORT_REQUEST', request.id, {
      seekerId: request.seeker_id,
      assignedProviderId: provider.id,
      assignedProviderName: provider.display_name
    });
    res.json({
      success: true,
      message: `Manual match assigned: Listener ${provider.display_name} connected to request ${request.id}.`,
      data: { request: mapRequest(matched) }
    });
  }));
}

/** Session-related data for the admin Control Centre dashboard. */
export async function loadSessionAdminData() {
  const [sessions, requests, earnings, providers] = await Promise.all([
    supabaseAdmin.from('sessions').select('*').order('started_at', { ascending: false, nullsFirst: false }).limit(200),
    supabaseAdmin.from('support_requests').select('*').order('created_at', { ascending: false }).limit(200),
    supabaseAdmin.from('provider_earnings').select('*').order('created_at', { ascending: false }).limit(500),
    supabaseAdmin.from('provider_profiles').select('*')
  ]);
  for (const r of [sessions, requests, earnings, providers]) if (r.error) throw r.error;
  return {
    sessions: (sessions.data || []).map(mapSession),
    supportRequests: (requests.data || []).map(mapRequest),
    providerEarnings: (earnings.data || []).map(mapEarning),
    providers: (providers.data || []).map(mapProvider)
  };
}
