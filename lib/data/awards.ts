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
    .select("*, awards(title, description, event_id)")
    .eq("user_id", user.id)
    .order("awarded_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      user_id: string;
      award_id: string;
      awarded_at: string;
      awards: { title: string; description: string; event_id: string | null } | null;
    };
    return {
      id: r.id,
      user_id: r.user_id,
      award_id: r.award_id,
      awarded_at: r.awarded_at,
      title: r.awards?.title ?? "Award",
      description: r.awards?.description ?? "",
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
      created_at: row.created_at,
      recipient_count: row.user_awards?.[0]?.count ?? 0,
    };
  });
}

export async function createAward(input: {
  title: string;
  description?: string;
  event_id?: string | null;
}) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("awards")
    .insert({
      title: input.title,
      description: input.description ?? "",
      event_id: input.event_id || null,
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
