import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Logout user (invalidate token)
router.post("/logout", authenticateToken, logout);

// Refresh access token

export default router;
