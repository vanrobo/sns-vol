"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { getPublicPublications } from "@/lib/data/publications";
import type { SnsPublication } from "@/types";
import { SNS_PUBLICATION_MENU_URL } from "@/lib/library/sns-menu";

export default function PublicationsPanel() {
  const [items, setItems] = useState<SnsPublication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicPublications();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const magazines = items.filter((item) => item.kind === "magazine");
  const newsletters = items.filter((item) => item.kind === "newsletter");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-[var(--brand)]" />
            SNS Magazine
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            Synced from{" "}
            <a
              href="https://standnstride.org/publication/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--brand)] underline"
            >
              SNS Publications
            </a>
            . Update titles and PDFs there via{" "}
            <code className="text-[10px]">menu.json</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <a
        href="/library"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--brand)]"
      >
        Open public library
        <ExternalLink size={14} />
      </a>

      <p className="text-[10px] text-[var(--text-muted)] break-all">
        Source: {SNS_PUBLICATION_MENU_URL}
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[var(--brand)]" size={24} />
        </div>
      ) : (
        <div className="space-y-4">
          <PublicationGroup title="Magazines" items={magazines} />
          <PublicationGroup title="Newsletters" items={newsletters} />
        </div>
      )}
    </div>
  );
}

function PublicationGroup({
  title,
  items,
}: {
  title: string;
  items: SnsPublication[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] italic">None listed.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <p className="font-bold text-sm">{item.title}</p>
            {item.description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</p>
            )}
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1.5 uppercase">
              {item.category} · {item.published_on}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
