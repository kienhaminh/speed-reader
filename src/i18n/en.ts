export const en = {
  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    start: "Start",
    stop: "Stop",
    pause: "Pause",
    play: "Play",
    resume: "Resume",
  },

  // App
  app: {
    title: "Speed Reader",
    subtitle: "Enhance your reading speed and comprehension",
  },

  // Navigation
  nav: {
    content: "Content",
    reading: "Reading",
    analytics: "Analytics",
  },

  // Content Input
  content: {
    createTitle: "Create Reading Content",
    createDescription: "Paste your text or upload a document to start reading",
    pasteTab: "Paste/Upload Text",
    aiTab: "AI Generation",
    language: "Language",
    source: "Source",
    title: "Title (Optional)",
    titlePlaceholder: "Enter a title for your content",
    textContent: "Text Content",
    textPlaceholder: "Paste your text here...",
    createButton: "Create Content",
    creating: "Creating Content...",

    // AI Generation
    aiTitle: "AI Content Generation",
    aiDescription:
      "Generate reading content using AI based on your topic preferences",
    topic: "Topic",
    topicPlaceholder:
      "e.g., renewable energy, artificial intelligence, cooking",
    targetWords: "Target Words",
    generateButton: "Generate Content",
    generating: "Generating...",
    useGenerated: "Use This Content",

    // Sources
    sourcePaste: "Paste Text",
    sourceUpload: "Upload File",
    sourceAi: "AI Generated",
  },

  // Reading Session
  reading: {
    configTitle: "Reading Configuration",
    configDescription: "Configure your reading session settings",
    mode: "Reading Mode",
    modeWord: "Word-by-Word",
    modeChunk: "Chunk of Meaning",
    modeParagraph: "Paragraph Highlight",
    pace: "Pace (WPM)",
    chunkSize: "Chunk Size",
    startSession: "Start Reading Session",

    // Controls
    playing: "Playing",
    paused: "Paused",
    finishReading: "Finish Reading",
    currentMode: "Mode",
    currentPace: "Pace",
    wordsRead: "Words",
    currentWpm: "Current WPM",

    // Progress
    progress: "Progress",
    complete: "complete",
    wordsReadLabel: "Words Read",
    duration: "Duration (ms)",
    computedWpm: "Computed WPM",

    // Paragraph navigation
    previousParagraph: "Previous",
    nextParagraph: "Next",
    skipToEnd: "Skip to End",
    paragraphs: "paragraphs",
    paragraphsRead: "paragraphs read",
  },

  // Quiz
  quiz: {
    title: "Comprehension Quiz",
    description: "Answer the following questions based on what you just read",
    question: "Question",
    of: "of",
    nextQuestion: "Next Question",
    submitQuiz: "Submit Quiz",
    submitting: "Submitting...",

    // Results
    completed: "Quiz Completed",
    resultsDescription: "Here are your comprehension results",
    score: "Score",
    correct: "You got {{correct}} out of {{total}} questions correct",
    reviewTitle: "Question Review",
    yourAnswer: "Your answer:",
    correctAnswer: "Correct answer:",
    status: "Status",
    completed_status: "Completed",
    viewAnalytics: "View Analytics",
  },

  // Analytics
  analytics: {
    title: "Reading Analytics",
    description: "Track your reading progress and performance over time",

    // Filters
    timePeriod: "Time Period:",
    readingMode: "Reading Mode:",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    allModes: "All Modes",
    exportData: "Export Data",

    // Metrics
    totalSessions: "Total Sessions",
    readingTime: "Reading Time",
    avgComprehension: "Avg Comprehension",
    overallAvgWpm: "Overall Avg WPM",

    // Charts
    performanceByMode: "Performance by Reading Mode",
    avgWpmByMode: "Average words per minute for each reading mode",
    wpmTrend: "WPM Trend",
    wpmTrendDescription: "Reading speed progression over time",
    scoreTrend: "Comprehension Score Trend",
    scoreTrendDescription: "Quiz performance over time",
    modeComparison: "Mode Comparison",
    modeComparisonDescription:
      "Performance comparison across different reading modes",

    // Export
    exportTitle: "Export Data",
    exportDescription: "Download your reading analytics data",
    exportCsv: "Export as CSV",
    exportJson: "Export as JSON",

    // Empty state
    noDataTitle: "No Data Yet",
    noDataDescription:
      "Complete some reading sessions to see your analytics here.",
    startReading: "Start Reading",

    // Chart placeholder
    chartPlaceholder: "Chart visualization would be here",
    comparisonPlaceholder: "Comparison chart would be here",
  },

  // Errors
  errors: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    passwordTooShort: "Password must be at least 8 characters",
    passwordMismatch: "Passwords do not match",
    networkError: "Network error. Please try again.",
    unknownError: "An unknown error occurred",

    // Content errors
    contentRequired: "Content text is required",
    contentTooShort: "Content must contain at least one word",
    topicRequired: "Topic is required",
    invalidWordCount: "Word count must be between 100 and 2000",

    // Session errors
    sessionNotFound: "Session not found",
    contentNotFound: "Content not found",
    invalidChunkSize: "Chunk size must be between 2 and 8",
    sessionCompleted: "Session already completed",

    // Quiz errors
    questionsNotFound: "Questions not found for session",
    answerAllQuestions: "Please answer all questions before submitting",

    // Rate limiting
    rateLimitExceeded: "Rate limit exceeded. Please try again later.",
    dailyLimitExceeded: "Daily generation limit exceeded",
    aiServiceUnavailable: "AI service temporarily unavailable",
  },

  // Validation
  validation: {
    min: "Must be at least {{min}} characters",
    max: "Must be no more than {{max}} characters",
    range: "Must be between {{min}} and {{max}}",
    email: "Must be a valid email address",
    url: "Must be a valid URL",
    number: "Must be a valid number",
    integer: "Must be a whole number",
    positive: "Must be a positive number",
  },
} as const;
