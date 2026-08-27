import React, { useState } from 'react';
import { ProviderApplication, User } from '../../types';
import { SafespaceLogo } from '../ui/SafespaceLogo';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  Mail,
  ChevronDown,
  ChevronUp,
  Shield,
  HelpCircle,
  Sparkles,
  Lock
} from 'lucide-react';

interface ApplicantStatusViewProps {
  application: ProviderApplication;
  currentUser?: User;
  onRefresh: () => void;
  onExit: () => void;
  onApproved: () => void;
}

export const ApplicantStatusView: React.FC<ApplicantStatusViewProps> = ({
  application,
  currentUser,
  onRefresh,
  onExit,
  onApproved
}) => {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showDevControls, setShowDevControls] = useState<boolean>(false);
  const [devError, setDevError] = useState<string | null>(null);

  // Check if active user has Super Admin or Reviewer privileges for testing
  const isSuperAdminOrReviewer = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'SAFETY_REVIEWER';

  const advanceStageAsReviewer = async (action: string) => {
    setIsSimulating(true);
    setDevError(null);
    try {
      const res = await fetch('/api/v1/providers/application/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId: application.id,
          action 
        })
      });
      const json = await res.json();
      if (json.success) {
        if (action === 'APPROVE_PROVIDER') {
          onApproved();
        } else {
          onRefresh();
        }
      } else {
        setDevError(json.error?.message || 'Failed to advance stage');
      }
    } catch (err: any) {
      console.error('Error advancing application stage:', err);
      setDevError(err.message || 'Network error advancing stage');
    } finally {
      setIsSimulating(false);
    }
  };

  // 7 Backend-Authoritative Lifecycle Steps
  const steps = [
    {
      id: '01',
      title: 'Application Received',
      description: 'Your application details have been safely received by the Safespace onboarding team.',
      status: 'COMPLETED' as const,
      detail: 'Received',
      timestamp: application.submittedAt || application.createdAt
    },
    {
      id: '02',
      title: 'Identity Verification',
      description: 'Verification of government-issued identification to establish verified human presence.',
      status: application.identityVerificationStatus === 'VERIFIED' 
        ? 'COMPLETED' 
        : (application.identityVerificationStatus === 'IN_REVIEW' ? 'IN_PROGRESS' : 'PENDING'),
      detail: application.identityVerificationStatus === 'VERIFIED' 
        ? 'Verified' 
        : (application.identityVerificationStatus === 'ADDITIONAL_INFO_REQUIRED' ? 'Action Required' : 'In Review')
    },
    {
      id: '03',
      title: 'Eligibility Screening',
      description: 'Review of eligibility requirements, emotional availability, and trust history.',
      status: application.backgroundScreeningStatus === 'PASSED'
        ? 'COMPLETED'
        : (application.backgroundScreeningStatus === 'IN_PROGRESS' || application.status === 'SCREENING' ? 'IN_PROGRESS' : 'PENDING'),
      detail: application.backgroundScreeningStatus === 'PASSED' ? 'Passed' : (application.status === 'SCREENING' ? 'In Progress' : 'Pending')
    },
    {
      id: '04',
      title: 'Assessment Interview',
      description: 'Conversational alignment and listening assessment interview with a Safespace Reviewer.',
      status: application.assessmentStatus === 'COMPLETED'
        ? 'COMPLETED'
        : (application.assessmentStatus === 'SCHEDULED' || application.status === 'INTERVIEW' ? 'IN_PROGRESS' : 'PENDING'),
      detail: application.assessmentStatus === 'COMPLETED' 
        ? 'Completed' 
        : (application.assessmentStatus === 'SCHEDULED' ? 'Scheduled' : (application.status === 'INTERVIEW' ? 'Scheduling' : 'Upcoming'))
    },
    {
      id: '05',
      title: 'Safeguarding Training',
      description: 'Mandatory modules on emotional boundaries, distress de-escalation, and safeguarding protocol.',
      status: application.safeguardingTrainingStatus === 'COMPLETED'
        ? 'COMPLETED'
        : (application.safeguardingTrainingStatus === 'IN_PROGRESS' || application.status === 'TRAINING' ? 'IN_PROGRESS' : 'PENDING'),
      detail: application.safeguardingTrainingStatus === 'COMPLETED' 
        ? 'Certified' 
        : (application.safeguardingTrainingStatus === 'IN_PROGRESS' ? 'In Progress' : 'Required')
    },
    {
      id: '06',
      title: 'Platform Training',
      description: 'Familiarisation with audio room controls, session notes, and provider ethics.',
      status: application.platformTrainingStatus === 'COMPLETED'
        ? 'COMPLETED'
        : (application.platformTrainingStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING'),
      detail: application.platformTrainingStatus === 'COMPLETED' ? 'Completed' : 'Upcoming'
    },
    {
      id: '07',
      title: 'Final Approval',
      description: 'Formal activation of verified Safespace Provider credentials and matching availability.',
      status: application.status === 'APPROVED' || application.status === 'PROBATION'
        ? 'COMPLETED'
        : 'PENDING',
      detail: application.status === 'APPROVED' ? 'Approved' : (application.status === 'PROBATION' ? 'Probation' : 'Pending Review')
    }
  ];

  const isActionRequired = application.identityVerificationStatus === 'ADDITIONAL_INFO_REQUIRED';
  const completedCount = steps.filter(s => s.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17212B] flex flex-col justify-between selection:bg-[#123B5D]/10 selection:text-[#123B5D] animate-in fade-in duration-200">
      
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-[#E3E2DE]">
        <SafespaceLogo size="sm" showWordmark={true} />
        <button
          onClick={onExit}
          className="text-xs font-semibold text-[#59636B] hover:text-[#17212B] transition-colors cursor-pointer"
        >
          Return to Home
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8 text-left">
        
        {/* Status Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F3F1EC] border border-[#E3E2DE] text-[11px] font-bold text-[#123B5D] uppercase tracking-wider">
            Applicant Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17212B] tracking-tight font-serif">
            Your Safespace Provider Application
          </h1>
          <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
            Application submitted. Thank you. We'll review your application and guide you through the next steps.
          </p>
        </div>

        {/* Current State Reassurance Banner */}
        <div className={`p-5 rounded-2xl border shadow-2xs space-y-2 ${
          isActionRequired
            ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
            : 'bg-white border-[#E3E2DE] text-[#17212B]'
        }`}>
          <div className="flex items-start gap-3">
            {isActionRequired ? (
              <AlertCircle className="w-5 h-5 text-[#D92D20] shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-[#123B5D] shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold">
                {isActionRequired ? 'Action Required on Your Application' : 'Nothing is required from you right now.'}
              </h3>
              <p className="text-xs text-[#59636B] leading-relaxed">
                {isActionRequired
                  ? 'Please review your email for specific requests from the onboarding team.'
                  : 'Our safeguarding team conducts thorough reviews of each applicant. We will notify you via email as each stage progresses.'}
              </p>
            </div>
          </div>
        </div>

        {/* Structured Lifecycle Progress Roadmap (7 Authoritative Steps) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Onboarding & Review Roadmap
            </h3>
            <span className="text-xs text-[#59636B] font-medium">
              Stage {completedCount} of {steps.length} Complete
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isDone = step.status === 'COMPLETED';
              const isInProg = step.status === 'IN_PROGRESS';

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-white border-[#E3E2DE] shadow-2xs'
                      : isInProg
                      ? 'bg-[#EAF0F5]/50 border-[#123B5D]/40 shadow-xs ring-1 ring-[#123B5D]/20'
                      : 'bg-[#FAF9F6] border-[#E3E2DE]/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-[#1E6B43] text-white'
                          : isInProg
                          ? 'bg-[#123B5D] text-white animate-pulse'
                          : 'bg-[#E3E2DE] text-[#59636B]'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#17212B]">
                            {step.title}
                          </h4>
                          {step.detail && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isDone 
                                ? 'bg-[#EBFDF2] text-[#1E6B43]' 
                                : (isInProg ? 'bg-[#EAF0F5] text-[#123B5D]' : 'bg-[#F3F1EC] text-[#59636B]')
                            }`}>
                              {step.detail}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#59636B] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Applicant Details Summary Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-3 text-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
            Submitted Application Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#59636B]">
            <div>Applicant Name: <span className="font-semibold text-[#17212B]">{application.displayName}</span></div>
            <div>Email: <span className="font-semibold text-[#17212B]">{application.email}</span></div>
            <div>Languages: <span className="font-semibold text-[#17212B]">{application.languagesSpoken?.join(', ')}</span></div>
            <div>Max Duration: <span className="font-semibold text-[#17212B]">{application.maxDurationCapability} minutes</span></div>
          </div>
        </div>

        {/* Support & Contact Guidance */}
        <div className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-xs text-[#59636B] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#123B5D] shrink-0" />
            <span>Have questions or updates regarding your application?</span>
          </div>
          <a
            href="mailto:trust-safety@safespace.ng"
            className="text-xs font-bold text-[#123B5D] hover:underline shrink-0"
          >
            Contact Safety Team
          </a>
        </div>

        {/* Strictly Isolated Reviewer Testing Controls — Rendered ONLY for Super Admins in Development/Testing */}
        {isSuperAdminOrReviewer && (
          <div className="p-4 rounded-2xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-3">
            <button
              onClick={() => setShowDevControls(!showDevControls)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-[#123B5D] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Super Admin Testing Controls (Isolated Dev Environment)</span>
              </div>
              {showDevControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDevControls && (
              <div className="pt-2 border-t border-[#E3E2DE] space-y-3 text-xs animate-in fade-in duration-150">
                <p className="text-[11px] text-[#59636B]">
                  These backend-authoritative controls are only visible to authenticated Super Admins to simulate pipeline progression during development. They are inaccessible to ordinary applicants.
                </p>

                {devError && (
                  <div className="p-2 rounded bg-rose-50 text-rose-800 text-[11px] border border-rose-200">
                    {devError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => advanceStageAsReviewer('VERIFY_IDENTITY')}
                    disabled={isSimulating || application.identityVerificationStatus === 'VERIFIED'}
                    className="p-2 rounded bg-white border border-[#E3E2DE] hover:bg-[#FAF9F6] disabled:opacity-50 text-left font-medium text-[#17212B] cursor-pointer"
                  >
                    1. Verify Identity (ID Check)
                  </button>

                  <button
                    onClick={() => advanceStageAsReviewer('PASS_SCREENING')}
                    disabled={isSimulating || application.backgroundScreeningStatus === 'PASSED'}
                    className="p-2 rounded bg-white border border-[#E3E2DE] hover:bg-[#FAF9F6] disabled:opacity-50 text-left font-medium text-[#17212B] cursor-pointer"
                  >
                    2. Pass Screening & Schedule Call
                  </button>

                  <button
                    onClick={() => advanceStageAsReviewer('COMPLETE_ASSESSMENT')}
                    disabled={isSimulating || application.assessmentStatus === 'COMPLETED'}
                    className="p-2 rounded bg-white border border-[#E3E2DE] hover:bg-[#FAF9F6] disabled:opacity-50 text-left font-medium text-[#17212B] cursor-pointer"
                  >
                    3. Complete Assessment Interview
                  </button>

                  <button
                    onClick={() => advanceStageAsReviewer('COMPLETE_TRAINING')}
                    disabled={isSimulating || application.safeguardingTrainingStatus === 'COMPLETED'}
                    className="p-2 rounded bg-white border border-[#E3E2DE] hover:bg-[#FAF9F6] disabled:opacity-50 text-left font-medium text-[#17212B] cursor-pointer"
                  >
                    4. Complete Training Modules
                  </button>
                </div>

                <button
                  onClick={() => advanceStageAsReviewer('APPROVE_PROVIDER')}
                  disabled={isSimulating}
                  className="w-full py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve & Activate Provider Account</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[#7E8890] border-t border-[#E3E2DE]/40">
        Safespace • Human emotional support network
      </footer>

    </div>
  );
};
