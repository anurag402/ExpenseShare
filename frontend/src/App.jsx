import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import BalancesPage from "./pages/BalancesPage";
import * as api from "./api";

function App() {
  const [users, setUsers] = useState([]);
  // Initialize from localStorage to avoid redirect on refresh
  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem("userId")
  );
  const [userBalances, setUserBalances] = useState(null);

  // Define functions before they're used in useEffect
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadUserBalances = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;
      const data = await api.getUserBalances(userId);
      setUserBalances(data);
    } catch (error) {
      console.error("Error loading user balances:", error);
    }
  };

  // Load users on mount only if we have a session token
  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadUsers();
    }
  }, []);

  // Load user balances when current user changes
  useEffect(() => {
    if (currentUser) {
      loadUsers(); // Reload users when logging in
      loadUserBalances(currentUser);
      localStorage.setItem("userId", currentUser);
    } else {
      setUserBalances(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
    }
  }, [currentUser]);

  const handleRemoveMember = async (groupId, userId) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }
    try {
      await api.removeMemberFromGroup(groupId, userId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = (userId) => {
    setCurrentUser(userId);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {currentUser && (
          <Navigation
            currentUser={currentUser}
            users={users}
            onLogout={handleLogout}
          />
        )}

        <div
          className={currentUser ? "container mx-auto px-4 py-8 max-w-7xl" : ""}
        >
          <Routes>
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />

            <Route
              path="/"
              element={
                currentUser ? (
                  <ProtectedRoute currentUser={currentUser}>
                    <DashboardPage currentUser={currentUser} users={users} />
                  </ProtectedRoute>
                ) : (
                  <HomePage />
                )
              }
            />

            <Route
              path="/groups"
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <GroupsPage
                    users={users}
                    currentUser={currentUser}
                    onRemoveMember={handleRemoveMember}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <GroupDetailPage
                    users={users}
                    currentUser={currentUser}
                    onLoadBalances={() => loadUserBalances(currentUser)}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/balances"
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <BalancesPage
                    currentUser={currentUser}
                    userBalances={userBalances}
                    onRefreshBalances={() => loadUserBalances(currentUser)}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={<Navigate to={currentUser ? "/" : "/login"} replace />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
