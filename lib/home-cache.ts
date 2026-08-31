import type { UserAward, UserRole } from "@/types";

const CACHE_KEY = "sns-home-v1";

export type HomeCache = {
  userId: string;
  session: { role: UserRole; name: string; batch: string | null } | null;
  awards: UserAward[];
  stats: { attended: number; totalActive: number } | null;
  ts: number;
};

export function clearHomeCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAppCaches() {
  clearHomeCache();
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("sns-profile-v1");
      localStorage.removeItem("sns-admin-v1");
      localStorage.removeItem("sns-events-v1");
      localStorage.removeItem("sns-notifications-v1");
    } catch {
      /* ignore */
    }
  }
}

export function readHomeCache(expectedUserId?: string): HomeCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomeCache;
    if (Date.now() - parsed.ts > 1000 * 60 * 60 * 24) return null;
    if (expectedUserId && parsed.userId && parsed.userId !== expectedUserId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeHomeCache(
  data: Omit<HomeCache, "ts"> & { userId: string },
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...data, ts: Date.now() } satisfies HomeCache),
    );
  } catch {
    /* quota / private mode */
  }
}
