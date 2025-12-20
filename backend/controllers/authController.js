import { User } from "../models/UserSchema.js";
import { signAccessToken, getTokenExpirySeconds } from "../services/jwt.js";
import { blacklistToken } from "../services/redis.js";

export const register = async (req, res) => {
  try {
    console.log("Register request received:", {
      email: req.body.email,
      name: req.body.name,
    });

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();
    console.log("User created successfully:", user._id);

    const accessToken = signAccessToken({
      id: user._id,
      email: user.email,
      name: user.name,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = signAccessToken({
      id: user._id,
      email: user.email,
      name: user.name,
    });

    console.log("Login successful for user:", user._id);
    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const user = req.user;
    
    // Blacklist the current token if jti exists
    if (user.jti) {
      const ttl = getTokenExpirySeconds(user);
      await blacklistToken(user.jti, ttl);
      console.log(`Token blacklisted for user: ${user.id}`);
    }
    
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
  }
};
