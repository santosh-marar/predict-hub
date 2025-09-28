import {
  uuid,
  decimal,
  timestamp,
  index,
  text,
  pgTable,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { event } from "./event";
import { user } from "./auth";

export const position = pgTable(
  "position",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    eventId: uuid("event_id")
      .references(() => event.id, { onDelete: "cascade" })
      .notNull(),

    side: text("side", { enum: ["YES", "NO"] }).notNull(),
    type: text("type", { enum: ["buy", "sell"] }).notNull(),

    shares: decimal("shares", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),

    status: text("status", { enum: ["open", "closed"] })
      .default("open")
      .notNull(),

    // Cost tracking
    totalInvested: decimal("total_invested", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),
    averagePrice: decimal("average_price", { precision: 15, scale: 5 }),

    // P&L tracking
    realizedPnl: decimal("realized_pnl", { precision: 15, scale: 5 })
      .default("0")
      .notNull(),
    unrealizedPnl: decimal("unrealized_pnl", { precision: 15, scale: 5 })
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

export const positionSelectSchema = createSelectSchema(position);
export const positionInsertSchema = createInsertSchema(position);
export const positionUpdateSchema = createUpdateSchema(position);

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
