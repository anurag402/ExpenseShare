import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaUserCircle,
  FaStickyNote,
  FaTrash,
  FaFileAlt,
} from "react-icons/fa";

export default function ExpenseList({
  expenses,
  users,
  onDeleteExpense,
  currentUser,
}) {
  return (
    <div className="space-y-3">
      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No expenses yet</p>
        </div>
      ) : (
        expenses.map((expense) => {
          const payer = users.find((u) => u.id === expense.paidBy);
          const isCreator = expense.paidBy === currentUser;

          // Calculate user's balance for this expense
          const userSplit = expense.splits.find(s => s.userId === currentUser);
          const userSplitAmount = userSplit ? userSplit.amount : 0;

          let userBalance = 0;
          let balanceColor = "text-gray-400";

          if (isCreator) {
            // User paid, so they are owed (total - their split)
            userBalance = expense.amount - userSplitAmount;
            balanceColor = userBalance > 0 ? "text-green-400" : "text-gray-400";
          } else {
            // User didn't pay, so they owe their split
            userBalance = -userSplitAmount;
            balanceColor = userBalance < 0 ? "text-red-400" : "text-gray-400";
          }

          return (
            <motion.div
              key={expense.id}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg bg-white/5 border border-white/10 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <FaStickyNote className="text-blue-400 text-sm" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {expense.description}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FaUserCircle className="text-gray-500" />
                      <span>Paid by {payer?.name || "Unknown"}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                        Split type: {expense.splitType.charAt(0).toUpperCase() + expense.splitType.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-2">
                        {userBalance !== 0 && (
                          <span className="text-xs text-gray-400">
                            {userBalance > 0 ? 'You are owed' : 'You owe'}
                          </span>
                        )}
                        <p className={`text-lg font-bold ${balanceColor}`}>
                          ₹{Math.abs(userBalance).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Total: ₹{expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {onDeleteExpense && isCreator && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                      title="Delete expense (Creator only)"
                    >
                      <FaTrash className="text-sm" />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-2 font-semibold">
                  Split breakdown:
                </p>
                <div className="space-y-1.5">
                  {expense.splits.map((split) => {
                    const user = users.find((u) => u.id === split.userId);
                    return (
                      <div
                        key={split.userId}
                        className="flex items-center justify-between text-xs p-2 rounded bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <FaUserCircle className="text-gray-500" />
                          <span className="text-gray-300">
                            {user?.name || "Unknown"}
                          </span>
                        </div>
                        <span className="font-semibold text-white">
                          ₹{split.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
