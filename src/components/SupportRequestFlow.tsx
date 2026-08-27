import React, { useState, useEffect } from 'react';
import { SessionPackage, ProviderProfile, User } from '../types';
import { CANONICAL_PACKAGES } from '../data/mockData';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  MicOff, 
  Lock, 
  Sparkles,
  HeartHandshake,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { SafespaceLogo } from './ui/SafespaceLogo';

interface SupportRequestFlowProps {
  currentUser?: User | null;
  onCancel: () => void;
  onStartSession: (packageId: string, providerId: string, paymentMethod?: string) => void;
  preferredProvider?: ProviderProfile | null;
  onOpenSafety?: () => void;
}

export type FlowStep = 
  | 'AGE_GATE'
  | 'INTENT'
  | 'CONTEXT'
  | 'DURATION'
  | 'REVIEW'
  | 'MATCHING'
  | 'PREPARATION';

export const SupportRequestFlow: React.FC<SupportRequestFlowProps> = ({
  currentUser,
  onCancel,
  onStartSession,
  preferredProvider,
  onOpenSafety
}) => {
  const safeUser: User = currentUser || {
    id: 'guest-seeker',
    email: 'guest@safespace.ng',
    displayName: 'Guest Seeker',
    role: 'SUPPORT_SEEKER',
    status: 'ACTIVE',
    freeTrialUsed: false,
    createdAt: new Date().toISOString()
  };

  // Step State
  const [currentStep, setCurrentStep] = useState<FlowStep>('AGE_GATE');
  const [isUnder18, setIsUnder18] = useState<boolean>(false);

  // Dynamic Packages
  const [packages, setPackages] = useState<SessionPackage[]>(CANONICAL_PACKAGES);

  useEffect(() => {
    fetch('/api/v1/packages')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.packages) {
          setPackages(json.data.packages);
        }
      })
      .catch(() => {
        // Fallback gracefully to CANONICAL_PACKAGES
      });
  }, []);

  // Form State
  const [selectedIntent, setSelectedIntent] = useState<string>('I just need someone to listen.');
  const [customIntent, setCustomIntent] = useState<string>('');
  const [optionalContext, setOptionalContext] = useState<string>('');
  
  // Preferences (Language & Gender comfort)
  const [languagePreference, setLanguagePreference] = useState<string>('English');
  const [genderPreference, setGenderPreference] = useState<'no-preference' | 'female' | 'male'>('no-preference');

  // Package Selection
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    !safeUser.freeTrialUsed ? 'package-try' : 'package-open'
  );
  const [agreedToCreditRule, setAgreedToCreditRule] = useState<boolean>(false);

  // Matching State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [matchedProvider, setMatchedProvider] = useState<ProviderProfile | null>(null);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [searchAttempts, setSearchAttempts] = useState<number>(0);

  // Canonical Intent Taxonomy (Page 05 specification)
  const intentOptions = [
    'I just need someone to listen.',
    'I need to talk something through.',
    "I've had a difficult day.",
    'I feel overwhelmed.',
    'I need somewhere to say what I am feeling.',
    'Something is weighing on me.',
    "I'd rather just talk.",
    'Other'
  ];

  const languages = ['English', 'Yoruba', 'Hausa', 'Igbo', 'Nigerian Pidgin'];

  const selectedPkg = packages.find(p => p.id === selectedPackageId) || packages[1];

  // Initiate matching with backend
  const handleInitiateMatching = async () => {
    if (selectedPkg.priceNGN > 0 && !agreedToCreditRule) {
      alert('Please acknowledge that unused session credit expires when the conversation closes.');
      return;
    }

    setCurrentStep('MATCHING');
    setIsSearching(true);
    setMatchingError(null);
    setSearchAttempts(prev => prev + 1);

    const intentPayload = selectedIntent === 'Other' && customIntent.trim() 
      ? customIntent.trim() 
      : selectedIntent;

    try {
      const res = await fetch('/api/v1/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          supportReason: intentPayload,
          optionalContext: optionalContext.trim() || undefined,
          languagePreference,
          genderPreference
        })
      });

      const json = await res.json();
      
      setTimeout(() => {
        setIsSearching(false);
        if (json.success && json.data.matched) {
          setMatchedProvider(json.data.provider);
          setCurrentStep('PREPARATION');
        } else {
          setMatchingError(
            json.data?.message || "We haven't found the right available listener yet. You can stay here while we continue looking."
          );
        }
      }, 1500);

    } catch (err) {
      setTimeout(() => {
        setIsSearching(false);
        setMatchingError('Unable to connect to matching service. Please check your connection and try again.');
      }, 1500);
    }
  };

  // Stepper Calculation
  const getStepProgressIndex = (): number => {
    switch (currentStep) {
      case 'AGE_GATE': return 1;
      case 'INTENT': return 2;
      case 'CONTEXT': return 3;
      case 'DURATION': return 4;
      case 'REVIEW': return 5;
      case 'MATCHING': return 6;
      case 'PREPARATION': return 6;
      default: return 1;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-left selection:bg-[#123B5D]/10 selection:text-[#123B5D]">
      
      {/* Top Header & Subtle Navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-[#E3E2DE]">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#59636B] hover:text-[#17212B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Safespace</span>
        </button>

        {/* Subtle, non-intrusive progress dots */}
        <div className="flex items-center gap-1.5" aria-label="Progress">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === getStepProgressIndex()
                  ? 'w-6 bg-[#123B5D]'
                  : s < getStepProgressIndex()
                  ? 'w-2 bg-[#123B5D]/40'
                  : 'w-2 bg-[#E3E2DE]'
              }`}
            />
          ))}
        </div>

        {/* Subtle Safety Access */}
        {onOpenSafety && (
          <button
            onClick={onOpenSafety}
            className="text-xs font-semibold text-[#59636B] hover:text-[#123B5D] transition-colors cursor-pointer"
          >
            Safety
          </button>
        )}
      </div>

      {/* =========================================================================
          STEP 1: AGE ELIGIBILITY GATE (ADULTS ONLY 18+)
          ========================================================================= */}
      {currentStep === 'AGE_GATE' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E3E2DE] shadow-2xs space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-[#123B5D] uppercase">
              Eligibility
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B] leading-tight">
              Safespace is currently for adults 18 and over.
            </h1>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Before we find someone for you to talk to, please confirm your age.
            </p>
          </div>

          {!isUnder18 ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-xs text-[#17212B] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                <span>
                  Safespace provides peer human emotional listening for adults. We do not provide clinical psychiatric services or minor counseling.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep('INTENT')}
                  className="w-full py-3.5 px-6 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Yes, I'm 18 or older</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsUnder18(true)}
                  className="w-full py-3.5 px-6 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] font-semibold text-sm rounded-lg transition-colors border border-[#E3E2DE] text-center cursor-pointer"
                >
                  No, I am under 18
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-4 animate-in fade-in">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#17212B]">
                  Dedicated Support for Young People
                </h3>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  Safespace is currently limited to adults aged 18 and older. If you are under 18 and going through a difficult time, free and confidential support is available:
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#17212B]">
                <div className="p-3 bg-white rounded-lg border border-[#E3E2DE]">
                  <strong>Lagos State Youth & Child Helpline:</strong> 0800 800 8001
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E3E2DE]">
                  <strong>Child Protection Network Nigeria:</strong> +234 800 000 24453
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setIsUnder18(false)}
                  className="text-xs text-[#59636B] hover:text-[#17212B] underline cursor-pointer"
                >
                  Back to age selection
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-[#123B5D] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          STEP 2: PRIVACY-FIRST INTENT CAPTURE
          ========================================================================= */}
      {currentStep === 'INTENT' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E3E2DE] shadow-2xs space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-[#123B5D] uppercase">
              Intent
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B] leading-tight">
              What's on your mind?
            </h1>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              You don't need to have the right words. Tell us what you need from the conversation, and we'll help find someone appropriate to listen.
            </p>
            <p className="text-xs text-[#59636B] italic">
              You can share as much or as little as feels comfortable.
            </p>
          </div>

          {/* Canonical Intent Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {intentOptions.map((option) => {
              const isSelected = selectedIntent === option;
              return (
                <button
                  key={option}
                  onClick={() => setSelectedIntent(option)}
                  className={`p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF0F5] border-[#123B5D] text-[#123B5D] font-semibold ring-1 ring-[#123B5D]'
                      : 'bg-[#F3F1EC]/60 hover:bg-[#F3F1EC] border-[#E3E2DE] text-[#17212B]'
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#123B5D] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Custom Intent if "Other" selected */}
          {selectedIntent === 'Other' && (
            <div className="space-y-1.5 animate-in fade-in pt-1">
              <label className="text-xs font-bold text-[#17212B]">
                In your own words:
              </label>
              <input
                type="text"
                value={customIntent}
                onChange={(e) => setCustomIntent(e.target.value)}
                placeholder="What feels closest to what you need right now?"
                className="w-full p-3 rounded-lg border border-[#E3E2DE] text-xs sm:text-sm bg-[#FAF9F6] focus:outline-hidden focus:ring-1 focus:ring-[#123B5D]"
                maxLength={120}
              />
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-[#E3E2DE]">
            <button
              onClick={() => setCurrentStep('AGE_GATE')}
              className="px-4 py-2 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={() => setCurrentStep('CONTEXT')}
              className="px-7 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 3: OPTIONAL CONTEXT & COMFORT PREFERENCES
          ========================================================================= */}
      {currentStep === 'CONTEXT' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E3E2DE] shadow-2xs space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-[#123B5D] uppercase">
              Comfort & Context
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B] leading-tight">
              Anything else you'd like us to know?
            </h1>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Optional. Share only what you're comfortable sharing. This helps your matched listener arrive with the right presence.
            </p>
          </div>

          {/* Optional Context Field */}
          <div className="space-y-1.5">
            <textarea
              value={optionalContext}
              onChange={(e) => setOptionalContext(e.target.value)}
              placeholder="e.g., I'm processing a major work change, or I just need a quiet, unhurried space to talk."
              rows={3}
              maxLength={280}
              className="w-full p-3.5 rounded-xl border border-[#E3E2DE] text-xs sm:text-sm bg-[#FAF9F6] focus:outline-hidden focus:ring-1 focus:ring-[#123B5D] leading-relaxed resize-none"
            />
            <div className="flex justify-between text-[11px] text-[#59636B]">
              <span>Take your time. No diagnostic questions will be asked.</span>
              <span>{optionalContext.length}/280</span>
            </div>
          </div>

          {/* Language Preference */}
          <div className="space-y-2 pt-2 border-t border-[#E3E2DE]/80">
            <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block">
              Preferred Language
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguagePreference(lang)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                    languagePreference === lang
                      ? 'bg-[#123B5D] text-white border-[#123B5D]'
                      : 'bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] border-[#E3E2DE]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Comfort Preference */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block">
              Listener Preference
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'no-preference', label: 'No preference' },
                { id: 'female', label: 'Female listener' },
                { id: 'male', label: 'Male listener' }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenderPreference(g.id as any)}
                  className={`p-3 rounded-lg text-center text-xs font-semibold transition-colors border cursor-pointer ${
                    genderPreference === g.id
                      ? 'bg-[#EAF0F5] border-[#123B5D] text-[#123B5D]'
                      : 'bg-[#F3F1EC] border-[#E3E2DE] text-[#17212B] hover:bg-[#EAE7E0]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#E3E2DE]">
            <button
              onClick={() => setCurrentStep('INTENT')}
              className="px-4 py-2 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={() => setCurrentStep('DURATION')}
              className="px-7 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Choose conversation time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 4: CHOOSE CONVERSATION TIME (CANONICAL PACKAGES + FREE INTRO)
          ========================================================================= */}
      {currentStep === 'DURATION' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E3E2DE] shadow-2xs space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-[#123B5D] uppercase">
              Duration
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B] leading-tight">
              Choose your conversation time.
            </h1>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Decide how much unhurried time you would like to have available for this conversation.
            </p>
          </div>

          {/* Packages List */}
          <div className="space-y-3">
            {packages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id;
              const isFreeDisabled = pkg.isFreeTrial && safeUser.freeTrialUsed;

              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    if (!isFreeDisabled) setSelectedPackageId(pkg.id);
                  }}
                  className={`p-4 sm:p-5 rounded-xl border transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isFreeDisabled 
                      ? 'opacity-40 cursor-not-allowed bg-[#F3F1EC] border-[#E3E2DE]'
                      : isSelected 
                        ? 'bg-[#EAF0F5] border-[#123B5D] ring-1 ring-[#123B5D]' 
                        : 'bg-white hover:bg-[#F3F1EC] border-[#E3E2DE]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#17212B] text-base">{pkg.name}</span>
                      {pkg.isFreeTrial && (
                        <span className="px-2 py-0.5 rounded-md bg-[#123B5D] text-white text-[10px] font-bold uppercase tracking-wider">
                          {safeUser.freeTrialUsed ? 'Used' : 'One-time Intro'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#59636B]">{pkg.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-[#123B5D] text-lg">
                        {pkg.priceNGN === 0 ? 'Free' : `₦${pkg.priceNGN.toLocaleString()}`}
                      </div>
                      <div className="text-xs font-mono text-[#59636B]">{pkg.durationMinutes} minutes</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#123B5D] bg-[#123B5D] text-white' : 'border-[#E3E2DE]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#E3E2DE]">
            <button
              onClick={() => setCurrentStep('CONTEXT')}
              className="px-4 py-2 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={() => setCurrentStep('REVIEW')}
              className="px-7 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Review & Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 5: REVIEW BEFORE MATCHING & SESSION CREDIT NOTICE
          ========================================================================= */}
      {currentStep === 'REVIEW' && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E3E2DE] shadow-2xs space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-[#123B5D] uppercase">
              Summary
            </span>
            <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B] leading-tight">
              Ready to find a listener.
            </h1>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Review your conversation details. Once confirmed, Safespace will search for an appropriate available Provider.
            </p>
          </div>

          {/* Concise Summary Box */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-baseline border-b border-[#E3E2DE] pb-2.5">
              <span className="text-[#59636B]">Conversation Intent</span>
              <span className="font-semibold text-[#17212B] text-right max-w-xs">
                {selectedIntent === 'Other' && customIntent ? customIntent : selectedIntent}
              </span>
            </div>

            {optionalContext.trim() && (
              <div className="flex justify-between items-baseline border-b border-[#E3E2DE] pb-2.5">
                <span className="text-[#59636B]">Context Note</span>
                <span className="italic text-[#17212B] text-right max-w-xs">"{optionalContext}"</span>
              </div>
            )}

            <div className="flex justify-between items-baseline border-b border-[#E3E2DE] pb-2.5">
              <span className="text-[#59636B]">Selected Duration</span>
              <span className="font-semibold text-[#17212B]">
                {selectedPkg.name} ({selectedPkg.durationMinutes} mins)
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-base font-bold text-[#17212B]">Total</span>
              <span className="text-xl font-bold text-[#123B5D]">
                {selectedPkg.priceNGN === 0 ? 'Free' : `₦${selectedPkg.priceNGN.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Session Credit Integrity Notice */}
          {selectedPkg.priceNGN > 0 && (
            <div className="p-4 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#59636B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#17212B] leading-relaxed">
                  <strong className="font-semibold block mb-0.5">Session Credit Lifecycle:</strong>
                  Your session credit is dedicated to this conversation only. Unused minutes are extinguished upon normal session completion.
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToCreditRule}
                  onChange={(e) => setAgreedToCreditRule(e.target.checked)}
                  className="rounded border-[#E3E2DE] text-[#123B5D] focus:ring-[#123B5D] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#17212B]">
                  I understand that unused session time expires upon completion.
                </span>
              </label>
            </div>
          )}

          {/* Audio-only reassurance */}
          <div className="flex items-center gap-2 text-xs text-[#59636B]">
            <MicOff className="w-4 h-4 text-[#123B5D]" />
            <span>Audio-only conversation. No camera or video is ever used.</span>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#E3E2DE]">
            <button
              onClick={() => setCurrentStep('DURATION')}
              className="px-4 py-2 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
            >
              Go back
            </button>

            <button
              onClick={handleInitiateMatching}
              disabled={selectedPkg.priceNGN > 0 && !agreedToCreditRule}
              className={`px-8 py-3.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                selectedPkg.priceNGN > 0 && !agreedToCreditRule
                  ? 'bg-[#E3E2DE] text-[#7E8890] cursor-not-allowed'
                  : 'bg-[#123B5D] hover:bg-[#0D2A42] text-white shadow-xs'
              }`}
            >
              <span>Find someone to talk to</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 6: MATCHING STATE / SERVICE-LED DISPATCH
          ========================================================================= */}
      {currentStep === 'MATCHING' && (
        <div className="bg-white rounded-2xl p-8 sm:p-14 border border-[#E3E2DE] text-center space-y-6 shadow-2xs animate-in fade-in duration-200">
          
          {isSearching && (
            <div className="py-8 space-y-6">
              <div className="flex justify-center">
                <SafespaceLogo size="xl" showWordmark={false} className="animate-pulse" />
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B] tracking-tight">
                  Finding someone to talk to.
                </h2>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  We're looking for an available Provider who can give you the time and attention you've asked for.
                </p>
              </div>

              <div className="pt-2 text-xs text-[#59636B]">
                <span>Looking for an available listener...</span>
              </div>
            </div>
          )}

          {!isSearching && matchingError && (
            <div className="py-6 space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#8C1D18] flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display font-normal text-2xl sm:text-3xl text-[#17212B]">
                  Still looking.
                </h3>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  {matchingError}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  onClick={handleInitiateMatching}
                  className="px-6 py-3 bg-[#123B5D] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#0D2A42] transition-colors cursor-pointer"
                >
                  Keep waiting
                </button>
                <button
                  onClick={() => setCurrentStep('CONTEXT')}
                  className="px-6 py-3 bg-[#F3F1EC] text-[#17212B] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#EAE7E0] transition-colors border border-[#E3E2DE] cursor-pointer"
                >
                  Adjust preferences
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          STEP 7: MATCHED & SESSION PREPARATION
          ========================================================================= */}
      {currentStep === 'PREPARATION' && matchedProvider && (
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E3E2DE] space-y-6 shadow-2xs text-center animate-in zoom-in-95 duration-200">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EAF0F5] text-[#123B5D] text-xs font-semibold mx-auto">
            <Check className="w-3.5 h-3.5 text-[#123B5D]" />
            <span>Someone is ready to listen</span>
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B]">
              You're about to enter a private audio conversation.
            </h2>
            <p className="text-xs sm:text-sm text-[#59636B]">
              Take a breath. You don't need to prepare anything. Just talk.
            </p>
          </div>

          {/* Approved Limited Provider Information */}
          <div className="bg-[#F3F1EC] rounded-xl p-5 sm:p-6 border border-[#E3E2DE] max-w-md mx-auto text-left space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={matchedProvider.avatarUrl}
                alt={matchedProvider.displayName}
                className="w-14 h-14 rounded-full object-cover border border-[#E3E2DE]"
              />
              <div>
                <h3 className="text-lg font-bold text-[#17212B]">
                  {matchedProvider.displayName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-[#123B5D]">Verified Safespace Provider</span>
                </div>
                <p className="text-[11px] text-[#59636B] mt-0.5">
                  Languages: {matchedProvider.languages.join(', ')}
                </p>
              </div>
            </div>

            {matchedProvider.bio && (
              <p className="text-xs text-[#59636B] leading-relaxed italic border-t border-[#E3E2DE] pt-3">
                "{matchedProvider.bio}"
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-[#59636B] pt-1">
              <span>Session: <strong>{selectedPkg.name} ({selectedPkg.durationMinutes}m)</strong></span>
              <span className="font-bold text-[#123B5D]">
                {selectedPkg.priceNGN === 0 ? 'Free' : `₦${selectedPkg.priceNGN.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Audio Confirmation Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#59636B]">
            <MicOff className="w-4 h-4 text-[#123B5D]" />
            <span>Audio only • No camera • Private connection</span>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onStartSession(selectedPkg.id, matchedProvider.id, 'flutterwave')}
              className="w-full sm:w-auto px-8 py-4 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-bold text-sm sm:text-base rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Enter conversation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3.5 text-[#59636B] hover:text-[#17212B] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
