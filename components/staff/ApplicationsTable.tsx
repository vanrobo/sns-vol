"use client";

import { Check, Ban } from "lucide-react";
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
};

const PAGE_SIZE = 6;

export default function ApplicationsTable({
  applications,
  page,
  onPageChange,
  actioningId,
  onAction,
}: ApplicationsTableProps) {
  const paged = paginate(applications, page, PAGE_SIZE);

  return (
    <div className="space-y-3">
      {paged.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          No applications yet.
        </p>
      ) : (
        paged.map((app) => (
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
                    ? "bg-emerald-100 text-emerald-800"
                    : app.status === "declined"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
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

            {app.status === "pending" && (
              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  disabled={actioningId === `${app.user_id}-${app.event_id}`}
                  onClick={() =>
                    onAction(app.user_id, app.event_id, "approved")
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  disabled={actioningId === `${app.user_id}-${app.event_id}`}
                  onClick={() =>
                    onAction(app.user_id, app.event_id, "declined")
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-100 text-red-600 text-xs font-bold disabled:opacity-50"
                >
                  <Ban size={14} /> Decline
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <Pagination
        total={applications.length}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
}
