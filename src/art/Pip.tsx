export type PipMood = "happy" | "think" | "proud" | "calm";

export function Pip({ mood = "happy", size = 168 }: { mood?: PipMood; size?: number }) {
  const think = mood === "think";
  const proud = mood === "proud";
  const calm = mood === "calm";
  return (
    <svg
      className="pip"
      viewBox="0 0 200 190"
      width={size}
      height={size * 0.95}
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
      <ellipse cx="100" cy="172" rx="42" ry="8" fill="rgba(36,48,86,0.12)" />
      <path d="M78 78 Q58 36 72 24" fill="none" stroke="#ffb088" strokeWidth="6" strokeLinecap="round" />
      <path d="M122 78 Q142 36 128 24" fill="none" stroke="#ffb088" strokeWidth="6" strokeLinecap="round" />
      <circle className="anim-twinkle" cx="70" cy="20" r="7" fill="#ffe08a" />
      <circle className="anim-twinkle" cx="130" cy="20" r="7" fill="#ffe08a" />
      <ellipse cx="62" cy="104" rx="22" ry="16" fill="#fff4c2" opacity="0.9" />
      <ellipse cx="138" cy="104" rx="22" ry="16" fill="#fff4c2" opacity="0.9" />
      <ellipse cx="100" cy="112" rx="58" ry="50" fill="#ffb088" />
      <ellipse cx="100" cy="124" rx="34" ry="28" fill="#fff1e6" />
      <ellipse cx="76" cy="158" rx="14" ry="8" fill="#f4a07a" />
      <ellipse cx="124" cy="158" rx="14" ry="8" fill="#f4a07a" />
      {proud ? (
        <g fill="none" stroke="#243056" strokeWidth="4" strokeLinecap="round">
          <path d="M74 108 Q86 120 98 108" />
          <path d="M102 108 Q114 120 126 108" />
        </g>
      ) : (
        <g>
          <ellipse cx={think ? 86 : 82} cy={think ? 102 : calm ? 108 : 106} rx="7" ry={calm ? 5 : 9} fill="#243056" />
          <ellipse cx={think ? 122 : 118} cy={think ? 96 : calm ? 108 : 106} rx="7" ry={calm ? 5 : 9} fill="#243056" />
          {!calm && (
            <g fill="#fff">
              <circle cx={think ? 88 : 84} cy={think ? 100 : 104} r="2.1" />
              <circle cx={think ? 124 : 120} cy={think ? 94 : 104} r="2.1" />
            </g>
          )}
        </g>
      )}
      <circle cx="64" cy="120" r="8" fill="#ffb1a6" />
      <circle cx="136" cy="120" r="8" fill="#ffb1a6" />
      <path
        d={calm ? "M88 132 H112" : "M86 130 Q100 146 114 130"}
        fill="none"
        stroke="#243056"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
