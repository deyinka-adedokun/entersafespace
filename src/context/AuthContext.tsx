import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { disableCallAlerts } from '../lib/webPush';
import { User, ProviderProfile } from '../types';
// Importing this module also installs the fetch interceptor that attaches
// `Authorization: Bearer <token>` to every same-origin API request.
import { getStoredAccessToken, setStoredAccessToken, clearStoredAccessToken } from '../lib/authSession';

export type AuthModalMode = 'LOGIN' | 'REGISTER' | 'OTP';

type AuthResult = { success: boolean; requiresOtp?: boolean; error?: string };

interface AuthContextType {
  user: User | null;
  providerProfile: ProviderProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  pendingEmail: string | null;
  openAuthModal: (mode?: AuthModalMode, email?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<AuthResult>;
  register: (data: { email: string; password?: string; displayName?: string; phone?: string }) => Promise<AuthResult>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; phone?: string; preferredLanguage?: string; preferredProviderId?: string }) => Promise<AuthResult>;
  refreshSession: () => Promise<void>;
  setAuthError: (message: string | null) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Render's free instance can take up to ~a minute to wake from sleep. Past
// that, stop waiting and tell the person, rather than spinning forever.
const REQUEST_TIMEOUT_MS = 60_000;
const TIMEOUT_MESSAGE = 'Safespace is taking too long to respond. Please check your connection and try again.';

class RequestTimeoutError extends Error {}

async function postJson(url: string, body: unknown, method: 'POST' | 'PUT' = 'POST') {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    return await res.json();
  } catch (err) {
    if (controller.signal.aborted) throw new RequestTimeoutError();
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

function networkMessage(err: unknown, fallback: string) {
  return err instanceof RequestTimeoutError ? TIMEOUT_MESSAGE : fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!getStoredAccessToken()) {
      setUser(null);
      setProviderProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/me');
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
        setProviderProfile(json.data.providerProfile || null);
      } else {
        // The stored token was rejected (expired or revoked) -- drop it.
        clearStoredAccessToken();
        setUser(null);
        setProviderProfile(null);
      }
    } catch (err) {
      console.error('Failed to sync auth session', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Stores the token from an auth response and signs the person in.
  const applySignedInResponse = (data: any) => {
    if (data?.session?.access_token) {
      setStoredAccessToken(data.session.access_token);
    }
    setUser(data.user);
    setProviderProfile(data.providerProfile || null);
    setIsAuthModalOpen(false);
  };

  const openAuthModal = (mode: AuthModalMode = 'LOGIN', email?: string) => {
    setAuthModalMode(mode);
    if (email) setPendingEmail(email);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const clearAuthError = () => setAuthError(null);

  const login = async (email: string, password?: string): Promise<AuthResult> => {
    setAuthError(null);
    try {
      const json = await postJson('/api/v1/auth/login', { email, password });
      if (json.success && json.data?.user) {
        applySignedInResponse(json.data);
        return { success: true };
      }
      const errMsg = json.error?.message || 'Login failed. Please verify your credentials.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errMsg = networkMessage(err, 'Network error during login. Please try again.');
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (data: { email: string; password?: string; displayName?: string; phone?: string }): Promise<AuthResult> => {
    setAuthError(null);
    try {
      const json = await postJson('/api/v1/auth/register', data);

      if (json.success) {
        // With Supabase "Confirm email" off, signup returns a live session:
        // sign the person straight in. Only show the code screen when the
        // server says a confirmation code is actually required.
        if (!json.requiresOtp && json.data?.user) {
          applySignedInResponse(json.data);
          return { success: true };
        }
        setPendingEmail(data.email);
        setAuthModalMode('OTP');
        return { success: true, requiresOtp: true };
      }
      const errMsg = json.error?.message || 'Registration failed.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errMsg = networkMessage(err, 'Network error during registration.');
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<AuthResult> => {
    setAuthError(null);
    try {
      const json = await postJson('/api/v1/auth/verify-otp', { email, otp });
      if (json.success && json.data?.user) {
        applySignedInResponse(json.data);
        return { success: true };
      }
      const errMsg = json.error?.message || 'Invalid or expired verification code.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errMsg = networkMessage(err, 'Network error verifying your code.');
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const resendOtp = async (email: string): Promise<AuthResult> => {
    try {
      const json = await postJson('/api/v1/auth/resend-otp', { email });
      return { success: Boolean(json.success), error: json.error?.message };
    } catch (err) {
      return { success: false, error: networkMessage(err, 'Failed to resend code.') };
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      const json = await postJson('/api/v1/auth/forgot-password', { email });
      return { success: Boolean(json.success), error: json.error?.message };
    } catch (err) {
      return { success: false, error: networkMessage(err, 'Network error. Please try again.') };
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string): Promise<AuthResult> => {
    try {
      const json = await postJson('/api/v1/auth/reset-password', { email, token, newPassword });
      return { success: Boolean(json.success), error: json.error?.message };
    } catch (err) {
      return { success: false, error: networkMessage(err, 'Network error. Please try again.') };
    }
  };

  const logout = async () => {
    try {
      // Must run while still signed in, so the server can remove it.
      await disableCallAlerts();
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      clearStoredAccessToken();
      setUser(null);
      setProviderProfile(null);
    }
  };

  const updateProfile = async (data: { displayName?: string; phone?: string; preferredLanguage?: string; preferredProviderId?: string }): Promise<AuthResult> => {
    try {
      const json = await postJson('/api/v1/auth/profile', data, 'PUT');
      if (json.success) {
        // The profile route returns the raw database row, so re-read the
        // normalised user rather than trusting its field names.
        await fetchSession();
        return { success: true };
      }
      return { success: false, error: json.error?.message || 'Failed to update profile.' };
    } catch (err) {
      return { success: false, error: networkMessage(err, 'Network error updating profile.') };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        isAuthenticated: !!user && user.status === 'ACTIVE',
        isLoading,
        authError,
        isAuthModalOpen,
        authModalMode,
        pendingEmail,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        refreshSession: fetchSession,
        setAuthError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
