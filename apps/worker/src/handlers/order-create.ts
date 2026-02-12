import { placeOrder } from "@repo/order-engine";
import { EachMessagePayload } from "kafkajs";

export async function handleOrderPlaced(payload: EachMessagePayload) {
  const order = JSON.parse(payload.message.value!.toString());
  await placeOrder(order);
}
