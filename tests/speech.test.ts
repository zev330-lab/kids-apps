import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { speak, silence } from "../src/lib/speech";
import { audioContext, isMuted } from "../src/lib/sound";

vi.mock("../src/lib/sound", () => ({ audioContext: vi.fn(), isMuted: vi.fn() }));
const source = () => ({
  start: vi.fn(),
  stop: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  onended: null as null | (() => void),
});
let sources: ReturnType<typeof source>[];
let fetchClip: ReturnType<typeof vi.fn>;
let synthesize: ReturnType<typeof vi.fn>;

beforeEach(() => {
  sources = [];
  vi.mocked(audioContext).mockReturnValue({
    createBufferSource: () => {
      const node = source();
      sources.push(node);
      return node;
    },
    decodeAudioData: async () => ({}),
  } as unknown as AudioContext);
  vi.mocked(isMuted).mockReturnValue(false);
  fetchClip = vi.fn(async () => new Response("aac"));
  vi.stubGlobal("fetch", fetchClip);
  vi.stubGlobal("document", { baseURI: "https://example.invalid/kids-apps/#/parker" });
  synthesize = vi.fn((u) => u.onend());
  vi.stubGlobal("window", {
    speechSynthesis: {
      cancel: vi.fn(),
      speak: synthesize,
      getVoices: () => [{ lang: "en-US", localService: true }],
    },
  });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      constructor(public text: string) {}
    },
  );
});
afterEach(() => {
  silence();
  vi.unstubAllGlobals();
});

it("cancels a playing clip and its queued prompt when another button speaks", async () => {
  const first = speak("Letter B", 0.9, "Letter C");
  await vi.waitFor(() => expect(sources[0]?.start).toHaveBeenCalled());
  const second = speak("/b/");
  await first;
  expect(sources[0].stop).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(sources[1]?.start).toHaveBeenCalled());
  sources[1].onended!();
  await second;
  expect(fetchClip).toHaveBeenCalledTimes(2);
  expect(synthesize).not.toHaveBeenCalled();
});

it("keeps a superseded download silent even when it resolves after cancellation", async () => {
  let release!: (response: Response) => void;
  fetchClip.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const pending = speak("Letter B");
  silence();
  release(new Response("aac"));
  await pending;
  expect(sources).toHaveLength(0);
});

it("honors mute and reserves local system speech for a missing recording", async () => {
  vi.mocked(isMuted).mockReturnValue(true);
  await speak("Letter B");
  expect(fetchClip).not.toHaveBeenCalled();
  expect(synthesize).not.toHaveBeenCalled();
  vi.mocked(isMuted).mockReturnValue(false);
  fetchClip.mockResolvedValueOnce(new Response(null, { status: 404 }));
  await speak("Letter B");
  expect(synthesize).toHaveBeenCalledOnce();
  fetchClip.mockRejectedValueOnce(new Error("interrupted request"));
  await speak("Letter B");
  expect(synthesize).toHaveBeenCalledTimes(1);
});
