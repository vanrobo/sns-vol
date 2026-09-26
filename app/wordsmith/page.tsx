"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import WordsmithPanel from "@/components/wordsmith/WordsmithPanel";

export default function WordsmithHubPage() {
  return (
    <ModuleShell
      title="Wordsmith"
      subtitle="Word bank · teach-by / exam-by"
      backHref="/modules"
    >
      <p className="text-sm text-[var(--text-muted)] mb-3">
        Project coordinator adds words. Mentors and coordinators use this when
        teaching. Same login as Centre and Events.
      </p>
      <WordsmithPanel />
    </ModuleShell>
  );
}
