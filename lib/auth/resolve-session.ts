import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeRole } from "@/lib/auth/access";
import type { ProfileStatus, UserRole } from "@/types";

export type ResolvedSession = {
  id: string;
  role: UserRole;
  status: ProfileStatus;
  name: string;
  batch: string | null;
  phone: string;
  skills: string[];
  college: string;
  centre: string | null;
  source: "profiles" | "mentor_user_profiles";
};

/**
 * Resolve unified session: Events `profiles` first, then Centre
 * `mentor_user_profiles` (until 021 sync fills profiles).
 */
export async function resolveSessionFromUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ResolvedSession | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, status, name, batch, phone, skills, college, centre")
    .eq("id", userId)
    .maybeSingle();

  if (!profileError && profile) {
    return {
      id: profile.id,
      role: normalizeRole(profile.role),
      status: (profile.status as ProfileStatus) ?? "active",
      name: profile.name ?? "",
      batch: profile.batch ?? null,
      phone: profile.phone ?? "",
      skills: profile.skills ?? [],
      college: profile.college ?? "",
      centre: profile.centre ?? null,
      source: "profiles",
    };
  }

  const { data: mentor } = await supabase
    .from("mentor_user_profiles")
    .select("auth_user_id, app_role, display_name, center, email")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!mentor?.auth_user_id) return null;

  const role = normalizeRole(mentor.app_role);
  // Guest accounts stay volunteer-level for Events shell.
  if (String(mentor.app_role).toLowerCase() === "guest") {
    return {
      id: mentor.auth_user_id,
      role: "volunteer",
      status: "active",
      name: mentor.display_name || "Guest",
      batch: null,
      phone: "",
      skills: [],
      college: "",
      centre: mentor.center ?? null,
      source: "mentor_user_profiles",
    };
  }

  return {
    id: mentor.auth_user_id,
    role,
    status: "active",
    name: mentor.display_name || mentor.email || "User",
    batch: null,
    phone: "",
    skills: [],
    college: "",
    centre: mentor.center ?? null,
    source: "mentor_user_profiles",
  };
}
