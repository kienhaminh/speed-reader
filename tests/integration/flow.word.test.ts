import { test, expect } from "@playwright/test";

test.describe("Word-by-word reading mode flow", () => {
  test("complete word-by-word reading session with quiz", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Step 1: Paste text content
    const testText =
      "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet. It is commonly used for testing fonts and keyboard layouts.";

    await page.getByTestId("content-input").fill(testText);
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    // Verify content creation
    await expect(page.getByTestId("content-created")).toBeVisible();
    await expect(page.getByTestId("word-count")).toContainText("22"); // Approximate word count

    // Step 2: Configure reading session
    await page.getByTestId("mode-select").selectOption("word");
    await page.getByTestId("pace-wpm-input").fill("300");
    await page.getByTestId("start-session-btn").click();

    // Verify session started
    await expect(page.getByTestId("reader-container")).toBeVisible();
    await expect(page.getByTestId("current-mode")).toContainText("word");
    await expect(page.getByTestId("current-pace")).toContainText("300");

    // Step 3: Start reading (word-by-word display)
    await page.getByTestId("play-btn").click();

    // Verify reading is active
    await expect(page.getByTestId("reading-status")).toContainText("Playing");
    await expect(page.getByTestId("current-word")).toBeVisible();

    // Wait for some words to be displayed
    await page.waitForTimeout(2000);

    // Pause reading
    await page.getByTestId("pause-btn").click();
    await expect(page.getByTestId("reading-status")).toContainText("Paused");

    // Resume and finish reading
    await page.getByTestId("play-btn").click();

    // Wait for reading to complete (or manually finish)
    await page.getByTestId("finish-reading-btn").click();

    // Step 4: Verify metrics calculation
    await expect(page.getByTestId("session-complete")).toBeVisible();
    await expect(page.getByTestId("words-read")).toContainText(/\d+/);
    await expect(page.getByTestId("duration-ms")).toContainText(/\d+/);
    await expect(page.getByTestId("computed-wpm")).toContainText(/\d+/);

    // Step 5: Take comprehension quiz
    await page.getByTestId("start-quiz-btn").click();

    // Verify quiz interface
    await expect(page.getByTestId("quiz-container")).toBeVisible();
    await expect(page.getByTestId("question-1")).toBeVisible();

    // Answer all 5 questions
    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-0`).check();
      if (i < 5) {
        await page.getByTestId("next-question-btn").click();
      }
    }

    // Submit quiz
    await page.getByTestId("submit-quiz-btn").click();

    // Step 6: Verify quiz results
    await expect(page.getByTestId("quiz-results")).toBeVisible();
    await expect(page.getByTestId("score-percent")).toContainText(/%/);
    await expect(page.getByTestId("correct-answers")).toBeVisible();

    // Verify session is marked as complete
    await expect(page.getByTestId("session-status")).toContainText("Completed");
  });

  test("adjust reading speed during session", async ({ page }) => {
    await page.goto("/");

    // Create content and start session
    await page
      .getByTestId("content-input")
      .fill("Short test content for speed testing.");
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("word");
    await page.getByTestId("pace-wpm-input").fill("200");
    await page.getByTestId("start-session-btn").click();

    // Start reading
    await page.getByTestId("play-btn").click();

    // Adjust speed during reading
    await page.getByTestId("speed-increase-btn").click();
    await expect(page.getByTestId("current-pace")).toContainText("250"); // +50 WPM

    await page.getByTestId("speed-decrease-btn").click();
    await expect(page.getByTestId("current-pace")).toContainText("200"); // Back to original

    // Finish reading
    await page.getByTestId("finish-reading-btn").click();
    await expect(page.getByTestId("session-complete")).toBeVisible();
  });

  test("pause and resume reading session", async ({ page }) => {
    await page.goto("/");

    // Setup session
    await page
      .getByTestId("content-input")
      .fill("Test content for pause and resume functionality testing.");
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("word");
    await page.getByTestId("pace-wpm-input").fill("300");
    await page.getByTestId("start-session-btn").click();

    // Test pause/resume cycle
    await page.getByTestId("play-btn").click();
    await expect(page.getByTestId("reading-status")).toContainText("Playing");

    await page.waitForTimeout(1000);
    await page.getByTestId("pause-btn").click();
    await expect(page.getByTestId("reading-status")).toContainText("Paused");

    await page.getByTestId("play-btn").click();
    await expect(page.getByTestId("reading-status")).toContainText("Playing");

    // Verify reading continues from where it paused
    await expect(page.getByTestId("current-word")).toBeVisible();
  });
});
