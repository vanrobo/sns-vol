"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import MentorPipoPanel from "@/components/center/MentorPipoPanel";

export default function CenterMentorPipoPage() {
  return (
    <ModuleShell
      title="Punch In / Out"
      subtitle="Your day · IST"
      backHref="/center/mentors"
    >
      <MentorPipoPanel />
    </ModuleShell>
  );
}
