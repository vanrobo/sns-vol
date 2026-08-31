"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireStaff } from "@/lib/auth/guards";
import { resolveUniqueEventSlug } from "@/lib/events/slug-server";
import type {
  AdminData,
  Application,
  ApplicationStatus,
  Event,
  Grievance,
  Profile,
  UserRole,
} from "@/types";

export async function getAdminData(): Promise<AdminData> {
  await requireAdmin();
  const supabase = await createClient();

  const [
    { data: events, error: e1 },
    { data: users, error: e2 },
    { data: grievances, error: e3 },
    { data: apps, error: e4 },
  ] = await Promise.all([
    supabase.from("events").select("*").order("date", { ascending: false }),
    supabase.from("profiles").select("*").order("name"),
    supabase
      .from("grievances")
      .select("*, profiles(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("*, profiles(name, skills), events(title)")
      .order("created_at", { ascending: false }),
  ]);

  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  if (e4) throw e4;

  const applications: Application[] = (apps ?? []).map((a) => {
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

  const grievanceList: Grievance[] = (grievances ?? []).map((g) => {
    const row = g as Grievance & { profiles: { name: string } | null };
    return {
      id: row.id,
      user_id: row.user_id,
      category: row.category,
      description: row.description,
      status: row.status,
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      user_name: row.profiles?.name,
    };
  });

  return {
    events: (events ?? []).map((e) => ({
      ...e,
      required_skills: e.required_skills ?? [],
    })) as Event[],
    users: (users ?? []) as Profile[],
    grievances: grievanceList,
    applications,
  };
}

export type EventInput = {
  title: string;
  date: string;
  venue: string;
  description: string;
  criteria?: string;
  required_skills: string[];
  category?: string;
  coordinator_phone?: string;
};

export async function createEvent(input: EventInput) {
  await requireStaff();
  const supabase = await createClient();
  const slug = await resolveUniqueEventSlug(supabase, input.title);
  const { data, error } = await supabase
    .from("events")
    .insert({
      slug,
      title: input.title,
      date: input.date,
      venue: input.venue,
      description: input.description,
      criteria: input.criteria ?? "Student",
      required_skills: input.required_skills,
      category: input.category ?? "Community",
      coordinator_phone: input.coordinator_phone ?? "",
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(id: string, input: EventInput) {
  await requireStaff();
  const supabase = await createClient();
  const slug = await resolveUniqueEventSlug(supabase, input.title, id);
  const { data, error } = await supabase
    .from("events")
    .update({
      slug,
      title: input.title,
      date: input.date,
      venue: input.venue,
      description: input.description,
      criteria: input.criteria ?? "Student",
      required_skills: input.required_skills,
      category: input.category ?? "Community",
      coordinator_phone: input.coordinator_phone ?? "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function closeEvent(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ status: "closed" })
    .eq("id", id);
  if (error) throw error;
}

export async function reopenEvent(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ status: "active" })
    .eq("id", id);
  if (error) throw error;
}

export async function adminDeleteVolunteer(userId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      status: "inactive",
      name: "Deactivated User",
      phone: "",
      address: "",
      avatar_url: null,
      skills: [],
      batch: null,
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function broadcastNotification(input: {
  title: string;
  body: string;
  userIds?: string[];
  all?: boolean;
  batch?: string;
  region?: string;
}): Promise<number> {
  await requireAdmin();
  const supabase = await createClient();

  let userIds = input.userIds ?? [];

  if (!userIds.length) {
    let q = supabase
      .from("profiles")
      .select("id")
      .eq("role", "volunteer")
      .eq("status", "active");

    if (input.batch) {
      q = q.eq("batch", input.batch);
    } else if (input.region) {
      q = q.or(`batch.ilike.%${input.region}%,address.ilike.%${input.region}%`);
    } else if (!input.all) {
      return 0;
    }

    const { data, error } = await q;
    if (error) throw error;
    userIds = (data ?? []).map((r) => r.id);
  }

  if (!userIds.length) return 0;

  const rows = userIds.map((user_id) => ({
    user_id,
    title: input.title,
    body: input.body,
    type: "event" as const,
  }));

  const { error: insertError } = await supabase.from("notifications").insert(rows);
  if (insertError) throw insertError;
  return userIds.length;
}

export async function updateApplicationStatus(
  userId: string,
  eventId: string,
  status: ApplicationStatus,
) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("user_id", userId)
    .eq("event_id", eventId);
  if (error) throw error;
}

export async function approveICard(userId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const short = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const volunteerId = `SNS-FAM-2026-${short}`;
  const validUntil = "2027-12-31";

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "active",
      volunteer_id: volunteerId,
      valid_until: validUntil,
    })
    .eq("id", userId);

  if (error) throw error;
  return { volunteer_id: volunteerId, valid_until: validUntil };
}

export async function resolveGrievance(id: string, adminNotes: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("grievances")
    .update({ status: "resolved", admin_notes: adminNotes })
    .eq("id", id);
  if (error) throw error;
}

export async function updateUserBatch(userId: string, batch: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ batch: batch.trim() || null })
    .eq("id", userId);
  if (error) throw error;
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw error;
}
