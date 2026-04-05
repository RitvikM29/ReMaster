# ReMaster (Focus OS)

A modern, minimal productivity web app for focus sessions with analytics, smart insights, and distraction tracking. Uses a Postgres backend for session storage.

## Features
- Timer, Stopwatch, and Deep Work modes
- Session tracking with focus score
- Smart insights (no external AI)
- Weekly sessions heatmap (LeetCode-style)
- Analytics dashboard (weekly trends, focus scores, subjects)
- Idle + tab visibility tracking
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
- `CORS_ORIGIN` (your Vercel domain)
- `VITE_API_URL` (optional, your Vercel domain + `/api`)

### 2) Deploy
```
vercel
```

## Final Deploy Checklist
1. In Vercel, set `DATABASE_URL`, `CORS_ORIGIN`, and optionally `VITE_API_URL`.
2. Redeploy with `vercel --prod --force`.
3. Confirm API health: `https://<your-app>.vercel.app/api/health` returns `{"ok":true}`.
4. Save a session and verify:
   - History updates
   - Analytics refreshes
   - Toast appears on save
5. Optional: add preview env vars if you use preview deployments.

## Notes
- Supabase pooler connection string is recommended for serverless.
- The heatmap uses last 4 weeks of session data.

## Screenshots
Add screenshots here:
- `docs/screenshots/dashboard.png`
- `docs/screenshots/timer.png`
- `docs/screenshots/analytics.png`
