import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev-access-secret";
const ISSUER = process.env.JWT_ISSUER || "expense-share-api";
const AUDIENCE = process.env.JWT_AUDIENCE || "expense-share-frontend";
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "60m"; // 

export function signAccessToken(payload) {
  // Generate unique JWT ID for token tracking
  const jti = randomBytes(16).toString("hex");
  
  return jwt.sign(
    { ...payload, jti },
    ACCESS_SECRET,
    {
      algorithm: "HS256",
      expiresIn: ACCESS_EXPIRY,
      issuer: ISSUER,
      audience: AUDIENCE,
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, {
    algorithms: ["HS256"],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

// Get token expiry time in seconds
export function getTokenExpirySeconds(decodedToken) {
  if (!decodedToken.exp) return 3600; // default 1 hour
  return decodedToken.exp - Math.floor(Date.now() / 1000);
}
