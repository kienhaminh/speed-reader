import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  json,
  varchar,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const languageEnum = pgEnum("language", ["en", "vi"]);
export const sourceEnum = pgEnum("source", ["paste", "upload", "ai"]);
export const modeEnum = pgEnum("mode", ["word", "chunk", "paragraph"]);

// Tables
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "email_verifications_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const passwordResets = pgTable(
  "password_resets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "password_resets_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const readingContent = pgTable("reading_content", {
  id: text("id").primaryKey(),
  language: languageEnum("language").notNull(),
  source: sourceEnum("source").notNull(),
  title: text("title"),
  text: text("text").notNull(),
  wordCount: integer("word_count").notNull(),
  createdByUserId: text("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readingSessions = pgTable("reading_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  contentId: text("content_id").notNull(),
  mode: modeEnum("mode").notNull(),
  paceWpm: integer("pace_wpm").notNull(),
  chunkSize: integer("chunk_size"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationMs: integer("duration_ms").notNull(),
  wordsRead: integer("words_read").notNull(),
  computedWpm: integer("computed_wpm").notNull(),
});

export const comprehensionQuestions = pgTable("comprehension_questions", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  index: integer("index").notNull(),
  prompt: text("prompt").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
});

export const comprehensionResults = pgTable("comprehension_results", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  answers: json("answers").$type<number[]>().notNull(),
  scorePercent: integer("score_percent").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const studyLogs = pgTable("study_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  totalTimeMs: integer("total_time_ms").notNull(),
  averageWpmByMode: json("average_wpm_by_mode")
    .$type<Record<string, number>>()
    .notNull(),
  averageScorePercent: integer("average_score_percent").notNull(),
  sessionsCount: integer("sessions_count").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  readingContent: many(readingContent),
  readingSessions: many(readingSessions),
  sessions: many(sessions),
  emailVerifications: many(emailVerifications),
  passwordResets: many(passwordResets),
  studyLog: one(studyLogs, {
    fields: [users.id],
    references: [studyLogs.userId],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const emailVerificationsRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerifications.userId],
      references: [users.id],
    }),
  })
);

export const passwordResetsRelations = relations(
  passwordResets,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResets.userId],
      references: [users.id],
    }),
  })
);

export const readingContentRelations = relations(
  readingContent,
  ({ one, many }) => ({
    createdByUser: one(users, {
      fields: [readingContent.createdByUserId],
      references: [users.id],
    }),
    sessions: many(readingSessions),
  })
);

export const readingSessionsRelations = relations(
  readingSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [readingSessions.userId],
      references: [users.id],
    }),
    content: one(readingContent, {
      fields: [readingSessions.contentId],
      references: [readingContent.id],
    }),
    questions: many(comprehensionQuestions),
    result: one(comprehensionResults, {
      fields: [readingSessions.id],
      references: [comprehensionResults.sessionId],
    }),
  })
);

export const comprehensionQuestionsRelations = relations(
  comprehensionQuestions,
  ({ one }) => ({
    session: one(readingSessions, {
      fields: [comprehensionQuestions.sessionId],
      references: [readingSessions.id],
    }),
  })
);

export const comprehensionResultsRelations = relations(
  comprehensionResults,
  ({ one }) => ({
    session: one(readingSessions, {
      fields: [comprehensionResults.sessionId],
      references: [readingSessions.id],
    }),
  })
);

export const studyLogsRelations = relations(studyLogs, ({ one }) => ({
  user: one(users, {
    fields: [studyLogs.userId],
    references: [users.id],
  }),
}));
