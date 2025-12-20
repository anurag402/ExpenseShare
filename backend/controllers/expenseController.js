import { Expense } from "../models/ExpenseSchema.js";
import { Group } from "../models/GroupSchema.js";
import { recalculateGroupBalances } from "./balanceController.js";

export const createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitType, splits } =
      req.body;

    if (!groupId || !description || !amount || !paidBy || !splitType) {
      return res.status(400).json({
        error:
          "groupId, description, amount, paidBy, and splitType are required",
      });
    }

    // Validate amount
    const amountValue = Number(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    
    if (amountValue > 10000000) {
      return res.status(400).json({ error: "Amount is too large" });
    }

    // Validate description
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Only members of the group can add expenses
    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({ error: "Not authorized for this group" });
    }

    // Validate paidBy is a group member
    const isPayer = group.members.some(
      (memberId) => memberId.toString() === paidBy.toString()
    );
    if (!isPayer) {
      return res.status(400).json({ error: "Payer must be a group member" });
    }

    // Build consistent splits on the server to guarantee balances compute correctly
    const memberIds = group.members.map((m) => m.toString());
    let computedSplits = [];

    if (splitType === "equal") {
      if (memberIds.length === 0) {
        return res.status(400).json({ error: "Group must have at least one member" });
      }
      const share = amountValue / memberIds.length;
      computedSplits = memberIds.map((userId) => ({ userId, amount: share }));
    } else if (splitType === "percentage") {
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ error: "Splits array is required for percentage split" });
      }
      
      // Validate all percentages and userIds
      for (const split of splits) {
        // Validate userId is a group member
        if (!memberIds.includes(split.userId?.toString())) {
          return res.status(400).json({ error: "All split users must be group members" });
        }
        
        const perc = Number(split.percentage || 0);
        if (isNaN(perc) || perc < 0) {
          return res.status(400).json({ error: "Percentages must be non-negative numbers" });
        }
        if (perc > 100) {
          return res.status(400).json({ error: "Individual percentage cannot exceed 100%" });
        }
      }
      
      const totalPerc = splits.reduce(
        (sum, s) => sum + Number(s.percentage || 0),
        0
      );
      
      if (totalPerc > 100 + 0.01) { // Allow small floating point errors
        return res.status(400).json({ 
          error: `Total percentage (${totalPerc.toFixed(1)}%) exceeds 100%` 
        });
      }
      
      if (totalPerc < 100 - 0.01) { // Must equal 100%
        return res.status(400).json({ 
          error: `Total percentage (${totalPerc.toFixed(1)}%) is less than 100%. Total must equal 100%` 
        });
      }
      
      if (totalPerc > 0) {
        computedSplits = splits.map((s) => ({
          userId: s.userId,
          amount: (amountValue * Number(s.percentage || 0)) / 100,
        })).filter((s) => s.amount > 0);
      } else {
        return res.status(400).json({ error: "Total percentage must be greater than 0" });
      }
    } else if (splitType === "exact") {
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ error: "Splits array is required for exact split" });
      }
      
      // Validate all split amounts and userIds
      for (const split of splits) {
        // Validate userId is a group member
        if (!memberIds.includes(split.userId?.toString())) {
          return res.status(400).json({ error: "All split users must be group members" });
        }
        
        const amt = Number(split.amount || 0);
        if (isNaN(amt) || amt < 0) {
          return res.status(400).json({ error: "Split amounts must be non-negative numbers" });
        }
      }
      
      const validSplits = splits.map((s) => ({
        userId: s.userId,
        amount: Number(s.amount || 0),
      })).filter((s) => s.amount > 0);
      
      const totalSplit = validSplits.reduce((sum, s) => sum + s.amount, 0);
      
      if (totalSplit > amountValue + 0.01) { // Allow small floating point errors
        return res.status(400).json({ 
          error: `Total split (${totalSplit.toFixed(2)}) exceeds amount (${amountValue.toFixed(2)})` 
        });
      }
      
      if (totalSplit < amountValue - 0.01) { // Must equal amount
        return res.status(400).json({ 
          error: `Total split (${totalSplit.toFixed(2)}) is less than amount (${amountValue.toFixed(2)}). Total must equal the expense amount` 
        });
      }
      
      computedSplits = validSplits;
    } else {
      return res.status(400).json({ error: "Invalid split type. Must be 'equal', 'exact', or 'percentage'" });
    }
    
    // Ensure we have at least one split
    if (computedSplits.length === 0) {
      return res.status(400).json({ error: "Expense must have at least one split" });
    }

    const expense = new Expense({
      groupId,
      description,
      amount: amountValue,
      paidBy,
      splitType,
      splits: computedSplits,
    });

    await expense.save();

    group.expenses.push(expense._id);
    await group.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splits.userId", "name email");

    // Recompute group balances so everyone can see who owes whom
    await recalculateGroupBalances(groupId);

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    // Limit to expenses in groups the user is part of
    const groups = await Group.find({ members: req.user.id }).select("_id");
    const groupIds = groups.map((g) => g._id);

    const expenses = await Expense.find({ groupId: { $in: groupIds } })
      .populate("paidBy", "name email")
      .populate("splits.userId", "name email");

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupExpenses = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({ error: "Not authorized for this group" });
    }

    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate("paidBy", "name email")
      .populate("splits.userId", "name email");
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("paidBy", "name email")
      .populate("splits.userId", "name email");
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const group = await Group.findById(expense.groupId);
    const isMember = group?.members.some(
      (memberId) => memberId.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({ error: "Not authorized for this group" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const group = await Group.findById(expense.groupId);
    const isMember = group?.members.some(
      (memberId) => memberId.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({ error: "Not authorized for this group" });
    }

    await Group.findByIdAndUpdate(expense.groupId, {
      $pull: { expenses: req.params.id },
    });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
