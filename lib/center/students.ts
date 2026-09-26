"use server";

import { callCenterRpc } from "@/lib/center/rpc";

export type CenterStudentRow = {
  id: string;
  name: string;
  class?: string | null;
  school?: string | null;
  center?: string | null;
  photo_link?: string | null;
  sex?: string | null;
  year?: string | null;
  dob?: string | null;
  remark?: string | null;
  status?: string | null;
  guardian?: string | null;
  contact?: string | null;
  address?: string | null;
};

type ListStudentsResult = {
  students?: CenterStudentRow[];
  total?: number;
  available_centers?: string[];
  available_classes?: string[];
};

const ALLOWED_COLUMNS = [
  "name",
  "class",
  "school",
  "center",
  "photo_link",
  "sex",
  "year",
  "dob",
  "remark",
  "status",
  "guardian",
  "contact",
  "address",
  "hobbies",
  "interest",
  "reco",
  "social",
  "cards",
  "observations",
] as const;

function safeStudentFields(student: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(student).filter(([key]) =>
      (ALLOWED_COLUMNS as readonly string[]).includes(key),
    ),
  );
}

export async function listCenterStudents(opts?: {
  search?: string;
  centers?: string[] | null;
  className?: string;
}): Promise<{
  students: CenterStudentRow[];
  centers: string[];
  classes: string[];
  total: number;
}> {
  const data = await callCenterRpc<ListStudentsResult>("list_students", {
    _search: opts?.search ?? "",
    _centers: opts?.centers ?? null,
    _class: opts?.className ?? "",
  });
  return {
    students: data?.students ?? [],
    centers: data?.available_centers ?? [],
    classes: data?.available_classes ?? [],
    total: data?.total ?? data?.students?.length ?? 0,
  };
}

export async function createCenterStudent(student: Record<string, unknown>) {
  return callCenterRpc("create_student", { _student: student });
}

export async function updateCenterStudent(
  id: string,
  patch: Record<string, unknown>,
) {
  return callCenterRpc("update_student", {
    _id: id,
    _patch: safeStudentFields(patch),
  });
}

export async function deleteCenterStudent(id: string) {
  return callCenterRpc("delete_student", { _id: id });
}
