# Calendar Integration / Sync with External Calendar - Implementation Plan

## Overview
This document outlines a comprehensive plan to implement calendar integration and synchronization with external calendar services (primarily Google Calendar, with extensibility for Outlook and Apple Calendar).

## Current State Analysis

### Existing Components
- ✅ Calendar UI component exists (`frontend/components/ui/calendar.tsx`)
- ✅ Dashboard has static "Upcoming Events" section (hardcoded data)
- ❌ No backend calendar app
- ❌ No OAuth integration
- ❌ No calendar sync functionality
- ❌ No database models for calendar events

### Requirements from FYP Report
- **UC-22: Sync Calendar** - User can synchronize external calendar with desktop buddy's productivity tools
- Calendar events should be displayed and integrated into reminders and schedules
- Events should be linked to productivity interface

## Implementation Strategy

### Phase 1: Backend Foundation
**Goal**: Create calendar app with database models and basic structure

#### 1.1 Create Calendar Django App
- Create new Django app: `calendar_sync`
- Add to `INSTALLED_APPS` in settings.py

#### 1.2 Database Models
**File**: `backend/core/calendar_sync/models.py`

```python
# CalendarConnection Model
- user (ForeignKey to User)
- provider (choices: 'google', 'outlook', 'apple')
- access_token (encrypted)
- refresh_token (encrypted)
- token_expires_at (DateTime)
- calendar_id (string - external calendar ID)
- calendar_name (string)
- is_active (boolean)
- last_synced_at (DateTime)
- sync_enabled (boolean)

# CalendarEvent Model
- user (ForeignKey to User)
- calendar_connection (ForeignKey to CalendarConnection)
- external_event_id (string - unique ID from external calendar)
- title (string)
- description (text, optional)
- start_time (DateTime)
- end_time (DateTime)
- location (string, optional)
- all_day (boolean)
- recurrence_rule (string, optional - for recurring events)
- last_modified (DateTime - from external calendar)
- created_at (DateTime)
- updated_at (DateTime)
```

#### 1.3 Serializers
**File**: `backend/core/calendar_sync/serializers.py`
- `CalendarConnectionSerializer`
- `CalendarEventSerializer`
- `CalendarSyncStatusSerializer`

### Phase 2: Google Calendar OAuth2 Integration
**Goal**: Implement OAuth2 flow for Google Calendar access

#### 2.1 Dependencies
Add to `requirements.txt`:
```
google-auth==2.23.4
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
google-api-python-client==2.100.0
cryptography==41.0.7  # For encrypting tokens
```

#### 2.2 Google Cloud Setup
1. Create Google Cloud Project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URIs:
   - `http://localhost:8000/api/calendar/google/callback/` (development)
   - Production URL (when deployed)

