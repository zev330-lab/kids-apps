import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { assertCoverage, button, installAudit, toggleSound } from "./controls";
import { playParker } from "./parker";
import { playScribble, draw } from "./scribble";
import { playStories } from "./story";

test("every rendered button is tapped across all three apps", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await installAudit(page);
  await page.goto("/#/");
  await expect(page.locator("footer")).toContainText("Playtime 4");
  await toggleSound(page);
  await test.step("World picker, each story edge, ending and sticker-book tab", () => playStories(page));
  await test.step("Draw, decorate, animate, export and manage the gallery", () => playScribble(page));
  await test.step("Every Parker round, hint, answer tile and completion screen", () => playParker(page));
  await assertCoverage(page);
  expect(errors).toEqual([]);
});

test("header stays above the stage at phone and tablet widths", async ({ page }) => {
  await page.goto("/#/scribble");
  for (const width of [320, 375, 393, 430, 768, 820, 1024]) {
    await page.setViewportSize({ width, height: width < 700 ? 852 : 1180 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const header = (await page.locator("header").boundingBox())!;
    const stage = (await page.locator(".stage-art").boundingBox())!;
    expect(header.y).toBe(0);
    expect(stage.y).toBeGreaterThanOrEqual(header.height);
    expect(stage.y + stage.height).toBeLessThanOrEqual(width < 700 ? 852 : 1180);
    expect(stage.width / stage.height).toBeCloseTo(10 / 7, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await button(page, "Candy").tap();
    await expect(page.locator(".stage-art")).toHaveAttribute("data-background", "candy");
  }
});

test("Parker, story narration and saved progress survive offline reload", async ({ context, page }) => {
  await installAudit(page);
  await page.goto("/kids-apps/#/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }),
      );
    }
    localStorage.setItem("playtime.v1.hero", "Zev");
    localStorage.setItem("playtime.v1.endings", JSON.stringify({ coral: ["pearlpincic"] }));
    localStorage.setItem("playtime.v1.growth", JSON.stringify({ tries: 17, practices: 3 }));
  });
  expect(await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)).toMatch(/\/kids-apps\/$/);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: /^Parker/ }).tap();
  await expect(page.locator(".garden")).toContainText("17 tries. 3 times we practiced.");
  await page.getByRole("button", { name: /^Letter sounds/ }).tap();
  await button(page, "Hear it").tap();
  await expect.poll(() => page.evaluate(() => window.voiceStarts)).toBeGreaterThan(0);
  await button(page, "Home").tap();
  await page.getByRole("button", { name: /Story Builder/ }).tap();
  await expect(page.getByLabel("The hero's name")).toHaveValue("Zev");
  await page.getByRole("button", { name: /Coral Crown/ }).tap();
  await button(page, "Stickers").tap();
  await expect(page.locator(".found")).toContainText("Pearl Picnic");
  await button(page, "Close").tap();
  const before = await page.evaluate(() => window.voiceStarts);
  await button(page, "Read to me").tap();
  await expect.poll(() => page.evaluate(() => window.voiceStarts)).toBeGreaterThan(before);
  expect(await page.evaluate(() => window.missingSpeech)).toEqual([]);
});

test("a legacy IndexedDB gallery picture opens and downloads", async ({ page }) => {
  await page.goto("/#/scribble");
  const seed = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 4;
    canvas.getContext("2d")!.fillRect(1, 1, 3, 2);
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!)));
    const bytes = await blob.arrayBuffer();
    const req = indexedDB.open("playtime-scribbles", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("friends", { keyPath: "id" });
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    function insert(payload: { blob: Blob } | { bytes: ArrayBuffer; mimeType: string }) {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction("friends", "readwrite");
        const write = tx.objectStore("friends").add({ id: "old", name: "Old pal", created: 1, ...payload });
        write.onerror = () => reject(write.error);
        tx.onabort = () => reject(tx.error);
        tx.oncomplete = () => resolve();
      });
    }
    let blobWriteError = "";
    try {
      await insert({ blob });
    } catch (error) {
      blobWriteError = String(error);
      await insert({ bytes, mimeType: blob.type });
    } finally {
      db.close();
    }
    return { bytes: Array.from(new Uint8Array(bytes)), blobWriteError };
  });
  if (seed.blobWriteError) test.info().annotations.push({ type: "Blob seed fallback", description: seed.blobWriteError });
  await button(page, "Gallery").tap();
  await expect(page.locator(".gallery-card")).toContainText("Old pal");
  await expect(page.locator(".gallery-card img")).toHaveJSProperty("naturalWidth", 8);
  const download = page.waitForEvent("download");
  await button(page, "Save").tap();
  const picture = await download;
  expect(picture.suggestedFilename()).toBe("Old pal.png");
  expect(await readFile((await picture.path())!)).toEqual(Buffer.from(seed.bytes));
  await page.evaluate(() => Object.defineProperty(navigator, "canShare", { value: () => false }));
  const fallback = page.waitForEvent("download");
  await button(page, "Share").tap();
  expect((await fallback).suggestedFilename()).toBe("Old pal.png");
});

