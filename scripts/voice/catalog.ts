import { RECORDED_NAMES } from "../../src/lib/names";
import { lines } from "../../src/parker/lines";
import { NOTES } from "../../src/scribble/notes";
import { WORLDS } from "../../src/story/worlds";
import { sceneSpeech } from "../../src/story/model";
import {
  ACTIVITIES,
  BOOKS,
  CVC_WORDS,
  FEELING_BEATS,
  FEELING_SHORT,
  LETTERS,
  PRACTICE_LINES,
  SHAPES,
  SIGHT_WORDS,
  TRY_AGAIN,
  YES_LINES,
} from "../../src/parker/content";

type Clip = { text: string; group: string; reading: string; shortStop?: boolean };
const clips = new Map<string, Clip>();
function add(text: string, reading = text, group = "core", shortStop = false) {
  clips.set(text, { text, reading, group, shortStop });
}
function hint(text: string, reading = text) {
  add(text, reading);
  add(`${TRY_AGAIN} ${text}`, `${TRY_AGAIN} ${reading}`);
}

// Braces mark exact Kokoro phonemes embedded in otherwise natural sentences.
const sounds: Record<string, string> = {
  a: "æ",
  b: "b",
  c: "k",
  d: "d",
  e: "ɛ",
  f: "f",
  g: "ɡ",
  h: "h",
  i: "ɪ",
  l: "l",
  m: "m",
  n: "n",
  o: "ɑ",
  p: "p",
  r: "ɹ",
  s: "s",
  t: "t",
  u: "ʌ",
  x: "ks",
};
const names = [
  "eɪ",
  "biː",
  "siː",
  "diː",
  "iː",
  "ɛf",
  "dʒiː",
  "eɪtʃ",
  "aɪ",
  "dʒeɪ",
  "keɪ",
  "ɛl",
  "ɛm",
  "ɛn",
  "oʊ",
  "piː",
  "kjuː",
  "ɑɹ",
  "ɛs",
  "tiː",
  "juː",
  "viː",
  "dʌbəl juː",
  "ɛks",
  "waɪ",
  "ziː",
];
for (const [i, name] of names.entries()) add(lines.letterName(String.fromCharCode(65 + i)), `{${name}}`);
for (const letter of LETTERS) {
  const sound = `{${sounds[letter.letter]}}`;
  add(letter.sound, sound, "core", ["b", "c", "d", "g", "p", "t"].includes(letter.letter));
  add(letter.keyword);
  const prompt = "Tap the letter that says ";
  add(lines.letter(letter.sound), prompt + sound + ".");
  add(lines.letterExample(lines.letter(letter.sound), letter.say), prompt + sound + ", like " + letter.keyword + ".");
  hint(letter.hint, `{${names[letter.letter.charCodeAt(0) - 97]}} says ${sound}, like ${letter.keyword}.`);
}
for (const word of SIGHT_WORDS) {
  add(word);
  add(lines.sight(word));
  hint(lines.sightMiss(word));
  add(lines.sightHint(word));
  for (const yes of YES_LINES) add(lines.sightPraise(yes, word));
}
for (const item of CVC_WORDS) {
  const stretch = [...item.word].map((c) => `{${sounds[c]}}`).join(", ");
  add(item.word);
  add(lines.build(item.word, item.stretch), `${item.word}. ${stretch}. ${item.word}.`);
  add(lines.built(item.word, item.stretch), `Your try worked. ${item.word}. ${stretch}.`);
  add(lines.nextWord(item.word));
  hint(item.hint, `${item.word} starts with {${sounds[item.word[0]]}}.`);
}
for (const book of BOOKS)
  for (const page of book.pages) {
    add(page);
    for (const word of page.replace(".", "").split(" ")) add(word);
  }
for (const shape of SHAPES) {
  add(lines.shape(shape.name));
  hint(shape.hint);
}
for (const a of ACTIVITIES) add(lines.intro(a.title, a.intro));
for (const b of FEELING_BEATS) {
  add(b.text);
  add(lines.intro("Wiggly tummy", b.text));
}
for (const line of [...YES_LINES, ...PRACTICE_LINES, "How many do you see?", "How many altogether?", lines.feelingDone])
  add(line);
for (const line of [FEELING_SHORT, lines.countMiss, lines.addMiss]) hint(line);
for (let n = 5; n <= 20; n++) add(lines.count(n));
for (let a = 1; a < 10; a++) for (let b = 1; a + b <= 10; b++) add(lines.add(a, b));
for (const note of Object.values(NOTES)) add(note);
for (const name of [...RECORDED_NAMES, "our explorer"]) {
  add(name, name, "story");
  add(name + "'s", name + "'s", "story");
}
for (const world of WORLDS)
  for (const scene of Object.values(world.scenes)) {
    for (const text of sceneSpeech(scene, "Parker")) add(text, text, "story");
  }

export const catalog = [...clips.values()];
