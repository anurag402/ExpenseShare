import { Balance } from "../models/BalanceSchema.js";
import { Expense } from "../models/ExpenseSchema.js";
import { SettledExpense } from "../models/SettledExpenseSchema.js";
import { SettlementRequest } from "../models/SettlementRequestSchema.js";
import { Settlement } from "../models/SettlementSchema.js";

export const getUserBalances = async (req, res) => {
  try {
    const balances = await Balance.find({ userId: req.params.userId })
      .populate("userId", "name email")
      .populate("groupId", "name")
      .populate("balances.otherUserId", "name email");
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupBalances = async (req, res) => {
  try {
    const balances = await Balance.find({ groupId: req.params.groupId })
      .populate("userId", "name email")
      .populate("balances.otherUserId", "name email");
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBalances = async (req, res) => {
  try {
    const balances = await Balance.find()
      .populate("userId", "name email")
      .populate("groupId", "name")
      .populate("balances.otherUserId", "name email");
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const settleBalance = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, groupId } = req.body;

    const balances = await performSettlement(
      fromUserId,
      toUserId,
      amount,
      groupId,
      fromUserId
    );

    res.json({
      message: "Balance settled successfully",
      balances,
    });
  } catch (error) {
    console.error("Error settling balance:", error);
    res.status(400).json({ error: error.message });
  }
};

export const createSettlementRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, groupId } = req.body;

    if (!fromUserId || !toUserId || !amount || !groupId) {
      return res.status(400).json({
        error: "fromUserId, toUserId, amount, and groupId are required",
      });
    }

    if (req.user?.id && req.user.id !== String(fromUserId)) {
      return res.status(403).json({
        error: "You can only create settlement requests for your own balances",
      });
    }

    // Prevent duplicate pending requests for the same pair and group
    const existing = await SettlementRequest.findOne({
      fromUserId,
      toUserId,
      groupId,
      status: "pending",
    });

    if (existing) {
      return res.status(409).json({
        error: "A pending settlement request already exists for this balance",
      });
    }

    const request = await SettlementRequest.create({
      fromUserId,
      toUserId,
      groupId,
      amount,
      status: "pending",
    });

    const populated = await request.populate([
      { path: "fromUserId", select: "name email" },
      { path: "toUserId", select: "name email" },
      { path: "groupId", select: "name" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating settlement request:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getSettlementRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = req.query.role || "incoming";
    const filter = {};

    if (role === "incoming") {
      filter.toUserId = userId;
    } else if (role === "outgoing") {
      filter.fromUserId = userId;
    } else {
      filter.$or = [{ toUserId: userId }, { fromUserId: userId }];
    }

    const requests = await SettlementRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("fromUserId", "name email")
      .populate("toUserId", "name email")
      .populate("groupId", "name");

    res.json(requests);
  } catch (error) {
    console.error("Error fetching settlement requests:", error);
    res.status(400).json({ error: error.message });
  }
};

export const approveSettlementRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const request = await SettlementRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Settlement request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request is already resolved" });
    }

    if (request.toUserId.toString() !== userId) {
      return res.status(403).json({ error: "Only the recipient can approve" });
    }

    // Create a permanent settlement record
    await Settlement.create({
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      amount: request.amount,
      groupId: request.groupId,
      settledBy: userId,
      settledAt: new Date(),
    });

    // Recalculate balances (which will now include the settlement)
    await recalculateGroupBalances(request.groupId?.toString());
    
    const balances = await Balance.find({ groupId: request.groupId })
      .populate("userId", "name email")
      .populate("balances.otherUserId", "name email");

    // Check if everything is settled and archive if needed
    await checkAndArchiveSettledExpenses(request.groupId?.toString(), userId);

    request.status = "approved";
    request.resolvedBy = userId;
    request.resolvedAt = new Date();
    await request.save();

    const populated = await request.populate([
      { path: "fromUserId", select: "name email" },
      { path: "toUserId", select: "name email" },
      { path: "groupId", select: "name" },
    ]);

    res.json({
      message: "Settlement approved",
      request: populated,
      balances,
    });
  } catch (error) {
    console.error("Error approving settlement request:", error);
    res.status(400).json({ error: error.message });
  }
};

export const rejectSettlementRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const request = await SettlementRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Settlement request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request is already resolved" });
    }

    if (request.toUserId.toString() !== userId) {
      return res.status(403).json({ error: "Only the recipient can reject" });
    }

    request.status = "rejected";
    request.resolvedBy = userId;
    request.resolvedAt = new Date();
    await request.save();

    const populated = await request.populate([
      { path: "fromUserId", select: "name email" },
      { path: "toUserId", select: "name email" },
      { path: "groupId", select: "name" },
    ]);

    res.json({ message: "Settlement rejected", request: populated });
  } catch (error) {
    console.error("Error rejecting settlement request:", error);
    res.status(400).json({ error: error.message });
  }
};

async function performSettlement(
  fromUserId,
  toUserId,
  amount,
  groupId,
  settledBy
) {
  console.log(
    `\n🔄 Settling balance: ${fromUserId} <-> ${toUserId}, amount: ${amount}, groupId: ${groupId}`
  );

  if (!fromUserId || !toUserId || !amount) {
    throw new Error("fromUserId, toUserId, and amount are required");
  }

  // Create a permanent settlement record
  await Settlement.create({
    fromUserId,
    toUserId,
    amount,
    groupId,
    settledBy: settledBy || fromUserId,
    settledAt: new Date(),
  });

  // Recalculate balances (which will now include the settlement)
  await recalculateGroupBalances(groupId);

  console.log(`Checking if all balances are settled...`);
  await checkAndArchiveSettledExpenses(groupId, settledBy || fromUserId);

  const refreshed = await Balance.find({ groupId })
    .populate("userId", "name email")
    .populate("balances.otherUserId", "name email");

  return refreshed;
}

