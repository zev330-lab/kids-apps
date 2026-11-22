import type { SpriteName } from "../art/types";

export type Rng = () => number;

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sample<T>(rng: Rng, items: readonly T[], count: number): T[] {
  return shuffle(rng, items).slice(0, count);
}

export type Letter = {
  letter: string;
  sound: string;
  say: string;
  hint: string;
  keyword: string;
  sprite: SpriteName;
};

export const LETTERS: Letter[] = [
  { letter: "a", sound: "/ă/", say: "/ă/, like apple", hint: "A says /ă/, like apple.", keyword: "apple", sprite: "apple" },
  { letter: "b", sound: "/b/", say: "/b/, like ball", hint: "B says /b/, like ball.", keyword: "ball", sprite: "ball" },
  { letter: "c", sound: "/k/", say: "/k/, like cat", hint: "C says /k/, like cat.", keyword: "cat", sprite: "cat" },
  { letter: "d", sound: "/d/", say: "/d/, like dog", hint: "D says /d/, like dog.", keyword: "dog", sprite: "dog" },
  { letter: "e", sound: "/ĕ/", say: "/ĕ/, like egg", hint: "E says /ĕ/, like egg.", keyword: "egg", sprite: "egg" },
  { letter: "f", sound: "/f/", say: "/f/, like fish", hint: "F says /f/, like fish.", keyword: "fish", sprite: "fish" },
  { letter: "g", sound: "/g/", say: "/g/, like goat", hint: "G says /g/, like goat.", keyword: "goat", sprite: "goat" },
  { letter: "h", sound: "/h/", say: "/h/, like hat", hint: "H says /h/, like hat.", keyword: "hat", sprite: "hat" },
  { letter: "i", sound: "/ĭ/", say: "/ĭ/, like igloo", hint: "I says /ĭ/, like igloo.", keyword: "igloo", sprite: "igloo" },
  { letter: "l", sound: "/l/", say: "/l/, like leaf", hint: "L says /l/, like leaf.", keyword: "leaf", sprite: "leaf" },
  { letter: "m", sound: "/m/", say: "/m/, like moon", hint: "M says /m/, like moon.", keyword: "moon", sprite: "moon" },
  { letter: "n", sound: "/n/", say: "/n/, like nest", hint: "N says /n/, like nest.", keyword: "nest", sprite: "nest" },
  { letter: "o", sound: "/ŏ/", say: "/ŏ/, like octopus", hint: "O says /ŏ/, like octopus.", keyword: "octopus", sprite: "octopus" },
  { letter: "p", sound: "/p/", say: "/p/, like pig", hint: "P says /p/, like pig.", keyword: "pig", sprite: "pig" },
  { letter: "r", sound: "/r/", say: "/r/, like rain", hint: "R says /r/, like rain.", keyword: "rain", sprite: "rain" },
  { letter: "s", sound: "/s/", say: "/s/, like sun", hint: "S says /s/, like sun.", keyword: "sun", sprite: "sun" },
  { letter: "t", sound: "/t/", say: "/t/, like top", hint: "T says /t/, like top.", keyword: "top", sprite: "top" },
  { letter: "u", sound: "/ŭ/", say: "/ŭ/, like umbrella", hint: "U says /ŭ/, like umbrella.", keyword: "umbrella", sprite: "umbrella" },
];

export const SIGHT_WORDS = [
  "the",
  "and",
  "see",
  "you",
  "can",
  "look",
  "I",
  "a",
  "to",
  "go",
  "my",
  "we",
  "is",
  "it",
  "in",
  "up",
  "big",
  "play",
  "like",
  "me",
] as const;

export type CvcWord = {
  word: string;
  sprite: SpriteName;
  stretch: string;
  hint: string;
};

