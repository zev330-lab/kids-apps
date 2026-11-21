import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = "/tmp/playtime-shots";
mkdirSync(out, { recursive: true });
const base = "http://127.0.0.1:4173/";

const views = [
  ["iphone-portrait", 390, 844],
  ["iphone-landscape", 844, 390],
  ["ipad-820-portrait", 820, 1180],
  ["ipad-820-landscape", 1180, 820],
  ["ipad-1024", 1024, 1366],
  ["split-320", 320, 800],
  ["split-507", 507, 900],
  ["split-678", 678, 1024],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];

async function overflow(page, label) {
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.documentElement.scrollWidth;
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right > vw + 4 || r.left < -4) {
        const parent = el.parentElement;
        const ps = parent ? getComputedStyle(parent) : null;
        const clips = ps && (ps.overflowX === "auto" || ps.overflowX === "hidden" || ps.overflowX === "scroll" || ps.overflow === "hidden");
        if (!clips) {
          offenders.push(`${el.className?.toString?.().slice(0, 60) || el.tagName} L${Math.round(r.left)} R${Math.round(r.right)}`);
        }
      }
    }
    return { sw, vw, offenders: offenders.slice(0, 8) };
  });
  if (info.sw > info.vw + 2 || info.offenders.length) {
    problems.push(`${label} overflow sw=${info.sw} vw=${info.vw} ${info.offenders.join(" | ")}`);
  }
}

async function shot(page, name) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}

const page = await browser.newPage();
page.on("pageerror", (err) => problems.push(`pageerror ${err.message}`));

for (const [name, width, height] of views) {
  await page.setViewportSize({ width, height });
  await page.goto(base + "#/", { waitUntil: "networkidle" });
  await page.waitForSelector(".app-card");
  await overflow(page, `home ${name}`);
  if (["iphone-portrait", "ipad-820-landscape", "ipad-1024", "split-320", "split-678"].includes(name)) {
    await shot(page, `home-${name}`);
  }
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "#/story", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Starlight Voyage/ }).click();
await page.getByRole("button", { name: "Climb into the rocket" }).click();
await page.waitForSelector(".story-copy");
await shot(page, "story-iphone-portrait");
await overflow(page, "story scene iphone");

await page.setViewportSize({ width: 1180, height: 820 });
const storyDisplay = await page.locator(".story-stage").evaluate((el) => getComputedStyle(el).display);
if (storyDisplay !== "grid") problems.push(`story landscape display ${storyDisplay}`);
await shot(page, "story-ipad-landscape");
await overflow(page, "story ipad landscape");

await page.setViewportSize({ width: 820, height: 1180 });
await shot(page, "story-ipad-820-portrait");
await overflow(page, "story ipad portrait");

await page.setViewportSize({ width: 320, height: 800 });
await overflow(page, "story split 320");
await shot(page, "story-split-320");

await page.setViewportSize({ width: 1024, height: 1366 });
await page.getByRole("button", { name: "Stickers" }).click();
await page.waitForSelector(".sticker");
await shot(page, "stickers-ipad-1024");
await overflow(page, "stickers 1024");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "#/scribble", { waitUntil: "networkidle" });
await page.waitForSelector("canvas");
const box = await page.locator("canvas").boundingBox();
if (!box) problems.push("no canvas");
else {
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.45);
  await page.mouse.down();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    await page.mouse.move(box.x + box.width * 0.5 + Math.cos(a) * box.width * 0.18, box.y + box.height * 0.5 + Math.sin(a) * box.height * 0.18);
  }
  await page.mouse.up();
}
await shot(page, "scribble-draw-iphone");
await page.getByRole("button", { name: "Bring to life" }).click();
await page.waitForSelector(".dancer");
await shot(page, "scribble-alive-iphone");
await overflow(page, "scribble alive iphone");
const eyes = await page.locator(".eye").count();
if (eyes !== 2) problems.push(`eyes ${eyes}`);

await page.setViewportSize({ width: 1180, height: 820 });
const cols = await page.locator(".scribble-body").evaluate((el) => getComputedStyle(el).gridTemplateColumns);
if (!cols.includes("px")) problems.push(`scribble columns ${cols}`);
await shot(page, "scribble-alive-ipad-landscape");
await overflow(page, "scribble ipad landscape");

await page.setViewportSize({ width: 820, height: 1180 });
await shot(page, "scribble-alive-ipad-portrait");
await overflow(page, "scribble ipad portrait");

await page.setViewportSize({ width: 320, height: 800 });
await shot(page, "scribble-split-320");
await overflow(page, "scribble split 320");
await page.setViewportSize({ width: 507, height: 900 });
await overflow(page, "scribble split 507");
await page.setViewportSize({ width: 678, height: 1024 });
await overflow(page, "scribble split 678");
await shot(page, "scribble-split-678");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "#/parker", { waitUntil: "networkidle" });
await page.waitForSelector(".act-card");
await shot(page, "parker-home-iphone");
await overflow(page, "parker home iphone");

await page.setViewportSize({ width: 1180, height: 820 });
const parkerHome = await page.locator(".parker-home").evaluate((el) => getComputedStyle(el).display);
if (parkerHome !== "grid") problems.push(`parker home display ${parkerHome}`);
await shot(page, "parker-home-ipad-landscape");

await page.setViewportSize({ width: 820, height: 1180 });
await shot(page, "parker-home-ipad-portrait");
await overflow(page, "parker home ipad portrait");

await page.setViewportSize({ width: 1024, height: 1366 });
await shot(page, "parker-home-ipad-1024");

await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: /Letter sounds/ }).click();
await page.waitForSelector(".letter-btn");
const letters = page.locator(".letter-btn");
const count = await letters.count();
for (let i = 0; i < count; i++) {
  const note = await page.locator(".gentle").count();
  if (note) break;
  await letters.nth(i).click();
  await page.waitForTimeout(200);
}
await shot(page, "parker-letters-iphone");
await overflow(page, "parker letters iphone");

await page.setViewportSize({ width: 1180, height: 820 });
const playDisplay = await page.locator(".play").evaluate((el) => getComputedStyle(el).display);
if (playDisplay !== "grid") problems.push(`parker play display ${playDisplay}`);
await shot(page, "parker-letters-ipad-landscape");
await overflow(page, "parker letters ipad landscape");

await page.setViewportSize({ width: 320, height: 800 });
await shot(page, "parker-letters-split-320");
await overflow(page, "parker letters split 320");

await page.setViewportSize({ width: 507, height: 900 });
await overflow(page, "parker letters split 507");
await page.setViewportSize({ width: 678, height: 1024 });
await overflow(page, "parker letters split 678");
await shot(page, "parker-letters-split-678");

await page.setViewportSize({ width: 820, height: 1180 });
await page.getByRole("button", { name: "All activities" }).click();
await page.getByRole("button", { name: /Wiggly tummy/ }).click();
await page.waitForSelector(".prompt");
await shot(page, "parker-feeling-ipad-portrait");
await overflow(page, "parker feeling ipad");

await page.setViewportSize({ width: 390, height: 844 });
await shot(page, "parker-feeling-iphone");

await page.getByRole("button", { name: "All activities" }).click();
await page.getByRole("button", { name: /^Count/ }).click();
await page.waitForSelector(".count-bit");
await shot(page, "parker-count-iphone");
await page.setViewportSize({ width: 1180, height: 820 });
await shot(page, "parker-count-ipad-landscape");
await overflow(page, "parker count ipad");

console.log(problems.length ? problems.join("\n") : "NO PROBLEMS");
await browser.close();
