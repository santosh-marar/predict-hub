import { decimal, timestamp, text, uuid, pgTable } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const wallet = pgTable("wallet", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  // Balances
  balance: decimal("balance", { precision: 15, scale: 5 })
    .default("0")
    .notNull(),
  lockedBalance: decimal("locked_balance", { precision: 15, scale: 5 })
    .default("0")
    .notNull(),

  // Lifetime stats
  totalDeposited: decimal("total_deposited", { precision: 15, scale: 5 })
    .default("0")
    .notNull(),
  totalWithdrawn: decimal("total_withdrawn", { precision: 15, scale: 5 })
    .default("0")
    .notNull(),
  totalPnl: decimal("total_pnl", { precision: 15, scale: 5 })
    .default("0")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletSelectSchema = createSelectSchema(wallet);
export const walletInsertSchema = createInsertSchema(wallet);
export const walletUpdateSchema = createUpdateSchema(wallet);

export const walletRelation = relations(wallet, ({ one }) => ({
  user: one(user, {
    fields: [wallet.userId],
    references: [user.id],
  }),
}));