export const CVC_WORDS: CvcWord[] = [
  { word: "cat", sprite: "cat", stretch: "/k/, /ă/, /t/", hint: "Cat starts with /k/." },
  { word: "sun", sprite: "sun", stretch: "/s/, /ŭ/, /n/", hint: "Sun starts with /s/." },
  { word: "map", sprite: "map", stretch: "/m/, /ă/, /p/", hint: "Map starts with /m/." },
  { word: "dog", sprite: "dog", stretch: "/d/, /ŏ/, /g/", hint: "Dog starts with /d/." },
  { word: "pig", sprite: "pig", stretch: "/p/, /ĭ/, /g/", hint: "Pig starts with /p/." },
  { word: "hat", sprite: "hat", stretch: "/h/, /ă/, /t/", hint: "Hat starts with /h/." },
  { word: "bug", sprite: "bug", stretch: "/b/, /ŭ/, /g/", hint: "Bug starts with /b/." },
  { word: "bed", sprite: "bed", stretch: "/b/, /ĕ/, /d/", hint: "Bed starts with /b/." },
  { word: "cup", sprite: "cup", stretch: "/k/, /ŭ/, /p/", hint: "Cup starts with /k/." },
  { word: "fox", sprite: "fox", stretch: "/f/, /ŏ/, /ks/", hint: "Fox starts with /f/." },
  { word: "hen", sprite: "hen", stretch: "/h/, /ĕ/, /n/", hint: "Hen starts with /h/." },
  { word: "pot", sprite: "pot", stretch: "/p/, /ŏ/, /t/", hint: "Pot starts with /p/." },
];

export const BOOKS = [
  {
    id: "cat",
    title: "The Cat",
    pages: ["I see a cat.", "The cat can sit.", "The cat is big.", "I like the cat."],
  },
  {
    id: "sun",
    title: "The Sun",
    pages: ["I see the sun.", "The sun is big.", "We like the sun.", "The sun is up."],
  },
  {
    id: "map",
    title: "A Map",
    pages: ["I see a map.", "You can look.", "The map is big.", "We like the map."],
  },
] as const;

export const COUNT_THINGS = ["star", "apple", "fish", "shell", "flower"] as const satisfies readonly SpriteName[];

export const SHAPES = [
  { id: "circle", name: "circle", hint: "A circle is round, like a bubble. No corners." },
  { id: "square", name: "square", hint: "A square has four equal sides." },
  { id: "triangle", name: "triangle", hint: "A triangle has three sides." },
  { id: "rectangle", name: "rectangle", hint: "A rectangle is long, like a door." },
  { id: "star", name: "star", hint: "A star is pointy, like a night light." },
  { id: "heart", name: "heart", hint: "A heart is the shape of a hug." },
  { id: "oval", name: "oval", hint: "An oval is a stretched circle, like an egg." },
  { id: "diamond", name: "diamond", hint: "A diamond is pointy on top, like a kite." },
] as const;

export type ShapeId = (typeof SHAPES)[number]["id"];

export function numberChoices(rng: Rng, answer: number, min: number, max: number): number[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 3 && guard < 30) {
    guard += 1;
    const delta = 1 + Math.floor(rng() * 3);
    const value = answer + (rng() < 0.5 ? -delta : delta);
    if (value >= min && value <= max && value !== answer) set.add(value);
  }
  while (set.size < 3) {
    for (let value = min; value <= max; value++) {
      if (!set.has(value)) {
        set.add(value);
        break;
      }
    }
  }
  return shuffle(rng, [...set]);
}

export function makeLetterRound(rng: Rng, count = 5) {
  return sample(rng, LETTERS, count).map((answer) => ({
    answer,
    options: shuffle(rng, [answer, ...sample(rng, LETTERS.filter((item) => item.letter !== answer.letter), 2)]),
  }));
}

export function makeSightRound(rng: Rng, count = 5) {
  return sample(rng, SIGHT_WORDS, count).map((answer) => ({
    answer,
    options: shuffle(rng, [answer, ...sample(rng, SIGHT_WORDS.filter((word) => word !== answer), 2)]),
  }));
}

export function makeCvcRound(rng: Rng, count = 3) {
  const alphabet = "bcdfghjklmnpqrstvwxyz".split("");
  return sample(rng, CVC_WORDS, count).map((item) => {
    const pool = alphabet.filter((letter) => !item.word.includes(letter));
    const distractor = pool[Math.floor(rng() * pool.length)] ?? "z";
    return { ...item, tiles: shuffle(rng, [...item.word.split(""), distractor]) };
  });
}

export function makeCountRound(rng: Rng, count = 2) {
  const used = new Set<number>();
  const rounds: { n: number; thing: SpriteName; options: number[] }[] = [];
  while (rounds.length < count) {
    const n = 5 + Math.floor(rng() * 16);
    if (used.has(n)) continue;
    used.add(n);
    const thing = COUNT_THINGS[Math.floor(rng() * COUNT_THINGS.length)];
    rounds.push({ n, thing, options: numberChoices(rng, n, 1, 20) });
  }
  return rounds;
}