// Utility: adjust a single directional balance record (userId -> otherUserId) by delta
async function adjustPairBalance(userId, otherUserId, delta, groupId = null) {
  const balance =
    (await Balance.findOne({ userId, groupId })) ||
    new Balance({ userId, groupId, balances: [] });

  const existing = balance.balances.find(
    (b) => b.otherUserId.toString() === otherUserId
  );

  if (existing) {
    existing.amount += delta;

    // Remove balance entry if it's settled (close to zero)
    if (Math.abs(existing.amount) < 0.01) {
      balance.balances = balance.balances.filter(
        (b) => b.otherUserId.toString() !== otherUserId
      );
    }
  } else {
    // Only add if the amount is significant
    if (Math.abs(delta) >= 0.01) {
      balance.balances.push({ otherUserId, amount: delta });
    }
  }

  balance.updatedAt = new Date();
  await balance.save();
}

// Utility: recompute all balances for a group from its expenses
export async function recalculateGroupBalances(groupId) {
  const expenses = await Expense.find({ groupId });

  const netMap = new Map(); // userId -> Map<otherUserId, amount>

  const addNet = (from, to, delta) => {
    if (!netMap.has(from)) netMap.set(from, new Map());
    const inner = netMap.get(from);
    inner.set(to, (inner.get(to) || 0) + delta);
  };

  for (const expense of expenses) {
    const payer = expense.paidBy.toString();
    const totalPaid = Number(expense.amount || 0);

    for (const split of expense.splits || []) {
      const userId = split.userId.toString();
      const share = Number(split.amount || 0);
      if (share <= 0) continue;

      // Each person owes their share
      // If the payer is in the split, they paid totalPaid but owe share, so net credit is (totalPaid - share)
      if (userId === payer) {
        // Payer's net: they paid totalPaid, they owe share
        // Their credit is distributed among other members
        continue; // Handle payer's credit below
      } else {
        // Non-payer owes their share to the payer
        addNet(userId, payer, share);
        addNet(payer, userId, -share);
      }
    }
  }

  // Apply settlements to reduce debts
  const settlements = await Settlement.find({ groupId });
  for (const settlement of settlements) {
    const from = settlement.fromUserId.toString();
    const to = settlement.toUserId.toString();
    const amount = Number(settlement.amount);
    
    // Settlement reduces debt from -> to
    addNet(from, to, -amount);
    addNet(to, from, amount);
  }

  // Persist per-user documents
  const userIds = Array.from(netMap.keys());
  for (const userId of userIds) {
    const entries = Array.from(netMap.get(userId).entries())
      .map(([otherUserId, amount]) => ({ otherUserId, amount }))
      .filter(entry => Math.abs(entry.amount) >= 0.01); // Only keep non-zero balances

    await Balance.findOneAndUpdate(
      { userId, groupId },
      { userId, groupId, balances: entries, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Clean up old docs for this group that are no longer relevant
  await Balance.deleteMany({ groupId, userId: { $nin: userIds } });
}

// Utility: check if all balances for a group are settled and archive expenses
async function checkAndArchiveSettledExpenses(groupId, settledBy) {
  try {
    const balances = await Balance.find({ groupId });

    console.log(`\n=== Checking settlement for group ${groupId} ===`);
    console.log(`Found ${balances.length} balance documents`);

    // Count total non-zero balances
    let totalNonZeroBalances = 0;
    balances.forEach((doc) => {
      if (doc.balances && doc.balances.length > 0) {
        const nonZeroBalances = doc.balances.filter(
          (b) => Math.abs(b.amount) >= 0.01
        );
        totalNonZeroBalances += nonZeroBalances.length;
        console.log(
          `User ${doc.userId}: ${nonZeroBalances.length} non-zero balances`
        );
      }
    });

    console.log(`Total non-zero balances: ${totalNonZeroBalances}`);

    // Only archive if there are absolutely no non-zero balances
    if (totalNonZeroBalances === 0) {
      console.log(
        "✅ All balances are zero! Archiving expenses and clearing data..."
      );

      // Get all expenses for this group
      const expenses = await Expense.find({ groupId });
      console.log(`Found ${expenses.length} expenses to archive`);

      if (expenses.length > 0) {
        // Archive each expense
        for (const expense of expenses) {
          await SettledExpense.create({
            expenseId: expense._id,
            description: expense.description,
            amount: expense.amount,
            groupId: expense.groupId,
            settledBy: settledBy,
            settledAt: new Date(),
          });
        }

        // Delete all expenses for this group
        await Expense.deleteMany({ groupId });
        console.log(`✅ Deleted ${expenses.length} expenses`);
      }

      // Clear all balances
      await Balance.deleteMany({ groupId });
      console.log(`✅ Cleared all balance documents`);
      
      // Clear all settlements for this group
      await Settlement.deleteMany({ groupId });
      console.log(`✅ Cleared all settlement records`);
    } else {
      console.log(
        `⚠️ Cannot archive: Still ${totalNonZeroBalances} non-zero balances remaining`
      );
    }
    console.log("=================================\n");
  } catch (error) {
    console.error("Error in checkAndArchiveSettledExpenses:", error);
    throw error;
  }
}

export const getSettledExpenses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const settledExpenses = await SettledExpense.find({
      settledBy: userId,
    })
      .populate("groupId", "name")
      .sort({ settledAt: -1 })
      .limit(10);

    res.json(settledExpenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
