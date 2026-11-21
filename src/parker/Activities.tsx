import { useEffect, useState } from "react";
import { Sprite } from "../art/sprites";
import { playSound } from "../lib/sound";
import { speak } from "../lib/speech";
import { bumpPractice, bumpTries } from "../lib/storage";
import {
  BOOKS,
  FEELING_BEATS,
  PRACTICE_LINES,
  YES_LINES,
  makeAddRound,
  makeCountRound,
  makeCvcRound,
  makeLetterRound,
  makeShapeRound,
  makeSightRound,
  type ShapeId,
} from "./content";
import { GentleNote, PlayFrame, RoundDone } from "./PlayBits";
import { useQuiz } from "./useQuiz";

function yesLine(index: number) {
  return YES_LINES[index % YES_LINES.length];
}

export function LetterActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <LetterRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function LetterRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [round] = useState(() => makeLetterRound(Math.random));
  const quiz = useQuiz(round.length);
  if (quiz.done) return <RoundDone line={quiz.line} onAgain={onAgain} onRest={onRest} />;
  const item = round[quiz.index];
  const speech = `Tap the letter that says ${item.answer.sound}.`;
  return (
    <PlayFrame
      title="Letter sounds"
      instruction={speech}
      hear={`${speech} ${item.answer.say}`}
      grownup="Say the sound with Parker, then let them tap. A hint is a kind of help, not a shortcut to hide."
      mood={quiz.note ? "think" : "happy"}
      onBack={onRest}
    >
      {quiz.showHint && (
        <div className="hint-art">
          <svg viewBox="-50 -50 100 100" aria-hidden="true">
            <Sprite name={item.answer.sprite} />
          </svg>
          <p>{item.answer.hint}</p>
        </div>
      )}
      <div className="choice-row">
        {item.options.map((option) => (
          <button
            key={option.letter}
            type="button"
            className={quiz.showHint && option.letter === item.answer.letter ? "letter-btn glow" : "letter-btn"}
            onClick={() => {
              if (option.letter === item.answer.letter) {
                const upcoming = round[quiz.index + 1];
                quiz.succeed(yesLine(quiz.index), upcoming ? `Tap the letter that says ${upcoming.answer.sound}.` : undefined);
              } else quiz.miss(item.answer.hint);
            }}
          >
            {option.letter}
          </button>
        ))}
      </div>
      <GentleNote text={quiz.note} />
      <button type="button" className="btn btn-ghost" onClick={() => quiz.askHint(item.answer.hint)}>
        Give me a hint
      </button>
    </PlayFrame>
  );
}

export function SightActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <SightRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function SightRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [round] = useState(() => makeSightRound(Math.random));
  const quiz = useQuiz(round.length);
  if (quiz.done) return <RoundDone line={quiz.line} onAgain={onAgain} onRest={onRest} />;
  const item = round[quiz.index];
  const speech = `Tap the word ${item.answer}.`;
  return (
    <PlayFrame
      title="Sight words"
      instruction="Tap the word you hear."
      hear={speech}
      grownup="Play the word, then give Parker time. If they look at you, say it once more together."
      mood={quiz.showHint ? "think" : "happy"}
      onBack={onRest}
    >
      <div className="choice-stack can-row">
        {item.options.map((word) => (
          <button
            key={word}
            type="button"
            className={quiz.showHint && word === item.answer ? "choice glow" : "choice word-choice"}
            onClick={() => {
              if (word === item.answer) {
                const upcoming = round[quiz.index + 1];
                quiz.succeed(`${yesLine(quiz.index)} That word says ${item.answer}.`, upcoming ? `Tap the word ${upcoming.answer}.` : undefined);
              } else quiz.miss(`This word says ${item.answer}.`);
            }}
          >
            {word}
          </button>
        ))}
      </div>
      <GentleNote text={quiz.note} />
      <button type="button" className="btn btn-ghost" onClick={() => quiz.askHint(`The word is ${item.answer}.`)}>
        Give me a hint
      </button>
    </PlayFrame>
  );
}

