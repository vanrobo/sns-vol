"use server";

import { createClient } from "@/lib/supabase/server";
import { createVerifyToken, getVerifyUrl } from "@/lib/qr/verify-token";
import type { Profile } from "@/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const supabase = await createClient();
  let id = userId;
  if (!id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    id = user.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function getMyRole(): Promise<{
  id: string;
  role: Profile["role"];
  status: Profile["status"];
  name: string;
  batch: string | null;
  phone: string;
  skills: string[];
  college: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, status, name, batch, phone, skills, college")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as {
    id: string;
    role: Profile["role"];
    status: Profile["status"];
    name: string;
    batch: string | null;
    phone: string;
    skills: string[];
    college: string;
  };
}

export async function getVolunteerStats(): Promise<{
  attended: number;
  totalActive: number;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ count: attended }, { count: totalActive }] = await Promise.all([
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  return {
    attended: attended ?? 0,
    totalActive: totalActive ?? 0,
  };
}

export async function getQrVerifyUrl(): Promise<string | null> {
  const profile = await getProfile();
  if (!profile?.volunteer_id || profile.status !== "active") return null;
  const token = createVerifyToken({
    volunteer_id: profile.volunteer_id,
    name: profile.name,
    status: profile.status,
    valid_until: profile.valid_until,
  });
  return getVerifyUrl(token);
}

export async function updateProfile(
  updates: Partial<
    Pick<
      Profile,
      | "name"
      | "college"
      | "phone"
      | "address"
      | "skills"
      | "avatar_url"
      | "email_notifs"
    >
  >,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function uploadAvatar(formData: FormData): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  return `${publicUrl}?t=${Date.now()}`;
}

export async function requestDeleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ delete_requested_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
}

export async function cancelDeleteAccountRequest() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ delete_requested_at: null })
    .eq("id", user.id);
  if (error) throw error;
}

/** @deprecated Use requestDeleteAccount — kept for admin tooling */
export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "inactive",
      name: "Deleted User",
      phone: "",
      address: "",
      avatar_url: null,
      college: "",
      skills: [],
    })
    .eq("id", user.id);
  if (error) throw error;
  await supabase.auth.signOut();
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
