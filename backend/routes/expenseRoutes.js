import express from "express";
import {
  createExpense,
  getAllExpenses,
  getGroupExpenses,
  getExpenseById,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Create a new expense
router.post("/", createExpense);

// Get all expenses
router.get("/", getAllExpenses);

// Get expenses for a group
router.get("/group/:groupId", getGroupExpenses);

// Get expense by ID
router.get("/:id", getExpenseById);

// Delete an expense
router.delete("/:id", deleteExpense);

export default router;
