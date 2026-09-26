"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  createWordsmithEntry,
  deleteWordsmithEntry,
  listWordsmithEntries,
  type WordsmithEntry,
} from "@/lib/wordsmith/entries";

export default function WordsmithPanel() {
  const [entries, setEntries] = useState<WordsmithEntry[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filterCenter, setFilterCenter] = useState("");
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    word: "",
    meaning: "",
    class_label: "",
    center: "",
    teach_by: "",
    exam_by: "",
  });

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        setEntries(
          await listWordsmithEntries(
            filterCenter ? { center: filterCenter } : undefined,
          ),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load words");
      }
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filter changes
  }, [filterCenter]);

  const centers = useMemo(
    () =>
      [...new Set(entries.map((e) => e.center).filter(Boolean))] as string[],
    [entries],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.word.trim()) {
      setMessage("Word is required.");
      return;
    }
    startTransition(async () => {
      try {
        setMessage("");
        await createWordsmithEntry({
          word: form.word,
          meaning: form.meaning,
          class_label: form.class_label || undefined,
          center: form.center || undefined,
          teach_by: form.teach_by || undefined,
          exam_by: form.exam_by || undefined,
        });
        setForm({
          word: "",
          meaning: "",
          class_label: "",
          center: form.center,
          teach_by: "",
          exam_by: "",
        });
        setMessage("Word added.");
        setEntries(
          await listWordsmithEntries(
            filterCenter ? { center: filterCenter } : undefined,
          ),
        );
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Could not add word");
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      try {
        await deleteWordsmithEntry(id);
        setEntries((prev) => prev.filter((x) => x.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          {entries.length} words
        </p>
        <button
          type="button"
          onClick={load}
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p
          className={`text-sm rounded-xl px-3 py-2 ${
            message.includes("added")
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={submit}
        className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <h2 className="text-sm font-black flex items-center gap-2">
          <Plus size={16} /> Add word
        </h2>
        <input
          value={form.word}
          onChange={(e) => setForm((f) => ({ ...f, word: e.target.value }))}
          placeholder="Word"
          className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
        />
        <textarea
          value={form.meaning}
          onChange={(e) => setForm((f) => ({ ...f, meaning: e.target.value }))}
          placeholder="Meaning / usage note"
          rows={2}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm resize-y"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.class_label}
            onChange={(e) =>
              setForm((f) => ({ ...f, class_label: e.target.value }))
            }
            placeholder="Class (e.g. 6)"
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
          />
          <input
            value={form.center}
            onChange={(e) => setForm((f) => ({ ...f, center: e.target.value }))}
            placeholder="Centre"
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] font-semibold text-[var(--text-muted)]">
            Teach by
            <input
              type="date"
              value={form.teach_by}
              onChange={(e) =>
                setForm((f) => ({ ...f, teach_by: e.target.value }))
              }
              className="mt-1 w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
            />
          </label>
          <label className="text-[11px] font-semibold text-[var(--text-muted)]">
            Exam by
            <input
              type="date"
              value={form.exam_by}
              onChange={(e) =>
                setForm((f) => ({ ...f, exam_by: e.target.value }))
              }
              className="mt-1 w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save word"}
        </button>
      </form>

      {centers.length > 0 && (
        <select
          value={filterCenter}
          onChange={(e) => setFilterCenter(e.target.value)}
          className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        >
          <option value="">All centres</option>
          {centers.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {entries.map((entry) => (
          <li key={entry.id} className="px-4 py-3 flex gap-3 items-start">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{entry.word}</p>
              {entry.meaning && (
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  {entry.meaning}
                </p>
              )}
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                {[
                  entry.class_label ? `Class ${entry.class_label}` : null,
                  entry.center,
                  entry.teach_by ? `Teach by ${entry.teach_by}` : null,
                  entry.exam_by ? `Exam by ${entry.exam_by}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(entry.id)}
              disabled={pending}
              className="p-2 text-red-600 shrink-0"
              aria-label={`Delete ${entry.word}`}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {!pending && entries.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No words yet. Project coordinator can add the first entry.
          </li>
        )}
      </ul>
    </div>
  );
}
