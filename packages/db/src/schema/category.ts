import {
  pgTable,
  uuid,
  text,
  serial,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { event } from "./event";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categorySelectSchema = createSelectSchema(category);
export const categoryInsertSchema = createInsertSchema(category);
export const categoryUpdateSchema = createUpdateSchema(category);

export const categoryRelation = relations(category, ({ many }) => ({
  event: many(event),
  subCategory: many(subCategory),
}));

export const subCategory = pgTable("sub_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .references(() => category.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subCategorySelectSchema = createSelectSchema(subCategory);
export const subCategoryInsertSchema = createInsertSchema(subCategory);
export const subCategoryUpdateSchema = createUpdateSchema(subCategory);

export const subCategoryRelation = relations(subCategory, ({ many }) => ({
  event: many(event),
}));
