"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PlatformModule } from "@/lib/modules/registry";
import { PLATFORM_MODULES } from "@/lib/modules/registry";

function statusLabel(status: PlatformModule["status"]) {
  switch (status) {
    case "active":
      return "Live";
    case "integrate":
      return "Integrate next";
    default:
      return "Scaffold";
  }
}

export function ModuleCard({ mod }: { mod: PlatformModule }) {
  return (
    <Link
      href={mod.href}
      className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--brand)]/40 transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
            Module {mod.number}
          </p>
          <h3 className="text-base font-black mt-0.5">{mod.title}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">{mod.short}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
            {statusLabel(mod.status)}
          </span>
          <ChevronRight size={18} className="text-[var(--brand)]" />
        </div>
      </div>
    </Link>
  );
}

export function ModuleHubList() {
  return (
    <div className="space-y-3">
      {PLATFORM_MODULES.map((mod) => (
        <ModuleCard key={mod.id} mod={mod} />
      ))}
    </div>
  );
}

export function ModuleChildLinks({ mod }: { mod: PlatformModule }) {
  if (!mod.children?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
      {mod.children.map((c) => (
        <Link
          key={c.href + c.label}
          href={c.href}
          className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 dark:hover:bg-[#18181B] transition-colors"
        >
          <div className="min-w-0">
            <p className="font-semibold text-sm">{c.label}</p>
            {c.note && (
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {c.note}
              </p>
            )}
          </div>
          <ChevronRight size={16} className="text-[var(--brand)] shrink-0" />
        </Link>
      ))}
    </div>
  );
}
