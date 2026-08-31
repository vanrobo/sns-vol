"use client";

import type { Event } from "@/types";
import { Calendar, ChevronRight, MapPin } from "lucide-react";

type UpcomingEventsProps = {
  events: Event[];
  onSelect: (event: Event) => void;
};

export default function UpcomingEvents({ events, onSelect }: UpcomingEventsProps) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
          Your upcoming events
        </h2>
      </div>
      {events.length === 0 ? (
        <p className="p-4 text-sm text-[var(--text-muted)] leading-relaxed">
          No approved events yet. Browse below and tap{" "}
          <span className="font-bold text-[var(--text)]">Interested</span> to apply.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-[var(--brand)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">{event.title}</p>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  {new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {event.time_start && ` · ${event.time_start.slice(0, 5)}`}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={10} /> {event.venue}
                </p>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
