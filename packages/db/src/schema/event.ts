import {
  pgTable,
  text,
  timestamp,
  decimal,
  boolean,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { category, subCategory } from "./category";
import { position } from "./position";
import { trade } from "./trade";
import { comment } from "./comment";    
import { order } from "./order";  
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    categoryId: uuid("category_id").references(() => category.id),
    subCategoryId: uuid("sub_category_id").references(() => subCategory.id),
    createdBy: text("created_by")
      .references(() => user.id)
      .notNull(),

    // Event timing
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time").notNull(),
    resolutionTime: timestamp("resolution_time"),

    // Event status
    status: text("status", {
      enum: ["draft", "active", "ended", "resolved", "cancelled"],
    })
      .default("draft")
      .notNull(),

    // Trading mechanics
    totalVolume: decimal("total_volume")
      .default("10000")
      .notNull(),
    totalYesShares: decimal("total_yes_shares")
      .default("5000")
      .notNull(),
    totalNoShares: decimal("total_no_shares")
      .default("5000")
      .notNull(),

    // Current prices (0-10)
    lastYesPrice: decimal("last_yes_price", { precision: 15, scale: 5 })
      .default("5")
      .notNull(),
    lastNoPrice: decimal("last_no_price", { precision: 15, scale: 5 })
      .default("5")
      .notNull(),

    // Resolution
    resolvedOutcome: boolean("resolved_outcome"),
    resolvedBy: text("resolved_by").references(() => user.id),
    resolvedAt: timestamp("resolved_at"),
    resolutionNotes: text("resolution_notes"),
    sourceOfTruth: text("source_of_truth"),
    rules: text("rules"),

    // Metadata
    eventOverviewAndStatistics: text("event_overview_and_statistics"),
    tags: text("tags").array(),
    isPublic: boolean("is_public").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("events_category_idx").on(table.categoryId),
    statusIdx: index("events_status_idx").on(table.status),
    endTimeIdx: index("events_end_time_idx").on(table.endTime),
    createdByIdx: index("events_created_by_idx").on(table.createdBy),
  })
);

export const eventSelectSchema = createSelectSchema(event);
export const eventInsertSchema = createInsertSchema(event);
export const eventUpdateSchema= createUpdateSchema(event);

export const eventRelation = relations(event, ({ one, many }) => ({
  category: one(category, {
    fields: [event.categoryId],
    references: [category.id],
  }),
  creator: one(user, {
    fields: [event.createdBy],
    references: [user.id],
  }),
  resolver: one(user, {
    fields: [event.resolvedBy],
    references: [user.id],
  }),
  position: many(position),
  trade: many(trade),
  comment: many(comment),
  order: many(order),
}));
