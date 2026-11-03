"use client";

import { Icone } from "./Icone";
import { calcularStatus, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

/** Aparece só quando nenhum prazo conhecido está aberto. Diz a verdade em vez de mostrar um radar vazio. */
export function AvisoRadar({ itens, edicao }: { itens: Resumo[]; edicao: string }) {
  const hoje = useHoje();
  if (itens.some((i) => estaAberto(calcularStatus(i, hoje)))) return null;
  return (
    <p className="flex gap-2.5 rounded-2xl bg-amarelo-suave p-3.5 text-sm">
      <Icone nome="alerta" className="mt-0.5 shrink-0" />
      <span>
        <strong>Nenhuma inscrição aberta confirmada hoje.</strong> O Radar mais recente é o de {edicao}, e os prazos dele já passaram. Muitas oportunidades abaixo ainda
        podem estar abertas: confira no site oficial de cada uma.
      </span>
    </p>
  );
}
