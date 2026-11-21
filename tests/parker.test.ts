import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CVC_WORDS,
  FEELING_BEATS,
  isCvc,
  makeAddRound,
  makeCountRound,
  makeLetterRound,
  makeShapeRound,
} from "../src/parker/content";
import { bumpPractice, bumpTries, loadGrowth } from "../src/lib/storage";

function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesIn(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

describe("parker practice", () => {
  it("builds real CVC words and gentle rounds", () => {
    const rng = mulberry(3);
    for (const item of CVC_WORDS) expect(isCvc(item.word)).toBe(true);
    const letters = makeLetterRound(rng, 5);
    expect(letters).toHaveLength(5);
    expect(letters[0].options).toHaveLength(3);
    const counts = makeCountRound(mulberry(4), 2);
    for (const round of counts) {
      expect(round.n).toBeGreaterThanOrEqual(5);
      expect(round.n).toBeLessThanOrEqual(20);
      expect(round.options).toContain(round.n);
    }
    const sums = makeAddRound(mulberry(8), 5);
    expect(sums.length).toBeGreaterThanOrEqual(4);
    for (const round of sums) {
      expect(round.a + round.b).toBe(round.sum);
      expect(round.sum).toBeLessThanOrEqual(10);
      expect(round.a).toBeGreaterThanOrEqual(1);
      expect(round.b).toBeGreaterThanOrEqual(1);
      expect(round.options).toContain(round.sum);
    }
    expect(makeShapeRound(mulberry(2), 5)).toHaveLength(5);
    expect(FEELING_BEATS.some((beat) => beat.text.includes("wiggly"))).toBe(true);
    expect(FEELING_BEATS.some((beat) => beat.text.includes("Trying and getting better"))).toBe(true);
  });

  it("celebrates tries and practice, not a point total", () => {
    const memory = new Map<string, string>();
    const store = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
      clear: () => memory.clear(),
      key: (index: number) => [...memory.keys()][index] ?? null,
      get length() {
        return memory.size;
      },
    };
    Object.defineProperty(globalThis, "localStorage", { value: store, configurable: true });
    Object.defineProperty(globalThis, "window", { value: { dispatchEvent: () => true }, configurable: true });
    expect(loadGrowth()).toEqual({ tries: 0, practices: 0 });
    bumpTries();
    bumpTries();
    bumpPractice();
    expect(loadGrowth()).toEqual({ tries: 2, practices: 1 });
    expect(loadGrowth()).not.toHaveProperty("score");
  });

  it("keeps shame words out of the parker screens", () => {
    const banned = [/\bwrong\b/i, /\bbuzzer\b/i, /\bstupid\b/i, /\bdummy\b/i, /\bincorrect\b/i, /you lose/i, /bad job/i, /\bscore\b/i];
    const text = filesIn(join("src", "parker")).map((path) => readFileSync(path, "utf8")).join("\n");
    for (const pattern of banned) expect(text).not.toMatch(pattern);
  });
});

function mulberry(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
