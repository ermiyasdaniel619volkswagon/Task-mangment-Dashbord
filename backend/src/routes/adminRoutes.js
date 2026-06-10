import express from "express";
import upload from "../config/multer.js";
import { authAdmin } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getNurseActivityReports,
  getNurseReportById,
  getDashboardAnalytics,
  getBloodStockSummary,
  getRequestAnalytics,
  getTestResultAnalytics,
  getMyProfile,
  changeMyPassword,
  updateMyPhoto,
  getAvailableBloodStock,
} from "../Controllers/adminController.js";

const router = express.Router();
////////////// complited
router.post("/createUser", authAdmin, createUser);
router.get("/getAllUsers", authAdmin, getAllUsers);
router.put("/users/:userId", authAdmin, updateUser);
router.delete("/users/:userId", authAdmin, deleteUser);
router.get("/reports/nurse-activity", authAdmin, getNurseActivityReports);
router.get(
  "/reports/getNurseReportById/:reportId",
  authAdmin,
  getNurseReportById
);
router.get("/inventory/stock", authAdmin, getAvailableBloodStock);
router.get("/analytics/dashboard", authAdmin, getDashboardAnalytics);
router.get("/analytics/blood-stock", authAdmin, getBloodStockSummary);
router.get("/analytics/requests", authAdmin, getRequestAnalytics);
router.get("/analytics/test-results", authAdmin, getTestResultAnalytics);

router.get("/me", authAdmin, getMyProfile);
router.patch("/change-password", authAdmin, changeMyPassword);
router.patch("/photo", authAdmin, upload.single("photo"), updateMyPhoto);
export default router;
