import dotenv from "dotenv";
dotenv.config();

import { logger } from "@/utils/logger";
import { initKafkaProducer } from "@predict-hub/kafka";

const config = {
  kafkaBrokers: process.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"],
};

export async function initKafka(){
    try{
        await initKafkaProducer(config.kafkaBrokers, "match-engine-service");
        logger.info({ brokers: config.kafkaBrokers }, "Kafka connected");
    }catch(error){
        logger.error({ error }, " Failed to start server. Ensure Kafka & Redis are running.");
        process.exit(1);
    }
}

initKafka();