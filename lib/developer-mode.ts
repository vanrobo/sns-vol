const DEV_MODE_KEY = "sns-developer-mode-v1";

export function readDeveloperMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DEV_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDeveloperMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEV_MODE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}
