import { useState, useEffect } from "react";
import API from "../services/api.js";
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  ListTodo,
  Search,
  AlertTriangle,
  Percent,
  LogOut, // Imported LogOut icon
} from "lucide-react";

// 1. Added onLogout into the parameter destructurer here
export default function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const loadData = async () => {
    try {
      const statsRes = await API.get("/tasks/stats");
      setStats(statsRes.data);

      const params = {};
      if (search) params.search = search;
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;

      const tasksRes = await API.get("/tasks", { params });
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Error synchronizing dashboard datasets:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterPriority, filterStatus]);

  const highPriorityCount = tasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed",
  ).length;
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", { title, description, priority, dueDate });
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      loadData();
    } catch (err) {
      alert("Error creating task configuration profile.");
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const nextStatus = task.status === "Pending" ? "Completed" : "Pending";
      await API.put(`/tasks/${task._id}`, { ...task, status: nextStatus });
      loadData();
    } catch (err) {
      alert("Error updating task parameters.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Confirm erasure execution request?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      loadData();
    } catch (err) {
      alert("Error removing record entry.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* 2. Secondary Context Row inside Dashboard displaying action control links explicitly */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Operational Workspace
        </h2>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition shadow-sm"
        >
          <LogOut size={16} /> Log Out from Dashboard
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Panels Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ListTodo size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Critical Open</p>
              <p className="text-2xl font-bold text-gray-900">
                {highPriorityCount}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Percent size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Task Velocity</p>
              <p className="text-2xl font-bold text-gray-900">
                {completionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Create Task Form Column */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-fit shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={18} /> New Task
          </h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="Develop features..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:border-blue-500 text-sm h-20 resize-none"
                placeholder="Task details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:border-blue-500 text-sm bg-white"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:border-blue-500 text-sm"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 rounded-lg bg-blue-600 p-2.5 text-white font-semibold hover:bg-blue-700 transition text-sm"
            >
              Save Task
            </button>
          </form>
        </div>

        {/* Search, Filters & Task List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                className="rounded-lg border border-gray-300 p-2 text-xs bg-white focus:outline-none"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select
                className="rounded-lg border border-gray-300 p-2 text-xs bg-white focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Task Render Stream */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center bg-white border border-gray-200 rounded-xl p-8 text-sm text-gray-400">
                No active tasks found matching criteria parameters.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between gap-4 transition-all ${
                    task.status === "Completed"
                      ? "border-l-4 border-l-emerald-500 opacity-75"
                      : "border-l-4 border-l-amber-500"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4
                        className={`font-semibold text-base truncate ${task.status === "Completed" ? "line-through text-gray-400" : "text-gray-900"}`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-700"
                            : task.priority === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p
                      className={`text-sm mb-2 break-words ${task.status === "Completed" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition border ${
                        task.status === "Completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {task.status === "Completed" ? "Completed" : "Mark Done"}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
