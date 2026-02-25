# Route Manifest

## Pages

| Route | Description | Auth Required |
|---|---|---|
| `/` | Marketing landing page | No |
| `/dashboard` | Student data explorer (list, edit, export) | Yes (Google OAuth) |

## API Routes

| Route | Method | Description | Auth Required |
|---|---|---|---|
| `/api/auth/google` | GET | Initiates Google OAuth flow | No |
| `/api/auth/callback` | GET | Handles OAuth callback and returns refresh token | No |
| `/api/students` | GET | Fetches and maps student records from Google Sheets | Yes (refresh token) |
| `/api/export` | POST | Fills PDF template with student data and returns binary PDF | Yes (refresh token) |
| `/api/health` | GET | Health check — returns service status and timestamp | No |

## Auth Notes

- **Protected routes** (`/api/students`, `/api/export`) require `GOOGLE_OAUTH_REFRESH_TOKEN` to be set in environment variables.
- If the token is missing, `/api/students` returns `401` with a link to `/api/auth/google`.
- `/api/auth/google` → `/api/auth/callback` → displays refresh token to copy into `.env.local`.
