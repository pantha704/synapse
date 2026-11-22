import { describe, expect, it } from "vitest";
import { GAMIFICATION } from "@/lib/queries/learning-path";

describe("GAMIFICATION", () => {
  it("starts at level 1 with no badges", () => {
    expect(GAMIFICATION(0)).toEqual({ xp: 0, level: 1, badges: [] });
  });

  it("awards 10 XP per completed topic", () => {
    expect(GAMIFICATION(4).xp).toBe(40);
  });

  it("levels every 100 XP", () => {
    expect(GAMIFICATION(9).level).toBe(1);
    expect(GAMIFICATION(10).level).toBe(2);
    expect(GAMIFICATION(25).level).toBe(3);
  });

  it("adds badges at 1, 5, 10 and 25", () => {
    expect(GAMIFICATION(1).badges).toEqual(["First Steps"]);
    expect(GAMIFICATION(5).badges).toEqual(["First Steps", "Halfway"]);
    expect(GAMIFICATION(10).badges).toContain("Ten Topics");
    expect(GAMIFICATION(25).badges).toContain("Quarter Century");
  });
});
