# Supabase setup

1. Create a free project at https://supabase.com
2. Open **SQL Editor** and run **every migration in order** (001 → 014):

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Core tables, RLS, triggers |
| `002_organiser_role_and_fixes.sql` | Organiser role, staff event CRUD |
| `003_demo_accounts.sql` | Demo users (optional for production) |
| `004_awards.sql` | Awards tables |
| `005_sample_events_public.sql` | Sample public events (optional) |
| `006_event_slugs.sql` | Shareable event slugs |
| `007_calendar_batch_awards.sql` | Calendar, batch, awards tweaks |
| `008_delhi_events_recurring.sql` | Recurring event seed (optional) |
| `009_admin_profile_update_policy.sql` | Admin profile updates |
| `010_grievance_notify_app.sql` | Grievance notifications |
| `011_event_reminders.sql` | Event reminder cron support |
| `012_award_staff_revoke.sql` | Organiser award withdraw |
| `013_staff_notifications_insert.sql` | Staff in-app notification inserts |
| `015_event_created_by.sql` | Organiser-scoped event ownership |

**Production checklist:** After creating a new project, run 001–015 in sequence. Skipping 002, 012–015 breaks organiser flows (events, awards, notifications, batch updates, event ownership).

3. Copy **Project URL** and **publishable key** from **Project Settings → API** into `.env.local` (and Vercel env vars):

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your-publishable-key
```

Use **Config** variables in Vercel (no `NEXT_PUBLIC_` prefix) — credentials stay server-side only.

Optional client env:

```env
NEXT_PUBLIC_SITE_URL=https://sns-vol.vercel.app
```

4. **Disable email confirmation** (recommended — free built-in SMTP is tiny):
   - **Authentication → Providers → Email**
   - Turn **off** “Confirm email”
   - Save

5. **URL config** (so any auth redirects don’t go to localhost in production):
   - **Authentication → URL Configuration**
   - Site URL: `https://sns-vol.vercel.app` (or your domain)
   - Redirect URLs: `https://sns-vol.vercel.app/**` and `http://localhost:3000/**`

6. Sign up once in the app, then promote that user to admin in SQL:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'vanrobogaming@gmail.com');
```

If you already signed up while confirmation was on, either confirm the user in **Authentication → Users**, or delete them and sign up again after disabling confirmation.
