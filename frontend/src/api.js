const API_URL = "https://expenseshare-0sjl.onrender.com/api";

// Helper: handle auth errors
const handleAuthError = (response) => {
  if (response.status === 403 || response.status === 401) {
    console.error("Authentication failed - clearing invalid token");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  }
};

// Helper: auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  if (!token) {
    console.warn("⚠️ No auth token found in localStorage");
  }
  return headers;
};

// Helpers: normalize server responses to client shapes
const normalizeUser = (u) => ({
  id: u._id ?? u.id,
  name: u.name,
  email: u.email,
});

const normalizeGroup = (g) => ({
  id: g._id ?? g.id,
  name: g.name,
  createdBy:
    typeof g.createdBy === "object" && g.createdBy !== null
      ? g.createdBy._id ?? g.createdBy.id
      : g.createdBy,
  members: Array.isArray(g.members)
    ? g.members.map((m) =>
        typeof m === "object" && m !== null ? m._id ?? m.id : m
      )
    : [],
});

const normalizeExpense = (e) => ({
  id: e._id ?? e.id,
  description: e.description,
  amount: e.amount,
  paidBy:
    typeof e.paidBy === "object" && e.paidBy !== null
      ? e.paidBy._id ?? e.paidBy.id
      : e.paidBy,
  paidByName:
    typeof e.paidBy === "object" && e.paidBy !== null
      ? e.paidBy.name
      : undefined,
  splitType: e.splitType,
  splits: Array.isArray(e.splits)
    ? e.splits.map((s) => ({
        userId:
          typeof s.userId === "object" && s.userId !== null
            ? s.userId._id ?? s.userId.id
            : s.userId,
        amount: s.amount,
      }))
    : [],
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

// Transform balances returned by server into view-friendly shapes
const transformUserBalances = (raw) => {
  // raw: array of Balance docs for the user
  const result = { owes: [], owed: [], totalOwed: 0, totalToPay: 0, net: 0 };
  const seenPairs = new Set(); // Track user-other pairs to avoid duplicates

  for (const doc of raw || []) {
    const groupId = doc.groupId?._id ?? doc.groupId?.id ?? doc.groupId; // may be null
    const groupName =
      typeof doc.groupId === "object" && doc.groupId !== null
        ? doc.groupId.name
        : undefined;
    const updatedAt = doc.updatedAt ?? doc.updated_at ?? null;
    for (const b of doc.balances || []) {
      const other = b.otherUserId;
      const otherId =
        typeof other === "object" && other !== null
          ? other._id ?? other.id
          : other;
      const otherName =
        typeof other === "object" && other !== null ? other.name : undefined;

      // Create a unique key for this relationship
      const pairKey = `${otherId}-${groupId || "nogroup"}`;

      // Skip if we've already processed this pair
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);

      if (b.amount > 0) {
        // you owe them
        result.owes.push({
          toUser: { id: otherId, name: otherName },
          amount: b.amount,
          groupId,
          groupName,
          updatedAt,
        });
        result.totalToPay += b.amount;
        result.net -= b.amount;
      } else if (b.amount < 0) {
        // they owe you
        const abs = Math.abs(b.amount);
        result.owed.push({
          fromUser: { id: otherId, name: otherName },
          amount: abs,
          groupId,
          groupName,
          updatedAt,
        });
        result.totalOwed += abs;
        result.net += abs;
      }
    }
  }
  return result;
};

const transformGroupBalances = (raw) => {
  // raw: array of Balance docs for a group
  const entries = [];
  const seenPairs = new Set(); // Track user pairs to avoid duplicates

  for (const doc of raw || []) {
    const fromUser = doc.userId; // the owner of this balance doc
    const fromId =
      typeof fromUser === "object" && fromUser !== null
        ? fromUser._id ?? fromUser.id
        : fromUser;
    const fromName =
      typeof fromUser === "object" && fromUser !== null
        ? fromUser.name
        : undefined;
    for (const b of doc.balances || []) {
      const other = b.otherUserId;
      const otherId =
        typeof other === "object" && other !== null
          ? other._id ?? other.id
          : other;
      const otherName =
        typeof other === "object" && other !== null ? other.name : undefined;

      if (b.amount > 0) {
        // from owes other
        const pairKey = `${fromId}-${otherId}`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          seenPairs.add(`${otherId}-${fromId}`); // Mark reverse too
          entries.push({
            fromUser: { id: fromId, name: fromName },
            toUser: { id: otherId, name: otherName },
            amount: b.amount,
          });
        }
      } else if (b.amount < 0) {
        const pairKey = `${otherId}-${fromId}`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          seenPairs.add(`${fromId}-${otherId}`); // Mark reverse too
          entries.push({
            fromUser: { id: otherId, name: otherName },
            toUser: { id: fromId, name: fromName },
            amount: Math.abs(b.amount),
          });
        }
      }
    }
  }
  return entries;
};

