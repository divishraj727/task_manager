import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle, CheckCircle, Circle, Clock,
  GitBranch, LayoutGrid, Star, XCircle,
} from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import RadialOrbitalTimeline from "../components/ui/radial-orbital-timeline";
import TaskCard from "../components/TaskCard";
import TaskFilters from "../components/TaskFilters";
import TaskModal from "../components/TaskModal";
import useAuthStore from "../stores/authStore";
import useTaskStore from "../stores/taskStore";

function StatCard({ label, value, color }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${color || "text-gray-900"}`}>{value ?? "—"}</p>
    </div>
  );
}

// Compute deadline fields from a due_date string
function deadlineFields(dueDateStr, status) {
  if (!dueDateStr || status === "done" || status === "cancelled") {
    return { daysLeft: null, dueLabel: null, urgencyPct: 0 };
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due - now) / (1000 * 60 * 60 * 24));
  const dueLabel = due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  // urgencyPct: 100 = overdue/today, decreasing as deadline is further away (capped at 30 days out = 0%)
  const urgencyPct = daysLeft <= 0
    ? 100
    : Math.max(0, Math.round(((30 - Math.min(daysLeft, 30)) / 30) * 100));
  return { daysLeft, dueLabel, urgencyPct };
}

// Pick a lucide icon based on status/priority
function taskIcon(task) {
  if (task.status === "done") return CheckCircle;
  if (task.status === "cancelled") return XCircle;
  if (task.priority === "urgent") return AlertTriangle;
  if (task.priority === "high") return Star;
  if (task.status === "in_progress") return GitBranch;
  if (task.priority === "medium") return Clock;
  return Circle;
}

// Convert status to orbital timeline status
function mapStatus(status) {
  if (status === "done") return "completed";
  if (status === "in_progress") return "in-progress";
  return "pending";
}

// Convert tasks array → RadialOrbitalTimeline data (max 10 nodes for clarity)
function tasksToTimeline(tasks) {
  const slice = tasks.slice(0, 10);
  return slice.map((task) => {
    const { daysLeft, dueLabel, urgencyPct } = deadlineFields(task.due_date, task.status);
    return {
      id: task.id,
      title: task.title.length > 18 ? task.title.slice(0, 16) + "…" : task.title,
      date: dueLabel ?? task.status.replace("_", " "),
      content: task.description || "No description provided.",
      category: task.category_detail?.name ?? "General",
      icon: taskIcon(task),
      relatedIds: slice
        .filter((t) => t.id !== task.id && t.category_detail?.name === task.category_detail?.name && t.category_detail)
        .map((t) => t.id)
        .slice(0, 3),
      status: mapStatus(task.status),
      // deadline fields (replaces energy)
      daysLeft,
      dueLabel,
      urgencyPct,
      // keep energy as a dummy so nothing breaks
      energy: urgencyPct,
    };
  });
}

export default function Dashboard() {
  const { fetchProfile } = useAuthStore();
  const { fetchTasks, fetchStats, fetchCategories, tasks, stats, isLoading, totalCount, filters } =
    useTaskStore();

  const [view, setView] = useState("list"); // "list" | "orbital"
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const { categories, createCategory, deleteCategory } = useTaskStore();

  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchCategories();
  }, []);

  // Reload tasks whenever filters change
  useEffect(() => {
    fetchTasks();
  }, [filters]);

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim(), color: newCatColor });
      toast.success(`Category "${newCatName}" created`);
      setNewCatName("");
      setNewCatColor("#6366f1");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create category");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="To Do" value={stats.todo} color="text-gray-700" />
            <StatCard label="In Progress" value={stats.in_progress} color="text-yellow-600" />
            <StatCard label="Done" value={stats.done} color="text-green-600" />
            <StatCard label="Overdue" value={stats.overdue} color="text-red-600" />
            <StatCard label="High Priority" value={stats.high_priority} color="text-orange-600" />
          </div>
        )}

        {/* Orbital full-screen view */}
        {view === "orbital" && (
          <div className="fixed inset-0 z-40 bg-black" style={{ top: "64px" }}>
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
              <span className="text-white/50 text-xs">Click a node to expand · Click background to reset</span>
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                <LayoutGrid size={13} /> List View
              </button>
            </div>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
                <Circle size={48} />
                <p className="text-sm">No tasks yet — create one in List View</p>
              </div>
            ) : (
              <RadialOrbitalTimeline timelineData={tasksToTimeline(tasks)} />
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Tasks{" "}
                <span className="text-sm font-normal text-gray-400">({totalCount})</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                  <button
                    onClick={() => setView("list")}
                    className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                      view === "list"
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid size={13} /> List
                  </button>
                  <button
                    onClick={() => setView("orbital")}
                    className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                      view === "orbital"
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Circle size={13} /> Orbital
                  </button>
                </div>
                <button onClick={openCreate} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </button>
              </div>
            </div>

            {/* Filters */}
            <TaskFilters />

            {/* Task list */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <svg className="w-8 h-8 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : tasks.length === 0 ? (
              <div className="card py-16 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="font-medium">No tasks found</p>
                <p className="text-sm mt-1">Create a task or adjust your filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={openEdit} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — Categories */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="card p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">Categories</h3>
                <button
                  onClick={() => setCategoryModalOpen((v) => !v)}
                  className="text-primary-600 hover:text-primary-700"
                  title="Add category"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {categoryModalOpen && (
                <form onSubmit={handleCreateCategory} className="flex flex-col gap-2">
                  <input
                    className="input text-xs"
                    placeholder="Category name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="h-8 w-10 rounded border border-gray-300 cursor-pointer"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                    />
                    <button type="submit" className="btn-primary text-xs px-3 py-1.5 flex-1">
                      Add
                    </button>
                  </div>
                </form>
              )}

              {categories.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No categories yet</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {categories.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between text-sm py-1 px-2 rounded-lg hover:bg-gray-50 group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-gray-700">{c.name}</span>
                        <span className="text-xs text-gray-400">({c.task_count})</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete category "${c.name}"?`)) return;
                          await deleteCategory(c.id);
                          toast.success("Category deleted");
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      {modalOpen && <TaskModal task={editingTask} onClose={closeModal} />}

      <Footer dark />
    </div>
  );
}
