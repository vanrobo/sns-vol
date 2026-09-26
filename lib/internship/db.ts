"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  AttendanceMark,
  SeniorAttendanceRow,
  SeniorFeedbackLog,
  SeniorIntern,
  SeniorInternStatus,
  SeniorModuleId,
} from "@/lib/internship/types";

const SENIOR_BATCH_ID = "a0000001-0000-4000-8000-000000000001";

type InternRow = {
  id: string;
  name: string;
  school: string | null;
  phone: string | null;
  preferred_module: string | null;
  allotted_module: string | null;
  centre: string | null;
  status: string;
  fees_paid: boolean;
  centre_visited: boolean;
  google_review_done: boolean;
  mentor_signed_off: boolean;
  lead_signed_off: boolean;
  certified: boolean;
  notes: string | null;
};

type AttendanceDb = {
  intern_id: string;
  on_date: string;
  mark: string;
};

type FeedbackDb = {
  id: string;
  intern_id: string;
  body: string;
  submitted_work: boolean;
  created_at: string;
  mentor_id: string | null;
};

function parseMentorKey(notes: string | null): string | null {
  if (!notes) return null;
  const m = notes.match(/(?:^|\|)mentorKey=([^|]+)/);
  return m?.[1] ?? null;
}

function parseUserNotes(notes: string | null): string {
  if (!notes) return "";
  return notes
    .split("|")
    .filter((p) => !p.startsWith("mentorKey="))
    .join("|")
    .trim();
}

function buildNotes(mentorKey: string | null, userNotes: string): string {
  const parts: string[] = [];
  if (mentorKey) parts.push(`mentorKey=${mentorKey}`);
  if (userNotes.trim()) parts.push(userNotes.trim());
  return parts.join("|");
}

function rowToIntern(row: InternRow): SeniorIntern {
  return {
    id: row.id,
    name: row.name,
    school: row.school ?? "",
    phone: row.phone ?? "",
    preferredModule: (row.preferred_module as SeniorModuleId) ?? null,
    allottedModule: (row.allotted_module as SeniorModuleId) ?? null,
    mentorId: parseMentorKey(row.notes),
    centre: row.centre ?? "",
    status: row.status as SeniorInternStatus,
    feesPaid: row.fees_paid,
    centreVisited: row.centre_visited,
    googleReviewDone: row.google_review_done,
    mentorSignedOff: row.mentor_signed_off,
    rashmiSignedOff: row.lead_signed_off,
    ritikaCertified: row.certified,
    notes: parseUserNotes(row.notes),
  };
}

export async function loadSeniorWingState(): Promise<{
  batchId: string;
  interns: SeniorIntern[];
  attendance: SeniorAttendanceRow[];
  feedback: SeniorFeedbackLog[];
} | null> {
  const supabase = await createClient();
  const { data: batch } = await supabase
    .from("internship_batches")
    .select("id")
    .eq("id", SENIOR_BATCH_ID)
    .maybeSingle();

  if (!batch) return null;

  const { data: internRows, error: ie } = await supabase
    .from("internship_interns")
    .select(
      "id, name, school, phone, preferred_module, allotted_module, centre, status, fees_paid, centre_visited, google_review_done, mentor_signed_off, lead_signed_off, certified, notes",
    )
    .eq("batch_id", SENIOR_BATCH_ID)
    .order("name");

  if (ie) throw new Error(ie.message);
  const interns = (internRows as InternRow[] | null)?.map(rowToIntern) ?? [];
  const ids = interns.map((i) => i.id);

  let attendance: SeniorAttendanceRow[] = [];
  let feedback: SeniorFeedbackLog[] = [];

  if (ids.length) {
    const { data: att } = await supabase
      .from("internship_attendance")
      .select("intern_id, on_date, mark")
      .in("intern_id", ids);
    attendance = ((att as AttendanceDb[] | null) ?? []).map((a) => ({
      internId: a.intern_id,
      date: a.on_date,
      mark: a.mark as AttendanceMark,
      by: "mentor" as const,
    }));

    const { data: fb } = await supabase
      .from("internship_feedback")
      .select("id, intern_id, body, submitted_work, created_at, mentor_id")
      .in("intern_id", ids)
      .order("created_at", { ascending: false });
    feedback = ((fb as FeedbackDb[] | null) ?? []).map((f) => {
      const intern = interns.find((i) => i.id === f.intern_id);
      return {
        id: f.id,
        internId: f.intern_id,
        mentorId: intern?.mentorId ?? "m1",
        at: f.created_at,
        body: f.body,
        submittedWork: f.submitted_work,
      };
    });
  }

  return { batchId: SENIOR_BATCH_ID, interns, attendance, feedback };
}

export async function patchInternFlags(
  internId: string,
  patch: Partial<{
    feesPaid: boolean;
    centreVisited: boolean;
    googleReviewDone: boolean;
    mentorSignedOff: boolean;
    rashmiSignedOff: boolean;
    ritikaCertified: boolean;
    status: SeniorInternStatus;
    allottedModule: SeniorModuleId | null;
    mentorKey: string | null;
    preferredModule: SeniorModuleId | null;
    notes: string;
  }>,
) {
  const supabase = await createClient();
  const { data: existing, error: ge } = await supabase
    .from("internship_interns")
    .select("notes")
    .eq("id", internId)
    .single();
  if (ge) throw new Error(ge.message);

  const currentMentor = parseMentorKey(existing.notes);
  const currentNotes = parseUserNotes(existing.notes);
  const mentorKey =
    patch.mentorKey !== undefined ? patch.mentorKey : currentMentor;
  const userNotes = patch.notes !== undefined ? patch.notes : currentNotes;

  const row: Record<string, unknown> = {
    notes: buildNotes(mentorKey, userNotes),
  };
  if (patch.feesPaid !== undefined) row.fees_paid = patch.feesPaid;
  if (patch.centreVisited !== undefined) row.centre_visited = patch.centreVisited;
  if (patch.googleReviewDone !== undefined)
    row.google_review_done = patch.googleReviewDone;
  if (patch.mentorSignedOff !== undefined)
    row.mentor_signed_off = patch.mentorSignedOff;
  if (patch.rashmiSignedOff !== undefined)
    row.lead_signed_off = patch.rashmiSignedOff;
  if (patch.ritikaCertified !== undefined) row.certified = patch.ritikaCertified;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.allottedModule !== undefined)
    row.allotted_module = patch.allottedModule;
  if (patch.preferredModule !== undefined)
    row.preferred_module = patch.preferredModule;

  const { error } = await supabase
    .from("internship_interns")
    .update(row)
    .eq("id", internId);
  if (error) throw new Error(error.message);
}

export async function upsertAttendanceRow(
  internId: string,
  date: string,
  mark: AttendanceMark,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("internship_attendance").upsert(
    {
      intern_id: internId,
      on_date: date,
      mark,
    },
    { onConflict: "intern_id,on_date" },
  );
  if (error) throw new Error(error.message);
}

export async function insertFeedbackRow(
  internId: string,
  body: string,
  submittedWork: boolean,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internship_feedback")
    .insert({
      intern_id: internId,
      body,
      submitted_work: submittedWork,
    })
    .select("id, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string; created_at: string };
}

export async function listInternshipBatches(wing: "junior" | "senior") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internship_batches")
    .select("id, wing, title, start_date, end_date, centre, created_at")
    .eq("wing", wing)
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function countInternsForBatch(batchId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("internship_interns")
    .select("id", { count: "exact", head: true })
    .eq("batch_id", batchId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export { SENIOR_BATCH_ID };
