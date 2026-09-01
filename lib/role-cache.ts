import type { ProfileStatus, UserRole } from "@/types";

const ROLE_KEY = "sns-user-role-v1";
const STATUS_KEY = "sns-user-status-v1";

const VALID_ROLES = new Set<UserRole>(["volunteer", "organiser", "admin"]);

export function readCachedRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ROLE_KEY);
    if (stored && VALID_ROLES.has(stored as UserRole)) {
      return stored as UserRole;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function readCachedVolunteerStatus(): ProfileStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STATUS_KEY);
    if (stored === "pending" || stored === "active" || stored === "inactive") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeCachedSession(role: UserRole, status: ProfileStatus) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(STATUS_KEY, status);
  } catch {
    /* ignore */
  }
}

export function clearCachedSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(STATUS_KEY);
  } catch {
    /* ignore */
  }
}
