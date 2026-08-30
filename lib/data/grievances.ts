"use server";

import { createClient } from "@/lib/supabase/server";
import type { Grievance } from "@/types";

export async function getUserGrievances(): Promise<Grievance[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("grievances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Grievance[];
}

export async function submitGrievance(category: string, description: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("grievances")
    .insert({
      user_id: user.id,
      category,
      description,
      status: "open",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Grievance;
}
