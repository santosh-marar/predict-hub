CREATE TYPE "public"."outbox_status" AS ENUM('pending', 'published', 'failed');--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "icon" text;