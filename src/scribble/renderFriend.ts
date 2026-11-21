import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { paintBackground, type BackgroundId } from "./backgrounds";
import {
  LOGICAL_H,
  LOGICAL_W,
  drawStrokes,
  faceLayout,
  padBox,
  alphaBounds,
  type Box,
  type FaceLayout,
  type Stroke,
} from "./geometry";
import { stickerSvg, type StickerKind } from "./stickers";

export type DanceName = "wiggle" | "bounce" | "dance";

export type PlacedSticker = {
  id: string;
  kind: StickerKind;
  x: number;
  y: number;
  rot: number;
};

export type FriendState = {
  strokes: Stroke[];
  background: BackgroundId;
  stickers: PlacedSticker[];
  dance: DanceName;
  box: Box;
  layout: FaceLayout;
};

const stickerCache = new Map<StickerKind, Promise<HTMLImageElement>>();

function loadSticker(kind: StickerKind): Promise<HTMLImageElement> {
  const cached = stickerCache.get(kind);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const blob = new Blob([stickerSvg(kind)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("sticker"));
    };
    image.src = url;
  });
  stickerCache.set(kind, promise);
  return promise;
}

export function measureDrawing(strokes: Stroke[]): { box: Box; layout: FaceLayout } | null {
  const canvas = document.createElement("canvas");
  const ratio = 0.5;
  canvas.width = LOGICAL_W * ratio;
  canvas.height = LOGICAL_H * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(ratio, ratio);
  drawStrokes(ctx, strokes);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const raw = alphaBounds(pixels.data, canvas.width, canvas.height);
  if (!raw) return null;
  const box = padBox(
    {
      x: raw.x / ratio,
      y: raw.y / ratio,
      w: raw.w / ratio,
      h: raw.h / ratio,
    },
    36,
    { w: LOGICAL_W, h: LOGICAL_H },
  );
  return { box, layout: faceLayout(box) };
}

function danceShift(dance: DanceName, t: number) {
  const wave = Math.sin(t * Math.PI * 2);
  if (dance === "wiggle") return { x: 0, y: 0, rot: wave * 0.05 };
  if (dance === "bounce") return { x: 0, y: wave * -22, rot: 0 };
  return { x: wave * 16, y: Math.sin(t * Math.PI * 4) * -16, rot: wave * 0.06 };
}

export async function drawFriend(
  ctx: CanvasRenderingContext2D,
  state: FriendState,
  t: number,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  paintBackground(ctx, state.background, width, height);
  const scale = width / LOGICAL_W;
  const shift = danceShift(state.dance, t);
  ctx.save();
  ctx.translate(width / 2, height * 0.82);
  ctx.rotate(shift.rot);
  ctx.translate(shift.x * scale, shift.y * scale);
  ctx.translate(-width / 2, -height * 0.82);
  ctx.scale(scale, scale);
  drawStrokes(ctx, state.strokes);
  drawLimbs(ctx, state.layout, t);
  drawFace(ctx, state.layout, t);
  for (const sticker of state.stickers) {
    try {
      const image = await loadSticker(sticker.kind);
      const size = 120;
      ctx.save();
      ctx.translate(sticker.x * LOGICAL_W, sticker.y * LOGICAL_H);
      ctx.rotate((sticker.rot * Math.PI) / 180);
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
    } catch {
      /* a sticker that fails to rasterize is skipped in the file */
    }
  }
  ctx.restore();
  drawSparkles(ctx, width, height, t);
}

function drawLimbs(ctx: CanvasRenderingContext2D, layout: FaceLayout, t: number) {
  const swing = Math.sin(t * Math.PI * 2) * 18;
  limb(ctx, layout.leftArm.x, layout.leftArm.y, layout.leftArm.x - 50, layout.leftArm.y + 40 + swing, layout.limb);
  limb(ctx, layout.rightArm.x, layout.rightArm.y, layout.rightArm.x + 50, layout.rightArm.y + 36 - swing, layout.limb);
  limb(ctx, layout.leftLeg.x, layout.leftLeg.y, layout.leftLeg.x - 8, layout.leftLeg.y + 70, layout.limb);
  limb(ctx, layout.rightLeg.x, layout.rightLeg.y, layout.rightLeg.x + 10, layout.rightLeg.y + 70, layout.limb);
}