#### 2.3 Environment Variables
Add to `.env` file (or settings):
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/google/callback/
ENCRYPTION_KEY=your_32_byte_key_for_token_encryption
```

#### 2.4 OAuth Flow Implementation
**File**: `backend/core/calendar_sync/views.py`

**Endpoints**:
1. `GET /api/calendar/google/authorize/` - Initiate OAuth flow
2. `GET /api/calendar/google/callback/` - Handle OAuth callback
3. `GET /api/calendar/connections/` - List user's calendar connections
4. `POST /api/calendar/connections/<id>/disconnect/` - Disconnect calendar
5. `POST /api/calendar/sync/` - Manual sync trigger
6. `GET /api/calendar/events/` - List calendar events
7. `GET /api/calendar/events/upcoming/` - Get upcoming events

### Phase 3: Calendar Sync Logic
**Goal**: Implement synchronization between external calendars and local database

#### 3.1 Sync Service
**File**: `backend/core/calendar_sync/services.py`

**Functions**:
- `sync_google_calendar(connection)` - Sync events from Google Calendar
- `fetch_google_events(access_token, calendar_id, time_min, time_max)`
- `create_or_update_event(user, connection, event_data)`
- `delete_event(external_event_id)`
- `encrypt_token(token)` / `decrypt_token(encrypted_token)`

#### 3.2 Sync Strategy
- **Initial Sync**: Fetch all events from last 30 days + next 90 days
- **Incremental Sync**: Only fetch events modified since last sync
- **Conflict Resolution**: External calendar takes precedence
- **Sync Frequency**: 
  - Manual: User-triggered
  - Automatic: Every 15 minutes (background task)

#### 3.3 Background Tasks (Optional)
Use Celery or Django-Q for periodic sync:
- Install `django-q` or `celery`
- Create periodic task to sync all active connections

### Phase 4: Frontend API Client
**Goal**: Add calendar API functions to frontend

#### 4.1 API Functions
**File**: `frontend/lib/api.ts`

**Functions**:
```typescript
- api.connectGoogleCalendar() - Initiate OAuth flow
- api.getCalendarConnections() - Get user's connected calendars
- api.disconnectCalendar(connectionId) - Disconnect calendar
- api.syncCalendar(connectionId) - Trigger manual sync
- api.getCalendarEvents(startDate, endDate) - Get events
- api.getUpcomingEvents(limit) - Get upcoming events
```

### Phase 5: Calendar Connection UI
**Goal**: Build UI for connecting/disconnecting calendars

#### 5.1 Settings Page Integration
**File**: `frontend/app/settings/page.tsx`

**Features**:
- Section: "Calendar Integration"
- List of connected calendars
- "Connect Google Calendar" button
- Disconnect button for each connection
- Sync status indicator
- Manual sync button
- Last synced timestamp

#### 5.2 OAuth Flow UI
- Modal/popup for OAuth redirect
- Loading state during OAuth
- Success/error messages

### Phase 6: Dashboard Integration
**Goal**: Replace static events with real calendar data

#### 6.1 Update Dashboard
**File**: `frontend/app/dashboard/page.tsx`

**Changes**:
- Replace static "Upcoming Events" with API call
- Fetch upcoming events on component mount
- Display real events from connected calendars
- Show event title, time, and calendar source
- Handle empty state (no events)
- Add "Sync Calendars" quick action

#### 6.2 Event Display
- Format: "Event Title - Time"
- Color code by calendar source
- Link to full calendar view (future enhancement)
- Show "No upcoming events" if empty

### Phase 7: Advanced Features (Future)
- Calendar event creation from app
- Two-way sync (create events in external calendar)
- Multiple calendar support (merge events)
- Event filtering and search
- Calendar-specific settings
- Outlook/Apple Calendar support

## Technical Implementation Details

### OAuth2 Flow Diagram
```
1. User clicks "Connect Google Calendar"
2. Frontend calls: GET /api/calendar/google/authorize/
3. Backend redirects to Google OAuth consent screen
4. User authorizes access
5. Google redirects to: /api/calendar/google/callback/?code=...
6. Backend exchanges code for tokens
7. Backend stores encrypted tokens in database
8. Backend triggers initial sync
9. Frontend receives success response
10. Dashboard displays events
```

### Token Security
- **Encryption**: Use `cryptography` library to encrypt tokens at rest
- **Refresh**: Automatically refresh expired tokens using refresh_token
- **Storage**: Never log or expose tokens in responses

### API Rate Limiting
- Google Calendar API: 1,000,000 queries/day (generous)
- Implement request throttling per user
- Cache events for short periods (5-10 minutes)

### Error Handling
- OAuth errors (user denied, expired)
- API errors (quota exceeded, invalid token)
- Network errors (timeout, connection failed)
- Sync errors (partial sync, conflict resolution)

## Database Schema

### CalendarConnection Table
```
id (PK)
user_id (FK -> users_customuser)
provider (varchar: 'google', 'outlook', 'apple')
access_token (encrypted text)
refresh_token (encrypted text)
token_expires_at (datetime)
calendar_id (varchar)
calendar_name (varchar)
is_active (boolean)
last_synced_at (datetime)
sync_enabled (boolean)
created_at (datetime)
updated_at (datetime)
```

### CalendarEvent Table
```
id (PK)
user_id (FK -> users_customuser)
calendar_connection_id (FK -> calendar_connection)
external_event_id (varchar, unique)
title (varchar)
description (text, nullable)
start_time (datetime)
end_time (datetime)
location (varchar, nullable)
all_day (boolean)
recurrence_rule (varchar, nullable)
last_modified (datetime)
created_at (datetime)
updated_at (datetime)

