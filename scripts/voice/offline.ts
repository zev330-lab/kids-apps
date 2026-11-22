import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import manifest from "../../src/lib/voice-manifest.json";

const digest = (data: Buffer | string) => createHash("sha256").update(data).digest("hex").slice(0, 16);

// Keep individual URLs for online clients. The installed worker serves those
// same AAC bytes from a few small packs, including on the very first offline visit.
export function offlineVoice() {
  const files = [...new Set(Object.values(manifest))].sort();
  const assets = new Map<string, Buffer | string>();
  const clips: Record<string, [string, number, number]> = {};
  let batch: { path: string; data: Buffer }[] = [];
  let size = 0;
  function flush() {
    if (!batch.length) return;
    const pack = Buffer.concat(batch.map((entry) => entry.data));
    const path = `voice/packs/${digest(pack)}.bin`;
    assets.set(path, pack);
    let offset = 0;
    for (const entry of batch) {
      clips[entry.path] = [path, offset, offset + entry.data.length];
      offset += entry.data.length;
    }
    batch = [];
    size = 0;
  }
  for (const path of files.filter((path) => path.startsWith("voice/core/"))) {
    const data = readFileSync("public/" + path);
    if (size + data.length > 1024 * 1024) flush();
    batch.push({ path, data });
    size += data.length;
  }
  flush();

  const stories = files.filter((path) => path.startsWith("voice/story/"));
  const script = `const coreClips = ${JSON.stringify(clips)};\nconst storyClips = ${JSON.stringify(stories)};\n`
    + readFileSync(new URL("./worker.js", import.meta.url), "utf8");
  const worker = `voice-worker-${digest(script)}.js`;
  assets.set(worker, script);
  const plugin: Plugin = {
    name: "offline-voice",
    generateBundle() {
      for (const [fileName, source] of assets) this.emitFile({ type: "asset", fileName, source });
    },
  };
  return { plugin, worker };
}
