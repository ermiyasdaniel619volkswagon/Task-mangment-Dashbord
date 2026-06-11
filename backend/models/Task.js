import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    category: {
      type: String,
      enum: [
        "Development",
        "Testing",
        "Database",
        "Deployment",
        "Design",
        "Documentation",
      ],
      default: "Development",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Task", TaskSchema);
