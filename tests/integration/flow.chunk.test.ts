import { test, expect } from "@playwright/test";

test.describe("Chunk-of-meaning reading mode flow", () => {
  test("complete chunk reading session with chunk size control", async ({
    page,
  }) => {
    await page.goto("/");

    // Step 1: Create content
    const testText =
      "Artificial intelligence is transforming modern technology. Machine learning algorithms process vast amounts of data to identify patterns and make predictions. Deep learning neural networks mimic human brain functions to solve complex problems.";

    await page.getByTestId("content-input").fill(testText);
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    // Step 2: Configure chunk mode session
    await page.getByTestId("mode-select").selectOption("chunk");
    await page.getByTestId("pace-wpm-input").fill("250");
    await page.getByTestId("chunk-size-input").fill("3"); // 3 words per chunk
    await page.getByTestId("start-session-btn").click();

    // Verify chunk mode configuration
    await expect(page.getByTestId("reader-container")).toBeVisible();
    await expect(page.getByTestId("current-mode")).toContainText("chunk");
    await expect(page.getByTestId("current-chunk-size")).toContainText("3");

    // Step 3: Start chunk reading
    await page.getByTestId("play-btn").click();

    // Verify chunk display
    await expect(page.getByTestId("reading-status")).toContainText("Playing");
    await expect(page.getByTestId("current-chunk")).toBeVisible();

    // Verify chunk contains expected number of words
    const chunkText = await page.getByTestId("current-chunk").textContent();
    const wordCount = chunkText?.split(/\s+/).length || 0;
    expect(wordCount).toBeLessThanOrEqual(3);

    // Let some chunks display
    await page.waitForTimeout(3000);

    // Step 4: Adjust chunk size during reading
    await page.getByTestId("pause-btn").click();
    await page.getByTestId("chunk-size-increase-btn").click();
    await expect(page.getByTestId("current-chunk-size")).toContainText("4");

    await page.getByTestId("play-btn").click();

    // Verify new chunk size takes effect
    await page.waitForTimeout(1000);
    const newChunkText = await page.getByTestId("current-chunk").textContent();
    const newWordCount = newChunkText?.split(/\s+/).length || 0;
    expect(newWordCount).toBeLessThanOrEqual(4);

    // Step 5: Complete reading
    await page.getByTestId("finish-reading-btn").click();
    await expect(page.getByTestId("session-complete")).toBeVisible();

    // Step 6: Take quiz
    await page.getByTestId("start-quiz-btn").click();

    // Answer questions quickly
    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-1`).check();
      if (i < 5) {
        await page.getByTestId("next-question-btn").click();
      }
    }

    await page.getByTestId("submit-quiz-btn").click();
    await expect(page.getByTestId("quiz-results")).toBeVisible();
  });

  test("chunk size validation and boundaries", async ({ page }) => {
    await page.goto("/");

    // Create content
    await page
      .getByTestId("content-input")
      .fill("Test content for chunk size validation and boundary testing.");
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    // Test chunk size validation
    await page.getByTestId("mode-select").selectOption("chunk");
    await page.getByTestId("pace-wpm-input").fill("250");

    // Test minimum chunk size (2)
    await page.getByTestId("chunk-size-input").fill("1");
    await expect(page.getByTestId("chunk-size-error")).toContainText("minimum");

    // Test maximum chunk size (8)
    await page.getByTestId("chunk-size-input").fill("10");
    await expect(page.getByTestId("chunk-size-error")).toContainText("maximum");

    // Test valid chunk size
    await page.getByTestId("chunk-size-input").fill("5");
    await expect(page.getByTestId("chunk-size-error")).not.toBeVisible();

    await page.getByTestId("start-session-btn").click();
    await expect(page.getByTestId("current-chunk-size")).toContainText("5");
  });

  test("chunk reading with different languages", async ({ page }) => {
    await page.goto("/");

    // Test with Vietnamese content
    const vietnameseText =
      "Trí tuệ nhân tạo đang thay đổi công nghệ hiện đại. Các thuật toán học máy xử lý lượng dữ liệu khổng lồ để nhận diện mẫu và đưa ra dự đoán.";

    await page.getByTestId("content-input").fill(vietnameseText);
    await page.getByTestId("language-select").selectOption("vi");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("chunk");
    await page.getByTestId("pace-wpm-input").fill("200");
    await page.getByTestId("chunk-size-input").fill("4");
    await page.getByTestId("start-session-btn").click();

    // Verify reading works with Vietnamese text
    await page.getByTestId("play-btn").click();
    await expect(page.getByTestId("current-chunk")).toBeVisible();

    // Check that Vietnamese text is displayed correctly
    const chunkContent = await page.getByTestId("current-chunk").textContent();
    expect(chunkContent).toMatch(
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/
    );
  });
});
