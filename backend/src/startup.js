import dotenv from "dotenv";

dotenv.config();

console.log(
  "Startup.js: JWT_SECRET loaded:",
  process.env.JWT_SECRET ? "Yes" : "No"
);
