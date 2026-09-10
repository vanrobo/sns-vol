import { notFound } from "next/navigation";
import { getPublicationById } from "@/lib/data/publications";
import PdfReader from "@/components/library/PdfReader";

type Props = { params: Promise<{ id: string }> };

export default async function LibraryReaderPage({ params }: Props) {
  const { id } = await params;
  const publication = await getPublicationById(id);
  if (!publication) notFound();

  return (
    <div className="h-[100dvh] w-full bg-neutral-950 overflow-hidden">
      <PdfReader
        publicationId={publication.id}
        title={publication.title}
        sourceUrl={publication.source_url ?? publication.pdf_url}
      />
    </div>
  );
}
