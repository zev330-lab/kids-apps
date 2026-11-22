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

const originalEndings: Record<string, string[]> = {
  starlight: ["lullaby", "mechanic", "dance", "sweet", "singer", "sunrise", "flag"],
  whisperwood: ["firefly", "owl", "tree", "giggle", "bard", "picnic", "crown"],
  coral: ["teacher", "tidesong", "shellgarden", "penpal", "kindcrown", "pearlpincic", "baker", "reefshare"],
};

for (const world of WORLDS) {
  it(`walks every path in ${world.title} and recognizes legacy stickers`, () => {
    const visited = new Set<string>();
    const endings = new Set<string>();
    function walk(id: string, path: string[]) {
      expect(path, `cycle leading to ${id}`).not.toContain(id);
      const scene = world.scenes[id];
      expect(scene?.id).toBe(id);
      visited.add(id);
      if (scene.ending) {
        expect(path.length).toBeGreaterThanOrEqual(3);
        expect(scene.choices ?? []).toHaveLength(0);
        endings.add(scene.ending.id);
        return;
      }
      expect(scene.choices?.length ?? 0).toBeGreaterThanOrEqual(2);
      for (const choice of scene.choices!) walk(choice.to, [...path, id]);
    }
    walk(world.start, []);
    expect([...visited].sort()).toEqual(Object.keys(world.scenes).sort());
    expect(endings.size).toBeGreaterThanOrEqual(8);
    expect(endings.size).toBe(Object.values(world.scenes).filter(s => s.ending).length);
    for (const id of originalEndings[world.id]) expect(endings.has(id)).toBe(true);
  });
}
