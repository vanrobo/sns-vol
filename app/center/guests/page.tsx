"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import GuestsPanel from "@/components/center/GuestsPanel";

export default function CenterGuestsPage() {
  return (
    <ModuleShell title="Guests" subtitle="Visitor log" backHref="/center">
      <GuestsPanel />
    </ModuleShell>
  );
}
