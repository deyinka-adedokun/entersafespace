import React, { useState, useEffect } from 'react';
import { Session } from '../types';
import { SafespaceLogo } from './ui/SafespaceLogo';
import { 
  Shield, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  Check, 
  Flag,
  RotateCcw,
  Home
} from 'lucide-react';

interface FeedbackViewProps {
  sessionId?: string;
  onDone: () => void;
  onHaveAnotherConversation?: () => void;
  onOpenEmergency: () => void;
  onOpenSafetyReport?: () => void;
}

type ReflectionChoice = 
  | 'HELPFUL'
  | 'SOMEWHAT_HELPFUL'
  | 'NOT_WHAT_I_NEEDED'
  | 'NOT_SURE'
  | 'PREFER_NOT_TO_SAY';

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  sessionId,
  onDone,
  onHaveAnotherConversation,
  onOpenEmergency,
  onOpenSafetyReport
}) => {
  // Session resolution
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(Boolean(sessionId));
  const [isInterrupted, setIsInterrupted] = useState<boolean>(false);

  // Optional Reflection State
  const [reflection, setReflection] = useState<ReflectionChoice | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState<boolean>(false);

  // Safety Concern Modal State
  const [showSafetyReportModal, setShowSafetyReportModal] = useState<boolean>(false);
  const [safetyReason, setSafetyReason] = useState<string>('Uncomfortable boundary or interaction');
  const [safetyReportSent, setSafetyReportSent] = useState<boolean>(false);

  // Fetch session data if sessionId is provided
  useEffect(() => {
    if (!sessionId) {
      setLoadingSession(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/v1/sessions/${sessionId}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted && json.success && json.data?.session) {
          setSession(json.data.session);
          if (json.data.session.status === 'INTERRUPTED') {
            setIsInterrupted(true);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load completed session summary', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Handle reflection submission
  const handleSubmitReflection = async () => {
    if (!reflection && !notes.trim()) {
      onDone();
      return;
    }

    setIsSubmitting(true);
    try {
      if (sessionId) {
        await fetch(`/api/v1/sessions/${sessionId}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: reflection === 'HELPFUL' ? 5 : reflection === 'SOMEWHAT_HELPFUL' ? 4 : 3,
            feltHeard: reflection === 'HELPFUL' || reflection === 'SOMEWHAT_HELPFUL',
            comment: notes.trim() ? `[${reflection || 'NO_CHOICE'}]: ${notes.trim()}` : reflection,
            returnReason: reflection
          })
        });
      }
      setReflectionSubmitted(true);
    } catch (err) {
      setReflectionSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Safety Report quietly
  const handleSendSafetyReport = async () => {
    setSafetyReportSent(true);
    try {
      if (sessionId) {
        await fetch('/api/v1/safeguarding/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            reason: safetyReason,
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (e) {
      // Quiet fail-safe
    }

    setTimeout(() => {
      setShowSafetyReportModal(false);
      setSafetyReportSent(false);
    }, 1500);
  };

  const providerName = session?.providerDisplayName || 'Your Provider';
  const packageName = session?.packageName || 'Audio Conversation';
  const durationMinutes = session?.allocatedSeconds ? Math.round(session.allocatedSeconds / 60) : 30;

  const reflectionOptions: { id: ReflectionChoice; label: string }[] = [
    { id: 'HELPFUL', label: 'Helpful' },
    { id: 'SOMEWHAT_HELPFUL', label: 'Somewhat helpful' },
    { id: 'NOT_WHAT_I_NEEDED', label: 'Not what I needed' },
    { id: 'NOT_SURE', label: 'Not sure yet' },
    { id: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17212B] flex flex-col justify-between selection:bg-[#123B5D]/10 selection:text-[#123B5D] animate-in fade-in duration-300">
      
      {/* =========================================================================
          TOP REST-STATE HEADER (Section 0 & 18: Quiet, Authoritative Logo Only)
          ========================================================================= */}
      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-[#E3E2DE]/60">
        <SafespaceLogo size="sm" showWordmark={true} />
        <button
          onClick={onOpenEmergency}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#59636B] hover:text-[#8C1D18] bg-[#F3F1EC] hover:bg-[#FDF2F2] border border-[#E3E2DE] hover:border-[#F9C9C7] transition-colors cursor-pointer"
          aria-label="Access crisis & emergency safety resources"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Safety & Crisis Resources</span>
        </button>
      </header>

      {/* =========================================================================
          MAIN EDITORIAL & CLOSURE CANVAS (Section 1, 2, 3, 4: Space to Pause)
          ========================================================================= */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8 text-left">
        
        {/* Primary Completion State & Closure Statement */}
        <div className="space-y-3">
          
          {isInterrupted ? (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F3F1EC] border border-[#E3E2DE] text-xs font-medium text-[#17212B]">
                <AlertCircle className="w-3.5 h-3.5 text-[#59636B]" />
                <span>Connection Interrupted</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17212B] tracking-tight">
                Your conversation was interrupted unexpectedly.
              </h1>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Your remaining session entitlement has been preserved in accordance with our system reliability policy.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17212B] tracking-tight">
                Your conversation has ended.
              </h1>
              <p className="font-display italic text-lg sm:text-xl text-[#59636B] leading-relaxed">
                Thank you for making space for the conversation.
              </p>
            </div>
          )}

        </div>

        {/* Restrained Session Summary (Section 3: Dignified, No Transcripts/AI Analysis) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#59636B]">
            Conversation Summary
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#59636B] block text-[11px]">Conversation Partner</span>
              <span className="font-semibold text-[#17212B] text-sm block mt-0.5">
                {providerName}
              </span>
            </div>

            <div>
              <span className="text-[#59636B] block text-[11px]">Duration</span>
              <span className="font-semibold text-[#17212B] text-sm block mt-0.5">
                {packageName} ({durationMinutes} mins)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E3E2DE]/60 flex items-center justify-between text-[11px] text-[#59636B]">
            <span>Status: Completed normally</span>
            <span className="text-[11px] text-[#7E8890]">Private audio conversation</span>
          </div>
        </div>

        {/* Credit / Entitlement State Notice (Section 4: Truthful Lifecycle) */}
        <div className="p-3.5 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-xs text-[#59636B] leading-relaxed">
          {isInterrupted ? (
            <span>
              Because this session experienced a network interruption, any remaining credit remains in your account.
            </span>
          ) : (
            <span>
              This conversation time is concluded. Under standard session completion, unused minutes are not carried over.
            </span>
          )}
        </div>

        {/* Optional Reflection (Section 5, 6, 7: Neutral, Non-Forced, Non-Clinical) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4">
          
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-[#17212B]">
              How was that conversation for you?
            </h2>
            <p className="text-xs text-[#59636B]">
              Optional reflection to help us maintain thoughtful, safe conversations.
            </p>
          </div>

          {reflectionSubmitted ? (
            <div className="py-4 text-center space-y-1 bg-[#F3F1EC] rounded-xl border border-[#E3E2DE]">
              <Check className="w-5 h-5 text-[#123B5D] mx-auto" />
              <p className="text-xs font-semibold text-[#17212B]">Thank you for sharing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              
              {/* Neutral Reflection Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reflectionOptions.map((opt) => {
                  const isSelected = reflection === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReflection(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#123B5D] bg-[#EAF0F5] text-[#123B5D] font-semibold'
                          : 'border-[#E3E2DE] bg-white hover:bg-[#F3F1EC] text-[#17212B]'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#123B5D] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Optional Gentle Note */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-[#59636B] block">
                  Optional note or reflection <span className="font-normal">(Confidential)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share anything you'd like us to know quietly..."
                  rows={2}
                  className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs text-[#17212B] focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden resize-none"
                />
              </div>

              {/* Save Reflection / Skip Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleSubmitReflection}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save reflection'}
                </button>

                <button
                  type="button"
                  onClick={onDone}
                  className="text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
                >
                  Skip
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Safety & Concern Route (Section 8 & 9: Dignified Reporting Pathway) */}
        <div className="flex items-center justify-between px-2 text-xs text-[#59636B]">
          <button
            onClick={() => {
              if (onOpenSafetyReport) onOpenSafetyReport();
              else setShowSafetyReportModal(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#59636B] hover:text-[#8C1D18] transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report a concern about this conversation</span>
          </button>
        </div>

        {/* The "What Next?" Moment (Section 10, 11, 14: Non-Manipulative Next Steps) */}
        <div className="space-y-3 pt-2">
          
          <div className="text-xs text-[#59636B]">
            If talking helped, you can return whenever you need a conversation.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Primary Action: Return to Safespace */}
            <button
              onClick={onDone}
              className="flex-1 py-3.5 px-6 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>Return to Safespace</span>
            </button>

            {/* Secondary Action: Have another conversation */}
            {onHaveAnotherConversation && (
              <button
                onClick={onHaveAnotherConversation}
                className="py-3.5 px-6 bg-white hover:bg-[#F3F1EC] text-[#17212B] border border-[#E3E2DE] rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-[#59636B]" />
                <span>Have another conversation</span>
              </button>
            )}

          </div>

        </div>

        {/* =========================================================================
            SAGE BOUNDARY & EXTERNAL GATEWAY (Section 12 & 13: Distinct Ecosystem)
            ========================================================================= */}
        <div className="pt-6 border-t border-[#E3E2DE]">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E3E2DE] p-1.5 flex items-center justify-center shrink-0">
                <img
                  src="/assets/sage-logo.png"
                  alt="Sage"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#59636B] uppercase block">
                  Independent Companion
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#17212B]">
                  Want a little more space to reflect?
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#59636B] leading-relaxed">
              <strong>Sage</strong> is a separate AI companion for intentional becoming. Explore self-directed reflection in an independent space.
            </p>

            <div className="pt-1 flex items-center justify-between">
              <a
                href="https://becomingwithsage.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#17212B] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <span>Explore Sage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] text-[#7E8890] italic hidden sm:inline">
                Opens in external window
              </span>
            </div>

          </div>
        </div>

      </main>

      {/* =========================================================================
          SUBTLE FOOTER
          ========================================================================= */}
      <footer className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[#7E8890] border-t border-[#E3E2DE]/40">
        Safespace • Human emotional support through conversation
      </footer>

      {/* =========================================================================
          MODAL: REPORT A CONCERN (Section 8: Canonical Safeguarding Route)
          ========================================================================= */}
      {showSafetyReportModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#17212B]/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150 text-left">
            
            <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
              <h3 className="text-lg font-bold text-[#17212B]">
                Report a concern
              </h3>
              <button
                onClick={() => setShowSafetyReportModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#59636B] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {safetyReportSent ? (
              <div className="py-6 text-center space-y-2">
                <Check className="w-8 h-8 text-[#1E6B43] mx-auto" />
                <h4 className="font-bold text-sm text-[#17212B]">Concern Logged</h4>
                <p className="text-xs text-[#59636B]">
                  Your report has been submitted confidentially to our Trust & Safety team.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#59636B]">
                  If something during the conversation crossed personal boundaries or felt concerning, please let us know:
                </p>

                <div className="space-y-2">
                  {[
                    'Uncomfortable boundary or interaction',
                    'Inappropriate or offensive language',
                    'Pressure to share personal contact details',
                    'Other safeguarding concern'
                  ].map((reason) => (
                    <label
                      key={reason}
                      onClick={() => setSafetyReason(reason)}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        safetyReason === reason
                          ? 'border-[#123B5D] bg-[#EAF0F5] text-[#123B5D] font-semibold'
                          : 'border-[#E3E2DE] bg-[#F3F1EC]/60 text-[#17212B]'
                      }`}
                    >
                      <span>{reason}</span>
                      {safetyReason === reason && <Check className="w-3.5 h-3.5 text-[#123B5D]" />}
                    </label>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleSendSafetyReport}
                    className="w-full py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Submit confidential report
                  </button>

                  <button
                    onClick={() => setShowSafetyReportModal(false)}
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
