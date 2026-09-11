const TOKEN_STORAGE_KEY = 'safespace_access_token';

export function getStoredAccessToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage can throw in some privacy modes -- fail closed, not crash.
    return null;
  }
}

export function setStoredAccessToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore -- if storage is unavailable, the user simply won't stay
    // signed in across a reload, which is a degraded experience, not a crash.
  }
}

export function clearStoredAccessToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Fetch interceptor. This is what actually makes the backend's requireAuth
// middleware receive a token at all. Without this, every fetch() call in
// the app -- login, register, session actions, admin actions, everything --
// would go out with no Authorization header, and every protected route
// would return 401 regardless of whether someone is logged in.
//
// It only attaches the token to same-origin requests (this app's own API),
// never to a third-party URL, so the token can't leak to some other domain
// a component happens to fetch from.
//
// This installs itself once, as a side effect of importing this module --
// which AuthContext.tsx already does.
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    __safespaceFetchPatched__?: boolean;
  }
}

function isSameOriginRequest(input: RequestInfo | URL): boolean {
  try {
    const url =
      typeof input === 'string'
        ? new URL(input, window.location.origin)
        : input instanceof URL
        ? input
        : new URL(input.url, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    // Relative paths like '/api/v1/...' with no base will throw in some
    // environments -- treat anything that isn't a clearly absolute,
    // different-origin URL as same-origin.
    return true;
  }
}

if (typeof window !== 'undefined' && !window.__safespaceFetchPatched__) {
  window.__safespaceFetchPatched__ = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = getStoredAccessToken();

    if (token && isSameOriginRequest(input)) {
      const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }

    return originalFetch(input, init);
  };
}
