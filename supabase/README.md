# Supabase setup

1. Create a free project at https://supabase.com
2. Open **SQL Editor** → paste and run [`migrations/001_initial_schema.sql`](migrations/001_initial_schema.sql)
3. Copy **Project URL** and **anon key** from **Project Settings → API** into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Sign up once in the app, then promote that user to admin in SQL:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

5. (Optional) Disable email confirmation under **Authentication → Providers → Email** for local testing.
