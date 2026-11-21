import { useId } from "react";

export type PipMood = "happy" | "think" | "proud" | "calm";

export function Pip({ mood = "happy", size = 168 }: { mood?: PipMood; size?: number }) {
  const think = mood === "think";
  const proud = mood === "proud";
  const calm = mood === "calm";
  const pupilDy = think ? -18 : calm ? 8 : 0;
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      className="pip"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      role="img"
      aria-label={
        mood === "proud"
          ? "Pip looking proud"
          : mood === "think"
            ? "Pip thinking"
            : mood === "calm"
              ? "Pip feeling calm"
              : "Pip smiling"
      }
    >
      <defs>
        <linearGradient id={`${uid}top`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8aabd8" />
          <stop offset="100%" stopColor="#f2f7ff" />
        </linearGradient>
        <linearGradient id={`${uid}front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b86c4" />
          <stop offset="100%" stopColor="#2b4a80" />
        </linearGradient>
        <linearGradient id={`${uid}side`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#243a64" />
          <stop offset="100%" stopColor="#10192e" />
        </linearGradient>
        <linearGradient id={`${uid}suit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc66e" />
          <stop offset="45%" stopColor="#ff7a2a" />
          <stop offset="100%" stopColor="#d24c0c" />
        </linearGradient>
        <linearGradient id={`${uid}suitside`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e25a12" />
          <stop offset="100%" stopColor="#8f3208" />
        </linearGradient>
      </defs>
      <ellipse cx="500" cy="990" rx="230" ry="22" fill="#0c1830" opacity="0.28" />
      <polygon points="340,820 520,820 520,1010 340,1010" fill="#1b3560" stroke="#071018" strokeWidth="16" strokeLinejoin="round" />
      <polygon points="540,820 710,820 740,1010 570,1010" fill="#122644" stroke="#071018" strokeWidth="16" strokeLinejoin="round" />
      <polygon points="730,640 830,590 830,860 730,910" fill={`url(#${uid}suitside)`} stroke="#071018" strokeWidth="16" strokeLinejoin="round" />
      <polygon points="190,620 730,620 730,900 190,900" fill={`url(#${uid}suit)`} stroke="#071018" strokeWidth="18" strokeLinejoin="round" />
      <polygon points="210,620 710,620 690,648 230,648" fill="#ffe4ad" opacity="0.8" />
      <rect x="400" y="700" width="110" height="80" rx="10" fill="#ffe14a" stroke="#071018" strokeWidth="10" />
      <rect x="418" y="714" width="74" height="14" rx="4" fill="#fff6c4" />
      <polygon points="70,660 190,640 190,780 70,760" fill="#ffb04a" stroke="#071018" strokeWidth="14" strokeLinejoin="round" />
      <polygon points="730,660 850,700 850,800 730,780" fill="#b4450e" stroke="#071018" strokeWidth="14" strokeLinejoin="round" />
      <polygon points="730,250 830,180 830,600 730,670" fill={`url(#${uid}side)`} stroke="#071018" strokeWidth="18" strokeLinejoin="round" />
      <polygon points="150,250 730,250 830,180 250,180" fill={`url(#${uid}top)`} stroke="#071018" strokeWidth="18" strokeLinejoin="round" />
      <polygon points="150,250 730,250 730,670 150,670" fill={`url(#${uid}front)`} stroke="#071018" strokeWidth="18" strokeLinejoin="round" />
      <polyline points="168,268 712,268" fill="none" stroke="#f7fbff" strokeWidth="14" strokeLinecap="round" opacity="0.95" />
      <polyline points="168,268 168,650" fill="none" stroke="#f7fbff" strokeWidth="8" strokeLinecap="round" opacity="0.45" />
      <rect x="200" y="330" width="470" height="170" rx="24" fill="#042830" stroke="#071018" strokeWidth="12" />
      <rect x="216" y="344" width="438" height="28" rx="10" fill="#7ef6ff" opacity="0.75" />
      {proud ? (
        <g fill="none" stroke="#d6ff4a" strokeWidth="16" strokeLinecap="round">
          <path d="M260 420 H390" />
          <path d="M500 420 H630" />
        </g>
      ) : (
        <g>
          <rect x="250" y={calm ? 386 : 368} width="128" height={calm ? 78 : 110} rx="36" fill="#f7fbff" stroke="#071018" strokeWidth="8" />
          <rect x="490" y={calm ? 386 : 368} width="128" height={calm ? 78 : 110} rx="36" fill="#f7fbff" stroke="#071018" strokeWidth="8" />
          <circle cx="322" cy={426 + pupilDy} r={calm ? 18 : 32} fill="#122033" />
          <circle cx="552" cy={418 + pupilDy} r={calm ? 18 : 32} fill="#122033" />
          <circle cx="308" cy={410 + pupilDy} r="12" fill="#7ef6ff" />
          <circle cx="538" cy={402 + pupilDy} r="12" fill="#7ef6ff" />
        </g>
      )}
      <path
        d={calm ? "M320 555 H590" : think ? "M310 568 Q440 600 600 568" : "M290 560 Q440 620 610 560"}
        fill="none"
        stroke="#d6ff4a"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <polygon points="420,178 560,178 620,228 480,228" fill="#f4ffb0" stroke="#071018" strokeWidth="12" strokeLinejoin="round" />
      <polygon points="560,178 620,228 620,298 560,248" fill="#8fc41c" stroke="#071018" strokeWidth="12" strokeLinejoin="round" />
      <polygon points="420,178 560,178 560,248 420,248" fill="#d6ff4a" stroke="#071018" strokeWidth="12" strokeLinejoin="round" />
      <polygon points="436,190 546,190 546,206 448,206" fill="#f7ffd4" />
    </svg>
  );
}
