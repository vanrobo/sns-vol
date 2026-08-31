"use client";

import { useSyncExternalStore } from "react";
import {
  getNotificationPollState,
  subscribeNotificationPoll,
} from "@/lib/notification-poll-store";

export function useNotificationUnread() {
  return useSyncExternalStore(
    subscribeNotificationPoll,
    () => getNotificationPollState().hasUnread,
    () => false,
  );
}
