"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { RefreshCw, Search } from "lucide-react";
import {
  listCenterMentors,
  type CenterMentorRow,
} from "@/lib/center/mentors";

export default function MentorsPanel() {
  const [mentors, setMentors] = useState<CenterMentorRow[]>([]);
  const [search, setSearch] = useState("");
  const [center, setCenter] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        setMentors(await listCenterMentors());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load mentors");
      }
    });
  };

  useEffect(() => {
    load();
  }, []);

  const centers = useMemo(
    () => [...new Set(mentors.map((m) => m.center).filter(Boolean))] as string[],
    [mentors],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mentors.filter((m) => {
      const matchQ =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.id?.toLowerCase().includes(q);
      const matchC = !center || m.center === center;
      return matchQ && matchC;
    });
  }, [mentors, search, center]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          {filtered.length} mentors
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/center/mentors/pipo"
            className="text-xs font-semibold text-[var(--brand)]"
          >
            My PiPo →
          </Link>
          <Link
            href="/center/mentors/leave"
            className="text-xs font-semibold text-[var(--brand)]"
          >
            My leave →
          </Link>
          <Link
            href="/center/mentors/approvals"
            className="text-xs font-semibold text-[var(--brand)]"
          >
            Approvals →
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={pending}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mentors"
          className="w-full h-11 pl-9 pr-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm"
        />
      </div>

      <select
        value={center}
        onChange={(e) => setCenter(e.target.value)}
        className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
      >
        <option value="">All centres</option>
        {centers.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {filtered.map((m) => (
          <li key={m.id} className="px-4 py-3">
            <p className="font-semibold text-sm">{m.name}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{m.id}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {[m.center, m.dept, m.status].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
        {!pending && filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No mentors found.
          </li>
        )}
      </ul>
    </div>
  );
}
