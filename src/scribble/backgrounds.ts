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
    meadow: ["#3ec6ff", "#147a34"],
    ocean: ["#1aa7d4", "#07283d"],
    space: ["#2a1868", "#0c1020"],
    sunset: ["#ff7a3c", "#5a1848"],
    candy: ["#ff4d9a", "#3a1460"],
    cozy: ["#f0b429", "#8a3a12"],
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
    ctx.fillStyle = id === "candy" ? "#ff4d8d" : id === "sunset" ? "#c45a18" : "#1fbf55";
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
    ctx.fillStyle = id === "cozy" ? "#ffe14a" : "#ffe14a";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.28, Math.min(w, h) * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}
