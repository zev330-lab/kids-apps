import type { ReactNode } from "react";
import type { SpriteName } from "./types";

function Eyes({ y = 0, spread = 11, r = 3.2 }: { y?: number; spread?: number; r?: number }) {
  return (
    <g>
      <circle cx={-spread} cy={y} r={r} fill="#243056" />
      <circle cx={spread} cy={y} r={r} fill="#243056" />
      <circle cx={-spread + 1.1} cy={y - 1.1} r={1.1} fill="#fff" />
      <circle cx={spread + 1.1} cy={y - 1.1} r={1.1} fill="#fff" />
    </g>
  );
}

function Smile({ y = 12, w = 8 }: { y?: number; w?: number }) {
  return (
    <path
      d={`M${-w} ${y} Q0 ${y + 8} ${w} ${y}`}
      fill="none"
      stroke="#243056"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  );
}

function Cheeks({ y = 8 }: { y?: number }) {
  return (
    <g>
      <circle cx="-16" cy={y} r="4.2" fill="#ffb1a6" />
      <circle cx="16" cy={y} r="4.2" fill="#ffb1a6" />
    </g>
  );
}

function RoundBuddy({
  body,
  belly = "#fff6e8",
  ear = "round",
  children,
}: {
  body: string;
  belly?: string;
  ear?: "round" | "point" | "tall" | "floppy" | "none";
  children?: ReactNode;
}) {
  return (
    <g>
      {ear === "tall" && (
        <g>
          <ellipse cx="-14" cy="-34" rx="7" ry="20" fill={body} />
          <ellipse cx="14" cy="-34" rx="7" ry="20" fill={body} />
          <ellipse cx="-14" cy="-34" rx="3.4" ry="12" fill="#ffd0dc" />
          <ellipse cx="14" cy="-34" rx="3.4" ry="12" fill="#ffd0dc" />
        </g>
      )}
      {ear === "point" && (
        <g>
          <path d="M-22 -6 L-14 -32 L-4 -8 Z" fill={body} />
          <path d="M22 -6 L14 -32 L4 -8 Z" fill={body} />
          <path d="M-18 -10 L-14 -24 L-8 -10 Z" fill="#ffd0dc" />
          <path d="M18 -10 L14 -24 L8 -10 Z" fill="#ffd0dc" />
        </g>
      )}
      {ear === "round" && (
        <g>
          <circle cx="-20" cy="-16" r="10" fill={body} />
          <circle cx="20" cy="-16" r="10" fill={body} />
          <circle cx="-20" cy="-16" r="5" fill="#ffd6e0" />
          <circle cx="20" cy="-16" r="5" fill="#ffd6e0" />
        </g>
      )}
      {ear === "floppy" && (
        <g>
          <ellipse cx="-24" cy="-2" rx="10" ry="16" fill={body} />
          <ellipse cx="24" cy="-2" rx="10" ry="16" fill={body} />
        </g>
      )}
      <ellipse cx="0" cy="8" rx="28" ry="24" fill={body} />
      <ellipse cx="0" cy="14" rx="16" ry="13" fill={belly} />
      <Eyes y={2} />
      <Smile />
      <Cheeks />
      {children}
    </g>
  );
}

function Rocket() {
  return (
    <g>
      <path d="M0 -62 C22 -40 26 -8 22 28 L-22 28 C-26 -8 -22 -40 0 -62 Z" fill="#f25c54" />
      <path d="M0 -62 C10 -44 12 -20 10 6 L-10 6 C-12 -20 -10 -44 0 -62 Z" fill="#ff8b84" />
      <path d="M-22 10 L-40 36 L-12 24 Z" fill="#ffb703" />
      <path d="M22 10 L40 36 L12 24 Z" fill="#ffb703" />
      <rect x="-16" y="20" width="32" height="22" rx="8" fill="#4dabf7" />
      <circle cx="0" cy="-6" r="10" fill="#e7f6ff" stroke="#243056" strokeWidth="2" />
      <Eyes y={-7} spread={4} r={1.7} />
      <path d="M-8 42 L0 68 L8 42 Z" fill="#ffe08a" />
      <path d="M-4 42 L0 58 L4 42 Z" fill="#fff" />
    </g>
  );
}

