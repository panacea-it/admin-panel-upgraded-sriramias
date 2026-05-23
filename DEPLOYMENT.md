# Vercel deployment — frontend only

This project deploys to Vercel as a **static Vite SPA**. No backend, MongoDB, or `/api` serverless functions are used in production.

## What runs on Vercel

| URL | Serves |
|-----|--------|
| `https://your-app.vercel.app/` | React app (`dist/`) |
| `https://your-app.vercel.app/any/route` | `index.html` (SPA rewrite) |

## Production behavior

Configured in `.env.production`:

- **Auth:** Demo + employee accounts (`localStorage` / `sessionStorage`)
- **Finance / Sales:** In-memory mock data
- **Batches:** `localStorage` (`batchesApiStorage`)
- **Classrooms / Subjects / Live classes:** `localStorage` + in-memory stores
- **No network calls** to `/api` (axios blocked in frontend-only mode)

## Demo login credentials

See `src/data/demoAuthUsers.js`, for example:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@sriramias.com` | `Super@123` |
| Center Admin | `centeradmin@sriramias.com` | `Center@123` |

Select the matching **role** on the login screen.

## Environment variables (Vercel dashboard)

Usually **none required** for a working demo deploy.

Optional:

| Variable | Value |
|----------|--------|
| `VITE_ENABLE_DEMO_LOGIN` | `true` (default in production build) |
| `VITE_FRONTEND_ONLY` | `true` (set in `.env.production`) |

Do **not** set `VITE_API_BASE_URL` unless you intentionally point to an external API.

## Deploy

### CLI

```bash
npm i -g vercel
vercel login
cd path/to/admin-panel
vercel link
vercel --prod
```

### GitHub

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Framework: **Vite**
3. Root Directory: `.`
4. Deploy (uses `vercel.json`)

## Local development

**Frontend-only (matches Vercel):**

```bash
# .env.local
VITE_FRONTEND_ONLY=true
VITE_ENABLE_DEMO_LOGIN=true

npm run dev
```

**With optional local API:**

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:api
```

Use `backend/.env` only when running the Express server locally.

## Verify

1. Open the deployed URL → login page loads
2. Log in with demo credentials + correct role
3. Navigate to Finance, Academics, CRM — no “Database unavailable” or API errors
4. Refresh deep links (e.g. `/academics/batch`) — page loads (SPA rewrite)

## Backend folder

The `/backend` folder remains in the repo for optional local development but is **not** deployed to Vercel.
