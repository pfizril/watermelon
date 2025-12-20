# Setting Up Environment Variables for Calendar Integration

## Quick Setup

1. **Copy the example file:**
   ```bash
   cd backend/core
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your Google Calendar API credentials:
   ```bash
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/google/callback/
   ENCRYPTION_KEY=your_fernet_key
   ```

## Getting Google Calendar API Credentials

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Smart Desktop Buddies")
4. Click "Create"

### Step 2: Enable Google Calendar API
1. In the project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and click "Enable"

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External (for testing)
   - App name: Smart Desktop Buddies
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: Add `https://www.googleapis.com/auth/calendar.readonly`
   - Test users: Add your email
   - Click "Save and Continue"
4. Application type: **Web application**
5. Name: "Smart Desktop Buddies Web Client"
6. Authorized redirect URIs:
   - `http://localhost:8000/api/calendar/google/callback/`
   - (Add production URL when deploying)
7. Click "Create"
8. **Copy the Client ID and Client Secret**

### Step 4: Generate Encryption Key
Run this Python command to generate a secure encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output and use it as `ENCRYPTION_KEY` in your `.env` file.

## Complete .env File Example

```bash
# Google Calendar API
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/google/callback/

# Encryption Key (32 bytes, base64-encoded)
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP=
```

## Verification

After setting up, restart your Django server:
```bash
python manage.py runserver
```

Then try connecting a calendar. The error should be gone!

## Troubleshooting

### Error: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set"
- Make sure `.env` file exists in `backend/core/` directory
- Check that variables are set correctly (no quotes needed)
- Restart Django server after creating/editing `.env`

### Error: "Invalid client"
- Check that Client ID and Secret are correct
- Make sure no extra spaces or quotes in `.env` file

### Error: "Redirect URI mismatch"
- Verify redirect URI in `.env` matches exactly with Google Cloud Console
- Must be: `http://localhost:8000/api/calendar/google/callback/`

### Encryption Key Issues
- Make sure ENCRYPTION_KEY is a valid Fernet key (32 bytes, base64)
- Don't change the key after storing tokens (you'll need to reconnect calendars)

## Security Notes

⚠️ **Never commit `.env` file to git!**
- `.env` should be in `.gitignore`
- Use `.env.example` as a template
- In production, use environment variables or secure secret management

