// Build actual deployable releases for the preview server. Git is only read.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "vite";

const output = resolve(".cache/e2e-preview");
const legacyRoot = resolve(".cache/e2e-source-9c1ae3a");
mkdirSync(legacyRoot, { recursive: true });
const archive = execFileSync("git", [
  "archive", "9c1ae3a", "src", "public", "index.html", "package.json", "vite.config.ts",
]);
execFileSync("tar", ["-xf", "-", "-C", legacyRoot], { input: archive });

await build({
  root: legacyRoot,
  base: "./",
  build: { outDir: resolve(output, "legacy"), emptyOutDir: true },
});
for (const release of ["first", "current"]) {
  await build({
    base: "./",
    define: { __PLAYTIME_BUILD__: JSON.stringify("e2e-" + release) },
    build: { outDir: resolve(output, release), emptyOutDir: true },
  });
}
