"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarDays, RefreshCw, X } from "lucide-react";
import {
  applyMyMentorLeave,
  cancelMyMentorLeave,
  listMyMentorLeaves,
} from "@/lib/center/mentors";

const LEAVE_TYPES = [
  ["CL", "Casual Leave"],
  ["SL", "Sick Leave"],
  ["EL", "Earned Leave"],
  ["PL", "Privilege Leave"],
] as const;

type LeaveRecord = {
  id?: string;
  leave_id?: string;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  total_days?: number;
  reason?: string;
  status?: string;
  decision_reason?: string | null;
};

function inclusiveDays(start: string, end: string) {
  if (!start || !end) return 0;
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86400000) + 1);
}

function statusClass(status?: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-500/15 text-emerald-700";
    case "Pending":
      return "bg-amber-500/15 text-amber-800";
    case "Rejected":
      return "bg-red-500/15 text-red-700";
    default:
      return "bg-slate-500/10 text-[var(--text-muted)]";
  }
}

export default function MentorLeavePanel() {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [form, setForm] = useState({
    leave_type: "CL",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const duration = useMemo(
    () => inclusiveDays(form.start_date, form.end_date),
    [form.start_date, form.end_date],
  );

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        setRecords((await listMyMentorLeaves()) as LeaveRecord[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load leave");
      }
    });
  };

  useEffect(() => {
    load();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      setMessage("Dates and a reason are required.");
      return;
    }
    if (duration < 1) {
      setMessage("End date must be on or after the start date.");
      return;
    }
    startTransition(async () => {
      try {
        setMessage("");
        await applyMyMentorLeave(form);
        setForm({ leave_type: "CL", start_date: "", end_date: "", reason: "" });
        setMessage("Leave request submitted.");
        setRecords((await listMyMentorLeaves()) as LeaveRecord[]);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Submit failed");
      }
    });
  };

  const cancel = (id: string) => {
    setActingId(id);
    startTransition(async () => {
      try {
        await cancelMyMentorLeave(id);
        setMessage("Pending leave cancelled.");
        setRecords((await listMyMentorLeaves()) as LeaveRecord[]);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Cancel failed");
      } finally {
        setActingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p
          className={`text-sm rounded-xl px-3 py-2 ${
            message.includes("submitted") || message.includes("cancelled")
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <h2 className="text-sm font-black">New request</h2>
        <label className="block text-xs font-semibold text-[var(--text-muted)]">
          Leave type
          <select
            value={form.leave_type}
            onChange={(e) =>
              setForm((f) => ({ ...f, leave_type: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
          >
            {LEAVE_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({value})
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-[var(--text-muted)]">
            From
            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_date: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-[var(--text-muted)]">
            To
            <input
              type="date"
              value={form.end_date}
              min={form.start_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_date: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-xs font-semibold text-[var(--text-muted)]">
          Reason
          <textarea
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm resize-y"
          />
        </label>
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand)]">
          <CalendarDays size={14} />
          {duration} {duration === 1 ? "day" : "days"}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Submit request"}
        </button>
      </form>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <header className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-black">Request history</h2>
        </header>
        {records.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-muted)]">
            No leave requests yet.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {records.map((record) => {
              const id = record.id ?? record.leave_id ?? "";
              const typeLabel =
                LEAVE_TYPES.find(([v]) => v === record.leave_type)?.[1] ??
                record.leave_type;
              return (
                <article key={id} className="p-4 space-y-2">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{typeLabel}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {record.start_date} → {record.end_date}
                        {record.total_days != null
                          ? ` · ${record.total_days} days`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full h-fit ${statusClass(record.status)}`}
                    >
                      {record.status ?? "—"}
                    </span>
                  </div>
                  <p className="text-sm">{record.reason}</p>
                  {record.decision_reason && (
                    <p className="text-xs text-[var(--text-muted)] rounded-lg bg-[var(--surface-muted)] p-2">
                      Coordinator: {record.decision_reason}
                    </p>
                  )}
                  {record.status === "Pending" && id && (
                    <button
                      type="button"
                      onClick={() => cancel(id)}
                      disabled={actingId === id || pending}
                      className="flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-50"
                    >
                      <X size={14} /> Cancel request
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
