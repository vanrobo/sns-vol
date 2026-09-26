"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import SeniorInternshipClient from "@/components/internship/senior/SeniorInternshipClient";

export default function SeniorInternshipPage() {
  return (
    <ModuleShell
      title="Senior internship"
      subtitle="Rashmi wing · work DB"
      backHref="/internship"
    >
      <p className="text-sm text-[var(--text-muted)]">
        Flow: Ritika routes forms → Rashmi allots module + 1:1 mentor → mentor
        attendance / logs → coord marks arrival → Ritika certifies.
      </p>
      <SeniorInternshipClient />
    </ModuleShell>
  );
}
