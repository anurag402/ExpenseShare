import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";

const API_URL = "https://expenseshare-0sjl.onrender.com/api";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    const payload = isSignup
      ? {
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
        }
      : {
          email: data.email.trim(),
          password: data.password,
        };

    const url = `${API_URL}/auth/${isSignup ? "register" : "login"}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Authentication failed");
        setIsLoading(false);
        return;
      }

      if (!result.token || !result.user?.id) {
        toast.error("Invalid server response");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.user.id);

      toast.success(
        isSignup ? "Account created successfully!" : "Logged in successfully!"
      );

      setIsLoading(false);
      onLogin(result.user.id);
      navigate("/");
    } catch (error) {
      toast.error("Server error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        {/* Header */}
        <motion.div
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <FaWallet className="text-6xl text-blue-400" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-2">ExpenseShare</h2>
          <p className="text-gray-300">
            Split expenses with friends and family
          </p>
        </motion.div>

        {/* Card */}
        <motion.div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex mb-8 bg-white/10 rounded-lg p-1 border border-white/20">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setShowErrors(false);
                reset();
                clearErrors();
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                !isSignup
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setShowErrors(false);
                reset();
                clearErrors();
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                isSignup
                  ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            onSubmit={handleSubmit((data) => {
              setShowErrors(true);
              onSubmit(data);
            })}
            className="space-y-4"
          >
            {/* Name */}
            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      {...register("name", {
                        required: isSignup ? "Name is required" : false,
                      })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400"
                    />
                  </div>
                  {showErrors && errors.name && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email", { required: "Email is required" })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400"
                />
              </div>
              {showErrors && errors.email && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {showErrors && errors.password && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
            >
              {isLoading
                ? "Processing..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
