// Subscribes this device to phone alerts (Web Push), so a listener hears about
// an incoming call even when Safespace isn't open. Needs notification
// permission; does nothing (and never throws) if that isn't given or the
// browser doesn't support it.

import { reportClientProblem } from './clientLog';

function base64UrlToBytes(value: string): Uint8Array {
  const padded = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function enableCallAlerts(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== 'granted') return false;
  try {
    const keyRes = await fetch('/api/v1/push/public-key');
    const keyJson = await keyRes.json();
    const publicKey: string | null = keyJson?.data?.publicKey ?? null;
    if (!publicKey) return false;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    // A subscription made with a different key can't receive our alerts.
    const currentKey = subscription?.options?.applicationServerKey;
    if (subscription && currentKey) {
      const wanted = base64UrlToBytes(publicKey);
      const have = new Uint8Array(currentKey);
      if (have.length !== wanted.length || have.some((b, i) => b !== wanted[i])) {
        await subscription.unsubscribe().catch(() => undefined);
        subscription = null;
      }
    }
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(publicKey) as BufferSource
      });
    }

    const res = await fetch('/api/v1/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON() })
    });
    return res.ok;
  } catch (err) {
    reportClientProblem('push-subscribe', err instanceof Error ? `${err.name}: ${err.message}` : String(err));
    return false;
  }
}
