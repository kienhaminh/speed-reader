import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { comprehensionQuestions, comprehensionResults } from "@/models/schema";
import {
  type GenerateQuestionsRequest,
  type QuestionsResponse,
  type Question,
  generateQuestionsSchema,
} from "@/models/comprehensionQuestion";
import {
  type SubmitAnswersRequest,
  type ComprehensionResult,
  submitAnswersSchema,
} from "@/models/comprehensionResult";
import { getSessionById } from "./sessionService";
import { getContentById } from "./contentService";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Creates prompts for question generation based on language
 */
function createQuestionPrompt(
  language: "en" | "vi",
  text: string,
  count: number
): string {
  const prompts = {
    en: `Based on the following text, generate exactly ${count} multiple-choice comprehension questions. Each question should:
- Test understanding of the main content
- Have exactly 4 options (A, B, C, D)
- Have only one correct answer
- Be clear and unambiguous
- Test different aspects (main idea, details, inference, vocabulary)

Format your response as JSON with this exact structure:
[
  {
    "prompt": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Text to analyze:
${text}`,

    vi: `Dựa trên đoạn văn sau, tạo chính xác ${count} câu hỏi trắc nghiệm kiểm tra khả năng đọc hiểu. Mỗi câu hỏi cần:
- Kiểm tra sự hiểu biết về nội dung chính
- Có đúng 4 lựa chọn (A, B, C, D)
- Chỉ có một đáp án đúng
- Rõ ràng và không gây nhầm lẫn
- Kiểm tra các khía cạnh khác nhau (ý chính, chi tiết, suy luận, từ vựng)

Định dạng phản hồi dưới dạng JSON với cấu trúc chính xác này:
[
  {
    "prompt": "Nội dung câu hỏi ở đây?",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correctIndex": 0
  }
]

Đoạn văn cần phân tích:
${text}`,
  };

  return prompts[language];
}

/**
 * Validates generated questions structure
 */
export function validateQuestions(
  questions: unknown[],
  expectedCount: number
): Question[] {
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} questions, got ${questions.length}`
    );
  }

  return questions.map((q, index) => {
    const question = q as {
      prompt?: unknown;
      options?: unknown;
      correctIndex?: unknown;
    };

    if (!question.prompt || typeof question.prompt !== "string") {
      throw new Error(
        `Question ${index + 1}: prompt is required and must be a string`
      );
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`Question ${index + 1}: must have exactly 4 options`);
    }

    if (
      typeof question.correctIndex !== "number" ||
      question.correctIndex < 0 ||
      question.correctIndex > 3
    ) {
      throw new Error(
        `Question ${index + 1}: correctIndex must be 0, 1, 2, or 3`
      );
    }

    return {
      index: index + 1,
      prompt: question.prompt,
      options: question.options as string[],
      correctIndex: question.correctIndex,
    };
  });
}

/**
 * Generates comprehension questions for a session
 */
export async function generateQuestions(
  request: GenerateQuestionsRequest
): Promise<QuestionsResponse> {
  // Validate input
  const validatedRequest = generateQuestionsSchema.parse(request);

  // Get session and content
  const session = await getSessionById(validatedRequest.sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  const content = await getContentById(session.contentId);
  if (!content) {
    throw new Error("Content not found for session");
  }

  // Check if questions already exist for this session
  const existingQuestions = await db
    .select()
    .from(comprehensionQuestions)
    .where(eq(comprehensionQuestions.sessionId, validatedRequest.sessionId));

  if (existingQuestions.length > 0) {
    // Return existing questions
    const questions: Question[] = existingQuestions.map((q) => ({
      index: q.index,
      prompt: q.prompt,
      options: q.options as string[],
      correctIndex: q.correctIndex,
    }));

    return {
      sessionId: validatedRequest.sessionId,
      questions,
    };
  }

  try {
    // Generate questions using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = createQuestionPrompt(
      content.language as "en" | "vi",
      content.text,
      validatedRequest.count
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse JSON response
    let generatedQuestions;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      generatedQuestions = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate questions
    const validatedQuestions = validateQuestions(
      generatedQuestions,
      validatedRequest.count
    );

    // Store questions in database
    const questionRecords = validatedQuestions.map((q) => ({
      id: `question_${validatedRequest.sessionId}_${q.index}_${Date.now()}`,
      sessionId: validatedRequest.sessionId,
      index: q.index,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
    }));

    await db.insert(comprehensionQuestions).values(questionRecords);

    return {
      sessionId: validatedRequest.sessionId,
      questions: validatedQuestions,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error(
          "AI service temporarily unavailable for question generation"
        );
      }
      throw error;
    }

    throw new Error("Failed to generate comprehension questions");
  }
}

/**
 * Calculates score from answers and correct answers
 */
export function calculateScore(
  answers: number[],
  questions: Question[]
): number {
  if (answers.length !== questions.length) {
    throw new Error("Number of answers must match number of questions");
  }

  let correctCount = 0;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] === questions[i].correctIndex) {
      correctCount++;
    }
  }

  return Math.round((correctCount / questions.length) * 100);
}

/**
 * Submits answers and calculates comprehension score
 */
export async function submitAnswers(
  request: SubmitAnswersRequest
): Promise<ComprehensionResult> {
  // Validate input
  const validatedRequest = submitAnswersSchema.parse(request);

  // Check if result already exists
  const [existingResult] = await db
    .select()
    .from(comprehensionResults)
    .where(eq(comprehensionResults.sessionId, validatedRequest.sessionId))
    .limit(1);

  if (existingResult) {
    return existingResult;
  }

  // Get questions for the session
  const questions = await db
    .select()
    .from(comprehensionQuestions)
    .where(eq(comprehensionQuestions.sessionId, validatedRequest.sessionId))
    .orderBy(comprehensionQuestions.index);

  if (questions.length === 0) {
    throw new Error("No questions found for session");
  }

  if (questions.length !== validatedRequest.answers.length) {
    throw new Error(
      `Expected ${questions.length} answers, got ${validatedRequest.answers.length}`
    );
  }

  // Convert to Question format for score calculation
  const questionData: Question[] = questions.map((q) => ({
    index: q.index,
    prompt: q.prompt,
    options: q.options as string[],
    correctIndex: q.correctIndex,
  }));

  // Calculate score
  const scorePercent = calculateScore(validatedRequest.answers, questionData);

  // Create result record
  const resultId = `result_${validatedRequest.sessionId}_${Date.now()}`;

  const newResult = {
    id: resultId,
    sessionId: validatedRequest.sessionId,
    answers: validatedRequest.answers,
    scorePercent,
    completedAt: new Date(),
  };

  // Insert result
  const [insertedResult] = await db
    .insert(comprehensionResults)
    .values(newResult)
    .returning();

  if (!insertedResult) {
    throw new Error("Failed to save comprehension result");
  }

  return insertedResult;
}

/**
 * Gets comprehension result for a session
 */
export async function getResultBySession(
  sessionId: string
): Promise<ComprehensionResult | null> {
  const [result] = await db
    .select()
    .from(comprehensionResults)
    .where(eq(comprehensionResults.sessionId, sessionId))
    .limit(1);

  return result || null;
}

/**
 * Gets questions for a session
 */
export async function getQuestionsBySession(
  sessionId: string
): Promise<Question[]> {
  const questions = await db
    .select()
    .from(comprehensionQuestions)
    .where(eq(comprehensionQuestions.sessionId, sessionId))
    .orderBy(comprehensionQuestions.index);

  return questions.map((q) => ({
    index: q.index,
    prompt: q.prompt,
    options: q.options as string[],
    correctIndex: q.correctIndex,
  }));
}
