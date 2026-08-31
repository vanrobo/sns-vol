# Production launch — SNS Family (100+ users)

Use this checklist when moving from test to live with volunteers, organisers, and admins.

## Required Vercel environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Auth + database (server-side) |
| `QR_SIGNING_SECRET` | Yes | I-Card QR codes (32+ random chars) |
| `CRON_SECRET` | Yes | Secures daily event reminder cron |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Cron reminders + permanent account deletion |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical URL for QR verify links (`https://sns-vol.vercel.app`) |

## Recommended (hardening)

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Rate limiting (free tier at [upstash.com](https://upstash.com)) |
| `UPSTASH_REDIS_REST_TOKEN` | Paired with URL above |
| `SENTRY_DSN` | Server error monitoring ([sentry.io](https://sentry.io)) |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN value for client-side errors |

Without Upstash, login/signup still use Supabase’s built-in auth rate limits; app-level limits are skipped.

## Demo accounts (kept intentionally)

Demo users remain available for training and demos:

- `demo-admin@sns-vol.demo`
- `demo-organiser@sns-vol.demo`
- `demo-volunteer@sns-vol.demo`
- Password: `SnsDemo2026!` (see `lib/demo-accounts.ts`)

Optional: set `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true` to show a banner on the login page.

**Do not share the demo password publicly** in volunteer-facing materials.

## Supabase migrations

Run in order on the **production** project:

| Migration | Run in prod? |
|-----------|----------------|
| 001–002, 004, 006–007, 009–011 | Yes |
| 003 (demo accounts) | Yes (if you want demo logins) |
| 005, 008 (sample events) | Optional — skip seed inserts or delete sample events after |

## Pre-launch smoke test

1. Sign up → lands on pending
2. Admin approves I-Card → volunteer active
3. Apply to event → staff approves
4. Check-in during time window
5. Grievance → admin resolves → in-app alert
6. Install PWA (Android + iPhone)
7. I-Card QR scan at `/verify/...`
8. Admin broadcast to all active volunteers
9. Cron: `GET /api/cron/event-reminders` with `Authorization: Bearer $CRON_SECRET` returns `{ ok: true }`

## Vercel plan notes (100+ users)

See README “Vercel limits” section — summary:

- **Hobby (free):** Fine for ~100 users on traffic; cron is limited (1/day, may drift); no team features.
- **Pro ($20/mo):** Reliable cron, more bandwidth, better for production NGO use.

Supabase Free tier supports 100+ MAU; watch storage (avatars) and auth email rate limits.

## Not in scope (by design)

- Email alerts — not implemented; in-app + browser alerts only
- Play Store / App Store — PWA install from browser
- GPS check-in — time-window honor system
- True push when app is closed — requires FCM/OneSignal later

## First admin

```sql
update public.profiles
set role = 'admin', status = 'active'
where id = (select id from auth.users where email = 'your-admin@email.com');
```

## Support runbook

- **Stuck on pending:** Admin must approve I-Card in People tab
- **Can’t install app (iPhone):** Safari → Share → Add to Home Screen
- **I-Card QR broken:** Check `QR_SIGNING_SECRET` is set and 32+ chars
- **Reminders not sending:** Check `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and Vercel cron logs
