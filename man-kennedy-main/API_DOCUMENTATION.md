# API Calls Documentation

## Summary

**YES, this project has API calls**, but they are **partially implemented**:

- ✅ **Authentication API calls** - Fully implemented and working
- ❌ **Feature API calls** - Backend endpoints exist, but frontend uses localStorage instead

## Frontend API Calls (Currently Implemented)

### Location: `frontend/lib/api.ts`

**Base URL**: `http://localhost:8000/api`

### 1. Authentication Endpoints

#### Login
```typescript
POST /api/auth/login/
```
- **Method**: `api.login(email, password)`
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ access: string, refresh: string, user: {...} }`
- **Used in**: `frontend/lib/auth.tsx`, `frontend/app/page.tsx`

#### Register
```typescript
POST /api/auth/register/
```
- **Method**: `api.register(username, email, password)`
- **Request Body**: `{ username: string, email: string, password: string }`
- **Response**: `{ access: string, refresh: string, user: {...} }`
- **Used in**: `frontend/lib/auth.tsx`, `frontend/app/page.tsx`

#### Refresh Token
```typescript
POST /api/auth/token/refresh/
```
- **Method**: `api.refreshToken(refresh)`
- **Request Body**: `{ refresh: string }`
- **Response**: `{ access: string }`
- **Used in**: `frontend/lib/auth.tsx` (automatic token refresh)

#### Get Profile
```typescript
GET /api/auth/profile/
```
- **Method**: `api.getProfile()`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile data
- **Used in**: `frontend/lib/auth.tsx` (auth check)

## Backend API Endpoints (Available but Not Used by Frontend)

### 2. Mood Tracker Endpoints

**Base Path**: `/api/mood-log/`

#### List/Create Mood Entries
```typescript
GET /api/mood-log/
POST /api/mood-log/
```
- **Current Frontend**: Uses `localStorage` (see `frontend/app/mood/page.tsx`)
- **Backend View**: `MoodEntryListCreateView`
- **Authentication**: Required (JWT)

#### Mood Entry Detail
```typescript
GET /api/mood-log/<id>/
PUT /api/mood-log/<id>/
DELETE /api/mood-log/<id>/
```
- **Backend View**: `MoodEntryDetailView`
- **Authentication**: Required (JWT)

#### Mood Statistics
```typescript
GET /api/mood-log/stats/
```
- **Backend View**: `MoodStatsView`
- **Returns**: Mood counts grouped by mood type
- **Authentication**: Required (JWT)

### 3. Tasks Endpoints

**Base Path**: `/api/tasks/`

#### List/Create Tasks
```typescript
GET /api/tasks/
POST /api/tasks/
```
- **Current Frontend**: Uses `localStorage` (see `frontend/app/tasks/page.tsx`)
- **Backend View**: `TaskListCreateView`
- **Authentication**: Required (JWT)

#### Task Detail
```typescript
GET /api/tasks/<id>/
PUT /api/tasks/<id>/
DELETE /api/tasks/<id>/
```
- **Backend View**: `TaskDetailView`
- **Authentication**: Required (JWT)

#### Complete Task
```typescript
PUT /api/tasks/complete/<id>/
```
- **Backend View**: `TaskCompleteView`
- **Sets**: `completed=True`
- **Authentication**: Required (JWT)

### 4. Activity Endpoints

**Base Path**: `/api/screen-activity/`

#### List/Create Activities
```typescript
GET /api/screen-activity/
POST /api/screen-activity/
```
- **Backend View**: `ActivityListCreateView`
- **Authentication**: Required (JWT)

#### Activity Detail
```typescript
GET /api/screen-activity/<id>/
PUT /api/screen-activity/<id>/
DELETE /api/screen-activity/<id>/
```
- **Backend View**: `ActivityDetailView`
- **Authentication**: Required (JWT)

#### Activity Statistics
```typescript
GET /api/screen-activity/stats/
```
- **Backend View**: `ActivityStatsView`
- **Authentication**: Required (JWT)

#### Behavior Statistics
```typescript
GET /api/screen-activity/behavior-stats/
```
- **Backend View**: `BehaviorStatsView`
- **Authentication**: Required (JWT)

### 5. Motivation Endpoints

**Base Path**: `/api/motivation/`

#### List Quotes
```typescript
GET /api/motivation/quotes/
```
- **Backend View**: `QuoteListView`
- **Authentication**: Required (JWT)

#### Random Quote
```typescript
GET /api/motivation/quotes/random/
```
- **Backend View**: `RandomQuoteView`
- **Authentication**: Required (JWT)

#### List/Create Goals
```typescript
GET /api/motivation/goals/
POST /api/motivation/goals/
```
- **Backend View**: `GoalListCreateView`
- **Authentication**: Required (JWT)

#### Goal Detail
```typescript
GET /api/motivation/goals/<id>/
PUT /api/motivation/goals/<id>/
DELETE /api/motivation/goals/<id>/
```
- **Backend View**: `GoalDetailView`
- **Authentication**: Required (JWT)

## Current Implementation Status

### ✅ Fully Implemented
- **Authentication** (Login, Register, Token Refresh, Profile)
  - Frontend makes API calls
  - Backend endpoints working
  - JWT tokens stored in cookies

### ❌ Partially Implemented (Backend Ready, Frontend Uses localStorage)
- **Mood Tracker**
  - Backend: ✅ Complete with CRUD operations
  - Frontend: ❌ Uses `localStorage.getItem("smartBuddyMoodHistory")`
  
- **Tasks**
  - Backend: ✅ Complete with CRUD operations
  - Frontend: ❌ Uses `localStorage.getItem("smartBuddyTasks")`
  
- **Activity Tracking**
  - Backend: ✅ Complete with stats endpoints
  - Frontend: ❌ Not implemented (no frontend calls found)
  
- **Motivation (Goals & Quotes)**
  - Backend: ✅ Complete with endpoints
  - Frontend: ❌ Not implemented (no frontend calls found)

## How API Calls Are Made

### Authentication Flow
1. User submits login/register form
2. `frontend/app/page.tsx` calls `useAuth().login()` or `useAuth().register()`
3. `frontend/lib/auth.tsx` calls `api.login()` or `api.register()`
4. `frontend/lib/api.ts` makes `fetch()` request to backend
5. Response contains JWT tokens stored in cookies
6. Subsequent requests include `Authorization: Bearer <token>` header

### Token Management
- **Access Token**: Stored in cookie `token`, expires in 1 hour
- **Refresh Token**: Stored in cookie `refreshToken`, expires in 1 day
- **Auto-refresh**: `frontend/lib/auth.tsx` automatically refreshes expired tokens

## Example API Call Structure

```typescript
// From frontend/lib/api.ts
const response = await fetch(`${API_URL}/auth/login/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // Important for cookies
  body: JSON.stringify(data),
});
```

## Files Containing API Calls

### Frontend
- `frontend/lib/api.ts` - All API call functions
- `frontend/lib/auth.tsx` - Uses API for authentication
- `frontend/app/page.tsx` - Login/Register forms using API

### Backend
- `backend/core/users/views.py` - Authentication views
- `backend/core/mood_tracker/views.py` - Mood tracking views
- `backend/core/tasks/views.py` - Task management views
- `backend/core/activity/views.py` - Activity tracking views
- `backend/core/motivation/views.py` - Motivation views
- `backend/core/core/urls.py` - URL routing

## Recommendations

To fully utilize the backend API:

1. **Replace localStorage with API calls** in:
   - `frontend/app/mood/page.tsx` - Use `/api/mood-log/` endpoints
   - `frontend/app/tasks/page.tsx` - Use `/api/tasks/` endpoints

2. **Implement missing features**:
   - Activity tracking frontend
   - Motivation/Goals frontend

3. **Add error handling** for API failures
4. **Add loading states** during API calls
5. **Implement data synchronization** between frontend and backend

## Testing API Endpoints

You can test the endpoints using:

### cURL Examples

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Get Profile (with token)
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Postman/Thunder Client
- Import the endpoints from the backend
- Use JWT tokens from login response
- Test all CRUD operations



