"use client";

import { useEffect, useState } from "react";
import { X, Users, Loader2, ScanLine } from "lucide-react";
import type { Event } from "@/types";
import {
  getEventAttendance,
  type AttendanceRow,
} from "@/lib/data/admin";

type Props = {
  event: Event | null;
  onClose: () => void;
  onScan?: () => void;
};

export default function EventAttendanceModal({ event, onClose, onScan }: Props) {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    getEventAttendance(event.id)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [event]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h3 className="font-bold truncate">{event.title}</h3>
            <p className="text-xs text-[var(--text-muted)]">Attendance roster</p>
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

        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[var(--brand)]" size={24} />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10 text-sm text-[var(--text-muted)]">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              No attendance recorded yet.
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={`${row.user_id}-${row.attended_at}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-[#18181B]/50"
              >
                <p className="font-semibold text-sm truncate">{row.user_name}</p>
                <p className="text-[10px] text-[var(--text-muted)] shrink-0">
                  {new Date(row.attended_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          {onScan && (
            <button
              type="button"
              onClick={onScan}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--brand)] text-white font-bold text-sm"
            >
              <ScanLine size={16} />
              Scan I-Card
            </button>
          )}
          <p className="text-xs text-center text-[var(--text-muted)]">
            {rows.length} volunteer{rows.length === 1 ? "" : "s"} marked attended
          </p>
        </div>
      </div>
    </div>
  );
}
