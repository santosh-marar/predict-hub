import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { logger } from "./utils/logger";

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

const consumers: Map<string, Consumer> = new Map();

export async function createKafkaConsumer(
  brokers: string[],
  clientId: string,
  groupId: string,
  topics: string[],
  handler: MessageHandler,
  fromBeginning: boolean = false
): Promise<Consumer> {
  const kafka = new Kafka({
    clientId,
    brokers,
    retry: {
      initialRetryTime: 300,
      retries: 10,
    },
  });

  const consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxWaitTimeInMs: 5000,
    allowAutoTopicCreation: true,
  });

  await consumer.connect();
  logger.info(
    {
      context: "KAFKA_CONSUMER_CONNECTED",
      groupId,
    },
    "Kafka Consumer connected"
  );

  await consumer.subscribe({
    topics,
    fromBeginning,
  });

  await consumer.run({
    autoCommit: true,
    autoCommitInterval: 5000,
    eachMessage: async (payload: EachMessagePayload) => {
      try {
        await handler(payload);
        logger.info(
          {
            context: "KAFKA_CONSUMER_MESSAGE_PROCESSED",
            groupId,
            topic: payload.topic,
          },
          "Kafka Consumer message processed"
        );
      } catch (error) {
        logger.error(
          {
            context: "KAFKA_CONSUMER_MESSAGE_ERROR",
            groupId,
            topic: payload.topic,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
          },
          "Kafka Consumer message error"
        );
        // * Todo: Handle retry logic then throw error
      }
    },
  });

  consumers.set(groupId, consumer);
  return consumer;
}

export async function disconnectConsumer(groupId: string): Promise<void> {
  const consumer = consumers.get(groupId);
  if (consumer) {
    await consumer.disconnect();
    consumers.delete(groupId);
    logger.info(
      {
        context: "KAFKA_CONSUMER_DISCONNECTED",
        groupId,
      },
      "Kafka Consumer disconnected"
    );
  }
}

export async function disconnectAllConsumers(): Promise<void> {
  for (const [groupId, consumer] of consumers) {
    await consumer.disconnect();
    logger.info(
      {
        context: "KAFKA_CONSUMER_DISCONNECTED",
        groupId,
      },
      "Kafka Consumer disconnected"
    );
  }
  consumers.clear();
}
