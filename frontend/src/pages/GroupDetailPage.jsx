import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaUsers,
  FaPlus,
  FaUserPlus,
  FaUserMinus,
  FaBalanceScaleRight,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BalanceView from "../components/BalanceView";
import * as api from "../api";
import { SkeletonCard, SkeletonStat } from "../components/Skeleton";

export default function GroupDetailPage({
  users,
  currentUser,
  onLoadBalances,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadGroup(), loadExpenses(), loadBalances()]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const loadGroup = async () => {
    try {
      const data = await api.getGroup(id);
      setGroup(data);
    } catch (error) {
      console.error("Error loading group:", error);
      toast.error("Failed to load group");
      navigate("/groups");
    }
  };

  const loadExpenses = async () => {
    try {
      const data = await api.getGroupExpenses(id);
      // Sort expenses by date (newest first)
      const sortedExpenses = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error("Error loading expenses:", error);
      toast.error("Failed to load expenses");
    }
  };

  const loadBalances = async () => {
    try {
      const data = await api.getGroupBalances(id);
      setBalances(data);
    } catch (error) {
      console.error("Error loading balances:", error);
      toast.error("Failed to load balances");
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await api.createExpense(expenseData);
      await loadExpenses();
      await loadBalances();
      if (currentUser) {
        onLoadBalances();
      }
      toast.success("Expense added");
    } catch (error) {
      toast.error(error.message || "Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    try {
      await api.deleteExpense(expenseId);
      await loadExpenses();
      await loadBalances();
      if (currentUser) {
        onLoadBalances();
      }
      toast.success("Expense deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const handleAddMember = async () => {
    if (selectedMemberIds.length === 0) {
      toast.warn("Please select at least one member");
      return;
    }
    try {
      // Add members one by one
      for (const userId of selectedMemberIds) {
        await api.addMemberToGroup(id, userId);
      }
      await loadGroup();
      setSelectedMemberIds([]);
      setShowAddMember(false);
      toast.success(`${selectedMemberIds.length} member(s) added successfully`);
    } catch (error) {
      toast.error(error.message || "Failed to add members");
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMemberIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSettle = async (toUserId, amount) => {
    if (!currentUser) {
      toast.warn("Please select a user first");
      return;
    }
    try {
      await api.requestSettlement(currentUser, toUserId, amount, id);
      toast.success("Settlement request sent for approval");
    } catch (error) {
      toast.error(error.message || "Failed to send settlement request");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (
      !confirm("Are you sure you want to remove this member from the group?")
    ) {
      return;
    }
    try {
      await api.removeMemberFromGroup(id, memberId);
      await loadGroup();
      toast.info("Member removed");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    }
  };

  if (loading || !group) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-32"></div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-6 bg-white/20 rounded w-48"></div>
                <div className="h-3 bg-white/15 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Get available users not in the group
  const availableUsers = users.filter(
    (user) => !(group.members || []).includes(user.id)
  );

  const totalExpenseAmount = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  // Calculate net balance for current user only
  const userOwes = balances
    .filter(b => b.fromUser.id === currentUser)
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);
  
  const userOwed = balances
    .filter(b => b.toUser.id === currentUser)
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);
  
  const netBalance = userOwed - userOwes;
  
  const owesLabel =
    netBalance < 0 ? "You owe" : netBalance > 0 ? "You are owed" : "Settled";
  const netColor =
    netBalance > 0
      ? "text-green-300"
      : netBalance < 0
      ? "text-red-300"
      : "text-blue-200";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      <motion.div
        variants={cardVariants}
        className="p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/groups"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition font-semibold"
            >
              <FaArrowLeft /> Back to Groups
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{group.name}</h1>
                <p className="text-gray-300">
                  {group.members.length} members • Created by{" "}
                  {users.find((u) => u.id === group.createdBy)?.name || "User"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white flex items-center gap-2">
              <FaBalanceScaleRight />
              <span className="text-sm font-semibold">Balances synced</span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition font-semibold"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              disabled={availableUsers.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all border ${
                availableUsers.length === 0
                  ? "bg-white/10 text-gray-400 border-white/10 cursor-not-allowed"
                  : "bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50"
              }`}
              title={
                availableUsers.length === 0
                  ? "All users are already members"
                  : ""
              }
            >
              {showAddMember ? <FaUserMinus /> : <FaUserPlus />}
              {showAddMember ? "Cancel" : "Add Member"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
            <p className="text-sm text-gray-300">Total Expenses</p>
            <p className="text-2xl font-bold">
              ₹{totalExpenseAmount.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
            <p className="text-sm text-gray-300">Recent Expenses</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white">
            <p className="text-sm text-gray-300">Net Position</p>
            <p className={`text-2xl font-bold ${netColor}`}>
              {owesLabel}: ₹{Math.abs(netBalance).toFixed(2)}
            </p>
          </div>
        </div>

        {showAddMember && availableUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm"
          >
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <FaUserPlus className="text-blue-400" />
                Select Members to Add
              </h4>
              <p className="text-sm text-gray-400">
                {selectedMemberIds.length > 0 
                  ? `${selectedMemberIds.length} member(s) selected`
                  : "Click on users below to select them"}
              </p>
            </div>
            
            {/* Search Input */}
            <div className="mb-4 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* User List - Single Column */}
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto overflow-x-visible px-2 mb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {availableUsers
                .filter(user => 
                  user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  user.email.toLowerCase().includes(memberSearch.toLowerCase())
                )
                .map((user) => {
                const isSelected = selectedMemberIds.includes(user.id);
                return (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleMemberSelection(user.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-white/30'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {user.name} <span className="text-xs text-gray-400 font-normal">({user.email})</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMember}
                disabled={selectedMemberIds.length === 0}
                className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all ${
                  selectedMemberIds.length > 0
                    ? 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 hover:border-green-400/50'
                    : 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ''}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedMemberIds([]);
                  setMemberSearch("");
                }}
                className="px-5 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 font-semibold hover:bg-red-500/30 hover:border-red-400/50 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {group.members.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaUsers /> Members
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.members.map((memberId) => {
                const member = users.find((u) => u.id === memberId);
                return member ? (
                  <motion.div
                    key={memberId}
                    whileHover={{ scale: 1.03 }}
                    className="px-3 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2"
                  >
                    <span className="font-semibold">{member.name}</span>
                    {memberId === group.createdBy && (
                      <span className="text-xs text-blue-300">Creator</span>
                    )}
                    {memberId !== group.createdBy && (
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        className="text-red-300 hover:text-red-200"
                        title="Remove member"
                      >
                        <FaUserMinus />
                      </button>
                    )}
                  </motion.div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardVariants} className="h-full">
          <div className="p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl h-full relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/10 pointer-events-none"
            />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200">
                    <FaPlus />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Add Expense
                    </h2>
                    <p className="text-sm text-gray-300">
                      Log a purchase and split it with the group
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 px-3 py-2.5 flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div className="text-gray-200">
                    <p className="font-semibold">Select Payer</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Who paid the expense</p>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 px-3 py-2.5 flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div className="text-gray-200">
                    <p className="font-semibold">Enter Details</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Amount & description</p>
                  </div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-400/20 px-3 py-2.5 flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <div className="text-gray-200">
                    <p className="font-semibold">Choose Split Type</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Equal, exact, or percentage</p>
                  </div>
                </div>
              </div>

              <ExpenseForm
                group={group}
                users={users}
                currentUser={currentUser}
                onAddExpense={handleAddExpense}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="space-y-6">
          <div className="p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3">
              Recent Expenses
            </h2>
            {expenses.length === 0 ? (
              <div className="text-gray-300 text-sm py-4">
                No expenses yet. Add one to get started.
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <ExpenseList
                  expenses={expenses}
                  users={users}
                  onDeleteExpense={handleDeleteExpense}
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>
          <div className="p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3">Balances</h2>
            {balances.length === 0 ? (
              <div className="text-gray-300 text-sm py-4">
                No balances yet. Add expenses to see splits.
              </div>
            ) : (
              <BalanceView 
                balances={currentUser ? {
                  owes: balances.filter(b => b.fromUser.id === currentUser).map(b => ({
                    toUser: b.toUser,
                    amount: b.amount,
                    groupId: id,
                    updatedAt: b.updatedAt
                  })),
                  owed: balances.filter(b => b.toUser.id === currentUser).map(b => ({
                    fromUser: b.fromUser,
                    amount: b.amount,
                    groupId: id,
                    updatedAt: b.updatedAt
                  }))
                } : balances} 
                onSettle={handleSettle} 
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
