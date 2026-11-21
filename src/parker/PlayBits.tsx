import type { ReactNode } from "react";
import { Pip, type PipMood } from "../art/Pip";
import { canSpeak, speak } from "../lib/speech";

export function Grownup({ children }: { children: ReactNode }) {
  return (
    <aside className="grownup">
      <p className="kicker">For the grown-up</p>
      <p>{children}</p>
    </aside>
  );
}

export function HearButton({ text, rate = 0.84 }: { text: string; rate?: number }) {
  if (!canSpeak()) return null;
  return (
    <button type="button" className="btn btn-mint" onClick={() => speak(text, rate)}>
      Hear it
    </button>
  );
}

export function GentleNote({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="gentle" role="status">
      {text}
    </p>
  );
}

export function PlayFrame({
  title,
  instruction,
  grownup,
  hear,
  hearRate,
  mood = "happy",
  stack = false,
  onBack,
  children,
}: {
  title: string;
  instruction: string;
  grownup: string;
  hear?: string;
  hearRate?: number;
  mood?: PipMood;
  stack?: boolean;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className={stack ? "play play-stack" : "play"}>
      <div className="play-side">
        <Pip mood={mood} />
        <div>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            All activities
          </button>
          <p className="kicker">{title}</p>
          <p className="prompt">{instruction}</p>
          <HearButton text={hear ?? `${title}. ${instruction}`} rate={hearRate ?? 0.84} />
          <Grownup>{grownup}</Grownup>
        </div>
      </div>
      <div className="play-main">{children}</div>
    </div>
  );
}

export function RoundDone({ line, onAgain, onRest }: { line: string; onAgain: () => void; onRest: () => void }) {
  return (
    <div className="round-done">
      <Pip mood="proud" size={200} />
      <h2>{line}</h2>
      <p>The garden grew. There is no rush to do more.</p>
      <HearButton text={line} rate={0.9} />
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={onAgain}>
          Practice again
        </button>
        <button type="button" className="btn btn-ghost" onClick={onRest}>
          Rest
        </button>
      </div>
    </div>
  );
}
