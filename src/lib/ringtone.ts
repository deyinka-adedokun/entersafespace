// Incoming-call ringtone (listener) and calling tone (seeker), generated with
// the Web Audio API so there is nothing extra to download. Browsers only allow
// sound after the person has interacted with the page, so the audio context is
// unlocked on their first tap or key press.

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

// Call once at start-up: resumes audio on the first interaction.
export function unlockAudioOnFirstGesture() {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    const c = getContext();
    c?.resume().catch(() => undefined);
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

function tone(c: AudioContext, freqs: number[], start: number, length: number, volume: number) {
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.02);
  gain.gain.setValueAtTime(volume, start + length - 0.05);
  gain.gain.linearRampToValueAtTime(0, start + length);
  gain.connect(c.destination);
  freqs.forEach(f => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, start);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + length);
  });
}

type Pattern = 'incoming' | 'calling';

/**
 * Starts a repeating ring. Returns a function that stops it.
 * 'incoming' is the listener's ring (two bursts, louder, with vibration);
 * 'calling' is the softer tone the seeker hears while waiting.
 */
export function startRinging(pattern: Pattern): () => void {
  const c = getContext();
  let stopped = false;

  const ringOnce = () => {
    if (stopped) return;
    if (c) {
      c.resume().catch(() => undefined);
      const now = c.currentTime + 0.05;
      if (pattern === 'incoming') {
        tone(c, [440, 480], now, 0.4, 0.22);
        tone(c, [440, 480], now + 0.6, 0.4, 0.22);
      } else {
        tone(c, [440, 480], now, 1.0, 0.08);
      }
    }
    if (pattern === 'incoming') {
      try { navigator.vibrate?.([500, 250, 500]); } catch { /* not supported */ }
    }
  };

  ringOnce();
  const interval = window.setInterval(ringOnce, pattern === 'incoming' ? 2500 : 3000);
  return () => {
    stopped = true;
    window.clearInterval(interval);
    try { navigator.vibrate?.(0); } catch { /* not supported */ }
  };
}
