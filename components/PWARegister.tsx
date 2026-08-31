"use client";

import { useEffect } from "react";
import { initPWAInstallListeners } from "@/lib/pwa-install-store";

const SW_URL = "/sw.js?v=sns-v3";

export default function PWARegister() {
  useEffect(() => {
    initPWAInstallListeners();

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register(SW_URL)
      .then((reg) => {
        reg.update();
      })
      .catch(() => {
        /* ignore registration errors */
      });
  }, []);

  return null;
}
