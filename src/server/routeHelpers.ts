import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
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

// --- Profile photo uploads (listener and seeker) ---

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const avatarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: AVATAR_MAX_BYTES, files: 1 } });

// Identify the image from its first bytes rather than trusting the
// browser-supplied content type.
export function sniffImage(buf: Buffer): { ext: string; contentType: string } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', contentType: 'image/jpeg' };
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', contentType: 'image/png' };
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return { ext: 'webp', contentType: 'image/webp' };
  return null;
}

// Accepts one image in the 'avatar' form field, answering upload errors
// (too large, malformed) in the app's usual error shape.
export function receiveAvatar(req: Request, res: Response, next: NextFunction) {
  avatarUpload.single('avatar')(req, res, err => {
    if (!err) return next();
    const tooLarge = (err as { code?: string }).code === 'LIMIT_FILE_SIZE';
    fail(res, 400, tooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_FAILED', tooLarge ? 'Photos must be 2 MB or smaller.' : 'The photo could not be uploaded.');
  });
}
