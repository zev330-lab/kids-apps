import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";

const script = readFileSync(new URL("../scripts/voice/worker.js", import.meta.url), "utf8");
const scope = "https://example.invalid/kids-apps/";
const clip = "voice/story/current.m4a";

function worker() {
  const entries = new Map<string, Response>();
  const cache = {
    keys: async () => Array.from(entries.keys(), url => new Request(url)),
    delete: async (request: Request) => entries.delete(request.url),
    match: async (url: string) => entries.get(url),
    put: vi.fn(async (url: string, response: Response) => { entries.set(url, response); }),
  };
  const open = vi.fn(async () => cache);
  const fetch = vi.fn(async () => new Response("downloaded audio"));
  const listeners = new Map<string, (event: unknown) => void>();
  runInNewContext(script, {
    URL, Response, fetch, caches: { open }, coreClips: {}, storyClips: [clip],
    self: { registration: { scope }, addEventListener: listeners.set.bind(listeners) },
  });
  return { entries, cache, open, fetch, listeners };
}

it("returns the downloaded story when caching it exceeds quota", async () => {
  const { cache, listeners } = worker();
  cache.put.mockRejectedValueOnce(new DOMException("Full", "QuotaExceededError"));
  const respondWith = vi.fn<(response: Promise<Response>) => void>();
  listeners.get("fetch")!({ request: new Request(scope + clip), respondWith });
  const response = await respondWith.mock.calls[0][0];
  expect(cache.put).toHaveBeenCalledOnce();
  expect(await response.text()).toBe("downloaded audio");
});

it.each(["activate", "message"])("prunes obsolete clips and keeps current audio on %s", async (type) => {
  const { entries, fetch, listeners, open } = worker();
  const current = new Response("saved audio");
  entries.set(scope + clip, current);
  entries.set(scope + "voice/story/obsolete.m4a", new Response("old"));
  const waitUntil = vi.fn<(work: Promise<void>) => void>();
  listeners.get(type)!({ data: { type: "WARM_STORIES" }, waitUntil });
  await waitUntil.mock.calls[0][0];
  expect(open).toHaveBeenCalledExactlyOnceWith("playtime-stories-" + scope);
  expect([...entries.keys()]).toEqual([scope + clip]);
  expect(entries.get(scope + clip)).toBe(current);
  expect(fetch).not.toHaveBeenCalled();
});
