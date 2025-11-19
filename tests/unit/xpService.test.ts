import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateXPForLevel,
  calculateCumulativeXP,
  calculateLevelFromXP,
  calculateLevelProgress,
} from "@/services/xpService";

describe("XP Service", () => {
  describe("calculateXPForLevel", () => {
    it("should calculate XP for level 1", () => {
      expect(calculateXPForLevel(1)).toBe(100);
    });

    it("should calculate XP for level 2", () => {
      expect(calculateXPForLevel(2)).toBe(282); // 100 * 2^1.5 = 282.84...
    });

    it("should calculate XP for level 5", () => {
      expect(calculateXPForLevel(5)).toBe(1118); // 100 * 5^1.5 = 1118.03...
    });

    it("should calculate XP for level 10", () => {
      expect(calculateXPForLevel(10)).toBe(3162); // 100 * 10^1.5 = 3162.27...
    });

    it("should return increasing values", () => {
      expect(calculateXPForLevel(5)).toBeGreaterThan(calculateXPForLevel(4));
      expect(calculateXPForLevel(10)).toBeGreaterThan(calculateXPForLevel(9));
    });
  });

  describe("calculateCumulativeXP", () => {
    it("should calculate cumulative XP for level 1", () => {
      expect(calculateCumulativeXP(1)).toBe(100);
    });

    it("should calculate cumulative XP for level 2", () => {
      // Level 1: 100 + Level 2: 282 = 382
      expect(calculateCumulativeXP(2)).toBe(382);
    });

    it("should calculate cumulative XP for level 5", () => {
      // Sum of levels 1-5
      const expected =
        calculateXPForLevel(1) +
        calculateXPForLevel(2) +
        calculateXPForLevel(3) +
        calculateXPForLevel(4) +
        calculateXPForLevel(5);
      expect(calculateCumulativeXP(5)).toBe(expected);
    });

    it("should return increasing cumulative values", () => {
      expect(calculateCumulativeXP(5)).toBeGreaterThan(calculateCumulativeXP(4));
      expect(calculateCumulativeXP(10)).toBeGreaterThan(calculateCumulativeXP(9));
    });
  });

  describe("calculateLevelFromXP", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevelFromXP(0)).toBe(1);
    });

    it("should return level 1 for 99 XP", () => {
      expect(calculateLevelFromXP(99)).toBe(1);
    });

    it("should return level 1 for 100 XP", () => {
      expect(calculateLevelFromXP(100)).toBe(1);
    });

    it("should return level 2 for 382 XP", () => {
      // Cumulative XP for level 2
      expect(calculateLevelFromXP(382)).toBe(2);
    });

    it("should return level 5 for 2222 XP", () => {
      const cumulativeXP = calculateCumulativeXP(5);
      expect(calculateLevelFromXP(cumulativeXP)).toBe(5);
    });

    it("should handle large XP values", () => {
      expect(calculateLevelFromXP(10000)).toBeGreaterThan(10);
    });

    it("should be consistent with cumulative XP", () => {
      for (let level = 1; level <= 10; level++) {
        const xp = calculateCumulativeXP(level);
        expect(calculateLevelFromXP(xp)).toBe(level);
      }
    });
  });

  describe("calculateLevelProgress", () => {
    it("should return correct progress for 0 XP", () => {
      const progress = calculateLevelProgress(0);
      expect(progress.level).toBe(1);
      expect(progress.currentXP).toBe(0);
      expect(progress.xpForNextLevel).toBe(calculateXPForLevel(2));
      expect(progress.progress).toBe(0);
    });

    it("should return correct progress for 50 XP (halfway to level 2)", () => {
      const progress = calculateLevelProgress(50);
      expect(progress.level).toBe(1);
      expect(progress.currentXP).toBe(50);
      expect(progress.xpForNextLevel).toBe(calculateXPForLevel(2));
      expect(progress.progress).toBeCloseTo(17.7, 1); // 50/282 * 100
    });

    it("should return correct progress for 100 XP (level 1 complete)", () => {
      const progress = calculateLevelProgress(100);
      expect(progress.level).toBe(1);
      expect(progress.currentXP).toBe(100);
      expect(progress.xpForNextLevel).toBe(calculateXPForLevel(2));
      expect(progress.progress).toBeCloseTo(35.5, 1); // 100/282 * 100
    });

    it("should return correct progress at level boundary", () => {
      const xpForLevel2 = calculateCumulativeXP(2);
      const progress = calculateLevelProgress(xpForLevel2);
      expect(progress.level).toBe(2);
      expect(progress.currentXP).toBe(calculateXPForLevel(2));
      expect(progress.xpForNextLevel).toBe(calculateXPForLevel(3));
      expect(progress.progress).toBe(100);
    });

    it("should never exceed 100% progress", () => {
      const progress = calculateLevelProgress(10000);
      expect(progress.progress).toBeLessThanOrEqual(100);
    });

    it("should be consistent across levels", () => {
      for (let level = 1; level <= 10; level++) {
        const xp = calculateCumulativeXP(level);
        const progress = calculateLevelProgress(xp);
        expect(progress.level).toBe(level);
        expect(progress.progress).toBe(100);
      }
    });
  });

  describe("Level progression logic", () => {
    it("should show exponential growth", () => {
      const xpFor1 = calculateXPForLevel(1);
      const xpFor2 = calculateXPForLevel(2);
      const xpFor3 = calculateXPForLevel(3);

      // XP requirements should grow exponentially
      const ratio1 = xpFor2 / xpFor1;
      const ratio2 = xpFor3 / xpFor2;

      expect(ratio1).toBeGreaterThan(1);
      expect(ratio2).toBeGreaterThan(1);
      // For exponential growth with exponent 1.5, ratios should be similar
      expect(ratio2).toBeCloseTo(ratio1, 0);
    });

    it("should prevent early level saturation", () => {
      // With 1000 XP (10 session completions at 100 XP each)
      // User should not be too high level
      const level = calculateLevelFromXP(1000);
      expect(level).toBeLessThan(7);
      expect(level).toBeGreaterThanOrEqual(4);
    });

    it("should make higher levels progressively harder", () => {
      const level5Time = calculateCumulativeXP(5);
      const level10Time = calculateCumulativeXP(10);
      const level15Time = calculateCumulativeXP(15);

      // Time to reach level 15 should be significantly more than double level 10
      expect(level15Time).toBeGreaterThan(level10Time * 2);
      // Time to reach level 10 should be significantly more than double level 5
      expect(level10Time).toBeGreaterThan(level5Time * 2);
    });
  });
});
