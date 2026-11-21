import { useId } from "react";
import type { GroundName, PictureSpec, SkyName } from "./types";
import { Sprite } from "./sprites";

const SKY: Record<SkyName, [string, string]> = {
  day: ["#b7ecff", "#fff6e8"],
  dusk: ["#ffd6a5", "#c9b6ff"],
  sea: ["#7fd3ff", "#e7f8ff"],
  meadow: ["#d8f6c8", "#fff6e8"],
  space: ["#8ea2ff", "#ffe3f1"],
  candy: ["#ffd0e6", "#d6ccff"],
  cave: ["#c9b6ff", "#fff1c9"],
  sunset: ["#ffd6a5", "#ffb4a2"],
};

const GROUND: Record<Exclude<GroundName, "none">, string> = {
  grass: "#7dce6a",
  sand: "#ffd59a",
  moon: "#e4e0f7",
  water: "#4dabf7",
  snow: "#f7f8ff",
};

export function Picture({ spec, label }: { spec: PictureSpec; label: string }) {
  const uid = useId().replace(/:/g, "");
  const [top, bottom] = SKY[spec.sky];
  const ground = spec.ground ?? "none";
  return (
    <svg className="picture" viewBox="0 0 400 300" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      {spec.sky === "space" && (
        <g className="anim-twinkle" fill="#fff">
          <circle cx="40" cy="36" r="2" />
          <circle cx="90" cy="70" r="1.6" />
          <circle cx="320" cy="40" r="2.2" />
          <circle cx="360" cy="90" r="1.5" />
          <circle cx="250" cy="30" r="1.4" />
        </g>
      )}
      {ground !== "none" && (
        <path
          d="M0 236 Q70 214 140 236 T280 232 T400 240 V300 H0 Z"
          fill={GROUND[ground]}
        />
      )}
      {ground === "water" && (
        <path
          d="M0 250 Q40 242 80 250 T160 250 T240 250 T320 250 T400 250"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          opacity="0.7"
        />
      )}
      {spec.items.map((item, index) => {
        const scale = item.scale ?? 1;
        const sx = item.flip ? -scale : scale;
        return (
          <g key={`${item.s}-${index}`} transform={`translate(${item.x} ${item.y}) scale(${sx} ${scale})`}>
            <g className={item.anim ? `anim-${item.anim}` : undefined}>
              <Sprite name={item.s} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function SpriteBadge({ name, label }: { name: PictureSpec["items"][number]["s"]; label: string }) {
  return (
    <svg className="badge-art" viewBox="-70 -70 140 140" role="img" aria-label={label}>
      <circle r="64" fill="#fffdf8" />
      <circle r="64" fill="none" stroke="#ffb703" strokeWidth="4" />
      <Sprite name={name} />
    </svg>
  );
}
