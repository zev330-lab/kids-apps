import { defineConfig } from "vite";

// Two fixtures for upgrading a real worker in an isolated Playwright context.
// Only the test preview server exposes them. All app requests use dist/.
export default defineConfig({
  plugins: [
    {
      name: "previous-install",
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          // Mount the same dist/ under the Pages project prefix for offline tests.
          if (req.url?.startsWith("/kids-apps/")) req.url = req.url.slice("/kids-apps".length);
          if (req.url === "/previous-install") {
            res.setHeader("Content-Type", "text/html");
            res.end("<!doctype html><title>Previous install</title>");
          } else if (req.url === "/previous-worker.js") {
            res.setHeader("Content-Type", "text/javascript");
            res.setHeader("Cache-Control", "no-store");
            res.end("self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));");
          } else next();
        });
      },
    },
  ],
});
