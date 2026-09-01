import { NextResponse } from "next/server";
import { getPublicationById } from "@/lib/data/publications";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const publication = await getPublicationById(id);

  if (!publication?.pdf_url) {
    return NextResponse.json({ error: "Publication not found" }, { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(publication.pdf_url, {
      headers: {
        Accept: "application/pdf,*/*",
        "User-Agent": "SNS-Family-Library/1.0",
      },
      cache: "force-cache",
      next: { revalidate: 3600 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach PDF host" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `PDF host returned ${upstream.status}` },
      { status: 502 },
    );
  }

  const bytes = await upstream.arrayBuffer();
  const contentType =
    upstream.headers.get("content-type")?.split(";")[0]?.trim() || "application/pdf";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": "inline",
    },
  });
}
