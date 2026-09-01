import { Suspense } from "react";
import LibraryPageClient from "@/components/library/LibraryPageClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "SNS Magazine & Newsletters",
  description: "Public SNS Family magazine and newsletter library",
};

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
        </div>
      }
    >
      <LibraryPageClient />
    </Suspense>
  );
}
