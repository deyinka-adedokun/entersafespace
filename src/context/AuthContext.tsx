import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, ProviderProfile, UserRole } from '../types';

export type AuthModalMode = 'LOGIN' | 'REGISTER' | 'OTP';

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
  login: (email: string, password?: string) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  register: (data: { email: string; password?: string; displayName?: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; phone?: string; preferredLanguage?: string; preferredProviderId?: string }) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/me');
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data.user || null);
        setProviderProfile(json.data.providerProfile || null);
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

  const login = async (email: string, password?: string) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();

      if (json.success) {
        if (json.requiresOtp) {
          setPendingEmail(email);
          setAuthModalMode('OTP');
          return { success: true, requiresOtp: true };
        } else if (json.data?.user) {
          setUser(json.data.user);
          setProviderProfile(json.data.providerProfile || null);
          setIsAuthModalOpen(false);
          return { success: true };
        }
      }
      const errMsg = json.error?.message || 'Login failed. Please verify your credentials.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errMsg = 'Network error during login. Please try again.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (data: { email: string; password?: string; displayName?: string; phone?: string; role?: UserRole }) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (json.success) {
        setPendingEmail(data.email);
        setAuthModalMode('OTP');
        return { success: true, requiresOtp: true };
      }
      const errMsg = json.error?.message || 'Registration failed.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errMsg = 'Network error during registration.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const json = await res.json();

      if (json.success && json.data?.user) {
        setUser(json.data.user);
        setProviderProfile(json.data.providerProfile || null);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      const errMsg = json.error?.message || 'Invalid OTP code. Please try demo code 123456.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err) {
      const errMsg = 'Network error verifying OTP.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      return { success: json.success, error: json.error?.message };
    } catch (err) {
      return { success: false, error: 'Failed to resend code.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setProviderProfile(null);
    }
  };

  const updateProfile = async (data: { displayName?: string; phone?: string; preferredLanguage?: string; preferredProviderId?: string }) => {
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
        return { success: true };
      }
      return { success: false, error: json.error?.message || 'Failed to update profile.' };
    } catch (err) {
      return { success: false, error: 'Network error updating profile.' };
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/v1/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
        setProviderProfile(json.data.providerProfile || null);
      } else if (user) {
        setUser({ ...user, role });
      }
    } catch (err) {
      if (user) setUser({ ...user, role });
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
        logout,
        updateProfile,
        switchRole,
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
