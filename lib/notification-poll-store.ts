type NotificationPollState = {
  hasUnread: boolean;
};

let state: NotificationPollState = { hasUnread: false };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function getNotificationPollState(): NotificationPollState {
  return state;
}

export function subscribeNotificationPoll(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setNotificationPollHasUnread(hasUnread: boolean) {
  if (state.hasUnread === hasUnread) return;
  state = { hasUnread };
  notify();
}

export function clearNotificationUnread() {
  setNotificationPollHasUnread(false);
}
