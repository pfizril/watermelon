# Step-by-Step Implementation Guide

This document provides a detailed analysis and step-by-step instructions to run the Man-Kennedy project.

## Project Analysis

### Architecture Overview

**Backend (Django REST Framework)**
- Framework: Django 5.0.2 with Django REST Framework
- Database: PostgreSQL (manDB)
- Authentication: JWT (JSON Web Tokens) via djangorestframework-simplejwt
- Port: 8000
- API Base URL: `http://localhost:8000/api`

**Frontend (Next.js)**
- Framework: Next.js 15.2.4 with React 18.2.0
- Language: TypeScript
- Styling: Tailwind CSS with shadcn/ui components
- Port: 3000
- API Connection: Configured to connect to `http://localhost:8000/api`

### Application Modules

1. **Users** - Custom user authentication and profiles
2. **Mood Tracker** - Daily mood logging and tracking
3. **Tasks** - Task management with priorities and status
4. **Activity** - Screen activity tracking
5. **Motivation** - Goals and motivational quotes

## Implementation Steps

### Phase 1: Environment Preparation

#### Step 1.1: Verify Prerequisites
```bash
# Check Python version (need 3.8+)
python --version

# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version

# Check PostgreSQL (should be running)
# Windows: Check Services or run:
psql --version
```

#### Step 1.2: Install Missing Prerequisites
- **Python**: Download from https://www.python.org/downloads/
- **Node.js**: Download from https://nodejs.org/
- **PostgreSQL**: Download from https://www.postgresql.org/download/

### Phase 2: Database Setup

#### Step 2.1: Start PostgreSQL Service
```bash
# Windows - Check if PostgreSQL service is running
# Open Services (services.msc) and ensure "postgresql-x64-XX" is running
# OR use pgAdmin to verify connection
```

#### Step 2.2: Create Database
```sql
-- Option 1: Using psql command line
psql -U postgres
CREATE DATABASE manDB;
\q

-- Option 2: Using pgAdmin
-- Right-click Databases → Create → Database
-- Name: manDB
-- Owner: postgres
```

#### Step 2.3: Verify Database Credentials
Current configuration in `backend/core/core/settings.py`:
- Database Name: `manDB`
- User: `postgres`
- Password: `fizril2001`
- Host: `localhost`
- Port: `5432`

**⚠️ Important**: If your PostgreSQL password is different, update `settings.py` or create a user with password `fizril2001`.

### Phase 3: Backend Setup

#### Step 3.1: Navigate to Backend Directory
```bash
cd man-kennedy-main/backend
```

#### Step 3.2: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows Command Prompt:
venv\Scripts\activate.bat

# You should see (venv) prefix in your terminal
```

#### Step 3.3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- Django==5.0.2
- djangorestframework==3.14.0
- dj-rest-auth==5.0.2
- psycopg2-binary==2.9.9 (PostgreSQL adapter)
- python-dotenv==1.0.1
- django-cors-headers==4.3.1
- django-filter==23.5
- djangorestframework-simplejwt==5.3.1
- gunicorn==21.2.0
- whitenoise==6.6.0

#### Step 3.4: Navigate to Django Project Root
```bash
cd core
```

#### Step 3.5: Run Database Migrations
```bash
# Apply all migrations
python manage.py migrate

# Expected output should show migrations for:
# - users
# - mood_tracker
# - tasks
# - activity
# - motivation
# - django default apps (admin, auth, sessions, etc.)
```

#### Step 3.6: Create Superuser (Optional)
```bash
python manage.py createsuperuser
# Follow prompts:
# Username: (your choice)
# Email: (your email)
# Password: (your password)
```

#### Step 3.7: Start Django Development Server
```bash
python manage.py runserver
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Verification:**
- Open browser: http://localhost:8000/admin
- Should see Django admin login page
- Open: http://localhost:8000/api/auth/register/
- Should see API endpoint (may show error if accessed via GET, which is expected)

### Phase 4: Frontend Setup

#### Step 4.1: Open New Terminal Window
Keep the backend server running in the first terminal.

#### Step 4.2: Navigate to Frontend Directory
```bash
cd man-kennedy-main/frontend
```

#### Step 4.3: Install Node Dependencies
```bash
npm install
```

