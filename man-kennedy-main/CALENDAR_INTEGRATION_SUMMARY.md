# Calendar Integration - Quick Start Guide

## 🎯 Goal
Replace static calendar events with real-time synchronization from external calendars (Google Calendar, Outlook, Apple Calendar).

## 📋 Implementation Phases

### ✅ Phase 1: Backend Foundation (2-3 days)
- Create `calendar_sync` Django app
- Create database models:
  - `CalendarConnection` (stores OAuth tokens, calendar info)
  - `CalendarEvent` (stores synced events)
- Create serializers and basic views

### ✅ Phase 2: Google Calendar OAuth (2-3 days)
- Set up Google Cloud Project
- Implement OAuth2 flow
- Endpoints:
  - `/api/calendar/google/authorize/` - Start OAuth
  - `/api/calendar/google/callback/` - Handle callback
- Token encryption for security

### ✅ Phase 3: Sync Logic (2-3 days)
- Implement sync service to fetch events from Google Calendar
- Create/update/delete events in local database
- Handle token refresh automatically
- Support manual and automatic sync

### ✅ Phase 4: Frontend API Client (1 day)
- Add calendar functions to `api.ts`:
  - `connectGoogleCalendar()`
  - `getCalendarConnections()`
  - `syncCalendar()`
  - `getUpcomingEvents()`

### ✅ Phase 5: Settings UI (2 days)
- Add "Calendar Integration" section to Settings page
- Display connected calendars
- Connect/Disconnect buttons
- Sync status and manual sync button

### ✅ Phase 6: Dashboard Integration (1-2 days)
- Replace static "Upcoming Events" with real API data
- Fetch and display events from connected calendars
- Show event details (title, time, source)

## 🔑 Key Features

### For Users
- ✅ Connect Google Calendar with one click
- ✅ See upcoming events on dashboard
- ✅ Manual sync button
- ✅ Disconnect calendars anytime

### Technical
- ✅ Secure token storage (encrypted)
- ✅ Automatic token refresh
- ✅ Efficient sync (only changed events)
- ✅ Error handling and fallbacks

## 📦 Required Dependencies

### Backend (`requirements.txt`)
```
google-auth==2.23.4
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
google-api-python-client==2.100.0
cryptography==41.0.7
```

## 🔐 Google Cloud Setup Required

1. Create Google Cloud Project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:8000/api/calendar/google/callback/`
5. Get Client ID and Client Secret

## 📊 Database Schema

### CalendarConnection
- user, provider, access_token (encrypted), refresh_token (encrypted)
- calendar_id, calendar_name, is_active, last_synced_at

### CalendarEvent
- user, calendar_connection, external_event_id
- title, description, start_time, end_time, location, all_day

## 🚀 Quick Start

1. **Review the full plan**: `CALENDAR_INTEGRATION_PLAN.md`
2. **Set up Google Cloud**: Create OAuth credentials
3. **Start Phase 1**: Create calendar Django app
4. **Test incrementally**: Each phase should be tested before moving on

## 📝 API Endpoints

```
GET  /api/calendar/google/authorize/     - Start OAuth flow
GET  /api/calendar/google/callback/     - OAuth callback
GET  /api/calendar/connections/         - List connections
POST /api/calendar/connections/<id>/disconnect/ - Disconnect
POST /api/calendar/sync/                 - Manual sync
GET  /api/calendar/events/upcoming/      - Get upcoming events
```

## ⚠️ Important Notes

- **Security**: All tokens encrypted at rest
- **Rate Limits**: Google Calendar API: 1M queries/day (generous)
- **HTTPS Required**: OAuth redirects must use HTTPS in production
- **User Privacy**: Users can only access their own calendars

## 🎨 UI Changes

### Settings Page
- New section: "Calendar Integration"
- List of connected calendars
- "Connect Google Calendar" button
- Sync status indicators

### Dashboard
- "Upcoming Events" section shows real events
- Events from all connected calendars merged
- Color-coded by calendar source

## 📈 Future Enhancements

- Outlook Calendar support
- Apple Calendar support
- Create events from app
- Two-way sync (create events in external calendar)
- Event reminders integration
- Calendar-specific settings

---

**Ready to implement?** Start with Phase 1: Create the calendar Django app and models.

