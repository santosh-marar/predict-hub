import { relations } from "drizzle-orm";
import { user } from "./auth";
import { event } from "./event";
import { uuid, text, timestamp, boolean, index, pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .references(() => event.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    parentId: uuid("parent_id"),
    content: text("content").notNull(),
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at"),

    // Moderation - make this reference explicit
    isHidden: boolean("is_hidden").default(false).notNull(),
    hiddenReason: text("hidden_reason"),
    hiddenBy: text("hidden_by").references(() => user.id, {
      onDelete: "set null",
    }),
    hiddenAt: timestamp("hidden_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    eventIdx: index("comments_event_idx").on(table.eventId),
    userIdx: index("comments_user_idx").on(table.userId),
    parentIdx: index("comments_parent_idx").on(table.parentId),
    createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
  })
);

export const commentSelectSchema = createSelectSchema(comment);
export const commentInsertSchema = createInsertSchema(comment); 
export const commentUpdateSchema= createUpdateSchema(comment);

export const commentRelation = relations(comment, ({ one, many }) => ({
  event: one(event, {
    fields: [comment.eventId],
    references: [event.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  hiddenByUser: one(user, {
    fields: [comment.hiddenBy],
    references: [user.id],
    relationName: "hiddenByUser", // Give this relation a unique name
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "parentComment", // Give this relation a unique name
  }),
  replies: many(comment, {
    relationName: "parentComment", // Match the parent relation name
  }),
}));

