"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Loader2,
  Newspaper,
  Search,
} from "lucide-react";
import { getPublicPublications } from "@/lib/data/publications";
import type { PublicationKind, SnsPublication } from "@/types";
import { APP_NAME_ACCENT } from "@/lib/brand";

const MAGAZINE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "general", label: "General" },
  { key: "steam", label: "STEAM" },
  { key: "legal", label: "Legal" },
];

function categoryLabel(key: string) {
  return MAGAZINE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function formatMonth(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function LibraryPageClient() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "newsletter" ? "newsletter" : "magazine";

  const [tab, setTab] = useState<PublicationKind>(initialTab);
  const [items, setItems] = useState<SnsPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    getPublicPublications(tab)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (tab === "magazine" && category !== "all" && item.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [items, query, category, tab]);

  const newsletterGroups = useMemo(() => {
    if (tab !== "newsletter") return [];
    const map = new Map<string, SnsPublication[]>();
    for (const item of filtered) {
      const key = formatMonth(item.published_on);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered, tab]);

  return (
    <div className="min-h-[100dvh] bg-[var(--surface-muted)] tracking-tight">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)] px-5 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
              SNS <span className="text-[var(--brand)]">{APP_NAME_ACCENT}</span>
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Magazine & newsletters — public library
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 space-y-4 pb-10">
        <div className="flex bg-slate-100 dark:bg-[#18181B] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab("magazine")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
              tab === "magazine"
                ? "bg-white dark:bg-black text-[var(--brand)] shadow-sm"
                : "text-[var(--text-muted)]"
            }`}
          >
            <BookOpen size={16} />
            Magazine
          </button>
          <button
            type="button"
            onClick={() => setTab("newsletter")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg transition-all ${
              tab === "newsletter"
                ? "bg-white dark:bg-black text-[var(--brand)] shadow-sm"
                : "text-[var(--text-muted)]"
            }`}
          >
            <Newspaper size={16} />
            Newsletter
          </button>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab === "magazine" ? "magazines" : "newsletters"}…`}
            className="w-full pl-9 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium outline-[var(--brand)]"
          />
        </div>

        {tab === "magazine" && (
          <div className="flex flex-wrap gap-2">
            {MAGAZINE_CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  category === key
                    ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl">
            No {tab === "magazine" ? "magazines" : "newsletters"} found.
          </div>
        ) : tab === "newsletter" ? (
          <div className="space-y-5">
            {newsletterGroups.map(([month, group]) => (
              <div key={month} className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 flex items-center gap-1.5">
                  <Calendar size={11} />
                  {month}
                </p>
                {group.map((item) => (
                  <PublicationCard key={item.id} item={item} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <PublicationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PublicationCard({ item }: { item: SnsPublication }) {
  return (
    <Link
      href={`/library/${item.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm hover:border-[var(--brand)]/40 transition-colors active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">{item.title}</p>
          {item.description && (
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-bold text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} />
              {new Date(`${item.published_on}T12:00:00`).toLocaleDateString()}
            </span>
            {item.kind === "magazine" && item.category !== "general" && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                {categoryLabel(item.category)}
              </span>
            )}
          </div>
        </div>
        <BookOpen size={18} className="text-[var(--brand)] shrink-0 mt-0.5" />
      </div>
    </Link>
  );
}
