"use client";

import { useEffect, useState } from "react";
import { X, Activity, Loader2, Calendar, MapPin } from "lucide-react";
import { getMyAttendedEvents } from "@/lib/data/events";
import type { AttendedEventRow } from "@/lib/data/events";

type Props = {
  open: boolean;
  onClose: () => void;
  activenessPercent: number | null;
  attendedCount: number;
  totalActive: number;
};

export default function ActivenessModal({
  open,
  onClose,
  activenessPercent,
  attendedCount,
  totalActive,
}: Props) {
  const [rows, setRows] = useState<AttendedEventRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getMyAttendedEvents()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <Activity size={18} className="text-[var(--brand)]" />
              Activeness
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Events you have checked in to
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[var(--border)] bg-emerald-50/50 dark:bg-emerald-950/20">
          <p className="text-3xl font-black text-[var(--brand)] leading-none">
            {activenessPercent ?? 0}%
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            <span className="font-bold text-[var(--text)]">{attendedCount}</span>{" "}
            event{attendedCount === 1 ? "" : "s"} attended of{" "}
            <span className="font-bold text-[var(--text)]">{totalActive}</span>{" "}
            active event{totalActive === 1 ? "" : "s"}
          </p>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-0.5">
            Events attended
          </p>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[var(--brand)]" size={24} />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-sm text-[var(--text-muted)]">
              No attended events yet. Check in when you join an event.
            </div>
          ) : (
            rows.map(({ event, attended_at }) => (
              <div
                key={`${event.id}-${attended_at}`}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-[#18181B]/50 space-y-1.5"
              >
                <p className="font-bold text-sm leading-tight">{event.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <Calendar size={12} className="shrink-0 text-[var(--brand)]" />
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <MapPin size={12} className="shrink-0 text-[var(--brand)]" />
                  <span className="truncate">{event.venue}</span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 pt-0.5">
                  Checked in {new Date(attended_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
