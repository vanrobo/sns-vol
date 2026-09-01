"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readAdminActiveTab,
  readAdminPeopleFilter,
  subscribeAdminActiveTab,
  subscribeAdminPeopleFilter,
  writeAdminActiveTab,
  writeAdminPeopleFilter,
} from "@/lib/admin-tab-store";

export function useAdminActiveTab() {
  const tab = useSyncExternalStore(
    subscribeAdminActiveTab,
    readAdminActiveTab,
    () => "overview",
  );

  const setTab = useCallback((next: string) => {
    writeAdminActiveTab(next);
  }, []);

  return [tab, setTab] as const;
}

export function useAdminPeopleFilter() {
  const filter = useSyncExternalStore(
    subscribeAdminPeopleFilter,
    readAdminPeopleFilter,
    () => "all",
  );

  const setFilter = useCallback((next: string) => {
    writeAdminPeopleFilter(next);
  }, []);

  return [filter, setFilter] as const;
}
