"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireStaff } from "@/lib/auth/guards";
import type { Award, UserAward } from "@/types";

export async function getMyAwards(): Promise<UserAward[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_awards")
    .select("*, awards(title, description, event_id, icon, color)")
    .eq("user_id", user.id)
    .order("awarded_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      user_id: string;
      award_id: string;
      awarded_at: string;
      awards: {
        title: string;
        description: string;
        event_id: string | null;
        icon: string;
        color: string;
      } | null;
    };
    return {
      id: r.id,
      user_id: r.user_id,
      award_id: r.award_id,
      awarded_at: r.awarded_at,
      title: r.awards?.title ?? "Award",
      description: r.awards?.description ?? "",
      icon: r.awards?.icon ?? "award",
      color: r.awards?.color ?? "#34c759",
    };
  });
}

export type StaffAwardRow = Award & { recipient_count: number };

export async function getStaffAwards(): Promise<StaffAwardRow[]> {
  await requireStaff();
  const supabase = await createClient();

  const { data: awards, error } = await supabase
    .from("awards")
    .select("*, user_awards(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (awards ?? []).map((a) => {
    const row = a as Award & { user_awards: { count: number }[] };
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      event_id: row.event_id,
      icon: row.icon,
      color: row.color,
      created_at: row.created_at,
      recipient_count: row.user_awards?.[0]?.count ?? 0,
    };
  });
}

export type AwardRecipient = {
  id: string;
  user_id: string;
  name: string;
  college: string;
  awarded_at: string;
};

export type AwardRecipientsResult =
  | { ok: true; recipients: AwardRecipient[] }
  | { ok: false; message: string };

export async function getAwardRecipients(
  awardId: string,
): Promise<AwardRecipientsResult> {
  try {
    await requireStaff();
  } catch {
    return { ok: false, message: "Staff access required." };
  }

  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("user_awards")
    .select("id, user_id, awarded_at")
    .eq("award_id", awardId)
    .order("awarded_at", { ascending: false });

  if (error) {
    return { ok: false, message: error.message || "Could not load recipients." };
  }

  if (!rows?.length) {
    return { ok: true, recipients: [] };
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, college")
    .in("id", userIds);

  if (profileError) {
    return {
      ok: false,
      message: profileError.message || "Could not load volunteer profiles.",
    };
  }

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, p as { id: string; name: string; college: string }]),
  );

  const recipients = rows.map((row) => {
    const profile = profileById.get(row.user_id);
    return {
      id: row.id,
      user_id: row.user_id,
      name: profile?.name ?? "Volunteer",
      college: profile?.college ?? "",
      awarded_at: row.awarded_at,
    };
  });

  return { ok: true, recipients };
}

export async function updateAward(
  awardId: string,
  input: {
    title: string;
    description?: string;
    event_id?: string | null;
    icon?: string;
    color?: string;
  },
) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awards")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      event_id: input.event_id || null,
      icon: input.icon ?? "award",
      color: input.color ?? "#34c759",
    })
    .eq("id", awardId)
    .select()
    .single();
  if (error) throw error;
  return data as Award;
}

export async function revokeAward(userAwardId: string) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_awards")
    .delete()
    .eq("id", userAwardId);
  if (error) throw error;
}

export async function createAward(input: {
  title: string;
  description?: string;
  event_id?: string | null;
  icon?: string;
  color?: string;
}) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awards")
    .insert({
      title: input.title,
      description: input.description ?? "",
      event_id: input.event_id || null,
      icon: input.icon ?? "award",
      color: input.color ?? "#34c759",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Award;
}

export type GrantAwardResult =
  | { ok: true }
  | { ok: false; message: string };

export async function grantAward(
  userId: string,
  awardId: string,
): Promise<GrantAwardResult> {
  try {
    await requireStaff();
  } catch {
    return { ok: false, message: "Staff access required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("user_awards")
    .select("id")
    .eq("user_id", userId)
    .eq("award_id", awardId)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "This volunteer already has this award." };
  }

  const { error } = await supabase.from("user_awards").insert({
    user_id: userId,
    award_id: awardId,
    awarded_by: user?.id ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "This volunteer already has this award." };
    }
    return { ok: false, message: error.message || "Could not grant award." };
  }

  return { ok: true };
}

export async function deleteAward(awardId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("awards").delete().eq("id", awardId);
  if (error) throw error;
}
