import { useId } from "react";
import type { GroundName, PictureSpec, SkyName } from "./types";
import { Sprite } from "./sprites";

const SKY: Record<SkyName, [string, string]> = {
  day: ["#3ec6ff", "#163a73"],
  dusk: ["#ff7a3c", "#3a1868"],
  sea: ["#1aa7d4", "#07283d"],
  meadow: ["#49c8ff", "#145c38"],
  space: ["#2a1868", "#0c1020"],
  candy: ["#ff4d9a", "#3a1460"],
  cave: ["#3a2a6e", "#120e22"],
  sunset: ["#ff7a3c", "#5a1848"],
};

const GROUND: Record<Exclude<GroundName, "none">, [string, string]> = {
  grass: ["#1fbf55", "#147a34"],
  sand: ["#e6a04a", "#a86a22"],
  moon: ["#6d7ab8", "#3d4670"],
  water: ["#1480d8", "#0c4e86"],
  snow: ["#e7eefc", "#aeb8d4"],
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
        <g>
          <rect y={248} width={400} height={52} fill={GROUND[ground][1]} />
          <rect y={228} width={400} height={24} fill={GROUND[ground][0]} />
          <rect y={228} width={400} height={6} fill="rgba(255,255,255,0.35)" />
        </g>
      )}
      {ground === "water" && (
        <rect y={236} width={400} height={4} fill="rgba(255,255,255,0.55)" />
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
      <rect x={-62} y={-62} width={124} height={124} rx={16} fill="#1a2236" />
      <rect x={-62} y={-62} width={124} height={124} rx={16} fill="none" stroke="#f0b429" strokeWidth={5} />
      <Sprite name={name} />
    </svg>
  );
}
