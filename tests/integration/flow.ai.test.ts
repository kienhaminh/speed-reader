import { test, expect } from "@playwright/test";

test.describe("AI content generation and reading flow", () => {
  test("generate AI content and complete reading session", async ({ page }) => {
    await page.goto("/");

    // Step 1: Generate AI content
    await page.getByTestId("ai-generation-tab").click();

    await page.getByTestId("ai-language-select").selectOption("en");
    await page
      .getByTestId("ai-topic-input")
      .fill("renewable energy and sustainability");
    await page.getByTestId("ai-target-words-input").fill("300");
    await page.getByTestId("generate-content-btn").click();

    // Verify AI generation in progress
    await expect(page.getByTestId("generation-status")).toContainText(
      "Generating"
    );
    await expect(page.getByTestId("loading-spinner")).toBeVisible();

    // Wait for generation to complete
    await expect(page.getByTestId("generation-status")).toContainText(
      "Complete",
      { timeout: 30000 }
    );
    await expect(page.getByTestId("generated-content")).toBeVisible();

    // Verify generated content properties
    const generatedText = await page
      .getByTestId("generated-content")
      .textContent();
    expect(generatedText?.length).toBeGreaterThan(100);

    await expect(page.getByTestId("generated-title")).toBeVisible();
    await expect(page.getByTestId("generated-word-count")).toContainText(
      /2[5-9]\d|3[0-7]\d/
    ); // 250-370 words range
    await expect(page.getByTestId("content-source")).toContainText("ai");

    // Step 2: Use generated content for reading session
    await page.getByTestId("use-generated-content-btn").click();

    await page.getByTestId("mode-select").selectOption("chunk");
    await page.getByTestId("pace-wpm-input").fill("250");
    await page.getByTestId("chunk-size-input").fill("4");
    await page.getByTestId("start-session-btn").click();

    // Step 3: Read AI-generated content
    await page.getByTestId("play-btn").click();

    await expect(page.getByTestId("reading-status")).toContainText("Playing");
    await expect(page.getByTestId("current-chunk")).toBeVisible();

    // Let reading progress for a bit
    await page.waitForTimeout(5000);

    await page.getByTestId("finish-reading-btn").click();
    await expect(page.getByTestId("session-complete")).toBeVisible();

    // Step 4: Quiz on AI-generated content
    await page.getByTestId("start-quiz-btn").click();

    // Verify quiz questions are relevant to the topic
    const firstQuestion = await page
      .getByTestId("question-1-prompt")
      .textContent();
    expect(firstQuestion?.toLowerCase()).toMatch(
      /renewable|energy|sustain|environment|solar|wind|green/
    );

    // Answer all questions
    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-0`).check();
      if (i < 5) {
        await page.getByTestId("next-question-btn").click();
      }
    }

    await page.getByTestId("submit-quiz-btn").click();
    await expect(page.getByTestId("quiz-results")).toBeVisible();

    // Verify session tracking shows AI source
    await expect(page.getByTestId("content-source-display")).toContainText(
      "AI Generated"
    );
  });

  test("AI content generation with Vietnamese language", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("ai-generation-tab").click();

    await page.getByTestId("ai-language-select").selectOption("vi");
    await page
      .getByTestId("ai-topic-input")
      .fill("công nghệ thông tin và trí tuệ nhân tạo");
    await page.getByTestId("ai-target-words-input").fill("250");
    await page.getByTestId("generate-content-btn").click();

    // Wait for Vietnamese content generation
    await expect(page.getByTestId("generation-status")).toContainText(
      "Complete",
      { timeout: 30000 }
    );

    // Verify Vietnamese content
    const viText = await page.getByTestId("generated-content").textContent();
    expect(viText).toMatch(
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/
    );

    // Use for reading session
    await page.getByTestId("use-generated-content-btn").click();
    await page.getByTestId("mode-select").selectOption("word");
    await page.getByTestId("pace-wpm-input").fill("200");
    await page.getByTestId("start-session-btn").click();

    await page.getByTestId("play-btn").click();
    await expect(page.getByTestId("current-word")).toBeVisible();

    // Verify Vietnamese text display
    const currentWord = await page.getByTestId("current-word").textContent();
    expect(typeof currentWord).toBe("string");
  });

  test("AI generation error handling and retry", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("ai-generation-tab").click();

    // Test with invalid/problematic topic
    await page.getByTestId("ai-language-select").selectOption("en");
    await page.getByTestId("ai-topic-input").fill(""); // Empty topic
    await page.getByTestId("ai-target-words-input").fill("300");
    await page.getByTestId("generate-content-btn").click();

    // Should show validation error
    await expect(page.getByTestId("topic-error")).toContainText("required");

    // Test with out-of-range word count
    await page.getByTestId("ai-topic-input").fill("test topic");
    await page.getByTestId("ai-target-words-input").fill("50"); // Below minimum
    await page.getByTestId("generate-content-btn").click();

    await expect(page.getByTestId("word-count-error")).toContainText("minimum");

    // Test with valid inputs
    await page.getByTestId("ai-target-words-input").fill("200");
    await page.getByTestId("generate-content-btn").click();

    // Should proceed with generation
    await expect(page.getByTestId("generation-status")).toContainText(
      "Generating"
    );
  });

  test("AI generation rate limiting and quotas", async ({ page }) => {
    await page.goto("/");

    // Check initial quota display
    await page.getByTestId("ai-generation-tab").click();
    await expect(page.getByTestId("daily-quota-remaining")).toBeVisible();

    // Generate content and check quota decreases
    const initialQuota = await page
      .getByTestId("daily-quota-remaining")
      .textContent();

    await page.getByTestId("ai-language-select").selectOption("en");
    await page
      .getByTestId("ai-topic-input")
      .fill("test topic for quota testing");
    await page.getByTestId("ai-target-words-input").fill("150");
    await page.getByTestId("generate-content-btn").click();

    await expect(page.getByTestId("generation-status")).toContainText(
      "Complete",
      { timeout: 30000 }
    );

    // Quota should have decreased
    const newQuota = await page
      .getByTestId("daily-quota-remaining")
      .textContent();
    expect(newQuota).not.toBe(initialQuota);

    // Check quota warning if near limit
    if (newQuota && parseInt(newQuota) <= 2) {
      await expect(page.getByTestId("quota-warning")).toBeVisible();
    }
  });
});
