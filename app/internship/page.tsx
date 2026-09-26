"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import { ModuleChildLinks } from "@/components/modules/ModuleHub";
import { getModule } from "@/lib/modules/registry";

export default function InternshipHubPage() {
  const mod = getModule("internship");
  return (
    <ModuleShell
      title={mod.title}
      subtitle="Module 3"
      backHref="/modules"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Junior (Minakshi) and Senior (Rashmi). Ritika gates forms and issues
        certificates. Open Senior wing to walk the flow with demo data.
      </p>
      <ModuleChildLinks mod={mod} />
    </ModuleShell>
  );
}
