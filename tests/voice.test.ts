import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../src/lib/voice-manifest.json";
import { catalog } from "../scripts/voice/catalog";
import { RECORDED_NAMES } from "../src/lib/names";
import { sceneSpeech } from "../src/story/model";
import { WORLDS } from "../src/story/worlds";
import { LETTERS } from "../src/parker/content";
import { lines } from "../src/parker/lines";

const files: Record<string, string> = manifest;
const clip = (text: string) => readFileSync(join("public", files[text]));

describe("offline narration", () => {
  it("ships every catalog entry and only referenced AAC containers", () => {
    expect(Object.keys(files).sort()).toEqual(catalog.map((c) => c.text).sort());
    const paths = new Set(Object.values(files));
    for (const group of ["core", "story"]) {
      const disk = readdirSync("public/voice/" + group).map((name) => `voice/${group}/${name}`);
      expect(disk.sort()).toEqual([...paths].filter((p) => p.startsWith(`voice/${group}/`)).sort());
    }
    for (const entry of catalog) {
      expect(entry.reading).not.toContain("undefined");
      expect(files[entry.text]).toMatch(new RegExp(`^voice/${entry.group}/[a-f0-9]{20}\\.m4a$`));
      const data = clip(entry.text);
      expect(data.toString("ascii", 4, 8)).toBe("ftyp");
      expect(data.includes(Buffer.from("mp4a"))).toBe(true);
    }
  });

  it("has recordings for each displayed preset name in every story, including possessives", () => {
    for (const name of [...RECORDED_NAMES, "our explorer"]) {
      for (const world of WORLDS) for (const scene of Object.values(world.scenes)) {
        const parts = sceneSpeech(scene, name);
        for (const part of parts) expect(files[part]).toMatch(/^voice\/story\//);
        const template = [scene.title, scene.text, scene.ending?.note].join(" ");
        const slots = [...template.matchAll(/\{\{name\}\}('s)?/g)].map(match => name + (match[1] ?? ""));
        expect(parts.filter(part => part === name || part === name + "'s")).toEqual(slots);
      }
    }
  });

  it("uses distinct names and phonemes and keeps the stop sounds short", () => {
    for (const item of LETTERS) {
      expect(files[lines.letterName(item.letter)]).not.toBe(files[item.sound]);
      expect(catalog.find((c) => c.text === item.sound)?.reading).toMatch(/^\{[^}]+\}$/);
    }
    for (const text of ["/b/", "/k/", "/d/", "/g/", "/p/", "/t/"]) {
      const data = clip(text);
      const header = data.indexOf("mvhd");
      expect(header).toBeGreaterThan(0);
      expect(data[header + 4]).toBe(0);
      const seconds = data.readUInt32BE(header + 20) / data.readUInt32BE(header + 16);
      expect(seconds).toBeGreaterThan(0.04);
      expect(seconds).toBeLessThan(0.2);
    }
  });
});