function limb(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) {
  ctx.strokeStyle = "#ff7a3c";
  ctx.lineWidth = width;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2 - 10, (y1 + y2) / 2, x2, y2);
  ctx.stroke();
  ctx.fillStyle = "#ffb020";
  const hand = width * 1.3;
  ctx.fillRect(x2 - hand / 2, y2 - hand / 2, hand, hand);
}

function drawFace(ctx: CanvasRenderingContext2D, layout: FaceLayout, t: number) {
  const px = Math.sin(t * Math.PI * 2) * layout.eyeR * 0.35;
  const py = Math.cos(t * Math.PI * 2) * layout.eyeR * 0.2;
  eye(ctx, layout.leftEye.x, layout.leftEye.y, layout.eyeR, px, py);
  eye(ctx, layout.rightEye.x, layout.rightEye.y, layout.eyeR, px, py);
  ctx.strokeStyle = "#243056";
  ctx.lineWidth = Math.max(3, layout.eyeR * 0.22);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(layout.mouth.x - layout.mouth.w / 2, layout.mouth.y);
  ctx.quadraticCurveTo(layout.mouth.x, layout.mouth.y + layout.eyeR * 0.9, layout.mouth.x + layout.mouth.w / 2, layout.mouth.y);
  ctx.stroke();
  ctx.fillStyle = "#ffb1a6";
  ctx.beginPath();
  ctx.arc(layout.leftEye.x - layout.eyeR * 1.3, layout.mouth.y, layout.eyeR * 0.45, 0, Math.PI * 2);
  ctx.arc(layout.rightEye.x + layout.eyeR * 1.3, layout.mouth.y, layout.eyeR * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, px: number, py: number) {
  const side = r * 2;
  ctx.fillStyle = "#f4f7ff";
  ctx.strokeStyle = "#12141c";
  ctx.lineWidth = Math.max(2, r * 0.14);
  ctx.beginPath();
  ctx.roundRect(x - r, y - r, side, side, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#12141c";
  const pupil = r * 0.7;
  ctx.fillRect(x - pupil / 2 + px, y - pupil / 2 + py, pupil, pupil);
  ctx.fillStyle = "#7ef6ff";
  ctx.fillRect(x - pupil / 2 + px, y - pupil / 2 + py, pupil * 0.35, pupil * 0.35);
}

function drawSparkles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  for (let i = 0; i < 10; i++) {
    const angle = t * Math.PI * 2 + i;
    const x = w * (0.15 + ((i * 0.097) % 0.7)) + Math.sin(angle) * 8;
    const y = h * (0.12 + ((i * 0.13) % 0.7)) + Math.cos(angle) * 8;
    ctx.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(angle));
    ctx.fillStyle = i % 2 === 0 ? "#ffd166" : "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export async function friendBlob(state: FriendState, mime: "image/png"): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = Math.round(800 * (LOGICAL_H / LOGICAL_W));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  await drawFriend(ctx, state, 0.25, canvas.width, canvas.height);
  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png"))), mime);
  });
}

export async function friendGif(state: FriendState): Promise<Blob> {
  const width = 420;
  const height = Math.round(width * (LOGICAL_H / LOGICAL_W));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const gif = GIFEncoder();
  const frames = 10;
  for (let i = 0; i < frames; i++) {
    await drawFriend(ctx, state, i / frames, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    const palette = quantize(image.data, 64);
    const index = applyPalette(image.data, palette);
    gif.writeFrame(index, width, height, { palette, delay: 120, repeat: 0 });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  gif.finish();
  const bytes = gif.bytes();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "image/gif" });
}

export async function friendMovie(state: FriendState): Promise<Blob | null> {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) return null;
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  const mime = types.find((type) => MediaRecorder.isTypeSupported(type));
  if (!mime) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = Math.round(640 * (LOGICAL_H / LOGICAL_W));
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(12);
  if (!ctx || !stream) return null;
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks: Blob[] = [];
  const done = new Promise<Blob>((resolve) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });
  recorder.start();
  const started = performance.now();
  await new Promise<void>((resolve) => {
    const frame = async (now: number) => {
      const t = ((now - started) % 1000) / 1000;
      await drawFriend(ctx, state, t, canvas.width, canvas.height);
      if (now - started < 2400) requestAnimationFrame((time) => void frame(time));
      else resolve();
    };
    requestAnimationFrame((time) => void frame(time));
  });
  recorder.stop();
  return done;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function shareOrSave(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: blob.type || "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title, text: "A friend I made in Playtime." });
    return "shared" as const;
  }
  downloadBlob(blob, filename);
  return "saved" as const;
}
