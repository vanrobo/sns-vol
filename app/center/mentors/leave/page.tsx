"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import MentorLeavePanel from "@/components/center/MentorLeavePanel";

export default function MentorLeavePage() {
  return (
    <ModuleShell
      title="My leave"
      subtitle="Ask coordinator for leave"
      backHref="/center/mentors"
    >
      <MentorLeavePanel />
    </ModuleShell>
  );
}
