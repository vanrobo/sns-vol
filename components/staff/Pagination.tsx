"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  total: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  total,
  pageSize,
  page,
  onPageChange,
}: PaginationProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[var(--text)] leading-tight">
            Page {page} of {totalPages}
          </p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
            Showing {start}–{end} of {total}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] disabled:opacity-35 hover:bg-slate-100 dark:hover:bg-[#222] transition-colors"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg bg-[var(--brand)] text-white disabled:opacity-35 hover:bg-[var(--brand-hover)] transition-colors"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
