"use client";

import { useEffect, useState, useTransition } from "react";
import ModuleShell from "@/components/modules/ModuleShell";
import {
  countInternsForBatch,
  listInternshipBatches,
} from "@/lib/internship/db";

type BatchRow = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  centre: string | null;
  count?: number;
};

export default function JuniorInternshipPage() {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const rows = await listInternshipBatches("junior");
        const withCounts = await Promise.all(
          rows.map(async (b) => ({
            ...b,
            count: await countInternsForBatch(b.id),
          })),
        );
        setBatches(withCounts);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load batches");
      }
    });
  }, []);

  return (
    <ModuleShell
      title="Junior internship"
      subtitle="Minakshi · centre batches"
      backHref="/internship"
    >
      <p className="text-sm text-[var(--text-muted)] mb-3">
        School kids (class 9–10), 5–7 day orientation. Ritika gates forms →
        Minakshi batches by centre → roster to centre coordinator → certificates
        after Ritika checks. Live against work Supabase.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {pending && batches.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Loading batches…</p>
      ) : batches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--text-muted)]">
            No junior batches yet. Run{" "}
            <code className="text-xs">node scripts/seed-internship-senior.mjs</code>{" "}
            or create a batch in Supabase.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {batches.map((b) => (
            <li key={b.id} className="px-4 py-3">
              <p className="font-semibold text-sm">{b.title}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {b.start_date} → {b.end_date}
                {b.centre ? ` · ${b.centre}` : ""}
                {b.count != null ? ` · ${b.count} kids` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ModuleShell>
  );
}
