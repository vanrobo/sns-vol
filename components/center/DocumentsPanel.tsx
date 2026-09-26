"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, RefreshCw } from "lucide-react";
import {
  listMyDocuments,
  listSharedDocuments,
  saveSharedDocument,
  unsaveSharedDocument,
  type DocRow,
} from "@/lib/center/documents";

export default function DocumentsPanel() {
  const [shared, setShared] = useState<DocRow[]>([]);
  const [mine, setMine] = useState<DocRow[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"shared" | "mine">("shared");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        setError("");
        const [s, m] = await Promise.all([
          listSharedDocuments({ search }),
          listMyDocuments(search),
        ]);
        setShared(s);
        setMine(m);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load documents");
      }
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = tab === "shared" ? shared : mine;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["shared", "mine"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 h-10 rounded-xl text-xs font-bold border ${
              tab === t
                ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {t === "shared" ? "Shared" : "My bookmarks"}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={pending ? "animate-spin" : ""} />
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && load()}
        placeholder="Search documents"
        className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {rows.map((doc) => (
          <li
            key={doc.id}
            className="px-4 py-3 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm">{doc.title}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {[doc.priority, doc.status].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {tab === "shared" && (
                <button
                  type="button"
                  className="p-2 text-[var(--brand)]"
                  aria-label={doc.saved ? "Unsave" : "Save"}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        if (doc.saved) await unsaveSharedDocument(doc.id);
                        else await saveSharedDocument(doc.id);
                        load();
                      } catch (e) {
                        setError(
                          e instanceof Error ? e.message : "Bookmark failed",
                        );
                      }
                    })
                  }
                >
                  {doc.saved ? (
                    <BookmarkCheck size={16} />
                  ) : (
                    <Bookmark size={16} />
                  )}
                </button>
              )}
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[var(--text-muted)]"
                aria-label="Open"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </li>
        ))}
        {!pending && rows.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            No documents.
          </li>
        )}
      </ul>
    </div>
  );
}
