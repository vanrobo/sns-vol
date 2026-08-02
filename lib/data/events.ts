import { createClient } from "@/lib/supabase/client";
import type { Event, EventStatus } from "@/types";

export async function getEvents(status: EventStatus | "attended"): Promise<Event[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

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
      .select("event_id")
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

  const applied = new Set(apps?.map((a) => a.event_id) ?? []);
  const attended = new Set(att?.map((a) => a.event_id) ?? []);
  const ratings = new Map(
    feedbacks?.map((f) => [f.event_id, f.star_rating]) ?? [],
  );

  let result: Event[] = events.map((e) => ({
    ...e,
    required_skills: e.required_skills ?? [],
    has_applied: applied.has(e.id),
    has_attended: attended.has(e.id),
    rating: ratings.get(e.id) ?? null,
  }));

  if (status === "attended") {
    result = result.filter((e) => e.has_attended);
  }

  return result;
}

export async function applyToEvent(eventId: string) {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

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
  const supabase = createClient();
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
