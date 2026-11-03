"use client";

import { calcularStatus, useHoje } from "@/lib/status";

export function Status({ inicio, fim }: { inicio: string | null; fim: string | null }) {
  const hoje = useHoje();
  const s = calcularStatus({ inicio, fim }, hoje);
  return <span className={`status status-${s.tipo}`}>{s.rotulo}</span>;
}
