import { defineConfig } from "vite";

// Each fresh test context gets its own deployment path. Switching the files on
// the server never touches browser registrations, cache storage or open tabs.
export default defineConfig({
  build: { outDir: ".cache/e2e-preview" },
  plugins: [{
    name: "playtime-release-server",
    configurePreviewServer(server) {
      const deployments = new Map<string, string>();
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const deploy = /^\/deploy\/([a-f0-9-]+)\/(first|legacy|current)$/.exec(url.pathname);
        if (req.method === "POST" && deploy) {
          deployments.set(deploy[1], deploy[2]);
          res.writeHead(204).end();
          return;
        }
        const scoped = /^\/releases\/([a-f0-9-]+)\/(.*)$/.exec(url.pathname);
        const release = scoped ? deployments.get(scoped[1]) : "current";
        if (!release) {
          res.writeHead(404).end();
          return;
        }
        const path = scoped ? scoped[2] : url.pathname.replace(/^\/(kids-apps\/)?/, "");
        req.url = `/${release}/${path || "index.html"}${url.search}`;
        res.setHeader("Cache-Control", "no-store");
        next();
      });
    },
  }],
});
