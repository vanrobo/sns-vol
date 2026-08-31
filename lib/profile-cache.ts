import type { Profile, UserAward } from "@/types";

const CACHE_KEY = "sns-profile-v1";

export type ProfileCache = {
  userId: string;
  profile: Profile;
  awards: UserAward[];
  ts: number;
};

export function clearProfileCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function readProfileCache(expectedUserId?: string): ProfileCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileCache;
    if (Date.now() - parsed.ts > 1000 * 60 * 60 * 24) return null;
    const uid = parsed.userId ?? parsed.profile?.id;
    if (!uid) return null;
    if (expectedUserId && uid !== expectedUserId) return null;
    return { ...parsed, userId: uid };
  } catch {
    return null;
  }
}

export function writeProfileCache(data: {
  userId: string;
  profile: Profile;
  awards: UserAward[];
}) {
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
