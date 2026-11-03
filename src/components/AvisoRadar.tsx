"use client";

import { dataExtenso } from "@/lib/rotulos";
import { calcularStatus, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

type Minimo = Pick<Resumo, "inicio" | "fim">;

/** Aparece só quando nenhum prazo conhecido está aberto. */
export function AvisoRadar({ itens, edicao }: { itens: Minimo[]; edicao: string }) {
  const hoje = useHoje();
  if (itens.some((i) => estaAberto(calcularStatus(i, hoje)))) return null;
  return (
    <p className="border-l-[3px] border-marca py-1 pl-3 text-[0.9375rem]">
      Em {dataExtenso(hoje)}, nenhuma inscrição confirmada está aberta. O Radar mais recente é o de {edicao}. Eventos sem data podem ter inscrições abertas: consulte o site oficial de cada um.
    </p>
  );
}
