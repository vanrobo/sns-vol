"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  getStudentAttendanceByDate,
  saveStudentAttendance,
} from "@/lib/center/attendance";
import {
  listCenterStudents,
  type CenterStudentRow,
} from "@/lib/center/students";

const CODES = ["P", "A", "L", "H"] as const;
const LABELS: Record<(typeof CODES)[number], string> = {
  P: "Present",
  A: "Absent",
  L: "Leave",
  H: "Holiday",
};

export default function StudentAttendancePanel() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<CenterStudentRow[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [center, setCenter] = useState("");
  const [klass, setKlass] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    listCenterStudents()
      .then((d) => setStudents(d.students))
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  useEffect(() => {
    if (!date) return;
    getStudentAttendanceByDate(date)
      .then(setAttendance)
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [date]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchQ = !q || s.name?.toLowerCase().includes(q);
      const matchC = !center || s.center === center;
      const matchK = !klass || s.class === klass;
      return matchQ && matchC && matchK;
    });
  }, [students, search, center, klass]);

  const centers = useMemo(
    () => [...new Set(students.map((s) => s.center).filter(Boolean))] as string[],
    [students],
  );
  const classes = useMemo(
    () => [...new Set(students.map((s) => s.class).filter(Boolean))] as string[],
    [students],
  );

  const setStatus = (id: string, code: string) => {
    setAttendance((prev) => ({ ...prev, [id]: code }));
    setMessage("");
    setError("");
  };

  const markAll = (code: string) => {
    const next = { ...attendance };
    filtered.forEach((s) => {
      next[s.id] = code;
    });
    setAttendance(next);
  };

  const save = () => {
    startTransition(async () => {
      try {
        const missing = filtered.filter((s) => !attendance[s.id]);
        if (missing.length) {
          setError(`${missing.length} student(s) still unmarked.`);
          return;
        }
        const toSave = Object.fromEntries(
          filtered.map((s) => [s.id, attendance[s.id]]),
        );
        await saveStudentAttendance(date, toSave, center || null);
        setMessage("Attendance saved.");
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        />
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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search students"
        className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => markAll("P")}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800"
        >
          Mark all present
        </button>
        <button
          type="button"
          onClick={() => markAll("H")}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 text-slate-700"
        >
          Mark all holiday
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="ml-auto text-xs font-bold px-4 py-2 rounded-lg bg-[var(--brand)] text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {filtered.map((s) => (
          <li key={s.id} className="px-3 py-3 space-y-2">
            <div>
              <p className="font-semibold text-sm">{s.name}</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {[s.center, s.class ? `Class ${s.class}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex gap-1.5">
              {CODES.map((code) => {
                const active = attendance[s.id] === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setStatus(s.id, code)}
                    title={LABELS[code]}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold border ${
                      active
                        ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                        : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
