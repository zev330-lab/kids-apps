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
