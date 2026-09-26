"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import MentorApprovalsPanel from "@/components/center/MentorApprovalsPanel";

export default function CenterMentorApprovalsPage() {
  return (
    <ModuleShell
      title="Approvals"
      subtitle="Punches + leave"
      backHref="/center/mentors"
    >
      <MentorApprovalsPanel />
    </ModuleShell>
  );
}
