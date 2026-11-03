"use client";

import { useEffect } from "react";

/** Marca as novidades como vistas, para o aviso do cabeçalho apagar. */
export function VistoAgora({ data }: { data: string | null }) {
  useEffect(() => {
    if (!data) return;
    try {
      localStorage.setItem("radar-novidades-vistas", data);
      window.dispatchEvent(new Event("radar-novidades"));
    } catch {
      /* sem armazenamento, o aviso volta na próxima visita */
    }
  }, [data]);
  return null;
}
