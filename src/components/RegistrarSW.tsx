"use client";

import { useEffect } from "react";
import { asset } from "@/lib/base";

export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const registrar = () => navigator.serviceWorker.register(asset("/sw.js"), { scope: asset("/") }).catch(() => {});
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);
  return null;
}
