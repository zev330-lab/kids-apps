import { afterEach, expect, it, vi } from "vitest";
import { listFriends } from "../src/scribble/gallery";

const original = "playtime-scribbles";
const bytes = "playtime-scribbles-bytes";
const drawing = new Blob(["picture"], { type: "image/png" });
const friend = { id: "1", name: "Pip", created: 123 };

function stubDatabases(rows: Record<string, unknown[]>) {
  const open = vi.fn((name: string) => {
    const request = {
      error: new Error("Unavailable " + name),
      onsuccess: () => {},
      onerror: () => {},
      result: {
        close: vi.fn(),
        transaction: () => {
          const tx = {
            oncomplete: () => {},
            objectStore: () => ({ getAll: () => ({ result: rows[name] }) }),
          };
          queueMicrotask(() => tx.oncomplete());
          return tx;
        },
      },
    };
    queueMicrotask(() => name in rows ? request.onsuccess() : request.onerror());
    return request;
  });
  vi.stubGlobal("indexedDB", { open });
}

afterEach(() => vi.unstubAllGlobals());

it("shows the original drawing when the byte database fails to open", async () => {
  stubDatabases({ [original]: [{ ...friend, blob: drawing }] });
  const friends = await listFriends();
  expect(friends).toHaveLength(1);
  expect(friends[0]).toEqual({ ...friend, blob: drawing });
  expect(friends[0].blob).toBe(drawing);
});

it("restores a byte-only drawing when the original database fails to open", async () => {
  stubDatabases({ [bytes]: [{ ...friend, bytes: await drawing.arrayBuffer(), mimeType: drawing.type }] });
  const friends = await listFriends();
  expect(friends).toHaveLength(1);
  expect(friends[0]).toMatchObject(friend);
  expect(friends[0].blob.type).toBe(drawing.type);
  expect(await friends[0].blob.text()).toBe("picture");
});

it("reports a gallery error only when both reads fail", async () => {
  stubDatabases({ [original]: [] });
  await expect(listFriends()).resolves.toEqual([]);
  stubDatabases({});
  await expect(listFriends()).rejects.toThrow("Unavailable " + original);
});
