"use client";

import { calcularStatus, useHoje, type Status } from "@/lib/status";

const CORES: Record<Status["tipo"], string> = {
  aberto: "bg-[var(--ok-fundo)] text-[var(--ok-tinta)]",
  fecha: "bg-[var(--alerta-fundo)] text-[var(--alerta-tinta)]",
  breve: "bg-[var(--breve-fundo)] text-[var(--breve-tinta)]",
  encerrado: "bg-[var(--fim-fundo)] text-[var(--fim-tinta)]",
  confirmar: "border border-dashed border-tinta-2 text-tinta-2",
};

export function ChipStatus({ inicio, fim }: { inicio: string | null; fim: string | null }) {
  const hoje = useHoje();
  const s = calcularStatus({ inicio, fim }, hoje);
  return <span className={`chip ${CORES[s.tipo]}`}>{s.rotulo}</span>;
}
