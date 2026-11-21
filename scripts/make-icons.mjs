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

function paint(size) {
  const px = new Uint8Array(size * size * 4);
  const bg = [255, 183, 3];
  const face = [255, 246, 232];
  const ink = [36, 48, 86];
  const coral = [242, 92, 84];
  const cheek = [255, 177, 166];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      px[i] = bg[0];
      px[i + 1] = bg[1];
      px[i + 2] = bg[2];
      px[i + 3] = 255;
      const cx = x + 0.5;
      const cy = y + 0.5;
      const faceA = coverCircle(cx, cy, size * 0.5, size * 0.54, size * 0.28);
      if (faceA) blend(px, i, face[0], face[1], face[2], faceA * 255);
      const cheekL = coverCircle(cx, cy, size * 0.38, size * 0.6, size * 0.045);
      const cheekR = coverCircle(cx, cy, size * 0.62, size * 0.6, size * 0.045);
      if (cheekL) blend(px, i, cheek[0], cheek[1], cheek[2], cheekL * 220);
      if (cheekR) blend(px, i, cheek[0], cheek[1], cheek[2], cheekR * 220);
      const eyeL = coverCircle(cx, cy, size * 0.41, size * 0.5, size * 0.035);
      const eyeR = coverCircle(cx, cy, size * 0.59, size * 0.5, size * 0.035);
      if (eyeL) blend(px, i, ink[0], ink[1], ink[2], eyeL * 255);
      if (eyeR) blend(px, i, ink[0], ink[1], ink[2], eyeR * 255);
      // Smile: pixels near a downward arc.
      const sx = (cx - size * 0.5) / (size * 0.16);
      if (Math.abs(sx) <= 1) {
        const arcY = size * 0.6 + Math.cos(sx * 1.2) * size * 0.02 + sx * sx * size * 0.05;
        const dist = Math.abs(cy - arcY);
        const thick = size * 0.018;
        if (dist < thick) {
          const a = 1 - dist / thick;
          blend(px, i, ink[0], ink[1], ink[2], a * 255);
        }
      }
      // Star, top right.
      const star = starCover(cx, cy, size * 0.74, size * 0.22, size * 0.09);
      if (star) blend(px, i, coral[0], coral[1], coral[2], star * 255);
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
