import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("static hosting", () => {
  it("is ready for a Vercel static build", () => {
    const config = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      buildCommand: string;
      outputDirectory: string;
    };
    expect(config.buildCommand).toBe("npm run build");
    expect(config.outputDirectory).toBe("dist");
  });

  it("includes a GitHub Pages workflow and a configurable base", () => {
    const workflow = readFileSync(".github/workflows/pages.yml", "utf8");
    expect(workflow).toContain("actions/deploy-pages");
    expect(workflow).toContain("VITE_BASE");
    const vite = readFileSync("vite.config.ts", "utf8");
    expect(vite).toContain('"./"');
  });
});
