# Man-Kennedy Project

A full-stack mental health and productivity tracking application built with Django REST Framework (backend) and Next.js (frontend).

## Project Structure

```
man-kennedy-main/
├── backend/          # Django REST API
│   └── core/        # Django project root
│       ├── users/    # User authentication & profiles
│       ├── mood_tracker/  # Mood logging
│       ├── tasks/    # Task management
│       ├── activity/ # Screen activity tracking
│       └── motivation/ # Goals & motivation
└── frontend/         # Next.js application
```

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+** and **npm** - [Download Node.js](https://nodejs.org/)
3. **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)
4. **Git** - [Download Git](https://git-scm.com/downloads)

## Step-by-Step Setup Instructions

### Step 1: Clone and Navigate to Project

```bash
# If you haven't already, navigate to the project directory
cd man-kennedy-main
```

### Step 2: Set Up PostgreSQL Database

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [PostgreSQL website](https://www.postgresql.org/download/windows/)
   - During installation, remember your postgres user password

2. **Create the Database**
   ```bash
   # Open PostgreSQL command line (psql) or use pgAdmin
   # Connect as postgres user
   psql -U postgres
   ```

   Then run:
   ```sql
   CREATE DATABASE manDB;
   \q
   ```

3. **Note Database Credentials**
   - Database Name: `manDB`
   - User: `postgres`
   - Password: `fizril2001` (as configured in settings.py)
   - Host: `localhost`
   - Port: `5432`

   ⚠️ **Security Note**: The database password is hardcoded in `settings.py`. For production, use environment variables.

### Step 3: Set Up Backend (Django)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a Python Virtual Environment**
   ```bash
   # Windows
   python -m venv venv

   # Activate virtual environment
   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # Windows (Command Prompt)
   venv\Scripts\activate.bat
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Navigate to Django Project Root**
   ```bash
   cd core
   ```

5. **Run Database Migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a Superuser (Optional - for Django Admin)**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create an admin user.

7. **Start the Django Development Server**
   ```bash
   python manage.py runserver
   ```

   The backend API will be available at: **http://localhost:8000**

   - API Base URL: `http://localhost:8000/api`
   - Admin Panel: `http://localhost:8000/admin`

### Step 4: Set Up Frontend (Next.js)

1. **Open a New Terminal Window** (keep backend server running)

2. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

3. **Install Node Dependencies**
   ```bash
   npm install
   ```
   or if you prefer using pnpm (since pnpm-lock.yaml exists):
   ```bash
   pnpm install
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   or with pnpm:
   ```bash
   pnpm dev
   ```

   The frontend will be available at: **http://localhost:3000**

### Step 5: Verify Installation

1. **Backend Check**
   - Visit `http://localhost:8000/admin` - Should show Django admin login
   - Visit `http://localhost:8000/api/auth/register/` - Should show API endpoint (may require POST request)

2. **Frontend Check**
   - Visit `http://localhost:3000` - Should show the application homepage

3. **API Connection**
   - The frontend is configured to connect to `http://localhost:8000/api`
   - Ensure both servers are running simultaneously

## Running the Application

### Start Backend Server
```bash
# Terminal 1
cd backend
.\venv\Scripts\Activate.ps1  # or venv\Scripts\activate.bat
cd core
python manage.py runserver
```

### Start Frontend Server
```bash
# Terminal 2
cd frontend
npm run dev
```

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**
  - `POST /api/auth/register/` - User registration
  - `POST /api/auth/login/` - User login
  - `POST /api/auth/token/refresh/` - Refresh JWT token
  - `GET /api/auth/profile/` - Get user profile

- **Mood Tracker**
  - `/api/mood-log/` - Mood logging endpoints

- **Tasks**
  - `/api/tasks/` - Task management endpoints

- **Activity**
  - `/api/screen-activity/` - Screen activity tracking

- **Motivation**
  - `/api/motivation/` - Goals and motivation endpoints

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Verify database credentials in `backend/core/core/settings.py`
   - Check if database `manDB` exists

2. **Migration Errors**
   - Try: `python manage.py migrate --run-syncdb`
   - If issues persist, delete migration files (except `__init__.py`) and re-run migrations

3. **Port Already in Use**
   - Change port: `python manage.py runserver 8001`
   - Update frontend API URL in `frontend/lib/api.ts`

### Frontend Issues

1. **Module Not Found**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

2. **API Connection Failed**
   - Ensure backend server is running on port 8000
   - Check CORS settings in `backend/core/core/settings.py`
   - Verify API URL in `frontend/lib/api.ts`

3. **TypeScript Errors**
   - The project is configured to ignore build errors (see `next.config.mjs`)
   - For development, these can be safely ignored

## Development Notes

- **Database Password**: Currently hardcoded in `settings.py`. For production, use environment variables.
- **Secret Key**: Django secret key is set to a default value. Change this for production.
- **CORS**: Configured to allow requests from `localhost:3000`
- **JWT Tokens**: Access tokens expire in 60 minutes, refresh tokens in 1 day

## Technologies Used

### Backend
- Django 5.0.2
- Django REST Framework 3.14.0
- PostgreSQL
- JWT Authentication
- CORS Headers

### Frontend
- Next.js 15.2.4
- React 18.2.0
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts (for analytics)

## License

This is a final year project (FYP).
