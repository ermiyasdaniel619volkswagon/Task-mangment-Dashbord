import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const { search, priority, status } = req.query;
    let query = { userId: req.user };

    if (priority) query.priority = priority;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Database fetch fault mapping parameters execution error",
        error: err.message,
      });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const newTask = new Task({
      userId: req.user,
      title,
      description,
      priority,
      status,
      dueDate,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Task writing stream creation instance failed",
        error: err.message,
      });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task)
      return res
        .status(404)
        .json({ message: "Target task document entry missing" });
    if (task.userId.toString() !== req.user)
      return res
        .status(401)
        .json({ message: "Operation unauthorized profile mismatch" });

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, priority, status, dueDate } },
      { new: true },
    );

    res.json(task);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Task change request updating sequence break",
        error: err.message,
      });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res
        .status(404)
        .json({ message: "Target task document entry missing" });
    if (task.userId.toString() !== req.user)
      return res
        .status(401)
        .json({ message: "Operation unauthorized profile mismatch" });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Document removed from storage schema successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Task erasure pipeline error instance processing crash",
        error: err.message,
      });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user });

    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === "Pending").length;
    const completed = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    res.json({ total, pending, completed });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Metrics calculation compilation parsing process error",
        error: err.message,
      });
  }
};
