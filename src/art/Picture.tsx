import { useId } from "react";
import type { GroundName, PictureSpec, SkyName } from "./types";
import { Sprite } from "./sprites";

const SKY: Record<SkyName, [string, string]> = {
  day: ["#7ad4ff", "#2f6cb5"],
  dusk: ["#ff9a55", "#6a3a8a"],
  sea: ["#4ed4f0", "#1a78b0"],
  meadow: ["#7ad4ff", "#2f8a52"],
  space: ["#6a78d8", "#2c3f86"],
  candy: ["#ff7ab8", "#7a3a9a"],
  cave: ["#7a68c8", "#3a4a86"],
  sunset: ["#ff9a55", "#c45a78"],
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
      <rect x={-62} y={-62} width={124} height={124} rx={16} fill="#f7f9fd" />
      <rect x={-62} y={-62} width={124} height={124} rx={16} fill="none" stroke="#f0b429" strokeWidth={5} />
      <Sprite name={name} />
    </svg>
  );
}
