"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import {
  approveMentorAttendance,
  approveMentorLeave,
  listPendingMentorAttendance,
  listPendingMentorLeaves,
  rejectMentorAttendance,
  rejectMentorLeave,
} from "@/lib/center/mentors";

type AttendanceRow = {
  attendance_id?: string;
  id?: string;
  mentor_name?: string;
  name?: string;
  date?: string;
  check_in?: string;
  check_out?: string;
  center?: string;
};

type LeaveRow = {
  id?: string;
  leave_id?: string;
  mentor_name?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  center?: string;
};

export default function MentorApprovalsPanel() {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        const [a, l] = await Promise.all([
          listPendingMentorAttendance(),
          listPendingMentorLeaves(),
        ]);
        setAttendance(a as AttendanceRow[]);
        setLeaves(l as LeaveRow[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load approvals");
      }
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
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
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-black">Pending punches</h3>
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {attendance.map((row) => {
            const id = row.attendance_id || row.id || "";
            return (
              <li key={id} className="px-4 py-3 space-y-2">
                <div>
                  <p className="font-semibold text-sm">
                    {row.mentor_name || row.name || "Mentor"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {[row.date, row.center, row.check_in, row.check_out]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white"
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await approveMentorAttendance(
                            id,
                            row.check_in || "",
                            row.check_out || "",
                          );
                          setMessage("Punch approved.");
                          load();
                        } catch (e) {
                          setError(
                            e instanceof Error ? e.message : "Approve failed",
                          );
                        }
                      })
                    }
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-700"
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await rejectMentorAttendance(id);
                          setMessage("Punch rejected.");
                          load();
                        } catch (e) {
                          setError(
                            e instanceof Error ? e.message : "Reject failed",
                          );
                        }
                      })
                    }
                  >
                    Reject
                  </button>
                </div>
              </li>
            );
          })}
          {!pending && attendance.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">
              No pending punches.
            </li>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-black">Pending leave</h3>
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {leaves.map((row) => {
            const id = row.leave_id || row.id || "";
            return (
              <li key={id} className="px-4 py-3 space-y-2">
                <div>
                  <p className="font-semibold text-sm">
                    {row.mentor_name || row.name || "Mentor"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {[row.start_date, row.end_date, row.center, row.reason]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white"
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await approveMentorLeave(id);
                          setMessage("Leave approved.");
                          load();
                        } catch (e) {
                          setError(
                            e instanceof Error ? e.message : "Approve failed",
                          );
                        }
                      })
                    }
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-700"
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await rejectMentorLeave(id);
                          setMessage("Leave rejected.");
                          load();
                        } catch (e) {
                          setError(
                            e instanceof Error ? e.message : "Reject failed",
                          );
                        }
                      })
                    }
                  >
                    Reject
                  </button>
                </div>
              </li>
            );
          })}
          {!pending && leaves.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">
              No pending leave.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
