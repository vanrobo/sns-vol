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

  const { data: apps, error } = await supabase
    .from("applications")
    .select("id, event_id, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!apps?.length) return [];

  const eventIds = [...new Set(apps.map((a) => a.event_id))];
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, date, venue, status")
    .in("id", eventIds);

  if (eventsError) throw eventsError;

  const eventMap = new Map(
    (events ?? []).map((e) => [
      e.id,
      e as { title: string; date: string; venue: string; status: string },
    ]),
  );

  return apps.map((row) => {
    const event = eventMap.get(row.event_id);
    return {
      id: row.id,
      event_id: row.event_id,
      status: row.status as ApplicationStatus,
      event_title: event?.title ?? "Unknown event",
      event_date: event?.date ?? "",
      event_venue: event?.venue ?? "",
      event_status: event?.status ?? "active",
      created_at: row.created_at,
    };
  });
}
