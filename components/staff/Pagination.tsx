"use client";

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
      <p className="text-xs text-gray-500 font-medium">
        Page {page} of {totalPages} ({total} items)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
