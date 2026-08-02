# SNS Vol

Volunteer mobile web app for SNS — Next.js + Supabase (Auth, Postgres, Storage).

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the Supabase SQL Editor.
3. Copy `.env.example` → `.env.local` and fill in your project URL + anon key.
4. Install and run:

```bash
npm install
npm run dev
```

5. Sign up in the app, then promote yourself to admin:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

6. Optional: disable email confirmation under **Authentication → Providers → Email** for local testing.

More detail: [`supabase/README.md`](supabase/README.md).

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4
- **Backend:** Supabase Auth + Postgres (RLS) + Storage (`avatars`)
- No XAMPP / PHP

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
