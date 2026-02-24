# El Sur Driving School — Data Exporter

**Date:** 2026-02-24
**Branch:** `test`
**Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4

---

## TL;DR

A dark-themed internal web app for **El Sur Driving School** that reads student records from a private Google Sheet via the Sheets API (OAuth 2.0), displays them in a selectable table, and lets staff view, edit, and export student data — all within the browser's local state.

---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Google Sheets API & OAuth 2.0](#google-sheets-api--oauth-20)
5. [Student Schema](#student-schema)
6. [Project Structure](#project-structure)
7. [Running Tests](#running-tests)

---

## Features

- 🔐 OAuth 2.0 authentication with Google (one-time authorization flow)
- 📋 Reads student records from a Google Sheet on page load
- ✅ Selectable table with select-all and per-row checkboxes
- 🔍 Click any student name to open a full-detail edit modal
- ✏️ Edit all 36 student fields locally (changes are not written back to the sheet)
- ➕ Add new students (local state only)
- ✔️ Email format validation and numeric type validation on form inputs
- 📤 Export button (enabled when students are selected)
- 🧪 27 unit + integration tests via Vitest

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run you will see an authorization prompt — see [Google Sheets API & OAuth 2.0](#google-sheets-api--oauth-20) below.

---

## Environment Variables

Create a `.env` file in the project root (already in `.gitignore`):

```env
# Google Sheets API key (legacy — not used when OAuth is active)
GOOGLE_SHEETS_API_KEY=your_api_key_here

# Google Sheet ID (find it in the sheet URL)
# https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
GOOGLE_SHEETS_ID=your_sheet_id_here

# OAuth 2.0 Web Client credentials (from Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Populated automatically after the one-time OAuth flow
GOOGLE_OAUTH_REFRESH_TOKEN=
```

> **Never commit `.env` or `oauth2.keys.json`** — both are in `.gitignore`.

---

## Google Sheets API & OAuth 2.0

The app uses a **Web OAuth 2.0 client** (not a service account) to authenticate with the Google Sheets API. This means:

- The sheet can remain **private** — no need to share it publicly.
- A one-time consent flow yields a **refresh token** that is stored in `.env` and reused for all subsequent API calls.

### Setup Steps

#### 1. Create OAuth 2.0 credentials

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a **Web application** OAuth 2.0 client
3. Add `http://localhost:3000/api/auth/callback` to **Authorized redirect URIs**
4. Download the JSON and paste its contents into `oauth2.keys.json` in the project root

#### 2. Configure the OAuth consent screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/oauth-consent)
2. Set **Publishing status** to **Testing**
3. Under **Test users**, add the Google account that owns the spreadsheet

#### 3. Run the one-time authorization flow

1. Start the dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/auth/google`
3. Sign in with the test user account and grant access
4. The callback page displays your **refresh token** — copy it
5. Paste it into `.env` as `GOOGLE_OAUTH_REFRESH_TOKEN=<token>`
6. Restart the dev server

#### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/google` | GET | Initiates OAuth consent flow |
| `/api/auth/callback` | GET | Exchanges auth code for tokens |
| `/api/students` | GET | Reads and maps all student rows from the sheet |

---

## Student Schema

All 36 fields map to specific columns in the Google Sheet (Column A = timestamp, data starts at B).

| Property | Type | Sheet Column | Description |
|---|---|---|---|
| `email` | `string` | B | Unique identifier |
| `lastName` | `string` | C | |
| `firstName` | `string` | D | |
| `middleName` | `string` | E | |
| `dob` | `string` | F | Date of Birth (MM/DD/YY) |
| `birthCity` | `string` | G | |
| `birthState` | `string` | H | |
| `birthCounty` | `string` | I | USA-born only |
| `birthCountry` | `string` | J | |
| `addressStreet` | `string` | K | |
| `addressApt` | `string` | L | |
| `addressCounty` | `string` | M | |
| `addressCity` | `string` | N | |
| `addressState` | `string` | O | |
| `addressZipCode` | `string` | P | |
| `phoneNumber` | `string` | Q | |
| `drivingPermitNumber` | `string` | R | |
| `drivingPermitState` | `string` | S | |
| `drivingPermitIssueDate` | `string` | T | |
| `drivingPermitExpireDate` | `string` | U | |
| `age` | `number \| null` | V | |
| `gender` | `string` | W | |
| `eyeColor` | `string` | X | |
| `hairColor` | `string` | Y | |
| `race` | `string` | Z | |
| `ethnicity` | `string` | AA | |
| `weight` | `number \| null` | AB | lbs |
| `height` | `string` | AC | ft/in |
| `fatherLastName` | `string` | AD | |
| `motherLastName` | `string` | AE | |
| `primaryContactName` | `string` | AF | |
| `primaryContactPhone` | `string` | AG | |
| `primaryContactAddress` | `string` | AH | |
| `secondaryContactName` | `string` | AI | |
| `secondaryContactPhone` | `string` | AJ | |
| `secondaryContactAddress` | `string` | AK | |

> `age` and `weight` are stored as **numbers** (`number | null`). All other fields are **strings**.

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google/route.ts      # OAuth initiation
│   │   │   └── callback/route.ts    # OAuth callback & token exchange
│   │   └── students/route.ts        # Google Sheets reader → Student[]
│   ├── types/
│   │   └── student.ts               # Student interface (36 fields)
│   ├── globals.css                  # Tailwind + dark theme
│   ├── layout.tsx                   # Root layout & metadata
│   └── page.tsx                     # Main UI (table + edit modal)
├── __tests__/
│   ├── page.test.tsx                # UI tests (18)
│   └── api.students.test.ts         # API integration tests (9)
├── oauth2.keys.json                 # OAuth credentials (gitignored)
├── .env                             # Environment variables (gitignored)
├── vitest.config.ts                 # Vitest configuration
└── vitest.setup.ts                  # jest-dom matchers setup
```

---

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run in watch mode
npm test
```

**27 tests across 2 suites:**

| Suite | Tests | Coverage |
|---|---|---|
| `page.test.tsx` | 18 | Table render, loading/error states, selection, modal open/close, edit/save/cancel, validation, add student |
| `api.students.test.ts` | 9 | Row mapping, number parsing, null handling, row filtering, auth errors, API errors |
