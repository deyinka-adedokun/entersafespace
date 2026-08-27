import React, { useEffect, useState, useCallback } from 'react';
import { ProviderApplication, ProviderProfile, User } from '../../types';
import { ProviderApplicationForm } from './ProviderApplicationForm';
import { ApplicantStatusView } from './ApplicantStatusView';
import { ProviderRestrictedStatusView } from './ProviderRestrictedStatusView';
import { Loader2 } from 'lucide-react';

interface ProviderOnboardingJourneyProps {
  currentUser?: User;
  onApproved: () => void;
  onExit: () => void;
}

export const ProviderOnboardingJourney: React.FC<ProviderOnboardingJourneyProps> = ({
  currentUser,
  onApproved,
  onExit
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [application, setApplication] = useState<ProviderApplication | null>(null);
  const [isApprovedProvider, setIsApprovedProvider] = useState<boolean>(false);
  const [lifecycleStatus, setLifecycleStatus] = useState<string>('DRAFT');

  const fetchApplicationStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/providers/application/status');
      const json = await res.json();
      if (json.success && json.data) {
        setApplication(json.data.application || null);
        setIsApprovedProvider(Boolean(json.data.isApprovedProvider));
        setLifecycleStatus(json.data.lifecycleStatus || 'DRAFT');

        if (json.data.isApprovedProvider && (json.data.lifecycleStatus === 'APPROVED' || json.data.lifecycleStatus === 'PROBATION')) {
          onApproved();
        }
      }
    } catch (err) {
      console.error('Failed to load provider application status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onApproved]);

  useEffect(() => {
    fetchApplicationStatus();
  }, [fetchApplicationStatus]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 text-[#123B5D] animate-spin" />
        <span className="text-xs text-[#59636B] font-medium">Checking application status...</span>
      </div>
    );
  }

  // Handle Restricted / Suspended statuses
  if (['RESTRICTED', 'SUSPENDED', 'REMOVED'].includes(lifecycleStatus)) {
    return (
      <ProviderRestrictedStatusView
        status={lifecycleStatus}
        onExit={onExit}
      />
    );
  }

  // Handle In-Review / Submitted / Training / Interview statuses
  if (
    application &&
    ['SUBMITTED', 'SCREENING', 'INTERVIEW', 'TRAINING', 'PENDING_APPROVAL'].includes(application.status)
  ) {
    return (
      <ApplicantStatusView
        application={application}
        currentUser={currentUser}
        onRefresh={fetchApplicationStatus}
        onExit={onExit}
        onApproved={onApproved}
      />
    );
  }

  // Default to Application Form (Draft or New)
  return (
    <ProviderApplicationForm
      initialApplication={application}
      onSubmitted={(submittedApp) => {
        setApplication(submittedApp);
        setLifecycleStatus('SUBMITTED');
      }}
      onCancel={onExit}
    />
  );
};
