import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const fromFile = loadEnv(mode, process.cwd(), "VITE_").VITE_BASE;
  const base = process.env.VITE_BASE || fromFile || "./";

  return {
    base,
    define: { __PLAYTIME_BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC") },
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        injectRegister: false,
        includeManifestIcons: false, // Already covered by the PNG precache glob.
        manifest: {
          name: "Playtime",
          short_name: "Playtime",
          description:
            "Stories, scribbles, and gentle practice. Offline, on this device only.",
          theme_color: "#4a6a96",
          background_color: "#4a6a96",
          display: "standalone",
          orientation: "any",
          start_url: "./",
          scope: "./",
          lang: "en",
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          importScripts: ["./upgrade-legacy.js"],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2,m4a}"],
          navigateFallback: "index.html",
          // Hash routes do not need the server. Ignore the dev-only vite client.
          navigateFallbackDenylist: [/^\/api/],
        },
      }),
    ],
    test: {
      include: ["tests/**/*.test.ts"],
    },
  };
});
