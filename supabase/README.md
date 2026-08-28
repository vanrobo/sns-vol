# Supabase setup

1. Create a free project at https://supabase.com
2. Open **SQL Editor** → paste and run [`migrations/001_initial_schema.sql`](migrations/001_initial_schema.sql)
3. Copy **Project URL** and **anon/publishable key** from **Project Settings → API** into `.env.local` (and Vercel env vars):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
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
