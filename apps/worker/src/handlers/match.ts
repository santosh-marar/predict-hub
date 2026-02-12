import { matchOrder } from "@repo/order-engine";
import { EachMessagePayload } from "kafkajs";

export async function handleOrderCreated(payload: EachMessagePayload) {
  const message = JSON.parse(payload.message.value!.toString());
  await matchOrder(message.newOrder, message.eventData);
}
