import { isMuted } from "./sound";

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function silence() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export function speak(text: string, rate = 0.94) {
  if (!canSpeak() || isMuted()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.04;
  utterance.lang = "en-US";
  const voices = synth.getVoices();
  const preferred =
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en") && /samantha|google us english|karen|moira|female/i.test(voice.name)) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (preferred) utterance.voice = preferred;
  synth.speak(utterance);
}
