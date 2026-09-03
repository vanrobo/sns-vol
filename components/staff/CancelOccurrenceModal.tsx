"use client";

import { useState } from "react";
import { X, CalendarOff, Loader2 } from "lucide-react";
import type { Event } from "@/types";

type Props = {
  event: Event | null;
  onClose: () => void;
  onConfirm: (eventId: string, date: string) => Promise<void>;
};

export default function CancelOccurrenceModal({
  event,
  onClose,
  onConfirm,
}: Props) {
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);

  if (!event) return null;

  const submit = async () => {
    if (!date) return;
    setBusy(true);
    try {
      await onConfirm(event.id, date);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold">Cancel one occurrence</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Pick a date to mark as class off (red) on the calendar for
              &ldquo;{event.title}&rdquo;. The event series stays active.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">
            Date to cancel
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] text-sm"
          />
        </div>

        {event.cancelled_dates && event.cancelled_dates.length > 0 && (
          <div className="text-xs text-[var(--text-muted)]">
            Already cancelled: {event.cancelled_dates.join(", ")}
          </div>
        )}

        <button
          type="button"
          disabled={!date || busy}
          onClick={submit}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <CalendarOff size={16} />
          )}
          Cancel this date
        </button>
      </div>
    </div>
  );
}
