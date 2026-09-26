"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import { ModuleHubList } from "@/components/modules/ModuleHub";

/** Entry: modules 1 · 2 · 3 — one app, one login later. */
export default function ModulesIndexPage() {
  return (
    <ModuleShell
      title="Platform modules"
      subtitle="Center · Wordsmith · Internship"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Shared login will show only what your role can use. Until then, open a
        module below.
      </p>
      <ModuleHubList />
    </ModuleShell>
  );
}
