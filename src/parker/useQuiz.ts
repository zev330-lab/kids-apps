import { useEffect, useRef, useState } from "react";
import { playSound } from "../lib/sound";
import { speak } from "../lib/speech";
import { bumpPractice, bumpTries } from "../lib/storage";
import { FEELING_SHORT, PRACTICE_LINES, TRY_AGAIN } from "./content";

export function useQuiz(length: number) {
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState(false);
  const [lock, setLock] = useState(false);
  const [line, setLine] = useState(PRACTICE_LINES[0]);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function miss(hint: string) {
    if (lock || done) return;
    bumpTries();
    playSound("again");
    const next = misses + 1;
    setMisses(next);
    setShowHint(true);
    const message = next === 1 ? `${TRY_AGAIN} ${FEELING_SHORT}` : `${TRY_AGAIN} ${hint}`;
    setNote(message);
    speak(message, 0.86);
  }

  function succeed(message: string, nextSpeech?: string) {
    if (lock || done) return;
    bumpTries();
    playSound("yes");
    setNote(message);
    setLock(true);
    speak(message, 0.9);
    timer.current = window.setTimeout(() => {
      setNote(null);
      setShowHint(false);
      setMisses(0);
      setLock(false);
      if (index + 1 >= length) {
        const practiceLine = PRACTICE_LINES[length % PRACTICE_LINES.length];
        setLine(practiceLine);
        setDone(true);
        bumpPractice();
        playSound("grow");
        speak(practiceLine, 0.88);
      } else {
        setIndex((value) => value + 1);
        if (nextSpeech) speak(nextSpeech, 0.84);
      }
    }, 850);
  }

  function askHint(text: string) {
    setShowHint(true);
    setNote(text);
    speak(text, 0.84);
  }

  return { index, note, showHint, done, lock, line, miss, succeed, askHint };
}
