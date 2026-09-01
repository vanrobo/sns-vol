"use client";

import { ExternalLink } from "lucide-react";
import { QUICK_LINKS } from "@/lib/quick-links";

export default function QuickLinksNav() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
        Quick links
      </h3>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden shadow-sm">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm">{link.label}</p>
              {link.description && (
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                  {link.description}
                </p>
              )}
            </div>
            <ExternalLink size={16} className="text-[var(--brand)] shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
