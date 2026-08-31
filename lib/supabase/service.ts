import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv } from "@/lib/supabase/env";

export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) return null;

  const { url } = assertSupabaseEnv();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
