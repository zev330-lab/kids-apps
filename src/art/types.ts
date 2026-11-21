export const SPRITE_NAMES = [
  "rocket",
  "moon",
  "sun",
  "cloud",
  "star",
  "comet",
  "satellite",
  "rabbit",
  "mouse",
  "crystal",
  "kite",
  "flag",
  "flower",
  "tree",
  "mushroom",
  "fox",
  "owl",
  "firefly",
  "unicorn",
  "lily",
  "book",
  "lantern",
  "cup",
  "sprout",
  "dolphin",
  "whale",
  "turtle",
  "seahorse",
  "octopus",
  "crab",
  "sub",
  "palace",
  "fish",
  "pearl",
  "shell",
  "cake",
  "apple",
  "hill",
  "balloon",
  "cat",
  "heart",
  "candy",
  "cookie",
  "crayon",
  "blob",
  "dog",
  "pig",
  "hat",
  "bug",
  "bed",
  "hen",
  "pot",
  "ball",
  "egg",
  "leaf",
  "nest",
  "goat",
  "umbrella",
  "igloo",
  "map",
  "top",
  "rain",
  "box",
] as const;

export type SpriteName = (typeof SPRITE_NAMES)[number];

export type SkyName =
  | "day"
  | "dusk"
  | "sea"
  | "meadow"
  | "space"
  | "candy"
  | "cave"
  | "sunset";

export type GroundName = "grass" | "sand" | "moon" | "water" | "snow" | "none";

export type AnimName = "bob" | "sway" | "drift" | "twinkle" | "flicker";

export type PictureItem = {
  s: SpriteName;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  anim?: AnimName;
};

export type PictureSpec = {
  sky: SkyName;
  ground?: GroundName;
  items: PictureItem[];
};
