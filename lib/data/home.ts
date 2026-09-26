"use server";

import { getEvents, getUpcomingEvents } from "@/lib/data/events";
import { getMyAwards } from "@/lib/data/awards";
import { getMyRole, getVolunteerStats } from "@/lib/data/profiles";
import type { Event, Profile, UserAward } from "@/types";

export type HomeBootstrap = {
  session: {
    id: string;
    role: Profile["role"];
    status: Profile["status"];
    name: string;
    batch: string | null;
    phone: string;
    skills: string[];
    college: string;
  } | null;
  awards: UserAward[];
  stats: { attended: number; totalActive: number } | null;
  activeEvents: Event[];
  upcomingEvents: Event[];
};

/**
 * Single server action for the home cold load — one client→server round-trip
 * instead of separate getMyRole / awards / stats / events / upcoming calls.
 */
export async function getHomeBootstrap(): Promise<HomeBootstrap> {
  const [session, awards, stats, activeEvents, upcomingEvents] =
    await Promise.all([
      getMyRole(),
      getMyAwards(),
      getVolunteerStats(),
      getEvents("active"),
      getUpcomingEvents(),
    ]);

  return {
    session,
    awards,
    stats,
    activeEvents,
    upcomingEvents: session?.role === "volunteer" ? upcomingEvents : [],
  };
}
