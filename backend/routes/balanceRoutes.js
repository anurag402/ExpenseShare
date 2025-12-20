import express from "express";
import {
  getUserBalances,
  getGroupBalances,
  getAllBalances,
  settleBalance,
  getSettledExpenses,
  createSettlementRequest,
  getSettlementRequests,
  approveSettlementRequest,
  rejectSettlementRequest,
} from "../controllers/balanceController.js";

const router = express.Router();

// Calculate balances for a user across all groups
router.get("/user/:userId", getUserBalances);

// Calculate balances for a group
router.get("/group/:groupId", getGroupBalances);

// Get all balances
router.get("/", getAllBalances);

// Settlement requests
router.get("/settlement-requests", getSettlementRequests);
router.post("/settlement-requests", createSettlementRequest);
router.post("/settlement-requests/:id/approve", approveSettlementRequest);
router.post("/settlement-requests/:id/reject", rejectSettlementRequest);

// Settle a balance between two users (direct)
router.post("/settle", settleBalance);

// Get recently settled expenses for a user
router.get("/settled/:userId", getSettledExpenses);

export default router;