export function BuildActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <BuildRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function BuildRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [round] = useState(() => makeCvcRound(Math.random));
  const quiz = useQuiz(round.length);
  const [slots, setSlots] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  useEffect(() => setSlots([]), [quiz.index]);
  if (quiz.done) return <RoundDone line={quiz.line} onAgain={onAgain} onRest={onRest} />;
  const item = round[quiz.index];
  const remaining = [...item.tiles];
  for (const letter of slots) {
    const at = remaining.indexOf(letter);
    if (at >= 0) remaining.splice(at, 1);
  }
  return (
    <PlayFrame
      title="Build a word"
      instruction="Make the word for this picture."
      hear={`${item.word}. ${item.stretch}. ${item.word}.`}
      grownup={`Stretch it out loud. ${item.word}. ${item.stretch}.`}
      mood={shake ? "think" : "happy"}
      onBack={onRest}
    >
      <div className="word-picture">
        <svg viewBox="-60 -60 120 120" aria-hidden="true">
          <Sprite name={item.sprite} />
        </svg>
      </div>
      <div className={shake ? "slots shake" : "slots"} aria-label="Letter slots">
        {item.word.split("").map((_, index) => (
          <span key={index} className="slot">
            {slots[index] ?? ""}
          </span>
        ))}
      </div>
      <div className="choice-row">
        {remaining.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            className="letter-btn"
            onClick={() => {
              if (quiz.lock) return;
              const need = item.word[slots.length];
              if (letter !== need) {
                setShake(true);
                window.setTimeout(() => setShake(false), 400);
                quiz.miss(item.hint);
                return;
              }
              const next = [...slots, letter];
              setSlots(next);
              if (next.join("") === item.word) {
                const upcoming = round[quiz.index + 1];
                quiz.succeed(
                  `Your try worked. ${item.word}. ${item.stretch}.`,
                  upcoming ? `Now build ${upcoming.word}.` : undefined,
                );
              } else {
                bumpTries();
                playSound("tap");
              }
            }}
          >
            {letter}
          </button>
        ))}
      </div>
      <GentleNote text={quiz.note} />
      <button type="button" className="btn btn-ghost" onClick={() => quiz.askHint(item.hint)}>
        Give me a hint
      </button>
    </PlayFrame>
  );
}

export function BookActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <BookRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function BookRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [book] = useState(() => BOOKS[Math.floor(Math.random() * BOOKS.length)]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const line = PRACTICE_LINES[1];
  if (done) return <RoundDone line={line} onAgain={onAgain} onRest={onRest} />;
  const sentence = book.pages[page];
  const words = sentence.replace(".", "").split(" ");
  return (
    <PlayFrame
      title={book.title}
      instruction="Tap a word to hear it. Then turn the page together."
      hear={sentence}
      hearRate={0.78}
      grownup="Point under each word as it is said. Parker does not need to read every word alone."
      onBack={onRest}
    >
      <p className="sentence">
        {words.map((word, index) => (
          <button key={`${word}-${index}`} type="button" className="word-tap" onClick={() => speak(word, 0.8)}>
            {word}
          </button>
        ))}
        <span>.</span>
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (page + 1 >= book.pages.length) {
            setDone(true);
            bumpPractice();
            playSound("grow");
            speak(line, 0.88);
          } else {
            const next = page + 1;
            setPage(next);
            speak(book.pages[next], 0.78);
          }
        }}
      >
        {page + 1 >= book.pages.length ? "We read it" : "Next page"}
      </button>
      <p className="page-count">
        Page {page + 1} of {book.pages.length}
      </p>
    </PlayFrame>
  );
}

export function CountActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <CountRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function CountRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [round] = useState(() => makeCountRound(Math.random));
  const quiz = useQuiz(round.length);
  if (quiz.done) return <RoundDone line={quiz.line} onAgain={onAgain} onRest={onRest} />;
  const item = round[quiz.index];
  const counting = Array.from({ length: item.n }, (_, index) => index + 1).join(", ");
  return (
    <PlayFrame
      title="Count"
      instruction="How many do you see?"
      grownup="Count out loud and touch each picture. Stop if Parker wants to take over."
      mood={quiz.showHint ? "think" : "happy"}
      onBack={onRest}
    >
      <div className="count-grid">
        {Array.from({ length: item.n }).map((_, index) => (
          <span key={index} className="count-bit">
            <svg viewBox="-46 -46 92 92" aria-hidden="true">
              <Sprite name={item.thing} />
            </svg>
          </span>
        ))}
      </div>
      <div className="choice-row">
        {item.options.map((number) => (
          <button
            key={number}
            type="button"
            className={quiz.showHint && number === item.n ? "letter-btn glow" : "letter-btn"}
            onClick={() => {
              if (number === item.n) {
                const upcoming = round[quiz.index + 1];
                quiz.succeed(yesLine(quiz.index), upcoming ? "How many do you see?" : undefined);
              } else quiz.miss("Let's count together. Touch each picture.");
            }}
          >
            {number}
          </button>
        ))}
      </div>
      <GentleNote text={quiz.note} />
      <button type="button" className="btn btn-ghost" onClick={() => quiz.askHint(`Let's count. ${counting}.`)}>
        Count with me
      </button>
    </PlayFrame>
  );
}

export function AddActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <AddRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function AddRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [round] = useState(() => makeAddRound(Math.random));
  const quiz = useQuiz(round.length);
  if (quiz.done) return <RoundDone line={quiz.line} onAgain={onAgain} onRest={onRest} />;
  const item = round[quiz.index];
  return (
    <PlayFrame
      title="Add"
      instruction="How many altogether?"
      grownup="Count the first group, then keep going into the second group without starting over."
      mood={quiz.showHint ? "think" : "happy"}
      onBack={onRest}
    >
      <div className="add-row">
        <div className="add-group">
          {Array.from({ length: item.a }).map((_, index) => (
            <span key={`a${index}`} className="count-bit tiny">
              <svg viewBox="-46 -46 92 92" aria-hidden="true">
                <Sprite name={item.thing} />
              </svg>
            </span>
          ))}
        </div>
        <span className="plus">+</span>
        <div className="add-group">
          {Array.from({ length: item.b }).map((_, index) => (
            <span key={`b${index}`} className="count-bit tiny">
              <svg viewBox="-46 -46 92 92" aria-hidden="true">
                <Sprite name={item.thing} />
              </svg>
            </span>
          ))}
        </div>
      </div>
      <div className="choice-row">
        {item.options.map((number) => (
          <button
            key={number}
            type="button"
            className={quiz.showHint && number === item.sum ? "letter-btn glow" : "letter-btn"}
            onClick={() => {
              if (number === item.sum) quiz.succeed(yesLine(quiz.index), round[quiz.index + 1] ? "How many altogether?" : undefined);
              else quiz.miss("Count every picture, starting at one.");
            }}
          >
            {number}
          </button>
        ))}
      </div>
      <GentleNote text={quiz.note} />
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => quiz.askHint(`There are ${item.a} and ${item.b}. Count them all.`)}
      >
        Give me a hint
      </button>
    </PlayFrame>
  );
}

