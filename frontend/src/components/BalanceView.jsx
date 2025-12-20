import { motion } from "framer-motion";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaUserCircle,
  FaUsers,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function BalanceView({ balances, onSettle }) {
  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (
    !balances ||
    (balances.length === 0 && !balances.owes && !balances.owed)
  ) {
    return (
      <div className="text-center py-6">
        <FaMoneyBillWave className="text-4xl text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No balances to show</p>
      </div>
    );
  }

  // User-specific balances
  if (balances.owes || balances.owed) {
    return (
      <div className="space-y-4">
        {balances.owed && balances.owed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaArrowDown className="text-green-400" />
              <h4 className="font-semibold text-white text-sm">You are owed</h4>
            </div>
            <div className="space-y-2">
              {balances.owed.map((balance, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaUserCircle className="text-green-400 text-lg" />
                      <span className="text-white text-sm font-medium">
                        {balance.fromUser.name}
                      </span>
                    </div>
                    <span className="font-bold text-green-400">
                      ₹{balance.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-200">
                    {balance.groupName && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/10">
                        <FaUsers className="text-indigo-200" />
                        <span>{balance.groupName}</span>
                      </span>
                    )}
                    {formatDate(balance.updatedAt) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        <FaClock className="text-gray-200" />
                        <span>{formatDate(balance.updatedAt)}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {balances.owes && balances.owes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaArrowUp className="text-red-400" />
              <h4 className="font-semibold text-white text-sm">You owe</h4>
            </div>
            <div className="space-y-2">
              {balances.owes.map((balance, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaUserCircle className="text-red-400 text-lg" />
                      <span className="text-white text-sm font-medium">
                        {balance.toUser.name}
                      </span>
                    </div>
                    <span className="font-bold text-red-400">
                      ₹{balance.amount.toFixed(2)}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      onSettle(
                        balance.toUser.id,
                        balance.amount,
                        balance.groupId
                      )
                    }
                    className="w-full px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
                  >
                    Settle Up
                  </motion.button>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-200">
                    {balance.groupName && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/10">
                        <FaUsers className="text-indigo-200" />
                        <span>{balance.groupName}</span>
                      </span>
                    )}
                    {formatDate(balance.updatedAt) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        <FaClock className="text-gray-200" />
                        <span>{formatDate(balance.updatedAt)}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {(!balances.owes || balances.owes.length === 0) &&
          (!balances.owed || balances.owed.length === 0) && (
            <div className="text-center py-6">
              <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-2" />
              <p className="text-gray-300 text-sm">All settled up!</p>
            </div>
          )}
      </div>
    );
  }

  // Group balances
  return (
    <div className="space-y-3">
      {balances.length === 0 ? (
        <div className="text-center py-6">
          <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-2" />
          <p className="text-gray-300 text-sm">All settled up! 🎉</p>
        </div>
      ) : (
        balances.map((balance, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FaUserCircle className="text-blue-400" />
                <span className="text-white font-medium">
                  {balance.fromUser.name}
                </span>
                <span className="text-gray-400">→</span>
                <FaUserCircle className="text-green-400" />
                <span className="text-white font-medium">
                  {balance.toUser.name}
                </span>
              </div>
              <span className="font-bold text-white">
                ₹{balance.amount.toFixed(2)}
              </span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
