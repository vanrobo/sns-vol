"use server";

import { createClient } from "@/lib/supabase/server";

/** Call a Centre RPC with the signed-in user's session. */
export async function callCenterRpc<T = unknown>(
  name: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    console.error(`RPC ${name} failed:`, error.message);
    throw new Error(error.message);
  }
  return data as T;
}
