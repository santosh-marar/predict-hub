ALTER TABLE "position" ADD COLUMN "side" text NOT NULL;--> statement-breakpoint
ALTER TABLE "position" ADD COLUMN "shares" numeric(15, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "position" ADD COLUMN "average_price" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "position" DROP COLUMN "yes_shares";--> statement-breakpoint
ALTER TABLE "position" DROP COLUMN "no_shares";--> statement-breakpoint
ALTER TABLE "position" DROP COLUMN "average_yes_price";--> statement-breakpoint
ALTER TABLE "position" DROP COLUMN "average_no_price";