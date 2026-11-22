import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { webkit } from "playwright";

const installedWebKit = [
  webkit.executablePath(),
  join(homedir(), "Library/Caches/ms-playwright/webkit-2370/pw_run.sh"),
].find((path) => existsSync(path));

const sizes = [
  { name: "iPhone", viewport: { width: 393, height: 852 } },
  { name: "iPad", viewport: { width: 820, height: 1180 } },
];
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 600_000,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:4184",
    headless: true,
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    actionTimeout: 8000,
  },
  projects: sizes.flatMap(({ name, viewport }) => [
    { name: `Chromium ${name}`, use: { browserName: "chromium" as const, viewport } },
    ...(installedWebKit
      ? [
          {
            name: `WebKit ${name}`,
            use: {
              browserName: "webkit" as const,
              viewport,
              launchOptions: { executablePath: installedWebKit },
            },
          },
        ]
      : []),
  ]),
  webServer: {
    command: "npm run build && npm run preview -- --config tests/e2e/preview.config.ts --port 4184 --strictPort",
    url: "http://127.0.0.1:4184",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
