"use client";

import ModuleShell from "@/components/modules/ModuleShell";
import DocumentsPanel from "@/components/center/DocumentsPanel";

export default function CenterDocumentsPage() {
  return (
    <ModuleShell
      title="Documents"
      subtitle="Shared + bookmarks"
      backHref="/center"
    >
      <DocumentsPanel />
    </ModuleShell>
  );
}
