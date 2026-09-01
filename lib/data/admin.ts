"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireStaff } from "@/lib/auth/guards";
import { resolveUniqueEventSlug } from "@/lib/events/slug-server";
import { createServiceClient } from "@/lib/supabase/service";
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
  region?: string;
  end_date?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  is_recurring?: boolean;
};

function eventPayload(input: EventInput) {
  return {
    title: input.title,
    date: input.date,
    venue: input.venue,
    description: input.description,
    criteria: input.criteria ?? "Student",
    required_skills: input.required_skills,
    category: input.category ?? "Community",
    coordinator_phone: input.coordinator_phone ?? "",
    region: input.region?.trim() || null,
    end_date: input.end_date || null,
    time_start: input.time_start || null,
    time_end: input.time_end || null,
    is_recurring: input.is_recurring ?? false,
  };
}

export async function createEvent(input: EventInput) {
  await requireStaff();
  const supabase = await createClient();
  const slug = await resolveUniqueEventSlug(supabase, input.title);
  const { data, error } = await supabase
    .from("events")
    .insert({
      slug,
      ...eventPayload(input),
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
      ...eventPayload(input),
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

export async function deleteEvent(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
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

export async function completeAccountDeletion(userId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("delete_requested_at")
    .eq("id", userId)
    .single();
  if (fetchError) throw fetchError;
  if (!profile.delete_requested_at) {
    throw new Error("User has not requested account deletion.");
  }

  const service = createServiceClient();
  if (service) {
    const { error: authError } = await service.auth.admin.deleteUser(userId);
    if (authError) throw authError;
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "inactive",
      name: "Deleted User",
      phone: "",
      address: "",
      college: "",
      avatar_url: null,
      skills: [],
      batch: null,
      delete_requested_at: null,
      volunteer_id: null,
      valid_until: null,
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
  center?: string;
}): Promise<number> {
  await requireAdmin();
  const supabase = await createClient();

  let userIds: string[];

  const isBroadcast = Boolean(
    input.all || input.batch || input.region || input.center,
  );

  if (isBroadcast) {
    let q = supabase
      .from("profiles")
      .select("id")
      .eq("role", "volunteer")
      .eq("status", "active");

    if (input.batch) {
      q = q.eq("batch", input.batch);
    } else if (input.center) {
      q = q.eq("college", input.center);
    } else if (input.region) {
      q = q.or(
        `batch.ilike.%${input.region}%,address.ilike.%${input.region}%`,
      );
    }

    const { data, error } = await q;
    if (error) throw error;
    userIds = (data ?? []).map((r) => r.id);
  } else if (input.userIds?.length) {
    userIds = input.userIds;
  } else {
    return 0;
  }

  if (!userIds.length) return 0;

  const rows = userIds.map((user_id) => ({
    user_id,
    title: input.title,
    body: input.body,
    type: "event" as const,
  }));

  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error: insertError } = await supabase
      .from("notifications")
      .insert(chunk);
    if (insertError) throw insertError;
  }

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

  const { data, error } = await supabase
    .from("profiles")
    .update({
      status: "active",
      volunteer_id: volunteerId,
      valid_until: validUntil,
    })
    .eq("id", userId)
    .select("id, status, volunteer_id, valid_until")
    .maybeSingle();

  if (error) throw error;
  if (!data || data.status !== "active") {
    throw new Error(
      "Approval blocked. Check that you are logged in as admin and try again.",
    );
  }

  return {
    volunteer_id: data.volunteer_id ?? volunteerId,
    valid_until: data.valid_until ?? validUntil,
  };
}

export async function resolveGrievance(id: string, adminNotes: string) {
  await requireAdmin();
  const supabase = await createClient();
  const notes = adminNotes.trim();

  const { data: updated, error } = await supabase
    .from("grievances")
    .update({ status: "resolved", admin_notes: notes })
    .eq("id", id)
    .neq("status", "resolved")
    .select("user_id")
    .maybeSingle();
  if (error) throw error;

  if (updated) {
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: updated.user_id,
      title: "Grievance resolved",
      body: notes || "Your complaint ticket has been resolved.",
      type: "grievance",
    });
    if (notifError) throw notifError;
  }
}

export async function updateUserBatch(userId: string, batch: string) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_volunteer_batch", {
    p_user_id: userId,
    p_batch: batch.trim(),
  });
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

export type AttendanceRow = {
  user_id: string;
  user_name: string;
  attended_at: string;
};

export async function duplicateEvent(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;

  const slug = await resolveUniqueEventSlug(supabase, `${event.title} Copy`);
  const { data, error: insertError } = await supabase
    .from("events")
    .insert({
      slug,
      title: `${event.title} (Copy)`,
      date: event.date,
      venue: event.venue,
      description: event.description,
      criteria: event.criteria,
      required_skills: event.required_skills ?? [],
      category: event.category,
      coordinator_phone: event.coordinator_phone ?? "",
      status: "active",
      region: event.region,
      color: event.color,
      end_date: event.end_date,
      time_start: event.time_start,
      time_end: event.time_end,
      is_recurring: event.is_recurring ?? false,
      cancelled_dates: [],
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data as Event;
}

export async function cancelEventOccurrence(eventId: string, date: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("cancelled_dates")
    .eq("id", eventId)
    .single();
  if (error) throw error;

  const cancelled = [...((event.cancelled_dates as string[] | null) ?? [])];
  if (!cancelled.includes(date)) cancelled.push(date);

  const { error: updateError } = await supabase
    .from("events")
    .update({ cancelled_dates: cancelled })
    .eq("id", eventId);
  if (updateError) throw updateError;
}

export async function getEventAttendance(
  eventId: string,
): Promise<AttendanceRow[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select("user_id, attended_at, profiles(name)")
    .eq("event_id", eventId)
    .order("attended_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as {
      user_id: string;
      attended_at: string;
      profiles: { name: string } | { name: string }[] | null;
    };
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      user_id: r.user_id,
      user_name: profile?.name ?? "Unknown",
      attended_at: r.attended_at,
    };
  });
}

export async function bulkApproveICards(
  userIds: string[],
): Promise<{ succeeded: number; failed: number }> {
  await requireAdmin();
  let succeeded = 0;
  let failed = 0;
  for (const userId of userIds) {
    try {
      await approveICard(userId);
      succeeded++;
    } catch {
      failed++;
    }
  }
  return { succeeded, failed };
}

export async function bulkUpdateUserBatch(userIds: string[], batch: string) {
  await requireAdmin();
  if (!userIds.length) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ batch: batch.trim() || null })
    .in("id", userIds);
  if (error) throw error;
}
