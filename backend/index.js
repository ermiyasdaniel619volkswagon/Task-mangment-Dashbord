import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

const app = express();

// Cross-Origin and JSON payload parsers
app.use(cors());
app.use(express.json());

// Database connection lifecycle
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully "))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initial structural check route
app.get("/", (req, res) => {
  res.send("Task Management API engine is active...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Application tracking active on port ${PORT}`);
});
