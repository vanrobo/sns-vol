"use client";

import ModuleShell from "@/components/modules/ModuleShell";

export default function CenterCoursesPage() {
  return (
    <ModuleShell
      title="Course planning"
      subtitle="Coming next"
      backHref="/center"
    >
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm text-[var(--text-muted)]">
          Syllabus and date ranges will plug into mentor centre data after
          students/mentors flows are stable.
        </p>
      </div>
    </ModuleShell>
  );
}
