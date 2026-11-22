import { expect, type Page } from "@playwright/test";
import { WORLDS } from "../../src/story/worlds";
import { button, hear, toggleSound } from "./controls";

export async function playStories(page: Page) {
  await page.getByRole("button", { name: /Story Builder/ }).tap();
  await expect(page).toHaveURL(/#\/story$/);
  await toggleSound(page);
  await page.getByLabel("The hero's name").fill("Bo");
  await button(page, "Open the sticker book").tap();
  await toggleSound(page);
  await button(page, "Home").tap();
  await page.getByRole("button", { name: /Story Builder/ }).tap();
  await button(page, "Open the sticker book").tap();
  for (const world of WORLDS) {
    const tab = page.getByRole("tab", { name: world.title });
    await tab.tap();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".sticker")).toHaveCount(Object.values(world.scenes).filter((s) => s.ending).length);
  }
  await button(page, "Close").tap();
  for (const world of WORLDS) {
    await page.getByRole("button", { name: new RegExp(world.title) }).tap();
    await toggleSound(page);
    await button(page, "Home").tap();
    await page.getByRole("button", { name: /Story Builder/ }).tap();
    await page.getByRole("button", { name: new RegExp(world.title) }).tap();
    const visited = new Set<string>();
    async function walk(id: string, path: string[]) {
      const scene = world.scenes[id];
      await expect(page.locator(".story-copy h2")).toHaveText(scene.title);
      if (visited.has(id)) return;
      visited.add(id);
      await expect(page.locator(".story-copy > p").nth(1)).toHaveText(scene.text.replaceAll("{{name}}", "Bo"));
      await hear(page, button(page, "Read to me"));
      if (scene.ending) {
        await button(page, "Stickers").tap();
        await expect(page.locator(".sticker.found h3", { hasText: scene.ending.title })).toBeVisible();
        await button(page, "Close").tap();
        await button(page, "Read this world again").tap();
        await expect(page.locator(".story-copy h2")).toHaveText(world.scenes[world.start].title);
        for (const label of path) await button(page, label).tap();
        await expect(page.locator(".story-copy h2")).toHaveText(scene.title);
        return;
      }
      for (const choice of scene.choices!) {
        await button(page, choice.label).tap();
        await walk(choice.to, [...path, choice.label]);
        await button(page, "Back").tap();
        await expect(page.locator(".story-copy h2")).toHaveText(scene.title);
      }
    }
    await walk(world.start, []);
    expect(visited.size).toBe(Object.keys(world.scenes).length);
    await button(page, "All worlds").tap();
    await expect(page.locator(".world-card").filter({ hasText: world.title })).toContainText(
      `${Object.values(world.scenes).filter((s) => s.ending).length} of ${Object.values(world.scenes).filter((s) => s.ending).length}`,
    );
  }
  await button(page, "Home").tap();
  await expect(page.locator(".app-card")).toHaveCount(3);
}
