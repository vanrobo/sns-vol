"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus, UserRole } from "@/types";
import { isEventsStaff, isCenterStaff } from "@/lib/auth/access";
import { resolveSessionFromUser } from "@/lib/auth/resolve-session";

export type SessionProfile = {
  id: string;
  role: UserRole;
  status: ProfileStatus;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await resolveSessionFromUser(supabase, user.id);
  if (!profile) return null;
  return {
    id: profile.id,
    role: profile.role,
    status: profile.status,
  };
}

export async function requireAuth(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("Not authenticated");
  return profile;
}

export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireAuth();
  if (profile.role !== "admin") throw new Error("Admin access required");
  return profile;
}

export async function requireStaff(): Promise<SessionProfile> {
  const profile = await requireAuth();
  if (!isEventsStaff(profile.role)) {
    throw new Error("Staff access required");
  }
  return profile;
}

export async function requireCenterStaff(): Promise<SessionProfile> {
  const profile = await requireAuth();
  if (!isCenterStaff(profile.role) && profile.role !== "volunteer") {
    throw new Error("Center access required");
  }
  return profile;
}

export async function requireActiveVolunteer(): Promise<SessionProfile> {
  const profile = await requireAuth();
  if (profile.role !== "volunteer") return profile;
  if (profile.status !== "active") {
    throw new Error("Your account is awaiting I-Card approval.");
  }
  return profile;
}
