export type PipMood = "happy" | "think" | "proud" | "calm";

function Brick({
  x,
  y,
  w,
  h,
  fill,
  shade = "#0c1018",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  shade?: string;
}) {
  return (
    <g>
      <rect x={x + 5} y={y + 6} width={w} height={h} rx={4} fill={shade} opacity={0.45} />
      <rect x={x} y={y} width={w} height={h} rx={5} fill={fill} stroke="#12141c" strokeWidth={3} />
      <rect x={x + 4} y={y + 4} width={w - 10} height={6} rx={2} fill="rgba(255,255,255,0.35)" />
      <rect x={x + w - 9} y={y + 8} width={5} height={h - 16} fill="rgba(0,0,0,0.22)" />
    </g>
  );
}

export function Pip({ mood = "happy", size = 168 }: { mood?: PipMood; size?: number }) {
  const think = mood === "think";
  const proud = mood === "proud";
  const calm = mood === "calm";
  const eyeY = think ? 78 : 84;
  const eyeH = calm ? 10 : 16;
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
      <rect x="48" y="168" width="104" height="10" rx="3" fill="rgba(0,0,0,0.35)" />
      <Brick x={78} y={22} w={16} h={14} fill="#d6ff4a" />
      <rect x="84" y="34" width="8" height="16" rx="2" fill="#2a3348" stroke="#12141c" strokeWidth={2} />
      <Brick x={46} y={48} w={108} h={78} fill="#2c3858" />
      <rect x="58" y="62" width="84" height="28" rx="4" fill="#12323a" stroke="#12141c" strokeWidth={3} />
      <rect x="62" y="66" width="76" height="8" rx="2" fill="#7ef6ff" opacity={0.85} />
      {proud ? (
        <g fill="none" stroke="#d6ff4a" strokeWidth={5} strokeLinecap="square">
          <path d="M66 90 H86" />
          <path d="M114 90 H134" />
        </g>
      ) : (
        <g>
          <rect x={64} y={eyeY} width={22} height={eyeH} rx={3} fill="#f4f7ff" stroke="#12141c" strokeWidth={2} />
          <rect x={114} y={eyeY} width={22} height={eyeH} rx={3} fill="#f4f7ff" stroke="#12141c" strokeWidth={2} />
          <rect x={72} y={eyeY + 3} width={8} height={Math.max(6, eyeH - 6)} fill="#12141c" />
          <rect x={122} y={eyeY + 3} width={8} height={Math.max(6, eyeH - 6)} fill="#12141c" />
          <rect x={73} y={eyeY + 4} width={3} height={3} fill="#7ef6ff" />
          <rect x={123} y={eyeY + 4} width={3} height={3} fill="#7ef6ff" />
        </g>
      )}
      <path
        d={calm ? "M84 118 H116" : "M76 112 Q100 132 124 112"}
        fill="none"
        stroke="#d6ff4a"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <Brick x={58} y={122} w={84} h={36} fill="#ff7a3c" />
      <rect x="90" y="130" width="20" height="16" rx={2} fill="#f0b429" stroke="#12141c" strokeWidth={2} />
      <Brick x={40} y={128} w={22} h={28} fill="#ff7a3c" />
      <Brick x={138} y={128} w={22} h={28} fill="#ff7a3c" />
      <Brick x={70} y={154} w={22} h={16} fill="#1c2436" />
      <Brick x={108} y={154} w={22} h={16} fill="#1c2436" />
    </svg>
  );
}
