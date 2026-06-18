# HomeFind SU Backend

This folder contains the Express API for HomeFind SU. It handles property data, student dashboard data, and the magic-link login flow.

## Backend Stack

- Node.js
- Express
- PostgreSQL
- Nodemailer / Resend for email delivery
- dotenv for environment variables

## What The Backend Does

- Serves `/api/properties` for property listings
- Serves `/api/student-dashboard` for student dashboard data
- Sends magic links through `/api/magic-link/send`
- Verifies magic links through `/api/magic-link/:token`

## What You Need Installed

Before running the backend, install:

- Node.js 18 or newer
- npm
- PostgreSQL
- A working email provider if you want real magic-link delivery

## Install And Run Backend

From the project root you can run:

```bash
npm run server
```

Or from inside the `backend/` folder:

```bash
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### Backend Scripts

```bash
npm run dev
npm run start
```

## Backend Environment

Copy `.env.example` to `.env` and fill in the values before starting the server.

Required backend variables:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `FRONTEND_URL`
- `BACKEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `RESEND_API_KEY` if you want to use Resend instead of SMTP

## Environment Notes

- `FRONTEND_URL` should point to the frontend app, for example `http://localhost:5175`
- `BACKEND_URL` should point to the backend API, for example `http://localhost:5000`
- If email credentials are missing, the backend can still start, but sending magic links will fail or fall back depending on the provider you configured

## Backend Code Overview

- `src/server.js` starts the HTTP server
- `src/app.js` registers routes and middleware
- `src/config/db.js` connects to PostgreSQL
- `src/controllers/propertyController.js` fetches and shapes property data
- `src/controllers/studentDashboardController.js` builds the student dashboard response
- `src/controllers/magicLinkController.js` handles magic-link generation and redirects
- `src/services/emailService.js` sends login emails
- `src/routers/` contains all API route files

## GitHub Commands For The Backend

Clone the repository:

```bash
git clone <https://github.com/Chitsaka86/HomeFind-SU.git >
cd homefind-su
```


Pull the latest changes:

```bash
git pull origin main
```


Commit and push backend changes:

```bash
git add backend
git commit -m ""
git push 
```

## Troubleshooting
