"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/guards";
import type { Application, ApplicationStatus, Event, Profile } from "@/types";

export type OrganiserData = {
  events: Event[];
  applications: Application[];
  users: Profile[];
};

export async function getOrganiserData(): Promise<OrganiserData> {
  const staff = await requireStaff();
  const supabase = await createClient();

  let eventsQuery = supabase.from("events").select("*").order("date", { ascending: false });
  if (staff.role === "organiser") {
    eventsQuery = eventsQuery.eq("created_by", staff.id);
  }

  const [
    { data: events, error: e1 },
    { data: apps, error: e2 },
    { data: users, error: e3 },
  ] = await Promise.all([
    eventsQuery,
    supabase
      .from("applications")
      .select("*, profiles(name, skills), events(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "volunteer")
      .order("name"),
  ]);

  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;

  const eventList = (events ?? []).map((e) => ({
    ...e,
    required_skills: e.required_skills ?? [],
  })) as Event[];

  const eventIds = new Set(eventList.map((e) => e.id));

  const applications: Application[] = (apps ?? [])
    .filter((a) => eventIds.has(a.event_id))
    .map((a) => {
    const row = a as {
      id: string;
      user_id: string;
      event_id: string;
      status: ApplicationStatus;
      profiles: { name: string; skills: string[] } | null;
      events: { title: string } | null;
    };
    return {
      id: row.id,
      user_id: row.user_id,
      event_id: row.event_id,
      status: row.status,
      user_name: row.profiles?.name ?? "Unknown",
      event_title: row.events?.title ?? "Unknown",
      user_skills: row.profiles?.skills ?? [],
    };
  });

  return {
    events: eventList,
    applications,
    users: (users ?? []) as Profile[],
  };
}
