import React, { useEffect, useState } from 'react';
import { User, UserRole, Session, ProviderProfile } from './types';
import { ToastProvider } from './components/ui/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { EmergencyModal } from './components/EmergencyModal';
import { HomeView } from './components/HomeView';
import { HowItWorksView } from './components/how-it-works/HowItWorksView';
import { SafetyTrustView } from './components/safety/SafetyTrustView';
import { ForProvidersView } from './components/providers/ForProvidersView';
import { SessionsView } from './components/SessionsView';
import { ProfileView } from './components/ProfileView';
import { SupportRequestFlow } from './components/SupportRequestFlow';
import { ActiveSessionView } from './components/ActiveSessionView';
import { FeedbackView } from './components/FeedbackView';
import { GiftView } from './components/GiftView';
import { ProviderView } from './components/ProviderView';
import { ProviderOnboardingJourney } from './components/providers/ProviderOnboardingJourney';
import { AdminView } from './components/AdminView';
import { SafetyReportModal } from './components/SafetyReportModal';
import { Footer } from './components/Footer';
import { PublicInfoModal, PublicInfoTopic } from './components/PublicInfoModal';
import { PwaBanners } from './components/PwaBanners';
import { NotificationModal } from './components/NotificationModal';
import { CallProvider, useCall } from './context/CallContext';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, refreshSession, openAuthModal } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('HOME');
  const [viewState, setViewState] = useState<'IDLE' | 'REQUESTING' | 'SESSION' | 'FEEDBACK'>('IDLE');

  // Fallback default user if user is null
  const currentUser: User = user || {
    id: 'guest-seeker',
    email: 'guest@safespace.ng',
    displayName: 'Guest Seeker',
    role: 'SUPPORT_SEEKER',
    status: 'ACTIVE',
    freeTrialUsed: false,
    createdAt: new Date().toISOString()
  };

  const [preferredProvider, setPreferredProvider] = useState<ProviderProfile | null>(null);

  // Active session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Modals
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isSafetyReportOpen, setIsSafetyReportOpen] = useState<boolean>(false);
  const [isPublicInfoOpen, setIsPublicInfoOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [publicInfoTopic, setPublicInfoTopic] = useState<PublicInfoTopic>('PRIVACY_BY_DESIGN');


  const call = useCall();
  const isListenerRole = currentUser.role === 'PROVIDER' || currentUser.role === 'SUPER_ADMIN';

  // Opened from a call alert on the phone (?open=listener), or the alert was
  // tapped while Safespace was already open: go straight to the dashboard,
  // where the call rings.
  const openListenerDashboard = () => {
    setViewState(v => (v === 'SESSION' ? v : 'IDLE'));
    setCurrentTab('LISTENER');
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('open') === 'listener') {
      openListenerDashboard();
      params.delete('open');
      const rest = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash);
    }
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SAFESPACE_OPEN_LISTENER') openListenerDashboard();
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, []);

  // Listeners get their calls wherever they are in Safespace: when a call
  // starts ringing, the dashboard (with the ringing screen) opens. The
  // dashboard polls for itself while it's open. This also tells matching
  // that the listener is online.
  const onListenerTab = currentTab === 'LISTENER' && viewState === 'IDLE';
  useEffect(() => {
    if (!isAuthenticated || !isListenerRole || onListenerTab) return;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch('/api/v1/providers/active-session');
        if (res.status === 404) { stopped = true; return; } // no listener profile
        const json = await res.json();
        if (!stopped && json.data?.session?.status === 'CONNECTING') openListenerDashboard();
      } catch {
        // Try again on the next tick.
      }
    };
    void check();
    const timer = window.setInterval(() => { if (!stopped) void check(); }, 2000);
    const onVisible = () => { if (document.visibilityState === 'visible' && !stopped) void check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, isListenerRole, onListenerTab]);

  // A seeker whose page was reloaded or closed mid-call comes straight back
  // to it (the conversation is still running on the server).
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/v1/sessions/current')
      .then(res => res.json())
      .then(json => {
        const s = json?.data?.session;
        if (s && (s.status === 'ACTIVE' || s.status === 'CONNECTING')) {
          setActiveSessionId(s.id);
          setActiveSession(s);
          setViewState('SESSION');
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated, user?.id]);

  // "You're in a conversation" bar, shown when the call's screen isn't.
  const callScreenOpen = viewState === 'SESSION' || (isListenerRole && onListenerTab);
  const showInCallBar = call.sessionId !== null && !callScreenOpen;
  const returnToCall = () => {
    if (activeSessionId && call.sessionId === activeSessionId) setViewState('SESSION');
    else openListenerDashboard();
    window.scrollTo({ top: 0 });
  };

  const handleOpenPublicInfo = (topic: PublicInfoTopic) => {
    setPublicInfoTopic(topic);
    setIsPublicInfoOpen(true);
  };

  // Initial Sync
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          if (json.data.preferredRebookProvider) setPreferredProvider(json.data.preferredRebookProvider);
        }
      })
      .catch(err => console.error('Failed to sync user session', err));
  }, []);

  // Trigger matching flow from Home CTA
  const handleStartRequestFlow = () => {
    // Requests are tied to the signed-in account, so ask visitors to sign in first.
    if (!isAuthenticated) {
      openAuthModal('LOGIN');
      return;
    }
    setViewState('REQUESTING');
  };

  // Called when provider is matched and user clicks "Start talking now"
  const handleStartSession = async (packageId: string, providerId: string, paymentMethod?: string) => {
    try {
      const res = await fetch('/api/v1/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, providerId, paymentMethod })
      });
      const json = await res.json();
      if (json.success && json.data?.session) {
        setActiveSessionId(json.data.session.id);
        setActiveSession(json.data.session);
        setViewState('SESSION');
      } else {
        alert(json.error?.message || 'Failed to start session. Please try again.');
      }
    } catch (err) {
      alert('Unable to connect session. Please check network.');
    }
  };

  // Called when session completes
  const handleSessionEnded = () => {
    setActiveSession(null);
    setViewState('FEEDBACK');
  };

  // Rebook same listener
  const handleRebookSameProvider = () => {
    setViewState('REQUESTING');
  };

  // Return to clean home
  const handleFeedbackDone = () => {
    setActiveSessionId(null);
    setActiveSession(null);
    setViewState('IDLE');
    setCurrentTab('HOME');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17212B] font-sans flex flex-col selection:bg-[#123B5D]/10 selection:text-[#123B5D]">
      
      {/* PWA Floating Status Banners (Offline, SW Update, Install Banner) */}
      <PwaBanners />

      {showInCallBar && (
        <button
          onClick={returnToCall}
          className="sticky top-0 z-50 w-full bg-[#123B5D] text-white text-sm font-semibold px-4 py-2.5 flex items-center justify-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
          <span>You're in a conversation · Return to call</span>
        </button>
      )}

      {/* Primary Top Navbar (Hidden during active in-session conversation) */}
      {viewState !== 'SESSION' && (
        <Navbar
          currentUser={currentUser}
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
          }}
          activeSession={activeSession}
          onOpenActiveSession={() => setViewState('SESSION')}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onStartTalk={handleStartRequestFlow}
        />
      )}

      {/* Main Content Area */}
      <main className={viewState === 'SESSION' ? 'flex-1 min-h-screen' : 'flex-1 pb-24 pt-0'}>
        
        {/* Render View depending on Active Flow State */}
        {viewState === 'REQUESTING' ? (
          <SupportRequestFlow
            currentUser={currentUser}
            onCancel={() => setViewState('IDLE')}
            onStartSession={handleStartSession}
            preferredProvider={preferredProvider}
            onOpenSafety={() => setIsEmergencyOpen(true)}
          />
        ) : viewState === 'SESSION' && activeSessionId ? (
          <ActiveSessionView
            sessionId={activeSessionId}
            onSessionEnded={handleSessionEnded}
            onFindAnotherListener={() => {
              setActiveSessionId(null);
              setActiveSession(null);
              setViewState('REQUESTING');
            }}
            onCallCancelled={() => {
              setActiveSessionId(null);
              setActiveSession(null);
              setViewState('IDLE');
            }}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            currentUserRole={currentUser?.role}
          />
        ) : viewState === 'FEEDBACK' ? (
          <FeedbackView
            sessionId={activeSessionId || undefined}
            onDone={handleFeedbackDone}
            onHaveAnotherConversation={() => setViewState('REQUESTING')}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenSafetyReport={() => setIsSafetyReportOpen(true)}
          />
        ) : (
          /* Primary Navigation Tabs */
          <>
            {currentTab === 'HOME' && (
              <HomeView
                currentUser={currentUser}
                onStartTalk={handleStartRequestFlow}
                onQuickRebook={handleStartRequestFlow}
                preferredProvider={preferredProvider}
                onOpenHowItWorks={() => {
                  setCurrentTab('HOW_IT_WORKS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBecomeProvider={() => {
                  setCurrentTab('FOR_PROVIDERS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSafety={() => {
                  setCurrentTab('SAFETY');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'HOW_IT_WORKS' && (
              <HowItWorksView
                onStartTalk={handleStartRequestFlow}
                onTryIntro={handleStartRequestFlow}
                onBecomeProvider={() => {
                  setCurrentTab('FOR_PROVIDERS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSafety={() => {
                  setCurrentTab('SAFETY');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'FOR_PROVIDERS' && (
              <ForProvidersView
                isListener={currentUser?.role === 'PROVIDER' || currentUser?.role === 'SUPER_ADMIN'}
                onBecomeProvider={() => {
                  setCurrentTab('LISTENER');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenHowItWorks={() => {
                  setCurrentTab('HOW_IT_WORKS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSafety={() => {
                  setCurrentTab('SAFETY');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'SAFETY' && (
              <SafetyTrustView
                onStartTalk={handleStartRequestFlow}
                onOpenHowItWorks={() => {
                  setCurrentTab('HOW_IT_WORKS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenCrisisModal={() => setIsEmergencyOpen(true)}
                onOpenReportModal={() => setIsSafetyReportOpen(true)}
                onBecomeProvider={() => {
                  setCurrentTab('LISTENER');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'SESSIONS' && (
              <SessionsView
                onStartNewSession={handleStartRequestFlow}
              />
            )}

            {currentTab === 'GIFT' && (
              <GiftView />
            )}

            {currentTab === 'PROFILE' && (
              <ProfileView
                currentUser={currentUser}
                preferredProvider={preferredProvider}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {currentTab === 'LISTENER' && (
              currentUser?.role === 'PROVIDER' || currentUser?.role === 'SUPER_ADMIN' ? (
                <ProviderView />
              ) : (
                <ProviderOnboardingJourney
                  currentUser={currentUser}
                  onApproved={() => {
                    refreshSession();
                  }}
                  onExit={() => {
                    setCurrentTab('HOME');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )
            )}

            {currentTab === 'ADMIN' && (
              <ProtectedRoute allowedRoles={['ADMIN', 'SAFETY_REVIEWER', 'CONTENT_EDITOR', 'SUPER_ADMIN']}>
                <AdminView />
              </ProtectedRoute>
            )}
          </>
        )}

        {/* Global Footer Architecture */}
        {viewState === 'IDLE' && (
          <Footer
            onOpenPublicInfo={handleOpenPublicInfo}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenSafetyReport={() => setIsSafetyReportOpen(true)}
            onStartTalk={handleStartRequestFlow}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Global Bottom Navigation Bar (Shown only for authenticated users) */}
      {viewState === 'IDLE' && isAuthenticated && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />
      )}

      {/* Auth Modal Component */}
      <AuthModal />

      {/* Emergency Distress & Crisis Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Trust & Safety Incident Report Modal */}
      <SafetyReportModal
        isOpen={isSafetyReportOpen}
        sessionId={activeSessionId || undefined}
        onClose={() => setIsSafetyReportOpen(false)}
      />

      {/* Public Policy & Privacy by Design Modal */}
      <PublicInfoModal
        isOpen={isPublicInfoOpen}
        initialTopic={publicInfoTopic}
        onClose={() => setIsPublicInfoOpen(false)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenReportConcern={() => setIsSafetyReportOpen(true)}
        onStartTalk={handleStartRequestFlow}
      />

      {/* Notifications & Preferences Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <CallProvider>
            <AppContent />
          </CallProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
};


export default App;