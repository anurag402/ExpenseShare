import { motion } from "framer-motion";

export const SkeletonCard = ({ className = "" }) => (
  <div
    className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 ${className}`}
  >
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-white/20 rounded w-3/4"></div>
      <div className="h-3 bg-white/15 rounded w-1/2"></div>
      <div className="h-3 bg-white/15 rounded w-2/3"></div>
    </div>
  </div>
);

export const SkeletonStat = ({ className = "" }) => (
  <div
    className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 ${className}`}
  >
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-white/20 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-white/20 rounded-lg"></div>
      </div>
      <div className="h-8 bg-white/20 rounded w-1/2"></div>
      <div className="h-2 bg-white/15 rounded w-2/3"></div>
    </div>
  </div>
);

export const SkeletonBalance = ({ className = "" }) => (
  <div
    className={`p-3 rounded-lg bg-white/10 border border-white/20 ${className}`}
  >
    <div className="animate-pulse space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-white/20 rounded-full"></div>
          <div className="h-3 bg-white/20 rounded w-24"></div>
        </div>
        <div className="h-4 bg-white/20 rounded w-16"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-white/15 rounded-full w-20"></div>
        <div className="h-5 bg-white/15 rounded-full w-16"></div>
      </div>
    </div>
  </div>
);

export const SkeletonExpense = ({ className = "" }) => (
  <div
    className={`p-4 rounded-lg bg-white/5 border border-white/10 ${className}`}
  >
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-white/20 rounded w-1/3"></div>
        <div className="h-5 bg-white/20 rounded w-20"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 bg-white/15 rounded w-1/4"></div>
        <div className="h-3 bg-white/15 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const SkeletonGroup = ({ className = "" }) => (
  <div
    className={`p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 ${className}`}
  >
    <div className="animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-white/20 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded w-32"></div>
            <div className="h-2 bg-white/15 rounded w-20"></div>
          </div>
        </div>
        <div className="h-8 w-8 bg-white/20 rounded-lg"></div>
      </div>
      <div className="space-y-2 border-t border-white/10 pt-3">
        <div className="h-2 bg-white/15 rounded w-full"></div>
        <div className="h-2 bg-white/15 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3, type = "card" }) => {
  const SkeletonComponent =
    {
      card: SkeletonCard,
      stat: SkeletonStat,
      balance: SkeletonBalance,
      expense: SkeletonExpense,
      group: SkeletonGroup,
    }[type] || SkeletonCard;

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

export const SkeletonGrid = ({ count = 6, type = "card", cols = 3 }) => {
  const SkeletonComponent =
    {
      card: SkeletonCard,
      stat: SkeletonStat,
      balance: SkeletonBalance,
      expense: SkeletonExpense,
      group: SkeletonGroup,
    }[type] || SkeletonCard;

  const colsClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[cols] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${colsClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
    <div className="animate-pulse space-y-3">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-white/20">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-white/20 rounded"></div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-4 gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="h-3 bg-white/15 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
