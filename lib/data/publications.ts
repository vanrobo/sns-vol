"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import type { PublicationKind, SnsPublication } from "@/types";

export type PublicationInput = {
  title: string;
  description: string;
  pdf_url: string;
  kind: PublicationKind;
  category: string;
  published_on: string;
};

function mapRow(row: Record<string, unknown>): SnsPublication {
  return row as unknown as SnsPublication;
}

export async function getPublicPublications(
  kind?: PublicationKind,
): Promise<SnsPublication[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sns_publications")
    .select("*")
    .order("published_on", { ascending: false })
    .order("sort_order", { ascending: true });

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getPublicationById(
  id: string,
): Promise<SnsPublication | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sns_publications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function createPublication(
  input: PublicationInput,
): Promise<SnsPublication> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sns_publications")
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      pdf_url: input.pdf_url.trim(),
      kind: input.kind,
      category: input.category.trim() || "general",
      published_on: input.published_on,
      created_by: admin.id,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updatePublication(
  id: string,
  input: PublicationInput,
): Promise<SnsPublication> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sns_publications")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      pdf_url: input.pdf_url.trim(),
      kind: input.kind,
      category: input.category.trim() || "general",
      published_on: input.published_on,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function deletePublication(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("sns_publications").delete().eq("id", id);
  if (error) throw error;
}
