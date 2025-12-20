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
    <div className="space-y-4">
      {balances.length === 0 ? (
        <div className="text-center py-8">
          <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-2" />
          <p className="text-gray-300 text-sm">All settled up! 🎉</p>
        </div>
      ) : (
        <>
          {/* Table Header - Desktop Only */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-3">
            <div className="col-span-4 text-xs font-semibold text-blue-300 uppercase tracking-widest">
              Payer
            </div>
            <div className="col-span-1 flex items-center justify-center text-gray-400">
              →
            </div>
            <div className="col-span-4 text-xs font-semibold text-green-300 uppercase tracking-widest">
              Receiver
            </div>
            <div className="col-span-3 text-right text-xs font-semibold text-yellow-300 uppercase tracking-widest">
              Amount
            </div>
          </div>

          {/* Balance List */}
          <div className="space-y-3">
            {balances.map((balance, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-gradient-to-r from-slate-800/40 via-slate-800/30 to-slate-800/40 border border-slate-700/50 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  {/* From User */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <FaUserCircle className="text-blue-400 text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {balance.fromUser.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {balance.fromUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 flex justify-center">
                    <span className="text-2xl text-gray-500">→</span>
                  </div>

                  {/* To User */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                      <FaUserCircle className="text-green-400 text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {balance.toUser.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {balance.toUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-3 text-right">
                    <p className="text-xl font-bold text-yellow-400">
                      ₹{balance.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Pending</p>
                  </div>
                </div>

                {/* Mobile/Tablet Layout */}
                <div className="lg:hidden space-y-3">
                  {/* From Section */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <FaUserCircle className="text-blue-400 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Owes
                      </p>
                      <p className="text-white font-semibold">
                        {balance.fromUser.name}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Mobile */}
                  <div className="flex justify-center">
                    <span className="text-gray-500">↓</span>
                  </div>

                  {/* To Section */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                    <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                      <FaUserCircle className="text-green-400 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        To
                      </p>
                      <p className="text-white font-semibold">
                        {balance.toUser.name}
                      </p>
                    </div>
                  </div>

                  {/* Amount Mobile */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Amount
                    </span>
                    <span className="text-lg font-bold text-yellow-400">
                      ₹{balance.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
