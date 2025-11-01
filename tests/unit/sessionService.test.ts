import { describe, it, expect } from "vitest";
import { computeWpm, validateSessionMetrics } from "@/services/sessionService";

describe("sessionService", () => {
  describe("computeWpm", () => {
    it("should calculate WPM correctly", () => {
      expect(computeWpm(100, 60000)).toBe(100); // 100 words in 1 minute = 100 WPM
      expect(computeWpm(50, 30000)).toBe(100); // 50 words in 30 seconds = 100 WPM
      expect(computeWpm(200, 60000)).toBe(200); // 200 words in 1 minute = 200 WPM
    });

    it("should handle edge cases", () => {
      expect(computeWpm(0, 60000)).toBe(0); // No words read
      expect(computeWpm(100, 0)).toBe(0); // No time elapsed
      expect(computeWpm(0, 0)).toBe(0); // Neither words nor time
    });

    it("should cap extremely high WPM", () => {
      expect(computeWpm(10000, 1000)).toBe(3000); // Capped at 3000 WPM
    });

    it("should round to nearest integer", () => {
      expect(computeWpm(33, 10000)).toBe(198); // 33 words in 10 seconds = 198 WPM
    });
  });

  describe("validateSessionMetrics", () => {
    it("should validate correct metrics", () => {
      const result = validateSessionMetrics(50, 30000, 100);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should catch negative words read", () => {
      const result = validateSessionMetrics(-5, 30000, 100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Words read cannot be negative");
    });

    it("should catch zero or negative duration", () => {
      const result = validateSessionMetrics(50, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duration must be positive");
    });

    it("should catch words read exceeding total", () => {
      const result = validateSessionMetrics(150, 30000, 100);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Words read (150) cannot exceed total words (100)"
      );
    });

    it("should catch unrealistic WPM", () => {
      const result = validateSessionMetrics(5000, 1000, 5000); // 300,000 WPM
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatch(/Computed WPM.*seems unrealistically high/);
    });

    it("should accumulate multiple errors", () => {
      const result = validateSessionMetrics(-5, 0, 100);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
