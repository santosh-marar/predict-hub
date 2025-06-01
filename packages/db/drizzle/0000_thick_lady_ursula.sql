CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name"),
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"hidden_reason" text,
	"hidden_by" text,
	"hidden_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"category_id" uuid,
	"created_by" text NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp NOT NULL,
	"resolution_time" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"total_volume" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_yes_shares" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_no_shares" numeric(15, 2) DEFAULT '0' NOT NULL,
	"yes_price" numeric(5, 2) DEFAULT '50' NOT NULL,
	"no_price" numeric(5, 2) DEFAULT '50' NOT NULL,
	"resolved_outcome" boolean,
	"resolved_by" text,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"tags" text[],
	"is_public" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_event_id" uuid,
	"related_trade_id" uuid,
	"related_comment_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"side" text NOT NULL,
	"type" text NOT NULL,
	"order_type" text DEFAULT 'limit' NOT NULL,
	"original_quantity" numeric(15, 2) NOT NULL,
	"remaining_quantity" numeric(15, 2) NOT NULL,
	"filled_quantity" numeric(15, 2) DEFAULT '0' NOT NULL,
	"limit_price" numeric(5, 2),
	"average_fill_price" numeric(5, 2),
	"status" text DEFAULT 'pending' NOT NULL,
	"time_in_force" text DEFAULT 'GTC' NOT NULL,
	"expires_at" timestamp,
	"total_amount" numeric(15, 2) NOT NULL,
	"fees" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"filled_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "position" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"yes_shares" numeric(15, 2) DEFAULT '0' NOT NULL,
	"no_shares" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_invested" numeric(15, 2) DEFAULT '0' NOT NULL,
	"average_yes_price" numeric(5, 2),
	"average_no_price" numeric(5, 2),
	"realized_pnl" numeric(15, 2) DEFAULT '0' NOT NULL,
	"unrealized_pnl" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"maker_order_id" uuid NOT NULL,
	"taker_order_id" uuid NOT NULL,
	"maker_user_id" text NOT NULL,
	"taker_user_id" text NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(15, 2) NOT NULL,
	"price" numeric(5, 2) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"maker_fee" numeric(15, 2) DEFAULT '0' NOT NULL,
	"taker_fee" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_fees" numeric(15, 2) DEFAULT '0' NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"balance_before" numeric(15, 2) NOT NULL,
	"balance_after" numeric(15, 2) NOT NULL,
	"related_order_id" uuid,
	"related_event_id" uuid,
	"payment_method" text,
	"payment_reference" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"description" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"locked_balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_deposited" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_withdrawn" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_pnl" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_hidden_by_user_id_fk" FOREIGN KEY ("hidden_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_event_id_event_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_trade_id_trade_id_fk" FOREIGN KEY ("related_trade_id") REFERENCES "public"."trade"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_comment_id_comment_id_fk" FOREIGN KEY ("related_comment_id") REFERENCES "public"."comment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position" ADD CONSTRAINT "position_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_maker_order_id_order_id_fk" FOREIGN KEY ("maker_order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_taker_order_id_order_id_fk" FOREIGN KEY ("taker_order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_maker_user_id_user_id_fk" FOREIGN KEY ("maker_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_taker_user_id_user_id_fk" FOREIGN KEY ("taker_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_related_order_id_order_id_fk" FOREIGN KEY ("related_order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_related_event_id_event_id_fk" FOREIGN KEY ("related_event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_event_idx" ON "comment" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "comments_user_idx" ON "comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comment" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "event" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_end_time_idx" ON "event" USING btree ("end_time");--> statement-breakpoint
CREATE INDEX "events_created_by_idx" ON "event" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notification" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_event_idx" ON "order" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_matching_idx" ON "order" USING btree ("event_id","side","type","limit_price","created_at");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "positions_user_event_idx" ON "position" USING btree ("user_id","event_id");--> statement-breakpoint
CREATE INDEX "positions_user_idx" ON "position" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "positions_event_idx" ON "position" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "trades_event_idx" ON "trade" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "trades_maker_user_idx" ON "trade" USING btree ("maker_user_id");--> statement-breakpoint
CREATE INDEX "trades_taker_user_idx" ON "trade" USING btree ("taker_user_id");--> statement-breakpoint
CREATE INDEX "trades_executed_at_idx" ON "trade" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "trades_maker_order_idx" ON "trade" USING btree ("maker_order_id");--> statement-breakpoint
CREATE INDEX "trades_taker_order_idx" ON "trade" USING btree ("taker_order_id");--> statement-breakpoint
CREATE INDEX "transactions_user_idx" ON "transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transaction" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transaction" USING btree ("created_at");