Indexes:
- user_id + start_time (for efficient queries)
- external_event_id (for sync lookups)
```

## API Endpoints Summary

### Authentication & Connection
- `GET /api/calendar/google/authorize/` - Start OAuth flow
- `GET /api/calendar/google/callback/` - OAuth callback handler
- `GET /api/calendar/connections/` - List connections
- `POST /api/calendar/connections/<id>/disconnect/` - Disconnect

### Events & Sync
- `GET /api/calendar/events/` - List events (with date filters)
- `GET /api/calendar/events/upcoming/` - Get upcoming events (next 7 days)
- `POST /api/calendar/sync/` - Trigger manual sync
- `GET /api/calendar/sync/status/` - Get sync status

## Frontend Components

### New Components Needed
1. **CalendarConnectionCard** - Display connected calendar info
2. **CalendarSyncButton** - Manual sync trigger
3. **UpcomingEventsList** - Display events (reusable)
4. **OAuthModal** - Handle OAuth redirect flow

### Updated Components
1. **Dashboard** - Replace static events
2. **Settings** - Add calendar section

## Testing Checklist

### Backend Testing
- [ ] OAuth flow completes successfully
- [ ] Tokens are encrypted and stored correctly
- [ ] Calendar sync fetches events correctly
- [ ] Events are created/updated/deleted properly
- [ ] Error handling for expired tokens
- [ ] Error handling for API failures
- [ ] Multiple calendar connections work
- [ ] Disconnect removes events correctly

### Frontend Testing
- [ ] OAuth flow UI works correctly
- [ ] Calendar connection displays in settings
- [ ] Dashboard shows real events
- [ ] Manual sync button works
- [ ] Disconnect button works
- [ ] Empty states display correctly
- [ ] Loading states work
- [ ] Error messages display properly

## Security Considerations

1. **Token Encryption**: All tokens encrypted at rest
2. **HTTPS Only**: OAuth redirects must use HTTPS in production
3. **Scope Limitation**: Request only necessary Google Calendar scopes
4. **Token Refresh**: Automatic refresh before expiration
5. **User Isolation**: Users can only access their own calendars
6. **Rate Limiting**: Prevent abuse of sync endpoints

## Deployment Checklist

### Environment Setup
- [ ] Google Cloud Project created
- [ ] Google Calendar API enabled
- [ ] OAuth credentials configured
- [ ] Redirect URIs added (dev + production)
- [ ] Environment variables set
- [ ] Encryption key generated

### Database
- [ ] Run migrations
- [ ] Create indexes for performance

### Monitoring
- [ ] Set up logging for sync operations
- [ ] Monitor API quota usage
- [ ] Track sync success/failure rates

## Timeline Estimate

- **Phase 1** (Backend Foundation): 2-3 days
- **Phase 2** (OAuth Integration): 2-3 days
- **Phase 3** (Sync Logic): 2-3 days
- **Phase 4** (Frontend API): 1 day
- **Phase 5** (Connection UI): 2 days
- **Phase 6** (Dashboard Integration): 1-2 days
- **Phase 7** (Testing & Bug Fixes): 2-3 days

**Total Estimated Time**: 12-17 days

## Dependencies

### Backend
```
google-auth==2.23.4
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
google-api-python-client==2.100.0
cryptography==41.0.7
```

### Frontend
- No new dependencies needed (use existing fetch/API patterns)

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Django OAuth Tutorial](https://developers.google.com/identity/protocols/oauth2/web-server)
- [iCalendar RFC 5545](https://tools.ietf.org/html/rfc5545) (for future CalDAV support)

## Next Steps

1. Review and approve this plan
2. Set up Google Cloud Project and OAuth credentials
3. Begin Phase 1: Create calendar Django app
4. Implement incrementally, testing each phase
5. Deploy to staging environment for testing
6. Gather user feedback and iterate

---

**Status**: Planning Phase
**Last Updated**: 2025-01-XX
**Owner**: Development Team

