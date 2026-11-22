import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { sceneSpeech } from "../../src/story/model";
import { WORLDS } from "../../src/story/worlds";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { assertCoverage, button, installAudit, toggleSound } from "./controls";
import { playParker } from "./parker";
import { playScribble, draw } from "./scribble";
import { playStories } from "./story";

const manifest: Record<string, string> = JSON.parse(readFileSync("src/lib/voice-manifest.json", "utf8"));

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
  const storyFiles = [...new Set(Object.values(manifest).filter(path => path.startsWith("voice/story/")))];
  await expect.poll(() => page.evaluate(async (paths) => {
    const { scope } = await navigator.serviceWorker.ready;
    const keys = (await (await caches.open("playtime-stories-" + scope)).keys()).map(key => key.url);
    return paths.every(path => keys.includes(new URL(path, scope).href));
  }, storyFiles), { timeout: 90_000 }).toBe(true);
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
  await page.getByLabel("The hero's name").fill("Parker");
  await page.getByRole("button", { name: /Coral Crown/ }).tap();
  await button(page, "Stickers").tap();
  await expect(page.locator(".found")).toContainText("Pearl Picnic");
  await button(page, "Close").tap();
  const world = WORLDS.find(w => w.id === "coral")!;
  const parts = sceneSpeech(world.scenes[world.start], "Parker");
  expect(parts).toContain("Parker's");
  const requested: string[] = [];
  page.on("request", req => {
    const path = new URL(req.url()).pathname;
    if (path.includes("/voice/")) requested.push(path.replace("/kids-apps/", ""));
  });
  const before = await page.evaluate(() => window.voiceStarts);
  await button(page, "Read to me").tap();
  await expect.poll(() => page.evaluate(() => window.voiceStarts), { timeout: 60_000 }).toBe(before + parts.length);
  expect(requested).toEqual(parts.map(part => manifest[part]));
  expect(await page.evaluate(() => window.missingSpeech)).toEqual([]);
});

for (const format of ["Blob", "bytes"] as const) {
  test(`a saved ${format} gallery row in the original database opens and downloads`, async ({ page, browserName }) => {
    await page.goto("/#/scribble");
    const seed = await page.evaluate(async (format) => {
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
      function insert() {
        return new Promise<void>((resolve, reject) => {
          const tx = db.transaction("friends", "readwrite");
          const image = format === "Blob" ? { blob } : { bytes, mimeType: blob.type };
          const write = tx.objectStore("friends").add({ id: "old", name: "Old pal", created: 1, ...image });
          write.onerror = () => reject(write.error);
          tx.onabort = () => reject(tx.error);
          tx.oncomplete = () => resolve();
        });
      }
      let blobWriteError = "";
      try {
        await insert();
      } catch (error) {
        blobWriteError = String(error);
      } finally {
        db.close();
      }
      return { bytes: Array.from(new Uint8Array(bytes)), blobWriteError };
    }, format);
    if (browserName === "chromium" || format === "bytes") expect(seed.blobWriteError).toBe("");
    test.skip(Boolean(seed.blobWriteError), "Engine rejected the original Blob row: " + seed.blobWriteError);
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
}

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


async function deployment(page: Page, release: "first" | "legacy") {
  const id = randomUUID();
  const publish = async (version: string) => {
    expect((await page.request.post(`/deploy/${id}/${version}`)).status()).toBe(204);
  };
  await publish(release);
  const scope = `/releases/${id}/`;
  await page.goto(scope);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL), { timeout: 60_000 })
    .toBe(new URL(scope + "sw.js", page.url()).href);
  return { scope, advance: () => publish("current") };
}

test("a child finishes and saves while a discovered release waits for acceptance", async ({ page, context }) => {
  const { scope, advance } = await deployment(page, "first");
  await expect(page.locator("footer")).toHaveText("Playtime 4 · e2e-first");
  await page.evaluate(() => localStorage.setItem("playtime.v1.hero", "Robin"));
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: /Scribble Friends/ }).tap();
  await draw(page);
  await advance();

  const home = await context.newPage();
  const navigation = await home.goto(scope);
  expect(navigation?.fromServiceWorker()).toBe(true);
  await expect(home.locator("footer")).toHaveText("Playtime 4 · e2e-first");
  const refresh = "A new version is ready. Tap to refresh";
  await expect(button(page, refresh)).toBeVisible({ timeout: 60_000 });
  await expect(button(page, "Undo")).toBeEnabled();
  await button(page, "Bring to life").tap();
  await expect(page.locator(".dancer")).toBeVisible();
  const download = page.waitForEvent("download");
  await button(page, "Save picture").tap();
  expect(await (await download).failure()).toBeNull();
  await expect(page.locator(".stage-note")).toContainText("in your gallery");
  await button(page, "Later").tap();
  await expect(button(page, refresh)).toHaveCount(0);

  await button(home, refresh).tap();
  await expect(home.locator("footer")).toHaveText("Playtime 4 · e2e-current");
  await expect(page.locator(".dancer")).toBeVisible();
  await button(page, "Gallery").tap();
  await expect(page.locator(".gallery-card img")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("playtime.v1.hero"))).toBe("Robin");
});

