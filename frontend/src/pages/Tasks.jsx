import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  Bell,
  Check,
  ChevronRight
} from "lucide-react";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task creation state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const [savingTask, setSavingTask] = useState(false);

  // Reminder creation state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: "", remindAt: "" });
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, remindersRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/reminders")
      ]);
      setTasks(tasksRes.data.tasks);
      setReminders(remindersRes.data.reminders);
    } catch (err) {
      console.error("Failed to fetch tasks/reminders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setSavingTask(true);
    try {
      const res = await api.post("/tasks", newTask);
      setTasks([res.data.task, ...tasks]);
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    let nextStatus = "todo";
    if (currentStatus === "todo") nextStatus = "in-progress";
    else if (currentStatus === "in-progress") nextStatus = "completed";
    else if (currentStatus === "completed") nextStatus = "todo";

    try {
      const res = await api.put(`/tasks/${taskId}`, { status: nextStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data.task : t)));
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title.trim() || !newReminder.remindAt) return;
    setSavingReminder(true);
    try {
      const res = await api.post("/reminders", newReminder);
      setReminders([...reminders, res.data.reminder].sort((a, b) => new Date(a.remindAt) - new Date(b.remindAt)));
      setShowReminderModal(false);
      setNewReminder({ title: "", remindAt: "" });
    } catch (err) {
      console.error("Failed to create reminder", err);
    } finally {
      setSavingReminder(false);
    }
  };

  const handleToggleReminderComplete = async (reminderId, currentStatus) => {
    try {
      const res = await api.put(`/reminders/${reminderId}`, { isCompleted: !currentStatus });
      setReminders(reminders.map((r) => (r._id === reminderId ? res.data.reminder : r)));
    } catch (err) {
      console.error("Failed to update reminder", err);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.delete(`/reminders/${reminderId}`);
      setReminders(reminders.filter((r) => r._id !== reminderId));
    } catch (err) {
      console.error("Failed to delete reminder", err);
    }
  };

  // Columns for Kanban Board
  const columns = [
    { id: "todo", title: "To Do", color: "border-brand-violet/20 text-brand-violet bg-brand-purple/5" },
    { id: "in-progress", title: "In Progress", color: "border-brand-blue/20 text-brand-blue bg-brand-blue/5" },
    { id: "completed", title: "Completed", color: "border-brand-emerald/20 text-brand-emerald bg-brand-emerald/5" }
  ];

  return (
    <div className="space-y-10 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Productivity Hub</h2>
          <p className="text-dark-muted text-sm font-medium">Keep track of your projects, tasks, and notifications.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReminderModal(true)}
            className="flex items-center space-x-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl px-5 py-3.5 text-sm transition-all duration-300"
          >
            <Bell size={16} className="text-brand-pink" />
            <span>Add Reminder</span>
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-2xl px-5 py-3.5 text-sm transition-all duration-300 shadow-lg"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-96 rounded-3xl shimmer" />)}
          </div>
          <div className="h-96 rounded-3xl shimmer" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 1. KANBAN BOARD (Tasks) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="glass rounded-3xl p-5 border border-white/5 bg-dark-card/30 flex flex-col max-h-[650px]">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-3 border rounded-2xl ${col.color} mb-5 font-bold text-xs uppercase tracking-wider`}>
                    <span>{col.title}</span>
                    <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px]">{colTasks.length}</span>
                  </div>

                  {/* Task Cards Stack */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-8 text-xs text-dark-muted border border-dashed border-dark-border rounded-2xl">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <motion.div
                          layout
                          key={task._id}
                          className="glass-light rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all group relative flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`font-semibold text-sm ${task.status === "completed" ? "line-through text-dark-muted" : "text-white"}`}>
                                {task.title}
                              </h4>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="opacity-0 group-hover:opacity-100 text-dark-muted hover:text-red-400 p-0.5 rounded transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {task.description && (
                              <p className="text-xs text-dark-muted line-clamp-2 mt-1 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Task Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-dark-border/50">
                            {/* Priority Badge */}
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-400 border border-red-500/15"
                                : task.priority === "medium"
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/15"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                            }`}>
                              {task.priority}
                            </span>

                            {/* Move Status Button */}
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, task.status)}
                              className="p-1 bg-white/5 hover:bg-brand-violet/20 hover:text-brand-violet rounded-lg text-dark-muted transition-all"
                              title="Move Status"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. REMINDERS TIMELINE */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/35 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Bell size={18} className="text-brand-pink" />
                <span>Reminders</span>
              </h3>
              <span className="bg-brand-pink/15 text-brand-pink px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {reminders.filter((r) => !r.isCompleted).length} pending
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {reminders.length === 0 ? (
                <div className="text-center py-12 text-xs text-dark-muted">No reminders scheduled</div>
              ) : (
                reminders.map((rem) => {
                  const isOverdue = new Date(rem.remindAt) < new Date() && !rem.isCompleted;
                  return (
                    <div
                      key={rem._id}
                      className={`flex items-start justify-between p-3.5 rounded-2xl border transition-all ${
                        rem.isCompleted
                          ? "bg-dark-deep/30 border-dark-border text-dark-muted"
                          : isOverdue
                          ? "bg-red-500/5 border-red-500/15 text-red-400"
                          : "glass-light border-white/5 text-white"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleToggleReminderComplete(rem._id, rem.isCompleted)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            rem.isCompleted
                              ? "bg-brand-emerald border-brand-emerald text-white"
                              : isOverdue
                              ? "border-red-400 hover:bg-red-500/10"
                              : "border-dark-muted hover:border-brand-pink"
                          }`}
                        >
                          {rem.isCompleted && <Check size={10} />}
                        </button>
                        <div>
                          <p className={`text-xs font-semibold ${rem.isCompleted ? "line-through" : ""}`}>
                            {rem.title}
                          </p>
                          <span className="flex items-center text-[10px] text-dark-muted mt-1 space-x-1">
                            <Clock size={10} />
                            <span>
                              {new Date(rem.remindAt).toLocaleDateString()} at{" "}
                              {new Date(rem.remindAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(rem._id)}
                        className="text-dark-muted hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* 1. Add Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 bg-dark-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full border border-white/5 bg-dark-card/90 shadow-2xl"
            >
              <form onSubmit={handleCreateTask} className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <CheckSquare className="text-brand-violet" size={20} />
                    <span>Create Task</span>
                  </h3>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="text-dark-muted hover:text-white">✕</button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Complete project proposal"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Description</label>
                  <textarea
                    placeholder="Optional details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl p-4 text-white placeholder-dark-muted outline-none transition-all text-sm resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white outline-none transition-all text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingTask}
                  className="w-full bg-brand-violet hover:bg-brand-purple text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg"
                >
                  {savingTask ? "Saving..." : "Create Task"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <div className="fixed inset-0 bg-dark-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-sm w-full border border-white/5 bg-dark-card/90 shadow-2xl"
            >
              <form onSubmit={handleCreateReminder} className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Bell className="text-brand-pink" size={20} />
                    <span>Create Reminder</span>
                  </h3>
                  <button type="button" onClick={() => setShowReminderModal(false)} className="text-dark-muted hover:text-white">✕</button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Client sync-up"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Notify Me At</label>
                  <input
                    type="datetime-local"
                    required
                    value={newReminder.remindAt}
                    onChange={(e) => setNewReminder({ ...newReminder, remindAt: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3 text-white outline-none transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingReminder}
                  className="w-full bg-brand-pink hover:bg-brand-purple text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg"
                >
                  {savingReminder ? "Saving..." : "Create Reminder"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Tasks;
