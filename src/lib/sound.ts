import { loadMuted, saveMuted } from "./storage";

let ctx: AudioContext | null = null;
let muted = false;

export function initSound() {
  muted = loadMuted();
}

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  saveMuted(next);
}

export function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    if (!ctx) ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

export function needsResume(state: AudioContextState) {
  return state === "suspended" || state === "interrupted";
}

export async function unlockAudio() {
  const context = audioContext();
  if (!context) return null;
  if (needsResume(context.state)) {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }
  return context.state === "running" ? context : null;
}

export type SoundName = "tap" | "yes" | "again" | "sparkle" | "grow";

export async function playSound(kind: SoundName) {
  if (muted) return;
  const context = await unlockAudio();
  if (!context || muted) return;
  const now = context.currentTime;
  const notes: Record<SoundName, number[]> = {
    tap: [494],
    yes: [523, 659, 784],
    again: [466, 392],
    sparkle: [784, 1046, 1318],
    grow: [392, 523, 659, 784],
  };
  notes[kind].forEach((freq, i) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = kind === "again" ? "triangle" : "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.08;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.05, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start + 0.26);
  });
}
