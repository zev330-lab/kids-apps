import { expect, type Page } from "@playwright/test";
import { ACTIVITIES, BOOKS, CVC_WORDS, FEELING_BEATS, type ActivityId } from "../../src/parker/content";
import { button, hear, toggleSound } from "./controls";

async function quizRound(page: Page, id: ActivityId) {
  const count = id === "count" ? 2 : id === "build" ? 3 : 5;
  for (let index = 0; index < count; index++) {
    const hint = button(page, id === "count" ? "Count with me" : "Give me a hint");
    await hear(page, button(page, "Hear it"));
    await hear(page, hint);
    const note = page.locator(".gentle");
    await expect(note).toBeVisible();
    if (id === "letters") {
      await hear(page, button(page, "Letter name"));
      await hear(page, button(page, "Letter sound"));
    }
    if (id === "build") {
      const text = await note.innerText();
      const word = CVC_WORDS.find((w) => w.hint === text)!.word;
      const tiles = page.locator(".choice-row button");
      const choices = await tiles.allTextContents();
      // Try each distractor before completing the word; each tile produces feedback.
      for (const letter of choices.filter((c) => c !== word[0])) {
        const previous = await page.locator(".pill").innerText();
        await button(page, letter).tap();
        await expect(page.locator(".pill")).not.toHaveText(previous);
        await expect(note).toContainText("Let's try again.");
      }
      for (const [i, letter] of [...word].entries()) {
        await button(page, letter).tap();
        await expect(page.locator(".slot").nth(i)).toHaveText(letter);
      }
    } else {
      const options = page.locator(
        ".play-main .choice-row button, .play-main .choice-stack button, .play-main .shape-row button",
      );
      const labels = (await options.allTextContents()).map((t) => t.trim());
      const correct = (await page.locator(".play-main .glow").innerText()).trim();
      for (const label of labels.filter((text) => text !== correct)) {
        const previous = await page.locator(".pill").innerText();
        await button(page, label).tap();
        await expect(page.locator(".pill")).not.toHaveText(previous);
        await expect(note).toContainText("Let's try again.");
      }
      await button(page, correct).tap();
      await expect(note).not.toContainText("Let's try again.");
    }
    if (index + 1 < count) await expect(note).toHaveCount(0);
    else await expect(page.locator(".round-done")).toBeVisible();
  }
}

async function book(page: Page) {
  const title = await page.locator(".play-side .kicker").first().innerText();
  const pages = BOOKS.find((b) => b.title === title)!.pages;
  for (const [index, sentence] of pages.entries()) {
    await expect(page.locator(".page-count")).toHaveText(`Page ${index + 1} of 4`);
    await hear(page, button(page, "Hear it"));
    for (const [i, word] of sentence.replace(".", "").split(" ").entries()) {
      const tile = page.locator(".word-tap").nth(i);
      await expect(tile).toHaveText(word);
      await hear(page, tile);
    }
    await button(page, index === pages.length - 1 ? "We read it" : "Next page").tap();
  }
}

async function feeling(page: Page) {
  for (const [index, beat] of FEELING_BEATS.entries()) {
    await expect(page.locator(".prompt")).toHaveText(beat.text);
    await hear(page, button(page, "Hear it"));
    await button(page, index === FEELING_BEATS.length - 1 ? "I can try too" : "Next").tap();
  }
}

export async function playParker(page: Page) {
  await page.getByRole("button", { name: /^Parker/ }).tap();
  await expect(page).toHaveURL(/#\/parker$/);
  await toggleSound(page);
  for (const activity of ACTIVITIES) {
    await page.evaluate(() => window.resetRoundSeed());
    await page.getByRole("button", { name: new RegExp("^" + activity.title) }).tap();
    await expect(page.locator(".play")).toBeVisible();
    if (activity.id === "book") await book(page);
    else if (activity.id === "feeling") await feeling(page);
    else await quizRound(page, activity.id);
    await expect(page.locator(".round-done")).toBeVisible();
    await hear(page, button(page, "Hear it"));
    await page.evaluate(() => window.resetRoundSeed());
    await button(page, "Practice again").tap();
    await expect(page.locator(".play")).toBeVisible();
    if (activity.id === "feeling") {
      await feeling(page);
      await button(page, "Rest").tap();
      // Visit the activity once more to exercise its back button as well.
      await page.getByRole("button", { name: /^Wiggly tummy/ }).tap();
    }
    await button(page, "All activities").tap();
    await expect(page.locator(".garden")).toContainText("practiced");
  }
  await button(page, "Home").tap();
  await expect(page.locator(".app-card")).toHaveCount(3);
}
