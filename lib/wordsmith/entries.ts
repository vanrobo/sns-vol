"use server";

import { createClient } from "@/lib/supabase/server";

export type WordsmithEntry = {
  id: string;
  word: string;
  meaning: string;
  class_label: string | null;
  center: string | null;
  teach_by: string | null;
  exam_by: string | null;
  created_at?: string;
};

export async function listWordsmithEntries(opts?: {
  center?: string;
  classLabel?: string;
}): Promise<WordsmithEntry[]> {
  const supabase = await createClient();
  let q = supabase
    .from("wordsmith_entries")
    .select(
      "id, word, meaning, class_label, center, teach_by, exam_by, created_at",
    )
    .order("teach_by", { ascending: true, nullsFirst: false })
    .order("word", { ascending: true });

  if (opts?.center) q = q.eq("center", opts.center);
  if (opts?.classLabel) q = q.eq("class_label", opts.classLabel);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as WordsmithEntry[];
}

export async function createWordsmithEntry(input: {
  word: string;
  meaning?: string;
  class_label?: string;
  center?: string;
  teach_by?: string;
  exam_by?: string;
}): Promise<WordsmithEntry> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("wordsmith_entries")
    .insert({
      word: input.word.trim(),
      meaning: (input.meaning ?? "").trim(),
      class_label: input.class_label?.trim() || null,
      center: input.center?.trim() || null,
      teach_by: input.teach_by || null,
      exam_by: input.exam_by || null,
      created_by: user?.id ?? null,
    })
    .select(
      "id, word, meaning, class_label, center, teach_by, exam_by, created_at",
    )
    .single();

  if (error) throw new Error(error.message);
  return data as WordsmithEntry;
}

export async function deleteWordsmithEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wordsmith_entries")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
