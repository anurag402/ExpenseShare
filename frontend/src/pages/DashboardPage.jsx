import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaReceipt,
  FaEdit,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as api from "../api";
import {
  SkeletonStat,
  SkeletonCard,
  SkeletonGrid,
} from "../components/Skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function DashboardPage({ currentUser, users }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [userBalances, setUserBalances] = useState(null);
  const [settledExpenses, setSettledExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsData, balancesData] = await Promise.all([
        api.getGroups(),
        api.getUserBalances(currentUser),
      ]);
      // Sort groups alphabetically
      const sortedGroups = (groupsData || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setGroups(sortedGroups);
      setUserBalances(balancesData);

      // Load settled expenses separately with error handling
      try {
        const settledData = await api.getSettledExpenses(currentUser);
        setSettledExpenses(settledData || []);
      } catch (settledError) {
        setSettledExpenses([]);
      }

      if (groupsData && groupsData.length > 0) {
        const allExpenses = [];
        for (const group of groupsData) {
          try {
            const groupExpenses = await api.getGroupExpenses(group.id);
            // Add group name and id to each expense
            const expensesWithGroupName = (groupExpenses || []).map(
              (expense) => ({
                ...expense,
                groupName: group.name,
                groupId: group.id,
              })
            );
            allExpenses.push(...expensesWithGroupName);
          } catch (expError) {
            // Continue loading other groups
          }
        }
        // Sort by date (newest first) and show only 5 most recent
        allExpenses.sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        setExpenses(allExpenses.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Only show toast if it's a critical error
      if (error.message && !error.message.includes("404")) {
        toast.error(error.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, loadDashboardData]);

  const currentUserData = users.find((u) => u.id === currentUser);
  // Sort balances by amount (highest first)
  if (userBalances?.owes) {
    userBalances.owes.sort((a, b) => b.amount - a.amount);
  }
  if (userBalances?.owed) {
    userBalances.owed.sort((a, b) => b.amount - a.amount);
  }

  const totalOwed = userBalances?.totalOwed || 0;
  const totalToPay = userBalances?.totalToPay || 0;

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-white/20 rounded w-2/3"></div>
            <div className="h-4 bg-white/15 rounded w-1/3"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>

        {/* Balances Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Groups Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={cardVariants} className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {currentUserData?.name}!
        </h1>
        <p className="text-gray-300">Here's a summary of your expenses</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total Owed */}
        <motion.div
          variants={cardVariants}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-semibold">You are Owed</h3>
            <motion.div
              className="p-3 rounded-lg bg-green-500/20"
              whileHover={{ scale: 1.1 }}
            >
              <FaArrowDown className="text-green-400 text-xl" />
            </motion.div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">
            ₹{totalOwed.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">People owe you money</p>
        </motion.div>

        {/* Total to Pay */}
        <motion.div
          variants={cardVariants}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-semibold">You Owe</h3>
            <motion.div
              className="p-3 rounded-lg bg-red-500/20"
              whileHover={{ scale: 1.1 }}
            >
              <FaArrowUp className="text-red-400 text-xl" />
            </motion.div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">
            ₹{totalToPay.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">You need to pay</p>
        </motion.div>

        {/* Active Groups */}
        <motion.div
          variants={cardVariants}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-semibold">Active Groups</h3>
            <motion.div
              className="p-3 rounded-lg bg-blue-500/20"
              whileHover={{ scale: 1.1 }}
            >
              <FaUsers className="text-blue-400 text-xl" />
            </motion.div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{groups.length}</p>
          <p className="text-sm text-gray-400">Groups you're part of</p>
        </motion.div>
      </motion.div>

      {/* Who Owes Whom Section */}
      {userBalances &&
        (userBalances.owes?.length > 0 || userBalances.owed?.length > 0) && (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* People who owe you */}
            {userBalances.owed && userBalances.owed.length > 0 && (
              <motion.div
                variants={cardVariants}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaArrowDown className="text-green-400" />
                  People Who Owe You
                </h2>
                <div
                  className="space-y-3 max-h-[400px] px-2 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {userBalances.owed.map((balance, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.015 }}
                      onClick={() =>
                        balance.groupId &&
                        navigate(`/groups/${balance.groupId}`)
                      }
                      className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">
                            {balance.fromUser.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-400">owes you</p>
                        </div>
                        <span className="text-2xl font-bold text-green-400">
                          ₹{balance.amount.toFixed(2)}
                        </span>
                      </div>
                      {balance.groupName && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-300 mt-2">
                          <FaUsers className="text-indigo-300" />
                          <span className="px-2 py-0.5 rounded-full bg-white/10">
                            {balance.groupName}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* People you owe */}
            {userBalances.owes && userBalances.owes.length > 0 && (
              <motion.div
                variants={cardVariants}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaArrowUp className="text-red-400" />
                  People You Owe
                </h2>
                <div
                  className="space-y-3 max-h-[400px] px-2 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {userBalances.owes.map((balance, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() =>
                        balance.groupId &&
                        navigate(`/groups/${balance.groupId}`)
                      }
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">
                            {balance.toUser.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-400">you owe</p>
                        </div>
                        <span className="text-2xl font-bold text-red-400">
                          ₹{balance.amount.toFixed(2)}
                        </span>
                      </div>
                      {balance.groupName && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-300 mt-2">
                          <FaUsers className="text-indigo-300" />
                          <span className="px-2 py-0.5 rounded-full bg-white/10">
                            {balance.groupName}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

      {/* Recent Groups & Actions */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Groups */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Groups</h2>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/groups"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
              >
                <FaPlus size={16} /> New Group
              </Link>
            </motion.div>
          </div>

          {groups.length > 0 ? (
            <div
              className="space-y-3 max-h-[400px] px-2 overflow-y-auto overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ x: 5 }}
                  className="p-5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20"
                >
                  <Link to={`/groups/${group.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {group.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {group.members?.length || 0} members
                        </p>
                      </div>
                      <span className="text-blue-400 font-semibold">
                        View →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUsers className="text-4xl text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No groups yet</p>
              <Link
                to="/groups"
                className="inline-block mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
              >
                Create First Group
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={cardVariants}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/groups"
                className="flex items-center justify-center gap-2 w-full p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
              >
                <FaPlus /> Create Group
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/balances"
                className="flex items-center justify-center gap-2 w-full p-4 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold hover:bg-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                <FaWallet /> View Balances
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/groups"
                className="flex items-center justify-center gap-2 w-full p-4 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-300 font-semibold hover:bg-pink-500/30 hover:border-pink-400/50 transition-all"
              >
                <FaReceipt /> Add Expense
              </Link>
            </motion.div>
          </div>

          {/* Net Balance */}
          <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-gray-400 text-sm mb-2">Net Balance</p>
            <p
              className={`text-3xl font-bold ${
                totalOwed - totalToPay >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ₹{(totalOwed - totalToPay).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {totalOwed - totalToPay >= 0
                ? "You are in credit"
                : "You need to pay"}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity & Recently Settled */}
      {(expenses.length > 0 || settledExpenses.length > 0) && (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Expenses */}
          {expenses.length > 0 && (
            <motion.div
              variants={cardVariants}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaClock /> Recent Activity
              </h2>

              <div
                className="space-y-3 max-h-[500px] px-2 overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {expenses.map((expense) => {
                  const isYourExpense = expense.paidBy === currentUser;

                  // Calculate user's balance for this expense
                  const userSplit = expense.splits?.find(
                    (s) => s.userId === currentUser
                  );
                  const userSplitAmount = userSplit ? userSplit.amount : 0;

                  let userBalance = 0;
                  let balanceColor = "text-gray-400";
                  let balanceText = "";

                  if (isYourExpense) {
                    // User paid, so they are owed (total - their split)
                    userBalance = expense.amount - userSplitAmount;
                    balanceColor =
                      userBalance > 0 ? "text-green-400" : "text-gray-400";
                    balanceText = userBalance > 0 ? "You are owed" : "";
                  } else {
                    // User didn't pay, so they owe their split
                    userBalance = -userSplitAmount;
                    balanceColor =
                      userBalance < 0 ? "text-red-400" : "text-gray-400";
                    balanceText = userBalance < 0 ? "You owe" : "";
                  }

                  return (
                    <motion.div
                      key={expense.id}
                      whileHover={{ x: 5 }}
                      onClick={() =>
                        expense.groupId &&
                        navigate(`/groups/${expense.groupId}`)
                      }
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">
                            {expense.description}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {expense.groupName} • Paid by{" "}
                            {expense.paidByName || "Unknown"} •{" "}
                            {new Date(
                              expense.createdAt || expense.date
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {balanceText && (
                            <span className="text-xs text-gray-400">
                              {balanceText}
                            </span>
                          )}
                          <span className={`text-lg font-bold ${balanceColor}`}>
                            ₹{Math.abs(userBalance).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Recently Settled Expenses */}
          {settledExpenses.length > 0 && (
            <motion.div
              variants={cardVariants}
              className="backdrop-blur-md bg-gradient-to-br bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaCheckCircle className="text-green-400" /> Recently Settled
              </h2>
              <p className="text-sm text-green-300 mb-4">
                These expenses were fully settled and archived
              </p>

              <div
                className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {settledExpenses.map((expense) => (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          {expense.description}
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                            Settled
                          </span>
                        </h4>
                        <p className="text-sm text-gray-400">
                          {expense.groupId?.name} •{" "}
                          {new Date(expense.settledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-400">
                        ₹{expense.amount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
