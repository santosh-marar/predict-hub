import { db, outbox } from "@repo/db";
import { asc, eq, sql, inArray } from "drizzle-orm";
import { logger } from "./utils/logger";
import { sendToKafka } from "@predict-hub/kafka";
import { initKafka } from "./kafka";

const PUBLISH_BATCH_SIZE = 50;

export async function enqueueOutboxEvent(
  tx: any,
  topic: string,
  key: string | undefined,
  payload: any,
  dedupeKey?: string
) {
  await tx
    .insert(outbox)
    .values({
      topic,
      key,
      payload,
      dedupeKey,
      status: "pending",
    })
    .onConflictDoNothing({
      target: [outbox.topic, outbox.key, outbox.dedupeKey],
    });
}

export async function publishPendingOutboxEvents(
  limit: number = PUBLISH_BATCH_SIZE
) {
  const pending = await db
    .select()
    .from(outbox)
    .where(inArray(outbox.status, ["pending", "failed"]))
    .orderBy(asc(outbox.createdAt))
    .limit(limit);

  if (!pending.length) return;

  await initKafka();

  for (const event of pending) {
    try {
      await sendToKafka(event.topic, event.payload, event.key ?? undefined);

      await db
        .update(outbox)
        .set({
          status: "published",
          attemptCount: sql`${outbox.attemptCount} + 1`,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(outbox.id, event.id));
    } catch (error) {
      await db
        .update(outbox)
        .set({
          status: "failed",
          attemptCount: sql`${outbox.attemptCount} + 1`,
          lastError: error instanceof Error ? error.message : String(error),
          updatedAt: new Date(),
        })
        .where(eq(outbox.id, event.id));

      logger.error(
        {
          context: "OUTBOX_PUBLISH_FAILED",
          outboxId: event.id,
          topic: event.topic,
          error: error instanceof Error ? error.message : error,
        },
        "Failed to publish outbox event"
      );

      // Bubble up so the consumer does not commit offsets
      throw error;
    }
  }
}
