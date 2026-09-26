// Sends a short description of a problem in the browser (an audio failure, a
// page error) to the server log, so it can be diagnosed without access to the
// person's device. Best effort, deduplicated, never throws.

const recent = new Map<string, number>();

export function reportClientProblem(kind: string, message: string, detail?: string, sessionId?: string) {
  try {
    const key = `${kind}|${message}`;
    const now = Date.now();
    if ((recent.get(key) || 0) > now - 30_000) return;
    recent.set(key, now);
    void fetch('/api/v1/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        message: String(message).slice(0, 300),
        detail: `${detail ? String(detail).slice(0, 400) + ' | ' : ''}${navigator.userAgent.slice(0, 100)}`,
        sessionId
      }),
      keepalive: true
    }).catch(() => undefined);
  } catch {
    // Reporting must never break the app.
  }
}

// Page-level errors that would otherwise only appear in the browser console.
export function installGlobalErrorReporting() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', e => {
    reportClientProblem('page-error', e.message || 'Unknown error', `${e.filename || ''}:${e.lineno || ''}`);
  });
  window.addEventListener('unhandledrejection', e => {
    const reason = e.reason instanceof Error ? e.reason.message : String(e.reason);
    reportClientProblem('unhandled-rejection', reason);
  });
}
