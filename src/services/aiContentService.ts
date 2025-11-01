import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  type GenerateContentRequest,
  type ReadingContent,
  generateContentSchema,
} from "@/models/readingContent";
import { createContent, countWords } from "./contentService";
import { env } from "@/lib/env";
import {
  checkAIGenerationRateLimit,
  recordAIGeneration,
  getRateLimitStatus,
} from "./rateLimitService";

// Initialize Gemini AI - lazy initialization
let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAIInstance;
}

/**
 * Checks if user has exceeded rate limits (backward compatibility wrapper)
 */
export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const result = await checkAIGenerationRateLimit(userId);
  return {
    allowed: result.allowed,
    reason: result.reason,
  };
}

/**
 * Generates content prompts based on language and topic
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
 * Generates title from topic and language
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

/**
 * Generates content using Gemini AI
 */
export async function generateContent(
  request: GenerateContentRequest,
  userId: string = "anonymous"
): Promise<ReadingContent> {
  // Validate input
  const validatedRequest = generateContentSchema.parse(request);

  // Check rate limits
  const rateLimitCheck = await checkRateLimit(userId);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason || "Rate limit exceeded");
  }

  try {
    // Get Gemini model
    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create prompt
    const prompt = createPrompt(
      validatedRequest.language,
      validatedRequest.topic,
      validatedRequest.targetWords
    );

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText || generatedText.trim().length < 50) {
      throw new Error("Generated content is too short or empty");
    }

    // Verify word count is reasonable
    const actualWordCount = countWords(generatedText);
    const targetMin = validatedRequest.targetWords * 0.8; // 80% of target
    const targetMax = validatedRequest.targetWords * 1.2; // 120% of target

    if (actualWordCount < targetMin) {
      throw new Error(
        `Generated content is too short (${actualWordCount} words, expected at least ${Math.round(
          targetMin
        )})`
      );
    }

    let finalText = generatedText;
    if (actualWordCount > targetMax) {
      // Truncate if too long
      const words = generatedText.split(/\s+/);
      const truncatedWords = words.slice(0, validatedRequest.targetWords);
      finalText = truncatedWords.join(" ");
    }

    // Record rate limit usage
    await recordAIGeneration(userId);

    // Create content record
    return await createContent(
      {
        language: validatedRequest.language,
        source: "ai",
        text: finalText,
        title: generateTitle(validatedRequest.topic, validatedRequest.language),
      },
      userId
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error(
          "AI service temporarily unavailable. Please try again later."
        );
      }
      if (error.message.includes("API key")) {
        throw new Error("AI service configuration error");
      }
      throw error;
    }

    throw new Error("Failed to generate content");
  }
}

/**
 * Gets remaining quota for user
 */
export async function getRemainingQuota(userId: string): Promise<{
  daily: number;
  session: number;
}> {
  const status = await getRateLimitStatus(userId);
  return {
    daily: Math.max(0, status.aiGeneration.dailyLimit - status.aiGeneration.dailyUsed),
    session: Math.max(0, status.aiGeneration.sessionLimit - status.aiGeneration.sessionUsed),
  };
}
