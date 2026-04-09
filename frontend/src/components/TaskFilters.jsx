import { useEffect, useRef } from "react";
import useTaskStore from "../stores/taskStore";

export default function TaskFilters() {
  const { filters, setFilters, resetFilters, categories } = useTaskStore();
  const searchRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {}, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  return (
    <div className="card p-4 flex flex-wrap gap-3 items-end">
      {/* Search */}
      <div className="flex-1 min-w-48">
        <label className="label">Search</label>
        <div className="relative">
          <svg
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={searchRef}
            className="input pl-8"
            placeholder="Search tasks…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
      </div>

      {/* Status */}
      <div className="min-w-32">
        <label className="label">Status</label>
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Priority */}
      <div className="min-w-32">
        <label className="label">Priority</label>
        <select
          className="input"
          value={filters.priority}
          onChange={(e) => setFilters({ priority: e.target.value })}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Category */}
      <div className="min-w-36">
        <label className="label">Category</label>
        <select
          className="input"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="min-w-40">
        <label className="label">Sort by</label>
        <select
          className="input"
          value={filters.ordering}
          onChange={(e) => setFilters({ ordering: e.target.value })}
        >
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="due_date">Due date (asc)</option>
          <option value="-due_date">Due date (desc)</option>
          <option value="priority">Priority (asc)</option>
          <option value="-priority">Priority (desc)</option>
        </select>
      </div>

      {/* Reset */}
      <button onClick={resetFilters} className="btn-secondary shrink-0">
        Reset
      </button>
    </div>
  );
}
