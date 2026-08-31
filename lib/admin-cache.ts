import type { AdminData } from "@/types";

const CACHE_KEY = "sns-admin-v1";

export type AdminCache = AdminData & { ts: number };

export function readAdminCache(): AdminData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminCache;
    if (Date.now() - parsed.ts > 1000 * 60 * 30) return null;
    const { ts: _, ...data } = parsed;
    return data;
  } catch {
    return null;
  }
}

export function writeAdminCache(data: AdminData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...data, ts: Date.now() } satisfies AdminCache),
    );
  } catch {
    /* ignore */
  }
}