export function ShapeActivity({ onRest }: { onRest: () => void }) {
  const [nonce, setNonce] = useState(0);
  return <ShapeRound key={nonce} onAgain={() => setNonce((value) => value + 1)} onRest={onRest} />;
}

function ShapeRound({ onAgain, onRest }: { onAgain: () => void; onRest: () => void }) {
  const [round] = useState(() => makeShapeRound(Math.random));
  const quiz = useQuiz(round.length);
  if (quiz.done) return <RoundDone line={quiz.line} onAgain={onAgain} onRest={onRest} />;
  const item = round[quiz.index];
  const speech = `Tap the ${item.answer.name}.`;
  return (
    <PlayFrame
      title="Shapes"
      instruction={speech}
      hear={speech}
      grownup="Say the shape name and trace it in the air before Parker taps."
      mood={quiz.showHint ? "think" : "happy"}
      onBack={onRest}
    >
      <div className="shape-row">
        {item.options.map((shape) => (
          <button
            key={shape.id}
            type="button"
            className={quiz.showHint && shape.id === item.answer.id ? "shape-btn glow" : "shape-btn"}
            aria-label={shape.name}
            onClick={() => {
              if (shape.id === item.answer.id) {
                const upcoming = round[quiz.index + 1];
                quiz.succeed(yesLine(quiz.index), upcoming ? `Tap the ${upcoming.answer.name}.` : undefined);
              } else quiz.miss(item.answer.hint);
            }}
          >
            <ShapeGraphic id={shape.id} />
            <span>{shape.name}</span>
          </button>
        ))}
      </div>
      <GentleNote text={quiz.note} />
      <button type="button" className="btn btn-ghost" onClick={() => quiz.askHint(item.answer.hint)}>
        Give me a hint
      </button>
    </PlayFrame>
  );
}

export function FeelingActivity({ onRest }: { onRest: () => void }) {
  const [beat, setBeat] = useState(0);
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <RoundDone
        line="You stayed for the feeling story. That is practice too."
        onAgain={() => {
          setBeat(0);
          setDone(false);
        }}
        onRest={onRest}
      />
    );
  }
  const item = FEELING_BEATS[beat];
  return (
    <PlayFrame title="Wiggly tummy" instruction={item.text} grownup={item.grownup} mood={item.mood} stack onBack={onRest}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (beat + 1 >= FEELING_BEATS.length) {
            setDone(true);
            bumpPractice();
            playSound("grow");
            speak("You stayed for the feeling story. That is practice too.", 0.88);
          } else {
            const next = beat + 1;
            setBeat(next);
            speak(FEELING_BEATS[next].text, 0.86);
          }
        }}
      >
        {beat + 1 >= FEELING_BEATS.length ? "I can try too" : "Next"}
      </button>
    </PlayFrame>
  );
}

export function ShapeGraphic({ id }: { id: ShapeId }) {
  const stroke = "#243056";
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      {id === "circle" && <circle cx="60" cy="60" r="40" fill="#4dabf7" stroke={stroke} strokeWidth="4" />}
      {id === "square" && <rect x="24" y="24" width="72" height="72" rx="8" fill="#ffd166" stroke={stroke} strokeWidth="4" />}
      {id === "triangle" && <polygon points="60,18 104,98 16,98" fill="#7dce6a" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />}
      {id === "rectangle" && <rect x="14" y="36" width="92" height="48" rx="8" fill="#ff8fab" stroke={stroke} strokeWidth="4" />}
      {id === "star" && (
        <polygon points="60,12 72,46 108,46 78,66 90,102 60,80 30,102 42,66 12,46 48,46" fill="#ffb703" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      )}
      {id === "heart" && <path d="M60 96 C20 70 18 40 38 32 C48 28 58 36 60 44 C62 36 72 28 82 32 C102 40 100 70 60 96 Z" fill="#f25c54" stroke={stroke} strokeWidth="4" />}
      {id === "oval" && <ellipse cx="60" cy="60" rx="46" ry="30" fill="#b388ff" stroke={stroke} strokeWidth="4" />}
      {id === "diamond" && <polygon points="60,14 104,60 60,106 16,60" fill="#2ec4b6" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />}
    </svg>
  );
}
