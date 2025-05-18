import dotenv from "dotenv";
dotenv.config();
import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import adminRoutes from "./routes/admin";
import { auth } from "./lib/auth";

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Configure CORS middleware
app.use(
  cors({
    origin: true, // Allow all origins (Better Auth will handle specific origin validation)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Better Auth handler with configured auth instance
app.all("/api/auth/*splat", toNodeHandler(auth));

// Other middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Hello World! This is the API server. testing with tsup");
});

app.use("/api/v1/admin", adminRoutes);

// Start
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

export default app;
