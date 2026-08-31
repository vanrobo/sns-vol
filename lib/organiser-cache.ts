import type { OrganiserData } from "@/lib/data/organiser";

const CACHE_KEY = "sns-organiser-v1";

export type OrganiserCache = OrganiserData & { ts: number };

export function readOrganiserCache(): OrganiserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrganiserCache;
    if (Date.now() - parsed.ts > 1000 * 60 * 30) return null;
    const { ts: _, ...data } = parsed;
    return data;
  } catch {
    return null;
  }
}

export function writeOrganiserCache(data: OrganiserData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...data, ts: Date.now() } satisfies OrganiserCache),
    );
  } catch {
    /* ignore */
  }
}
