"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Phone, Users } from "lucide-react";
import type { Profile } from "@/types";
import { titleCaseStatus } from "@/types";
import { updateUserBatch } from "@/lib/data/admin";
import Pagination, { paginate } from "@/components/staff/Pagination";

const PAGE_SIZE = 8;

type OrganiserVolunteersPanelProps = {
  volunteers: Profile[];
  actioningId: string | null;
  onActioningChange: (id: string | null) => void;
  onUpdated: (userId: string, batch: string | null) => void;
};

export default function OrganiserVolunteersPanel({
  volunteers,
  actioningId,
  onActioningChange,
  onUpdated,
}: OrganiserVolunteersPanelProps) {
  const activeVolunteers = volunteers.filter((v) => v.role === "volunteer");
  const [page, setPage] = useState(1);
  const paged = paginate(activeVolunteers, page, PAGE_SIZE);

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
        Set internal batch / area labels for volunteers. Volunteers do not see
        this on their profile.
      </p>
      {paged.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] italic py-8 text-center">
          No volunteers found.
        </p>
      ) : (
        paged.map((vol) => (
          <div
            key={vol.id}
            className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-bold truncate">{vol.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {vol.college}
                </p>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                  vol.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {titleCaseStatus(vol.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
              <p className="flex items-center gap-1.5 truncate">
                <Phone size={11} className="shrink-0 text-[var(--brand)]" />
                {vol.phone || "No phone"}
              </p>
              <p className="flex items-center gap-1.5 truncate font-mono">
                <Users size={11} className="shrink-0 text-[var(--brand)]" />
                {vol.volunteer_id || "No ID yet"}
              </p>
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <MapPin size={10} /> Batch / area (staff only)
              </span>
              <input
                type="text"
                placeholder="e.g. Dwarka Team A"
                defaultValue={vol.batch ?? ""}
                disabled={actioningId === vol.id}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next === (vol.batch ?? "")) return;
                  onActioningChange(vol.id);
                  updateUserBatch(vol.id, next)
                    .then(() => {
                      toast.success("Batch updated");
                      onUpdated(vol.id, next || null);
                    })
                    .catch(() => toast.error("Failed to update batch"))
                    .finally(() => onActioningChange(null));
                }}
                className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface)] outline-emerald-600"
              />
            </label>
          </div>
        ))
      )}
      <Pagination
        total={activeVolunteers.length}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
