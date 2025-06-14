import {
  pgTable,
  uuid,
  decimal,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { event } from "./event";

// AMM Pool table definition
export const ammPool = pgTable("amm_pool", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .references(() => event.id)
    .unique()
    .notNull(),
  yesReserve: decimal("yes_reserve", { precision: 15, scale: 2 })
    .default("1000")
    .notNull(),
  noReserve: decimal("no_reserve", { precision: 15, scale: 2 })
    .default("1000")
    .notNull(),
  totalLiquidity: decimal("total_liquidity", { precision: 15, scale: 2 })
    .default("2000")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  feeRate: decimal("fee_rate", { precision: 5, scale: 4 })
    .default("0.003")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Liquidity provider shares table
export const liquidityProvider = pgTable("liquidity_provider", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  eventId: uuid("event_id")
    .references(() => event.id)
    .notNull(),
  shares: decimal("shares", { precision: 15, scale: 8 }).notNull(),
  totalContributed: decimal("total_contributed", {
    precision: 15,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
