import dotenv from "dotenv";
dotenv.config();

import { createKafkaConsumer, KAFKA_TOPICS } from "@predict-hub/kafka";
import { handleOrderPlaced } from "./handlers/matching";

async function start() {
  const brokers = process.env.KAFKA_BROKERS!.split(",");

  await createKafkaConsumer(
    brokers,
    "worker-matching",
    "matching-group",
    [KAFKA_TOPICS.ORDER_PLACED],
    handleOrderPlaced,
    true
  );
}

start();
