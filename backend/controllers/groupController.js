import { Group } from "../models/GroupSchema.js";
import { User } from "../models/UserSchema.js";
import { Expense } from "../models/ExpenseSchema.js";
import { Balance } from "../models/BalanceSchema.js";
import { SettlementRequest } from "../models/SettlementRequestSchema.js";
import { Settlement } from "../models/SettlementSchema.js";
import { SettledExpense } from "../models/SettledExpenseSchema.js";

export const createGroup = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { name, createdBy, members = [] } = req.body;

    // Force the creator to be the authenticated user to prevent spoofing
    const creatorId = createdBy || currentUserId.toString();

    if (!name || !creatorId) {
      return res.status(400).json({ error: "Name and createdBy are required" });
    }

    if (creatorId !== currentUserId.toString()) {
      return res
        .status(403)
        .json({ error: "Creator must be the authenticated user" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ error: "Creator user not found" });
    }

    for (const memberId of members) {
      const member = await User.findById(memberId);
      if (!member) {
        return res
          .status(404)
          .json({ error: `Member with ID ${memberId} not found` });
      }
    }

    const allMembers = members.includes(creatorId)
      ? members
      : [creatorId, ...members];
    const group = new Group({
      name,
      createdBy: creatorId,
      members: allMembers,
    });
    await group.save();

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    console.log("getAllGroups - currentUserId:", currentUserId);
    // Only return groups the authenticated user is part of
    // Use ObjectId for proper MongoDB matching
    const groups = await Group.find({
      members: { $in: [currentUserId] },
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");
    console.log("getAllGroups - groups found:", groups.length);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    // Prevent a user from enumerating other users' groups
    if (req.params.userId !== currentUserId.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const groups = await Group.find({
      members: { $in: [currentUserId] },
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const group = await Group.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("expenses");
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some((member) => {
      const memberId = member._id || member.id || member;
      return memberId.toString() === currentUserId.toString();
    });
    const isCreator =
      group.createdBy._id?.toString() === currentUserId.toString() ||
      group.createdBy.toString() === currentUserId.toString();
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: "Not authorized for this group" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMemberToGroup = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isCreator = group.createdBy.toString() === currentUserId.toString();
    if (!isCreator) {
      return res
        .status(403)
        .json({ error: "Only the creator can add members" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyMember = group.members.some(
      (memberId) => memberId.toString() === userId
    );
    if (!alreadyMember) {
      group.members.push(userId);
      await group.save();
    }

    const populatedGroup = await Group.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json(populatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isCreator = group.createdBy.toString() === currentUserId.toString();
    if (!isCreator) {
      return res
        .status(403)
        .json({ error: "Only the creator can remove members" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.params.userId
    );
    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json(populatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isCreator = group.createdBy.toString() === currentUserId.toString();
    if (!isCreator) {
      return res.status(403).json({ error: "Only the creator can delete" });
    }

    // Cascade delete: remove all related data
    await Promise.all([
      Expense.deleteMany({ groupId: req.params.id }),
      Balance.deleteMany({ groupId: req.params.id }),
      SettlementRequest.deleteMany({ groupId: req.params.id }),
      Settlement.deleteMany({ groupId: req.params.id }),
      SettledExpense.deleteMany({ groupId: req.params.id }),
      Group.findByIdAndDelete(req.params.id),
    ]);

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
