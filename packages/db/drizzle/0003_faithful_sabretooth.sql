ALTER TABLE "amm_pool" ALTER COLUMN "yes_reserve" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "yes_reserve" SET DEFAULT '1000';--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "no_reserve" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "no_reserve" SET DEFAULT '1000';--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "total_liquidity" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "total_liquidity" SET DEFAULT '2000';--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "fee_rate" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "amm_pool" ALTER COLUMN "fee_rate" SET DEFAULT '0.003';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_volume" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_volume" SET DEFAULT '10000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_yes_shares" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_yes_shares" SET DEFAULT '5000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_no_shares" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "total_no_shares" SET DEFAULT '5000';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "last_yes_price" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "last_yes_price" SET DEFAULT '5';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "last_no_price" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "last_no_price" SET DEFAULT '5';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "original_quantity" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "remaining_quantity" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "filled_quantity" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "filled_quantity" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "limit_price" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "average_fill_price" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "total_amount" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "fees" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "fees" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "shares" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "shares" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "total_invested" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "total_invested" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "average_price" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "realized_pnl" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "realized_pnl" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "unrealized_pnl" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "position" ALTER COLUMN "unrealized_pnl" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "quantity" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "price" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "amount" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "maker_fee" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "maker_fee" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "taker_fee" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "taker_fee" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "total_fees" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "trade" ALTER COLUMN "total_fees" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "amount" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "balance_before" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "balance_after" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "balance" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "balance" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "locked_balance" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "locked_balance" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "total_deposited" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "total_deposited" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "total_withdrawn" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "total_withdrawn" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "total_pnl" SET DATA TYPE numeric(20);--> statement-breakpoint
ALTER TABLE "wallet" ALTER COLUMN "total_pnl" SET DEFAULT '0';