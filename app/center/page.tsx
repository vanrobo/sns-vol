"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import { ModuleChildLinks } from "@/components/modules/ModuleHub";
import { getModule } from "@/lib/modules/registry";

export default function CenterHubPage() {
  const mod = getModule("center");
  return (
    <ModuleShell
      title={mod.title}
      subtitle="Students · mentors · guests · docs"
      backHref="/modules"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Live against SNS Project Centre tables. Mentors/coordinators land here;
        volunteers keep Events as home.
      </p>
      <ModuleChildLinks mod={mod} />
    </ModuleShell>
  );
}
