import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Session, SessionExtension, UserRole } from '../types';
import { CANONICAL_PACKAGES } from '../data/mockData';
import { SafespaceLogo } from './ui/SafespaceLogo';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Shield, 
  Plus, 
  Check, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  RefreshCw,
  Clock,
  ArrowRight,
  HelpCircle,
  Flag
} from 'lucide-react';

interface ActiveSessionViewProps {
  sessionId: string;
  onSessionEnded: () => void;
  onOpenEmergency: () => void;
  currentUserRole?: UserRole;
}

type AudioConnectionState = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'FAILED' | 'ENDED';

export const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
  sessionId,
  onSessionEnded,
  onOpenEmergency,
  currentUserRole = 'SUPPORT_SEEKER'
}) => {
  // Session & Heartbeat Data
  const [session, setSession] = useState<Session | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [connectionState, setConnectionState] = useState<AudioConnectionState>('CONNECTING');
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  // Audio Controls State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(1);

  // Modals & Sheets State
  const [showEndConfirmModal, setShowEndConfirmModal] = useState<boolean>(false);
  const [showExtensionModal, setShowExtensionModal] = useState<boolean>(false);
  const [showSafetySheet, setShowSafetySheet] = useState<boolean>(false);
  const [showReportConcernModal, setShowReportConcernModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Uncomfortable boundary or interaction');
  const [reportSent, setReportSent] = useState<boolean>(false);

  // Extension Flow State
  const [selectedPackageId, setSelectedPackageId] = useState<string>('package-quick');
  const [paymentMethod, setPaymentMethod] = useState<'SAVED_CARD' | 'NEW_CARD' | 'BANK_TRANSFER'>('SAVED_CARD');
  const [simulate3DS, setSimulate3DS] = useState<boolean>(false);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [show3DSModal, setShow3DSModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [extending, setExtending] = useState<boolean>(false);
  const [extensionToast, setExtensionToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [ending, setEnding] = useState<boolean>(false);

  // Gentle Audio Activity Simulation
  useEffect(() => {
    if (connectionState !== 'CONNECTED' || isMuted) {
      setAudioLevel(0);
      return;
    }
    const interval = setInterval(() => {
      // Soft organic audio fluctuation between 0.3 and 1
      setAudioLevel(0.4 + Math.random() * 0.6);
    }, 450);
    return () => clearInterval(interval);
  }, [connectionState, isMuted]);

  // Initial Connection Transition (CONNECTING -> CONNECTED)
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setConnectionState('CONNECTED');
    }, 1200);
    return () => clearTimeout(connectTimer);
  }, []);

  // Authoritative Heartbeat Polling
  useEffect(() => {
    let interval: any;

    const syncHeartbeat = async () => {
      try {
        const res = await fetch(`/api/v1/sessions/${sessionId}/heartbeat`, { method: 'POST' });
        const json = await res.json();
        
        if (json.success && json.data) {
          setSession(json.data.session);
          setRemainingSeconds(json.data.remainingSeconds);

          if (json.data.session.status === 'COMPLETED' || json.data.session.status === 'CANCELLED') {
            setConnectionState('ENDED');
            clearInterval(interval);
            setTimeout(() => {
              onSessionEnded();
            }, 1000);
          } else if (connectionState === 'RECONNECTING' || connectionState === 'CONNECTING') {
            setConnectionState('CONNECTED');
          }
        }
      } catch (err) {
        // Soft reconnection state on network glitch
        setReconnectAttempts(prev => prev + 1);
        if (reconnectAttempts > 2) {
          setConnectionState('RECONNECTING');
        }
      }
    };

    syncHeartbeat();
    interval = setInterval(syncHeartbeat, 3000);

    return () => clearInterval(interval);
  }, [sessionId, onSessionEnded, connectionState, reconnectAttempts]);

  // Format MM:SS without flashing or panic
  const formatTimeRemaining = (seconds: number): string => {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // End Session Manually
  const handleConfirmEndSession = async () => {
    setEnding(true);
    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'USER_INITIATED' })
      });
      const json = await res.json();
      if (json.success) {
        setShowEndConfirmModal(false);
        setConnectionState('ENDED');
        setTimeout(() => {
          onSessionEnded();
        }, 800);
      }
    } catch (err) {
      console.error('Failed to end session cleanly', err);
      onSessionEnded();
    } finally {
      setEnding(false);
    }
  };

  // Extension Execution
  const executeExtension = async (packageId: string) => {
    setExtending(true);
    setExtensionToast(null);

    if (simulate3DS) {
      setTimeout(() => {
        setExtending(false);
        setShow3DSModal(true);
      }, 400);
      return;
    }

    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          paymentMethod,
          simulateFailure
        })
      });
      const json = await res.json();
      if (json.success) {
        setSession(json.data.session);
        setRemainingSeconds(json.data.remainingSeconds);
        setShowExtensionModal(false);
        setExtensionToast({
          type: 'success',
          text: `Added +${json.data.extension.durationMinutes} minutes to your conversation.`
        });
      } else {
        setExtensionToast({
          type: 'error',
          text: json.error?.message || 'Payment authorization was not completed. Your ongoing conversation continues uninterrupted.'
        });
      }
    } catch (err) {
      setExtensionToast({
        type: 'error',
        text: 'Network interruption during extension. Your ongoing conversation continues.'
      });
    } finally {
      setExtending(false);
    }
  };

  // Verify OTP for 3DS test
  const handleVerifyOtp = async () => {
    if (otpCode.trim() !== '123456') {
      setOtpError('Please enter valid test OTP (123456).');
      return;
    }

    setExtending(true);
    setOtpError(null);

    try {
      const res = await fetch(`/api/v1/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackageId,
          paymentMethod: '3DS_VERIFIED'
        })
      });
      const json = await res.json();
      if (json.success) {
        setSession(json.data.session);
        setRemainingSeconds(json.data.remainingSeconds);
        setShow3DSModal(false);
        setShowExtensionModal(false);
        setExtensionToast({
          type: 'success',
          text: `Verified: Added +${json.data.extension.durationMinutes} minutes.`
        });
      }
    } catch (err) {
      setOtpError('Failed to verify authentication.');
    } finally {
      setExtending(false);
    }
  };

  // Report Concern Handler
  const handleSendReportConcern = () => {
    setReportSent(true);
    setTimeout(() => {
      setShowReportConcernModal(false);
      setShowSafetySheet(false);
      setReportSent(false);
      setExtensionToast({
        type: 'success',
        text: 'Your concern has been logged quietly with our Safety team.'
      });
    }, 1200);
  };

  const isProviderView = currentUserRole === 'PROVIDER';
  const partnerName = isProviderView 
    ? (session?.seekerDisplayName || 'Seeker') 
    : (session?.providerDisplayName || 'Your Provider');

  const partnerInitials = partnerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SP';

  const extensionPackages = CANONICAL_PACKAGES.filter(p => !p.isFreeTrial);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17212B] flex flex-col justify-between selection:bg-[#123B5D]/10 selection:text-[#123B5D]">
      
      {/* =========================================================================
          SESSION HEADER (Section 4: Extremely Restrained, No Marketing Nav)
          ========================================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#E3E2DE]/60">
        
        {/* Left: Safespace Authoritative Logo Mark */}
        <div className="flex items-center gap-2">
          <SafespaceLogo size="sm" showWordmark={true} />
        </div>

        {/* Center: Quiet Subordinate Session Status */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#59636B]">
          <span 
            className={`w-2 h-2 rounded-full transition-colors ${
              connectionState === 'CONNECTED'
                ? 'bg-[#1E6B43]'
                : connectionState === 'CONNECTING' || connectionState === 'RECONNECTING'
                ? 'bg-[#9C5B0B] animate-pulse'
                : 'bg-[#59636B]'
            }`}
          />
          <span className="hidden sm:inline">
            {connectionState === 'CONNECTED' && "You're connected"}
            {connectionState === 'CONNECTING' && "Connecting..."}
            {connectionState === 'RECONNECTING' && "Trying to reconnect..."}
            {connectionState === 'ENDED' && "Conversation ended"}
            {connectionState === 'FAILED' && "Connection interrupted"}
          </span>
          <span className="text-[#E3E2DE] hidden sm:inline">•</span>
          <span className="text-[11px] text-[#59636B] hidden sm:inline">Private audio</span>
        </div>

        {/* Right: Persistent, Non-Alarmist Safety Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSafetySheet(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#59636B] hover:text-[#123B5D] bg-[#F3F1EC] hover:bg-[#EAE7E0] border border-[#E3E2DE] transition-colors cursor-pointer"
            aria-label="Open safety and support options"
          >
            <Shield className="w-3.5 h-3.5 text-[#59636B]" />
            <span>Safety</span>
          </button>
        </div>

      </header>

      {/* =========================================================================
          MAIN CONVERSATION CANVAS (Section 6, 7, 8, 9, 10: Human Presence)
          ========================================================================= */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300">
        
        {/* Extension confirmation toast */}
        {extensionToast && (
          <div 
            className={`w-full max-w-md p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 text-left animate-in fade-in duration-200 ${
              extensionToast.type === 'success'
                ? 'bg-[#F3F1EC] border border-[#1E6B43]/30 text-[#17212B]'
                : 'bg-[#FDF2F2] border border-[#F9C9C7] text-[#17212B]'
            }`}
            role="status"
          >
            <div className="flex items-center gap-2">
              {extensionToast.type === 'success' ? (
                <Check className="w-4 h-4 text-[#1E6B43] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#8C1D18] shrink-0" />
              )}
              <span>{extensionToast.text}</span>
            </div>
            <button
              onClick={() => setExtensionToast(null)}
              className="text-[11px] font-bold text-[#59636B] hover:text-[#17212B] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Human Presence / Center Avatar / Initials */}
        <div className="space-y-5">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center">
            
            {/* Subtle soft audio pulse (Respects Reduced Motion via CSS) */}
            {connectionState === 'CONNECTED' && !isMuted && (
              <div 
                className="absolute inset-0 rounded-full bg-[#123B5D]/5 transition-transform duration-300 pointer-events-none"
                style={{ transform: `scale(${1 + audioLevel * 0.12})` }}
              />
            )}

            {session?.providerAvatarUrl && !isProviderView ? (
              <img
                src={session.providerAvatarUrl}
                alt={partnerName}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border border-[#E3E2DE] shadow-2xs relative z-10 bg-white"
              />
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#F3F1EC] border border-[#E3E2DE] flex items-center justify-center text-3xl font-display text-[#123B5D] font-normal shadow-2xs relative z-10">
                {partnerInitials}
              </div>
            )}

            {/* Muted Microphone Indicator Badge */}
            {isMuted && (
              <div 
                className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-[#59636B] text-white flex items-center justify-center border-2 border-[#FAF9F6] text-xs shadow-xs"
                title="Microphone muted"
              >
                <MicOff className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Identity & Status */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17212B] tracking-tight">
              {partnerName}
            </h1>
            <p className="text-xs sm:text-sm text-[#59636B]">
              {isProviderView ? 'Conversation Partner' : 'Safespace Verified Provider'}
            </p>
          </div>

          {/* Emotional Grounding Statement (Instrument Serif used with restraint) */}
          <div className="pt-2">
            <p className="font-display italic text-lg sm:text-xl text-[#59636B]">
              Take your time.
            </p>
          </div>

          {/* Restrained Audio Activity Visualization (Section 10) */}
          <div className="flex items-center justify-center gap-1 h-4 pt-1" aria-hidden="true">
            {[0.4, 0.7, 1.0, 0.7, 0.4].map((barScale, idx) => (
              <div
                key={idx}
                className="w-1 bg-[#123B5D] rounded-full transition-all duration-200"
                style={{
                  height: connectionState === 'CONNECTED' && !isMuted
                    ? `${Math.max(4, 16 * audioLevel * barScale)}px`
                    : '4px',
                  opacity: connectionState === 'CONNECTED' && !isMuted ? 0.8 : 0.25
                }}
              />
            ))}
          </div>

        </div>

      </main>

      {/* =========================================================================
          LOWER INTERACTION AREA (Section 11, 12, 13, 14: Controls & Subordinate Timer)
          ========================================================================= */}
      <footer className="w-full max-w-xl mx-auto px-4 pb-8 sm:pb-12 pt-4 space-y-6">
        
        {/* Psychologically Subordinate Session Timer & Continuity Action */}
        <div className="flex items-center justify-between px-2 text-xs text-[#59636B]">
          
          {/* Subordinate Timer (Section 13: Calm compact treatment, no urgent countdown) */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#59636B] bg-[#F3F1EC] px-3 py-1.5 rounded-lg border border-[#E3E2DE]">
            <Clock className="w-3.5 h-3.5 text-[#59636B]" />
            <span>{formatTimeRemaining(remainingSeconds)} remaining</span>
          </div>

          {/* Time Extension Button (Section 14: Preserves call continuity) */}
          {!isProviderView && (
            <button
              onClick={() => setShowExtensionModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#123B5D] hover:text-[#0D2A42] bg-[#EAF0F5] hover:bg-[#DDE7F0] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Need a little more time?</span>
            </button>
          )}

        </div>

        {/* Primary Controls Bar */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 pt-2">
          
          {/* 1. Microphone Toggle (Section 11) */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
                isMuted
                  ? 'bg-[#59636B] border-[#59636B] text-white'
                  : 'bg-white hover:bg-[#F3F1EC] border-[#E3E2DE] text-[#17212B]'
              }`}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              aria-pressed={isMuted}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-[#123B5D]" />}
            </button>
            <span className="text-xs font-medium text-[#59636B]">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </div>

          {/* 2. End Conversation Button (Section 12: Distinct and Consequential) */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowEndConfirmModal(true)}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#8C1D18] hover:bg-[#731713] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="End conversation"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <span className="text-xs font-semibold text-[#8C1D18]">
              End conversation
            </span>
          </div>

          {/* 3. Speaker Output Toggle */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
                !isSpeakerOn
                  ? 'bg-[#F3F1EC] border-[#E3E2DE] text-[#59636B]'
                  : 'bg-white hover:bg-[#F3F1EC] border-[#E3E2DE] text-[#17212B]'
              }`}
              aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
              aria-pressed={isSpeakerOn}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6 text-[#123B5D]" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <span className="text-xs font-medium text-[#59636B]">
              {isSpeakerOn ? 'Speaker' : 'Earpiece'}
            </span>
          </div>

        </div>

      </footer>

      {/* =========================================================================
          MODAL 1: END CONVERSATION CONFIRMATION (Section 12 & 15)
          ========================================================================= */}
      {showEndConfirmModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#17212B]/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-dialog-title"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150">
            
            <div className="w-12 h-12 rounded-full bg-[#F3F1EC] text-[#8C1D18] flex items-center justify-center mx-auto border border-[#E3E2DE]">
              <PhoneOff className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <h3 id="end-dialog-title" className="text-xl font-bold text-[#17212B]">
                End this conversation?
              </h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                {remainingSeconds > 60 ? (
                  <>You still have <strong>{formatTimeRemaining(remainingSeconds)}</strong> remaining. Unused session time is extinguished upon closing.</>
                ) : (
                  <>Are you sure you want to conclude your conversation?</>
                )}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                disabled={ending}
                onClick={handleConfirmEndSession}
                className="w-full py-3 bg-[#8C1D18] hover:bg-[#731713] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {ending ? 'Ending session...' : 'End conversation'}
              </button>
              
              <button
                disabled={ending}
                onClick={() => setShowEndConfirmModal(false)}
                className="w-full py-3 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-[#E3E2DE]"
              >
                Continue conversation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TIME EXTENSION MODAL (Section 14)
          ========================================================================= */}
      {showExtensionModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#17212B]/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="extension-dialog-title"
        >
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150 text-left">
            
            <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
              <div>
                <h3 id="extension-dialog-title" className="text-xl font-bold text-[#17212B]">
                  Continue conversation
                </h3>
                <p className="text-xs text-[#59636B] mt-0.5">
                  Add more unhurried time without interrupting your call.
                </p>
              </div>
              <button
                onClick={() => setShowExtensionModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#59636B] flex items-center justify-center text-sm font-bold cursor-pointer"
                aria-label="Close extension window"
              >
                ✕
              </button>
            </div>

            {/* Canonical Extension Packages */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-[#17212B] uppercase tracking-wider block">
                Choose Added Time
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {extensionPackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#123B5D] bg-[#EAF0F5] ring-1 ring-[#123B5D]'
                          : 'border-[#E3E2DE] bg-white hover:bg-[#F3F1EC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#17212B]">{pkg.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#123B5D] text-white">
                          +{pkg.durationMinutes}m
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[#123B5D] mt-1">
                        ₦{pkg.priceNGN.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seamless Payment Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#17212B] uppercase tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SAVED_CARD', label: 'Saved Card' },
                  { id: 'NEW_CARD', label: 'Card' },
                  { id: 'BANK_TRANSFER', label: 'Transfer' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-colors cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'border-[#123B5D] bg-[#EAF0F5] text-[#123B5D]'
                        : 'border-[#E3E2DE] text-[#59636B] bg-white hover:bg-[#F3F1EC]'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="p-3 bg-[#F3F1EC] rounded-xl border border-[#E3E2DE] space-y-1.5 text-xs text-[#59636B]">
              <span className="font-semibold text-[#17212B] block text-[11px] uppercase">Testing Controls</span>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={simulate3DS}
                    onChange={(e) => {
                      setSimulate3DS(e.target.checked);
                      if (e.target.checked) setSimulateFailure(false);
                    }}
                    className="rounded text-[#123B5D] focus:ring-[#123B5D]"
                  />
                  <span>Simulate 3DS OTP</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => {
                      setSimulateFailure(e.target.checked);
                      if (e.target.checked) setSimulate3DS(false);
                    }}
                    className="rounded text-[#8C1D18] focus:ring-[#8C1D18]"
                  />
                  <span>Simulate Fail</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                disabled={extending}
                onClick={() => executeExtension(selectedPackageId)}
                className="w-full py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] disabled:bg-[#E3E2DE] text-white rounded-lg font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {extending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Adding time...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize Extension</span>
                  </>
                )}
              </button>

              <button
                disabled={extending}
                onClick={() => setShowExtensionModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: 3DS AUTHENTICATION SIMULATION
          ========================================================================= */}
      {show3DSModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#17212B]/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-[#F3F1EC] text-[#123B5D] flex items-center justify-center mx-auto border border-[#E3E2DE]">
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#17212B]">
                Bank Authentication
              </h3>
              <p className="text-xs text-[#59636B]">
                Your bank requires verification to authorize this session extension.
              </p>
            </div>

            <div className="p-2.5 bg-[#F3F1EC] rounded-lg text-xs font-medium text-[#17212B] border border-[#E3E2DE]">
              Use demo code: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E3E2DE]">123456</strong>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2.5 border border-[#E3E2DE] rounded-lg text-center text-lg font-mono tracking-widest focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
              />

              {otpError && (
                <div className="text-xs font-semibold text-[#8C1D18]">
                  {otpError}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                disabled={extending}
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {extending ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                disabled={extending}
                onClick={() => setShow3DSModal(false)}
                className="w-full py-2 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PERSISTENT SAFETY INTERVENTION & REPORTING (Section 16, 17, 18, 19, 20)
          ========================================================================= */}
      {showSafetySheet && (
        <div 
          className="fixed inset-0 z-50 bg-[#17212B]/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="safety-sheet-title"
        >
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150 text-left">
            
            <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#123B5D]" />
                <h3 id="safety-sheet-title" className="text-xl font-bold text-[#17212B]">
                  Are you feeling unsafe?
                </h3>
              </div>
              <button
                onClick={() => setShowSafetySheet(false)}
                className="w-8 h-8 rounded-lg bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#59636B] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              Safespace is a peer emotional listening service. If you are experiencing distress, an uncomfortable interaction, or an immediate emergency, please choose how we can support you:
            </p>

            <div className="space-y-3">
              
              {/* Option A: Report Concern quietly */}
              <button
                onClick={() => setShowReportConcernModal(true)}
                className="w-full p-4 rounded-xl border border-[#E3E2DE] bg-[#F3F1EC] hover:bg-[#EAE7E0] text-left transition-colors flex items-start gap-3 cursor-pointer"
              >
                <Flag className="w-5 h-5 text-[#123B5D] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs sm:text-sm text-[#17212B] block">
                    Something about this conversation doesn't feel right
                  </span>
                  <span className="text-[11px] text-[#59636B] block">
                    Discreetly notify the Safespace trust & safety team.
                  </span>
                </div>
              </button>

              {/* Option B: Immediate Emergency / Crisis Boundary (Section 18) */}
              <button
                onClick={() => {
                  setShowSafetySheet(false);
                  onOpenEmergency();
                }}
                className="w-full p-4 rounded-xl border border-[#F9C9C7] bg-[#FDF2F2] hover:bg-[#FCE8E6] text-left transition-colors flex items-start gap-3 cursor-pointer"
              >
                <AlertCircle className="w-5 h-5 text-[#8C1D18] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs sm:text-sm text-[#8C1D18] block">
                    I am in immediate danger or distress
                  </span>
                  <span className="text-[11px] text-[#59636B] block">
                    Open verified emergency crisis lines (Lagos State 112 / 767, Crisis Helplines).
                  </span>
                </div>
              </button>

            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowSafetySheet(false)}
                className="text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Return to conversation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: REPORT CONCERN INTERFACE (Section 20: Calm, Non-Weaponized)
          ========================================================================= */}
      {showReportConcernModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#17212B]/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150 text-left">
            
            <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
              <h3 className="text-xl font-bold text-[#17212B]">
                Report concern
              </h3>
              <button
                onClick={() => setShowReportConcernModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#59636B] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reportSent ? (
              <div className="py-6 text-center space-y-2">
                <Check className="w-8 h-8 text-[#1E6B43] mx-auto" />
                <h4 className="font-bold text-sm text-[#17212B]">Concern Logged Quietly</h4>
                <p className="text-xs text-[#59636B]">Our safety reviewers have received your notice.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#59636B]">
                  Please let us know what feels concerning. Your feedback is confidential and reviewed by our trust team.
                </p>

                <div className="space-y-2">
                  {[
                    'Uncomfortable boundary or interaction',
                    'Inappropriate or offensive language',
                    'Pressure to share personal contact information',
                    'Other safety concern'
                  ].map((reason) => (
                    <label
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        reportReason === reason
                          ? 'border-[#123B5D] bg-[#EAF0F5] text-[#123B5D] font-semibold'
                          : 'border-[#E3E2DE] bg-[#F3F1EC]/60 text-[#17212B]'
                      }`}
                    >
                      <span>{reason}</span>
                      {reportReason === reason && <Check className="w-3.5 h-3.5 text-[#123B5D]" />}
                    </label>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleSendReportConcern}
                    className="w-full py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Submit confidential report
                  </button>

                  <button
                    onClick={() => setShowReportConcernModal(false)}
                    className="w-full py-2 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
