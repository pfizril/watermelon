# Quick Setup Guide

This is a condensed version of the setup process. Refer to README.md for detailed explanations.

## Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ and npm installed
- [ ] PostgreSQL installed and running
- [ ] Database `manDB` created

## Quick Start Commands

### 1. Database Setup (One-time)
```sql
-- In PostgreSQL (psql or pgAdmin)
CREATE DATABASE manDB;
```

### 2. Backend Setup (Terminal 1)
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR: venv\Scripts\activate.bat  # Windows CMD
pip install -r requirements.txt
cd core
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Database connection error | Check PostgreSQL is running, verify credentials in `backend/core/core/settings.py` |
| Port 8000 in use | Use `python manage.py runserver 8001` and update `frontend/lib/api.ts` |
| Port 3000 in use | Use `npm run dev -- -p 3001` |
| Module not found | Delete `node_modules`, run `npm install` again |
| Migration errors | Run `python manage.py migrate --run-syncdb` |

## Database Credentials (Current)

- **Database**: manDB
- **User**: postgres
- **Password**: fizril2001
- **Host**: localhost
- **Port**: 5432

⚠️ **Note**: These credentials are hardcoded. For production, use environment variables.




