import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import BalanceView from "../components/BalanceView";
import * as api from "../api";
import { SkeletonBalance } from "../components/Skeleton";

export default function BalancesPage({
  currentUser,
  userBalances,
  onRefreshBalances,
}) {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadRequests();
    }
  }, [currentUser]);

  // Sort incoming requests by amount (highest first)
  const sortedIncomingRequests = [...incomingRequests].sort((a, b) => b.amount - a.amount);
  const sortedOutgoingRequests = [...outgoingRequests].sort((a, b) => b.amount - a.amount);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [incoming, outgoing] = await Promise.all([
        api.getSettlementRequests("incoming"),
        api.getSettlementRequests("outgoing"),
      ]);
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
    } catch (error) {
      toast.error(error.message || "Failed to load settlement requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSettle = async (toUserId, amount, groupId) => {
    try {
      await api.requestSettlement(currentUser, toUserId, amount, groupId);
      toast.success("Settlement request sent for approval");
      await loadRequests();
    } catch (error) {
      toast.error(error.message || "Failed to send request");
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await api.respondSettlementRequest(requestId, action);
      toast.success(
        action === "approve" ? "Settlement approved" : "Settlement rejected"
      );
      await loadRequests();
      await onRefreshBalances?.();
    } catch (error) {
      toast.error(error.message || "Failed to update request");
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Balances</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Please select a user to view balances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Your Balances
        </h1>
        {userBalances && (
          <BalanceView balances={userBalances} onSettle={handleRequestSettle} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              Incoming Requests
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBalance />
              <SkeletonBalance />
            </div>
          ) : incomingRequests.length === 0 ? (
            <p className="text-sm text-gray-300">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {sortedIncomingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {req.fromUserId?.name || "User"} wants to settle
                      </p>
                      <p className="text-xs text-gray-300">
                        Amount: ₹{Number(req.amount || 0).toFixed(2)}
                        {req.groupId?.name ? ` • ${req.groupId.name}` : ""}
                      </p>
                    </div>
                    <span className="text-xs uppercase text-yellow-300 font-semibold">
                      {req.status}
                    </span>
                  </div>
                  {req.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleRespond(req._id, "approve")}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-semibold hover:bg-green-500/30 hover:border-green-400/50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, "reject")}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/30 hover:border-red-400/50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              Outgoing Requests
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBalance />
              <SkeletonBalance />
            </div>
          ) : outgoingRequests.length === 0 ? (
            <p className="text-sm text-gray-300">No outgoing requests</p>
          ) : (
            <div className="space-y-3">
              {sortedOutgoingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Sent to {req.toUserId?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-300">
                        Amount: ₹{Number(req.amount || 0).toFixed(2)}
                        {req.groupId?.name ? ` • ${req.groupId.name}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs uppercase font-semibold ${
                        req.status === "approved"
                          ? "text-green-300"
                          : req.status === "rejected"
                          ? "text-red-300"
                          : "text-yellow-300"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
