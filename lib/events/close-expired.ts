import type { SupabaseClient } from "@supabase/supabase-js";
import { todayIso } from "@/lib/events/expiry";

/** Persist expired active → closed. Prefer cron (service role). */
export async function closeExpiredEvents(
  supabase: SupabaseClient,
  today = todayIso(),
) {
  await Promise.all([
    supabase
      .from("events")
      .update({ status: "closed" })
      .eq("status", "active")
      .eq("is_recurring", false)
      .lt("date", today),
    supabase
      .from("events")
      .update({ status: "closed" })
      .eq("status", "active")
      .eq("is_recurring", true)
      .not("end_date", "is", null)
      .lt("end_date", today),
  ]);
}