test("a picture still downloads when the gallery cannot open", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "indexedDB", { value: undefined }));
  await page.goto("/#/scribble");
  await draw(page);
  await button(page, "Bring to life").tap();
  await button(page, "Gallery").tap();
  await expect(page.getByRole("status")).toContainText("You can still use Save picture");
  const download = page.waitForEvent("download");
  await button(page, "Save picture").tap();
  const picture = await download;
  expect(picture.suggestedFilename()).toBe("scribble-friend.png");
  expect(await picture.failure()).toBeNull();
  await expect(page.getByRole("status")).toContainText("Look in your downloads");
  await expect(page.locator(".dancer")).toBeVisible();
});

test("GIF fallback includes the chosen background and sticker", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "MediaRecorder", { value: undefined }));
  await page.goto("/#/scribble");
  await draw(page);
  await button(page, "Ocean").tap();
  await button(page, "Crown").tap();
  await button(page, "Bring to life").tap();
  const file = page.waitForEvent("download");
  await button(page, "Save movie").tap();
  const download = await file;
  expect(download.suggestedFilename()).toBe("scribble-friend.gif");
  const stream = await download.createReadStream();
  const pieces: Buffer[] = [];
  for await (const chunk of stream!) pieces.push(chunk);
  const data = Buffer.concat(pieces);
  expect(data.subarray(0, 3).toString()).toBe("GIF");
  const result = await page.evaluate(async (bytes) => {
    const img = new Image();
    img.src = "data:image/gif;base64," + bytes;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const sky = Array.from(ctx.getImageData(6, 6, 1, 1).data);
    const center = ctx.getImageData(c.width * 0.42, c.height * 0.4, c.width * 0.16, c.height * 0.2).data;
    let gold = 0;
    for (let i = 0; i < center.length; i += 4) {
      if (center[i] > 235 && center[i + 1] > 155 && center[i + 1] < 230 && center[i + 2] < 140) gold++;
    }
    return { sky, gold };
  }, data.toString("base64"));
  expect(result.sky[2]).toBeGreaterThan(result.sky[0] + 80);
  expect(result.gold).toBeGreaterThan(80);
});

test("a waiting update keeps a drawing until refresh is accepted", async ({ page }) => {
  await page.goto("/previous-install");
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/previous-worker.js");
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }),
      );
    }
    localStorage.setItem("playtime.v1.hero", "Robin");
  });
  await page.goto("/#/scribble");
  await draw(page);
  const update = button(page, "A new version is ready. Tap to refresh");
  await expect(update).toBeVisible({ timeout: 60_000 });
  await expect(button(page, "Undo")).toBeEnabled();
  expect(await page.evaluate(() => navigator.serviceWorker.controller!.scriptURL)).toContain("previous-worker.js");
  const reloaded = page.waitForEvent("load");
  await update.tap();
  await reloaded;
  await expect(update).toHaveCount(0);
  expect(await page.evaluate(() => navigator.serviceWorker.controller!.scriptURL)).toMatch(/\/sw\.js$/);
  expect(await page.evaluate(() => localStorage.getItem("playtime.v1.hero"))).toBe("Robin");
});

test("the previous release upgrades on the next navigation with an old tab open", async ({ page, context }) => {
  await page.goto("/previous-install");
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.register("/previous-worker.js");
    await navigator.serviceWorker.ready;
    const cache = await caches.open("workbox-precache-v2-" + reg.scope);
    await cache.put(new URL("registerSW.js?__WB_REVISION__=round3", reg.scope), new Response("/* previous install */"));
    localStorage.setItem("playtime.v1.mute", "1");
    await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
  });
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL), { timeout: 60000 })
    .toMatch(/\/sw\.js$/);
  const next = await context.newPage();
  await next.goto("/#/");
  await expect(next.locator("footer")).toContainText("Playtime 4");
  await expect(next.getByRole("button", { name: "Sound is off. Turn sound on." })).toBeVisible();
});
