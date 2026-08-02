import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const supabase = createClient();
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
    .single();

  if (error) throw error;
  return data as Profile;
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
      | "public_profile"
    >
  >,
) {
  const supabase = createClient();
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

export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  // Bust cache
  return `${publicUrl}?t=${Date.now()}`;
}

export async function deleteAccount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Soft-delete: deactivate and clear PII (auth user remains; full delete needs service role)
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
  const supabase = createClient();
  await supabase.auth.signOut();
}
