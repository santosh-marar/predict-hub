ALTER TABLE "event" ALTER COLUMN "total_volume" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_volume" SET DEFAULT '10000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_yes_shares" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_yes_shares" SET DEFAULT '5000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_no_shares" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_no_shares" SET DEFAULT '5000';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "limit_price" SET DATA TYPE numeric(15, 5);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "average_fill_price" SET DATA TYPE numeric(15, 5);