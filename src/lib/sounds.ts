/* ─── Sound effects for HeartSync using Web Audio API ─── */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Ascending happy tone sequence
  setTimeout(() => playTone(523.25, 0.15, "sine", 0.12), 0);    // C5
  setTimeout(() => playTone(659.25, 0.15, "sine", 0.12), 100);  // E5
  setTimeout(() => playTone(783.99, 0.25, "sine", 0.12), 200);  // G5
  setTimeout(() => playTone(1046.5, 0.4, "sine", 0.1), 300);    // C6
}

export function playWrongSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Descending sad tone
  setTimeout(() => playTone(400, 0.2, "triangle", 0.1), 0);
  setTimeout(() => playTone(300, 0.3, "triangle", 0.1), 150);
}

export function playClickSound() {
  playTone(800, 0.05, "sine", 0.08);
}

export function playTickSound() {
  playTone(1000, 0.03, "sine", 0.05);
}

export function playCelebrationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Celebratory fanfare
  const notes = [523, 587, 659, 784, 880, 1047, 1175, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "sine", 0.08), i * 80);
  });
  // Sparkle overlay
  setTimeout(() => {
    [1500, 2000, 2500, 1800, 2200].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1, "sine", 0.04), i * 60);
    });
  }, 600);
}

export function playTimerWarningSound() {
  playTone(880, 0.1, "square", 0.06);
}

export function playReactionSound() {
  playTone(600, 0.08, "sine", 0.06);
  setTimeout(() => playTone(900, 0.1, "sine", 0.06), 80);
}

/** Trigger haptic feedback on mobile devices */
export function vibrate(pattern: number | number[] = 50) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
