import { user } from "./auth";
import { event } from "./event";
import { uuid, text, timestamp, decimal, index, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { trade } from "./trade";

export const order = pgTable(
  "order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    eventId: uuid("event_id")
      .references(() => event.id)
      .notNull(),

    // Order details
    side: text("side", { enum: ["yes", "no"] }).notNull(),
    type: text("type", { enum: ["buy", "sell"] }).notNull(),
    orderType: text("order_type", { enum: ["market", "limit"] })
      .default("limit")
      .notNull(),

    // Quantities
    originalQuantity: decimal("original_quantity", {
      precision: 15,
      scale: 5,
    }).notNull(),
    remainingQuantity: decimal("remaining_quantity", {
      precision: 15,
      scale: 5,
    }).notNull(),
    filledQuantity: decimal("filled_quantity", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),

    // Pricing
    limitPrice: decimal("limit_price", { precision: 15, scale: 5 }), // null for market orders
    averageFillPrice: decimal("average_fill_price", { precision: 15, scale: 5 }),

    // Status and timing
    status: text("status", {
      enum: ["pending", "partial", "filled", "cancelled", "expired"],
    })
      .default("pending")
      .notNull(),
    timeInForce: text("time_in_force", { enum: ["GTC", "IOC", "FOK"] })
      .default("GTC")
      .notNull(), 
    expiresAt: timestamp("expires_at"),

    // Execution tracking
    totalAmount: decimal("total_amount", { precision: 15, scale: 5 }).notNull(),
    fees: decimal("fees", { precision: 15, scale: 5 }).default("0").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    filledAt: timestamp("filled_at"),
    cancelledAt: timestamp("cancelled_at"),
  },
  (table) => ({
    userIdx: index("orders_user_idx").on(table.userId),
    eventIdx: index("orders_event_idx").on(table.eventId),
    statusIdx: index("orders_status_idx").on(table.status),
    eventSideTypePrice: index("orders_matching_idx").on(
      table.eventId,
      table.side,
      table.type,
      table.limitPrice,
      table.createdAt
    ),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  })
);

export const orderSelectSchema = createSelectSchema(order);
export const orderInsertSchema = createInsertSchema(order); 
export const orderUpdateSchema= createUpdateSchema(order);

export const orderRelation = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  event: one(event, {
    fields: [order.eventId],
    references: [event.id],
  }),
  makerTrade: many(trade, { relationName: "makerTrade" }),
  takerTrade: many(trade, { relationName: "takerTrade" }),
}));
