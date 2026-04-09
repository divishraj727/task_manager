// ---------------------------------------------------------------------------
// Mock API — localStorage-backed, no backend needed
// Swap out by setting VITE_MOCK=false and providing VITE_API_BASE_URL
// ---------------------------------------------------------------------------

const DEMO_USER = {
  id: 1,
  email: "root@gmail.com",
  username: "root",
  first_name: "Root",
  last_name: "User",
  full_name: "Root User",
};

const DEMO_CREDENTIALS = {
  email: "root@gmail.com",
  password: "root",
};

// ── localStorage helpers ────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function nextId(items) {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

// ── Seed default data if first visit ────────────────────────────────────────
function seedIfEmpty() {
  if (localStorage.getItem("mock_seeded")) return;

  const categories = [
    { id: 1, name: "Work", color: "#6366f1", task_count: 2 },
    { id: 2, name: "Personal", color: "#10b981", task_count: 1 },
    { id: 3, name: "Learning", color: "#f59e0b", task_count: 1 },
  ];

  const today = new Date();
  const addDays = (d) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split("T")[0];
  };

  const tasks = [
    {
      id: 1, title: "Set up project structure", description: "Initialise repo and folder layout.",
      status: "done", priority: "high", due_date: addDays(-5),
      category: 1, category_detail: categories[0], created_at: new Date().toISOString(),
    },
    {
      id: 2, title: "Design database schema", description: "ERD for users, tasks and categories.",
      status: "done", priority: "high", due_date: addDays(-2),
      category: 1, category_detail: categories[0], created_at: new Date().toISOString(),
    },
    {
      id: 3, title: "Build REST API", description: "Django REST endpoints with JWT auth.",
      status: "in_progress", priority: "urgent", due_date: addDays(2),
      category: 1, category_detail: categories[0], created_at: new Date().toISOString(),
    },
    {
      id: 4, title: "Morning workout", description: "30 min cardio + stretching.",
      status: "todo", priority: "medium", due_date: addDays(1),
      category: 2, category_detail: categories[1], created_at: new Date().toISOString(),
    },
    {
      id: 5, title: "Read React docs", description: "Go through new React 19 features.",
      status: "todo", priority: "low", due_date: addDays(7),
      category: 3, category_detail: categories[2], created_at: new Date().toISOString(),
    },
  ];

  save("mock_categories", categories);
  save("mock_tasks", tasks);
  save("mock_seeded", true);
}

// ── Fake async wrapper (matches axios shape: { data }) ──────────────────────
const ok = (data) => Promise.resolve({ data });
const fail = (msg, status = 400) =>
  Promise.reject({ response: { status, data: { detail: msg } } });

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: ({ email, password }) => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      localStorage.setItem("access_token", "mock_access_token");
      localStorage.setItem("refresh_token", "mock_refresh_token");
      return ok({ access: "mock_access_token", refresh: "mock_refresh_token", user: DEMO_USER });
    }
    return fail("Invalid email or password.", 401);
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return ok({});
  },
  getProfile: () => ok(DEMO_USER),
  register: () => fail("Registration is disabled in demo mode."),
  updateProfile: () => ok(DEMO_USER),
  changePassword: () => fail("Not available in demo mode."),
};

// ── Tasks ───────────────────────────────────────────────────────────────────
export const taskApi = {
  list: (params = {}) => {
    seedIfEmpty();
    let tasks = load("mock_tasks", []);

    if (params.search)
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(params.search.toLowerCase()) ||
          t.description?.toLowerCase().includes(params.search.toLowerCase())
      );
    if (params.status)   tasks = tasks.filter((t) => t.status === params.status);
    if (params.priority) tasks = tasks.filter((t) => t.priority === params.priority);
    if (params.category) tasks = tasks.filter((t) => t.category === Number(params.category));

    // Sorting
    const ord = params.ordering || "-created_at";
    const dir = ord.startsWith("-") ? -1 : 1;
    const field = ord.replace("-", "");
    tasks = [...tasks].sort((a, b) => {
      if (a[field] < b[field]) return -dir;
      if (a[field] > b[field]) return dir;
      return 0;
    });

    return ok({ results: tasks, count: tasks.length });
  },

  create: (data) => {
    const tasks = load("mock_tasks", []);
    const categories = load("mock_categories", []);
    const cat = data.category ? categories.find((c) => c.id === Number(data.category)) : null;
    const task = {
      ...data,
      id: nextId(tasks),
      category: data.category ? Number(data.category) : null,
      category_detail: cat || null,
      created_at: new Date().toISOString(),
    };
    save("mock_tasks", [task, ...tasks]);
    return ok(task);
  },

  get: (id) => {
    const task = load("mock_tasks", []).find((t) => t.id === id);
    return task ? ok(task) : fail("Not found", 404);
  },

  patch: (id, data) => {
    const tasks = load("mock_tasks", []);
    const categories = load("mock_categories", []);
    const cat = data.category ? categories.find((c) => c.id === Number(data.category)) : null;
    const updated = tasks.map((t) =>
      t.id === id
        ? { ...t, ...data, category_detail: cat !== undefined ? cat : t.category_detail }
        : t
    );
    save("mock_tasks", updated);
    return ok(updated.find((t) => t.id === id));
  },

  update: (id, data) => taskApi.patch(id, data),

  delete: (id) => {
    save("mock_tasks", load("mock_tasks", []).filter((t) => t.id !== id));
    return ok({});
  },

  complete: (id) => taskApi.patch(id, { status: "done" }),
  reopen:   (id) => taskApi.patch(id, { status: "todo" }),

  stats: () => {
    const tasks = load("mock_tasks", []);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return ok({
      total:         tasks.length,
      todo:          tasks.filter((t) => t.status === "todo").length,
      in_progress:   tasks.filter((t) => t.status === "in_progress").length,
      done:          tasks.filter((t) => t.status === "done").length,
      overdue:       tasks.filter((t) => t.due_date && t.status !== "done" && t.status !== "cancelled" && new Date(t.due_date) < now).length,
      high_priority: tasks.filter((t) => t.priority === "urgent" || t.priority === "high").length,
    });
  },
};

// ── Categories ──────────────────────────────────────────────────────────────
export const categoryApi = {
  list: () => {
    seedIfEmpty();
    const cats = load("mock_categories", []);
    const tasks = load("mock_tasks", []);
    const withCount = cats.map((c) => ({
      ...c,
      task_count: tasks.filter((t) => t.category === c.id).length,
    }));
    return ok({ results: withCount, count: withCount.length });
  },

  create: (data) => {
    const cats = load("mock_categories", []);
    const cat = { ...data, id: nextId(cats), task_count: 0 };
    save("mock_categories", [...cats, cat]);
    return ok(cat);
  },

  get: (id) => {
    const cat = load("mock_categories", []).find((c) => c.id === id);
    return cat ? ok(cat) : fail("Not found", 404);
  },

  delete: (id) => {
    save("mock_categories", load("mock_categories", []).filter((c) => c.id !== id));
    return ok({});
  },
};
