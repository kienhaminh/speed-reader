import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  type GenerateContentRequest,
  type ReadingContent,
  generateContentSchema,
} from "@/models/readingContent";
import { createContent, countWords } from "./contentService";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Rate limiting configuration based on research
 */
const RATE_LIMITS = {
  PER_SESSION: 5, // Max generations per session
  PER_DAY: 20, // Max generations per day per user
  COOLDOWN_MS: 60000, // 1 minute between requests
};

// In-memory rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<
  string,
  { count: number; lastRequest: number; dailyCount: number; lastDaily: string }
>();

/**
 * Checks if user has exceeded rate limits
 */
export function checkRateLimit(userId: string): {
  allowed: boolean;
  reason?: string;
} {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  const userLimits = rateLimitStore.get(userId) || {
    count: 0,
    lastRequest: 0,
    dailyCount: 0,
    lastDaily: today,
  };

  // Reset daily count if new day
  if (userLimits.lastDaily !== today) {
    userLimits.dailyCount = 0;
    userLimits.lastDaily = today;
  }

  // Check daily limit
  if (userLimits.dailyCount >= RATE_LIMITS.PER_DAY) {
    return { allowed: false, reason: "Daily generation limit exceeded" };
  }

  // Check cooldown
  if (now - userLimits.lastRequest < RATE_LIMITS.COOLDOWN_MS) {
    const remainingMs =
      RATE_LIMITS.COOLDOWN_MS - (now - userLimits.lastRequest);
    return {
      allowed: false,
      reason: `Please wait ${Math.ceil(remainingMs / 1000)} seconds`,
    };
  }

  // Check session limit (reset every hour)
  const hourAgo = now - 60 * 60 * 1000;
  if (
    userLimits.lastRequest > hourAgo &&
    userLimits.count >= RATE_LIMITS.PER_SESSION
  ) {
    return { allowed: false, reason: "Session generation limit exceeded" };
  }

  return { allowed: true };
}

/**
 * Updates rate limit counters for user
 */
function updateRateLimit(userId: string): void {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  const userLimits = rateLimitStore.get(userId) || {
    count: 0,
    lastRequest: 0,
    dailyCount: 0,
    lastDaily: today,
  };

  // Reset session count if more than an hour passed
  const hourAgo = now - 60 * 60 * 1000;
  if (userLimits.lastRequest <= hourAgo) {
    userLimits.count = 0;
  }

  userLimits.count += 1;
  userLimits.dailyCount += 1;
  userLimits.lastRequest = now;
  userLimits.lastDaily = today;

  rateLimitStore.set(userId, userLimits);
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
  const rateLimitCheck = checkRateLimit(userId);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason);
  }

  try {
    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    if (actualWordCount > targetMax) {
      // Truncate if too long
      const words = generatedText.split(/\s+/);
      const truncatedWords = words.slice(0, validatedRequest.targetWords);
      const truncatedText = truncatedWords.join(" ");

      // Use truncated text
      return await createContent(
        {
          language: validatedRequest.language,
          source: "ai",
          text: truncatedText,
          title: generateTitle(
            validatedRequest.topic,
            validatedRequest.language
          ),
        },
        userId
      );
    }

    // Update rate limits
    updateRateLimit(userId);

    // Create content record
    return await createContent(
      {
        language: validatedRequest.language,
        source: "ai",
        text: generatedText,
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
export function getRemainingQuota(userId: string): {
  daily: number;
  session: number;
} {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  const userLimits = rateLimitStore.get(userId) || {
    count: 0,
    lastRequest: 0,
    dailyCount: 0,
    lastDaily: today,
  };

  // Reset daily count if new day
  if (userLimits.lastDaily !== today) {
    userLimits.dailyCount = 0;
  }

  // Reset session count if more than an hour passed
  const hourAgo = now - 60 * 60 * 1000;
  if (userLimits.lastRequest <= hourAgo) {
    userLimits.count = 0;
  }

  return {
    daily: Math.max(0, RATE_LIMITS.PER_DAY - userLimits.dailyCount),
    session: Math.max(0, RATE_LIMITS.PER_SESSION - userLimits.count),
  };
}
