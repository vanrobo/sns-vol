"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveVolunteer } from "@/lib/auth/guards";
import { getCheckInStatus } from "@/lib/event-checkin";
import { hasUpcomingOccurrence } from "@/lib/events/dates";
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
    .eq("is_recurring", false)
    .lt("date", today);

  await supabase
    .from("events")
    .update({ status: "closed" })
    .eq("status", "active")
    .eq("is_recurring", true)
    .not("end_date", "is", null)
    .lt("end_date", today);

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

export type AttendedEventRow = {
  event: Event;
  attended_at: string;
};

export async function getMyAttendedEvents(): Promise<AttendedEventRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("attendance")
    .select("marked_at, events(*)")
    .eq("user_id", user.id)
    .order("marked_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const raw = row as {
        marked_at: string;
        events: Record<string, unknown> | Record<string, unknown>[] | null;
      };
      const eventRow = Array.isArray(raw.events) ? raw.events[0] : raw.events;
      if (!eventRow) return null;
      const event = {
        ...eventRow,
        required_skills: (eventRow.required_skills as string[]) ?? [],
      } as Event;
      return {
        event,
        attended_at: raw.marked_at,
      };
    })
    .filter(Boolean) as AttendedEventRow[];
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
    .select("event_id, status")
    .eq("user_id", user.id)
    .in("status", ["pending", "approved"]);

  if (appsError) throw appsError;
  if (!apps?.length) return [];

  const statusByEvent = new Map(
    apps.map((a) => [a.event_id, a.status as Event["application_status"]]),
  );
  const eventIds = [...statusByEvent.keys()];

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .eq("status", "active");

  if (error) throw error;

  const upcoming = (events ?? [])
    .filter((e) =>
      hasUpcomingOccurrence(
        { ...e, required_skills: e.required_skills ?? [] } as Event,
        today,
      ),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return upcoming.map((e) => ({
    ...e,
    required_skills: e.required_skills ?? [],
    has_applied: true,
    application_status: statusByEvent.get(e.id) ?? "pending",
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

  const { data: existing, error: readError } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();
  if (readError) throw readError;
  if (!existing) return;
  if (existing.status === "approved") {
    throw new Error(
      "Approved requests can't be withdrawn. Contact your coordinator if plans changed.",
    );
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);
  if (error) throw error;
}

export async function reapplyToEvent(eventId: string) {
  await requireActiveVolunteer();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing, error: readError } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();
  if (readError) throw readError;

  if (existing?.status === "approved") {
    throw new Error("You're already approved for this event.");
  }
  if (existing?.status === "pending") {
    throw new Error("Your request is already pending review.");
  }

  if (existing?.status === "declined") {
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", eventId);
    if (deleteError) throw deleteError;
  }

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    event_id: eventId,
    status: "pending",
  });
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
    .select("date, time_start, time_end, is_recurring, end_date, cancelled_dates")
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
