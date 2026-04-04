# ReMaster (Focus OS)

A modern, minimal productivity web app for focus sessions with analytics, smart insights, and distraction tracking. Includes user accounts and Postgres-backed storage.

## Features
- Timer, Stopwatch, and Deep Work modes
- Session tracking with focus score
- Smart insights (no external AI)
- Weekly sessions heatmap (LeetCode-style)
- Analytics dashboard (weekly trends, focus scores, subjects)
- Idle + tab visibility tracking
- Auth (signup/login) with seeded sessions on signup
- Clean, modern UI with smooth animations

## Tech Stack
- React + Vite
- Node.js + Express
- Postgres (Supabase)

## Project Structure
```
api/               # Vercel serverless entry
server/
  app.js
  db.js
  routes/
  middleware/
  utils/
src/renderer/
  app/
  components/
  hooks/
  pages/
  services/
  styles/
```

## Local Setup

### 1) Install dependencies
```
npm install
```

### 2) Configure environment
Create `.env` in the project root:
```
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres.hmetouyremaililsxvtb:YOUR_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
AUTH_SECRET=your_secret_here
APP_URL=http://localhost:5173
RESEND_API_KEY=your_resend_key
RESEND_FROM=ReMaster <onboarding@resend.dev>
```

Create `.env.local` for the frontend:
```
VITE_API_URL=http://localhost:4000
```

### 3) Start API
```
npm run server:dev
```

### 4) Start frontend
```
npm run dev
```

## Vercel Deployment

### 1) Add env vars in Vercel
- `DATABASE_URL`
- `AUTH_SECRET`
- `CORS_ORIGIN` (your Vercel domain)
- `VITE_API_URL` (your Vercel domain)

### 2) Deploy
```
vercel
```

## Notes
- Supabase pooler connection string is recommended for serverless.
- Seed sessions are generated on signup to populate the heatmap.

## Screenshots
Add screenshots here:
- `docs/screenshots/dashboard.png`
- `docs/screenshots/timer.png`
- `docs/screenshots/analytics.png`
