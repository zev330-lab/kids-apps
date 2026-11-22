import { LOGICAL_H, LOGICAL_W, type Point } from "./geometry";
import type { PlacedSticker } from "./renderFriend";

export const STICKER_WIDTH = 0.16;
const spots = [0.5, 0.2, 0.8].flatMap((x) => [0.5, 0.2, 0.8].map((y) => ({ x, y })));

export function openSpot(stickers: Point[]) {
  const distance = (spot: Point) =>
    Math.min(...stickers.map((s) => Math.hypot(spot.x - s.x, ((spot.y - s.y) * LOGICAL_H) / LOGICAL_W)));
  return spots.reduce((best, next) => (distance(next) > distance(best) ? next : best));
}

export function fitSticker(sticker: PlacedSticker): PlacedSticker {
  const radians = (sticker.rot * Math.PI) / 180;
  const halfWidth = (STICKER_WIDTH * sticker.scale * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)))) / 2;
  const halfHeight = (halfWidth * LOGICAL_W) / LOGICAL_H;
  return {
    ...sticker,
    x: Math.max(halfWidth, Math.min(1 - halfWidth, sticker.x)),
    y: Math.max(halfHeight, Math.min(1 - halfHeight, sticker.y)),
  };
}
