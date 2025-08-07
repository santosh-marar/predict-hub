import { relations } from "drizzle-orm";
import { user } from "./auth";
import { event } from "./event";
import { order } from "./order";
import { uuid, text, timestamp, decimal, index, pgTable } from "drizzle-orm/pg-core";

export const trade = pgTable(
  "trade",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .references(() => event.id)
      .notNull(),

    // Maker and taker orders
    makerOrderId: uuid("maker_order_id").references(() => order.id),
    takerOrderId: uuid("taker_order_id")
      .references(() => order.id)
      .notNull(),
    makerUserId: text("maker_user_id")
      .references(() => user.id)
      .notNull(),
    takerUserId: text("taker_user_id")
      .references(() => user.id)
      .notNull(),

    // Trade details
    side: text("side", { enum: ["yes", "no"] }).notNull(),
    type: text("type", { enum: ["buy", "sell"] }).notNull(),
    quantity: decimal("quantity", { precision: 15, scale: 5 }).notNull(),
    price: decimal("price", { precision: 15, scale: 5 }).notNull(),
    amount: decimal("amount", { precision: 15, scale: 5 }).notNull(),

    // Fees (split between maker and taker)
    makerFee: decimal("maker_fee", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),
    takerFee: decimal("taker_fee", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),
    totalFees: decimal("total_fees", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),

    executedAt: timestamp("executed_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("trades_event_idx").on(table.eventId),
    makerUserIdx: index("trades_maker_user_idx").on(table.makerUserId),
    takerUserIdx: index("trades_taker_user_idx").on(table.takerUserId),
    executedAtIdx: index("trades_executed_at_idx").on(table.executedAt),
    makerOrderIdx: index("trades_maker_order_idx").on(table.makerOrderId),
    takerOrderIdx: index("trades_taker_order_idx").on(table.takerOrderId),
  })
);

export const tradeRelation = relations(trade, ({ one }) => ({
  event: one(event, {
    fields: [trade.eventId],
    references: [event.id],
  }),
  makerOrder: one(order, {
    fields: [trade.makerOrderId],
    references: [order.id],
    relationName: "makerTrade",
  }),
  takerOrder: one(order, {
    fields: [trade.takerOrderId],
    references: [order.id],
    relationName: "takerTrade",
  }),
  makerUser: one(user, {
    fields: [trade.makerUserId],
    references: [user.id],
  }),
  takerUser: one(user, {
    fields: [trade.takerUserId],
    references: [user.id],
  }),
}));
