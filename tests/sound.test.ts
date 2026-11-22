import { afterEach, expect, it, vi } from "vitest";
import { playSound } from "../src/lib/sound";

afterEach(() => vi.unstubAllGlobals());

it("resumes interrupted audio on tap and skips the effect if a later resume fails", async () => {
  const start = vi.fn();
  const ctx = {
    state: "interrupted",
    currentTime: 0,
    resume: vi.fn(async () => { ctx.state = "running"; }),
    createOscillator: vi.fn(() => ({ frequency: {}, connect: vi.fn(), start, stop: vi.fn() })),
    createGain: () => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }),
  };
  vi.stubGlobal("window", { AudioContext: class { constructor() { return ctx; } } });
  const effect = playSound("tap");
  expect(ctx.resume).toHaveBeenCalledOnce();
  await effect;
  expect(start).toHaveBeenCalledOnce();

  ctx.state = "interrupted";
  ctx.resume.mockRejectedValueOnce(new Error("unavailable"));
  await playSound("tap");
  expect(ctx.resume).toHaveBeenCalledTimes(2);
  expect(ctx.createOscillator).toHaveBeenCalledOnce();
});
