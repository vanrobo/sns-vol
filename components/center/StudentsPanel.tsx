"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { RefreshCw, Search } from "lucide-react";
import {
  listCenterStudents,
  type CenterStudentRow,
} from "@/lib/center/students";

export default function StudentsPanel() {
  const [students, setStudents] = useState<CenterStudentRow[]>([]);
  const [centers, setCenters] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [center, setCenter] = useState("");
  const [klass, setKlass] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        const data = await listCenterStudents({ search: "" });
        setStudents(data.students);
        setCenters(data.centers);
        setClasses(data.classes);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load students");
      }
    });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchQ =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q);
      const matchC = !center || s.center === center;
      const matchK = !klass || s.class === klass;
      return matchQ && matchC && matchK;
    });
  }, [students, search, center, klass]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          {filtered.length} of {students.length} students
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/center/students/attendance"
            className="text-xs font-semibold text-[var(--brand)]"
          >
            Attendance →
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
          placeholder="Search name or ID"
          className="w-full h-11 pl-9 pr-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm outline-none focus:border-[var(--brand)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={center}
          onChange={(e) => setCenter(e.target.value)}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        >
          <option value="">All centres</option>
          {centers.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={klass}
          onChange={(e) => setKlass(e.target.value)}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {filtered.slice(0, 80).map((s) => (
          <li key={s.id} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{s.name}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {s.id}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {[s.center, s.class ? `Class ${s.class}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {s.sex && (
              <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                {s.sex}
              </span>
            )}
          </li>
        ))}
        {!pending && filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No students match.
          </li>
        )}
      </ul>
      {filtered.length > 80 && (
        <p className="text-xs text-[var(--text-muted)] text-center">
          Showing first 80 — refine search to narrow.
        </p>
      )}
    </div>
  );
}
