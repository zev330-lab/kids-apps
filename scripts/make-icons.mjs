import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "favicon.svg"));
const out = join(root, "public", "icons");
mkdirSync(out, { recursive: true });

const files = [
  [180, "apple-touch-icon.png"],
  [192, "icon-192.png"],
  [512, "icon-512.png"],
];

for (const [size, name] of files) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "#ff7a2a",
  });
  writeFileSync(join(out, name), resvg.render().asPng());
  console.log("wrote", name, size);
}
