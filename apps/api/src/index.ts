import dotenv from "dotenv";
dotenv.config();

import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { createServer } from "http";
import { initializeSocket } from "./service/socket-io";
import { auth } from "./lib/auth";


import { initKafkaProducer, disconnectProducer } from "@predict-hub/kafka";

const config = {
  port: Number(process.env.PORT) || 8080,
  kafkaBrokers: process.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"],
};

// Express app setup
const app: Application = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount,
  });
});

app.get("/", (req, res) => {
  res.send("Hello World! This is the API server with Socket.IO support");
});

// Example test route
app.post("/api/v1/test/ping", (req, res) => {
  const { message } = req.body;
  io.emit("pong", {
    message: `Server broadcast: ${message}`,
    timestamp: Date.now(),
  });
  res.json({ success: true, message: "Ping sent to all clients" });
});

//  Import routes
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";
import categoryRoutes from "./routes/category";
import subCategoryRoutes from "./routes/sub-category";
import eventRoutes from "./routes/event";
import orderRoute from "./routes/order";
import walletRoute from "./routes/wallet";
import positionRoute from "./routes/position";
import { logger } from "./utils/logger";

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/sub-category", subCategoryRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/wallet", walletRoute);
app.use("/api/v1/position", positionRoute);

//  Start server
async function startServer() {
  try {
    logger.info(" Initializing services...");

    await initKafkaProducer(config.kafkaBrokers, "probo-api-service");
    logger.info({ brokers: config.kafkaBrokers }, " Kafka connected");

    httpServer.listen(config.port, () => {
      logger.info(`Server running at http://localhost:${config.port}`);
      logger.info("Socket.IO ready | Kafka & Redis initialized");
    });
  } catch (error) {
    logger.error(
      { error },
      " Failed to start server. Ensure Kafka & Redis are running."
    );
    process.exit(1);
  }
}

//  Graceful shutdown
const gracefulShutdown = async () => {
  logger.warn("Received shutdown signal, closing gracefully...");

  try {
    httpServer.close(() => {
      logger.info(" HTTP server closed");
    });

    await disconnectProducer();
    logger.info(" Kafka Producer disconnected");

    logger.info("Server shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, " Error during shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("uncaughtException", (error) => {
  logger.error({ error }, " Uncaught Exception");
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, " Unhandled Rejection");
  gracefulShutdown();
});

startServer();

export { io };
export default app;
