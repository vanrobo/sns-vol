"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { Event } from "@/types";
import { expandEventDates } from "@/lib/events/dates";
import { locationsInMonth } from "@/lib/events/locations";

export { expandEventDates } from "@/lib/events/dates";

type Props = {
  events: Event[];
  monthAnchor: string;
  onMonthChange: (firstOfMonth: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onDayOpen?: (date: string, dayEvents: Event[]) => void;
  embedded?: boolean;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function isSunday(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay() === 0;
}

/** Up to two dots: gray = regular class, green = one-off event, red = class off (Sunday/canceled). */
function getDayDots(iso: string, dayEvents: Event[]): { color: string; key: string }[] {
  if (dayEvents.length === 0) return [];

  const recurring = dayEvents.filter((e) => e.is_recurring);
  const oneOff = dayEvents.filter((e) => !e.is_recurring);
  const classCanceled = recurring.some((e) => (e.cancelled_dates ?? []).includes(iso));
  const sundayNoClass = isSunday(iso) && recurring.length > 0;
  const hasActiveClass =
    recurring.length > 0 && !isSunday(iso) && !classCanceled;
  const hasEvent = oneOff.length > 0;

  const dots: { color: string; key: string }[] = [];

  if (sundayNoClass || classCanceled) {
    dots.push({ key: "off", color: "#ef4444" });
  } else if (hasActiveClass) {
    dots.push({ key: "class", color: "#94a3b8" });
  }

  if (hasEvent) {
    dots.push({ key: "event", color: "#22c55e" });
  }

  return dots;
}

export default function EventCalendarView({
  events,
  monthAnchor,
  onMonthChange,
  selectedDate,
  onSelectDate,
  onDayOpen,
  embedded = false,
}: Props) {
  const anchor = new Date(`${monthAnchor}T12:00:00`);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = new Map<string, Event[]>();
  for (const evt of events) {
    for (const d of expandEventDates(evt)) {
      const list = byDate.get(d) ?? [];
      if (!list.some((e) => e.id === evt.id)) list.push(evt);
      byDate.set(d, list);
    }
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onMonthChange(toIso(d.getFullYear(), d.getMonth(), 1));
  };

  const monthLabel = anchor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const locationGroups = useMemo(
    () => locationsInMonth(events, monthAnchor),
    [events, monthAnchor],
  );

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDayClick = (iso: string) => {
    onSelectDate(iso);
    const dayEvents = byDate.get(iso) ?? [];
    if (dayEvents.length > 0) onDayOpen?.(iso, dayEvents);
  };

  return (
    <div className={embedded ? "space-y-3 pt-1" : "bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3"}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#18181B]"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-bold">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#18181B]"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-center text-[var(--text-muted)]">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const iso = toIso(year, month, day);
          const dayEvents = byDate.get(iso) ?? [];
          const isSelected = selectedDate === iso;
          const dots = getDayDots(iso, dayEvents);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => handleDayClick(iso)}
              className={`aspect-square rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                isSelected
                  ? "ring-2 ring-[var(--brand)] bg-[var(--brand)]/10"
                  : dayEvents.length > 0
                    ? "bg-slate-100/80 dark:bg-[#18181B]"
                    : "hover:bg-slate-100 dark:hover:bg-[#18181B]"
              }`}
            >
              <span>{day}</span>
              {dots.length > 0 && (
                <span className="flex gap-0.5">
                  {dots.map((dot) => (
                    <span
                      key={dot.key}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: dot.color }}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && !onDayOpen && (
        <p className="text-[11px] text-[var(--text-muted)] text-center">
          {(byDate.get(selectedDate) ?? []).length} event
          {(byDate.get(selectedDate) ?? []).length === 1 ? "" : "s"} on{" "}
          {new Date(`${selectedDate}T12:00:00`).toLocaleDateString()}
        </p>
      )}

      {embedded && (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
              <span>Class</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span>Event</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>Off</span>
            </span>
          </div>
          {locationGroups.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-slate-50/80 dark:bg-[#18181B]/50 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Locations this month
              </p>
              <div className="flex flex-wrap gap-2">
                {locationGroups.map(({ label, days }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                  >
                    <MapPin size={10} className="text-[var(--brand)] shrink-0" />
                    {label}
                    <span className="text-[var(--text-muted)]">· {days}d</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