test("the legacy cached shell upgrades on navigation with its old tab still open", async ({ page, context, browserName }) => {
  const { scope, advance } = await deployment(page, "legacy");
  const installed = await page.reload();
  expect(installed?.fromServiceWorker()).toBe(true);
  await expect(page.locator(".app-card")).toHaveCount(3);
  await expect(page.locator(".build-stamp")).toHaveCount(0);
  await page.getByRole("button", { name: "Sound is on. Turn sound off." }).tap();
  await page.getByRole("button", { name: /Scribble Friends/ }).tap();
  const changed = page.evaluate(() => new Promise<void>(resolve =>
    navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }),
  ));
  await advance();
  const next = await context.newPage();
  const navigation = await next.goto(scope);
  expect(navigation?.fromServiceWorker()).toBe(true);
  await changed;
  // The old shell has no update UI. Relaunch normally once the new worker claims it.
  await next.reload();
  await expect(next.locator("footer")).toHaveText("Playtime 4 · e2e-current");
  await expect(next.getByRole("button", { name: "Sound is off. Turn sound on." })).toBeVisible();
  if (browserName === "chromium") {
    await next.getByRole("button", { name: /Scribble Friends/ }).tap();
    await draw(next);
    await button(next, "Bring to life").tap();
    await button(next, "Save picture").tap();
    await expect(next.locator(".stage-note")).toContainText("in your gallery");
    // This still-open release directly calls URL.createObjectURL(row.blob).
    await button(page, "Gallery").tap();
    await expect(page.locator(".gallery-card")).toContainText("Friend");
    await expect.poll(() => page.locator(".gallery-card img").evaluate(el => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("a rejected Blob write saves bytes outside the legacy store", async ({ page }) => {
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      if (args[0].blob instanceof Blob) {
        document.documentElement.dataset.blobRejected = "yes";
        throw new DOMException("Blob cloning unavailable", "DataCloneError");
      }
      return put.apply(this, args);
    };
  });
  await page.goto("/#/scribble");
  await draw(page);
  await button(page, "Bring to life").tap();
  const downloaded = page.waitForEvent("download");
  await button(page, "Save picture").tap();
  const expected = await readFile((await (await downloaded).path())!);
  await expect(page.locator(".stage-note")).toContainText("in your gallery");
  await expect(page.locator("html")).toHaveAttribute("data-blob-rejected", "yes");
  const stored = await page.evaluate(async () => {
    async function rows(database: string) {
      return new Promise<{ bytes: ArrayBuffer; mimeType: string }[]>((resolve, reject) => {
        const open = indexedDB.open(database, 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction("friends").objectStore("friends").getAll();
          get.onsuccess = () => { db.close(); resolve(get.result); };
          get.onerror = () => reject(get.error);
        };
      });
    }
    const legacy = await rows("playtime-scribbles");
    const bytes = await rows("playtime-scribbles-bytes");
    return { legacy: legacy.length, sizes: bytes.map(row => row.bytes.byteLength), types: bytes.map(row => row.mimeType) };
  });
  expect(stored).toEqual({ legacy: 0, sizes: [expected.length], types: ["image/png"] });
  await page.reload();
  await button(page, "Gallery").tap();
  const saved = page.waitForEvent("download");
  await button(page, "Save").tap();
  expect(await readFile((await (await saved).path())!)).toEqual(expected);
  await button(page, "Let go").tap();
  await button(page, "Yes, let go").tap();
  await expect(page.locator(".gallery-card")).toHaveCount(0);
});

test("a minimum-size sticker has a centered 44px touch target on a 320px phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#/scribble");
  await button(page, "Crown").tap();
  await button(page, "Smaller").tap();
  await button(page, "Smaller").tap();
  await expect(button(page, "Smaller")).toBeDisabled();
  const crown = button(page, "Placed Crown");
  await crown.scrollIntoViewIfNeeded();
  const target = (await crown.boundingBox())!;
  const art = (await crown.locator("svg").boundingBox())!;
  const stage = (await page.locator(".stage-art").boundingBox())!;
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  expect(art.width).toBeCloseTo(stage.width * 0.16 * 0.65, 0);
  expect(art.x + art.width / 2).toBeCloseTo(target.x + target.width / 2, 0);
  expect(art.y + art.height / 2).toBeCloseTo(target.y + target.height / 2, 0);
  await button(page, "Bow").tap();
  await expect(crown).toHaveAttribute("aria-pressed", "false");
  // Tap inside the added hit area but outside the smaller artwork.
  await crown.tap({ position: { x: 2, y: target.height / 2 } });
  await expect(crown).toHaveAttribute("aria-pressed", "true");
});

for (const hero of ["Momo", "Jo"]) {
  test(`Read to me includes the chosen hero ${hero}`, async ({ page }) => {
    await installAudit(page);
    await page.goto("/#/story");
    // Headless engines need not ship a local English voice. Supply one and
    // capture exactly which words the app hands off to it.
    await page.evaluate(() => {
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
        cancel() {},
        getVoices: () => [{ lang: "en-US", localService: true }],
        speak(utterance: SpeechSynthesisUtterance) {
          window.missingSpeech.push(utterance.text);
          utterance.onend?.call(utterance, new Event("end") as SpeechSynthesisEvent);
        },
      } });
      Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class {
        constructor(public text: string) {}
      } });
    });
    await page.getByLabel("The hero's name").fill(hero);
    const world = WORLDS[0];
    await page.getByRole("button", { name: new RegExp(world.title) }).tap();
    await expect(page.locator(".story-copy")).toContainText(hero);
    const parts = sceneSpeech(world.scenes[world.start], hero);
    expect(parts).toContain(hero);
    const expected = parts.filter(part => manifest[part]).map(part => "/" + manifest[part]);
    const requested: string[] = [];
    page.on("request", req => {
      const path = new URL(req.url()).pathname;
      if (path.startsWith("/voice/")) requested.push(path);
    });
    await button(page, "Read to me").tap();
    await expect.poll(() => page.evaluate(() => window.voiceStarts), { timeout: 60_000 }).toBe(expected.length);
    expect(requested).toEqual(expected);
    expect(await page.evaluate(() => window.missingSpeech)).toEqual(hero === "Jo" ? ["Jo"] : []);
  });
}
