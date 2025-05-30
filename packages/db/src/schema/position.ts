import {uuid, decimal, timestamp, index, pgTable} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { event } from "./event";
import { user} from "./auth";

export const position = pgTable(
  "position",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    eventId: uuid("event_id")
      .references(() => event.id, { onDelete: "cascade" })
      .notNull(),

    // Position details
    yesShares: decimal("yes_shares", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    noShares: decimal("no_shares", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),

    // Cost tracking
    totalInvested: decimal("total_invested", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    averageYesPrice: decimal("average_yes_price", { precision: 5, scale: 2 }),
    averageNoPrice: decimal("average_no_price", { precision: 5, scale: 2 }),

    // P&L tracking
    realizedPnl: decimal("realized_pnl", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),
    unrealizedPnl: decimal("unrealized_pnl", { precision: 15, scale: 2 })
      .default("0")
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userEventIdx: index("positions_user_event_idx").on(
      table.userId,
      table.eventId
    ),
    userIdx: index("positions_user_idx").on(table.userId),
    eventIdx: index("positions_event_idx").on(table.eventId),
  })
);

export const positionRelation = relations(position, ({ one }) => ({
  user: one(user, {
    fields: [position.userId],
    references: [user.id],
  }),
  event: one(event, {
    fields: [position.eventId],
    references: [event.id],
  }),
}));
