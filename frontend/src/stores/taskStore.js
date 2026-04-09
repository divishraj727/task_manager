import { create } from "zustand";
import { categoryApi, taskApi } from "../services/index";

const useTaskStore = create((set, get) => ({
  tasks: [],
  categories: [],
  stats: null,
  isLoading: false,
  totalCount: 0,
  filters: {
    search: "",
    status: "",
    priority: "",
    category: "",
    ordering: "-created_at",
    page: 1,
  },

  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch, page: 1 } })),

  resetFilters: () =>
    set({ filters: { search: "", status: "", priority: "", category: "", ordering: "-created_at", page: 1 } }),

  // ── Tasks ──────────────────────────────────────────────────────────────────
  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const params = {};
      const { search, status, priority, category, ordering, page } = get().filters;
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (ordering) params.ordering = ordering;
      if (page) params.page = page;

      const { data } = await taskApi.list(params);
      set({ tasks: data.results ?? data, totalCount: data.count ?? (data.results ?? data).length });
    } catch (_) {
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    const { data } = await taskApi.create(taskData);
    set((s) => ({ tasks: [data, ...s.tasks], totalCount: s.totalCount + 1 }));
    get().fetchStats();
    return data;
  },

  updateTask: async (id, taskData) => {
    const { data } = await taskApi.patch(id, taskData);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? data : t)) }));
    get().fetchStats();
    return data;
  },

  deleteTask: async (id) => {
    await taskApi.delete(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), totalCount: s.totalCount - 1 }));
    get().fetchStats();
  },

  completeTask: async (id) => {
    const { data } = await taskApi.complete(id);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? data : t)) }));
    get().fetchStats();
  },

  reopenTask: async (id) => {
    const { data } = await taskApi.reopen(id);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? data : t)) }));
    get().fetchStats();
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  fetchStats: async () => {
    try {
      const { data } = await taskApi.stats();
      set({ stats: data });
    } catch (_) {}
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  fetchCategories: async () => {
    try {
      const { data } = await categoryApi.list();
      set({ categories: data.results ?? data });
    } catch (_) {}
  },

  createCategory: async (catData) => {
    const { data } = await categoryApi.create(catData);
    set((s) => ({ categories: [...s.categories, data] }));
    return data;
  },

  deleteCategory: async (id) => {
    await categoryApi.delete(id);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },
}));

export default useTaskStore;
