"use server";

import { callCenterRpc } from "@/lib/center/rpc";

export type DocRow = {
  id: string;
  title: string;
  url: string;
  priority?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  note?: string | null;
  saved?: boolean;
  archived?: boolean;
};

export async function listSharedDocuments(opts?: {
  search?: string;
  priority?: string;
  status?: string;
}): Promise<DocRow[]> {
  const data = await callCenterRpc<DocRow[] | { documents?: DocRow[] }>(
    "list_shared_documents",
    {
      _search: opts?.search ?? "",
      _priority: opts?.priority ?? "",
      _status: opts?.status ?? "",
    },
  );
  if (Array.isArray(data)) return data;
  return data?.documents ?? [];
}

export async function listMyDocuments(search = ""): Promise<DocRow[]> {
  const data = await callCenterRpc<DocRow[] | { documents?: DocRow[] }>(
    "list_my_documents",
    { _search: search },
  );
  if (Array.isArray(data)) return data;
  return data?.documents ?? [];
}

export async function createPrivateDocument(document: Record<string, unknown>) {
  return callCenterRpc("create_private_document", { _document: document });
}

export async function deletePrivateDocument(id: string) {
  return callCenterRpc("delete_private_document", { _id: id });
}

export async function saveSharedDocument(id: string) {
  return callCenterRpc("save_shared_document", { _id: id });
}

export async function unsaveSharedDocument(id: string) {
  return callCenterRpc("unsave_shared_document", { _id: id });
}
