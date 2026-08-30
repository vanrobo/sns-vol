/** Server-only Supabase credentials (not exposed to the browser). */
export function getSupabaseEnv() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.trim();

  const key = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  return { url, key };
}

export function assertSupabaseEnv() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL and SUPABASE_ANON_KEY in environment variables",
    );
  }
  if (url.includes("YOUR_PROJECT") || key.includes("your-anon")) {
    throw new Error("Supabase env vars still have placeholder values");
  }
  return { url, key };
}
