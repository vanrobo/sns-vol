"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthResult = {
  error?: string;
  role?: string;
  status?: string;
  userId?: string;
};

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .single();

  if (profile?.status === "inactive") {
    await supabase.auth.signOut();
    return { error: "This account has been deactivated." };
  }

  revalidatePath("/", "layout");
  return {
    userId: data.user.id,
    role: profile?.role ?? "volunteer",
    status: profile?.status ?? "pending",
  };
}

export async function signUp(
  name: string,
  email: string,
  college: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, college } },
  });

  if (error) return { error: error.message };
  return {};
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
