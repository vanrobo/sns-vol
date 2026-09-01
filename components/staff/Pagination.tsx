"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  total: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
  /** Pin compact controls bottom-right (staff portal). */
  floating?: boolean;
};

export default function Pagination({
  total,
  pageSize,
  page,
  onPageChange,
  floating = false,
}: PaginationProps) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const inner = (
    <>
      <div className="min-w-0 text-right">
        <p className="text-xs font-black text-[var(--text)] leading-tight tabular-nums">
          Page {page} of {totalPages}
        </p>
        <p className="text-[10px] font-medium text-[var(--text-muted)] tabular-nums">
          {start}–{end} of {total}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[#18181B] disabled:opacity-35 hover:bg-slate-100 dark:hover:bg-[#222] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)] text-white disabled:opacity-35 hover:bg-[var(--brand-hover)] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  );

  if (floating) {
    return (
      <div className="fixed bottom-[5.25rem] right-3 z-40 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md shadow-lg px-3 py-2 max-w-[min(calc(100vw-1.5rem),16rem)]">
        {inner}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">{inner}</div>
    </div>
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
