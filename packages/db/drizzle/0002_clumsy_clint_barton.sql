CREATE TABLE "sub_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sub_category_title_unique" UNIQUE("title"),
	CONSTRAINT "sub_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "category" DROP CONSTRAINT "category_name_unique";--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "yes_price" SET DEFAULT '5';--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "no_price" SET DEFAULT '5';--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "sub_category_id" uuid;--> statement-breakpoint
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_sub_category_id_sub_category_id_fk" FOREIGN KEY ("sub_category_id") REFERENCES "public"."sub_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_title_unique" UNIQUE("title");