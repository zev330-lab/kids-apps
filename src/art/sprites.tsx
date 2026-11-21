import type { ReactNode } from "react";
import type { SpriteName } from "./types";

function Box({
  x = 0,
  y = 0,
  w,
  h,
  fill,
  rx = 3,
}: {
  x?: number;
  y?: number;
  w: number;
  h: number;
  fill: string;
  rx?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={3} y={4} width={w} height={h} rx={rx} fill="#0c1018" opacity={0.35} />
      <rect width={w} height={h} rx={rx} fill={fill} stroke="#12141c" strokeWidth={2} />
      <rect x={3} y={3} width={Math.max(4, w - 8)} height={4} rx={1} fill="rgba(255,255,255,0.35)" />
    </g>
  );
}

function Face({ y = 0, think = false }: { y?: number; think?: boolean }) {
  const dy = think ? -3 : 0;
  return (
    <g transform={`translate(0 ${y + dy})`}>
      <rect x={-16} y={-8} width={12} height={12} rx={2} fill="#f4f7ff" stroke="#12141c" strokeWidth={2} />
      <rect x={4} y={-8} width={12} height={12} rx={2} fill="#f4f7ff" stroke="#12141c" strokeWidth={2} />
      <rect x={-13} y={-5} width={5} height={6} fill="#12141c" />
      <rect x={7} y={-5} width={5} height={6} fill="#12141c" />
      <rect x={-12} y={-4} width={2} height={2} fill="#7ef6ff" />
      <rect x={8} y={-4} width={2} height={2} fill="#7ef6ff" />
      <path d="M-9 7 Q0 16 9 7" fill="none" stroke="#12141c" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function Pal({
  color,
  ears = "none",
  children,
}: {
  color: string;
  ears?: "none" | "point" | "tall" | "floppy" | "square";
  children?: ReactNode;
}) {
  return (
    <g>
      {ears === "tall" && (
        <>
          <Box x={-22} y={-58} w={12} h={28} fill={color} />
          <Box x={10} y={-58} w={12} h={28} fill={color} />
        </>
      )}
      {ears === "point" && (
        <>
          <polygon points="-22,-18 -14,-42 -4,-18" fill={color} stroke="#12141c" strokeWidth={2} />
          <polygon points="22,-18 14,-42 4,-18" fill={color} stroke="#12141c" strokeWidth={2} />
        </>
      )}
      {ears === "square" && (
        <>
          <Box x={-28} y={-36} w={14} h={14} fill={color} />
          <Box x={14} y={-36} w={14} h={14} fill={color} />
        </>
      )}
      {ears === "floppy" && (
        <>
          <Box x={-30} y={-22} w={12} h={22} fill={color} />
          <Box x={18} y={-22} w={12} h={22} fill={color} />
        </>
      )}
      <Box x={-26} y={-28} w={52} h={36} fill={color} />
      <Box x={-18} y={6} w={36} h={22} fill={color} />
      <Box x={-16} y={26} w={12} h={14} fill="#1c2436" />
      <Box x={4} y={26} w={12} h={14} fill="#1c2436" />
      <Face y={-12} />
      {children}
    </g>
  );
}

function Cat() {
  return (
    <g>
      <path d="M14 18Q31 20 32 8l1-12q1-13 10-13 8 0 8 8h-7q0-3-2-2l-2 19q-3 21-26 19z"
        fill="#f0b429" stroke="#12141c" strokeWidth={2} />
      <Pal color="#f0b429" ears="point">
        <path d="M-12 -5l-21-5m21 8-20 4M12 -5l21-5M12 -2l20 4" stroke="#12141c" strokeWidth={3} />
      </Pal>
    </g>
  );
}

function Fox() {
  return (
    <g strokeLinejoin="round">
      <path d="M10 16l11-10 13-4 18-22-1 28-6 13-13 9H16z" fill="#ff7a3c" stroke="#12141c" strokeWidth={2} />
      <path d="M34 2l18-22-1 28-7-5-2 6z" fill="#fff" stroke="#12141c" strokeWidth={2} />
      <Pal color="#ff7a3c" ears="point">
        <path d="M-26 -10l17 5 9 4 9-4 17-5-8 13L0 12-18 3z" fill="#fff" stroke="#12141c" strokeWidth={2} />
        <path d="M-5 0H5L0 6z" fill="#12141c" />
      </Pal>
    </g>
  );
}

function Owl() {
  return (
    <g stroke="#12141c" strokeWidth={2} strokeLinejoin="round">
      <path d="M-25 -33l13 8h24l13-8v41l-7 17-18 6-18-6-7-17z" fill="#c68642" />
      <path d="M-21 -1l-8 8v15l13-10z M21 -1l8 8v15L16 12z" fill="#995f32" />
      <Box x={-23} y={-22} w={21} h={22} rx={7} fill="#fff1c9" />
      <Box x={2} y={-22} w={21} h={22} rx={7} fill="#fff1c9" />
      <path d="M-15 -14h7v8h-7z M8 -14h7v8H8z" fill="#12141c" />
      <path d="M-5 -2H5L0 7z" fill="#ffad24" />
    </g>
  );
}

function Mouse() {
  return (
    <g>
      <path d="M15 22h12q12 0 12-10V7q0-7 8-7" fill="none" stroke="#12141c" strokeWidth={3} strokeLinecap="round" />
      <Pal color="#c5cbe0" ears="none">
        <Box x={-31} y={-41} w={20} h={18} rx={8} fill="#c5cbe0" />
        <Box x={11} y={-41} w={20} h={18} rx={8} fill="#c5cbe0" />
        <path d="M-5 -7H5L0 -1z" fill="#12141c" />
      </Pal>
    </g>
  );
}

function Hen() {
  return (
    <g stroke="#12141c" strokeWidth={2} strokeLinejoin="round">
      <path d="M-12 16h6v18h-14v-5h8z M8 16h6v13h8v5H8z" fill="#f0a202" />
      <path d="M-22 8l-17-15v-18l12 9v-10l15 16h18v-13h5v-9h20v28h-6v12l-10 12h-28z" fill="#fff1c9" />
      <path d="M7 -32v-10h6v5h4v-8h6v8h6v7H7z" fill="#ed394c" />
      <path d="M27 -13h8v10l-4 4-5-5z" fill="#ed394c" />
      <path d="M29 -22l15 7-15 5z" fill="#ffad24" />
      <rect x={19} y={-26} width={5} height={5} rx={1} fill="#12141c" />
      <path d="M-21 -6h22v9l-8 7h-7z" fill="#e7c98f" />
    </g>
  );
}

function Pig() {
  return (
    <Pal color="#ff8ab0" ears="point">
      <rect x={-14} y={-7} width={28} height={15} rx={5} fill="#f56c9a" stroke="#12141c" strokeWidth={2} />
      <path d="M-9 -3h5v7h-5z M4 -3h5v7H4z" fill="#63243d" />
    </Pal>
  );
}

function Goat() {
  return (
    <Pal color="#efe6d6" ears="floppy">
      <path d="M-20 -28l-3-16 8 6 3 10z M20 -28l3-16-8 6-3 10z" fill="#c49a66" stroke="#12141c" strokeWidth={2} />
      <path d="M-8 7H8l-3 9-4-2-4 5z" fill="#fff4dc" stroke="#12141c" strokeWidth={2} />
    </Pal>
  );
}

function Rocket() {
  return (
    <g>
      <polygon points="-30,6 -12,6 -16,30" fill="#f0b429" stroke="#12141c" strokeWidth={2} />
      <polygon points="30,6 12,6 16,30" fill="#ff7a3c" stroke="#12141c" strokeWidth={2} />
      <Box x={-16} y={-36} w={32} h={62} fill="#ff4d6a" />
      <polygon points="0,-58 -16,-36 16,-36" fill="#ff7a3c" stroke="#12141c" strokeWidth={2} />
      <Box x={-10} y={-22} w={20} h={16} fill="#7ef6ff" />
      <Box x={-8} y={24} w={16} h={14} fill="#ffe14a" />
    </g>
  );
}

function Moon() {
  return (
    <g>
      <Box x={-28} y={-28} w={56} h={56} fill="#ffe14a" rx={8} />
      <Box x={-8} y={-6} w={10} h={8} fill="#e2b423" />
      <Face y={2} />
    </g>
  );
}

function Sun() {
  return (
    <g>
      <rect x={-4} y={-46} width={8} height={14} fill="#ffe14a" />
      <rect x={-4} y={32} width={8} height={14} fill="#ffe14a" />
      <rect x={-46} y={-4} width={14} height={8} fill="#ffe14a" />
      <rect x={32} y={-4} width={14} height={8} fill="#ffe14a" />
      <Box x={-24} y={-24} w={48} h={48} fill="#ffb020" />
      <Face />
    </g>
  );
}

function Cloud() {
  return (
    <g>
      <Box x={-28} y={-8} w={28} h={20} fill="#f4f7ff" />
      <Box x={-6} y={-16} w={30} h={24} fill="#f4f7ff" />
      <Box x={16} y={-6} w={22} h={18} fill="#d5def2" />
    </g>
  );
}

function Star() {
  return (
    <polygon
      points="0,-30 8,-8 30,-8 12,4 18,28 0,14 -18,28 -12,4 -30,-8 -8,-8"
      fill="#ffe14a"
      stroke="#12141c"
      strokeWidth={2}
      strokeLinejoin="miter"
    />
  );
}

function Comet() {
  return (
    <g>
      <polygon points="-40,6 -8,-8 -8,16" fill="#7ef6ff" stroke="#12141c" strokeWidth={2} />
      <Box x={-10} y={-16} w={36} h={32} fill="#f4f7ff" />
      <Face y={0} />
    </g>
  );
}

function Satellite() {
  return (
    <g>
      <Box x={-40} y={-12} w={16} h={24} fill="#7ef6ff" />
      <Box x={24} y={-12} w={16} h={24} fill="#7ef6ff" />
      <Box x={-16} y={-18} w={32} h={36} fill="#f4f7ff" />
      <Box x={-4} y={-30} w={8} h={12} fill="#ff4d6a" />
      <Face y={-2} />
    </g>
  );
}

function Crystal() {
  return (
    <g>
      <polygon points="0,-36 22,-8 16,32 -16,32 -22,-8" fill="#7ef6ff" stroke="#12141c" strokeWidth={2} />
      <polygon points="0,-36 8,-8 0,32 -6,-8" fill="#d8fbff" />
      <Face y={2} />
    </g>
  );
}

function Kite() {
  return (
    <g>
      <polygon points="0,-34 24,0 0,34 -24,0" fill="#ff4d6a" stroke="#12141c" strokeWidth={2} />
      <polygon points="0,-34 8,0 0,34 -8,0" fill="#ffe14a" />
      <path d="M0 34 V58" stroke="#12141c" strokeWidth={3} />
    </g>
  );
}

function Flag() {
  return (
    <g>
      <rect x={-18} y={-36} width={6} height={72} fill="#8a5a32" stroke="#12141c" strokeWidth={2} />
      <polygon points="-12,-32 28,-32 18,-14 -12,-14" fill="#3ee0ff" stroke="#12141c" strokeWidth={2} />
    </g>
  );
}

function Flower() {
  return (
    <g>
      <rect x={-3} y={4} width={6} height={28} fill="#1f8a4c" />
      <Box x={-12} y={-22} w={14} h={14} fill="#ff4d8d" />
      <Box x={-2} y={-28} w={14} h={14} fill="#ff4d8d" />
      <Box x={-12} y={-8} w={14} h={14} fill="#ff7ab0" />
      <Box x={-2} y={-14} w={12} h={12} fill="#ffe14a" />
    </g>
  );
}

function Tree() {
  return (
    <g>
      <Box x={-6} y={8} w={12} h={28} fill="#8a5a32" />
      <Box x={-26} y={-28} w={52} h={40} fill="#1fbf55" />
      <Box x={-16} y={-40} w={32} h={18} fill="#39e06e" />
    </g>
  );
}

function Mushroom() {
  return (
    <g>
      <Box x={-10} y={4} w={20} h={26} fill="#f4f7ff" />
      <Box x={-28} y={-22} w={56} h={28} fill="#ff4d6a" rx={8} />
      <Box x={-14} y={-14} w={8} h={8} fill="#fff" />
      <Box x={6} y={-16} w={10} h={8} fill="#fff" />
    </g>
  );
}

function Unicorn() {
  return (
    <Pal color="#efe8ff" ears="point">
      <polygon points="-2,-46 6,-68 10,-40" fill="#ffe14a" stroke="#12141c" strokeWidth={2} />
    </Pal>
  );
}

function Lily() {
  return (
    <g>
      <rect x={-3} y={4} width={6} height={24} fill="#1f8a4c" />
      <Box x={-16} y={-16} w={32} h={20} fill="#f4f7ff" />
      <Box x={-6} y={-8} w={12} h={8} fill="#ffe14a" />
    </g>
  );
}

function Book() {
  return (
    <g>
      <Box x={-28} y={-16} w={26} h={36} fill="#ff4d6a" />
      <Box x={2} y={-16} w={26} h={36} fill="#3ee0ff" />
    </g>
  );
}

function Lantern() {
  return (
    <g>
      <rect x={-2} y={-36} width={4} height={12} fill="#8a5a32" />
      <Box x={-14} y={-24} w={28} h={36} fill="#ffe14a" />
      <Box x={-8} y={-16} w={16} h={16} fill="#fff6c8" />
    </g>
  );
}

function Cup() {
  return (
    <g>
      <Box x={-16} y={-8} w={32} h={28} fill="#f4f7ff" />
      <path d="M16 0 H26 V12 H16" fill="none" stroke="#12141c" strokeWidth={3} />
    </g>
  );
}

function Sprout() {
  return (
    <g>
      <rect x={-3} y={0} width={6} height={28} fill="#1f8a4c" />
      <Box x={-18} y={-16} w={16} h={12} fill="#39e06e" />
      <Box x={2} y={-18} w={16} h={12} fill="#1fbf55" />
    </g>
  );
}

function Dolphin() {
  return (
    <g>
      <Box x={-28} y={-12} w={56} h={28} fill="#3ee0ff" rx={8} />
      <polygon points="20,-12 36,-24 28,0" fill="#7ef6ff" stroke="#12141c" strokeWidth={2} />
      <Face y={0} />
    </g>
  );
}

function Whale() {
  return (
    <g>
      <Box x={-36} y={-16} w={72} h={36} fill="#5b8cff" rx={8} />
      <polygon points="-8,-16 4,-36 12,-12" fill="#7ea2ff" stroke="#12141c" strokeWidth={2} />
      <Face y={2} />
    </g>
  );
}

function Turtle() {
  return (
    <g>
      <Box x={-22} y={-10} w={40} h={28} fill="#1fbf55" />
      <Box x={16} y={-8} w={18} h={16} fill="#8dff9a" />
      <rect x={20} y={-2} width={5} height={5} fill="#12141c" />
    </g>
  );
}

function Seahorse() {
  return (
    <g>
      <Box x={-10} y={-28} w={22} h={48} fill="#ff7a3c" />
      <Box x={-6} y={16} w={16} h={12} fill="#f0b429" />
      <rect x={2} y={-18} width={5} height={5} fill="#12141c" />
    </g>
  );
}

function Octopus() {
  return (
    <g>
      <Box x={-24} y={-20} w={48} h={32} fill="#b388ff" rx={8} />
      <rect x={-18} y={10} width={8} height={18} rx={2} fill="#9a6dff" stroke="#12141c" strokeWidth={2} />
      <rect x={-4} y={12} width={8} height={20} rx={2} fill="#9a6dff" stroke="#12141c" strokeWidth={2} />
      <rect x={10} y={10} width={8} height={16} rx={2} fill="#9a6dff" stroke="#12141c" strokeWidth={2} />
      <Face y={-6} />
    </g>
  );
}

function Crab() {
  return (
    <g>
      <Box x={-22} y={-10} w={44} h={26} fill="#ff4d6a" />
      <polygon points="-22,0 -36,-10 -30,8" fill="#ff4d6a" stroke="#12141c" strokeWidth={2} />
      <polygon points="22,0 36,-10 30,8" fill="#ff4d6a" stroke="#12141c" strokeWidth={2} />
      <Face y={0} />
    </g>
  );
}

function Sub() {
  return (
    <g>
      <Box x={-32} y={-8} w={64} h={28} fill="#ffe14a" rx={10} />
      <Box x={-8} y={-24} w={16} h={16} fill="#f0b429" />
      <Box x={8} y={-2} w={14} h={12} fill="#7ef6ff" />
    </g>
  );
}

function Palace() {
  return (
    <g>
      <Box x={-30} y={-4} w={60} h={32} fill="#ffb0c8" />
      <polygon points="-20,-4 -8,-28 4,-4" fill="#ff4d6a" stroke="#12141c" strokeWidth={2} />
      <polygon points="4,-4 16,-28 28,-4" fill="#3ee0ff" stroke="#12141c" strokeWidth={2} />
      <Box x={-8} y={8} w={16} h={18} fill="#f0b429" />
    </g>
  );
}

function Fish() {
  return (
    <g>
      <Box x={-20} y={-10} w={36} h={20} fill="#3ee0ff" rx={6} />
      <polygon points="14,-8 30,0 14,8" fill="#ffe14a" stroke="#12141c" strokeWidth={2} />
      <rect x={-10} y={-2} width={5} height={5} fill="#12141c" />
    </g>
  );
}

function Pearl() {
  return <Box x={-14} y={-14} w={28} h={28} fill="#f4f7ff" rx={8} />;
}

function Shell() {
  return <Box x={-16} y={-12} w={32} h={26} fill="#ffb0c8" />;
}

function Cake() {
  return (
    <g>
      <Box x={-22} y={2} w={44} h={20} fill="#ff4d8d" />
      <Box x={-16} y={-14} w={32} h={16} fill="#fff" />
      <Box x={-4} y={-24} w={8} h={10} fill="#ff4d6a" />
    </g>
  );
}

function Apple() {
  return (
    <g>
      <Box x={-16} y={-14} w={32} h={32} fill="#ff4d6a" rx={6} />
      <rect x={-2} y={-24} width={4} height={10} fill="#1f8a4c" />
      <Face y={2} />
    </g>
  );
}

function Hill() {
  return <Box x={-50} y={-8} w={100} h={28} fill="#1fbf55" />;
}

function Balloon() {
  return (
    <g>
      <Box x={-14} y={-28} w={28} h={36} fill="#b388ff" rx={8} />
      <path d="M0 8 V28" stroke="#12141c" strokeWidth={2} />
    </g>
  );
}

function Heart() {
  return (
    <g>
      <Box x={-22} y={-8} w={20} h={20} fill="#ff4d6a" />
      <Box x={2} y={-8} w={20} h={20} fill="#ff4d6a" />
      <polygon points="-22,8 22,8 0,28" fill="#ff4d6a" stroke="#12141c" strokeWidth={2} />
    </g>
  );
}

function Candy() {
  return (
    <g>
      <rect x={-3} y={-36} width={6} height={22} fill="#fff" stroke="#12141c" strokeWidth={2} />
      <Box x={-14} y={-14} w={28} h={28} fill="#ff4d8d" />
    </g>
  );
}

function Cookie() {
  return (
    <g>
      <Box x={-18} y={-18} w={36} h={36} fill="#e0a15a" rx={6} />
      <rect x={-8} y={-6} width={6} height={6} fill="#8a5a32" />
      <rect x={4} y={2} width={5} height={5} fill="#8a5a32" />
    </g>
  );
}

function Crayon() {
  return (
    <g transform="rotate(-18)">
      <Box x={-8} y={-24} w={16} h={36} fill="#3ee0ff" />
      <polygon points="-8,12 8,12 0,28" fill="#ffe14a" stroke="#12141c" strokeWidth={2} />
    </g>
  );
}

function Blob() {
  return <Pal color="#d6ff4a" ears="square" />;
}

function Firefly() {
  return (
    <g>
      <Box x={-4} y={-36} w={10} h={10} fill="#d6ff4a" />
      <Box x={-16} y={-26} w={32} h={26} fill="#2c3858" />
      <rect x={-10} y={-18} width={20} height={8} fill="#12323a" stroke="#12141c" strokeWidth={1.5} />
      <rect x={-7} y={-16} width={5} height={4} fill="#f4f7ff" />
      <rect x={2} y={-16} width={5} height={4} fill="#f4f7ff" />
      <Box x={-12} y={0} w={24} h={16} fill="#ff7a3c" />
    </g>
  );
}

function Bug() {
  return (
    <g>
      <Box x={-16} y={-6} w={32} h={24} fill="#1fbf55" />
      <Box x={-10} y={-22} w={20} h={16} fill="#8dff9a" />
      <rect x={-8} y={-28} width={3} height={8} fill="#12141c" />
      <rect x={5} y={-28} width={3} height={8} fill="#12141c" />
      <Face y={-14} />
    </g>
  );
}

function Hat() {
  return (
    <g>
      <Box x={-24} y={6} w={48} h={10} fill="#3ee0ff" />
      <polygon points="-14,6 0,-24 14,6" fill="#ffe14a" stroke="#12141c" strokeWidth={2} />
    </g>
  );
}

function Bed() {
  return (
    <g>
      <Box x={-28} y={0} w={56} h={20} fill="#3ee0ff" />
      <Box x={-24} y={-12} w={18} h={14} fill="#fff" />
    </g>
  );
}

function Pot() {
  return (
    <g>
      <Box x={-18} y={-4} w={36} h={26} fill="#b388ff" />
      <Box x={-22} y={-12} w={44} h={10} fill="#9a6dff" />
    </g>
  );
}

function Ball() {
  return (
    <g>
      <Box x={-16} y={-16} w={32} h={32} fill="#ff4d6a" rx={8} />
      <path d="M-16 0 H16 M0 -16 V16" stroke="#fff" strokeWidth={3} />
    </g>
  );
}

function Egg() {
  // An oval, matching Parker's shape lesson: "An oval is a stretched circle, like an egg."
  return (
    <g>
      <ellipse cx={3} cy={4} rx={16} ry={22} fill="#0c1018" opacity={0.35} />
      <ellipse cx={0} cy={0} rx={16} ry={22} fill="#f4f7ff" stroke="#12141c" strokeWidth={2} />
      <ellipse cx={-6} cy={-10} rx={4} ry={7} fill="rgba(255,255,255,0.8)" />
    </g>
  );
}

function Leaf() {
  return <polygon points="0,24 -16,0 0,-24 16,0" fill="#1fbf55" stroke="#12141c" strokeWidth={2} />;
}

function Nest() {
  return (
    <g>
      <Box x={-22} y={0} w={44} h={16} fill="#e0a15a" />
      <Box x={-8} y={-12} w={16} h={16} fill="#fff" />
    </g>
  );
}

function Umbrella() {
  return (
    <g>
      <polygon points="-30,4 0,-24 30,4" fill="#3ee0ff" stroke="#12141c" strokeWidth={2} />
      <rect x={-2} y={4} width={4} height={28} fill="#12141c" />
    </g>
  );
}

function Igloo() {
  return (
    <g>
      <Box x={-28} y={-16} w={56} h={36} fill="#f4f7ff" rx={12} />
      <Box x={-10} y={4} w={16} h={16} fill="#3ee0ff" />
    </g>
  );
}

function MapSprite() {
  return (
    <g>
      <Box x={-22} y={-18} w={44} h={36} fill="#ffe7a3" />
      <path d="M-12 8 L0 -4 L12 -8" fill="none" stroke="#ff4d6a" strokeWidth={3} />
    </g>
  );
}

function Top() {
  return (
    <g>
      <polygon points="0,-26 16,8 -16,8" fill="#ff4d8d" stroke="#12141c" strokeWidth={2} />
      <Box x={-16} y={8} w={32} h={8} fill="#ffe14a" />
    </g>
  );
}

function Rain() {
  return (
    <g>
      <Cloud />
      <rect x={-14} y={16} width={4} height={14} fill="#3ee0ff" />
      <rect x={0} y={18} width={4} height={16} fill="#3ee0ff" />
      <rect x={12} y={16} width={4} height={12} fill="#3ee0ff" />
    </g>
  );
}

function Cube() {
  return (
    <g>
      <polygon points="-24,0 0,-16 24,0 0,16" fill="#ffe14a" stroke="#12141c" strokeWidth={2} />
      <polygon points="-24,0 0,16 0,36 -24,20" fill="#e09a20" stroke="#12141c" strokeWidth={2} />
      <polygon points="24,0 0,16 0,36 24,20" fill="#c47e10" stroke="#12141c" strokeWidth={2} />
    </g>
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
  rabbit: () => <Pal color="#f4f7ff" ears="tall" />,
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
  dog: () => <Pal color="#c68642" ears="floppy" />,
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
  box: Cube,
};

export function Sprite({ name }: { name: SpriteName }) {
  const Draw = MAP[name];
  return <Draw />;
}
