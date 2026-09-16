import React from 'react';
import { ShieldAlert, Lock, UserCheck, ArrowRight, RefreshCw } from 'lucide-react';
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
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-[#59636B]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#123B5D] mb-2" />
        <p className="text-xs font-medium">Verifying Safespace security context...</p>
      </div>
    );
  }

  // Not logged in or no active session
  if (!user || !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-[#E3E2DE]/80 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-[#F3F1EC] rounded-2xl flex items-center justify-center mx-auto text-[#59636B]">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#17212B]">{fallbackTitle || 'Authentication Required'}</h3>
          <p className="text-xs text-[#59636B] mt-1">
            {fallbackDescription || 'Please sign in or register to access this section of Safespace securely.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => openAuthModal('LOGIN')}
            className="w-full py-2.5 bg-[#123B5D] hover:bg-[#123B5D] text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Sign In to Account
          </button>
          <button
            onClick={() => openAuthModal('REGISTER')}
            className="w-full py-2.5 bg-[#F3F1EC] hover:bg-[#E3E2DE] text-[#17212B] font-medium text-sm rounded-xl transition-colors"
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

  // Role Restriction Check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-[#E3E2DE] rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#17212B]">Restricted Access</h3>
          <p className="text-xs text-[#59636B] mt-1">
            Your current role (<strong className="font-semibold">{user.role}</strong>) does not have authorization to view this area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};