import { relations } from "drizzle-orm";
import { user } from "./auth";
import { event } from "./event";
import { uuid, text, timestamp, boolean, index, pgTable } from "drizzle-orm/pg-core";


export const comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .references(() => event.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    parentId: uuid("parent_id"), 
    content: text("content").notNull(),
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at"),

    // Moderation
    isHidden: boolean("is_hidden").default(false).notNull(),
    hiddenReason: text("hidden_reason"),
    hiddenBy: uuid("hidden_by").references(() => user.id),
    hiddenAt: timestamp("hidden_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("comments_event_idx").on(table.eventId),
    userIdx: index("comments_user_idx").on(table.userId),
    parentIdx: index("comments_parent_idx").on(table.parentId),
    createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
  })
);

export const commentRelation = relations(comment, ({ one, many }) => ({
  event: one(event, {
    fields: [comment.eventId],
    references: [event.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
  }),
  reply: many(comment),
}));
