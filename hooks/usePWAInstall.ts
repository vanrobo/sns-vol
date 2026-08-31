"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getPWAInstallState,
  subscribePWAInstall,
  triggerPWAInstall,
} from "@/lib/pwa-install-store";

export function usePWAInstall() {
  const state = useSyncExternalStore(
    subscribePWAInstall,
    getPWAInstallState,
    () => ({
      canInstall: false,
      installed: false,
      isIOSDevice: false,
    }),
  );

  const install = useCallback(async () => triggerPWAInstall(), []);

  const showInstallOption = !state.installed;

  return {
    canInstall: state.canInstall,
    isIOSDevice: state.isIOSDevice,
    installed: state.installed,
    showInstallOption,
    install,
  };
}
