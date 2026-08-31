"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Event } from "@/types";

type Props = {
  events: Event[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function expandEventDates(event: Event): string[] {
  const dates: string[] = [];
  const start = event.date;
  if (!start) return dates;

  const cancelled = new Set(event.cancelled_dates ?? []);

  if (!event.is_recurring || !event.end_date) {
    if (!cancelled.has(start)) dates.push(start);
    return dates;
  }

  const cur = new Date(`${start}T12:00:00`);
  const end = new Date(`${event.end_date}T12:00:00`);
  while (cur <= end) {
    const iso = toIso(cur.getFullYear(), cur.getMonth(), cur.getDate());
    if (!cancelled.has(iso)) dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function EventCalendarView({
  events,
  selectedDate,
  onSelectDate,
}: Props) {
  const anchor = selectedDate
    ? new Date(`${selectedDate}T12:00:00`)
    : new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = new Map<string, Event[]>();
  for (const evt of events) {
    for (const d of expandEventDates(evt)) {
      const list = byDate.get(d) ?? [];
      list.push(evt);
      byDate.set(d, list);
    }
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onSelectDate(toIso(d.getFullYear(), d.getMonth(), 1));
  };

  const monthLabel = anchor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 space-y-3">
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
          const primary = dayEvents[0];
          const hasCancelled =
            primary &&
            (primary.cancelled_dates ?? []).includes(iso) &&
            !dayEvents.some((e) => expandEventDates(e).includes(iso));

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={`aspect-square rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                isSelected
                  ? "ring-2 ring-[var(--brand)] bg-[var(--brand)]/10"
                  : "hover:bg-slate-100 dark:hover:bg-[#18181B]"
              }`}
            >
              <span>{day}</span>
              {dayEvents.length > 0 && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: hasCancelled
                      ? "#ef4444"
                      : primary?.color ?? "var(--brand)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <p className="text-[11px] text-[var(--text-muted)] text-center">
          {(byDate.get(selectedDate) ?? []).length} event
          {(byDate.get(selectedDate) ?? []).length === 1 ? "" : "s"} on{" "}
          {new Date(`${selectedDate}T12:00:00`).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
