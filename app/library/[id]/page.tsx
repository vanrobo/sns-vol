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
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto bg-[var(--surface-muted)] overflow-hidden">
      <div className="shrink-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[var(--border)] px-3 py-2">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand)] py-2"
        >
          <ArrowLeft size={16} />
          Back to library
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <PdfReader
          publicationId={publication.id}
          title={publication.title}
          sourceUrl={publication.source_url ?? publication.pdf_url}
        />
      </div>
    </div>
  );
}
