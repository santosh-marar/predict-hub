ALTER TABLE "position" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "trade" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "side" text NOT NULL;