export function makeAddRound(rng: Rng, count = 5) {
  const seen = new Set<string>();
  const rounds: { a: number; b: number; sum: number; thing: SpriteName; options: number[] }[] = [];
  let guard = 0;
  while (rounds.length < count && guard < 80) {
    guard += 1;
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * (10 - a));
    const key = a <= b ? `${a}+${b}` : `${b}+${a}`;
    if (seen.has(key) || a + b > 10 || b < 1) continue;
    seen.add(key);
    const thing = COUNT_THINGS[Math.floor(rng() * COUNT_THINGS.length)];
    rounds.push({ a, b, sum: a + b, thing, options: numberChoices(rng, a + b, 0, 10) });
  }
  return rounds;
}

export function makeShapeRound(rng: Rng, count = 5) {
  return sample(rng, SHAPES, count).map((answer) => ({
    answer,
    options: shuffle(rng, [answer, ...sample(rng, SHAPES.filter((shape) => shape.id !== answer.id), 2)]),
  }));
}

export function isCvc(word: string) {
  return /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/.test(word);
}

export const TRY_AGAIN = "Let's try again.";
export const FEELING_SHORT = "If your tummy feels wiggly, that is okay.";

export const YES_LINES = [
  "Your try worked.",
  "You found it.",
  "That is the one.",
  "Yes. That took a try.",
];

export const PRACTICE_LINES = [
  "You practiced. That is how you grow.",
  "Your tries watered the garden.",
  "You stayed with it. That matters.",
  "Getting better happens one try at a time.",
];

export const FEELING_BEATS = [
  {
    mood: "think" as const,
    text: "Pip tried a new word. Pip's tummy went wiggly. Pip's face felt hot.",
    grownup: "You can say: That feeling can show up when something is new.",
  },
  {
    mood: "calm" as const,
    text: "Pip thought, I feel this because I am not good at it. That thought was heavy.",
    grownup: "You can say: A hard try is not the same as being bad at something.",
  },
  {
    mood: "calm" as const,
    text: "Trying and getting better matters more than being good at it.",
    grownup: "Read this one slowly. It is the heart of practice.",
  },
  {
    mood: "think" as const,
    text: "When a try does not work yet, your tummy may wiggle. Your face may feel hot. Learning feels like that too. You are okay.",
    grownup: "Parker can touch their tummy if they want. There is nothing to fix.",
  },
  {
    mood: "proud" as const,
    text: "Pip tried again. The word was still a little hard. Pip stayed. That was growing.",
    grownup: "You can say: Staying with a try is the brave part.",
  },
];

export const ACTIVITIES = [
  {
    id: "letters",
    title: "Letter sounds",
    blurb: "Hear a sound. Tap its letter.",
    grownup: "Say the first sound together. Keep the sound in ball short.",
    intro: "Tap the letter that makes the sound.",
  },
  {
    id: "sights",
    title: "Sight words",
    blurb: "Hear a word. Find it.",
    grownup: "Point under the word after Parker taps it. Read it together once.",
    intro: "Tap the word you hear.",
  },
  {
    id: "build",
    title: "Build a word",
    blurb: "Make cat, sun, map, and friends.",
    grownup: "Say each sound in cat, then blend the sounds together.",
    intro: "Tap the letters in order.",
  },
  {
    id: "book",
    title: "Tiny book",
    blurb: "Read a short page together.",
    grownup: "Point under each word. Parker can tap any word to hear it.",
    intro: "Let us read a tiny book.",
  },
  {
    id: "count",
    title: "Count",
    blurb: "How many, up to 20.",
    grownup: "Count out loud together. Touch each picture if that helps.",
    intro: "How many do you see?",
  },
  {
    id: "add",
    title: "Add",
    blurb: "Put small groups together.",
    grownup: "Count one group, then keep counting into the next.",
    intro: "How many altogether?",
  },
  {
    id: "shapes",
    title: "Shapes",
    blurb: "Find the shape you hear.",
    grownup: "Trace the shape in the air with a finger.",
    intro: "Tap the shape.",
  },
  {
    id: "feeling",
    title: "Wiggly tummy",
    blurb: "A short story about trying.",
    grownup: "Sit close. This one is a feeling story, not a quiz.",
    intro: "A story about a wiggly tummy.",
  },
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]["id"];
