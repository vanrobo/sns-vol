"use server";

import { callCenterRpc } from "@/lib/center/rpc";

export type GuestVisitRow = {
  id: string;
  full_name: string;
  phone?: string | null;
  address?: string | null;
  center?: string | null;
  guest_type?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;
  comments?: string | null;
  photo_link?: string | null;
};

export async function listGuestVisits(filters?: {
  search?: string;
  center?: string;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<GuestVisitRow[]> {
  const data = await callCenterRpc<GuestVisitRow[] | { visits?: GuestVisitRow[] }>(
    "list_guest_visits",
    {
      _search: filters?.search ?? "",
      _center: filters?.center ?? "",
      _start_date: filters?.startDate || null,
      _end_date: filters?.endDate || null,
    },
  );
  if (Array.isArray(data)) return data;
  return data?.visits ?? [];
}

export async function createGuestVisit(guest: Record<string, unknown>) {
  return callCenterRpc("create_guest_visit", { _guest: guest });
}

export async function updateGuestVisit(
  id: string,
  patch: Record<string, unknown>,
) {
  return callCenterRpc("update_guest_visit", { _id: id, _patch: patch });
}

export async function deleteGuestVisit(id: string) {
  return callCenterRpc("delete_guest_visit", { _id: id });
}
