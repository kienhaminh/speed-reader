CREATE TYPE "public"."language" AS ENUM('en', 'vi');--> statement-breakpoint
CREATE TYPE "public"."mode" AS ENUM('word', 'chunk', 'paragraph');--> statement-breakpoint
CREATE TYPE "public"."source" AS ENUM('paste', 'upload', 'ai');--> statement-breakpoint
CREATE TABLE "comprehension_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"index" integer NOT NULL,
	"prompt" text NOT NULL,
	"options" json NOT NULL,
	"correct_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comprehension_results" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"answers" json NOT NULL,
	"score_percent" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_content" (
	"id" text PRIMARY KEY NOT NULL,
	"language" "language" NOT NULL,
	"source" "source" NOT NULL,
	"title" text,
	"text" text NOT NULL,
	"word_count" integer NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"mode" "mode" NOT NULL,
	"pace_wpm" integer NOT NULL,
	"chunk_size" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration_ms" integer NOT NULL,
	"words_read" integer NOT NULL,
	"computed_wpm" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_time_ms" integer NOT NULL,
	"average_wpm_by_mode" json NOT NULL,
	"average_score_percent" integer NOT NULL,
	"sessions_count" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
