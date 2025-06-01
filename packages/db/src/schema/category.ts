import { pgTable,uuid, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { event } from "./event";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";


export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categorySelectSchema = createSelectSchema(category);
export const categoryInsertSchema = createInsertSchema(category); 
export const categoryUpdateSchema= createUpdateSchema(category);

export const categoryRelation = relations(category, ({ many }) => ({
  event: many(event),
}));

