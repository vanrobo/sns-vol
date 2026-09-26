"use server";

import { callCenterRpc } from "@/lib/center/rpc";

const STATUS_TO_DB: Record<string, string> = {
  P: "Present",
  A: "Absent",
  L: "Leave",
  H: "Holiday",
};

const DB_TO_STATUS: Record<string, string> = {
  Present: "P",
  Absent: "A",
  Leave: "L",
  Holiday: "H",
};

type DailyResult = {
  students?: { id: string; status?: string | null }[];
};

type DashboardResult = {
  heatmap?: {
    students?: { id: string; days?: (string | null)[] }[];
  };
  summary?: {
    present?: number;
    absent?: number;
    leave?: number;
    holiday?: number;
  };
};

export async function getStudentAttendanceByDate(
  date: string,
): Promise<Record<string, string>> {
  const data = await callCenterRpc<DailyResult>("get_daily_attendance", {
    _date: date,
    _search: "",
    _centers: null,
    _class: "",
  });
  return Object.fromEntries(
    (data?.students ?? [])
      .filter((row) => row.status)
      .map((row) => [row.id, DB_TO_STATUS[row.status!] ?? row.status!]),
  );
}

export async function getStudentAttendanceByMonth(
  year: number,
  month: number,
): Promise<Record<string, Record<number, string>>> {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const data = await callCenterRpc<DashboardResult>("get_attendance_dashboard", {
    _month: monthKey,
    _centers: null,
    _class: "",
  });
  const result: Record<string, Record<number, string>> = {};
  for (const student of data?.heatmap?.students ?? []) {
    result[student.id] = {};
    (student.days ?? []).forEach((status, index) => {
      if (status) result[student.id][index + 1] = status;
    });
  }
  return result;
}

export async function saveStudentAttendance(
  date: string,
  attendanceMap: Record<string, string>,
  center?: string | null,
) {
  const rows = Object.entries(attendanceMap).map(([student_id, shortStatus]) => ({
    student_id,
    status: STATUS_TO_DB[shortStatus] ?? shortStatus,
    reason: "",
    ...(center ? { center } : {}),
  }));
  return callCenterRpc("save_daily_attendance", {
    _date: date,
    _records: rows,
  });
}

export async function getAttendanceSummary(year: number, month: number) {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const data = await callCenterRpc<DashboardResult>("get_attendance_dashboard", {
    _month: monthKey,
    _centers: null,
    _class: "",
  });
  return {
    present: data?.summary?.present ?? 0,
    absent: data?.summary?.absent ?? 0,
    leave: data?.summary?.leave ?? 0,
    holiday: data?.summary?.holiday ?? 0,
  };
}
