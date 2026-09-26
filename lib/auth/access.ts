/**
 * Unified permissions for sns-vol (Events shell) + Center + later modules.
 * One login, role-filtered menus — sns-vol code style.
 */

import type { UserRole } from "@/types";

export const ROLES = {
  ADMIN: "admin",
  ORGANISER: "organiser",
  COORDINATOR: "coordinator",
  MENTOR: "mentor",
  VOLUNTEER: "volunteer",
} as const satisfies Record<string, UserRole>;

export type CenterPermission =
  | "readStudents"
  | "writeStudents"
  | "readMentors"
  | "writeMentors"
  | "mentorSelfService"
  | "accessDocuments"
  | "accessGuests"
  | "accessCourses"
  | "accessCenter"
  | "accessEventsStaff"
  | "accessInternship"
  | "accessWordsmith"
  | "admin";

export function normalizeRole(role: string | null | undefined): UserRole {
  const value = String(role ?? "")
    .trim()
    .toLowerCase();
  if (value === "admin") return "admin";
  if (value === "organiser") return "organiser";
  if (value === "coordinator" || value === "cordinator") return "coordinator";
  if (value === "mentor") return "mentor";
  return "volunteer";
}

export function getProfileRole(profile: {
  role?: string | null;
  app_role?: string | null;
}): UserRole {
  return normalizeRole(profile?.role ?? profile?.app_role);
}

export function hasPermission(
  profileOrRole: UserRole | string | { role?: string | null } | null | undefined,
  permission: CenterPermission,
): boolean {
  const role =
    typeof profileOrRole === "string" || !profileOrRole
      ? normalizeRole(profileOrRole as string | null | undefined)
      : getProfileRole(profileOrRole);

  switch (permission) {
    case "admin":
      return role === "admin";
    case "accessEventsStaff":
      return role === "admin" || role === "organiser" || role === "coordinator";
    case "accessCenter":
      return (
        role === "admin" ||
        role === "coordinator" ||
        role === "mentor" ||
        role === "volunteer"
      );
    case "readStudents":
      return (
        role === "admin" ||
        role === "coordinator" ||
        role === "mentor" ||
        role === "volunteer"
      );
    case "writeStudents":
      return role === "admin" || role === "coordinator" || role === "mentor";
    case "readMentors":
      return role === "admin" || role === "coordinator" || role === "mentor";
    case "writeMentors":
      return role === "admin" || role === "coordinator";
    case "mentorSelfService":
      return role === "mentor" || role === "coordinator" || role === "admin";
    case "accessDocuments":
    case "accessGuests":
      return (
        role === "admin" ||
        role === "coordinator" ||
        role === "mentor" ||
        role === "volunteer"
      );
    case "accessCourses":
      return role === "admin" || role === "coordinator" || role === "mentor";
    case "accessInternship":
      return (
        role === "admin" ||
        role === "coordinator" ||
        role === "mentor" ||
        role === "organiser"
      );
    case "accessWordsmith":
      return (
        role === "admin" ||
        role === "coordinator" ||
        role === "mentor" ||
        role === "organiser" ||
        role === "volunteer"
      );
    default:
      return false;
  }
}

/** Home / post-login landing by role (sns-vol first for volunteers). */
export function getDefaultRoute(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "organiser") return "/organiser";
  if (role === "coordinator") return "/center";
  if (role === "mentor") return "/center";
  return "/";
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/organiser")) {
    return role === "admin" || role === "organiser" || role === "coordinator";
  }
  if (pathname.startsWith("/center/students")) {
    if (pathname.includes("/attendance") || pathname.includes("/manage")) {
      return hasPermission(role, "writeStudents");
    }
    return hasPermission(role, "readStudents");
  }
  if (pathname.startsWith("/center/mentors")) {
    if (
      pathname.includes("/pipo") ||
      pathname.includes("/leave") ||
      pathname.includes("/profile")
    ) {
      return hasPermission(role, "mentorSelfService");
    }
    return hasPermission(role, "writeMentors") || hasPermission(role, "readMentors");
  }
  if (pathname.startsWith("/center/documents")) {
    return hasPermission(role, "accessDocuments");
  }
  if (pathname.startsWith("/center/guests")) {
    return hasPermission(role, "accessGuests");
  }
  if (pathname.startsWith("/center/courses")) {
    return hasPermission(role, "accessCourses");
  }
  if (pathname.startsWith("/center")) {
    return hasPermission(role, "accessCenter");
  }
  if (pathname.startsWith("/internship")) {
    return hasPermission(role, "accessInternship") || role === "volunteer";
  }
  if (pathname.startsWith("/wordsmith")) {
    return hasPermission(role, "accessWordsmith");
  }
  return true;
}

export type ModuleVisibility = {
  center: boolean;
  wordsmith: boolean;
  internship: boolean;
  events: boolean;
};

export function modulesForRole(role: UserRole): ModuleVisibility {
  return {
    center: hasPermission(role, "accessCenter"),
    wordsmith: hasPermission(role, "accessWordsmith"),
    internship: hasPermission(role, "accessInternship") || role === "volunteer",
    events: true,
  };
}

export function isCenterStaff(role: UserRole): boolean {
  return role === "admin" || role === "coordinator" || role === "mentor";
}

export function isEventsStaff(role: UserRole): boolean {
  return role === "admin" || role === "organiser" || role === "coordinator";
}
