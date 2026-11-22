import { expect, type Locator, type Page } from "@playwright/test";

declare global {
  interface Window {
    buttonAudit: { seen: Set<string>; tapped: Set<string>; scan(): void };
    voiceStarts: number;
    missingSpeech: string[];
    shares: File[];
    resetRoundSeed(): void;
  }
}

// Use the real production DOM and captured clicks. A newly rendered button is
// outstanding until the browser dispatches a click on that particular control.
export async function installAudit(page: Page) {
  await page.addInitScript(() => {
    const seen = new Set<string>(),
      tapped = new Set<string>();
    function key(el: HTMLButtonElement) {
      const name = el.getAttribute("aria-label") || el.innerText.trim();
      const bar = el.closest(".topbar");
      if (bar) return bar.querySelector("h1")?.textContent + " / navigation / " + name;
      const activity = document.querySelector(".play .kicker")?.textContent;
      let screen = activity || el.closest(".screen")?.className || "Home";
      if (el.closest(".story-copy")) screen = document.querySelector(".story-copy h2")!.textContent!;
      if (el.closest(".action-bar")) screen = document.querySelector(".dancer") ? "Dance controls" : "Drawing controls";
      if (el.closest(".tool-dock")) screen = "Drawing tools";
      if (el.closest(".sticker-dock")) screen = "Decorations";
      if (el.closest(".round-done")) screen = "Round complete";
      if (el.closest(".gallery-card")) screen = "Gallery item";
      if (el.closest(".sheet")) screen = "Clear dialog";
      if (el.closest(".sticker-grid, .tab-row")) screen = "Sticker book";
      if (el.closest(".world-grid")) return "World / " + el.querySelector("strong")?.textContent;
      return screen + " / " + name;
    }
    function scan() {
      document.querySelectorAll("button").forEach((el) => {
        if (el.getClientRects().length) seen.add(key(el));
      });
    }
    window.buttonAudit = { seen, tapped, scan };
    document.addEventListener(
      "click",
      (event) => {
        const button = (event.target as Element).closest("button");
        if (button && !button.disabled) tapped.add(key(button));
      },
      true,
    );
    new MutationObserver(scan).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    // Repeat rounds deterministically so coverage is reproducible even after Practice again.
    window.resetRoundSeed = () => {
      let s = 12345;
      Math.random = () => (s = (1664525 * s + 1013904223) >>> 0) / 4294967296;
    };
    window.resetRoundSeed();
    window.voiceStarts = 0;
    window.missingSpeech = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function () {
      window.voiceStarts++;
      start.call(this, 0, 0, 0.035);
    };
    if (window.speechSynthesis) {
      window.speechSynthesis.speak = (utterance) => {
        window.missingSpeech.push(utterance.text);
      };
    }
    window.shares = [];
    Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
    Object.defineProperty(navigator, "share", {
      value: async (data: ShareData) => {
        window.shares.push(...(data.files || []));
      },
      configurable: true,
    });
  });
}

export const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
export async function hear(page: Page, control: Locator) {
  const before = await page.evaluate(() => window.voiceStarts);
  await control.tap();
  await expect.poll(() => page.evaluate(() => window.voiceStarts)).toBeGreaterThan(before);
}

export async function toggleSound(page: Page) {
  const off = page.getByRole("button", { name: "Sound is on. Turn sound off." });
  await off.tap();
  const on = page.getByRole("button", { name: "Sound is off. Turn sound on." });
  await expect(on).toHaveAttribute("aria-pressed", "true");
  await on.tap();
  await expect(off).toHaveAttribute("aria-pressed", "false");
}

export async function assertCoverage(page: Page) {
  const missing = await page.evaluate(() => {
    const audit = window.buttonAudit;
    audit.scan();
    return [...audit.seen].filter((key) => !audit.tapped.has(key)).sort();
  });
  expect(missing, "Rendered buttons without a tap").toEqual([]);
  expect(await page.evaluate(() => window.missingSpeech)).toEqual([]);
}
