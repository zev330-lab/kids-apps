import { describe, expect, it } from "vitest";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { alphaBounds, faceLayout, hasInk, padBox, type Stroke } from "../src/scribble/geometry";

describe("scribble geometry", () => {
  it("finds the opaque bounds of a drawing", () => {
    const width = 8;
    const height = 6;
    const data = new Uint8ClampedArray(width * height * 4);
    const mark = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      data[i + 3] = 255;
    };
    mark(2, 1);
    mark(5, 4);
    const box = alphaBounds(data, width, height);
    expect(box).toEqual({ x: 2, y: 1, w: 4, h: 4 });
  });

  it("places eyes on the upper part of the scribble", () => {
    const box = padBox({ x: 100, y: 80, w: 200, h: 160 }, 36, { w: 1000, h: 700 });
    const face = faceLayout(box);
    expect(face.leftEye.y).toBeLessThan(box.y + box.h * 0.5);
    expect(face.rightEye.x).toBeGreaterThan(face.leftEye.x);
    expect(face.mouth.y).toBeGreaterThan(face.leftEye.y);
    expect(face.leftArm.x).toBeLessThanOrEqual(box.x + 1);
    expect(face.rightLeg.y).toBeGreaterThanOrEqual(box.y + box.h - 1);
  });

  it("knows when a page has ink", () => {
    const empty: Stroke[] = [{ color: "eraser", size: 10, points: [{ x: 1, y: 1 }] }];
    const ink: Stroke[] = [{ color: "#111", size: 10, points: [{ x: 1, y: 1 }] }];
    expect(hasInk(empty)).toBe(false);
    expect(hasInk(ink)).toBe(true);
  });
});

describe("gif encoder", () => {
  it("writes a GIF header", () => {
    const data = new Uint8Array(4 * 4 * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 183;
      data[i + 2] = 3;
      data[i + 3] = 255;
    }
    const palette = quantize(data, 8);
    const index = applyPalette(data, palette);
    const gif = GIFEncoder();
    gif.writeFrame(index, 4, 4, { palette, delay: 100 });
    gif.finish();
    const bytes = gif.bytes();
    expect(String.fromCharCode(...bytes.slice(0, 6))).toBe("GIF89a");
  });
});

describe("sticker placement", () => {
  it("sets eight distinct spots and reuses the gap after peeling", async () => {
    const { openSpot } = await import("../src/scribble/stickerLayout");
    const placed: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const next = openSpot(placed);
      for (const other of placed) expect(Math.hypot(next.x - other.x, next.y - other.y)).toBeGreaterThan(0.25);
      placed.push(next);
    }
    placed.splice(3, 1);
    expect(placed).not.toContainEqual(openSpot(placed));
  });

  it("keeps a large rotated sticker inside the picture", async () => {
    const { fitSticker } = await import("../src/scribble/stickerLayout");
    const sticker = fitSticker({ id: "hat", kind: "crown", x: 0, y: 1, rot: 45, scale: 2 });
    expect(sticker.x).toBeCloseTo(0.16 * Math.SQRT2);
    expect(sticker.y).toBeCloseTo(1 - sticker.x * 10 / 7);
  });
});
