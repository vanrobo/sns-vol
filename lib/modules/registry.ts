/**
 * Platform module map — sns-vol shell.
 * 1 Center Management (core) · 2 Wordsmith · 3 Internship
 */

import type { UserRole } from "@/types";
import { modulesForRole } from "@/lib/auth/access";

export type PlatformModuleId = "center" | "wordsmith" | "internship";

export type PlatformModule = {
  id: PlatformModuleId;
  number: 1 | 2 | 3;
  title: string;
  short: string;
  href: string;
  status: "active" | "scaffold" | "integrate";
  children?: { label: string; href: string; note?: string }[];
};

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    id: "center",
    number: 1,
    title: "Center Management",
    short: "Students, mentors, docs, guests, events",
    href: "/center",
    status: "active",
    children: [
      { label: "Students", href: "/center/students", note: "Roster + attendance" },
      {
        label: "Student attendance",
        href: "/center/students/attendance",
        note: "Daily P / A / L / H",
      },
      { label: "Mentors", href: "/center/mentors", note: "Roster" },
      { label: "My PiPo", href: "/center/mentors/pipo", note: "Punch in / out" },
      { label: "My leave", href: "/center/mentors/leave", note: "Ask for leave" },
      {
        label: "Approvals",
        href: "/center/mentors/approvals",
        note: "Punches + leave",
      },
      { label: "Documents", href: "/center/documents", note: "Form bookmarks" },
      { label: "Guests", href: "/center/guests", note: "Visitor log + QR" },
      { label: "Events", href: "/events", note: "Volunteer events (live)" },
      { label: "Course planning", href: "/center/courses", note: "Scaffold" },
    ],
  },
  {
    id: "wordsmith",
    number: 2,
    title: "Wordsmith",
    short: "Words, class deadlines, teach-by dates",
    href: "/wordsmith",
    status: "active",
    children: [
      { label: "Word bank", href: "/wordsmith", note: "Shared login · same DB" },
    ],
  },
  {
    id: "internship",
    number: 3,
    title: "Internship",
    short: "Junior + Senior wings",
    href: "/internship",
    status: "active",
    children: [
      { label: "Junior wing", href: "/internship/junior", note: "Minakshi" },
      { label: "Senior wing", href: "/internship/senior", note: "Rashmi" },
    ],
  },
];

export function getModule(id: PlatformModuleId): PlatformModule {
  const mod = PLATFORM_MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown module: ${id}`);
  return mod;
}

/** Role-filtered module list for hub / menus. */
export function modulesVisibleTo(role: UserRole | null | undefined): PlatformModule[] {
  if (!role) return PLATFORM_MODULES;
  const vis = modulesForRole(role);
  return PLATFORM_MODULES.filter((m) => {
    if (m.id === "center") return vis.center;
    if (m.id === "wordsmith") return vis.wordsmith;
    if (m.id === "internship") return vis.internship;
    return true;
  });
}