function Moon() {
  return (
    <g>
      <circle r="34" fill="#ffe8a3" />
      <circle cx="10" cy="-6" r="28" fill="#fff4cc" />
      <circle cx="-8" cy="-6" r="4" fill="#f3d98a" />
      <circle cx="8" cy="10" r="6" fill="#f3d98a" />
      <circle cx="-4" cy="14" r="3" fill="#f3d98a" />
      <Eyes y={-2} spread={8} r={2.4} />
      <Smile y={8} w={7} />
    </g>
  );
}

function Sun() {
  return (
    <g>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = Math.cos(a) * 28;
        const y1 = Math.sin(a) * 28;
        const x2 = Math.cos(a) * 44;
        const y2 = Math.sin(a) * 44;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#ffb703"
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
      <circle r="26" fill="#ffd166" />
      <Eyes spread={8} />
      <Smile y={8} />
      <Cheeks y={6} />
    </g>
  );
}

function Cloud() {
  return (
    <g fill="#fff">
      <ellipse cx="0" cy="6" rx="32" ry="18" />
      <ellipse cx="-20" cy="8" rx="16" ry="12" />
      <ellipse cx="18" cy="6" rx="18" ry="14" />
      <ellipse cx="0" cy="-6" rx="16" ry="14" />
    </g>
  );
}

