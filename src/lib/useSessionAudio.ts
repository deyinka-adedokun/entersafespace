import { useCallback, useEffect, useRef, useState } from 'react';
// livekit-client is loaded only when a call starts, to keep the first page load small.
import type { Room, RemoteTrack } from 'livekit-client';

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

export function useSessionAudio(sessionId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<SessionAudioStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  const [speakerOn, setSpeakerOnState] = useState(true);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [otherSpeaking, setOtherSpeaking] = useState(false);
  const [selfSpeaking, setSelfSpeaking] = useState(false);

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
        .on(RoomEvent.Disconnected, () => { if (!cancelled) setStatus('DISCONNECTED'); })
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
          return;
        }
        await room.connect(json.data.url, json.data.token);
        if (cancelled) return;
        refreshPresence(room);
        setNeedsAudioUnlock(!room.canPlaybackAudio);
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch (micErr) {
          setStatus('MIC_BLOCKED');
          setError('Safespace needs your microphone. Please allow microphone access in your browser and try again.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('ERROR');
          setError('Could not connect the audio. Please check your connection.');
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
  }, [sessionId, enabled, refreshPresence]);

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

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
  }, []);

  return { status, error, muted, setMuted, speakerOn, setSpeakerOn, needsAudioUnlock, unlockAudio, otherSpeaking, selfSpeaking, disconnect };
}
