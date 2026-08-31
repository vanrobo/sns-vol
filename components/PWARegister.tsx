"use client";

import { useEffect } from "react";
import { initPWAInstallListeners } from "@/lib/pwa-install-store";

export default function PWARegister() {
  useEffect(() => {
    initPWAInstallListeners();

    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore registration errors */
    });
  }, []);

  return null;
}
