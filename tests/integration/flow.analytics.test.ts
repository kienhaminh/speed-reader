import { test, expect } from "@playwright/test";

test.describe("Analytics summary across sessions", () => {
  test("analytics accumulate across multiple reading sessions", async ({
    page,
  }) => {
    await page.goto("/");

    // Check initial empty analytics
    await page.getByTestId("analytics-tab").click();
    await expect(page.getByTestId("total-time")).toContainText("0");
    await expect(page.getByTestId("sessions-count")).toContainText("0");
    await expect(page.getByTestId("average-score")).toContainText("0");

    // Session 1: Word mode
    await page.getByTestId("reading-tab").click();
    await page
      .getByTestId("content-input")
      .fill(
        "First session content for analytics testing with sufficient length for meaningful metrics."
      );
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("word");
    await page.getByTestId("pace-wpm-input").fill("300");
    await page.getByTestId("start-session-btn").click();

    await page.getByTestId("play-btn").click();
    await page.waitForTimeout(3000);
    await page.getByTestId("finish-reading-btn").click();

    // Complete quiz for session 1
    await page.getByTestId("start-quiz-btn").click();
    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-0`).check(); // All correct
      if (i < 5) await page.getByTestId("next-question-btn").click();
    }
    await page.getByTestId("submit-quiz-btn").click();

    // Check analytics after session 1
    await page.getByTestId("analytics-tab").click();
    await expect(page.getByTestId("sessions-count")).toContainText("1");
    await expect(page.getByTestId("total-time")).not.toContainText("0");
    await expect(page.getByTestId("word-mode-avg-wpm")).toBeVisible();

    // Session 2: Chunk mode
    await page.getByTestId("reading-tab").click();
    await page
      .getByTestId("content-input")
      .fill(
        "Second session content using chunk mode for comprehensive analytics data collection and verification."
      );
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("chunk");
    await page.getByTestId("pace-wpm-input").fill("250");
    await page.getByTestId("chunk-size-input").fill("3");
    await page.getByTestId("start-session-btn").click();

    await page.getByTestId("play-btn").click();
    await page.waitForTimeout(4000);
    await page.getByTestId("finish-reading-btn").click();

    // Complete quiz for session 2 (partial correct)
    await page.getByTestId("start-quiz-btn").click();
    for (let i = 1; i <= 5; i++) {
      const option = i <= 3 ? 0 : 1; // 3 correct, 2 incorrect
      await page.getByTestId(`question-${i}-option-${option}`).check();
      if (i < 5) await page.getByTestId("next-question-btn").click();
    }
    await page.getByTestId("submit-quiz-btn").click();

    // Session 3: Paragraph mode
    await page.getByTestId("reading-tab").click();
    await page
      .getByTestId("content-input")
      .fill(
        "Third session content for paragraph mode testing. This will provide data for comprehensive analytics across all reading modes.\n\nSecond paragraph continues the content to ensure proper paragraph mode functionality and metrics calculation."
      );
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("paragraph");
    await page.getByTestId("pace-wpm-input").fill("200");
    await page.getByTestId("start-session-btn").click();

    await page.getByTestId("next-paragraph-btn").click();
    await page.getByTestId("next-paragraph-btn").click();
    await page.getByTestId("finish-reading-btn").click();

    // Complete quiz for session 3 (all incorrect)
    await page.getByTestId("start-quiz-btn").click();
    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-3`).check(); // All incorrect
      if (i < 5) await page.getByTestId("next-question-btn").click();
    }
    await page.getByTestId("submit-quiz-btn").click();

    // Verify comprehensive analytics
    await page.getByTestId("analytics-tab").click();

    // Check session count
    await expect(page.getByTestId("sessions-count")).toContainText("3");

    // Check total time accumulation
    await expect(page.getByTestId("total-time")).not.toContainText("0");
    const totalTimeText = await page.getByTestId("total-time").textContent();
    expect(parseInt(totalTimeText || "0")).toBeGreaterThan(7000); // Should be > 7 seconds

    // Check mode-specific WPM averages
    await expect(page.getByTestId("word-mode-avg-wpm")).toBeVisible();
    await expect(page.getByTestId("chunk-mode-avg-wpm")).toBeVisible();
    await expect(page.getByTestId("paragraph-mode-avg-wpm")).toBeVisible();

    // Check overall average score (should be around 60% = (100 + 60 + 0) / 3)
    const avgScoreText = await page.getByTestId("average-score").textContent();
    const avgScore = parseInt(avgScoreText || "0");
    expect(avgScore).toBeGreaterThan(40);
    expect(avgScore).toBeLessThan(80);
  });

  test("analytics filtering and time period views", async ({ page }) => {
    await page.goto("/");

    // Create a few sessions first
    for (let i = 1; i <= 3; i++) {
      await page.getByTestId("reading-tab").click();
      await page
        .getByTestId("content-input")
        .fill(`Session ${i} content for time period analytics testing.`);
      await page.getByTestId("language-select").selectOption("en");
      await page.getByTestId("source-paste").check();
      await page.getByTestId("create-content-btn").click();

      await page.getByTestId("mode-select").selectOption("word");
      await page.getByTestId("pace-wpm-input").fill("300");
      await page.getByTestId("start-session-btn").click();

      await page.getByTestId("play-btn").click();
      await page.waitForTimeout(2000);
      await page.getByTestId("finish-reading-btn").click();

      // Quick quiz completion
      await page.getByTestId("start-quiz-btn").click();
      for (let q = 1; q <= 5; q++) {
        await page.getByTestId(`question-${q}-option-0`).check();
        if (q < 5) await page.getByTestId("next-question-btn").click();
      }
      await page.getByTestId("submit-quiz-btn").click();
    }

    // Check analytics with filters
    await page.getByTestId("analytics-tab").click();

    // Test today filter
    await page.getByTestId("time-filter-select").selectOption("today");
    await expect(page.getByTestId("sessions-count")).toContainText("3");

    // Test this week filter
    await page.getByTestId("time-filter-select").selectOption("week");
    await expect(page.getByTestId("sessions-count")).toContainText("3");

    // Test mode filter
    await page.getByTestId("mode-filter-select").selectOption("word");
    await expect(page.getByTestId("filtered-sessions-count")).toContainText(
      "3"
    );

    // Test combined filters
    await page.getByTestId("mode-filter-select").selectOption("chunk");
    await expect(page.getByTestId("filtered-sessions-count")).toContainText(
      "0"
    );
  });

  test("analytics data persistence across browser sessions", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    // Create a session
    await page
      .getByTestId("content-input")
      .fill("Persistence test content for analytics verification.");
    await page.getByTestId("language-select").selectOption("en");
    await page.getByTestId("source-paste").check();
    await page.getByTestId("create-content-btn").click();

    await page.getByTestId("mode-select").selectOption("word");
    await page.getByTestId("pace-wpm-input").fill("250");
    await page.getByTestId("start-session-btn").click();

    await page.getByTestId("play-btn").click();
    await page.waitForTimeout(2000);
    await page.getByTestId("finish-reading-btn").click();

    await page.getByTestId("start-quiz-btn").click();
    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`question-${i}-option-1`).check();
      if (i < 5) await page.getByTestId("next-question-btn").click();
    }
    await page.getByTestId("submit-quiz-btn").click();

    // Check analytics
    await page.getByTestId("analytics-tab").click();
    const initialCount = await page.getByTestId("sessions-count").textContent();

    // Simulate browser restart by creating new page
    const newPage = await context.newPage();
    await newPage.goto("/");
    await newPage.getByTestId("analytics-tab").click();

    // Data should persist
    await expect(newPage.getByTestId("sessions-count")).toContainText(
      initialCount || "1"
    );
    await expect(newPage.getByTestId("total-time")).not.toContainText("0");
  });

  test("analytics export and data visualization", async ({ page }) => {
    await page.goto("/");

    // Create multiple sessions for rich analytics
    const modes = ["word", "chunk", "paragraph"];
    for (const mode of modes) {
      await page
        .getByTestId("content-input")
        .fill(`Content for ${mode} mode analytics visualization testing.`);
      await page.getByTestId("language-select").selectOption("en");
      await page.getByTestId("source-paste").check();
      await page.getByTestId("create-content-btn").click();

      await page.getByTestId("mode-select").selectOption(mode);
      await page.getByTestId("pace-wpm-input").fill("280");
      if (mode === "chunk") {
        await page.getByTestId("chunk-size-input").fill("4");
      }
      await page.getByTestId("start-session-btn").click();

      await page.getByTestId("play-btn").click();
      await page.waitForTimeout(3000);
      await page.getByTestId("finish-reading-btn").click();

      // Complete quiz
      await page.getByTestId("start-quiz-btn").click();
      for (let i = 1; i <= 5; i++) {
        await page.getByTestId(`question-${i}-option-${i % 4}`).check();
        if (i < 5) await page.getByTestId("next-question-btn").click();
      }
      await page.getByTestId("submit-quiz-btn").click();
    }

    // Check analytics visualizations
    await page.getByTestId("analytics-tab").click();

    // Verify charts are displayed
    await expect(page.getByTestId("wpm-trend-chart")).toBeVisible();
    await expect(page.getByTestId("score-trend-chart")).toBeVisible();
    await expect(page.getByTestId("mode-comparison-chart")).toBeVisible();

    // Test export functionality
    await page.getByTestId("export-data-btn").click();

    // Verify export options
    await expect(page.getByTestId("export-csv-btn")).toBeVisible();
    await expect(page.getByTestId("export-json-btn")).toBeVisible();

    // Test CSV export
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-csv-btn").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /speed-reader-analytics.*\.csv/
    );
  });
});
