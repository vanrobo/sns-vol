import type { Event } from "@/types";

const CACHE_KEY = "sns-events-v1";
const TTL_MS = 1000 * 60 * 30; // 30 minutes

type CacheEntry = {
  events: Event[];
  calendarEvents: Event[];
  ts: number;
};

type EventsCacheStore = {
  userId: string;
  entries: Record<string, CacheEntry>;
};

export function eventsCacheKey(
  tab: string,
  dateFilter: string,
  regionFilter: string,
) {
  return `${tab}|${dateFilter}|${regionFilter}`;
}

function readStore(): EventsCacheStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EventsCacheStore;
  } catch {
    return null;
  }
}

export function readEventsCache(
  userId: string | undefined,
  key: string,
): CacheEntry | null {
  if (!userId) return null;
  const store = readStore();
  if (!store || store.userId !== userId) return null;
  const entry = store.entries[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) return null;
  return entry;
}

export function writeEventsCache(
  userId: string,
  key: string,
  events: Event[],
  calendarEvents: Event[] = [],
) {
  if (typeof window === "undefined") return;
  try {
    const store = readStore();
    const entries =
      store?.userId === userId ? { ...store.entries } : {};
    entries[key] = { events, calendarEvents, ts: Date.now() };
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ userId, entries } satisfies EventsCacheStore),
    );
  } catch {
    /* quota */
  }
}

export function clearEventsCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
