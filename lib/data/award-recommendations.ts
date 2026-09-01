"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/guards";

export type RecommendAwardResult =
  | { ok: true }
  | { ok: false; message: string };

export async function recommendAward(input: {
  volunteerName: string;
  awardTitle: string;
  note?: string;
}): Promise<RecommendAwardResult> {
  try {
    await requireStaff();
  } catch {
    return { ok: false, message: "Staff access required." };
  }

  const name = input.volunteerName.trim();
  const award = input.awardTitle.trim();
  if (!name || !award) {
    return { ok: false, message: "Volunteer name and award title are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: admins, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (adminError) {
    return { ok: false, message: adminError.message };
  }

  if (!admins?.length) {
    return { ok: false, message: "No admin accounts found to notify." };
  }

  const body = [
    `${name} — recommended for "${award}".`,
    input.note?.trim() ? `Note: ${input.note.trim()}` : null,
    user ? `From organiser account.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const rows = admins.map((a) => ({
    user_id: a.id,
    title: "Award recommendation",
    body,
    type: "event" as const,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) {
    return { ok: false, message: error.message || "Could not send recommendation." };
  }

  return { ok: true };
}
