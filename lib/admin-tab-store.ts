const ADMIN_TAB_KEY = "sns-admin-active-tab-v1";

const VALID_TABS = new Set([
  "overview",
  "events",
  "volunteers",
  "applications",
  "awards",
]);

const tabListeners = new Set<() => void>();

function emitTabChange() {
  tabListeners.forEach((fn) => fn());
}

export function subscribeAdminActiveTab(onChange: () => void) {
  tabListeners.add(onChange);
  return () => tabListeners.delete(onChange);
}

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
    emitTabChange();
  } catch {
    /* ignore */
  }
}

const PEOPLE_FILTER_KEY = "sns-admin-people-filter-v1";
const VALID_PEOPLE_FILTERS = new Set([
  "all",
  "active",
  "inactive",
  "pending",
]);

const filterListeners = new Set<() => void>();

function emitFilterChange() {
  filterListeners.forEach((fn) => fn());
}

export function subscribeAdminPeopleFilter(onChange: () => void) {
  filterListeners.add(onChange);
  return () => filterListeners.delete(onChange);
}

export function readAdminPeopleFilter(): string {
  if (typeof window === "undefined") return "all";
  try {
    const stored = localStorage.getItem(PEOPLE_FILTER_KEY);
    if (stored && VALID_PEOPLE_FILTERS.has(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "all";
}

export function writeAdminPeopleFilter(filter: string) {
  if (typeof window === "undefined" || !VALID_PEOPLE_FILTERS.has(filter)) return;
  try {
    localStorage.setItem(PEOPLE_FILTER_KEY, filter);
    emitFilterChange();
  } catch {
    /* ignore */
  }
}
