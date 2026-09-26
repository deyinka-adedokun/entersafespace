import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSessionAudio } from '../lib/useSessionAudio';
import { useNotifications } from './NotificationContext';

// The live call's audio belongs to the whole app, not to one screen, so moving
// to another page (the listener opening their profile, say) doesn't hang up
// on the other person. A screen joins a call with join(sessionId); the audio
// stays up until leave() is called or the server says the conversation is over.

type CallAudio = ReturnType<typeof useSessionAudio>;

interface CallContextType {
  // The session whose audio is up, or null.
  sessionId: string | null;
  audio: CallAudio;
  join: (sessionId: string) => void;
  leave: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const audio = useSessionAudio(sessionId, sessionId !== null);

  const join = useCallback((id: string) => setSessionId(id), []);
  const leave = useCallback(() => setSessionId(null), []);
  const { alertLiveSession } = useNotifications();
  const alertRef = useRef(alertLiveSession);
  alertRef.current = alertLiveSession;
  const sessionIdRef = useRef<string | null>(null);
  sessionIdRef.current = sessionId;

  // The call screens normally notice the end first and leave themselves. If
  // neither is open, hang up here and still tell the person.
  const endedElsewhere = (id: string) => {
    window.setTimeout(() => {
      if (sessionIdRef.current !== id) return;
      setSessionId(null);
      alertRef.current('PROVIDER_SESSION', 'The conversation has ended', 'The call was ended or its time ran out.');
    }, 1500);
  };

  // Safety net for when no call screen is open: hang up as soon as the server
  // says the conversation has ended (time up, or the other person ended it).
  const checkRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    if (!sessionId) return;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/v1/sessions/${sessionId}`);
        if (res.status === 404 || res.status === 403) {
          if (!stopped) setSessionId(null);
          return;
        }
        const json = await res.json();
        const status = json?.data?.session?.status;
        if (!stopped && status && status !== 'ACTIVE') endedElsewhere(sessionId);
      } catch {
        // Offline for a moment; the next check will tell.
      }
    };
    checkRef.current = () => { void check(); };
    const timer = window.setInterval(check, 5000);
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      checkRef.current = () => undefined;
    };
  }, [sessionId]);

  // The room closing or the other person leaving usually means the call ended.
  useEffect(() => {
    if (audio.status === 'DISCONNECTED' || audio.status === 'WAITING') checkRef.current();
  }, [audio.status]);

  return (
    <CallContext.Provider value={{ sessionId, audio, join, leave }}>
      {children}
    </CallContext.Provider>
  );
};

export function useCall(): CallContextType {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used inside CallProvider');
  return ctx;
}
