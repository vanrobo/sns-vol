"use server";

import { callCenterRpc } from "@/lib/center/rpc";

export type CenterMentorRow = {
  id: string;
  name: string;
  center?: string | null;
  dept?: string | null;
  status?: string | null;
  photo_link?: string | null;
  pic?: string | null;
  role?: string | null;
  joining_date?: string | null;
};

type ListMentorsResult = { mentors?: CenterMentorRow[] };

export async function listCenterMentors(opts?: {
  center?: string;
  search?: string;
}): Promise<CenterMentorRow[]> {
  const data = await callCenterRpc<ListMentorsResult>("list_mentors", {
    _center: opts?.center ?? "",
    _search: opts?.search ?? "",
  });
  return (data?.mentors ?? []).map((m) => ({
    ...m,
    photo_link: m.photo_link ?? m.pic ?? "",
  }));
}

export async function getMyMentorPipo() {
  return callCenterRpc<{
    state?: "not_started" | "punched_in" | "completed";
    date?: string;
    mentor?: { id: string; name: string; center?: string };
    raw_check_in?: string | null;
    raw_check_out?: string | null;
    approval_status?: string | null;
  }>("get_my_mentor_pipo");
}

export async function mentorPunchIn() {
  return callCenterRpc("mentor_punch_in");
}

export async function mentorPunchOut() {
  return callCenterRpc("mentor_punch_out");
}

export async function listPendingMentorAttendance() {
  const data = await callCenterRpc<{ records?: unknown[] }>(
    "list_pending_mentor_attendance",
    { _search: "", _center: "" },
  );
  return data?.records ?? [];
}

export async function approveMentorAttendance(
  attendanceId: string,
  checkIn = "",
  checkOut = "",
) {
  return callCenterRpc("approve_mentor_attendance", {
    _attendance_id: attendanceId,
    _check_in: checkIn,
    _check_out: checkOut,
  });
}

export async function rejectMentorAttendance(
  attendanceId: string,
  reason?: string | null,
) {
  return callCenterRpc("reject_mentor_attendance", {
    _attendance_id: attendanceId,
    _reason: reason ?? null,
  });
}

export async function listMyMentorLeaves() {
  const data = await callCenterRpc<{ leaves?: unknown[] }>(
    "list_my_mentor_leaves",
  );
  return data?.leaves ?? [];
}

export async function applyMyMentorLeave(leave: Record<string, unknown>) {
  return callCenterRpc("apply_my_mentor_leave", { _leave: leave });
}

export async function cancelMyMentorLeave(leaveId: string) {
  return callCenterRpc("cancel_my_mentor_leave", { _leave_id: leaveId });
}

export async function listPendingMentorLeaves() {
  const data = await callCenterRpc<{ leaves?: unknown[] }>(
    "list_pending_mentor_leaves",
    { _search: "", _center: "" },
  );
  return data?.leaves ?? [];
}

export async function approveMentorLeave(leaveId: string) {
  return callCenterRpc("approve_mentor_leave", { _leave_id: leaveId });
}

export async function rejectMentorLeave(
  leaveId: string,
  reason?: string | null,
) {
  return callCenterRpc("reject_mentor_leave", {
    _leave_id: leaveId,
    _reason: reason ?? null,
  });
}
