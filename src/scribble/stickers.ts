export const STICKER_KINDS = [
  "crown",
  "party",
  "bow",
  "glasses",
  "scarf",
  "flower",
  "cape",
  "ears",
  "wizard",
  "phones",
  "butterfly",
  "wand",
] as const;

export type StickerKind = (typeof STICKER_KINDS)[number];

export const STICKER_LABELS: Record<StickerKind, string> = {
  crown: "Crown",
  party: "Party hat",
  bow: "Bow",
  glasses: "Star glasses",
  scarf: "Scarf",
  flower: "Flower",
  cape: "Cape",
  ears: "Bunny ears",
  wizard: "Wizard hat",
  phones: "Headphones",
  butterfly: "Butterfly",
  wand: "Wand",
};

export function stickerSvg(kind: StickerKind): string {
  const body: Record<StickerKind, string> = {
    crown: `<path d="M10 52 L16 24 L30 40 L40 16 L50 40 L64 24 L70 52 Z" fill="#ffd166" stroke="#243056" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="16" cy="22" r="4" fill="#f25c54"/><circle cx="40" cy="14" r="4" fill="#4dabf7"/><circle cx="64" cy="22" r="4" fill="#7dce6a"/>
      <rect x="12" y="50" width="56" height="10" rx="3" fill="#ffb703" stroke="#243056" stroke-width="3"/>`,
    party: `<path d="M40 10 L62 62 H18 Z" fill="#ff8fab" stroke="#243056" stroke-width="3"/>
      <path d="M32 28 H48 M30 40 H50" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
      <circle cx="40" cy="10" r="5" fill="#ffd166" stroke="#243056" stroke-width="3"/>`,
    bow: `<path d="M40 40 L14 22 Q8 40 14 58 Z" fill="#f25c54" stroke="#243056" stroke-width="3"/>
      <path d="M40 40 L66 22 Q72 40 66 58 Z" fill="#ff8b84" stroke="#243056" stroke-width="3"/>
      <circle cx="40" cy="40" r="7" fill="#ffd166" stroke="#243056" stroke-width="3"/>`,
    glasses: `<circle cx="26" cy="40" r="14" fill="none" stroke="#243056" stroke-width="4"/>
      <circle cx="54" cy="40" r="14" fill="none" stroke="#243056" stroke-width="4"/>
      <path d="M40 40 H40" stroke="#243056" stroke-width="4"/>
      <path d="M12 36 H14 M66 36 H70" stroke="#243056" stroke-width="4" stroke-linecap="round"/>
      <polygon points="26,34 30,42 22,42" fill="#ffd166"/>
      <polygon points="54,34 58,42 50,42" fill="#ffd166"/>`,
    scarf: `<path d="M14 28 H66 Q70 46 40 50 Q10 46 14 28 Z" fill="#4dabf7" stroke="#243056" stroke-width="3"/>
      <path d="M30 48 L24 70 L36 62 L32 48 M50 48 L58 72 L44 60" fill="#ffd166" stroke="#243056" stroke-width="3" stroke-linejoin="round"/>`,
    flower: `<circle cx="40" cy="36" r="8" fill="#ffd166"/>
      <g fill="#ff8fab" stroke="#243056" stroke-width="2">
        <circle cx="40" cy="18" r="8"/><circle cx="40" cy="54" r="8"/>
        <circle cx="22" cy="36" r="8"/><circle cx="58" cy="36" r="8"/>
      </g>
      <circle cx="40" cy="36" r="6" fill="#ffd166" stroke="#243056" stroke-width="2"/>`,
    cape: `<path d="M18 18 Q40 8 62 18 L70 68 Q40 54 10 68 Z" fill="#b388ff" stroke="#243056" stroke-width="3"/>
      <path d="M40 16 V30" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>`,
    ears: `<ellipse cx="24" cy="44" rx="12" ry="28" fill="#fff" stroke="#243056" stroke-width="3"/>
      <ellipse cx="56" cy="44" rx="12" ry="28" fill="#fff" stroke="#243056" stroke-width="3"/>
      <ellipse cx="24" cy="46" rx="6" ry="16" fill="#ffd0dc"/>
      <ellipse cx="56" cy="46" rx="6" ry="16" fill="#ffd0dc"/>`,
    wizard: `<path d="M40 8 L64 62 H16 Z" fill="#6c4ab6" stroke="#243056" stroke-width="3"/>
      <ellipse cx="40" cy="62" rx="30" ry="8" fill="#b388ff" stroke="#243056" stroke-width="3"/>
      <circle cx="40" cy="30" r="4" fill="#ffd166"/><circle cx="32" cy="44" r="3" fill="#fff"/>`,
    phones: `<path d="M16 32 Q16 18 28 18 H32 V48 H28 Q16 48 16 36 Z" fill="#ffb703" stroke="#243056" stroke-width="3"/>
      <path d="M64 32 Q64 18 52 18 H48 V48 H52 Q64 48 64 36 Z" fill="#ffb703" stroke="#243056" stroke-width="3"/>
      <path d="M32 24 H48" stroke="#243056" stroke-width="4" stroke-linecap="round"/>
      <circle cx="24" cy="34" r="4" fill="#243056"/><circle cx="56" cy="34" r="4" fill="#243056"/>`,
    butterfly: `<ellipse cx="24" cy="34" rx="16" ry="12" fill="#ff8fab" stroke="#243056" stroke-width="3"/>
      <ellipse cx="56" cy="34" rx="16" ry="12" fill="#b388ff" stroke="#243056" stroke-width="3"/>
      <ellipse cx="24" cy="52" rx="12" ry="10" fill="#ffd166" stroke="#243056" stroke-width="3"/>
      <ellipse cx="56" cy="52" rx="12" ry="10" fill="#7dce6a" stroke="#243056" stroke-width="3"/>
      <rect x="36" y="28" width="8" height="28" rx="4" fill="#243056"/>
      <path d="M38 30 Q30 18 34 14 M42 30 Q50 18 46 14" fill="none" stroke="#243056" stroke-width="2"/>`,
    wand: `<line x1="18" y1="62" x2="58" y2="16" stroke="#f4a261" stroke-width="6" stroke-linecap="round"/>
      <polygon points="62,8 70,20 54,22" fill="#ffd166" stroke="#243056" stroke-width="3"/>
      <circle cx="22" cy="58" r="3" fill="#fff"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">${body[kind]}</svg>`;
}
