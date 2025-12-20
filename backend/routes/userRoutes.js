import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Get all users (for selecting members in groups, etc.)
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Delete user (admin operation, be careful)
router.delete("/:id", deleteUser);

export default router;
