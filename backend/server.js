import "dotenv/config";
import express from "express";
import cors from "cors";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { authenticateToken } from "./middleware/auth.js";
import { connectRedis } from "./services/redis.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_DB_URI = process.env.MONGO_DB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: err.message });
});

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);

// Protected routes (require authentication)
app.use("/api/groups", authenticateToken, groupRoutes);
app.use("/api/expenses", authenticateToken, expenseRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/balances", authenticateToken, balanceRoutes);

// Simple health check (deprecated - use /api/health)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Expense Sharing API is running" });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(MONGO_DB_URI);
    console.log("✅ Connected to MongoDB");

    // Connect to Redis
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
