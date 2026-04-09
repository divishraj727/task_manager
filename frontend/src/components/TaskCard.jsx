import { format, isPast, parseISO } from "date-fns";
import toast from "react-hot-toast";
import useTaskStore from "../stores/taskStore";

const PRIORITY_STYLES = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STATUS_STYLES = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function TaskCard({ task, onEdit }) {
  const { completeTask, reopenTask, deleteTask } = useTaskStore();

  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    task.status !== "cancelled" &&
    isPast(parseISO(task.due_date));

  async function handleComplete() {
    try {
      await completeTask(task.id);
      toast.success("Task marked as done");
    } catch {
      toast.error("Failed to complete task");
    }
  }

  async function handleReopen() {
    try {
      await reopenTask(task.id);
      toast.success("Task reopened");
    } catch {
      toast.error("Failed to reopen task");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-sm leading-snug ${
              task.status === "done" ? "line-through text-gray-400" : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[task.status]}`}>
          {task.status.replace("_", " ")}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.category_detail && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
            style={{ backgroundColor: task.category_detail.color }}
          >
            {task.category_detail.name}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {task.due_date && (
            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
              {isOverdue ? "Overdue · " : "Due "}
              {format(parseISO(task.due_date), "MMM d, yyyy")}
            </span>
          )}
        </div>
        <div>
          {task.status !== "done" && task.status !== "cancelled" ? (
            <button onClick={handleComplete} className="text-xs text-primary-600 hover:underline">
              Complete
            </button>
          ) : task.status === "done" ? (
            <button onClick={handleReopen} className="text-xs text-gray-500 hover:underline">
              Reopen
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
