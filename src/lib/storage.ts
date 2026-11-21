export type EndingMap = Record<string, string[]>;

export type Growth = {
  tries: number;
  practices: number;
};

const HERO = "playtime.v1.hero";
const MUTE = "playtime.v1.mute";
const ENDINGS = "playtime.v1.endings";
const GROWTH = "playtime.v1.growth";

const endingEvent = "playtime-endings";
const growthEvent = "playtime-growth";
const muteEvent = "playtime-mute";
const heroEvent = "playtime-hero";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or a full disk: keep playing in memory */
  }
}

export function sanitizeName(raw: string): string {
  const cleaned = raw
    .replace(/[^\p{L}\p{N} '\-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
  return cleaned || "Parker";
}

export function loadHero(): string {
  const stored = read(HERO);
  return stored ? sanitizeName(stored) : "Parker";
}

export function saveHero(raw: string): string {
  const name = sanitizeName(raw);
  write(HERO, name);
  dispatch(heroEvent);
  return name;
}

export function loadMuted(): boolean {
  return read(MUTE) === "1";
}

export function saveMuted(muted: boolean) {
  write(MUTE, muted ? "1" : "0");
  dispatch(muteEvent);
}

export function loadEndings(): EndingMap {
  const raw = read(ENDINGS);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as EndingMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberEnding(worldId: string, endingId: string): EndingMap {
  const current = loadEndings();
  const list = new Set(current[worldId] ?? []);
  list.add(endingId);
  const next = { ...current, [worldId]: [...list] };
  write(ENDINGS, JSON.stringify(next));
  dispatch(endingEvent);
  return next;
}

export const EMPTY_GROWTH: Growth = { tries: 0, practices: 0 };

export function loadGrowth(): Growth {
  const raw = read(GROWTH);
  if (!raw) return { ...EMPTY_GROWTH };
  try {
    const parsed = JSON.parse(raw) as Partial<Growth>;
    return {
      tries: clampCount(parsed.tries),
      practices: clampCount(parsed.practices),
    };
  } catch {
    return { ...EMPTY_GROWTH };
  }
}

function clampCount(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 0;
  return Math.max(0, Math.min(100000, v));
}

export function saveGrowth(growth: Growth) {
  write(GROWTH, JSON.stringify(growth));
  dispatch(growthEvent);
}

export function bumpTries(): Growth {
  const current = loadGrowth();
  const next = { ...current, tries: current.tries + 1 };
  saveGrowth(next);
  return next;
}

export function bumpPractice(): Growth {
  const current = loadGrowth();
  const next = { ...current, practices: current.practices + 1 };
  saveGrowth(next);
  return next;
}

function dispatch(name: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
}

export const storageEvents = { endingEvent, growthEvent, muteEvent, heroEvent };
