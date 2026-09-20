"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Si falla, la página sigue funcionando normal (solo sin caché offline).
      });
    }
  }, []);

  return null;
}
