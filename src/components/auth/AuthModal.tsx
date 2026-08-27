import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User as UserIcon, Phone, AlertCircle, ArrowRight, RefreshCw, KeyRound, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { SafespaceLogo } from '../ui/SafespaceLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    pendingEmail,
    closeAuthModal,
    login,
    register,
    verifyOtp,
    resendOtp,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'OTP'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('SUPPORT_SEEKER');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
    if (pendingEmail) setEmail(pendingEmail);
  }, [authModalMode, pendingEmail]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await register({ email, password, displayName, phone, role });
    setIsSubmitting(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await verifyOtp(email || pendingEmail || '', otp);
    setIsSubmitting(false);
  };

  const handleResendOtp = async () => {
    const targetEmail = email || pendingEmail || '';
    if (!targetEmail) return;
    setResendStatus('Sending new code...');
    const res = await resendOtp(targetEmail);
    if (res.success) {
      setResendStatus('New code sent! Check demo code 123456.');
    } else {
      setResendStatus(res.error || 'Failed to resend code.');
    }
  };

  // Quick Demo Account Auto-Fill helper
  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsSubmitting(true);
    await login(demoEmail, 'Password123!');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212B]/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#E3E2DE] rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#123B5D] text-white p-6 relative">
          <button 
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <SafespaceLogo size="xs" variant="white" showWordmark={false} />
            <span className="text-xs font-semibold tracking-wider text-white/80 uppercase">Safespace Account</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'LOGIN' && 'Welcome Back'}
            {mode === 'REGISTER' && 'Create Your Account'}
            {mode === 'OTP' && 'Verify Email or Phone'}
          </h2>
          <p className="text-white/80 text-xs mt-1">
            {mode === 'LOGIN' && 'Sign in to access support, active sessions, and preferences.'}
            {mode === 'REGISTER' && 'Protected identity for confidential human listening.'}
            {mode === 'OTP' && 'Enter the 6-digit verification code sent to your email.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">

          {/* Auth Error Message */}
          {authError && (
            <div className="bg-[#FDF2F2] border border-[#F9C9C7] text-[#B3261E] p-3 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Alert</span>
                {authError}
              </div>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                    placeholder="e.g. seeker@safespace.ng"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-medium rounded-lg shadow-xs text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Credentials */}
              <div className="pt-2 border-t border-[#E3E2DE]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#59636B] block mb-2">
                  Quick Demo Accounts
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('seeker@safespace.ng')}
                    className="p-2 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] rounded-md text-left font-medium transition-colors border border-[#E3E2DE] truncate"
                  >
                    Seeker (Emma)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('ada.listener@safespace.ng')}
                    className="p-2 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] rounded-md text-left font-medium transition-colors border border-[#E3E2DE] truncate"
                  >
                    Provider (Sarah)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin@safespace.ng')}
                    className="p-2 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] rounded-md text-left font-medium transition-colors border border-[#E3E2DE] truncate"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('safety@safespace.ng')}
                    className="p-2 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] rounded-md text-left font-medium transition-colors border border-[#E3E2DE] truncate"
                  >
                    Safety Reviewer
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-[#59636B]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('REGISTER'); clearAuthError(); }}
                    className="text-[#123B5D] font-semibold hover:underline"
                  >
                    Register new account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Display / Alias Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Emma"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#59636B] mt-1">Alias displayed to listeners in sessions to keep your identity private.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                >
                  <option value="SUPPORT_SEEKER">Support Seeker (Seeking human listening)</option>
                  <option value="PROVIDER">Verified Listener / Provider</option>
                  <option value="ADMIN">Operations Administrator</option>
                  <option value="SAFETY_REVIEWER">Safety Reviewer</option>
                  <option value="CONTENT_EDITOR">Content Editor</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-medium rounded-lg shadow-xs text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#59636B]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('LOGIN'); clearAuthError(); }}
                    className="text-[#123B5D] font-semibold hover:underline"
                  >
                    Sign in instead
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: OTP VERIFICATION */}
          {mode === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="p-3 bg-[#EAF0F5] border border-[#C5D6E4] rounded-lg text-xs text-[#123B5D] flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Verification Code Sent</span>
                  A 6-digit OTP code was generated for <strong className="font-semibold">{email || pendingEmail}</strong>.
                  <br />
                  <span className="font-mono mt-1 block">💡 Demo OTP Code: <strong>123456</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); clearAuthError(); }}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-xl font-mono py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length < 6}
                className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-medium rounded-lg shadow-xs text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Verify Account & Enter</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-[#59636B] pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#123B5D] hover:underline font-medium transition-colors"
                >
                  Resend OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); clearAuthError(); }}
                  className="text-[#59636B] hover:text-[#17212B]"
                >
                  Back to Sign In
                </button>
              </div>

              {resendStatus && (
                <p className="text-[11px] text-center text-[#123B5D] font-medium mt-1">{resendStatus}</p>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
