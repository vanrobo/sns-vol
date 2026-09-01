"use client";

import { useMemo, useState } from "react";
import { Check, Ban, RotateCcw, Undo2 } from "lucide-react";
import type { Application, ApplicationStatus } from "@/types";
import { titleCaseStatus } from "@/types";
import Pagination, { paginate } from "@/components/staff/Pagination";

type ApplicationsTableProps = {
  applications: Application[];
  page: number;
  onPageChange: (page: number) => void;
  actioningId: string | null;
  onAction: (
    userId: string,
    eventId: string,
    status: ApplicationStatus,
  ) => void;
  floatingPagination?: boolean;
  showFilters?: boolean;
};

const PAGE_SIZE = 6;

type AppFilter = "all" | ApplicationStatus;

export default function ApplicationsTable({
  applications,
  page,
  onPageChange,
  actioningId,
  onAction,
  floatingPagination = false,
  showFilters = true,
}: ApplicationsTableProps) {
  const [filter, setFilter] = useState<AppFilter>("all");

  const counts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      approved: applications.filter((a) => a.status === "approved").length,
      declined: applications.filter((a) => a.status === "declined").length,
    }),
    [applications],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? applications
        : applications.filter((a) => a.status === filter),
    [applications, filter],
  );

  const paged = paginate(filtered, page, PAGE_SIZE);
  const rowId = (app: Application) => `${app.user_id}-${app.event_id}`;

  return (
    <div className="space-y-3">
      {showFilters && (
        <div className="flex flex-wrap bg-slate-100 dark:bg-[#18181B] p-1 rounded-lg gap-1">
          {(
            [
              ["all", "All", counts.all],
              ["pending", "Pending", counts.pending],
              ["approved", "Approved", counts.approved],
              ["declined", "Declined", counts.declined],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                onPageChange(1);
              }}
              className={`flex-1 min-w-[4.5rem] py-1.5 text-xs font-bold rounded-md transition-all ${
                filter === key
                  ? "bg-white dark:bg-black text-[var(--brand)] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {paged.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          No applications match this filter.
        </p>
      ) : (
        paged.map((app) => {
          const busy = actioningId === rowId(app);
          return (
            <div
              key={app.id}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-bold">{app.user_name}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    {app.event_title}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    app.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : app.status === "declined"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {titleCaseStatus(app.status)}
                </span>
              </div>

              {app.user_skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {app.user_skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-[#18181B]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
                {app.status === "pending" && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() =>
                        onAction(app.user_id, app.event_id, "approved")
                      }
                      className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        onAction(app.user_id, app.event_id, "declined")
                      }
                      className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 text-xs font-bold disabled:opacity-50"
                    >
                      <Ban size={14} /> Decline
                    </button>
                  </>
                )}
                {app.status === "approved" && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() =>
                        onAction(app.user_id, app.event_id, "declined")
                      }
                      className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 text-xs font-bold disabled:opacity-50"
                    >
                      <Undo2 size={14} /> Revoke
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        onAction(app.user_id, app.event_id, "pending")
                      }
                      className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[var(--border)] text-xs font-bold disabled:opacity-50"
                    >
                      <RotateCcw size={14} /> Re-open
                    </button>
                  </>
                )}
                {app.status === "declined" && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() =>
                        onAction(app.user_id, app.event_id, "approved")
                      }
                      className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        onAction(app.user_id, app.event_id, "pending")
                      }
                      className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[var(--border)] text-xs font-bold disabled:opacity-50"
                    >
                      <RotateCcw size={14} /> Re-open
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      <Pagination
        total={filtered.length}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={onPageChange}
        floating={floatingPagination}
      />
    </div>
  );
}
