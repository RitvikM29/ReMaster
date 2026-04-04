import { describe, expect, it } from "vitest";
import { calcFocusScore } from "@/utils/focusScore";

describe("calcFocusScore", () => {
  it("penalizes distractions and idle time", () => {
    const score = calcFocusScore({ distractions: 3, idleSeconds: 180, earlyTerminate: false });
    expect(score).toBe(100 - 3 * 5 - 3 * 2);
  });

  it("penalizes early termination", () => {
    const score = calcFocusScore({ distractions: 0, idleSeconds: 0, earlyTerminate: true });
    expect(score).toBe(90);
  });

  it("never drops below zero", () => {
    const score = calcFocusScore({ distractions: 50, idleSeconds: 3600, earlyTerminate: true });
    expect(score).toBe(0);
  });
});
