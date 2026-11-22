import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { speak, silence } from "../src/lib/speech";
import { audioContext, isMuted } from "../src/lib/sound";
import { LETTERS } from "../src/parker/content";

vi.mock("../src/lib/sound", async (importOriginal) => ({
  ...await importOriginal<typeof import("../src/lib/sound")>(),
  audioContext: vi.fn(),
  isMuted: vi.fn(),
}));
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
    state: "running",
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

it("resumes an interrupted context during the tap and plays the recording", async () => {
  const ctx = audioContext()!;
  const resume = vi.fn(async () => { Object.assign(ctx, { state: "running" }); });
  Object.assign(ctx, { state: "interrupted", resume });
  const reading = speak("Letter B");
  expect(resume).toHaveBeenCalledOnce();
  await vi.waitFor(() => expect(sources[0]?.start).toHaveBeenCalledOnce());
  sources[0].onended!();
  await reading;
  expect(synthesize).not.toHaveBeenCalled();
});

it("uses the local voice if resume leaves the context interrupted", async () => {
  Object.assign(audioContext()!, { state: "interrupted", resume: vi.fn().mockResolvedValue(undefined) });
  await speak("Letter B");
  expect(fetchClip).not.toHaveBeenCalled();
  expect(synthesize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "Letter B" }));
});

it.each(LETTERS)("speaks a keyword cue when the $sound recording fails", async ({ sound, keyword }) => {
  fetchClip.mockRejectedValueOnce(new Error("offline"));
  await speak(sound);
  expect(fetchClip).toHaveBeenCalledOnce();
  expect(synthesize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: `the first sound in ${keyword}` }));
});

it("translates embedded and unfamiliar phoneme notation before system speech", async () => {
  await speak("Listen for /ĕ/, /ks/, and /sh/.");
  expect(synthesize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    text: "Listen for the first sound in egg, the last two sounds in fox, and that sound.",
  }));
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

it.each(["no context", "network", "decode", "start", "resume", 404, 410, 503])(
  "speaks the same line locally after recording failure (%s)",
  async (failure) => {
    const ctx = audioContext()!;
    if (failure === "no context") vi.mocked(audioContext).mockReturnValue(null);
    if (failure === "network") fetchClip.mockRejectedValueOnce(new TypeError("offline"));
    if (failure === "decode") ctx.decodeAudioData = vi.fn().mockRejectedValue(new Error("invalid AAC"));
    if (failure === "start") ctx.createBufferSource = () => {
      const node = source();
      node.start.mockImplementation(() => { throw new Error("start failed"); });
      return node as unknown as AudioBufferSourceNode;
    };
    if (failure === "resume") Object.assign(ctx, { state: "suspended", resume: () => Promise.reject() });
    if (typeof failure === "number") fetchClip.mockResolvedValueOnce(new Response(null, { status: failure }));
    await speak("Letter B");
    expect(synthesize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "Letter B" }));
  },
);

it.each(["silence", "mute"])("does not fall back after %s during a failed download", async (reason) => {
  let reject!: (error: Error) => void;
  fetchClip.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
  const pending = speak(["Letter B", "Letter C"]);
  if (reason === "mute") vi.mocked(isMuted).mockReturnValue(true);
  else silence();
  reject(new Error("download interrupted"));
  await pending;
  expect(synthesize).not.toHaveBeenCalled();
  expect(fetchClip).toHaveBeenCalledTimes(1);
});

it("honors mute before fetching or speaking", async () => {
  vi.mocked(isMuted).mockReturnValue(true);
  await speak("Letter B");
  expect(fetchClip).not.toHaveBeenCalled();
  expect(synthesize).not.toHaveBeenCalled();
});

it("keeps a custom name local between two recorded story parts", async () => {
  const reading = speak(["Letter B", "Jo", "Letter C"]);
  await vi.waitFor(() => expect(sources[0]?.start).toHaveBeenCalled());
  expect(synthesize).not.toHaveBeenCalled();
  sources[0].onended!();
  await vi.waitFor(() => expect(sources[1]?.start).toHaveBeenCalled());
  expect(synthesize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "Jo" }));
  sources[1].onended!();
  await reading;
  expect(fetchClip).toHaveBeenCalledTimes(2);
});
