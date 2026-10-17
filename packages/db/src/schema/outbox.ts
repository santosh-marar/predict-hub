import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const outboxStatus = pgEnum("outbox_status", [
  "pending",
  "published",
  "failed",
]);

export const outbox = pgTable(
  "outbox_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topic: text("topic").notNull(),
    key: text("key"),
    dedupeKey: text("dedupe_key"),
    payload: jsonb("payload").notNull(),
    status: outboxStatus("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("outbox_status_idx").on(table.status),
    createdAtIdx: index("outbox_created_at_idx").on(table.createdAt),
    dedupeIdx: uniqueIndex("outbox_dedupe_idx").on(
      table.topic,
      table.key,
      table.dedupeKey
    ),
  })
);
