import express from "express";
import { checkRedisHealth } from "../services/redis.js";

const router = express.Router();

// Health check endpoint
router.get("/", async (req, res) => {
  const redisHealth = await checkRedisHealth();
  
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      api: { status: "healthy" },
      redis: redisHealth
    }
  };

  const statusCode = redisHealth.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
