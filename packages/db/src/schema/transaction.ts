import {
  text,
  decimal,
  timestamp,
  uuid,
  pgTable,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { user } from "./auth";
import { order } from "./order";
import { event } from "./event";
import { relations } from "drizzle-orm";

// Wallet transactions (deposits, withdrawals, etc.)
export const transaction = pgTable(
  "transaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),

    // Transaction details
    type: text("type", {
      enum: ["deposit", "withdrawal", "trade", "payout", "refund", "bonus"],
    }).notNull(),
    amount: decimal("amount", { precision: 15, scale: 5 }).notNull(),
    balanceBefore: decimal("balance_before", {
      precision: 15,
      scale: 5,
    }).notNull(),
    balanceAfter: decimal("balance_after", {
      precision: 15,
      scale: 5,
    }).notNull(),

    // References
    relatedOrderId: uuid("related_order_id").references(() => order.id),
    relatedEventId: uuid("related_event_id").references(() => event.id),

    // External payment details
    paymentMethod: text("payment_method"),
    paymentReference: text("payment_reference"),

    // Status
    status: text("status", {
      enum: ["pending", "completed", "failed", "cancelled"],
    })
      .default("pending")
      .notNull(),

    description: text("description"),
    metadata: text("metadata"), // JSON string for additional data

    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdx: index("transactions_user_idx").on(table.userId),
    typeIdx: index("transactions_type_idx").on(table.type),
    statusIdx: index("transactions_status_idx").on(table.status),
    createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  })
);

export const transactionSelectSchema = createSelectSchema(transaction);
export const transactionInsertSchema = createInsertSchema(transaction);
export const transactionUpdateSchema= createUpdateSchema(transaction);

export const transactionRelation = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
  relatedOrder: one(order, {
    fields: [transaction.relatedOrderId],
    references: [order.id],
  }),
  relatedEvent: one(event, {
    fields: [transaction.relatedEventId],
    references: [event.id],
  }),
}));