import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, type Page } from "@playwright/test";
import { BACKGROUNDS } from "../../src/scribble/backgrounds";
import { STICKER_KINDS, STICKER_LABELS } from "../../src/scribble/stickers";
import { button, hear, toggleSound } from "./controls";

export async function draw(page: Page) {
  const canvas = page.getByLabel("Drawing canvas");
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.36, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.64, box.y + box.height * 0.65, { steps: 5 });
  await page.mouse.up();
}

export async function playScribble(page: Page) {
  await page.getByRole("button", { name: /Scribble Friends/ }).tap();
  await expect(page.locator("header h1")).toHaveText("Scribble Friends");
  await toggleSound(page);
  await hear(page, button(page, "Hear drawing note"));
  await button(page, "Bring to life").tap();
  await expect(page.getByRole("status")).toContainText("Draw something first");
  await button(page, "Gallery").tap();
  await expect(page.locator(".gallery-body")).toContainText("Your friends will wait here");
  await toggleSound(page);
  await button(page, "Home").tap();
  await page.getByRole("button", { name: /Scribble Friends/ }).tap();
  await button(page, "Gallery").tap();
  await button(page, "Back").tap();
  await expect(page.getByLabel("Drawing canvas")).toBeVisible();
  for (const tool of [
    ...(await page.locator(".swatch").evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")!))),
    "Eraser",
    "Small",
    "Medium",
    "Big",
    "Jumbo",
  ]) {
    await button(page, tool).tap();
    await expect(button(page, tool)).toHaveAttribute("aria-pressed", "true");
  }
  const pixel = () =>
    page
      .locator("canvas.backdrop")
      .evaluate((el) =>
        Array.from((el as HTMLCanvasElement).getContext("2d")!.getImageData(40, 60, 1, 1).data).join(","),
      );
  const backgrounds = new Set<string>();
  for (const bg of BACKGROUNDS) {
    await button(page, bg.label).tap();
    await expect(page.locator(".stage-art")).toHaveAttribute("data-background", bg.id);
    await expect(button(page, bg.label)).toHaveAttribute("aria-pressed", "true");
    const previous = [...backgrounds];
    await expect.poll(async () => previous.includes(await pixel())).toBe(false);
    backgrounds.add(await pixel());
  }
  await button(page, "Small").tap();
  await draw(page);
  const inkAlpha = () =>
    page.locator("canvas.ink").evaluate((el) => {
      const canvas = el as HTMLCanvasElement;
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;
      for (let i = 3; i < pixels.length; i += 4) total += pixels[i];
      return total;
    });
  const painted = await inkAlpha();
  expect(painted).toBeGreaterThan(0);
  await button(page, "Jumbo").tap();
  await button(page, "Eraser").tap();
  await draw(page);
  expect(await inkAlpha()).toBeLessThan(painted / 10);
  await button(page, "Undo").tap();
  await expect.poll(inkAlpha).toBe(painted);
  await button(page, "Clear").tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await button(page, "Keep drawing").tap();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await button(page, "Clear").tap();
  await button(page, "Fresh page").tap();
  await expect(button(page, "Clear")).toBeDisabled();
  await button(page, "Undo").tap();
  await expect(page.locator(".stage-art")).toHaveAttribute("data-background", "cozy");
  // Exercise every palette sticker, every placed button and peel in drawing mode.
  for (const kind of STICKER_KINDS) {
    const label = STICKER_LABELS[kind];
    await button(page, label).tap();
    const placed = button(page, "Placed " + label);
    await expect(placed).toHaveCount(1);
    await placed.tap();
    await expect(placed).toHaveAttribute("aria-pressed", "true");
    await button(page, "Peel off").tap();
    await expect(placed).toHaveCount(0);
  }
  await button(page, "Crown").tap();
  await button(page, "Bow").tap();
  const crown = button(page, "Placed Crown");
  const bow = button(page, "Placed Bow");
  await expect(crown).toHaveAttribute("aria-pressed", "false");
  const center = (btn: typeof bow) =>
    btn.evaluate((el) => [(el as HTMLElement).style.left, (el as HTMLElement).style.top]);
  expect(await center(crown)).not.toEqual(await center(bow));
  await crown.tap();
  await expect(crown).toHaveAttribute("aria-pressed", "true");
  const width = () => crown.evaluate((el) => parseFloat((el as HTMLElement).style.width));
  const original = await width();
  await button(page, "Bigger").tap();
  await expect.poll(width).toBeGreaterThan(original);
  await button(page, "Smaller").tap();
  await expect.poll(width).toBeCloseTo(original);
  await button(page, "Turn").tap();
  await expect(crown).toHaveAttribute("style", /rotate\(30deg\)/);
  await crown.scrollIntoViewIfNeeded();
  const from = (await crown.boundingBox())!;
  const originalCenter = await center(crown);
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 42, from.y + from.height / 2 + 25, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => center(crown)).not.toEqual(originalCenter);
  await button(page, "Undo").tap();
  await expect.poll(() => center(crown)).toEqual(originalCenter);
  await button(page, "Bring to life").tap();
  await expect(page.locator(".dancer")).toBeVisible();
  for (const bg of BACKGROUNDS) {
    await button(page, bg.label).tap();
    await expect(page.locator(".stage-art")).toHaveAttribute("data-background", bg.id);
  }
  await button(page, "Wand").tap();
  await button(page, "Placed Wand").tap();
  await expect(button(page, "Placed Wand")).toHaveAttribute("aria-pressed", "true");
  for (const mode of ["Bounce", "Dance", "Wiggle"]) {
    await button(page, mode).tap();
    await expect(page.locator(".dancer")).toHaveClass(new RegExp("dance-" + mode.toLowerCase()));
  }
  for (const name of ["Pip", "Bo", "Sunny", "Dot", "Momo", "Nib"]) {
    await button(page, name).tap();
    await expect(page.getByLabel("Friend's name")).toHaveValue(name);
  }
  const png = page.waitForEvent("download");
  await button(page, "Save picture").tap();
  const picture = await png;
  expect(picture.suggestedFilename()).toBe("scribble-nib.png");
  const pictureHash = createHash("sha256")
    .update(await readFile((await picture.path())!))
    .digest();
  await expect(page.getByRole("status")).toContainText("in your gallery");
  await button(page, "Share").tap();
  await expect(page.getByRole("status")).toHaveText("Shared from this device.");
  expect(await page.evaluate(() => window.shares[0].type)).toBe("image/png");
  const movie = page.waitForEvent("download");
  await button(page, "Save movie").tap();
  const recording = await movie;
  expect(recording.suggestedFilename()).toMatch(/scribble-nib\.(webm|mp4|gif)$/);
  const frame = execFileSync("ffmpeg", [
    "-v",
    "error",
    "-i",
    (await recording.path())!,
    "-frames:v",
    "1",
    "-vf",
    "scale=160:112",
    "-pix_fmt",
    "rgb24",
    "-f",
    "rawvideo",
    "pipe:1",
  ]);
  expect(frame.length).toBe(160 * 112 * 3);
  const sky = (2 * 160 + 2) * 3;
  expect(frame[sky]).toBeGreaterThan(210);
  expect(frame[sky + 2]).toBeLessThan(75);
  let crownPixels = 0;
  for (let y = 42; y < 70; y++)
    for (let x = 65; x < 95; x++) {
      const at = (y * 160 + x) * 3;
      if (frame[at] > 220 && frame[at + 1] > 170 && frame[at + 1] < 230 && frame[at + 2] < 140) crownPixels++;
    }
  expect(crownPixels).toBeGreaterThan(25);
  await button(page, "Gallery").tap();
  const cards = page.locator(".gallery-card");
  await expect(cards).toHaveCount(2);
  const card = cards.last();
  await expect(card.getByRole("heading")).toHaveText("Nib");
  // Decode the actual saved blob. Check the cozy sky and the crown's gold ink.
  const colors = await card.locator("img").evaluate(async (img) => {
    const source = img as HTMLImageElement;
    await source.decode();
    const canvas = document.createElement("canvas");
    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(source, 0, 0);
    const sky = [...ctx.getImageData(6, 6, 1, 1).data];
    const center = ctx.getImageData(
      canvas.width * 0.37,
      canvas.height * 0.32,
      canvas.width * 0.26,
      canvas.height * 0.36,
    ).data;
    let gold = 0;
    for (let i = 0; i < center.length; i += 4) {
      if (center[i] === 255 && center[i + 1] === 209 && center[i + 2] === 102 && center[i + 3] === 255) gold++;
    }
    const saved = await (await fetch(source.src)).blob();
    const hash = async (b: Blob) =>
      Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await b.arrayBuffer()))).join();
    return { sky, gold, savedHash: await hash(saved), same: (await hash(saved)) === (await hash(window.shares[0])) };
  });
  expect(colors.same).toBe(true);
  expect(colors.savedHash).toBe(Array.from(pictureHash).join());
  expect(colors.sky[0]).toBeGreaterThan(220);
  expect(colors.sky[2]).toBeLessThan(65);
  expect(colors.gold).toBeGreaterThan(100);
  const download = page.waitForEvent("download");
  await card.getByRole("button", { name: "Save", exact: true }).tap();
  expect((await download).suggestedFilename()).toBe("Nib.png");
  await card.getByRole("button", { name: "Share", exact: true }).tap();
  await expect.poll(() => page.evaluate(() => window.shares.length)).toBe(2);
  await card.getByRole("button", { name: "Let go", exact: true }).tap();
  await card.getByRole("button", { name: "Yes, let go" }).tap();
  await expect(cards).toHaveCount(1);
  await button(page, "Back").tap();
  await button(page, "Draw more").tap();
  await expect(page.getByLabel("Drawing canvas")).toBeVisible();
  await expect(bow).toBeVisible();
  await button(page, "Home").tap();
  await expect(page.locator(".app-card")).toHaveCount(3);
}
