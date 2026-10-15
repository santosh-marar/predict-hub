DO $$ BEGIN
	CREATE TYPE "outbox_status" AS ENUM('pending', 'published', 'failed');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"key" text,
	"dedupe_key" text,
	"payload" jsonb NOT NULL,
	"status" "outbox_status" DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "outbox_status_idx" ON "outbox_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "outbox_created_at_idx" ON "outbox_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_dedupe_idx" ON "outbox_events" USING btree ("topic","key","dedupe_key");