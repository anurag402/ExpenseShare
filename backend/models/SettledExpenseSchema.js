import mongoose from "mongoose";

const settledExpenseSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: true,
  },
  description: String,
  amount: Number,
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  settledAt: {
    type: Date,
    default: Date.now,
  },
  settledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const SettledExpense = mongoose.model(
  "SettledExpense",
  settledExpenseSchema
);
