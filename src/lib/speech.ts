import files from "./voice-manifest.json";
import { audioContext, isMuted } from "./sound";

const clips: Record<string, string> = files;
let generation = 0;
let current: AudioBufferSourceNode | undefined;
let finish: (() => void) | undefined;
let request: AbortController | undefined;

export function canSpeak() {
  return (
    typeof window !== "undefined" &&
    ("AudioContext" in window || "webkitAudioContext" in window || "speechSynthesis" in window)
  );
}

export function silence() {
  generation++;
  request?.abort();
  request = undefined;
  if (current) {
    current.onended = null;
    current.stop();
    current.disconnect();
    current = undefined;
  }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  finish?.();
  finish = undefined;
}

function fallback(text: string, rate: number) {
  if (!window.speechSynthesis) return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const local = window.speechSynthesis.getVoices().find((v) => v.localService && v.lang.startsWith("en"));
  if (!local) return Promise.resolve();
  utterance.voice = local;
  return new Promise<void>((resolve) => {
    finish = resolve;
    utterance.onend = utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(text: string, rate = 0.94, next?: string) {
  silence();
  if (isMuted()) return;
  const ticket = generation;
  await playClip(text, rate, ticket);
  if (next && generation === ticket) await speak(next);
}

async function playClip(text: string, rate: number, ticket: number) {
  const file = clips[text];
  if (!file) return fallback(text, rate);
  const context = audioContext();
  if (!context) return;
  request = new AbortController();
  try {
    const response = await fetch(new URL(import.meta.env.BASE_URL + file, document.baseURI), {
      signal: request.signal,
    });
    if (!response.ok) {
      if (generation === ticket && [404, 410].includes(response.status)) return fallback(text, rate);
      return;
    }
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    if (generation !== ticket || isMuted()) return;
    const source = context.createBufferSource();
    current = source;
    source.buffer = buffer;
    source.connect(context.destination);
    await new Promise<void>((resolve) => {
      finish = resolve;
      source.onended = () => {
        source.disconnect();
        current = undefined;
        finish = undefined;
        resolve();
      };
      source.start();
    });
  } catch {
    // Navigation, mute and a newer utterance all cancel a pending fetch.
  }
}
