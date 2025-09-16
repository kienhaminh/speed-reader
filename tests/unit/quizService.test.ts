import { describe, it, expect } from "vitest";
import { calculateScore, validateQuestions } from "@/services/quizService";
import { Question } from "@/models/comprehensionQuestion";

describe("quizService", () => {
  const sampleQuestions: Question[] = [
    {
      index: 1,
      prompt: "What is the main topic?",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
    },
    {
      index: 2,
      prompt: "Which statement is true?",
      options: ["A", "B", "C", "D"],
      correctIndex: 2,
    },
    {
      index: 3,
      prompt: "What can be inferred?",
      options: ["A", "B", "C", "D"],
      correctIndex: 1,
    },
  ];

  describe("calculateScore", () => {
    it("should calculate 100% for all correct answers", () => {
      const answers = [0, 2, 1]; // All correct
      const score = calculateScore(answers, sampleQuestions);
      expect(score).toBe(100);
    });

    it("should calculate 0% for all incorrect answers", () => {
      const answers = [1, 1, 0]; // All incorrect
      const score = calculateScore(answers, sampleQuestions);
      expect(score).toBe(0);
    });

    it("should calculate partial scores correctly", () => {
      const answers = [0, 1, 1]; // 2 out of 3 correct
      const score = calculateScore(answers, sampleQuestions);
      expect(score).toBe(67); // Rounded to nearest integer
    });

    it("should handle single question", () => {
      const oneQuestion = [sampleQuestions[0]];
      expect(calculateScore([0], oneQuestion)).toBe(100);
      expect(calculateScore([1], oneQuestion)).toBe(0);
    });

    it("should throw error for mismatched lengths", () => {
      expect(() => calculateScore([0, 1], sampleQuestions)).toThrow();
      expect(() => calculateScore([0, 1, 2, 3], sampleQuestions)).toThrow();
    });
  });

  describe("validateQuestions", () => {
    it("should validate correct question structure", () => {
      const validQuestions = [
        {
          prompt: "What is the answer?",
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
        },
        {
          prompt: "Another question?",
          options: ["W", "X", "Y", "Z"],
          correctIndex: 3,
        },
      ];

      const result = validateQuestions(validQuestions, 2);
      expect(result).toHaveLength(2);
      expect(result[0].index).toBe(1);
      expect(result[1].index).toBe(2);
    });

    it("should throw error for wrong question count", () => {
      expect(() => validateQuestions(sampleQuestions, 5)).toThrow(
        "Expected 5 questions, got 3"
      );
    });

    it("should throw error for missing prompt", () => {
      const invalidQuestions = [
        {
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
        },
      ];

      expect(() => validateQuestions(invalidQuestions, 1)).toThrow(
        "prompt is required"
      );
    });

    it("should throw error for wrong number of options", () => {
      const invalidQuestions = [
        {
          prompt: "Question?",
          options: ["A", "B", "C"], // Only 3 options
          correctIndex: 0,
        },
      ];

      expect(() => validateQuestions(invalidQuestions, 1)).toThrow(
        "must have exactly 4 options"
      );
    });

    it("should throw error for invalid correctIndex", () => {
      const invalidQuestions = [
        {
          prompt: "Question?",
          options: ["A", "B", "C", "D"],
          correctIndex: 4, // Out of range
        },
      ];

      expect(() => validateQuestions(invalidQuestions, 1)).toThrow(
        "correctIndex must be 0, 1, 2, or 3"
      );
    });
  });
});
