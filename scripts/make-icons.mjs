import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(root, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function encodePNG(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function blend(dst, i, r, g, b, a) {
  if (a <= 0) return;
  const sa = a / 255;
  const da = dst[i + 3] / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return;
  dst[i] = Math.round((r * sa + dst[i] * da * (1 - sa)) / outA);
  dst[i + 1] = Math.round((g * sa + dst[i + 1] * da * (1 - sa)) / outA);
  dst[i + 2] = Math.round((b * sa + dst[i + 2] * da * (1 - sa)) / outA);
  dst[i + 3] = Math.round(outA * 255);
}

function coverCircle(px, py, cx, cy, r) {
  const d = Math.hypot(px - cx, py - cy) - r;
  if (d <= -0.8) return 1;
  if (d >= 0.8) return 0;
  return (0.8 - d) / 1.6;
}

function coverRect(px, py, x, y, w, h) {
  const inside = px >= x && px <= x + w && py >= y && py <= y + h;
  if (!inside) {
    const dx = Math.max(x - px, px - (x + w), 0);
    const dy = Math.max(y - py, py - (y + h), 0);
    const d = Math.hypot(dx, dy);
    if (d >= 1) return 0;
    return 1 - d;
  }
  const edge = Math.min(px - x, x + w - px, py - y, y + h - py);
  return edge >= 1 ? 1 : Math.max(0.35, edge);
}

function paint(size) {
  const px = new Uint8Array(size * size * 4);
  const bg = [18, 21, 31];
  const head = [44, 56, 88];
  const visor = [18, 50, 58];
  const eye = [244, 247, 255];
  const pupil = [18, 20, 28];
  const lime = [214, 255, 74];
  const blocks = [
    [0.22, 0.2, 0.56, 0.5, head],
    [0.28, 0.32, 0.44, 0.16, visor],
    [0.32, 0.35, 0.12, 0.1, eye],
    [0.56, 0.35, 0.12, 0.1, eye],
    [0.34, 0.37, 0.05, 0.06, pupil],
    [0.58, 0.37, 0.05, 0.06, pupil],
    [0.62, 0.08, 0.2, 0.16, lime],
  ];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      px[i] = bg[0];
      px[i + 1] = bg[1];
      px[i + 2] = bg[2];
      px[i + 3] = 255;
      const cx = x + 0.5;
      const cy = y + 0.5;
      for (const [rx, ry, rw, rh, color] of blocks) {
        const a = coverRect(cx, cy, rx * size, ry * size, rw * size, rh * size);
        if (a) blend(px, i, color[0], color[1], color[2], a * 255);
      }
      const sx = (cx - size * 0.5) / (size * 0.18);
      if (Math.abs(sx) <= 1) {
        const arcY = size * 0.7 - sx * sx * size * 0.08;
        const dist = Math.abs(cy - arcY);
        const thick = size * 0.02;
        if (dist < thick) blend(px, i, lime[0], lime[1], lime[2], (1 - dist / thick) * 255);
      }
    }
  }
  return px;
}

function starCover(px, py, cx, cy, r) {
  // Five-point star via alternating radii in polar space.
  const ang = Math.atan2(py - cy, px - cx);
  const dist = Math.hypot(px - cx, py - cy);
  const spikes = 5;
  const rot = -Math.PI / 2;
  const t = ((ang - rot) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const sector = (Math.PI * 2) / spikes;
  const local = (t % sector) / sector; // 0..1
  const tri = local < 0.5 ? local * 2 : (1 - local) * 2; // 0 at tip, 1 at valley
  const radius = r * (1 - tri * 0.55);
  const d = dist - radius;
  if (d <= -0.8) return 1;
  if (d >= 0.8) return 0;
  return (0.8 - d) / 1.6;
}

for (const size of [180, 192, 512]) {
  const name =
    size === 180 ? "apple-touch-icon.png" : size === 192 ? "icon-192.png" : "icon-512.png";
  writeFileSync(join(root, name), encodePNG(size, Buffer.from(paint(size))));
  console.log("wrote", name);
}
