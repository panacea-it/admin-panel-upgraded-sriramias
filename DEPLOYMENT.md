# Vercel deployment guide

This project deploys as a **single Vercel application**:

| Layer | How it runs on Vercel |
|--------|------------------------|
| **Frontend** | Static Vite build from `dist/` |
| **Backend** | Node serverless function at `api/index.js` (Express from `backend/`) |

## Architecture

```
https://your-app.vercel.app/          → React SPA (index.html)
https://your-app.vercel.app/api/*     → Express API (serverless)
```

`vercel.json` rewrites:

1. `/api/*` → `api/index.js` (Express)
2. Everything else → `/index.html` (client-side routing)

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Where | Required | Notes |
|----------|--------|----------|--------|
| `MONGO_URI` | Production, Preview | Yes* | Atlas connection string |
| `MONGO_URI_DIRECT` | Optional | No | Fallback non-SRV URI |
| `CLIENT_ORIGIN` | Optional | No | Custom domain for CORS |
| `VITE_ENABLE_DEMO_LOGIN` | Production | No | `true` / `false` |
| `VITE_API_BASE_URL` | Usually **unset** on Vercel | No | Unset = same-origin `/api` |

\*Required for database-backed routes (courses, finance, classrooms, etc.)

**Do not** set `VITE_API_BASE_URL` on Vercel unless the API is hosted on a different domain.

## Deploy from CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local   # optional: sync env for local testing
vercel --prod
```

## Deploy from GitHub

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import repository.
3. Framework Preset: **Vite** (auto-detected).
4. Root Directory: `.` (repository root).
5. Add environment variables (see table above).
6. Deploy.

Build settings are defined in `vercel.json` (`buildCommand`, `installCommand`, `outputDirectory`).

## Local development

Terminal 1 — frontend:

```bash
npm run dev
```

Terminal 2 — API:

```bash
npm run dev:api
```

Copy `backend/.env.example` → `backend/.env` and set `MONGO_URI`.

## Verify after deploy

```bash
curl https://YOUR_DEPLOYMENT.vercel.app/api/health
```

Expected: `{"success":true,"message":"API is running",...}`

## Troubleshooting

| Issue | Fix |
|--------|-----|
| 503 Database unavailable | Set `MONGO_URI` in Vercel; allow `0.0.0.0/0` in Atlas Network Access |
| SPA 404 on refresh | Ensure `vercel.json` SPA rewrite is present |
| API 404 | Confirm routes start with `/api` |
| CORS errors | Unset `VITE_API_BASE_URL` on Vercel so the app uses `/api` |
| Cold start slow | Normal for serverless; Mongo connection is cached after first request |
