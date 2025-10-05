import { EachMessagePayload } from "kafkajs";

export async function handleOrderPlaced(payload: EachMessagePayload) {
  const order = JSON.parse(payload.message.value!.toString());

  // TODO: Match order with existing orders
}
