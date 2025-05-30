import { user } from "./auth";
import { event } from "./event";
import { trade } from "./trade";
import { comment } from "./comment";
import { uuid, text, timestamp, boolean, index, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    type: text("type", {
      enum: [
        "trade_executed",
        "event_resolved",
        "comment_reply",
        "event_ending_soon",
        "payout_received",
      ],
    }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),

    // References
    relatedEventId: uuid("related_event_id").references(() => event.id),
    relatedTradeId: uuid("related_trade_id").references(() => trade.id),
    relatedCommentId: uuid("related_comment_id").references(() => comment.id),

    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    unreadIdx: index("notifications_unread_idx").on(table.userId, table.isRead),
    typeIdx: index("notifications_type_idx").on(table.type),
  })
);

export const notificationRelation = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  relatedEvent: one(event, {
    fields: [notification.relatedEventId],
    references: [event.id],
  }),
  relatedTrade: one(trade, {
    fields: [notification.relatedTradeId],
    references: [trade.id],
  }),
  relatedComment: one(comment, {
    fields: [notification.relatedCommentId],
    references: [comment.id],
  }),
}));
