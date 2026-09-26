"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  createGuestVisit,
  deleteGuestVisit,
  listGuestVisits,
  type GuestVisitRow,
} from "@/lib/center/guests";

const emptyForm = () => ({
  full_name: "",
  phone: "",
  center: "",
  guest_type: "Guest",
  visit_date: new Date().toISOString().slice(0, 10),
  visit_time: "",
  comments: "",
});

export default function GuestsPanel() {
  const [guests, setGuests] = useState<GuestVisitRow[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        setGuests(await listGuestVisits({ search }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load guests");
      }
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.full_name?.toLowerCase().includes(q) ||
        g.center?.toLowerCase().includes(q) ||
        g.phone?.includes(q),
    );
  }, [guests, search]);

  const submit = () => {
    if (!form.full_name.trim() || !form.center.trim()) {
      setError("Name and centre are required.");
      return;
    }
    startTransition(async () => {
      try {
        setError("");
        await createGuestVisit(form);
        setForm(emptyForm());
        setShowForm(false);
        setGuests(await listGuestVisits());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Create failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          {filtered.length} visits
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="h-9 px-3 rounded-lg bg-[var(--brand)] text-white text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
          <button
            type="button"
            onClick={load}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search guests"
        className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
      />

      {showForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          {(
            [
              ["full_name", "Full name"],
              ["phone", "Phone"],
              ["center", "Centre"],
              ["guest_type", "Type"],
              ["visit_date", "Visit date"],
              ["visit_time", "Visit time"],
              ["comments", "Comments"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold space-y-1">
              <span>{label}</span>
              <input
                type={key === "visit_date" ? "date" : "text"}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full h-10 rounded-lg border border-[var(--border)] px-3 text-sm font-normal"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="w-full h-11 rounded-xl bg-[var(--brand)] text-white font-bold disabled:opacity-60"
          >
            Save visit
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {filtered.map((g) => (
          <li
            key={g.id}
            className="px-4 py-3 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm">{g.full_name}</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {[g.guest_type, g.center, g.visit_date, g.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {g.comments && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {g.comments}
                </p>
              )}
            </div>
            <button
              type="button"
              className="p-2 text-red-600"
              aria-label="Delete"
              onClick={() =>
                startTransition(async () => {
                  try {
                    await deleteGuestVisit(g.id);
                    setGuests(await listGuestVisits());
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Delete failed");
                  }
                })
              }
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {!pending && filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No guest visits yet.
          </li>
        )}
      </ul>
    </div>
  );
}
