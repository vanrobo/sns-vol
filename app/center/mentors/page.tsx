"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import MentorsPanel from "@/components/center/MentorsPanel";

export default function CenterMentorsPage() {
  return (
    <ModuleShell
      title="Mentors"
      subtitle="Roster · PiPo · leave"
      backHref="/center"
    >
      <MentorsPanel />
    </ModuleShell>
  );
}
