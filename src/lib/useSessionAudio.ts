import { useCallback, useEffect, useRef, useState } from 'react';
// livekit-client is loaded only when a call starts, to keep the first page load small.
import type { Room, RemoteTrack } from 'livekit-client';
import { reportClientProblem } from './clientLog';

// Live audio for one conversation, over LiveKit. Both the seeker's call
// screen and the listener's dashboard use this. The server issues a pass for
// the caller's own session only, limited to publishing the microphone.

export type SessionAudioStatus =
  | 'IDLE'              // not started (e.g. listener hasn't pressed Join)
  | 'CONNECTING'
  | 'WAITING'           // we're in; the other person hasn't joined yet
  | 'CONNECTED'         // both people are in the conversation
  | 'RECONNECTING'
  | 'DISCONNECTED'
  | 'MIC_BLOCKED'       // browser/microphone permission refused
  | 'NOT_CONFIGURED'    // server has no LiveKit credentials yet
  | 'ERROR';

// Android in-app browsers (a link opened inside another app) often can't make
// audio calls; their user agent contains "; wv)".
export const isInAppBrowser = () => typeof navigator !== 'undefined' && /; wv\)/.test(navigator.userAgent);
const IN_APP_HINT = ' If you opened Safespace from inside another app, please open entersafespace.com in Chrome instead.';

export function useSessionAudio(sessionId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<SessionAudioStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  const [speakerOn, setSpeakerOnState] = useState(true);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [otherSpeaking, setOtherSpeaking] = useState(false);
  const [selfSpeaking, setSelfSpeaking] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const audioElements = useRef<HTMLMediaElement[]>([]);
  const speakerOnRef = useRef(true);

  const refreshPresence = useCallback((room: Room) => {
    setStatus(room.remoteParticipants.size > 0 ? 'CONNECTED' : 'WAITING');
  }, []);

  useEffect(() => {
    if (!sessionId || !enabled) return;
    let cancelled = false;
    let room: Room | null = null;

    const setUp = (lk: typeof import('livekit-client')) => {
      const { RoomEvent, Track } = lk;
      room = new lk.Room({
        audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      roomRef.current = room;
      const r = room;

      r
        .on(RoomEvent.ParticipantConnected, () => refreshPresence(r))
        .on(RoomEvent.ParticipantDisconnected, () => refreshPresence(r))
        .on(RoomEvent.Reconnecting, () => setStatus('RECONNECTING'))
        .on(RoomEvent.Reconnected, () => refreshPresence(r))
        .on(RoomEvent.Disconnected, reason => {
          if (!cancelled) {
            setStatus('DISCONNECTED');
            reportClientProblem('audio-disconnected', `reason ${String(reason)}`, undefined, sessionId);
          }
        })
        .on(RoomEvent.MediaDevicesError, (e: Error) => reportClientProblem('audio-device', e.message, e.name, sessionId))
        .on(RoomEvent.AudioPlaybackStatusChanged, () => setNeedsAudioUnlock(!r.canPlaybackAudio))
        .on(RoomEvent.ActiveSpeakersChanged, speakers => {
          setSelfSpeaking(speakers.some(p => p.identity === r.localParticipant.identity));
          setOtherSpeaking(speakers.some(p => p.identity !== r.localParticipant.identity));
        })
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind !== Track.Kind.Audio) return;
          const el = track.attach();
          el.muted = !speakerOnRef.current;
          el.style.display = 'none';
          document.body.appendChild(el);
          audioElements.current.push(el);
        })
        .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach().forEach(el => {
            el.remove();
            audioElements.current = audioElements.current.filter(a => a !== el);
          });
        });
      return r;
    };

    (async () => {
      setStatus('CONNECTING');
      setError(null);
      try {
        const lk = await import('livekit-client');
        if (cancelled) return;
        const room = setUp(lk);
        const res = await fetch(`/api/v1/sessions/${sessionId}/audio-token`, { method: 'POST' });
        const json = await res.json();
        if (cancelled) return;
        if (!json.success) {
          setStatus(json.error?.code === 'AUDIO_NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'ERROR');
          setError(json.error?.message || 'Could not start audio.');
          reportClientProblem('audio-token', json.error?.code || 'no token', json.error?.message, sessionId);
          return;
        }
        try {
          await room.connect(json.data.url, json.data.token);
        } catch (connectErr) {
          const msg = connectErr instanceof Error ? connectErr.message : String(connectErr);
          // Includes LiveKit's reason, e.g. an invalid key/secret or an unreachable URL.
          reportClientProblem('audio-connect', msg, `url host ${String(json.data.url).replace(/^wss?:\/\//, '').split('/')[0]}`, sessionId);
          throw connectErr;
        }
        if (cancelled) return;
        refreshPresence(room);
        setNeedsAudioUnlock(!room.canPlaybackAudio);
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch (micErr) {
          reportClientProblem('audio-microphone', micErr instanceof Error ? `${micErr.name}: ${micErr.message}` : String(micErr), undefined, sessionId);
          setStatus('MIC_BLOCKED');
          setError('Safespace needs your microphone. Please allow microphone access in your browser and try again.' + (isInAppBrowser() ? IN_APP_HINT : ''));
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('ERROR');
          setError('Could not connect the audio. Please check your connection.' + (isInAppBrowser() ? IN_APP_HINT : ''));
        }
      }
    })();

    return () => {
      cancelled = true;
      room?.disconnect();
      audioElements.current.forEach(el => el.remove());
      audioElements.current = [];
      roomRef.current = null;
    };
  }, [sessionId, enabled, refreshPresence, attempt]);

  const setMuted = useCallback(async (next: boolean) => {
    setMutedState(next);
    await roomRef.current?.localParticipant.setMicrophoneEnabled(!next).catch(() => undefined);
  }, []);

  // Web browsers can't switch between earpiece and loudspeaker, so this turns
  // the other person's audio on or off.
  const setSpeakerOn = useCallback((next: boolean) => {
    speakerOnRef.current = next;
    setSpeakerOnState(next);
    audioElements.current.forEach(el => { el.muted = !next; });
  }, []);

  // Browsers block audio playback until the person interacts with the page.
  const unlockAudio = useCallback(async () => {
    await roomRef.current?.startAudio().catch(() => undefined);
    setNeedsAudioUnlock(!(roomRef.current?.canPlaybackAudio ?? true));
  }, []);

  // Start the connection again (after a failure or a blocked microphone).
  const retry = useCallback(() => setAttempt(a => a + 1), []);

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
  }, []);

  return { status, error, muted, setMuted, speakerOn, setSpeakerOn, needsAudioUnlock, unlockAudio, otherSpeaking, selfSpeaking, retry, disconnect };
}
