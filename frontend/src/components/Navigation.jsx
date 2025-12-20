import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUsers,
  FaWallet,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useState } from "react";

export default function Navigation({ currentUser, users, onLogout }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUserData = users.find((u) => u.id === currentUser);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Show logout button even if users array is loading
  const shouldShowLogout = currentUser && currentUser !== "";

  const navLinks = [
    { path: "/", label: shouldShowLogout ? "Dashboard" : "Home", icon: FaHome },
    { path: "/groups", label: "Groups", icon: FaUsers },
    { path: "/balances", label: "Balances", icon: FaWallet },
  ];

  return (
    <nav className="backdrop-blur-md bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 border-b border-white/20 shadow-xl">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent flex items-center gap-2 hover:scale-105 transition"
            >
              <FaWallet className="text-4xl text-blue-400" />
              ExpenseShare
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.path}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                      isActive(link.path)
                        ? "bg-white/20 border border-white/30 text-white shadow-lg backdrop-blur-sm"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {shouldShowLogout && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
                >
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <FaUser /> {currentUserData?.name || "User"}
                  </span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 hover:border-red-400/50 text-red-300 rounded-lg font-semibold flex items-center gap-2 transition-all"
                >
                  <FaSignOutAlt size={18} />
                  Logout
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white text-2xl hover:text-blue-300 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 space-y-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    isActive(link.path)
                      ? "bg-white/20 border border-white/30 text-white"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            {shouldShowLogout && (
              <>
                <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <FaUser /> {currentUserData?.name || "User"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 hover:border-red-400/50 text-red-300 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
