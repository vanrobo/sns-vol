"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

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
  const ip = await getClientIp();
  const limited = await enforceRateLimit("auth", ip);
  if (limited) return { error: limited };

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
  const ip = await getClientIp();
  const limited = await enforceRateLimit("signup", ip);
  if (limited) return { error: limited };

  const service = createServiceClient();
  if (!service) {
    return { error: "Sign-up is temporarily unavailable. Contact an admin." };
  }

  // Create + auto-confirm so we never send Supabase confirmation emails
  // (project rate limits: ~2 verification emails per hour).
  const { data: created, error: createError } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, college },
    });

  if (createError) return { error: createError.message };
  if (!created.user) return { error: "Could not create account." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error:
        "Account created but sign-in failed. Try logging in with your email and password.",
    };
  }

  revalidatePath("/", "layout");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .single();

  return {
    userId: data.user.id,
    role: profile?.role ?? "volunteer",
    status: profile?.status ?? "pending",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
