CREATE TABLE "amm_pool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"yes_reserve" numeric(15, 2) DEFAULT '1000' NOT NULL,
	"no_reserve" numeric(15, 2) DEFAULT '1000' NOT NULL,
	"total_liquidity" numeric(15, 2) DEFAULT '2000' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"fee_rate" numeric(5, 4) DEFAULT '0.003' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "amm_pool_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "liquidity_provider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"shares" numeric(15, 8) NOT NULL,
	"total_contributed" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "amm_pool" ADD CONSTRAINT "amm_pool_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "liquidity_provider" ADD CONSTRAINT "liquidity_provider_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;