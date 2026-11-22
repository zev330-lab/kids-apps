import { expect, test } from "@playwright/test";
import { LETTERS, BOOKS, makeLetterRound } from "../../src/parker/content";
import { readFileSync } from "node:fs";
import { lines } from "../../src/parker/lines";
import { button, hear, installAudit } from "./controls";

const clips: Record<string, string> = JSON.parse(readFileSync("src/lib/voice-manifest.json", "utf8"));
function seeded(seed: number) {
  return () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
}

test("each Parker letter plays its own name, phoneme and contextual prompt", async ({ page }) => {
  const seeds = new Map<string, number>();
  for (let seed = 0; seeds.size < LETTERS.length && seed < 1000; seed++) {
    seeds.set(makeLetterRound(seeded(seed))[0].answer.letter, seed);
  }
  expect(seeds.size).toBe(LETTERS.length);
  await installAudit(page);
  await page.goto("/#/parker");
  for (const item of LETTERS) {
    await page.evaluate((seed) => {
      Math.random = () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
    }, seeds.get(item.letter)!);
    await page.getByRole("button", { name: /^Letter sounds/ }).tap();
    await expect(page.locator(".prompt")).toHaveText(lines.letter(item.sound));
    const recordings = [
      ["Hear it", lines.letterExample(lines.letter(item.sound), item.say)],
      ["Give me a hint", item.hint],
      ["Letter name", lines.letterName(item.letter)],
      ["Letter sound", item.sound],
    ];
    for (const [label, text] of recordings) {
      const asset = page.waitForRequest((req) => new URL(req.url()).pathname.endsWith("/" + clips[text]));
      await hear(page, button(page, label));
      await asset;
    }
    await button(page, item.letter).tap();
    await expect(page.locator(".gentle")).toContainText("Your try worked.");
    await button(page, "All activities").tap();
  }
});

test("every tiny book page and word plays its recording", async ({ page }) => {
  await installAudit(page);
  await page.goto("/#/parker");
  for (const [index, book] of BOOKS.entries()) {
    await page.evaluate(
      (value) => {
        const previous = Math.random;
        Math.random = () => {
          Math.random = previous;
          return value;
        };
      },
      (index + 0.5) / BOOKS.length,
    );
    await page.getByRole("button", { name: /^Tiny book/ }).tap();
    await expect(page.locator(".play-side .kicker").first()).toHaveText(book.title);
    for (const [i, sentence] of book.pages.entries()) {
      await hear(page, button(page, "Hear it"));
      for (const [j, word] of sentence.replace(".", "").split(" ").entries()) {
        const tile = page.locator(".word-tap").nth(j);
        await expect(tile).toHaveText(word);
        await hear(page, tile);
      }
      await button(page, i === book.pages.length - 1 ? "We read it" : "Next page").tap();
    }
    await button(page, "Rest").tap();
  }
});

test("narration finishes at real speed, replaces a playing line and stops on mute", async ({ page }) => {
  await installAudit(page, { tracePlayback: true });
  await page.goto("/#/parker");
  await page.getByRole("button", { name: /^Letter sounds/ }).tap();
  await expect.poll(() => page.evaluate(() => window.playback[0]?.source.context.state)).toBe("running");
  await expect.poll(() => page.evaluate(() => {
    const line = window.playback[0];
    return line.source.context.currentTime - line.start;
  })).toBeGreaterThan(0.15);
  await expect.poll(() => page.evaluate(() => window.playback[0].end), { timeout: 30_000 }).toBeDefined();
  const natural = await page.evaluate(() => {
    const { start, end, duration, stop } = window.playback[0];
    return { elapsed: end! - start, duration, stopped: stop !== undefined };
  });
  expect(natural.stopped).toBe(false);
  expect(natural.duration).toBeGreaterThan(1);
  expect(natural.elapsed).toBeGreaterThanOrEqual(natural.duration - 0.05);

  await hear(page, button(page, "Hear it"));
  await hear(page, button(page, "Give me a hint"));
  await page.getByRole("button", { name: "Sound is on. Turn sound off." }).tap();
  await expect.poll(() => page.evaluate(() => window.playback.slice(1).every(line => line.end !== undefined))).toBe(true);
  const replaced = await page.evaluate(() => window.playback.slice(1).map(({ start, stop, end, duration, overlapping }) =>
    ({ start, stop, end, duration, overlapping }),
  ));
  expect(replaced).toHaveLength(2);
  expect(replaced[0].stop!).toBeLessThanOrEqual(replaced[1].start);
  for (const line of replaced) {
    expect(line.overlapping).toBe(0);
    expect(line.stop!).toBeLessThan(line.start + line.duration);
    expect(line.end!).toBeLessThan(line.start + line.duration);
  }
  await button(page, "Hear it").tap();
  expect(await page.evaluate(() => window.voiceStarts)).toBe(3);
});
