import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User as UserIcon, Phone, AlertCircle, ArrowRight, RefreshCw, KeyRound, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
    forgotPassword,
    resetPassword,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'OTP' | 'FORGOT' | 'RESET'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
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
    // NOTE: role is deliberately never sent from this form. Every new
    // account is a Support Seeker by default -- Provider, Admin, Safety
    // Reviewer, etc. are granted through their own approval workflows, not
    // self-selected at signup. The backend also ignores this field even if
    // it were sent, but it shouldn't be presented as a choice here at all.
    await register({ email, password, displayName, phone });
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
      setResendStatus('New code sent. Check your email.');
    } else {
      setResendStatus(res.error || 'Failed to resend code.');
    }
  };

    const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setForgotStatus(null);
    const res = await forgotPassword(email);
    setIsSubmitting(false);
    if (res.success) {
      setForgotStatus('If that email has an account, a reset code has been sent.');
      setMode('RESET');
    } else {
      setForgotStatus(res.error || 'Something went wrong. Please try again.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await resetPassword(email, resetToken, newPassword);
    setIsSubmitting(false);
    if (res.success) {
      setForgotStatus('Password updated. Please sign in.');
      setMode('LOGIN');
      setPassword('');
    } else {
      setForgotStatus(res.error || 'Invalid or expired code.');
    }
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
            {mode === 'FORGOT' && 'Reset Your Password'}
            {mode === 'RESET' && 'Choose a New Password'}
          </h2>
          <p className="text-white/80 text-xs mt-1">
            {mode === 'LOGIN' && 'Sign in to access support, active sessions, and preferences.'}
            {mode === 'REGISTER' && 'Protected identity for confidential human listening.'}
            {mode === 'OTP' && 'Enter the 6-digit verification code sent to your email.'}
            {mode === 'FORGOT' && "We'll email you a code to reset your password."}
            {mode === 'RESET' && 'Enter the code and your new password.'}
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-2.5 text-[#59636B] hover:text-[#17212B]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT'); clearAuthError(); setForgotStatus(null); }}
                    className="text-xs text-[#123B5D] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-9 py-2 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-2 text-[#59636B] hover:text-[#17212B]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  A 6-digit code was sent to <strong className="font-semibold">{email || pendingEmail}</strong>. Check your inbox.
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

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'FORGOT' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-[#59636B]">Enter your account email and we'll send you a reset code.</p>
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. seeker@safespace.ng"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-medium rounded-lg shadow-xs text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Reset Code</span>}
              </button>
              {forgotStatus && <p className="text-[11px] text-center text-[#123B5D] font-medium">{forgotStatus}</p>}
              <div className="text-center pt-2">
                <button type="button" onClick={() => setMode('LOGIN')} className="text-xs text-[#59636B] hover:text-[#17212B]">
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE: RESET PASSWORD */}
          {mode === 'RESET' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <p className="text-xs text-[#59636B]">Enter the code we sent to <strong>{email}</strong> and choose a new password.</p>
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Reset Code</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Code from your email"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#59636B] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#E3E2DE] rounded-lg text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-2.5 text-[#59636B] hover:text-[#17212B]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-medium rounded-lg shadow-xs text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
              </button>
              {forgotStatus && <p className="text-[11px] text-center text-[#123B5D] font-medium">{forgotStatus}</p>}
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
