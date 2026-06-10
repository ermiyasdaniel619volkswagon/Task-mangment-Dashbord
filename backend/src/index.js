import "./startup.js"; // Loads .env + other startup checks (must be first)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import mongoose from "mongoose"; // ← ADD THIS
mongoose.set("strictPopulate", false);

import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS config
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// JWT check (good for debugging)
console.log(
  "Index.js: JWT_SECRET available:",
  process.env.JWT_SECRET ? "Yes" : "No",
);

app.use("/api/auth", authRoutes);

// ———————————————— START SERVER WITH INDEX CLEANUP ————————————————
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB(); // This already logs "MongoDB Connected"

    // 2. Clean up duplicate indexes (only in development)
    if (process.env.NODE_ENV !== "production") {
      console.log("Cleaning duplicate indexes...");
      await Promise.all([
        User.syncIndexes(),
        HospitalRequest.syncIndexes(),
        // Add more models here if needed:
        // Donation.syncIndexes(),
        // BloodStock.syncIndexes(),
      ]);
      console.log("All duplicate indexes removed — server is clean!");
    }

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on this port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start everything
startServer();
