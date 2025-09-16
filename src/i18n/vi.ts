export const vi = {
  // Common
  common: {
    loading: "Đang tải...",
    error: "Lỗi",
    success: "Thành công",
    save: "Lưu",
    cancel: "Hủy",
    submit: "Gửi",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    close: "Đóng",
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước đó",
    finish: "Hoàn thành",
    start: "Bắt đầu",
    stop: "Dừng",
    pause: "Tạm dừng",
    play: "Phát",
    resume: "Tiếp tục",
  },

  // App
  app: {
    title: "Đọc Nhanh",
    subtitle: "Nâng cao tốc độ đọc và khả năng hiểu của bạn",
  },

  // Navigation
  nav: {
    content: "Nội dung",
    reading: "Đọc",
    analytics: "Phân tích",
  },

  // Content Input
  content: {
    createTitle: "Tạo Nội dung Đọc",
    createDescription: "Dán văn bản hoặc tải tài liệu lên để bắt đầu đọc",
    pasteTab: "Dán/Tải văn bản",
    aiTab: "Tạo bằng AI",
    language: "Ngôn ngữ",
    source: "Nguồn",
    title: "Tiêu đề (Tùy chọn)",
    titlePlaceholder: "Nhập tiêu đề cho nội dung của bạn",
    textContent: "Nội dung văn bản",
    textPlaceholder: "Dán văn bản của bạn vào đây...",
    createButton: "Tạo Nội dung",
    creating: "Đang tạo nội dung...",

    // AI Generation
    aiTitle: "Tạo Nội dung bằng AI",
    aiDescription: "Tạo nội dung đọc bằng AI dựa trên chủ đề bạn yêu thích",
    topic: "Chủ đề",
    topicPlaceholder: "ví dụ: năng lượng tái tạo, trí tuệ nhân tạo, nấu ăn",
    targetWords: "Số từ mục tiêu",
    generateButton: "Tạo Nội dung",
    generating: "Đang tạo...",
    useGenerated: "Sử dụng Nội dung này",

    // Sources
    sourcePaste: "Dán văn bản",
    sourceUpload: "Tải tệp lên",
    sourceAi: "Tạo bằng AI",
  },

  // Reading Session
  reading: {
    configTitle: "Cấu hình Đọc",
    configDescription: "Cấu hình cài đặt phiên đọc của bạn",
    mode: "Chế độ đọc",
    modeWord: "Từng từ",
    modeChunk: "Nhóm từ có nghĩa",
    modeParagraph: "Đánh dấu đoạn văn",
    pace: "Tốc độ (Từ/phút)",
    chunkSize: "Kích thước nhóm",
    startSession: "Bắt đầu Phiên đọc",

    // Controls
    playing: "Đang phát",
    paused: "Tạm dừng",
    finishReading: "Hoàn thành đọc",
    currentMode: "Chế độ",
    currentPace: "Tốc độ",
    wordsRead: "Từ đã đọc",
    currentWpm: "Tốc độ hiện tại",

    // Progress
    progress: "Tiến độ",
    complete: "hoàn thành",
    wordsReadLabel: "Số từ đã đọc",
    duration: "Thời gian (ms)",
    computedWpm: "Tốc độ tính toán",

    // Paragraph navigation
    previousParagraph: "Trước",
    nextParagraph: "Tiếp",
    skipToEnd: "Chuyển đến cuối",
    paragraphs: "đoạn văn",
    paragraphsRead: "đoạn văn đã đọc",
  },

  // Quiz
  quiz: {
    title: "Bài kiểm tra Hiểu bài",
    description: "Trả lời các câu hỏi sau dựa trên những gì bạn vừa đọc",
    question: "Câu hỏi",
    of: "của",
    nextQuestion: "Câu hỏi tiếp theo",
    submitQuiz: "Nộp bài",
    submitting: "Đang nộp...",

    // Results
    completed: "Hoàn thành bài kiểm tra",
    resultsDescription: "Đây là kết quả hiểu bài của bạn",
    score: "Điểm",
    correct: "Bạn đã trả lời đúng {{correct}} trên {{total}} câu hỏi",
    reviewTitle: "Xem lại câu hỏi",
    yourAnswer: "Câu trả lời của bạn:",
    correctAnswer: "Câu trả lời đúng:",
    status: "Trạng thái",
    completed_status: "Đã hoàn thành",
    viewAnalytics: "Xem phân tích",
  },

  // Analytics
  analytics: {
    title: "Phân tích Đọc",
    description: "Theo dõi tiến độ đọc và hiệu suất của bạn theo thời gian",

    // Filters
    timePeriod: "Khoảng thời gian:",
    readingMode: "Chế độ đọc:",
    today: "Hôm nay",
    thisWeek: "Tuần này",
    thisMonth: "Tháng này",
    allTime: "Tất cả",
    allModes: "Tất cả chế độ",
    exportData: "Xuất dữ liệu",

    // Metrics
    totalSessions: "Tổng phiên",
    readingTime: "Thời gian đọc",
    avgComprehension: "Hiểu bài TB",
    overallAvgWpm: "Tốc độ TB tổng",

    // Charts
    performanceByMode: "Hiệu suất theo chế độ đọc",
    avgWpmByMode: "Tốc độ từ trung bình mỗi phút cho từng chế độ đọc",
    wpmTrend: "xu hướng tốc độ",
    wpmTrendDescription: "Tiến triển tốc độ đọc theo thời gian",
    scoreTrend: "Xu hướng điểm hiểu bài",
    scoreTrendDescription: "Hiệu suất bài kiểm tra theo thời gian",
    modeComparison: "So sánh chế độ",
    modeComparisonDescription:
      "So sánh hiệu suất giữa các chế độ đọc khác nhau",

    // Export
    exportTitle: "Xuất dữ liệu",
    exportDescription: "Tải xuống dữ liệu phân tích đọc của bạn",
    exportCsv: "Xuất dưới dạng CSV",
    exportJson: "Xuất dưới dạng JSON",

    // Empty state
    noDataTitle: "Chưa có dữ liệu",
    noDataDescription:
      "Hoàn thành một số phiên đọc để xem phân tích của bạn tại đây.",
    startReading: "Bắt đầu đọc",

    // Chart placeholder
    chartPlaceholder: "Biểu đồ trực quan sẽ hiển thị ở đây",
    comparisonPlaceholder: "Biểu đồ so sánh sẽ hiển thị ở đây",
  },

  // Errors
  errors: {
    required: "Trường này là bắt buộc",
    invalidEmail: "Vui lòng nhập email hợp lệ",
    passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự",
    passwordMismatch: "Mật khẩu không khớp",
    networkError: "Lỗi mạng. Vui lòng thử lại.",
    unknownError: "Đã xảy ra lỗi không xác định",

    // Content errors
    contentRequired: "Nội dung văn bản là bắt buộc",
    contentTooShort: "Nội dung phải chứa ít nhất một từ",
    topicRequired: "Chủ đề là bắt buộc",
    invalidWordCount: "Số từ phải từ 100 đến 2000",

    // Session errors
    sessionNotFound: "Không tìm thấy phiên",
    contentNotFound: "Không tìm thấy nội dung",
    invalidChunkSize: "Kích thước nhóm phải từ 2 đến 8",
    sessionCompleted: "Phiên đã hoàn thành",

    // Quiz errors
    questionsNotFound: "Không tìm thấy câu hỏi cho phiên này",
    answerAllQuestions: "Vui lòng trả lời tất cả câu hỏi trước khi nộp",

    // Rate limiting
    rateLimitExceeded: "Vượt quá giới hạn tốc độ. Vui lòng thử lại sau.",
    dailyLimitExceeded: "Vượt quá giới hạn tạo hàng ngày",
    aiServiceUnavailable: "Dịch vụ AI tạm thời không khả dụng",
  },

  // Validation
  validation: {
    min: "Phải có ít nhất {{min}} ký tự",
    max: "Không được quá {{max}} ký tự",
    range: "Phải từ {{min}} đến {{max}}",
    email: "Phải là địa chỉ email hợp lệ",
    url: "Phải là URL hợp lệ",
    number: "Phải là số hợp lệ",
    integer: "Phải là số nguyên",
    positive: "Phải là số dương",
  },
} as const;
