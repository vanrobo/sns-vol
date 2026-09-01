import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublicationById } from "@/lib/data/publications";
import PdfReader from "@/components/library/PdfReader";

type Props = { params: Promise<{ id: string }> };

export default async function LibraryReaderPage({ params }: Props) {
  const { id } = await params;
  const publication = await getPublicationById(id);
  if (!publication) notFound();

  return (
    <div className="min-h-[100dvh] bg-[var(--surface-muted)] max-w-md mx-auto">
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)] px-3 py-2">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] py-2"
        >
          <ArrowLeft size={16} />
          Back to library
        </Link>
      </div>
      <PdfReader url={publication.pdf_url} title={publication.title} />
    </div>
  );
}
