import type { Request, Response } from 'express';
import { supabaseAdmin } from './supabaseClients.js';
import type { AuthenticatedUser } from './authMiddleware.js';

// Shared by the Supabase-backed route modules.

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function fail(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ success: false, error: { code, message } });
}

export function serverError(res: Response, context: string, error: unknown) {
  console.error(`[Safespace] ${context}:`, error);
  return fail(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
}

// Wraps async handlers so a thrown Supabase error becomes a 500 instead of
// an unhandled rejection that leaves the request hanging.
export function handle(context: string, fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response) => {
    fn(req, res).catch(err => {
      if (!res.headersSent) serverError(res, context, err);
      else console.error(`[Safespace] ${context}:`, err);
    });
  };
}

export async function writeAudit(actor: AuthenticatedUser | null, action: string, resource: string, resourceId: string, metadata?: Record<string, unknown>) {
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