function Star() {
  const pts = Array.from({ length: 10 })
    .map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 28 : 12;
      return `${Math.cos(a) * r},${Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <g>
      <polygon points={pts} fill="#ffd166" stroke="#f4a261" strokeWidth="2" strokeLinejoin="round" />
    </g>
  );
}

function Comet() {
  return (
    <g>
      <path d="M-8 0 C10 0 34 -8 58 -2 C34 6 12 10 -8 6 Z" fill="#c9b6ff" />
      <path d="M-4 2 C16 2 36 -2 52 2 C34 6 14 8 -4 6 Z" fill="#ffe08a" />
      <circle r="18" fill="#fff6e8" stroke="#243056" strokeWidth="2" />
      <Eyes spread={6} r={2.2} />
      <Smile y={6} w={5} />
    </g>
  );
}

function Satellite() {
  return (
    <g>
      <rect x="-34" y="-10" width="18" height="22" rx="3" fill="#8ecae6" stroke="#243056" strokeWidth="2" />
      <rect x="16" y="-10" width="18" height="22" rx="3" fill="#8ecae6" stroke="#243056" strokeWidth="2" />
      <rect x="-14" y="-16" width="28" height="32" rx="8" fill="#fff6e8" stroke="#243056" strokeWidth="2" />
      <Eyes y={-4} spread={6} r={2} />
      <Smile y={6} w={5} />
      <circle cx="0" cy="-24" r="4" fill="#f25c54" />
      <line x1="0" y1="-20" x2="0" y2="-16" stroke="#243056" strokeWidth="2" />
    </g>
  );
}

function Crystal() {
  return (
    <g>
      <path d="M0 -40 L22 -8 L16 36 L-16 36 L-22 -8 Z" fill="#b8f2ff" stroke="#243056" strokeWidth="2" />
      <path d="M0 -40 L8 -8 L0 36 L-8 -8 Z" fill="#e7fbff" />
      <Eyes y={2} spread={6} r={2} />
      <Smile y={12} w={5} />
    </g>
  );
}

function Kite() {
  return (
    <g>
      <path d="M0 -36 L26 0 L0 36 L-26 0 Z" fill="#f25c54" stroke="#243056" strokeWidth="2" />
      <path d="M0 -36 L8 0 L0 36 L-8 0 Z" fill="#ffd166" />
      <path d="M0 36 q8 16 -2 28 q10 4 6 16" fill="none" stroke="#243056" strokeWidth="2" />
      <Eyes y={-2} spread={5} r={1.8} />
    </g>
  );
}

function Flag() {
  return (
    <g>
      <line x1="-16" y1="-40" x2="-16" y2="40" stroke="#8d5a3b" strokeWidth="4" strokeLinecap="round" />
      <path d="M-14 -36 H24 L14 -18 L24 0 H-14 Z" fill="#4dabf7" stroke="#243056" strokeWidth="2" />
      <path d="M-4 -28 L2 -22 L-4 -16 L2 -10" fill="none" stroke="#fff" strokeWidth="2" />
    </g>
  );
}

function Flower() {
  return (
    <g>
      <line x1="0" y1="8" x2="0" y2="40" stroke="#3a9d4e" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="-10" cy="22" rx="7" ry="4" fill="#7dce6a" transform="rotate(-30 -10 22)" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 14} cy={Math.sin(a) * 14 - 8} r="8" fill="#ff8fab" />;
      })}
      <circle cy="-8" r="7" fill="#ffd166" />
    </g>
  );
}

function Tree() {
  return (
    <g>
      <rect x="-6" y="8" width="12" height="32" rx="4" fill="#8d5a3b" />
      <circle cy="-8" r="26" fill="#3a9d4e" />
      <circle cx="-16" cy="0" r="16" fill="#57b56a" />
      <circle cx="16" cy="-2" r="14" fill="#2f8a45" />
      <circle cx="-6" cy="-18" r="6" fill="#c8f7a0" opacity="0.8" />
    </g>
  );
}

function Mushroom() {
  return (
    <g>
      <path d="M-8 8 H8 V28 Q0 36 -8 28 Z" fill="#fff1dc" stroke="#243056" strokeWidth="2" />
      <path d="M-32 8 Q0 -36 32 8 Z" fill="#f25c54" />
      <circle cx="-12" cy="-4" r="4" fill="#fff6e8" />
      <circle cx="8" cy="-8" r="5" fill="#fff6e8" />
      <circle cx="14" cy="2" r="3" fill="#fff6e8" />
    </g>
  );
}

function Unicorn() {
  return (
    <g>
      <RoundBuddy body="#f7f2ff" ear="point">
        <path d="M-2 -28 L8 -58 L12 -26 Z" fill="#ffd166" stroke="#243056" strokeWidth="2" />
        <path d="M20 16 Q40 8 34 28" fill="none" stroke="#e7d9ff" strokeWidth="6" strokeLinecap="round" />
      </RoundBuddy>
    </g>
  );
}

function Lily() {
  return (
    <g>
      <path d="M0 10 C-20 10 -28 -10 -10 -18 C-4 -8 4 -8 10 -18 C28 -10 20 10 0 10 Z" fill="#fff" stroke="#b8c0ff" strokeWidth="2" />
      <circle r="4" fill="#ffd166" />
      <path d="M0 10 V36" stroke="#3a9d4e" strokeWidth="3" />
    </g>
  );
}

function Book() {
  return (
    <g>
      <path d="M-28 -18 H0 V24 H-28 Q-34 4 -28 -18 Z" fill="#f25c54" />
      <path d="M28 -18 H0 V24 H28 Q34 4 28 -18 Z" fill="#4dabf7" />
      <path d="M-22 -8 H-6 M-22 0 H-8 M-22 8 H-10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 -8 H22 M8 0 H20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Lantern() {
  return (
    <g>
      <line x1="0" y1="-40" x2="0" y2="-22" stroke="#8d5a3b" strokeWidth="3" />
      <rect x="-16" y="-22" width="32" height="36" rx="8" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <rect x="-8" y="-14" width="16" height="18" rx="4" fill="#fff6e8" />
      <path d="M-6 24 H6 L4 34 H-4 Z" fill="#f4a261" />
      <circle cy="-4" r="3" fill="#f25c54" />
    </g>
  );
}

function Cup() {
  return (
    <g>
      <path d="M-20 -8 H18 L12 28 H-14 Z" fill="#fff" stroke="#243056" strokeWidth="2" />
      <path d="M18 0 H28 Q34 10 18 16" fill="none" stroke="#243056" strokeWidth="3" />
      <path d="M-12 -8 Q-4 -20 6 -8" fill="none" stroke="#b8c0ff" strokeWidth="3" />
      <ellipse cx="-2" cy="4" rx="8" ry="4" fill="#d7f7ef" />
    </g>
  );
}

function Sprout() {
  return (
    <g>
      <path d="M0 8 V36" stroke="#3a9d4e" strokeWidth="3" />
      <ellipse cx="-8" cy="0" rx="10" ry="6" fill="#7dce6a" transform="rotate(-30 -8 0)" />
      <ellipse cx="8" cy="-2" rx="10" ry="6" fill="#57b56a" transform="rotate(30 8 -2)" />
    </g>
  );
}

function Dolphin() {
  return (
    <g>
      <path d="M-40 6 Q-10 -28 30 -6 Q10 8 -6 10 Q-20 28 -28 8 Z" fill="#7fdbff" stroke="#243056" strokeWidth="2" />
      <path d="M-6 -2 Q10 -18 24 -8" fill="none" stroke="#243056" strokeWidth="2" />
      <circle cx="16" cy="-8" r="2.4" fill="#243056" />
      <path d="M24 -4 Q30 0 24 4" fill="none" stroke="#243056" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="2" r="3" fill="#ffb1a6" />
    </g>
  );
}

function Whale() {
  return (
    <g>
      <path d="M-46 8 Q-20 -36 40 -4 Q20 28 -20 18 Q-10 40 -24 16 Z" fill="#8ecae6" stroke="#243056" strokeWidth="2" />
      <path d="M-30 4 Q-6 -8 16 2" fill="#fff" />
      <circle cx="22" cy="-6" r="3" fill="#243056" />
      <path d="M30 -2 Q38 2 30 6" fill="none" stroke="#243056" strokeWidth="2" strokeLinecap="round" />
      <path d="M-8 -20 L-2 -34 L6 -18" fill="#5fa8d3" />
    </g>
  );
}

function Turtle() {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="28" ry="20" fill="#7dce6a" stroke="#243056" strokeWidth="2" />
      <path d="M-14 -6 H14 M-8 6 H10 M0 -14 V16" stroke="#3a9d4e" strokeWidth="2" />
      <circle cx="30" cy="-2" r="10" fill="#b7e4a8" stroke="#243056" strokeWidth="2" />
      <Eyes y={-4} spread={0} r={0} />
      <circle cx="33" cy="-4" r="1.8" fill="#243056" />
      <path d="M28 2 Q33 6 36 2" fill="none" stroke="#243056" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="-8" cy="22" rx="7" ry="4" fill="#b7e4a8" />
      <ellipse cx="10" cy="22" rx="7" ry="4" fill="#b7e4a8" />
    </g>
  );
}

function Seahorse() {
  return (
    <g>
      <path
        d="M0 -36 C16 -36 20 -18 8 -12 C20 -8 18 10 4 14 C14 20 8 36 -2 30 C-12 36 -6 16 -2 10 C-14 8 -14 -20 0 -36 Z"
        fill="#f4a261"
        stroke="#243056"
        strokeWidth="2"
      />
      <circle cx="4" cy="-24" r="2" fill="#243056" />
      <path d="M-2 -18 Q4 -14 2 -10" fill="none" stroke="#243056" strokeWidth="1.6" />
      <circle cx="-4" cy="-16" r="2.4" fill="#ffb1a6" />
    </g>
  );
}

function Octopus() {
  return (
    <g>
      <path d="M-28 10 Q-34 36 -18 28 Q-16 42 -4 26 Q-2 44 10 26 Q14 42 24 24 Q36 36 28 8 Q20 -28 -20 -20 Q-36 -8 -28 10 Z" fill="#c9b6ff" stroke="#243056" strokeWidth="2" />
      <Eyes y={-8} spread={8} />
      <Smile y={2} w={6} />
      <Cheeks y={0} />
    </g>
  );
}

function Crab() {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="24" ry="16" fill="#f25c54" stroke="#243056" strokeWidth="2" />
      <circle cx="-16" cy="-8" r="6" fill="#f25c54" stroke="#243056" strokeWidth="2" />
      <circle cx="16" cy="-8" r="6" fill="#f25c54" stroke="#243056" strokeWidth="2" />
      <path d="M-24 0 L-36 -12 M-24 8 L-38 8 M24 0 L36 -12 M24 8 L38 8" stroke="#243056" strokeWidth="2" strokeLinecap="round" />
      <Eyes y={2} spread={8} r={2.2} />
      <Smile y={10} w={6} />
    </g>
  );
}

function Sub() {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="40" ry="18" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <rect x="-8" y="-22" width="16" height="16" rx="4" fill="#ffb703" stroke="#243056" strokeWidth="2" />
      <circle cx="12" cy="4" r="7" fill="#e7f6ff" stroke="#243056" strokeWidth="2" />
      <circle cx="-14" cy="6" r="3" fill="#f25c54" />
      <circle cx="-24" cy="-16" r="3" fill="#fff" />
      <circle cx="-16" cy="-26" r="2" fill="#fff" />
    </g>
  );
}

function Palace() {
  return (
    <g>
      <path d="M-36 28 V-4 L-18 -28 L0 -4 L18 -28 L36 -4 V28 Z" fill="#ffd6e0" stroke="#243056" strokeWidth="2" />
      <path d="M-18 -28 L-10 -8 H-26 Z" fill="#f25c54" />
      <path d="M18 -28 L26 -8 H10 Z" fill="#4dabf7" />
      <rect x="-8" y="6" width="16" height="22" rx="8" fill="#ffb703" />
      <circle cy="-2" r="4" fill="#7fdbff" />
    </g>
  );
}

function Fish() {
  return (
    <g>
      <ellipse cx="-2" cy="0" rx="22" ry="12" fill="#4dabf7" stroke="#243056" strokeWidth="2" />
      <path d="M16 -10 L30 0 L16 10 Z" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <circle cx="-10" cy="-2" r="2" fill="#243056" />
      <path d="M-16 6 Q-8 10 0 6" fill="none" stroke="#243056" strokeWidth="1.6" />
    </g>
  );
}

function Pearl() {
  return (
    <g>
      <circle r="16" fill="#fff" stroke="#d7e3ff" strokeWidth="3" />
      <ellipse cx="-5" cy="-6" rx="5" ry="3" fill="#fff" opacity="0.9" />
      <circle r="16" fill="none" stroke="#243056" strokeWidth="1.4" />
    </g>
  );
}

function Shell() {
  return (
    <g>
      <path d="M-20 10 Q-8 -28 18 -4 Q4 8 10 18 Q-8 22 -20 10 Z" fill="#ffd6e0" stroke="#243056" strokeWidth="2" />
      <path d="M-8 6 Q0 -10 8 0 Q2 6 4 12" fill="none" stroke="#f4a261" strokeWidth="2" />
    </g>
  );
}

function Cake() {
  return (
    <g>
      <rect x="-24" y="0" width="48" height="22" rx="6" fill="#ffb7d5" stroke="#243056" strokeWidth="2" />
      <rect x="-18" y="-14" width="36" height="16" rx="6" fill="#fff6e8" stroke="#243056" strokeWidth="2" />
      <rect x="-24" y="6" width="48" height="6" fill="#ff8fab" />
      <circle cy="-22" r="4" fill="#f25c54" />
      <line x1="0" y1="-18" x2="0" y2="-14" stroke="#243056" strokeWidth="2" />
    </g>
  );
}

function Apple() {
  return (
    <g>
      <circle cy="4" r="20" fill="#f25c54" />
      <ellipse cx="-6" cy="0" rx="6" ry="10" fill="#ff6b63" />
      <path d="M0 -16 Q8 -28 4 -32" fill="none" stroke="#3a9d4e" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="8" cy="-18" rx="7" ry="4" fill="#7dce6a" transform="rotate(20 8 -18)" />
      <Eyes y={2} spread={6} r={1.8} />
      <Smile y={10} w={4} />
    </g>
  );
}

function Hill() {
  return <ellipse cx="0" cy="16" rx="70" ry="28" fill="#7dce6a" />;
}

function Balloon() {
  return (
    <g>
      <ellipse cy="-8" rx="16" ry="22" fill="#b388ff" stroke="#243056" strokeWidth="2" />
      <path d="M0 14 L4 20 H-4 Z" fill="#b388ff" />
      <path d="M0 20 Q6 32 -2 42" fill="none" stroke="#243056" strokeWidth="2" />
      <ellipse cx="-5" cy="-14" rx="4" ry="6" fill="#fff" opacity="0.45" />
    </g>
  );
}

function Heart() {
  return (
    <path
      d="M0 16 C-22 2 -18 -16 -6 -12 C0 -22 6 -12 18 -16 C18 2 0 16 0 16 Z"
      fill="#f25c54"
      stroke="#243056"
      strokeWidth="2"
    />
  );
}

function Candy() {
  return (
    <g>
      <circle r="14" fill="#ff8fab" stroke="#243056" strokeWidth="2" />
      <circle r="6" fill="#fff" />
      <rect x="-3" y="-40" width="6" height="28" rx="3" fill="#fff" stroke="#243056" strokeWidth="2" />
      <path d="M-16 2 L-28 8 L-16 12 M16 2 L28 8 L16 12" fill="#ffd166" stroke="#243056" strokeWidth="2" />
    </g>
  );
}

function Cookie() {
  return (
    <g>
      <circle r="20" fill="#e0a15a" stroke="#243056" strokeWidth="2" />
      <circle cx="-6" cy="-4" r="3" fill="#8d5a3b" />
      <circle cx="6" cy="2" r="2.4" fill="#8d5a3b" />
      <circle cx="-2" cy="8" r="2.2" fill="#8d5a3b" />
      <circle cx="7" cy="-8" r="2" fill="#8d5a3b" />
    </g>
  );
}

function Crayon() {
  return (
    <g transform="rotate(-20)">
      <rect x="-8" y="-28" width="16" height="40" rx="3" fill="#4dabf7" stroke="#243056" strokeWidth="2" />
      <path d="M-8 12 L0 32 L8 12 Z" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <rect x="-8" y="-28" width="16" height="8" fill="#f25c54" />
    </g>
  );
}

function Blob() {
  return (
    <g>
      <path d="M-20 10 Q-32 -20 -4 -24 Q16 -40 26 -8 Q40 20 8 28 Q-10 40 -24 16 Q-30 20 -20 10 Z" fill="#ffb7d5" stroke="#243056" strokeWidth="2" />
      <Eyes y={-2} />
      <Smile y={8} />
      <Cheeks y={6} />
    </g>
  );
}

function Firefly() {
  return (
    <g>
      <path d="M-16 -6 Q-28 -28 -8 -20" fill="none" stroke="#ffb088" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 -6 Q28 -28 8 -20" fill="none" stroke="#ffb088" strokeWidth="3" strokeLinecap="round" />
      <circle cx="-10" cy="-24" r="3.5" fill="#ffe08a" />
      <circle cx="10" cy="-24" r="3.5" fill="#ffe08a" />
      <ellipse cx="-18" cy="2" rx="10" ry="7" fill="#fff4c2" opacity="0.85" />
      <ellipse cx="18" cy="2" rx="10" ry="7" fill="#fff4c2" opacity="0.85" />
      <ellipse cy="6" rx="16" ry="14" fill="#ffb088" />
      <ellipse cy="10" rx="9" ry="8" fill="#fff1e6" />
      <Eyes y={4} spread={5} r={2} />
      <Smile y={10} w={4} />
    </g>
  );
}

function Bug() {
  return (
    <g>
      <ellipse cy="4" rx="20" ry="16" fill="#7dce6a" stroke="#243056" strokeWidth="2" />
      <path d="M0 -12 V20" stroke="#3a9d4e" strokeWidth="2" />
      <circle cy="-12" r="10" fill="#b7e4a8" stroke="#243056" strokeWidth="2" />
      <path d="M-4 -20 L-10 -32 M4 -20 L10 -32" stroke="#243056" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-10" cy="-32" r="2" fill="#243056" />
      <circle cx="10" cy="-32" r="2" fill="#243056" />
      <Eyes y={-12} spread={4} r={1.6} />
      <Smile y={-6} w={3} />
    </g>
  );
}

function Hat() {
  return (
    <g>
      <ellipse cx="0" cy="14" rx="32" ry="8" fill="#4dabf7" stroke="#243056" strokeWidth="2" />
      <path d="M-16 12 Q0 -28 16 12 Z" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <rect x="-16" y="6" width="32" height="8" fill="#f25c54" />
    </g>
  );
}

function Bed() {
  return (
    <g>
      <rect x="-32" y="0" width="64" height="22" rx="6" fill="#8ecae6" stroke="#243056" strokeWidth="2" />
      <rect x="-28" y="-12" width="22" height="16" rx="5" fill="#fff" stroke="#243056" strokeWidth="2" />
      <path d="M-32 22 V30 M32 22 V30" stroke="#8d5a3b" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Pot() {
  return (
    <g>
      <path d="M-22 -4 H22 L16 24 H-16 Z" fill="#c9b6ff" stroke="#243056" strokeWidth="2" />
      <rect x="-24" y="-12" width="48" height="10" rx="4" fill="#b388ff" stroke="#243056" strokeWidth="2" />
      <path d="M-8 -12 V-20 M8 -12 V-20" stroke="#243056" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Ball() {
  return (
    <g>
      <circle r="20" fill="#f25c54" stroke="#243056" strokeWidth="2" />
      <path d="M-14 -14 Q0 0 14 -14 M-18 4 Q0 8 18 4" fill="none" stroke="#fff" strokeWidth="3" />
    </g>
  );
}

function Egg() {
  return <ellipse cy="2" rx="16" ry="22" fill="#fff6e8" stroke="#243056" strokeWidth="2" />;
}

function Leaf() {
  return (
    <g>
      <path d="M0 28 C-24 8 -18 -24 6 -28 C20 -4 16 16 0 28 Z" fill="#7dce6a" stroke="#243056" strokeWidth="2" />
      <path d="M2 20 C0 4 4 -16 8 -24" fill="none" stroke="#3a9d4e" strokeWidth="2" />
    </g>
  );
}

function Nest() {
  return (
    <g>
      <path d="M-28 4 Q-20 28 0 24 Q20 28 28 4 Q10 16 -10 16 Q-24 12 -28 4 Z" fill="#e0a15a" stroke="#243056" strokeWidth="2" />
      <ellipse cy="-2" rx="8" ry="10" fill="#fff6e8" stroke="#243056" strokeWidth="2" />
    </g>
  );
}

function Umbrella() {
  return (
    <g>
      <path d="M-32 4 Q0 -36 32 4 Z" fill="#4dabf7" stroke="#243056" strokeWidth="2" />
      <path d="M-16 4 Q-10 -8 -4 4 M4 4 Q10 -8 16 4" fill="none" stroke="#243056" strokeWidth="2" />
      <path d="M0 4 V30 Q0 40 10 36" fill="none" stroke="#243056" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Igloo() {
  return (
    <g>
      <path d="M-36 20 Q-36 -28 0 -28 Q36 -28 36 20 Z" fill="#f4f7ff" stroke="#243056" strokeWidth="2" />
      <path d="M-20 20 Q-8 2 0 20" fill="#8ecae6" stroke="#243056" strokeWidth="2" />
      <path d="M-36 4 H36 M-28 -8 H28 M-16 -18 H16" stroke="#d7e3ff" strokeWidth="2" />
    </g>
  );
}

function MapSprite() {
  return (
    <g>
      <path d="M-26 -20 H22 L26 -8 V24 H-22 L-26 12 Z" fill="#fff1c9" stroke="#243056" strokeWidth="2" />
      <path d="M-16 16 C-4 4 6 -2 16 -12" fill="none" stroke="#f25c54" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="-12" r="3" fill="#f25c54" />
    </g>
  );
}

function Top() {
  return (
    <g>
      <path d="M0 -28 L18 10 H-18 Z" fill="#ff8fab" stroke="#243056" strokeWidth="2" />
      <ellipse cx="0" cy="12" rx="20" ry="6" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <line x1="0" y1="-28" x2="0" y2="-36" stroke="#243056" strokeWidth="2" />
    </g>
  );
}

function Rain() {
  return (
    <g>
      <Cloud />
      <path d="M-16 24 V38 M0 26 V42 M16 24 V38" stroke="#4dabf7" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Box() {
  return (
    <g>
      <path d="M-28 0 L0 -16 L28 0 L0 16 Z" fill="#ffd166" stroke="#243056" strokeWidth="2" />
      <path d="M-28 0 V24 L0 40 V16 Z" fill="#f4a261" stroke="#243056" strokeWidth="2" />
      <path d="M28 0 V24 L0 40 V16 Z" fill="#e08a3c" stroke="#243056" strokeWidth="2" />
    </g>
  );
}

function Cat() {
  return (
    <RoundBuddy body="#f4a261" belly="#fff1dc" ear="point">
      <path d="M22 12 Q40 0 30 24" fill="none" stroke="#f4a261" strokeWidth="6" strokeLinecap="round" />
    </RoundBuddy>
  );
}

function Dog() {
  return (
    <RoundBuddy body="#c68642" belly="#ffe8c2" ear="floppy">
      <path d="M22 16 Q38 28 24 30" fill="none" stroke="#c68642" strokeWidth="6" strokeLinecap="round" />
    </RoundBuddy>
  );
}

function Fox() {
  return (
    <RoundBuddy body="#f25c54" belly="#fff" ear="point">
      <path d="M18 14 Q42 20 28 32 Q20 20 18 14 Z" fill="#f25c54" />
      <path d="M22 20 Q34 24 28 28" fill="#fff" />
    </RoundBuddy>
  );
}

function Owl() {
  return (
    <g>
      <path d="M-16 -8 L-22 -28 L-6 -12 Z" fill="#8d5a3b" />
      <path d="M16 -8 L22 -28 L6 -12 Z" fill="#8d5a3b" />
      <ellipse cy="8" rx="26" ry="28" fill="#c68642" />
      <ellipse cy="12" rx="16" ry="16" fill="#ffe8c2" />
      <circle cx="-8" cy="4" r="8" fill="#fff" stroke="#243056" strokeWidth="2" />
      <circle cx="8" cy="4" r="8" fill="#fff" stroke="#243056" strokeWidth="2" />
      <circle cx="-8" cy="4" r="3" fill="#243056" />
      <circle cx="8" cy="4" r="3" fill="#243056" />
      <path d="M-3 14 L0 18 L3 14" fill="#f4a261" />
    </g>
  );
}

function Hen() {
  return (
    <g>
      <ellipse cx="-4" cy="8" rx="24" ry="18" fill="#fff6e8" stroke="#243056" strokeWidth="2" />
      <circle cx="18" cy="-2" r="10" fill="#fff6e8" stroke="#243056" strokeWidth="2" />
      <path d="M24 -6 L32 -2 L24 2 Z" fill="#f4a261" />
      <path d="M12 -12 L16 -22 L20 -10" fill="#f25c54" />
      <circle cx="16" cy="-4" r="1.6" fill="#243056" />
      <path d="M-8 24 L-4 32 M2 26 L6 34" stroke="#f4a261" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Goat() {
  return (
    <RoundBuddy body="#efe6d6" belly="#fff" ear="floppy">
      <path d="M-16 -18 Q-24 -36 -8 -22 M16 -18 Q24 -36 8 -22" fill="none" stroke="#8d5a3b" strokeWidth="3" strokeLinecap="round" />
    </RoundBuddy>
  );
}

function Pig() {
  return (
    <RoundBuddy body="#ffb7d5" belly="#ffe4ef" ear="point">
      <ellipse cx="0" cy="10" rx="8" ry="6" fill="#ff8fab" stroke="#243056" strokeWidth="1.6" />
      <circle cx="-3" cy="10" r="1.2" fill="#243056" />
      <circle cx="3" cy="10" r="1.2" fill="#243056" />
    </RoundBuddy>
  );
}

function Rabbit() {
  return <RoundBuddy body="#fff" belly="#ffe4ef" ear="tall" />;
}

function Mouse() {
  return (
    <RoundBuddy body="#d9dde7" belly="#fff" ear="round">
      <path d="M24 16 Q46 28 30 8" fill="none" stroke="#b0b6c6" strokeWidth="3" />
    </RoundBuddy>
  );
}

const MAP: Record<SpriteName, () => ReactNode> = {
  rocket: Rocket,
  moon: Moon,
  sun: Sun,
  cloud: Cloud,
  star: Star,
  comet: Comet,
  satellite: Satellite,
  rabbit: Rabbit,
  mouse: Mouse,
  crystal: Crystal,
  kite: Kite,
  flag: Flag,
  flower: Flower,
  tree: Tree,
  mushroom: Mushroom,
  fox: Fox,
  owl: Owl,
  firefly: Firefly,
  unicorn: Unicorn,
  lily: Lily,
  book: Book,
  lantern: Lantern,
  cup: Cup,
  sprout: Sprout,
  dolphin: Dolphin,
  whale: Whale,
  turtle: Turtle,
  seahorse: Seahorse,
  octopus: Octopus,
  crab: Crab,
  sub: Sub,
  palace: Palace,
  fish: Fish,
  pearl: Pearl,
  shell: Shell,
  cake: Cake,
  apple: Apple,
  hill: Hill,
  balloon: Balloon,
  cat: Cat,
  heart: Heart,
  candy: Candy,
  cookie: Cookie,
  crayon: Crayon,
  blob: Blob,
  dog: Dog,
  pig: Pig,
  hat: Hat,
  bug: Bug,
  bed: Bed,
  hen: Hen,
  pot: Pot,
  ball: Ball,
  egg: Egg,
  leaf: Leaf,
  nest: Nest,
  goat: Goat,
  umbrella: Umbrella,
  igloo: Igloo,
  map: MapSprite,
  top: Top,
  rain: Rain,
  box: Box,
};

export function Sprite({ name }: { name: SpriteName }) {
  const Draw = MAP[name];
  return <Draw />;
}
