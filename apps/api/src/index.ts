import dotenv from "dotenv";
dotenv.config();

import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { createServer } from "http";

import adminRoutes from "./routes/admin";
import { auth } from "./lib/auth";
import userRoutes from "./routes/user";
import categoryRoutes from "./routes/category";
import subCategoryRoutes from "./routes/sub-category";
import eventRoutes from "./routes/event";
import orderRoute from "./routes/order";
import walletRoute from "./routes/wallet";
import { initializeSocket } from "./service/socket-io";

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with proper typing
const io = initializeSocket(httpServer);

// Configure CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

// Better Auth handler with configured auth instance
app.all("/api/auth/*splat", toNodeHandler(auth));

// Other middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
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

// Test endpoint to emit socket events
app.post("/api/v1/test/ping", (req, res) => {
  const { message } = req.body;
  io.emit("pong", {
    message: `Server broadcast: ${message}`,
    timestamp: Date.now(),
  });
  res.json({ success: true, message: "Ping sent to all clients" });
});

// API Routes
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/sub-category", subCategoryRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/wallet", walletRoute);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server initialized`);
  console.log(`🔄 Real-time features enabled`);
});

export { io };
export default app;
