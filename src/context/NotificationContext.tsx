import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SafespaceNotificationType, SafespaceNotificationItem, NotificationPreferences } from '../types';

interface NotificationContextType {
  // Notifications
  notifications: SafespaceNotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => void;
  triggerNotification: (type: SafespaceNotificationType, customBody?: string, customTitle?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  requestPushPermission: () => Promise<boolean>;
  pushPermissionState: NotificationPermission | 'unsupported';

  // PWA Installability
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;

  // Offline / Network Recovery
  isOnline: boolean;
  wasOffline: boolean;
  dismissNetworkToast: () => void;

  // SW Update Detection
  hasSwUpdate: boolean;
  applySwUpdate: () => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabledCategories: {
    MATCH_FOUND: true,
    SESSION_REMINDER: true,
    SESSION_ENDING: true,
    PAYMENT_SUCCESS: true,
    PAYMENT_FAILED: true,
    GIFT_RECEIVED: true,
    PROVIDER_REQUEST: true,
    PROVIDER_SESSION: true,
    PAYOUT: true,
    SAFETY_ALERT: true
  },
  pushNotificationsEnabled: true,
  soundEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  frequencyCapping: 'STANDARD'
};

const NOTIFICATION_TEMPLATES: Record<SafespaceNotificationType, { title: string; defaultBody: string; actionUrl: string }> = {
  MATCH_FOUND: {
    title: 'Listener Connected!',
    defaultBody: 'Your matched peer listener Sarah is waiting for you in the active session.',
    actionUrl: '/?action=session'
  },
  SESSION_REMINDER: {
    title: 'Session Starting Soon',
    defaultBody: 'Your 30-minute emotional support conversation starts in 5 minutes.',
    actionUrl: '/?tab=SESSIONS'
  },
  SESSION_ENDING: {
    title: 'Session Ending Notice',
    defaultBody: '2 minutes remaining in your active session. Wrap up or tap to add time.',
    actionUrl: '/?action=session'
  },
  PAYMENT_SUCCESS: {
    title: 'Payment Confirmed',
    defaultBody: '₦2,500 successfully charged. Deep Relief 30-minute package activated.',
    actionUrl: '/?tab=SESSIONS'
  },
  PAYMENT_FAILED: {
    title: 'Payment Unsuccessful',
    defaultBody: 'Unable to process transaction with bank. Please check your card or retry.',
    actionUrl: '/?tab=GIFT'
  },
  GIFT_RECEIVED: {
    title: 'Gift Voucher Received! 🎁',
    defaultBody: 'A friend granted you a complimentary Safespace 30-minute conversation voucher.',
    actionUrl: '/?tab=GIFT'
  },
  PROVIDER_REQUEST: {
    title: 'New Seeker Support Request',
    defaultBody: 'A support seeker is waiting for a peer listener match in Anxiety & Stress.',
    actionUrl: '/?tab=LISTENER'
  },
  PROVIDER_SESSION: {
    title: 'Listener Session Alert',
    defaultBody: 'Your scheduled listener session with seeker Emma is starting now.',
    actionUrl: '/?tab=LISTENER'
  },
  PAYOUT: {
    title: 'Bank Payout Disbursed',
    defaultBody: '₦12,500 transferred to your GTBank account (***4892). Status: Settled.',
    actionUrl: '/?tab=LISTENER'
  },
  SAFETY_ALERT: {
    title: 'Safeguarding Notice 🛡️',
    defaultBody: 'Safespace Trust & Safety update: Crisis helpline resources are available 24/7.',
    actionUrl: '/?action=emergency'
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('safespace_notification_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PREFERENCES;
  });

  // 2. Notification Items State (Initial seed for instant evaluation)
  const [notifications, setNotifications] = useState<SafespaceNotificationItem[]>(() => {
    const saved = localStorage.getItem('safespace_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'notif-1',
        type: 'MATCH_FOUND',
        title: NOTIFICATION_TEMPLATES.MATCH_FOUND.title,
        body: NOTIFICATION_TEMPLATES.MATCH_FOUND.defaultBody,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        actionUrl: NOTIFICATION_TEMPLATES.MATCH_FOUND.actionUrl
      },
      {
        id: 'notif-2',
        type: 'PAYMENT_SUCCESS',
        title: NOTIFICATION_TEMPLATES.PAYMENT_SUCCESS.title,
        body: NOTIFICATION_TEMPLATES.PAYMENT_SUCCESS.defaultBody,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        actionUrl: NOTIFICATION_TEMPLATES.PAYMENT_SUCCESS.actionUrl
      },
      {
        id: 'notif-3',
        type: 'SAFETY_ALERT',
        title: NOTIFICATION_TEMPLATES.SAFETY_ALERT.title,
        body: NOTIFICATION_TEMPLATES.SAFETY_ALERT.defaultBody,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        actionUrl: NOTIFICATION_TEMPLATES.SAFETY_ALERT.actionUrl
      }
    ];
  });

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('safespace_notifications', JSON.stringify(notifications.slice(0, 30)));
  }, [notifications]);

  // Save preferences to localStorage
  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        ...newPrefs,
        enabledCategories: {
          ...prev.enabledCategories,
          ...(newPrefs.enabledCategories || {})
        }
      };
      localStorage.setItem('safespace_notification_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  // Push Permission State
  const [pushPermissionState, setPushPermissionState] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPushPermissionState(result);
        if (result === 'granted') {
          updatePreferences({ pushNotificationsEnabled: true });
          return true;
        }
      } catch (e) {
        console.error('Error requesting notification permission:', e);
      }
    }
    return false;
  };

  // Audio Chime Synthesizer (Zero-dependency Web Audio API sound for low-end devices)
  const playGentleChime = () => {
    if (!preferences.soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.6);
    } catch (e) {
      // Audio context may be restricted by browser policy before user interaction
    }
  };

  // Anti-Spam & Quiet Hours Evaluation
  const lastTriggerTimesRef = React.useRef<Record<string, number>>({});
  const dailyCountRef = React.useRef<number>(0);

  const triggerNotification = (type: SafespaceNotificationType, customBody?: string, customTitle?: string) => {
    // 1. Check if category is enabled
    if (!preferences.enabledCategories[type]) {
      console.log(`Notification category ${type} is disabled in preferences.`);
      return;
    }

    // 2. Quiet Hours check (except for emergency SAFETY_ALERT)
    if (preferences.quietHoursEnabled && type !== 'SAFETY_ALERT') {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [sH, sM] = preferences.quietHoursStart.split(':').map(Number);
      const [eH, eM] = preferences.quietHoursEnd.split(':').map(Number);
      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;

      const isQuiet = startMinutes > endMinutes 
        ? (currentMinutes >= startMinutes || currentMinutes < endMinutes)
        : (currentMinutes >= startMinutes && currentMinutes < endMinutes);

      if (isQuiet) {
        console.log(`Notification suppressed due to Quiet Hours (${preferences.quietHoursStart} - ${preferences.quietHoursEnd})`);
        return;
      }
    }

    // 3. Frequency Capping & Anti-Spam Duplicate Guard
    const nowTs = Date.now();
    const lastTs = lastTriggerTimesRef.current[type] || 0;
    if (nowTs - lastTs < 8000) { // 8 second duplicate suppression
      console.warn(`Anti-spam: Duplicate notification ${type} suppressed.`);
      return;
    }

    if (preferences.frequencyCapping === 'STRICT' && dailyCountRef.current >= 5) {
      console.warn('Anti-spam: Strict frequency limit (5/day) reached.');
      return;
    } else if (preferences.frequencyCapping === 'STANDARD' && dailyCountRef.current >= 15) {
      console.warn('Anti-spam: Standard frequency limit (15/day) reached.');
      return;
    }

    lastTriggerTimesRef.current[type] = nowTs;
    dailyCountRef.current += 1;

    // 4. Create Notification Payload
    const tmpl = NOTIFICATION_TEMPLATES[type];
    const newNotif: SafespaceNotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title: customTitle || tmpl.title,
      body: customBody || tmpl.defaultBody,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: tmpl.actionUrl
    };

    setNotifications(prev => [newNotif, ...prev]);

    // 5. Sound Chime
    playGentleChime();

    // 6. Browser Native Push Notification
    if (
      preferences.pushNotificationsEnabled &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(newNotif.title, {
          body: newNotif.body,
          icon: '/pwa-192.png',
          badge: '/pwa-192.png'
        });
      } catch (e) {
        console.error('Error showing browser notification', e);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ==================== PWA INSTALLABILITY ====================
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Safespace on your device, tap your browser menu (⋮ or Share) and select "Add to Home screen" or "Install App".');
    }
  };

  // ==================== OFFLINE / NETWORK RECOVERY ====================
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismissNetworkToast = () => setWasOffline(false);

  // ==================== SW UPDATE DETECTION ====================
  const [hasSwUpdate, setHasSwUpdate] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;

        if (reg.waiting) {
          setHasSwUpdate(true);
          setWaitingWorker(reg.waiting);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasSwUpdate(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });
      });
    }
  }, []);

  const applySwUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        updatePreferences,
        triggerNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        requestPushPermission,
        pushPermissionState,
        isInstallable,
        isInstalled,
        promptInstall,
        isOnline,
        wasOffline,
        dismissNetworkToast,
        hasSwUpdate,
        applySwUpdate
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
