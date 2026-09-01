const ADMIN_TAB_KEY = "sns-admin-active-tab-v1";

const VALID_TABS = new Set([
  "overview",
  "events",
  "volunteers",
  "applications",
  "awards",
]);

export function readAdminActiveTab(): string {
  if (typeof window === "undefined") return "overview";
  try {
    const stored = localStorage.getItem(ADMIN_TAB_KEY);
    if (stored && VALID_TABS.has(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "overview";
}

export function writeAdminActiveTab(tab: string) {
  if (typeof window === "undefined" || !VALID_TABS.has(tab)) return;
  try {
    localStorage.setItem(ADMIN_TAB_KEY, tab);
  } catch {
    /* ignore */
  }
}
