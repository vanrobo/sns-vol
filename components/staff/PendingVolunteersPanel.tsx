"use client";

import { useState } from "react";
import { Search, Phone, MapPin, Loader2 } from "lucide-react";
import type { Profile } from "@/types";
import { titleCaseStatus } from "@/types";
import Pagination, { paginate } from "@/components/staff/Pagination";

const PAGE_SIZE = 5;

type Props = {
  volunteers: Profile[];
  actioningId: string | null;
  onApprove: (userId: string) => void;
  onOpenDetails: (volunteer: Profile) => void;
};

export default function PendingVolunteersPanel({
  volunteers,
  actioningId,
  onApprove,
  onOpenDetails,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pending = volunteers.filter((v) => v.status === "pending");

  const filtered = pending.filter((v) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      v.college.toLowerCase().includes(q) ||
      (v.phone ?? "").includes(q)
    );
  });

  const paged = paginate(filtered, page, PAGE_SIZE);

  if (pending.length === 0) return null;

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-amber-200/80 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
            Pending requests
          </h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
            New sign-ups awaiting I-Card approval. Approve here — not under People.
          </p>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search pending by name, center, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 p-3 border rounded-xl bg-white dark:bg-[#18181B] border-amber-200 dark:border-amber-900/50 outline-emerald-600 text-sm"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {paged.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] py-6">
            No pending requests match your search.
          </p>
        ) : (
          paged.map((vol) => (
            <div
              key={vol.id}
              className="rounded-xl border border-[var(--border)] p-4 space-y-3 bg-slate-50/50 dark:bg-[#18181B]/50"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-bold truncate">{vol.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {vol.college}
                  </p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {titleCaseStatus(vol.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <p className="flex items-center gap-1.5 text-[var(--text-muted)] truncate">
                  <Phone size={11} className="shrink-0 text-[var(--brand)]" />
                  {vol.phone || "No phone"}
                </p>
                <p className="flex items-center gap-1.5 text-[var(--text-muted)] truncate">
                  <MapPin size={11} className="shrink-0 text-[var(--brand)]" />
                  {vol.batch || "No batch"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={actioningId === vol.id}
                  onClick={() => onApprove(vol.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actioningId === vol.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Approve I-Card
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDetails(vol)}
                  className="flex-1 border border-[var(--border)] py-2.5 rounded-lg text-xs font-bold hover:bg-[var(--surface)]"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 pb-4">
        <Pagination
          total={filtered.length}
          pageSize={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
