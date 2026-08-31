"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveVolunteer } from "@/lib/auth/guards";
import { getCheckInStatus } from "@/lib/event-checkin";
import type { Event, EventStatus } from "@/types";

export async function getEvents(status: EventStatus | "attended"): Promise<Event[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("events")
    .update({ status: "closed" })
    .eq("status", "active")
    .lt("date", today);

  const dbStatus = status === "attended" ? "closed" : status;

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", dbStatus)
    .order("date", { ascending: false });

  if (error) throw error;
  if (!events?.length) return [];

  const eventIds = events.map((e) => e.id);

  const [{ data: apps }, { data: att }, { data: feedbacks }] = await Promise.all([
    supabase
      .from("applications")
      .select("event_id, status")
      .eq("user_id", user.id)
      .in("event_id", eventIds),
    supabase
      .from("attendance")
      .select("event_id")
      .eq("user_id", user.id)
      .in("event_id", eventIds),
    supabase
      .from("feedbacks")
      .select("event_id, star_rating")
      .eq("user_id", user.id)
      .in("event_id", eventIds),
  ]);

  const appStatusMap = new Map(
    apps?.map((a) => [a.event_id, a.status as Event["application_status"]]) ?? [],
  );
  const attended = new Set(att?.map((a) => a.event_id) ?? []);
  const ratings = new Map(
    feedbacks?.map((f) => [f.event_id, f.star_rating]) ?? [],
  );

  let result: Event[] = events.map((e) => ({
    ...e,
    required_skills: e.required_skills ?? [],
    has_applied: appStatusMap.has(e.id),
    application_status: appStatusMap.get(e.id) ?? null,
    has_attended: attended.has(e.id),
    rating: ratings.get(e.id) ?? null,
  }));

  if (status === "attended") {
    result = result.filter((e) => e.has_attended);
  }

  return result;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data: apps, error: appsError } = await supabase
    .from("applications")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("status", "approved");

  if (appsError) throw appsError;
  if (!apps?.length) return [];

  const eventIds = apps.map((a) => a.event_id);

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .eq("status", "active")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(5);

  if (error) throw error;

  return (events ?? []).map((e) => ({
    ...e,
    required_skills: e.required_skills ?? [],
    has_applied: true,
    application_status: "approved" as const,
    has_attended: false,
  })) as Event[];
}

/** Public event view by slug — no login required. */
export async function getPublicEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    required_skills: data.required_skills ?? [],
  } as Event;
}

/** Lookup by id for legacy ?id= links — no login required. */
export async function getPublicEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    required_skills: data.required_skills ?? [],
  } as Event;
}

export async function applyToEvent(eventId: string) {
  await requireActiveVolunteer();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    event_id: eventId,
    status: "pending",
  });
  if (error) throw error;
}

export async function withdrawApplication(eventId: string) {
  await requireActiveVolunteer();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);
  if (error) throw error;
}

export async function markAttended(eventId: string) {
  await requireActiveVolunteer();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();
  if (appError) throw appError;
  if (app?.status !== "approved") {
    throw new Error("Only approved volunteers can check in.");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("date, time_start, time_end")
    .eq("id", eventId)
    .single();
  if (eventError) throw eventError;

  const checkIn = getCheckInStatus(event as Event);
  if (!checkIn.allowed) {
    throw new Error(checkIn.message);
  }

  const { error } = await supabase.from("attendance").insert({
    user_id: user.id,
    event_id: eventId,
  });
  if (error) throw error;
}

export async function submitFeedback(
  eventId: string,
  starRating: number,
  comment = "",
) {
  await requireActiveVolunteer();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("feedbacks").upsert(
    {
      user_id: user.id,
      event_id: eventId,
      star_rating: starRating,
      comment,
    },
    { onConflict: "user_id,event_id" },
  );
  if (error) throw error;
}

export { getCheckInStatus };