// Auth
export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  return response.json();
};

// Users
export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    handleAuthError(response);
    throw new Error("Failed to fetch users");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeUser) : [];
};

export const getUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch user");
  const data = await response.json();
  return normalizeUser(data);
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
};

// Convenience: create user (admin-style) using register with a generated password
export const createUser = async (name, email) => {
  // Generate a simple temporary password
  const tempPassword = Math.random().toString(36).slice(2, 10);
  const result = await register(name, email, tempPassword);
  return result;
};

// Groups
export const createGroup = async (name, createdBy, members) => {
  const response = await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, createdBy, members }),
  });
  if (!response.ok) throw new Error("Failed to create group");
  const data = await response.json();
  return normalizeGroup(data);
};

export const getGroups = async () => {
  const response = await fetch(`${API_URL}/groups`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    handleAuthError(response);
    throw new Error("Failed to fetch groups");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeGroup) : [];
};

export const getGroup = async (id) => {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch group");
  const data = await response.json();
  return normalizeGroup(data);
};

export const getUserGroups = async (userId) => {
  const response = await fetch(`${API_URL}/groups/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch user groups");
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeGroup) : [];
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const response = await fetch(
    `${API_URL}/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to remove member from group");
  }
  return response.json();
};

export const deleteGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/groups/${groupId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete group");
  }
  return response.json();
};

export const addMemberToGroup = async (groupId, userId) => {
  const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add member to group");
  }
  const data = await response.json();
  return normalizeGroup(data);
};

// Expenses
export const createExpense = async (expenseData) => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(expenseData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create expense");
  }
  const data = await response.json();
  return normalizeExpense(data);
};

export const getGroupExpenses = async (groupId) => {
  const response = await fetch(`${API_URL}/expenses/group/${groupId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch expenses");
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeExpense) : [];
};

export const deleteExpense = async (expenseId) => {
  const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete expense");
  }
  return response.json();
};

// Balances
export const getUserBalances = async (userId) => {
  const response = await fetch(`${API_URL}/balances/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    handleAuthError(response);
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to fetch balances" }));
    throw new Error(error.error || "Failed to fetch balances");
  }
  const data = await response.json();
  return transformUserBalances(data);
};

export const getGroupBalances = async (groupId) => {
  const response = await fetch(`${API_URL}/balances/group/${groupId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch group balances");
  const data = await response.json();
  // Data is already formatted by the backend as { fromUser, toUser, amount }
  return data;
};

export const settleBalance = async (
  fromUserId,
  toUserId,
  amount,
  groupId = null
) => {
  const response = await fetch(`${API_URL}/balances/settle`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fromUserId, toUserId, amount, groupId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to settle balance");
  }
  return response.json();
};

export const requestSettlement = async (
  fromUserId,
  toUserId,
  amount,
  groupId
) => {
  const response = await fetch(`${API_URL}/balances/settlement-requests`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fromUserId, toUserId, amount, groupId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create settlement request");
  }
  return response.json();
};

export const getSettlementRequests = async (role = "incoming") => {
  const response = await fetch(
    `${API_URL}/balances/settlement-requests?role=${role}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) {
    handleAuthError(response);
    throw new Error("Failed to fetch settlement requests");
  }
  return response.json();
};

export const respondSettlementRequest = async (requestId, action) => {
  const url = `${API_URL}/balances/settlement-requests/${requestId}/${action}`;
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update settlement request");
  }
  return response.json();
};

export const getSettledExpenses = async (userId) => {
  const response = await fetch(`${API_URL}/balances/settled/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    // Don't throw on 404, just return empty array
    if (response.status === 404) {
      return [];
    }
    handleAuthError(response);
    throw new Error("Failed to fetch settled expenses");
  }
  return response.json();
};
