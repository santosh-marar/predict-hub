import { Kafka, Producer } from "kafkajs";
import { logger } from "./utils/logger";

let producer: Producer | null = null;
let kafka: Kafka | null = null;

export async function initKafkaProducer(
  brokers: string[],
  clientId: string
): Promise<Producer> {
  if (producer) {
    return producer;
  }

  kafka = new Kafka({
    clientId,
    brokers,
    retry: {
      initialRetryTime: 300,
      retries: 10,
      maxRetryTime: 30000,
      multiplier: 2,
    },
    connectionTimeout: 10000,
    requestTimeout: 30000,
  });

  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
    maxInFlightRequests: 5,
    idempotent: true, // Exactly-once delivery
    // compression: 1, // GZIP
  });

  await producer.connect();
  logger.info(
    {
      context: "KAFKA_PRODUCER_CONNECTED",
    },
    "Kafka Producer connected"
  );

  return producer;
}

export async function sendToKafka(
  topic: string,
  message: any,
  key?: string
): Promise<void> {
  if (!producer) {
      logger.error(
        {
          context: "KAFKA_PRODUCER_NOT_INITIALIZED",
          topic,
        },
        "Kafka producer not initialized. Call initKafkaProducer first"
      );

    throw new Error(
      "Kafka producer not initialized. Call initKafkaProducer first"
    );
  }

  await producer.send({
    topic,
    messages: [
      {
        key: key || null,
        value: JSON.stringify(message),
        timestamp: Date.now().toString(),
      },
    ],
  });
}

export async function sendBatchToKafka(
  topic: string,
  messages: Array<{ key?: string; value: any }>
): Promise<void> {
  if (!producer) {

    logger.error(
      {
        context:"KAFKA_PRODUCER_NOT_INITIALIZED",
        topic,
      }
      ,"Kafka producer not initialized. Call initKafkaProducer first"
    );

    throw new Error("Kafka producer not initialized");
  }

  await producer.send({
    topic,
    messages: messages.map((msg) => ({
      key: msg.key || null,
      value: JSON.stringify(msg.value),
      timestamp: Date.now().toString(),
    })),
  });
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
    logger.info({
      context: "KAFKA_PRODUCER_DISCONNECTED",
      topic: "kafka-producer",
    }),
      "Kafka Producer disconnected";
  }
}
