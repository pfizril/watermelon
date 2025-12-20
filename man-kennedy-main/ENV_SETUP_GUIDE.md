# Environment Variables Setup Guide

## Quick Fix for "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set" Error

### Step 1: Create .env File

Create a file named `.env` in the `backend/core/` directory with the following content:

```bash
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/google/callback/

# Encryption Key for OAuth Tokens
ENCRYPTION_KEY=your_32_byte_fernet_key_here
```

### Step 2: Get Google Calendar API Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing)
3. **Enable Google Calendar API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure OAuth consent screen (if first time):
     - User Type: External
     - App name: Smart Desktop Buddies
     - Add your email
     - Add scope: `https://www.googleapis.com/auth/calendar.readonly`
   - Application type: **Web application**
   - Name: "Smart Desktop Buddies"
   - Authorized redirect URIs: `http://localhost:8000/api/calendar/google/callback/`
   - Click "Create"
   - **Copy Client ID and Client Secret**

### Step 3: Generate Encryption Key

Run this command in your terminal:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output and use it as `ENCRYPTION_KEY` in your `.env` file.

### Step 4: Update .env File

Replace the placeholder values in your `.env` file:

```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/google/callback/
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP=
```

### Step 5: Restart Django Server

After creating/updating the `.env` file, restart your Django server:

```bash
cd backend/core
python manage.py runserver
```

## File Location

The `.env` file should be located at:
```
backend/core/.env
```

## Important Notes

- ⚠️ **Never commit `.env` to git!** It contains sensitive credentials.
- The `.env` file is automatically loaded by `python-dotenv` (already in requirements.txt)
- Make sure there are **no spaces** around the `=` sign in `.env`
- Don't use quotes around values in `.env` file
- Restart Django server after any changes to `.env`

## Verification

After setup, try connecting Google Calendar again. The error should be resolved!

## Troubleshooting

### Still getting the error?
1. Check `.env` file is in `backend/core/` directory
2. Verify variable names are exactly: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.
3. Make sure no typos in variable names
4. Restart Django server
5. Check Django server logs for any other errors

### Redirect URI mismatch?
- Make sure redirect URI in `.env` matches exactly with Google Cloud Console
- Must be: `http://localhost:8000/api/calendar/google/callback/` (with trailing slash)