This installs all dependencies including:
- Next.js 15.2.4
- React 18.2.0
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for analytics
- And many more...

**Note**: If you encounter issues, try:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Step 4.4: Start Next.js Development Server
```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
  - Ready in X seconds
```

**Verification:**
- Open browser: http://localhost:3000
- Should see the application homepage

### Phase 5: Application Verification

#### Step 5.1: Test Backend API
```bash
# Test registration endpoint (using curl or Postman)
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

#### Step 5.2: Test Frontend-Backend Connection
1. Open http://localhost:3000
2. Try to register a new user
3. Check browser console (F12) for any errors
4. Verify API calls are being made to `http://localhost:8000/api`

#### Step 5.3: Verify CORS Configuration
- Backend allows requests from `http://localhost:3000`
- Configured in `backend/core/core/settings.py`:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
  ]
  ```

## Running the Application

### Daily Startup Sequence

**Terminal 1 - Backend:**
```bash
cd man-kennedy-main/backend
.\venv\Scripts\Activate.ps1  # Activate venv
cd core
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd man-kennedy-main/frontend
npm run dev
```

### Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **API Documentation**: Available at each endpoint

## Troubleshooting Guide

### Issue 1: Database Connection Error
**Error**: `django.db.utils.OperationalError: could not connect to server`

**Solutions:**
1. Ensure PostgreSQL service is running
2. Verify database exists: `psql -U postgres -l` (should list manDB)
3. Check credentials in `backend/core/core/settings.py`
4. Test connection: `psql -U postgres -d manDB`

### Issue 2: Port Already in Use
**Error**: `Error: That port is already in use`

**Backend Solution:**
```bash
python manage.py runserver 8001
# Then update frontend/lib/api.ts:
# const API_URL = 'http://localhost:8001/api';
```

**Frontend Solution:**
```bash
npm run dev -- -p 3001
```

### Issue 3: Migration Errors
**Error**: `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solutions:**
```bash
# Option 1: Reset migrations (WARNING: Deletes data)
python manage.py migrate --run-syncdb

# Option 2: Fake migrations
python manage.py migrate --fake

# Option 3: Check migration status
python manage.py showmigrations
```

### Issue 4: Module Not Found (Python)
**Error**: `ModuleNotFoundError: No module named 'django'`

**Solution:**
```bash
# Ensure virtual environment is activated
# You should see (venv) in terminal
# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 5: Module Not Found (Node)
**Error**: `Cannot find module 'next'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 6: CORS Errors
**Error**: `Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
- Verify `django-cors-headers` is installed
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`
- Ensure `corsheaders` is in `INSTALLED_APPS` and `MIDDLEWARE`

### Issue 7: JWT Token Errors
**Error**: `Authentication credentials were not provided`

**Solution:**
- Check if token is stored in cookies (browser DevTools → Application → Cookies)
- Verify API calls include `Authorization: Bearer <token>` header
- Check token expiration (60 minutes for access token)

## Production Considerations

### Security Improvements Needed

1. **Environment Variables**
   - Move `SECRET_KEY` to environment variable
   - Move database credentials to `.env` file
   - Use `python-dotenv` to load from `.env`

2. **Secret Key**
   - Generate new secret key: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
   - Store in environment variable

3. **Database Password**
   - Never commit passwords to version control
   - Use environment variables or secret management

4. **Debug Mode**
   - Set `DEBUG = False` in production
   - Configure `ALLOWED_HOSTS` properly

5. **CORS**
   - Restrict `CORS_ALLOWED_ORIGINS` to production domain only

## Next Steps After Setup

1. **Create Test User**
   - Register via frontend at http://localhost:3000
   - Or create via Django admin

2. **Explore Features**
   - Mood tracking
   - Task management
   - Activity monitoring
   - Motivation goals

3. **Customize Configuration**
   - Update database credentials if needed
   - Modify CORS settings for different ports
   - Adjust JWT token lifetimes

## Summary

The Man-Kennedy project is a full-stack application requiring:
- ✅ PostgreSQL database setup
- ✅ Python virtual environment and Django setup
- ✅ Node.js dependencies and Next.js setup
- ✅ Both servers running simultaneously

Follow the phases in order, and refer to the troubleshooting section if you encounter issues.






