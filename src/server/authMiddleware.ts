import type { Request, Response, NextFunction } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin, getSupabaseForToken } from './supabaseClients.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'SUPPORT_SEEKER' | 'PROVIDER' | 'ADMIN' | 'SAFETY_REVIEWER' | 'CONTENT_EDITOR' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'UNVERIFIED';
  displayName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      supabase?: SupabaseClient;
    }
  }
}

async function resolveUserFromToken(token: string): Promise<{ user: AuthenticatedUser; supabase: SupabaseClient } | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  const scoped = getSupabaseForToken(token);

  const { data: profile, error: profileError } = await scoped
    .from('profiles')
    .select('id, email, role, status, display_name')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      displayName: profile.display_name
    },
    supabase: scoped
  };
}

export async function attachAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  const resolved = await resolveUserFromToken(token);
  if (resolved) {
    req.user = resolved.user;
    req.supabase = resolved.supabase;
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Your session is invalid or has expired. Please sign in again.' } });
  }

  if (resolved.user.status === 'SUSPENDED') {
    return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended. Please contact safety support.' } });
  }

  req.user = resolved.user;
  req.supabase = resolved.supabase;
  next();
}

export function requireRole(...allowedRoles: AuthenticatedUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `This action requires one of: ${allowedRoles.join(', ')}.` }
      });
    }
    next();
  };
}

export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
export const requireSafetyReviewer = requireRole('SAFETY_REVIEWER', 'ADMIN', 'SUPER_ADMIN');
export const requireContentEditor = requireRole('CONTENT_EDITOR', 'ADMIN', 'SUPER_ADMIN');
