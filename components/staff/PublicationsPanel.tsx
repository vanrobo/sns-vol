"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import type { PublicationKind, SnsPublication } from "@/types";
import {
  createPublication,
  deletePublication,
  getPublicPublications,
  updatePublication,
  type PublicationInput,
} from "@/lib/data/publications";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "steam", label: "STEAM" },
  { value: "legal", label: "Legal" },
];

function emptyForm(): PublicationInput {
  return {
    title: "",
    description: "",
    pdf_url: "",
    kind: "magazine",
    category: "general",
    published_on: new Date().toISOString().slice(0, 10),
  };
}

function toForm(item: SnsPublication): PublicationInput {
  return {
    title: item.title,
    description: item.description,
    pdf_url: item.pdf_url,
    kind: item.kind,
    category: item.category,
    published_on: item.published_on,
  };
}

export default function PublicationsPanel() {
  const [items, setItems] = useState<SnsPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PublicationInput>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<PublicationKind | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicPublications();
      setItems(data);
    } catch {
      toast.error("Failed to load library items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((i) => filter === "all" || i.kind === filter);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (item: SnsPublication) => {
    setEditingId(item.id);
    setForm(toForm(item));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.pdf_url.trim()) {
      toast.error("Title and PDF link are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updatePublication(editingId, form);
        toast.success("Updated.");
      } else {
        await createPublication(form);
        toast.success("Added to library.");
      }
      closeForm();
      await load();
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this publication from the library?")) return;
    setSaving(true);
    try {
      await deletePublication(id);
      toast.success("Removed.");
      await load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-[var(--brand)]" />
            SNS Library
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Magazines & newsletters — public at{" "}
            <a href="/library" className="text-[var(--brand)] underline" target="_blank" rel="noreferrer">
              /library
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--brand)] text-white text-sm font-bold"
        >
          <Plus size={16} />
          Add item
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "magazine", "newsletter"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              filter === key
                ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                : "border-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {key === "all" ? "All" : key === "magazine" ? "Magazine" : "Newsletter"}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <p className="font-bold text-sm">{editingId ? "Edit item" : "New item"}</p>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="w-full p-2.5 rounded-lg border border-[var(--border)] text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={2}
            className="w-full p-2.5 rounded-lg border border-[var(--border)] text-sm resize-none"
          />
          <input
            value={form.pdf_url}
            onChange={(e) => setForm((f) => ({ ...f, pdf_url: e.target.value }))}
            placeholder="PDF URL (https://…)"
            className="w-full p-2.5 rounded-lg border border-[var(--border)] text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.kind}
              onChange={(e) =>
                setForm((f) => ({ ...f, kind: e.target.value as PublicationKind }))
              }
              className="p-2.5 rounded-lg border border-[var(--border)] text-sm"
            >
              <option value="magazine">Magazine</option>
              <option value="newsletter">Newsletter</option>
            </select>
            {form.kind === "magazine" ? (
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="p-2.5 rounded-lg border border-[var(--border)] text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                value={form.published_on}
                onChange={(e) => setForm((f) => ({ ...f, published_on: e.target.value }))}
                className="p-2.5 rounded-lg border border-[var(--border)] text-sm"
              />
            )}
          </div>
          {form.kind === "magazine" && (
            <input
              type="date"
              value={form.published_on}
              onChange={(e) => setForm((f) => ({ ...f, published_on: e.target.value }))}
              className="w-full p-2.5 rounded-lg border border-[var(--border)] text-sm"
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[var(--brand)] text-white font-bold text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[var(--brand)]" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] italic py-8 text-center border border-dashed border-[var(--border)] rounded-xl">
          No publications yet. Add magazines or monthly newsletters.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-sm">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1.5 uppercase">
                  {item.kind}
                  {item.kind === "magazine" && item.category !== "general"
                    ? ` · ${item.category}`
                    : ""}{" "}
                  · {item.published_on}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-lg border border-[var(--border)]"
                  aria-label="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={saving}
                  className="p-2 rounded-lg border border-red-200 text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
