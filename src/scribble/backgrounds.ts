export const BACKGROUNDS = [
  { id: "meadow", label: "Meadow" },
  { id: "ocean", label: "Ocean" },
  { id: "space", label: "Space" },
  { id: "sunset", label: "Sunset" },
  { id: "candy", label: "Candy" },
  { id: "cozy", label: "Cozy" },
] as const;

export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export function paintBackground(ctx: CanvasRenderingContext2D, id: BackgroundId, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  const stops: Record<BackgroundId, [string, string]> = {
    meadow: ["#b7ecff", "#e8f8c8"],
    ocean: ["#9be7ff", "#3aa0e8"],
    space: ["#8ea2ff", "#ffd0ea"],
    sunset: ["#ffd6a5", "#ff9aa2"],
    candy: ["#ffd0e8", "#d6ccff"],
    cozy: ["#ffe8c2", "#ffc2b3"],
  };
  gradient.addColorStop(0, stops[id][0]);
  gradient.addColorStop(1, stops[id][1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  if (id === "space") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 18; i++) {
      const x = ((i * 97) % w);
      const y = ((i * 53) % Math.floor(h * 0.7));
      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 3 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (id === "meadow" || id === "candy" || id === "sunset" || id === "cozy") {
    ctx.fillStyle = id === "candy" ? "#ffb7d5" : id === "sunset" ? "#f4a261" : "#7dce6a";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.quadraticCurveTo(w * 0.25, h * 0.6, w * 0.5, h * 0.74);
    ctx.quadraticCurveTo(w * 0.75, h * 0.88, w, h * 0.68);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }
  if (id === "ocean") {
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.quadraticCurveTo(w * 0.25, h * 0.56, w * 0.5, h * 0.62);
    ctx.quadraticCurveTo(w * 0.75, h * 0.68, w, h * 0.6);
    ctx.stroke();
  }
  if (id === "sunset" || id === "meadow" || id === "cozy") {
    ctx.fillStyle = id === "cozy" ? "#ffe08a" : "#ffd166";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.28, Math.min(w, h) * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}
