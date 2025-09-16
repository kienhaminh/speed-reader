import { test, expect } from "@playwright/test";

test.describe("Paragraph highlight reading mode flow", () => {
  test("complete paragraph reading with progressive highlighting", async ({
    page,
  }) => {
    await page.goto("/");

    // Step 1: Create multi-paragraph content
    const testText = `The evolution of artificial intelligence has been remarkable over the past decade. Machine learning algorithms have become increasingly sophisticated, enabling computers to perform tasks that were once thought to be exclusively human.

Natural language processing has advanced significantly, allowing AI systems to understand and generate human-like text. This breakthrough has led to the development of chatbots, translation services, and content generation tools.

Computer vision technologies have also made tremendous progress. Modern AI can now recognize objects, faces, and even emotions in images and videos with remarkable accuracy. These capabilities are being applied in various fields, from medical diagnosis to autonomous vehicles.

The future of AI holds even more promise, with researchers working on artificial general intelligence and quantum computing applications. As these technologies continue to evolve, they will undoubtedly reshape how we live and work.`;

    await page.getByTestId("content-input").fill(testText);
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    // Step 2: Configure paragraph mode session
    await page.getByTestId("mode-select").selectOption("paragraph");
    await page.getByTestId("pace-wpm-input").fill("280");
    await page.getByTestId("start-session-btn").click();

    // Verify paragraph mode setup
    await expect(page.getByTestId("reader-container")).toBeVisible();
    await expect(page.getByTestId("current-mode")).toContainText("paragraph");
    await expect(page.getByTestId("paragraph-count")).toContainText("4"); // Should detect 4 paragraphs

    // Step 3: Start paragraph reading
    await page.getByTestId("play-btn").click();

    // Verify paragraph display and highlighting
    await expect(page.getByTestId("reading-status")).toContainText("Playing");
    await expect(page.getByTestId("paragraph-container")).toBeVisible();

    // Check that first paragraph is highlighted
    await expect(page.getByTestId("paragraph-0")).toHaveClass(/highlighted/);
    await expect(page.getByTestId("paragraph-1")).not.toHaveClass(
      /highlighted/
    );

    // Wait for progression to next paragraph
    await page.waitForTimeout(8000); // Allow time for first paragraph

    // Check progression highlighting
    await expect(page.getByTestId("paragraph-1")).toHaveClass(/highlighted/);
    await expect(page.getByTestId("paragraph-0")).toHaveClass(/completed/);

    // Step 4: Manual navigation between paragraphs
    await page.getByTestId("pause-btn").click();

    // Test next paragraph button
    await page.getByTestId("next-paragraph-btn").click();
    await expect(page.getByTestId("paragraph-2")).toHaveClass(/highlighted/);

    // Test previous paragraph button
    await page.getByTestId("prev-paragraph-btn").click();
    await expect(page.getByTestId("paragraph-1")).toHaveClass(/highlighted/);

    // Resume reading
    await page.getByTestId("play-btn").click();

    // Step 5: Complete reading all paragraphs
    await page.getByTestId("skip-to-end-btn").click(); // Fast-forward to completion

    await expect(page.getByTestId("session-complete")).toBeVisible();
    await expect(page.getByTestId("paragraphs-read")).toContainText("4");

    // Step 6: Quiz and results
    await page.getByTestId("start-quiz-btn").click();

    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-2`).check();
      if (i < 5) {
        await page.getByTestId("next-question-btn").click();
      }
    }

    await page.getByTestId("submit-quiz-btn").click();
    await expect(page.getByTestId("quiz-results")).toBeVisible();
  });

  test("paragraph reading with custom pace and navigation", async ({
    page,
  }) => {
    await page.goto("/");

    const testText = `First paragraph for testing navigation. This should be highlighted first when reading begins.

Second paragraph continues the flow. Users should be able to navigate between paragraphs manually.

Third and final paragraph completes the test content. Navigation controls should work in both directions.`;

    await page.getByTestId("content-input").fill(testText);
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("paragraph");
    await page.getByTestId("pace-wpm-input").fill("150"); // Slower pace
    await page.getByTestId("start-session-btn").click();

    // Test manual navigation without auto-play
    await expect(page.getByTestId("paragraph-0")).toHaveClass(/highlighted/);

    // Navigate manually through paragraphs
    await page.getByTestId("next-paragraph-btn").click();
    await expect(page.getByTestId("paragraph-1")).toHaveClass(/highlighted/);

    await page.getByTestId("next-paragraph-btn").click();
    await expect(page.getByTestId("paragraph-2")).toHaveClass(/highlighted/);

    // Navigate backward
    await page.getByTestId("prev-paragraph-btn").click();
    await expect(page.getByTestId("paragraph-1")).toHaveClass(/highlighted/);

    // Complete session
    await page.getByTestId("finish-reading-btn").click();
    await expect(page.getByTestId("session-complete")).toBeVisible();
  });

  test("paragraph mode progress tracking", async ({ page }) => {
    await page.goto("/");

    const testText = `Paragraph one sets up the content for progress tracking testing.

Paragraph two continues with more substantial content to test progress calculations.

Paragraph three provides additional content for comprehensive progress measurement.

Paragraph four concludes the test with final content for progress verification.`;

    await page.getByTestId("content-input").fill(testText);
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("paragraph");
    await page.getByTestId("pace-wpm-input").fill("200");
    await page.getByTestId("start-session-btn").click();

    // Check initial progress
    await expect(page.getByTestId("reading-progress")).toContainText("0%");
    await expect(page.getByTestId("paragraph-progress")).toContainText(
      "1 of 4"
    );

    // Progress through paragraphs and check progress updates
    await page.getByTestId("next-paragraph-btn").click();
    await expect(page.getByTestId("reading-progress")).toContainText("25%");
    await expect(page.getByTestId("paragraph-progress")).toContainText(
      "2 of 4"
    );

    await page.getByTestId("next-paragraph-btn").click();
    await expect(page.getByTestId("reading-progress")).toContainText("50%");

    await page.getByTestId("next-paragraph-btn").click();
    await expect(page.getByTestId("reading-progress")).toContainText("75%");

    // Finish and check 100% completion
    await page.getByTestId("finish-reading-btn").click();
    await expect(page.getByTestId("reading-progress")).toContainText("100%");
  });
});
