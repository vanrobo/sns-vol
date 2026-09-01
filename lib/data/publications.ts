"use server";

import {
  fetchSnsMenuPublications,
  getSnsMenuPublicationById,
} from "@/lib/library/sns-menu";
import type { PublicationKind, SnsPublication } from "@/types";

function mapItem(item: Awaited<ReturnType<typeof fetchSnsMenuPublications>>[number]): SnsPublication {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    pdf_url: item.pdf_url,
    kind: item.kind,
    category: item.category,
    published_on: item.published_on,
    sort_order: 0,
  };
}

export async function getPublicPublications(
  kind?: PublicationKind,
): Promise<SnsPublication[]> {
  const items = await fetchSnsMenuPublications();
  const filtered = kind ? items.filter((item) => item.kind === kind) : items;
  return filtered.map(mapItem);
}

export async function getPublicationById(
  id: string,
): Promise<(SnsPublication & { source_url?: string }) | null> {
  const item = await getSnsMenuPublicationById(id);
  if (!item) return null;
  return { ...mapItem(item), source_url: item.source_url };
}
