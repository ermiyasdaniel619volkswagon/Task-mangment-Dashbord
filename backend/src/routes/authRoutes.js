import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";

import User from "../models/User.js";
import SystemConfig from "../models/SystemConfig.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import sendEmail from "../utils/sendEmail.js";
import { authProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== REGISTER ADMIN (Only Once) ====================
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    const cfg = await SystemConfig.findOne();
    const canSeed = !existingAdmin && !(cfg && cfg.adminCreated);

    if (!canSeed) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      role: "admin",
    });

    await user.save();

    if (!cfg) {
      await SystemConfig.create({ adminCreated: true });
    } else {
      cfg.adminCreated = true;
      await cfg.save();
    }

    res.status(201).json({ msg: "Admin created successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==================== LOGIN - EMAIL OR PHONE (Perfect & Final) ====================
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ msg: "Please provide email/phone and password" });
  }

  try {
    let user;
    const trimmed = identifier.trim();

    // 1. Try as email
    if (validator.isEmail(trimmed)) {
      user = await User.findOne({ email: trimmed.toLowerCase() }).select(
        "+password",
      );
    }

    // 2. Try as phone if not found
    if (!user) {
      user = await User.findOne({ phone: trimmed }).select("+password");
    }

    // 3. Final fallback
    if (!user) {
      user = await User.findOne({
        $or: [{ email: trimmed.toLowerCase() }, { phone: trimmed }],
      }).select("+password");
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      msg: "Login successful",
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==================== FORGOT PASSWORD ====================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ msg: "If account exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset - Blood Bank System",
      message: `Reset your password (valid 10 mins):\n\n${resetURL}`,
    });

    res.json({ msg: "Reset link sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Email could not be sent" });
  }
});

// ==================== RESET PASSWORD ====================
router.put("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ==================== LOGOUT ====================
router.post("/logout", authProtect, async (req, res) => {
  try {
    await TokenBlacklist.create({ token: req.token });

    res.cookie("jwt", "loggedout", {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ msg: "Logout failed" });
  }
});

export default router;
