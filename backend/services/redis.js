import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || undefined;

export const redis = createClient(
  REDIS_URL
    ? { url: REDIS_URL }
    : {
        socket: {
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
          reconnectStrategy: () => new Error("Stop reconnect"),
        },
        password: process.env.REDIS_PASSWORD || undefined,
      }
);

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

export let redisAvailable = false;

export async function connectRedis() {
  try {
    if (!redis.isOpen) {
      await redis.connect();
      // Test Redis with a ping
      const pong = await redis.ping();
      if (pong === "PONG") {
        redisAvailable = true;
        console.log("✅ Connected to Redis successfully");
        console.log("🔒 JWT token blacklisting is ENABLED");
      } else {
        throw new Error("Redis ping failed");
      }
    }
  } catch (err) {
    redisAvailable = false;
    console.warn("⚠️ Redis unavailable. Refresh-token features disabled.");
    console.warn("⚠️ JWT token blacklisting is DISABLED - tokens will remain valid until expiry");
    console.warn("📝 To enable Redis: Install and start Redis server on localhost:6379");
    try {
      await redis.disconnect();
    } catch (_) {}
  }
}

// Helpers to manage refresh tokens
export async function storeRefreshToken(jti, userId, ttlSeconds) {
  // Store mapping from jti -> userId with expiry
  await redis.set(`refresh:${jti}`, String(userId), { EX: ttlSeconds });
}

export async function revokeRefreshToken(jti) {
  await redis.del(`refresh:${jti}`);
}

export async function isRefreshTokenValid(jti) {
  const val = await redis.get(`refresh:${jti}`);
  return Boolean(val);
}

// Token blacklist for invalidated access tokens
export async function blacklistToken(jti, ttlSeconds) {
  if (!redisAvailable) {
    console.warn("⚠️ Cannot blacklist token - Redis unavailable");
    return;
  }
  try {
    await redis.set(`blacklist:${jti}`, "1", { EX: ttlSeconds });
    console.log(`✅ Token ${jti.substring(0, 8)}... blacklisted for ${ttlSeconds}s`);
  } catch (err) {
    console.error("❌ Error blacklisting token:", err);
  }
}

export async function isTokenBlacklisted(jti) {
  if (!redisAvailable) return false;
  try {
    const val = await redis.get(`blacklist:${jti}`);
    return Boolean(val);
  } catch (err) {
    console.error("❌ Error checking blacklist:", err);
    return false;
  }
}

// Health check for Redis
export async function checkRedisHealth() {
  if (!redisAvailable) {
    return { status: "unavailable", message: "Redis is not connected" };
  }
  try {
    const pong = await redis.ping();
    return { 
      status: "healthy", 
      message: pong === "PONG" ? "Redis is working" : "Redis ping failed",
      features: {
        tokenBlacklisting: true,
        refreshTokens: true
      }
    };
  } catch (err) {
    return { 
      status: "error", 
      message: err.message,
      features: {
        tokenBlacklisting: false,
        refreshTokens: false
      }
    };
  }
}
