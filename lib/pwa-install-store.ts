type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PWAInstallState = {
  canInstall: boolean;
  installed: boolean;
  isIOSDevice: boolean;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;

const state: PWAInstallState = {
  canInstall: false,
  installed: false,
  isIOSDevice: false,
};

/** Stable snapshot for useSyncExternalStore — must keep referential equality until state changes. */
let snapshot: PWAInstallState = { ...state };

function refreshSnapshot() {
  snapshot = { ...state };
}

const listeners = new Set<() => void>();

function notify() {
  refreshSnapshot();
  listeners.forEach((cb) => cb());
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function syncInstalled() {
  state.installed = isStandalone();
  if (state.installed) {
    state.canInstall = false;
    deferredPrompt = null;
  }
}

export function getPWAInstallState(): PWAInstallState {
  return snapshot;
}

export function subscribePWAInstall(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Register once at app boot so we never miss beforeinstallprompt. */
export function initPWAInstallListeners() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  state.isIOSDevice = isIOS();
  syncInstalled();
  refreshSnapshot();

  const onBeforeInstall = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    state.canInstall = true;
    notify();
  };

  const onInstalled = () => {
    deferredPrompt = null;
    state.canInstall = false;
    state.installed = true;
    notify();
  };

  const onDisplayMode = () => {
    syncInstalled();
    notify();
  };

  window.addEventListener("beforeinstallprompt", onBeforeInstall);
  window.addEventListener("appinstalled", onInstalled);
  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", onDisplayMode);
}

export async function triggerPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    deferredPrompt = null;
    state.canInstall = false;
    state.installed = true;
    notify();
    return true;
  }
  return false;
}
