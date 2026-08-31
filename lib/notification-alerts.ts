const SHOWN_KEY = "sns-shown-notifs-v1";
const MAX_STORED = 100;

export function loadShownNotificationIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SHOWN_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function markNotificationShown(id: string, known: Set<string>) {
  if (known.has(id)) return;
  known.add(id);
  if (typeof window === "undefined") return;
  try {
    const next = [...known].slice(-MAX_STORED);
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function wasNotificationShown(id: string): boolean {
  return loadShownNotificationIds().has(id);
}
