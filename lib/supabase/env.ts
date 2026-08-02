/** Shared Supabase public env (supports old "anon" and new "publishable" names). */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  )?.trim();

  return { url, key };
}

export function assertSupabaseEnv() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY)",
    );
  }
  if (url.includes("YOUR_PROJECT") || key.includes("your-anon")) {
    throw new Error("Supabase env vars still have placeholder values");
  }
  return { url, key };
}
