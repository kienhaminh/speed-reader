import { describe, it, expect } from "vitest";
import {
  countWords,
  validateContentText,
  extractTitleFromContent,
} from "@/services/contentService";

describe("contentService", () => {
  describe("countWords", () => {
    it("should count words correctly", () => {
      expect(countWords("Hello world")).toBe(2);
      expect(countWords("The quick brown fox jumps")).toBe(5);
      expect(countWords("")).toBe(0);
      expect(countWords("   ")).toBe(0);
      expect(countWords("One")).toBe(1);
    });

    it("should handle multiple spaces and newlines", () => {
      expect(countWords("Hello    world")).toBe(2);
      expect(countWords("Hello\nworld")).toBe(2);
      expect(countWords("Hello\n\n  world  \n")).toBe(2);
    });

    it("should handle punctuation", () => {
      expect(countWords("Hello, world!")).toBe(2);
      expect(countWords("Don't count apostrophes as separators")).toBe(5);
    });
  });

  describe("validateContentText", () => {
    it("should validate minimum word count", () => {
      expect(validateContentText("Hello world", 1)).toBe(true);
      expect(validateContentText("Hello world", 2)).toBe(true);
      expect(validateContentText("Hello world", 3)).toBe(false);
      expect(validateContentText("", 1)).toBe(false);
    });
  });

  describe("extractTitleFromContent", () => {
    it("should extract first sentence as title", () => {
      const text = "This is the title. This is the body content.";
      expect(extractTitleFromContent(text)).toBe("This is the title");
    });

    it("should handle content without punctuation", () => {
      const text = "This is a title without punctuation and more content";
      expect(extractTitleFromContent(text, 20)).toBe("This is a title w...");
    });

    it("should return default for empty content", () => {
      expect(extractTitleFromContent("")).toBe("Untitled Content");
    });

    it("should truncate long titles", () => {
      const longText =
        "This is a very long title that should be truncated because it exceeds the maximum length";
      expect(extractTitleFromContent(longText, 30)).toBe(
        "This is a very long title t..."
      );
    });
  });
});
