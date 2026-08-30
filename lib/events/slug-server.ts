import { slugifyEventTitle } from "@/lib/events/share";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveUniqueEventSlug(
  supabase: SupabaseClient,
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugifyEventTitle(title);
  let candidate = base;
  let n = 2;

  while (true) {
    let query = supabase.from("events").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}
