import type { Express } from 'express';
import webpush from 'web-push';
import { supabaseAdmin } from './supabaseClients.js';
import { requireAuth } from './authMiddleware.js';
import { fail, handle } from './routeHelpers.js';

// ---------------------------------------------------------------------------
// Phone alerts (Web Push), so a listener hears about an incoming call even
// when Safespace isn't open on their screen.
//
// The signing keys come from VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY if they are
// set. Otherwise the server creates a pair once and keeps it in the
// server-only app_secrets table, so they stay the same across restarts and
// never need to be copied by hand.
// ---------------------------------------------------------------------------

interface VapidKeys { publicKey: string; privateKey: string }

let keysPromise: Promise<VapidKeys | null> | null = null;

async function loadKeys(): Promise<VapidKeys | null> {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  }
  const { data, error } = await supabaseAdmin.from('app_secrets').select('value').eq('name', 'vapid_keys').maybeSingle();
  if (error) throw error;
  if (data?.value) return JSON.parse(data.value) as VapidKeys;

  const generated = webpush.generateVAPIDKeys();
  // If two instances race, the first insert wins and both read it back.
  await supabaseAdmin.from('app_secrets').insert({ name: 'vapid_keys', value: JSON.stringify(generated) });
  const { data: stored, error: readError } = await supabaseAdmin.from('app_secrets').select('value').eq('name', 'vapid_keys').single();
  if (readError) throw readError;
  return JSON.parse(stored.value) as VapidKeys;
}

async function getKeys(): Promise<VapidKeys | null> {
  if (!keysPromise) {
    keysPromise = loadKeys()
      .then(keys => {
        if (keys) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:support@entersafespace.com', keys.publicKey, keys.privateKey);
        return keys;
      })
      .catch(err => {
        console.error('[Safespace] push keys unavailable:', err);
        keysPromise = null;
        return null;
      });
  }
  return keysPromise;
}

export interface PushMessage {
  title: string;
  body: string;
  // Notifications with the same tag replace each other instead of stacking.
  tag: string;
  actionUrl?: string;
  kind?: string;
  requireInteraction?: boolean;
}

/** Best effort: never throws. Removes subscriptions the browser has retired. */
export async function sendPushToUser(userId: string, message: PushMessage): Promise<number> {
  try {
    const keys = await getKeys();
    if (!keys) return 0;
    const { data: subs, error } = await supabaseAdmin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', userId);
    if (error) throw error;
    let delivered = 0;
    await Promise.all((subs || []).map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(message),
          { TTL: 60, urgency: 'high', topic: message.tag.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) }
        );
        delivered++;
        await supabaseAdmin.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('id', sub.id);
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.warn('[Safespace] push send failed:', err?.statusCode || '', err?.body || err?.message || err);
        }
      }
    }));
    return delivered;
  } catch (err) {
    console.error('[Safespace] push send error:', err);
    return 0;
  }
}

/** User ids (from the given list) that have at least one device for phone alerts. */
export async function usersWithPush(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const { data, error } = await supabaseAdmin.from('push_subscriptions').select('user_id').in('user_id', userIds);
  if (error) {
    console.error('[Safespace] push subscription lookup failed:', error);
    return new Set();
  }
  return new Set((data || []).map(r => r.user_id));
}

export function registerPushRoutes(app: Express) {
  app.get('/api/v1/push/public-key', handle('push key', async (_req, res) => {
    const keys = await getKeys();
    res.json({ success: true, data: { publicKey: keys?.publicKey ?? null } });
  }));

  app.post('/api/v1/push/subscribe', requireAuth, handle('push subscribe', async (req, res) => {
    const { endpoint, keys } = req.body?.subscription || {};
    if (typeof endpoint !== 'string' || !/^https:\/\//.test(endpoint) || endpoint.length > 1000
      || typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string'
      || keys.p256dh.length > 200 || keys.auth.length > 100) {
      return fail(res, 400, 'INVALID_SUBSCRIPTION', 'That notification subscription is not valid.');
    }
    const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
      user_id: req.user!.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: String(req.headers['user-agent'] || '').slice(0, 200)
    }, { onConflict: 'endpoint' });
    if (error) throw error;
    res.json({ success: true });
  }));

  app.post('/api/v1/push/unsubscribe', requireAuth, handle('push unsubscribe', async (req, res) => {
    const endpoint = req.body?.endpoint;
    if (typeof endpoint !== 'string') return fail(res, 400, 'INVALID_SUBSCRIPTION', 'Missing endpoint.');
    const { error } = await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', req.user!.id);
    if (error) throw error;
    res.json({ success: true });
  }));
}
