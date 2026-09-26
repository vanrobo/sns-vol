"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import StudentsPanel from "@/components/center/StudentsPanel";

export default function CenterStudentsPage() {
  return (
    <ModuleShell
      title="Students"
      subtitle="Roster from work DB"
      backHref="/center"
    >
      <StudentsPanel />
    </ModuleShell>
  );
}
