import { eq, event } from "@repo/db";

/**
 * Validate event exists and is active for trading or not
 */
export async function validateEvent(tx: any, eventId: string) {
  const [eventData] = await tx
    .select()
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (!eventData) {
    throw new Error("Event not found");
  }

  if (eventData.status !== "active") {
    throw new Error("Event is not active for trading");
  }

  // Check if event has ended
  if (new Date() > new Date(eventData.endTime)) {
    throw new Error("Event has ended");
  }

  return eventData;
}
