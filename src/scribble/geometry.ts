export const LOGICAL_W = 1000;
export const LOGICAL_H = 700;

export type Point = { x: number; y: number };
export type Stroke = { color: string; size: number; points: Point[] };
export type Box = { x: number; y: number; w: number; h: number };

export const ERASER = "eraser";

export function alphaBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaMin = 16,
): Box | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < alphaMin) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function padBox(box: Box, minSize: number, limit: { w: number; h: number }): Box {
  let { x, y, w, h } = box;
  if (w < minSize) {
    x -= (minSize - w) / 2;
    w = minSize;
  }
  if (h < minSize) {
    y -= (minSize - h) / 2;
    h = minSize;
  }
  x = Math.max(0, Math.min(x, limit.w - 4));
  y = Math.max(0, Math.min(y, limit.h - 4));
  w = Math.min(w, limit.w - x);
  h = Math.min(h, limit.h - y);
  return { x, y, w, h };
}

export type FaceLayout = {
  eyeR: number;
  leftEye: Point;
  rightEye: Point;
  mouth: Point & { w: number };
  leftArm: Point;
  rightArm: Point;
  leftLeg: Point;
  rightLeg: Point;
  limb: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function faceLayout(box: Box): FaceLayout {
  const eyeR = clamp(Math.min(box.w, box.h) * 0.12, 10, 34);
  const cx = box.x + box.w / 2;
  const eyeY = box.y + Math.max(eyeR, box.h * 0.28);
  const spread = clamp(box.w * 0.18, eyeR * 1.5, Math.max(eyeR * 1.5, box.w * 0.32));
  return {
    eyeR,
    leftEye: { x: cx - spread, y: eyeY },
    rightEye: { x: cx + spread, y: eyeY },
    mouth: { x: cx, y: eyeY + eyeR * 2.2, w: Math.max(eyeR * 2.4, box.w * 0.22) },
    leftArm: { x: box.x, y: box.y + box.h * 0.55 },
    rightArm: { x: box.x + box.w, y: box.y + box.h * 0.55 },
    leftLeg: { x: box.x + box.w * 0.36, y: box.y + box.h },
    rightLeg: { x: box.x + box.w * 0.64, y: box.y + box.h },
    limb: clamp(Math.min(box.w, box.h) * 0.08, 8, 22),
  };
}

export function hasInk(strokes: Stroke[]): boolean {
  return strokes.some((stroke) => stroke.color !== ERASER && stroke.points.length > 0);
}

export function traceStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const pts = stroke.points;
  if (!pts.length) return;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (stroke.color === ERASER) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 1) {
    ctx.lineTo(pts[0].x + 0.01, pts[0].y);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  for (const stroke of strokes) traceStroke(ctx, stroke);
}
