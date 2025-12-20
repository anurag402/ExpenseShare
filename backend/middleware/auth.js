import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../services/redis.js";

const ISSUER = process.env.JWT_ISSUER || "expense-share-api";
const AUDIENCE = process.env.JWT_AUDIENCE || "expense-share-frontend";
const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev-access-secret";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    
    // Check if token is blacklisted
    if (decoded.jti) {
      const isBlacklisted = await isTokenBlacklisted(decoded.jti);
      if (isBlacklisted) {
        return res.status(401).json({ error: "Token has been invalidated" });
      }
    }
    
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
