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

export async function getAwardRecipients(
  awardId: string,
): Promise<AwardRecipient[]> {
  await requireStaff();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_awards")
    .select("id, user_id, awarded_at, profiles(name, college)")
    .eq("award_id", awardId)
    .order("awarded_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      user_id: string;
      awarded_at: string;
      profiles:
        | { name: string; college: string }
        | { name: string; college: string }[]
        | null;
    };
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      user_id: r.user_id,
      name: profile?.name ?? "Volunteer",
      college: profile?.college ?? "",
      awarded_at: r.awarded_at,
    };
  });
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

export async function grantAward(userId: string, awardId: string) {
  await requireStaff();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("user_awards").insert({
    user_id: userId,
    award_id: awardId,
    awarded_by: user?.id ?? null,
  });
  if (error) throw error;
}

export async function deleteAward(awardId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("awards").delete().eq("id", awardId);
  if (error) throw error;
}
