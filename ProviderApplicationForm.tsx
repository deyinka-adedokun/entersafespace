import React, { useState } from 'react';
import { ProviderApplication, MaxSessionDuration } from '../../types';
import { SafespaceLogo } from '../ui/SafespaceLogo';
import { 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  FileText, 
  Lock, 
  Heart,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface ProviderApplicationFormProps {
  initialApplication?: ProviderApplication | null;
  onSubmitted: (application: ProviderApplication) => void;
  onCancel: () => void;
}

export const ProviderApplicationForm: React.FC<ProviderApplicationFormProps> = ({
  initialApplication,
  onSubmitted,
  onCancel
}) => {
  // Step index: 0 = Intro & Eligibility, 1 = About You, 2 = Experience, 3 = Listening & Availability, 4 = Identity & Screening, 5 = Safeguarding & Conduct, 6 = Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [isOver18, setIsOver18] = useState<boolean>(initialApplication?.isOver18 ?? false);
  const [underageError, setUnderageError] = useState<boolean>(false);

  // Step 1: About You
  const [legalName, setLegalName] = useState<string>(initialApplication?.legalName || '');
  const [displayName, setDisplayName] = useState<string>(initialApplication?.displayName || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(initialApplication?.dateOfBirth || '');
  const [email, setEmail] = useState<string>(initialApplication?.email || '');
  const [phone, setPhone] = useState<string>(initialApplication?.phone || '');
  const [location, setLocation] = useState<string>(initialApplication?.location || 'Lagos, Nigeria');
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(
    initialApplication?.preferredLanguages || ['English']
  );

  // Step 2: Experience
  const [bioIntroduction, setBioIntroduction] = useState<string>(initialApplication?.bioIntroduction || '');
  const [listeningExperience, setListeningExperience] = useState<string>(initialApplication?.listeningExperience || '');
  const [hasSupportExperience, setHasSupportExperience] = useState<boolean>(initialApplication?.hasSupportExperience ?? false);
  const [supportExperienceDetails, setSupportExperienceDetails] = useState<string>(initialApplication?.supportExperienceDetails || '');
  const [educationBackground, setEducationBackground] = useState<string>(initialApplication?.educationBackground || '');
  const [certifications, setCertifications] = useState<string>(initialApplication?.certifications || '');

  // Step 3: Listening & Availability
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(
    initialApplication?.languagesSpoken || ['English']
  );
  const [maxDurationCapability, setMaxDurationCapability] = useState<MaxSessionDuration>(
    initialApplication?.maxDurationCapability || 60
  );
  const [weeklyAvailabilityWindows, setWeeklyAvailabilityWindows] = useState<string[]>(
    initialApplication?.weeklyAvailabilityWindows || ['Weekday Evenings (6pm - 10pm)']
  );

  // Step 4: Identity & Screening
  const [identityDocumentType, setIdentityDocumentType] = useState<string>(
    initialApplication?.identityDocumentType || 'National Identification Number (NIN)'
  );
  const [identityDocumentFile, setIdentityDocumentFile] = useState<File | null>(null);
  const [identityDocumentFileName, setIdentityDocumentFileName] = useState<string | null>(
    initialApplication?.identityDocumentFileName || null
  );
  const [isUploadingId, setIsUploadingId] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [acknowledgesIdentityVerification, setAcknowledgesIdentityVerification] = useState<boolean>(true);
  const [acknowledgesBackgroundScreening, setAcknowledgesBackgroundScreening] = useState<boolean>(true);

  // Step 5: Safeguarding & Code of Conduct
  const [acknowledgesSafeguarding, setAcknowledgesSafeguarding] = useState<boolean>(false);
  const [acknowledgesNonClinicalBoundary, setAcknowledgesNonClinicalBoundary] = useState<boolean>(false);
  const [codeOfConductAccepted, setCodeOfConductAccepted] = useState<boolean>(
    initialApplication?.codeOfConductAccepted ?? false
  );

  // Available language choices
  const availableLanguages = [
    'English',
    'Nigerian Pidgin',
    'Yoruba',
    'Igbo',
    'Hausa',
    'French',
    'Other'
  ];

  // Available availability windows
  const availabilityOptions = [
    'Weekday Mornings (8am - 12pm)',
    'Weekday Afternoons (12pm - 5pm)',
    'Weekday Evenings (6pm - 10pm)',
    'Weekday Nights (10pm - 2am)',
    'Weekend Mornings (8am - 12pm)',
    'Weekend Afternoons (12pm - 6pm)',
    'Weekend Evenings (6pm - 11pm)'
  ];

  const toggleLanguage = (lang: string) => {
    if (languagesSpoken.includes(lang)) {
      if (languagesSpoken.length > 1) {
        setLanguagesSpoken(languagesSpoken.filter(l => l !== lang));
      }
    } else {
      setLanguagesSpoken([...languagesSpoken, lang]);
    }
  };

  const toggleAvailabilityWindow = (window: string) => {
    if (weeklyAvailabilityWindows.includes(window)) {
      if (weeklyAvailabilityWindows.length > 1) {
        setWeeklyAvailabilityWindows(weeklyAvailabilityWindows.filter(w => w !== window));
      }
    } else {
      setWeeklyAvailabilityWindows([...weeklyAvailabilityWindows, window]);
    }
  };

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 0) {
      if (!isOver18) {
        setUnderageError(true);
        setErrorMessage('Safespace Providers must be 18 years or older to apply.');
        return false;
      }
      setUnderageError(false);
      return true;
    }

    if (step === 1) {
      if (!legalName.trim()) {
        setErrorMessage('Please provide your legal full name.');
        return false;
      }
      if (!displayName.trim()) {
        setErrorMessage('Please provide your preferred display name.');
        return false;
      }
      if (!dateOfBirth) {
        setErrorMessage('Please provide your date of birth.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please provide a valid email address.');
        return false;
      }
      if (!phone.trim()) {
        setErrorMessage('Please provide a contact phone number.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!bioIntroduction.trim()) {
        setErrorMessage('Please provide a brief introduction about yourself.');
        return false;
      }
      if (!listeningExperience.trim()) {
        setErrorMessage('Please describe your experience listening to or supporting others.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (languagesSpoken.length === 0) {
        setErrorMessage('Please select at least one language you can listen in.');
        return false;
      }
      if (weeklyAvailabilityWindows.length === 0) {
        setErrorMessage('Please select at least one typical availability window.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!identityDocumentFileName) {
        setErrorMessage('Please upload a photo or scan of your identity document.');
        return false;
      }
      if (!acknowledgesIdentityVerification || !acknowledgesBackgroundScreening) {
        setErrorMessage('Please confirm acknowledgment of required identity verification and background screening.');
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (!acknowledgesSafeguarding || !acknowledgesNonClinicalBoundary || !codeOfConductAccepted) {
        setErrorMessage('Please review and accept all safeguarding obligations and the Provider Code of Conduct.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Application
  const handleSubmit = async () => {
    if (!validateStep(5)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: Partial<ProviderApplication> = {
      legalName,
      displayName,
      dateOfBirth,
      email,
      phone,
      location,
      preferredLanguages,
      bioIntroduction,
      listeningExperience,
      hasSupportExperience,
      supportExperienceDetails,
      educationBackground,
      certifications,
      languagesSpoken,
      maxDurationCapability,
      weeklyAvailabilityWindows,
      isOver18: true,
      identityDocumentType,
      codeOfConductAccepted: true
    };

    try {
      const res = await fetch('/api/v1/providers/application/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data?.application) {
        onSubmitted(json.data.application);
      } else {
        setErrorMessage(json.error?.message || 'Failed to submit application. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMessage('Network error during submission. Please check your connection.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentityDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPG, PNG, WEBP, or PDF file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File is too large. Please upload something under 8MB.');
      return;
    }

    setUploadError(null);
    setIsUploadingId(true);
    setIdentityDocumentFile(file);

    try {
      const formData = new FormData();
      formData.append('identityDocument', file);

      const res = await fetch('/api/v1/providers/application/upload-id', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();

      if (json.success) {
        setIdentityDocumentFileName(json.data.fileName);
      } else {
        setUploadError(json.error?.message || 'Upload failed. Please try again.');
        setIdentityDocumentFile(null);
      }
    } catch (err) {
      setUploadError('Network error while uploading. Please check your connection and try again.');
      setIdentityDocumentFile(null);
    } finally {
      setIsUploadingId(false);
    }
  };

  const stepTitles = [
    'Eligibility & Introduction',
    'About You',
    'Experience & Background',
    'Listening Capability',
    'Identity & Verification',
    'Safeguarding & Conduct',
    'Review & Submit'
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17212B] flex flex-col justify-between selection:bg-[#123B5D]/10 selection:text-[#123B5D] animate-in fade-in duration-200">
      
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-[#E3E2DE]">
        <SafespaceLogo size="sm" showWordmark={true} />
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-[#59636B] hover:text-[#17212B] transition-colors cursor-pointer"
        >
          Exit Application
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8 text-left">
        
        {/* Progress Indicator (Steps 1 to 6) */}
        {currentStep > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#59636B]">
              <span>Step 0{currentStep} of 06 — {stepTitles[currentStep]}</span>
              <span>{Math.round((currentStep / 6) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E3E2DE] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#123B5D] transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F9C9C7] flex items-start gap-3 text-xs text-[#8C1D18] animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* =========================================================================
            STEP 00: INTRO & 18+ ELIGIBILITY STATEMENT (Section 5 & 6)
            ========================================================================= */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F3F1EC] border border-[#E3E2DE] text-[11px] font-bold text-[#123B5D] uppercase tracking-wider">
                Provider Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17212B] tracking-tight">
                Become a Safespace Provider
              </h1>
              <p className="font-display italic text-lg sm:text-xl text-[#59636B]">
                "Some people are good at making space for others."
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4 text-xs sm:text-sm text-[#59636B] leading-relaxed">
              <p>
                <strong>Safespace Providers</strong> are carefully selected people who offer their time and undivided human attention to people who need someone to talk to.
              </p>
              
              <div className="p-3.5 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-xs text-[#17212B] space-y-1">
                <span className="font-bold block text-[#123B5D]">Non-Clinical Boundary</span>
                <span>
                  Safespace is a human listening service, not a clinical therapy service. Providers are not therapists unless separately qualified and authorised to represent themselves as such.
                </span>
              </div>

              <p className="text-xs">
                Becoming a Provider is selective and involves identity verification, background screening, an assessment interview, and safeguarding training.
              </p>
            </div>

            {/* Eligibility Gate: 18+ Rule */}
            <div className="p-5 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#123B5D] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#17212B]">Eligibility Requirement</h3>
                  <p className="text-xs text-[#59636B] mt-0.5">
                    Safespace Providers must be 18 years of age or older.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E3E2DE] bg-[#FAF9F6] hover:bg-[#F3F1EC] cursor-pointer transition-colors text-xs font-medium text-[#17212B]">
                <input
                  type="checkbox"
                  checked={isOver18}
                  onChange={(e) => {
                    setIsOver18(e.target.checked);
                    if (e.target.checked) setUnderageError(false);
                  }}
                  className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] cursor-pointer"
                />
                <span>I confirm that I am 18 years of age or older.</span>
              </label>

              {underageError && (
                <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F9C9C7] text-xs text-[#8C1D18]">
                  Only individuals 18 and older are eligible to apply as Safespace Providers.
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isOver18}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Start Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 01: ABOUT YOU (Section 9)
            ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                01 About You
              </h2>
              <p className="text-xs text-[#59636B]">
                Basic details to establish your identity and applicant profile.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Legal Full Name <span className="text-[#8C1D18]">*</span>
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="As shown on official ID"
                    className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Preferred / Display Name <span className="text-[#8C1D18]">*</span>
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="First name or preferred alias"
                    className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Date of Birth <span className="text-[#8C1D18]">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Location / City <span className="text-[#8C1D18]">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Email Address <span className="text-[#8C1D18]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Phone Number <span className="text-[#8C1D18]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 ..."
                    className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                  />
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 02: EXPERIENCE (Section 10 & 11)
            ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                02 Your Experience
              </h2>
              <p className="text-xs text-[#59636B]">
                Tell us about your background listening to and supporting others.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">
                  Tell us a little about yourself <span className="text-[#8C1D18]">*</span>
                </label>
                <textarea
                  value={bioIntroduction}
                  onChange={(e) => setBioIntroduction(e.target.value)}
                  placeholder="Share a concise introduction about who you are, your disposition, and why you wish to offer your time as a listener..."
                  rows={3}
                  className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">
                  What experience do you have listening or supporting others? <span className="text-[#8C1D18]">*</span>
                </label>
                <textarea
                  value={listeningExperience}
                  onChange={(e) => setListeningExperience(e.target.value)}
                  placeholder="Describe your life experience, community involvement, peer support, or professional background in listening attentively..."
                  rows={3}
                  className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E3E2DE]/60">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={hasSupportExperience}
                    onChange={(e) => setHasSupportExperience(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] cursor-pointer"
                  />
                  <span>I have previously worked or volunteered in a people-facing support role</span>
                </label>

                {hasSupportExperience && (
                  <div className="space-y-1.5 pl-7">
                    <input
                      type="text"
                      value={supportExperienceDetails}
                      onChange={(e) => setSupportExperienceDetails(e.target.value)}
                      placeholder="Brief details (organisation, role, duration)"
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E3E2DE] rounded-lg text-xs focus:ring-1 focus:ring-[#123B5D]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E3E2DE]/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Education Background <span className="text-[#59636B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={educationBackground}
                    onChange={(e) => setEducationBackground(e.target.value)}
                    placeholder="e.g. B.Sc. Sociology, Diploma, etc."
                    className="w-full p-2.5 bg-white border border-[#E3E2DE] rounded-xl text-xs focus:ring-1 focus:ring-[#123B5D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212B] block">
                    Certifications / Training <span className="text-[#59636B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g. Active Listening, First Aid, etc."
                    className="w-full p-2.5 bg-white border border-[#E3E2DE] rounded-xl text-xs focus:ring-1 focus:ring-[#123B5D]"
                  />
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Capability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 03: LISTENING CAPABILITY & AVAILABILITY (Section 12 & 13)
            ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                03 Listening Capability & Availability
              </h2>
              <p className="text-xs text-[#59636B]">
                Help us understand how and when you can provide attentive presence.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-5">
              
              {/* Languages */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#17212B] block">
                  Languages you can listen in fluently <span className="text-[#8C1D18]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => {
                    const isSelected = languagesSpoken.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#123B5D] border-[#123B5D] text-white'
                            : 'bg-[#FAF9F6] border-[#E3E2DE] text-[#17212B] hover:bg-[#F3F1EC]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Continuous Duration Capability */}
              <div className="space-y-2 pt-2 border-t border-[#E3E2DE]/60">
                <label className="text-xs font-semibold text-[#17212B] block">
                  Maximum continuous listening duration <span className="text-[#8C1D18]">*</span>
                </label>
                <p className="text-[11px] text-[#59636B]">
                  Select the maximum single conversation duration you are comfortable maintaining continuous, focused attention for.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {([15, 30, 60, 90] as MaxSessionDuration[]).map((dur) => {
                    const isSelected = maxDurationCapability === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setMaxDurationCapability(dur)}
                        className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#123B5D] bg-[#EAF0F5] text-[#123B5D] font-bold'
                            : 'border-[#E3E2DE] bg-white hover:bg-[#FAF9F6] text-[#17212B]'
                        }`}
                      >
                        <span className="text-sm block">{dur} mins</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typical Availability Windows */}
              <div className="space-y-2 pt-2 border-t border-[#E3E2DE]/60">
                <label className="text-xs font-semibold text-[#17212B] block">
                  Typical availability windows <span className="text-[#8C1D18]">*</span>
                </label>
                <p className="text-[11px] text-[#59636B]">
                  Indicate when you generally anticipate having quiet, undisturbed time.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {availabilityOptions.map((opt) => {
                    const isSelected = weeklyAvailabilityWindows.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleAvailabilityWindow(opt)}
                        className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#123B5D] bg-[#EAF0F5] text-[#123B5D]'
                            : 'border-[#E3E2DE] bg-white hover:bg-[#FAF9F6] text-[#17212B]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#123B5D]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explicit Boundary Notice: No active toggle for applicants */}
              <div className="p-3 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-xs text-[#59636B] leading-relaxed">
                <strong>Note:</strong> This records your potential capacity for matching purposes. Live availability toggles (Available / Away / Offline) are strictly enabled only after final approval.
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 04: IDENTITY VERIFICATION & SCREENING (Section 14 & 15)
            ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                04 Identity & Eligibility
              </h2>
              <p className="text-xs text-[#59636B]">
                Safespace protects all participants through structured identity verification.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">
                  Identity Document Type
                </label>
                <select
                  value={identityDocumentType}
                  onChange={(e) => setIdentityDocumentType(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E3E2DE] rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-[#123B5D] focus:outline-hidden"
                >
                  <option value="National Identification Number (NIN)">National Identification Number (NIN)</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Voter's Card">Voter's Card</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212B] block">
                  Upload Your Identity Document
                </label>
                <p className="text-[11px] text-[#59636B]">
                  A clear photo or scan of the document type selected above. JPG, PNG, or PDF, under 8MB.
                </p>

                <label
                  htmlFor="identity-document-upload"
                  className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center
                    ${identityDocumentFileName ? 'border-[#123B5D] bg-[#F3F1EC]' : 'border-[#E3E2DE] bg-white hover:bg-[#FAF9F6]'}`}
                >
                  <input
                    id="identity-document-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    onChange={handleIdentityDocumentSelect}
                    disabled={isUploadingId}
                  />
                  {isUploadingId ? (
                    <span className="text-xs font-semibold text-[#59636B]">Uploading…</span>
                  ) : identityDocumentFileName ? (
                    <>
                      <Check className="w-5 h-5 text-[#123B5D]" />
                      <span className="text-xs font-semibold text-[#17212B]">
                        {identityDocumentFile?.name || 'Document uploaded'}
                      </span>
                      <span className="text-[11px] text-[#59636B] underline">Click to replace</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 text-[#59636B]" />
                      <span className="text-xs font-semibold text-[#17212B]">Click to select a file</span>
                    </>
                  )}
                </label>

                {uploadError && (
                  <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-2 text-xs text-[#59636B] leading-relaxed">
                <h4 className="font-bold text-[#17212B]">Verification Procedure</h4>
                <p>
                  Our team reviews uploaded documents as part of your application review. You may be invited to complete an additional secure digital identity check to confirm authenticity.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E3E2DE] bg-white hover:bg-[#FAF9F6] cursor-pointer text-xs text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={acknowledgesIdentityVerification}
                    onChange={(e) => setAcknowledgesIdentityVerification(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] mt-0.5"
                  />
                  <span>
                    I understand that I will be required to verify my government-issued identity before being approved.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E3E2DE] bg-white hover:bg-[#FAF9F6] cursor-pointer text-xs text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={acknowledgesBackgroundScreening}
                    onChange={(e) => setAcknowledgesBackgroundScreening(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] mt-0.5"
                  />
                  <span>
                    I consent to standard background and risk screening conducted in accordance with Safespace trust policies.
                  </span>
                </label>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Safeguarding</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 05: SAFEGUARDING & CODE OF CONDUCT (Section 16 & 20)
            ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                05 Safeguarding & Conduct
              </h2>
              <p className="text-xs text-[#59636B]">
                Safeguarding is a non-negotiable core responsibility of every Safespace Provider.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4">
              
              <div className="space-y-3 text-xs text-[#59636B] leading-relaxed">
                <h4 className="text-sm font-bold text-[#17212B]">Provider Safeguarding Commitments</h4>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Maintain attentive, uninterrupted human presence without multi-tasking.</li>
                  <li>Maintain strict emotional, personal, and professional boundaries.</li>
                  <li>Never exchange personal phone numbers, social media handles, or financial accounts with Seekers.</li>
                  <li>Recognise safeguarding concerns (self-harm, domestic danger, abuse) and follow escalation procedures.</li>
                  <li>End conversations safely and calmly if boundaries or safety are violated.</li>
                  <li>Complete all required Safespace Safeguarding & Platform training modules prior to taking sessions.</li>
                </ul>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E3E2DE]/60">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E3E2DE] bg-white hover:bg-[#FAF9F6] cursor-pointer text-xs text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={acknowledgesSafeguarding}
                    onChange={(e) => setAcknowledgesSafeguarding(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] mt-0.5"
                  />
                  <span>
                    I understand and agree to adhere strictly to Safespace Safeguarding protocols and reporting procedures.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E3E2DE] bg-white hover:bg-[#FAF9F6] cursor-pointer text-xs text-[#17212B]">
                  <input
                    type="checkbox"
                    checked={acknowledgesNonClinicalBoundary}
                    onChange={(e) => setAcknowledgesNonClinicalBoundary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] mt-0.5"
                  />
                  <span>
                    I understand that Safespace is a peer listening platform. I will not offer clinical diagnoses, psychiatric prescriptions, or therapeutic treatments.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-[#123B5D]/30 bg-[#EAF0F5]/50 hover:bg-[#EAF0F5] cursor-pointer text-xs text-[#123B5D] font-semibold">
                  <input
                    type="checkbox"
                    checked={codeOfConductAccepted}
                    onChange={(e) => setCodeOfConductAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123B5D] focus:ring-[#123B5D] mt-0.5"
                  />
                  <span>
                    I have reviewed and agree to uphold the Safespace Provider Code of Conduct in all interactions.
                  </span>
                </label>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Review Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 06: REVIEW & SUBMIT (Section 21)
            ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
                06 Review & Submit
              </h2>
              <p className="text-xs text-[#59636B]">
                Please review your application summary before final submission.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-5 text-xs">
              
              {/* Summary Block 1 */}
              <div className="space-y-2 pb-3 border-b border-[#E3E2DE]/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#123B5D]">
                    Identity & Contact
                  </span>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-[#59636B] hover:text-[#123B5D] underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-[#59636B]">Legal Name:</span> <span className="font-semibold text-[#17212B]">{legalName}</span></div>
                  <div><span className="text-[#59636B]">Display Name:</span> <span className="font-semibold text-[#17212B]">{displayName}</span></div>
                  <div><span className="text-[#59636B]">Email:</span> <span className="font-semibold text-[#17212B]">{email}</span></div>
                  <div><span className="text-[#59636B]">Location:</span> <span className="font-semibold text-[#17212B]">{location}</span></div>
                </div>
              </div>

              {/* Summary Block 2 */}
              <div className="space-y-2 pb-3 border-b border-[#E3E2DE]/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#123B5D]">
                    Capability & Languages
                  </span>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-[#59636B] hover:text-[#123B5D] underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-1">
                  <div><span className="text-[#59636B]">Languages:</span> <span className="font-semibold text-[#17212B]">{languagesSpoken.join(', ')}</span></div>
                  <div><span className="text-[#59636B]">Continuous Duration:</span> <span className="font-semibold text-[#17212B]">{maxDurationCapability} minutes</span></div>
                  <div><span className="text-[#59636B]">Availability Windows:</span> <span className="font-semibold text-[#17212B]">{weeklyAvailabilityWindows.join('; ')}</span></div>
                </div>
              </div>

              {/* Summary Block 3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#123B5D]">
                    Declarations & Conduct
                  </span>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="text-xs text-[#59636B] hover:text-[#123B5D] underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-xs text-[#59636B]">
                  <div className="flex items-center gap-1.5 text-[#1E6B43]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Age eligibility (18+) confirmed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1E6B43]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Identity verification & screening acknowledged</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1E6B43]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Safeguarding commitments & non-clinical boundaries acknowledged</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1E6B43]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Safespace Provider Code of Conduct accepted</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-3.5 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-xs text-[#59636B] leading-relaxed">
              By submitting your application, you initiate the Safespace screening process. We will review your profile and invite you to complete identity verification and training.
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-[#59636B] hover:text-[#17212B] cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[#7E8890] border-t border-[#E3E2DE]/40">
        Safespace • Responsible human emotional support network
      </footer>

    </div>
  );
};
