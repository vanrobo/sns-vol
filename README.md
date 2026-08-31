# SNS Family

Volunteer mobile web app for SNS Family — Next.js + Supabase (Auth, Postgres, Storage).

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the Supabase SQL Editor.
3. Copy `.env.example` → `.env.local` and fill in your project URL + publishable key.
4. Install and run:

```bash
npm install
npm run dev
```

5. Sign up in the app, then promote yourself to admin:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'vanrobogaming@gmail.com');
```

6. Disable email confirmation under **Authentication → Providers → Email** (recommended).

More detail: [`supabase/README.md`](supabase/README.md).

## Deploy on Vercel

1. Import the GitHub repo: [vanrobo/sns-vol](https://github.com/vanrobo/sns-vol)
2. Add **Config** environment variables (Production + Preview) — no public prefix:
   - `SUPABASE_URL` — Supabase **Project URL** (must end with `.supabase.co`)
   - `SUPABASE_ANON_KEY` — Supabase **publishable** key (not the secret key)
3. In Supabase **Authentication → URL Configuration**:
   - Site URL: `https://sns-vol.vercel.app`
   - Redirect URLs: `https://sns-vol.vercel.app/**`, `http://localhost:3000/**`
4. Redeploy after changing env vars.

### Git commit author (this repo)

Vercel deploys use GitHub commit metadata. Commits from this repo should use:

- **Name:** `vanrobo`
- **Email:** `vanrobogaming@gmail.com`

One-time setup in this folder:

```bash
git config --local user.name "vanrobo"
git config --local user.email "vanrobogaming@gmail.com"
```

Verify:

```bash
git log -1 --format="%an <%ae>"
```

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4
- **Backend:** Supabase Auth + Postgres (RLS) + Storage (`avatars`)
- No XAMPP / PHP

## Production (100+ users)

See **[PRODUCTION.md](./PRODUCTION.md)** for the full launch checklist, env vars, and demo account policy.

### Vercel plan limits (what to expect)

| | Hobby (free) | Pro (~$20/mo) |
|---|--------------|---------------|
| **100+ volunteers browsing daily** | Usually fine | Fine |
| **Bandwidth** | 100 GB/mo — enough for ~100 active users unless heavy image uploads | 1 TB+ |
| **Serverless function time** | 100 GB-hrs/mo — OK at this scale | Higher limits |
| **Cron (event reminders)** | 1 cron job allowed; timing can drift; must set `CRON_SECRET` manually | Reliable scheduled cron |
| **Team / support** | Personal project | Better for NGO production |
| **Build minutes** | 6,000/mo | More headroom |

**Supabase** (separate from Vercel): Free tier supports 100+ monthly active users. Watch avatar storage and burst signups (auth rate limits). Pro if you need more storage or support.

**What won't break on Hobby at 100 users:** page loads, login, events, admin panel, PWA install. **What might need attention:** daily reminder cron reliability (use Pro or external cron hitting `/api/cron/event-reminders`), and spike traffic on event day (still usually OK).

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
