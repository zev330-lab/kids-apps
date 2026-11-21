import { describe, expect, it } from "vitest";
import { lintWorld } from "../src/story/model";
import { WORLDS } from "../src/story/worlds";

describe("story worlds", () => {
  it("has three worlds", () => {
    expect(WORLDS.map((world) => world.id)).toEqual(["starlight", "whisperwood", "coral"]);
  });

  it("gives every world many scenes, four endings, and a walkable map", () => {
    for (const world of WORLDS) {
      const endings = Object.values(world.scenes).filter((scene) => scene.ending);
      expect(Object.keys(world.scenes).length).toBeGreaterThanOrEqual(10);
      expect(endings.length).toBeGreaterThanOrEqual(4);
      expect(new Set(endings.map((scene) => scene.ending?.id)).size).toBe(endings.length);
      expect(lintWorld(world)).toEqual([]);
    }
  });
});
