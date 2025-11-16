import { describe, it, expect } from "vitest";

/**
 * Create prompt helper extracted from aiContentService for testing
 */
function createPrompt(
  language: "en" | "vi",
  topic: string,
  targetWords: number
): string {
  const prompts = {
    en: `Write a ${targetWords}-word article about "${topic}". The content should be:
- Educational and informative
- Well-structured with clear paragraphs
- Suitable for reading comprehension testing
- Written at a college reading level
- Factual and engaging
- Include specific details and examples

Please write only the article content without any meta-commentary or titles.`,

    vi: `Viết một bài văn ${targetWords} từ về chủ đề "${topic}". Nội dung cần:
- Mang tính giáo dục và thông tin
- Cấu trúc rõ ràng với các đoạn văn mạch lạc
- Phù hợp để kiểm tra khả năng đọc hiểu
- Viết ở mức độ đại học
- Chính xác và hấp dẫn
- Bao gồm chi tiết cụ thể và ví dụ

Chỉ viết nội dung bài văn, không cần bình luận hay tiêu đề.`,
  };

  return prompts[language];
}

/**
 * Generate title helper extracted from aiContentService for testing
 */
function generateTitle(topic: string, language: "en" | "vi"): string {
  const titleCase = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  if (language === "vi") {
    return titleCase(topic);
  }

  return titleCase(topic);
}

describe("aiContentService", () => {
  describe("createPrompt", () => {
    it("should create English prompt with correct format", () => {
      const prompt = createPrompt("en", "Climate Change", 500);

      expect(prompt).toContain("500-word");
      expect(prompt).toContain("Climate Change");
      expect(prompt).toContain("Educational and informative");
      expect(prompt).toContain("college reading level");
    });

    it("should create Vietnamese prompt with correct format", () => {
      const prompt = createPrompt("vi", "Biến đổi khí hậu", 500);

      expect(prompt).toContain("500 từ");
      expect(prompt).toContain("Biến đổi khí hậu");
      expect(prompt).toContain("Mang tính giáo dục");
      expect(prompt).toContain("mức độ đại học");
    });

    it("should include target word count in prompt", () => {
      const prompt100 = createPrompt("en", "Technology", 100);
      const prompt1000 = createPrompt("en", "Technology", 1000);

      expect(prompt100).toContain("100-word");
      expect(prompt1000).toContain("1000-word");
    });

    it("should handle topics with quotes", () => {
      const prompt = createPrompt("en", 'The "Internet"', 500);

      expect(prompt).toContain('The "Internet"');
    });

    it("should handle long topics", () => {
      const longTopic =
        "The Impact of Artificial Intelligence on Modern Society and Future Developments";
      const prompt = createPrompt("en", longTopic, 500);

      expect(prompt).toContain(longTopic);
    });

    it("should include specific requirements in English prompt", () => {
      const prompt = createPrompt("en", "Science", 500);

      expect(prompt).toContain("Educational and informative");
      expect(prompt).toContain("Well-structured with clear paragraphs");
      expect(prompt).toContain("Suitable for reading comprehension testing");
      expect(prompt).toContain("Written at a college reading level");
      expect(prompt).toContain("Factual and engaging");
      expect(prompt).toContain("Include specific details and examples");
    });

    it("should include specific requirements in Vietnamese prompt", () => {
      const prompt = createPrompt("vi", "Khoa học", 500);

      expect(prompt).toContain("Mang tính giáo dục và thông tin");
      expect(prompt).toContain("Cấu trúc rõ ràng với các đoạn văn mạch lạc");
      expect(prompt).toContain("Phù hợp để kiểm tra khả năng đọc hiểu");
      expect(prompt).toContain("Viết ở mức độ đại học");
      expect(prompt).toContain("Chính xác và hấp dẫn");
      expect(prompt).toContain("Bao gồm chi tiết cụ thể và ví dụ");
    });
  });

  describe("generateTitle", () => {
    it("should convert to title case", () => {
      expect(generateTitle("climate change", "en")).toBe("Climate Change");
      expect(generateTitle("ARTIFICIAL INTELLIGENCE", "en")).toBe(
        "Artificial Intelligence"
      );
      expect(generateTitle("machine Learning", "en")).toBe("Machine Learning");
    });

    it("should handle single word", () => {
      expect(generateTitle("technology", "en")).toBe("Technology");
      expect(generateTitle("SCIENCE", "en")).toBe("Science");
    });

    it("should handle multiple words", () => {
      expect(generateTitle("the future of work", "en")).toBe(
        "The Future Of Work"
      );
      expect(generateTitle("artificial intelligence in healthcare", "en")).toBe(
        "Artificial Intelligence In Healthcare"
      );
    });

    it("should work with Vietnamese language", () => {
      expect(generateTitle("biến đổi khí hậu", "vi")).toBe(
        "Biến Đổi Khí Hậu"
      );
      expect(generateTitle("CÔNG NGHỆ THÔNG TIN", "vi")).toBe(
        "Công Nghệ Thông Tin"
      );
    });

    it("should handle empty strings gracefully", () => {
      expect(generateTitle("", "en")).toBe("");
      expect(generateTitle("", "vi")).toBe("");
    });

    it("should handle extra spaces", () => {
      expect(generateTitle("climate   change", "en")).toBe(
        "Climate   Change"
      );
      expect(generateTitle("  technology  ", "en")).toBe("  Technology  ");
    });

    it("should handle special characters", () => {
      expect(generateTitle("ai & machine learning", "en")).toBe(
        "Ai & Machine Learning"
      );
      expect(generateTitle("the internet-of-things", "en")).toBe(
        "The Internet-of-things"
      );
    });

    it("should handle numbers in topic", () => {
      expect(generateTitle("5g technology", "en")).toBe("5g Technology");
      expect(generateTitle("covid-19 pandemic", "en")).toBe(
        "Covid-19 Pandemic"
      );
    });
  });
});
