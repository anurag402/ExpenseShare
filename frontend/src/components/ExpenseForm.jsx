import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ExpenseForm({
  group,
  users,
  currentUser,
  onAddExpense,
}) {
  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState([]);
  const [splitError, setSplitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paidBy: currentUser,
    },
  });

  const amountValue = parseFloat(watch("amount")) || 0;

  const groupMembers = users.filter((u) => group.members.includes(u.id));

  useEffect(() => {
    if (splitType === "exact" || splitType === "percentage") {
      setSplits(
        groupMembers.map((member) => ({
          userId: member.id,
          amount: splitType === "exact" ? "" : "",
          percentage: splitType === "percentage" ? "" : undefined,
        }))
      );
    }
  }, [splitType, group]);

  useEffect(() => {
    reset((prev) => ({ ...prev, paidBy: currentUser }));
  }, [currentUser, reset]);

  const onSubmit = (data) => {
    const amountValue = parseFloat(data.amount);

    // Validate amount
    if (isNaN(amountValue) || amountValue <= 0) {
      setSplitError("Amount must be a positive number");
      return;
    }

    const memberIds = groupMembers.map((m) => m.id);

    const expenseData = {
      groupId: group.id,
      description: data.description.trim(),
      amount: amountValue,
      paidBy: data.paidBy,
      splitType: splitType,
      splits: [],
    };

    if (splitType === "equal") {
      if (memberIds.length === 0) {
        setSplitError("Group must have at least one member");
        return;
      }
      const share = amountValue / memberIds.length;
      expenseData.splits = memberIds.map((id) => ({
        userId: id,
        amount: share,
      }));
    } else if (splitType === "exact") {
      // Validate all split amounts
      const splitAmounts = splits.map((s) => {
        const amt = parseFloat(s.amount);
        if (isNaN(amt)) return { userId: s.userId, amount: 0 };
        if (amt < 0) {
          setSplitError("Split amounts cannot be negative");
          return null;
        }
        return { userId: s.userId, amount: amt };
      });

      if (splitAmounts.includes(null)) return; // Had negative value

      const validSplits = splitAmounts.filter((s) => s.amount > 0);

      if (validSplits.length === 0) {
        setSplitError("At least one person must have a split amount");
        return;
      }

      const totalSplit = validSplits.reduce((sum, s) => sum + s.amount, 0);

      if (totalSplit > amountValue + 0.01) {
        setSplitError(
          `Total split (₹${totalSplit.toFixed(
            2
          )}) exceeds amount (₹${amountValue.toFixed(2)})`
        );
        return;
      }

      if (totalSplit < amountValue - 0.01) {
        setSplitError(
          `Total split (₹${totalSplit.toFixed(
            2
          )}) is less than amount (₹${amountValue.toFixed(2)})`
        );
        return;
      }

      expenseData.splits = validSplits;
    } else if (splitType === "percentage") {
      // Validate all percentages
      const percentages = splits.map((s) => {
        const perc = parseFloat(s.percentage);
        if (isNaN(perc)) return { userId: s.userId, percentage: 0 };
        if (perc < 0) {
          setSplitError("Percentages cannot be negative");
          return null;
        }
        if (perc > 100) {
          setSplitError("Individual percentage cannot exceed 100%");
          return null;
        }
        return { userId: s.userId, percentage: perc };
      });

      if (percentages.includes(null)) return; // Had invalid value

      const totalPerc = percentages.reduce((sum, s) => sum + s.percentage, 0);

      if (totalPerc > 100 + 0.01) {
        setSplitError(
          `Total percentage (${totalPerc.toFixed(1)}%) exceeds 100%`
        );
        return;
      }

      if (totalPerc < 100 - 0.01) {
        setSplitError(
          `Total percentage (${totalPerc.toFixed(1)}%) is less than 100%`
        );
        return;
      }

      if (totalPerc === 0) {
        setSplitError("At least one person must have a percentage");
        return;
      }

      const validSplits = percentages.filter((s) => s.percentage > 0);

      if (validSplits.length === 0) {
        setSplitError("At least one person must have a percentage");
        return;
      }

      // Send percentage values to backend, not calculated amounts
      expenseData.splits = validSplits;
    }

    setSplitError("");
    onAddExpense(expenseData);
    reset();
    setSplitType("equal");
  };

  const updateSplit = (userId, field, value) => {
    setSplitError(""); // Clear error when user updates
    setSplits(
      splits.map((split) =>
        split.userId === userId ? { ...split, [field]: value } : split
      )
    );
  };

  // Calculate total split for display
  const calculateTotalSplit = () => {
    if (splitType === "exact") {
      return splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    } else if (splitType === "percentage") {
      return splits.reduce(
        (sum, s) => sum + (parseFloat(s.percentage) || 0),
        0
      );
    }
    return 0;
  };

  const totalSplit = calculateTotalSplit();
  const hasExactError =
    splitType === "exact" &&
    amountValue > 0 &&
    Math.abs(totalSplit - amountValue) > 0.01;
  const hasPercentError =
    splitType === "percentage" &&
    totalSplit > 0 &&
    Math.abs(totalSplit - 100) > 0.01;

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">
            Description
          </label>
          <input
            type="text"
            placeholder="e.g., Dinner at restaurant"
            {...register("description", {
              required: "Description is required",
            })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.description && (
            <p className="text-xs text-red-300 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register("amount", {
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
              validate: (value) => {
                const num = parseFloat(value);
                if (isNaN(num)) return "Please enter a valid number";
                if (num <= 0) return "Amount must be greater than 0";
                if (num > 10000000) return "Amount is too large";
                return true;
              },
            })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent no-spinners"
          />
          {errors.amount && (
            <p className="text-xs text-red-300 mt-1">{errors.amount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">
            Paid By
          </label>
          <select
            {...register("paidBy", { required: "Please select who paid" })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            {groupMembers.map((user) => (
              <option
                key={user.id}
                value={user.id}
                className="bg-slate-800 text-white"
              >
                {user.name}
              </option>
            ))}
          </select>
          {errors.paidBy && (
            <p className="text-xs text-red-300 mt-1">{errors.paidBy.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-1">
            Split Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "equal", label: "Equal" },
              { key: "exact", label: "Exact" },
              { key: "percentage", label: "Percent" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSplitType(opt.key)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  splitType === opt.key
                    ? "bg-blue-500/20 border-blue-500/30 text-blue-300 shadow-lg"
                    : "bg-white/10 text-gray-200 border-white/10 hover:bg-white/15"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            <span className="text-gray-300 font-medium">Equal</span> divides
            evenly • <span className="text-gray-300 font-medium">Exact</span>{" "}
            sets amounts •{" "}
            <span className="text-gray-300 font-medium">Percent</span> assigns
            shares
          </p>
        </div>
      </div>

      {splitType === "exact" && (
        <div
          className={`border rounded-xl p-4 bg-white/5 ${
            hasExactError ? "border-red-500/50" : "border-white/15"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">Exact Amounts</h4>
            <div className="text-right">
              <span
                className={`text-xs font-semibold ${
                  hasExactError
                    ? "text-red-400"
                    : totalSplit === amountValue
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                Total: ₹{totalSplit.toFixed(2)} / ₹{amountValue.toFixed(2)}
              </span>
            </div>
          </div>
          {hasExactError && (
            <p className="text-xs text-red-300 mb-2 flex items-center gap-1">
              <FaExclamationTriangle /> Total split must equal the expense
              amount!
            </p>
          )}
          <div className="space-y-2">
            {splits.map((split) => {
              const user = users.find((u) => u.id === split.userId);
              return (
                <div
                  key={split.userId}
                  className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                >
                  <span className="flex-1 text-white text-sm font-semibold">
                    {user?.name}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={split.amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseFloat(val);
                      if (val === "" || (!isNaN(num) && num >= 0)) {
                        updateSplit(split.userId, "amount", val);
                      }
                    }}
                    className="w-28 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {splitType === "percentage" && (
        <div
          className={`border rounded-xl p-4 bg-white/5 ${
            hasPercentError ? "border-red-500/50" : "border-white/15"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">Percentage Split</h4>
            <span
              className={`text-xs font-semibold ${
                hasPercentError
                  ? "text-red-400"
                  : totalSplit === 100
                  ? "text-green-400"
                  : "text-gray-300"
              }`}
            >
              Total: {totalSplit.toFixed(1)}%
            </span>
          </div>
          {hasPercentError && (
            <p className="text-xs text-red-300 mb-2 flex items-center gap-1">
              <FaExclamationTriangle /> Total percentage must equal 100%!
            </p>
          )}
          <div className="space-y-2">
            {splits.map((split) => {
              const user = users.find((u) => u.id === split.userId);
              return (
                <div
                  key={split.userId}
                  className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                >
                  <span className="flex-1 text-white text-sm font-semibold">
                    {user?.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={split.percentage}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = parseFloat(val);
                        if (
                          val === "" ||
                          (!isNaN(num) && num >= 0 && num <= 100)
                        ) {
                          updateSplit(split.userId, "percentage", val);
                        }
                      }}
                      className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-300 text-sm">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {splitError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <FaExclamationTriangle /> {splitError}
          </p>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={hasExactError || hasPercentError}
        className={`w-full py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${
          hasExactError || hasPercentError
            ? "bg-gray-600/20 border border-gray-600/30 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 hover:border-green-400/50"
        }`}
      >
        Add Expense
      </motion.button>
    </motion.form>
  );
}
