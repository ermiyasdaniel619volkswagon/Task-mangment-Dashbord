
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to set cookie parameters uniformly
const sendTokenCookie = (res, statusCode, userId, userData) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents XSS scripts reading cookie
    secure: process.env.NODE_ENV === "production", // true in production over HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.cookie("token", token, cookieOptions);
  res.status(statusCode).json({ user: userData });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "Email registry matches an existing user profile" });
    }

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    sendTokenCookie(res, 201, user._id, {
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Server registry failure profile creation halted",
        error: err.message,
      });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({
          message: "Incorrect authentication identity credentials match",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({
          message: "Incorrect authentication identity credentials match",
        });
    }

    sendTokenCookie(res, 200, user._id, {
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Server core processing token verification issue",
        error: err.message,
      });
  }
};

// Add a logout controller route to clear cookies easily
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully from session cookie layer" });
};