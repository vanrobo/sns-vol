"use server";

import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types";

export type MyApplication = {
  id: string;
  event_id: string;
  status: ApplicationStatus;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_status: string;
  created_at: string;
};

export async function getMyApplications(): Promise<MyApplication[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("applications")
    .select("id, event_id, status, created_at, events(title, date, venue, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      event_id: string;
      status: ApplicationStatus;
      created_at: string;
      events:
        | { title: string; date: string; venue: string; status: string }
        | { title: string; date: string; venue: string; status: string }[]
        | null;
    };
    const event = Array.isArray(r.events) ? r.events[0] : r.events;
    return {
      id: r.id,
      event_id: r.event_id,
      status: r.status,
      event_title: event?.title ?? "Unknown event",
      event_date: event?.date ?? "",
      event_venue: event?.venue ?? "",
      event_status: event?.status ?? "active",
      created_at: r.created_at,
    };
  });
}
