import express from "express";
import {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
} from "../controllers/groupController.js";

const router = express.Router();

// Create a new group
router.post("/", createGroup);

// Get all groups
router.get("/", getAllGroups);

// Get groups for a user (specific route must come before /:id to avoid conflicts)
router.get("/user/:userId", getUserGroups);

// Delete group (must come before GET /:id)
router.delete("/:id", deleteGroup);

// Get group by ID
router.get("/:id", getGroupById);

// Add member to group
router.post("/:id/members", addMemberToGroup);

// Remove member from group (must be before GET /:id to be matched correctly)
router.delete("/:id/members/:userId", removeMemberFromGroup);

export default router;
