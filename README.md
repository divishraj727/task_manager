# Task Manager — Full Stack App

Django REST API + React (Vite + Tailwind) task management application.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | python.org |
| Node.js | 18+ | nodejs.org |
| PostgreSQL | 15+ | postgresql.org |

---

## Backend Setup (Django)

### 1. Create and activate virtual environment

```cmd
cd D:\project_1\task_manager\backend
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```cmd
pip install -r requirements.txt
```

### 3. Configure environment

```cmd
copy .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:

```env
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Create PostgreSQL database

Open pgAdmin or run in PowerShell / psql:

```sql
CREATE DATABASE taskmanager;
```

### 5. Apply migrations

```cmd
python manage.py migrate
```

### 6. Create superuser (for /admin panel)

```cmd
python manage.py createsuperuser
```

### 7. Run development server

```cmd
python manage.py runserver
```

Backend is live at: http://localhost:8000

- **API docs (Swagger):** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **Admin panel:** http://localhost:8000/admin/

---

## Frontend Setup (React)

### 1. Install dependencies

```cmd
cd D:\project_1\task_manager\frontend
npm install
```

### 2. Configure environment

```cmd
copy .env.example .env
```

`.env` content (default works with the proxy setup):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Run dev server

```cmd
npm run dev
```

Frontend is live at: http://localhost:5173

---

## API Endpoints (21)

### Auth (1–8)
| # | Method | URL | Description |
|---|--------|-----|-------------|
| 1 | POST | `/api/auth/register/` | Register new user |
| 2 | POST | `/api/auth/login/` | Login → JWT tokens |
| 3 | POST | `/api/auth/logout/` | Blacklist refresh token |
| 4 | POST | `/api/auth/token/refresh/` | Refresh access token |
| 5 | POST | `/api/auth/token/verify/` | Verify token validity |
| 6 | GET | `/api/auth/profile/` | Get own profile |
| 7 | PATCH | `/api/auth/profile/` | Update profile |
| 8 | POST | `/api/auth/change-password/` | Change password |

### Tasks (9–17)
| # | Method | URL | Description |
|---|--------|-----|-------------|
| 9 | GET | `/api/tasks/` | List tasks (filterable, searchable, paginated) |
| 10 | POST | `/api/tasks/` | Create task |
| 11 | GET | `/api/tasks/{id}/` | Retrieve task |
| 12 | PUT | `/api/tasks/{id}/` | Full update task |
| 13 | PATCH | `/api/tasks/{id}/` | Partial update task |
| 14 | DELETE | `/api/tasks/{id}/` | Delete task |
| 15 | GET | `/api/tasks/stats/` | Aggregated stats |
| 16 | POST | `/api/tasks/{id}/complete/` | Mark task as done |
| 17 | POST | `/api/tasks/{id}/reopen/` | Reopen completed task |

### Categories (18–21)
| # | Method | URL | Description |
|---|--------|-----|-------------|
| 18 | GET | `/api/tasks/categories/` | List categories |
| 19 | POST | `/api/tasks/categories/` | Create category |
| 20 | GET | `/api/tasks/categories/{id}/` | Retrieve category |
| 21 | DELETE | `/api/tasks/categories/{id}/` | Delete category |

### Activity (bonus)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/activity/` | List own activity log |

---

## Project Structure

```
task_manager/
├── backend/
│   ├── config/          # Django project settings & URLs
│   ├── users/           # Custom User model, JWT auth views
│   ├── tasks/           # Task & Category models, views, filters
│   ├── activity/        # ActivityLog model, signals
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, TaskCard, TaskModal, TaskFilters
    │   ├── pages/       # Login, Register, Dashboard
    │   ├── services/    # Axios API client
    │   └── stores/      # Zustand auth & task stores
    ├── package.json
    └── .env.example
```

---

## Running Both Servers Simultaneously

Open two terminals:

**Terminal 1 — Backend:**
```cmd
cd D:\project_1\task_manager\backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 — Frontend:**
```cmd
cd D:\project_1\task_manager\frontend
npm run dev
```

Open http://localhost:5173 in your browser.
