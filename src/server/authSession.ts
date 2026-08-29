import { AsyncLocalStorage } from 'node:async_hooks';
import { randomBytes } from 'node:crypto';

export const AUTH_COOKIE_NAME = 'safespace_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionRecord = {
  userId: string;
  expiresAt: number;
};

const sessions = new Map<string, SessionRecord>();
const requestSessionStore = new AsyncLocalStorage<string | null>();

export function createSession(userId: string): string {
  const sessionId = randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return sessionId;
}

export function getSessionUserId(sessionId: string | undefined): string | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session.userId;
}

export function getRequestSessionUserId(): string | null {
  return requestSessionStore.getStore() ?? null;
}

export function runWithRequestSession<T>(userId: string | null, callback: () => T): T {
  return requestSessionStore.run(userId, callback);
}

export function revokeSession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId);
}

export function parseSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  const cookie = cookieHeader.split(';').map(value => value.trim()).find(value => value.startsWith(`${AUTH_COOKIE_NAME}=`));
  return cookie?.slice(AUTH_COOKIE_NAME.length + 1) || undefined;
}

export function sessionCookie(sessionId: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AUTH_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`;
}

export function clearSessionCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
