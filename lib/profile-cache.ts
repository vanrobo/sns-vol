import type { Profile, UserAward } from "@/types";

const CACHE_KEY = "sns-profile-v1";

export type ProfileCache = {
  profile: Profile;
  awards: UserAward[];
  ts: number;
};

export function readProfileCache(): ProfileCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileCache;
    if (Date.now() - parsed.ts > 1000 * 60 * 60 * 24) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeProfileCache(data: Omit<ProfileCache, "ts">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...data, ts: Date.now() } satisfies ProfileCache),
    );
  } catch {
    /* ignore */
  }
}
