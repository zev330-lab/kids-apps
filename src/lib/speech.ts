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

export function localVoice() {
  return window.speechSynthesis?.getVoices().find((voice) => voice.localService && voice.lang.startsWith("en"));
}

function fallback(text: string, rate: number) {
  const local = localVoice();
  if (!local) return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.voice = local;
  return new Promise<void>((resolve) => {
    finish = resolve;
    utterance.onend = utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(text: string | string[], rate = 0.94, next?: string) {
  silence();
  const ticket = generation;
  const parts = typeof text === "string" ? [text] : text;
  for (const part of parts) {
    if (generation !== ticket || isMuted()) return;
    await playClip(part, rate, ticket);
  }
  if (next && generation === ticket && !isMuted()) await speak(next);
}

async function playClip(text: string, rate: number, ticket: number) {
  if (!Object.hasOwn(clips, text)) return fallback(text, rate);
  const controller = new AbortController();
  request = controller;
  try {
    const context = audioContext();
    if (!context) throw new Error("Web Audio is unavailable");
    if (context.state === "suspended") await context.resume();
    if (controller.signal.aborted) return;
    if (context.state !== "running") throw new Error("Audio is unavailable");
    const response = await fetch(new URL(import.meta.env.BASE_URL + clips[text], document.baseURI), {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Recording returned ${response.status}`);
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    if (generation !== ticket || isMuted()) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    await new Promise<void>((resolve) => {
      source.onended = () => {
        source.disconnect();
        current = undefined;
        finish = undefined;
        resolve();
      };
      try {
        source.start();
      } catch (error) {
        source.disconnect();
        throw error;
      }
      current = source;
      finish = resolve;
    });
  } catch {
    if (generation === ticket && !isMuted()) await fallback(text, rate);
  } finally {
    if (request === controller) request = undefined;
  }
}
