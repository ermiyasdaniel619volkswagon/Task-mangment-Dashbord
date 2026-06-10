import express from "express";
import auth from "../middleware/auth.js";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../controllers/taskController.js";

const router = express.Router();

// Enforce authentication context parsing engine on all routes down-tree
router.use(auth);

router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
