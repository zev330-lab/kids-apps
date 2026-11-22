import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../src/lib/voice-manifest.json";
import { catalog } from "../scripts/voice/catalog";
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
