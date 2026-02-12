import dotenv from "dotenv";
dotenv.config();

import { createKafkaConsumer, KAFKA_TOPICS } from "@predict-hub/kafka";
import { handleOrderPlaced } from "./handlers/order-create";
import { handleOrderCreated } from "./handlers/match";

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

  await createKafkaConsumer(
    brokers,
    "match-engine-service",
    "match-engine-group",
    [KAFKA_TOPICS.ORDER_CREATED],
    handleOrderCreated,
    true
  );
}

start();
