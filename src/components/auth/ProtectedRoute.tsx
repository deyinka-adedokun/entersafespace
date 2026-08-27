import React from 'react';
import { ShieldAlert, Lock, UserCheck, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  fallbackTitle,
  fallbackDescription
}) => {
  const { user, isAuthenticated, isLoading, openAuthModal, switchRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-stone-500">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs font-medium">Verifying Safespace security context...</p>
      </div>
    );
  }

  // Not logged in or no active session
  if (!user || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200/80 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-700">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900">{fallbackTitle || 'Authentication Required'}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {fallbackDescription || 'Please sign in or register to access this section of Safespace securely.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => openAuthModal('LOGIN')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Sign In to Account
          </button>
          <button
            onClick={() => openAuthModal('REGISTER')}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-sm rounded-xl transition-colors"
          >
            Create New Account
          </button>
        </div>
      </div>
    );
  }

  // Account Suspended
  if (user.status === 'SUSPENDED') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-700">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-900">Account Under Review</h3>
          <p className="text-xs text-rose-700 mt-1">
            Your Safespace account has been temporarily restricted in compliance with our safeguarding and community trust safety policies.
          </p>
        </div>
        <p className="text-[11px] text-rose-600">If you believe this is an error, please reach out to safety@safespace.ng.</p>
      </div>
    );
  }

  // Account Unverified
  if (user.status === 'UNVERIFIED') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-700">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-900">Account Unverified</h3>
          <p className="text-xs text-amber-800 mt-1">
            Please verify your email or phone number with your 6-digit OTP code to continue.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('OTP', user.email)}
          className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-medium text-sm rounded-xl transition-colors"
        >
          Enter 6-Digit OTP Code
        </button>
      </div>
    );
  }

  // Role Restriction Check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900">Restricted Access</h3>
          <p className="text-xs text-stone-500 mt-1">
            Your current role (<strong className="font-semibold">{user.role}</strong>) does not have authorization to view this area.
            Allowed roles: {allowedRoles.join(', ')}.
          </p>
        </div>

        {/* Demo Switch Role Prompt */}
        <div className="pt-2 border-t border-stone-100">
          <span className="text-[11px] text-stone-400 block mb-2">Switch role for testing / demo evaluation:</span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {allowedRoles.map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 transition-colors"
              >
                Switch to {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
