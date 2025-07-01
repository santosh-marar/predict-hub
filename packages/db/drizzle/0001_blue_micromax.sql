ALTER TABLE "event" ALTER COLUMN "total_volume" SET DEFAULT '10000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_yes_shares" SET DEFAULT '5000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_no_shares" SET DEFAULT '5000';--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "maker_order_id" DROP NOT NULL;