"use client";

import { SENIOR_PERSONAS } from "@/lib/internship/senior-demo";
import type { SeniorPersona } from "@/lib/internship/types";
import {
  setSeniorPersona,
  useSeniorPersonaHydrated,
} from "@/lib/internship/senior-store";

export default function PersonaSwitcher() {
  const { persona, ready } = useSeniorPersonaHydrated();
  if (!ready) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Demo persona (until credentials)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SENIOR_PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSeniorPersona(p.id)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              persona === p.id
                ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[var(--text-muted)]">
        {SENIOR_PERSONAS.find((p) => p.id === persona)?.blurb}
      </p>
    </div>
  );
}

export function personaLabel(id: SeniorPersona) {
  return SENIOR_PERSONAS.find((p) => p.id === id)?.label ?? id;
}
