import type { Event } from "@/types";
import { expandEventDates } from "@/lib/events/dates";

export function eventLocationLabel(event: Event): string {
  return event.region?.trim() || event.venue?.trim() || "Other locations";
}

export function groupEventsByLocation(
  events: Event[],
): Array<{ label: string; events: Event[] }> {
  const map = new Map<string, Event[]>();

  for (const event of events) {
    const label = eventLocationLabel(event);
    const list = map.get(label) ?? [];
    list.push(event);
    map.set(label, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, grouped]) => ({ label, events: grouped }));
}

/** Unique concern centers / venues with day-counts in a given month. */
export function locationsInMonth(
  events: Event[],
  monthAnchor: string,
): Array<{ label: string; days: number }> {
  const monthPrefix = monthAnchor.slice(0, 7);
  const daySets = new Map<string, Set<string>>();

  for (const event of events) {
    const label = eventLocationLabel(event);
    for (const date of expandEventDates(event)) {
      if (!date.startsWith(monthPrefix)) continue;
      const days = daySets.get(label) ?? new Set<string>();
      days.add(date);
      daySets.set(label, days);
    }
  }

  return [...daySets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, days]) => ({ label, days: days.size }));
}
