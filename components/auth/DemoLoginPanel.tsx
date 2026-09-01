"use client";

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { Sparkles } from "lucide-react";

type DemoLoginPanelProps = {
  onSelect: (email: string, password: string) => void;
  loading?: boolean;
};

export default function DemoLoginPanel({ onSelect, loading }: DemoLoginPanelProps) {
  return (
    <div className="mt-6 pt-6 border-t border-[var(--border)]">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-amber-500" />
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Try a demo account
        </p>
      </div>
      <div className="grid gap-2">
        {DEMO_ACCOUNTS.map((demo) => (
          <button
            key={demo.email}
            type="button"
            disabled={loading}
            onClick={() => onSelect(demo.email, DEMO_PASSWORD)}
            className="text-left rounded-xl border border-[var(--border)] bg-[var(--surface-input)] px-3 py-2.5 hover:border-[var(--brand)]/40 hover:bg-[var(--brand)]/5 transition-colors disabled:opacity-50"
          >
            <span className="block text-sm font-bold text-[var(--text)]">
              {demo.label}
            </span>
            <span className="block text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
              {demo.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
