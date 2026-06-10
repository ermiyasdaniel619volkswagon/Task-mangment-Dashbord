import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser"; // 1. Import cookie parser
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

// 2. Update CORS to handle cookies securely
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend local address
//     credentials: true,
//   }),
// );
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "https://task-mangment-dashbord-tzr4.vercel.app",
    ], // Add any ports your Vite/React uses
    credentials: true, // This is required for cookies/withCredentials
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser()); // 3. Mount cookie parser middleware

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully via ES Modules"))
  .catch((err) => console.error("MongoDB connection cluster error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Task Management API engine is active...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Application tracking active on port ${PORT}`);
});
