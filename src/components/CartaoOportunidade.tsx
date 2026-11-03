"use client";

import Link from "@/components/L";
import { BotaoSalvar } from "./BotaoSalvar";
import { ChipStatus } from "./ChipStatus";
import { dataCurta, ROTULO_CUSTO, ROTULO_NIVEL, ROTULO_TIPO } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

/** Faixa colorida por nível: dá leitura rápida da escada sem precisar ler. */
const COR_NIVEL: Record<string, string> = {
  escolar: "bg-amarelo",
  regional: "bg-amarelo",
  estadual: "bg-laranja",
  nacional: "bg-turquesa",
  internacional: "bg-[#386898]",
};

export function CartaoOportunidade({ item, largura }: { item: Resumo; largura?: string }) {
  const extras = [ROTULO_TIPO[item.tipo], ROTULO_NIVEL[item.nivel], item.custo ? ROTULO_CUSTO[item.custo] : null].filter(Boolean);
  return (
    <article className={`cartao relative flex flex-col gap-2 overflow-hidden p-4 pl-5 ${largura ?? ""}`}>
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${COR_NIVEL[item.nivel]}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-h-11 pt-1">
          <ChipStatus inicio={item.inicio} fim={item.fim} />
        </div>
        <BotaoSalvar id={item.id} nome={item.nome} />
      </div>
      <h3 className="text-[1.0625rem] font-extrabold">
        <Link href={`/oportunidade/${item.slug}/`} className="no-underline after:absolute after:inset-0 hover:underline">
          {item.sigla && item.sigla.length < 10 ? `${item.sigla}: ` : ""}
          {item.nome}
        </Link>
      </h3>
      <p className="text-sm text-tinta-2">{extras.join(" · ")}</p>
      {(item.fim || item.vagaOlimpica || item.financiavelJOC) && (
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1 text-xs font-semibold">
          {item.fim && <li className="rounded-md bg-superficie-2 px-2 py-1">Inscrições até {dataCurta(item.fim)}</li>}
          {item.vagaOlimpica && <li className="rounded-md bg-amarelo-suave px-2 py-1">Vale vaga na UFC</li>}
          {item.financiavelJOC && <li className="rounded-md bg-laranja-suave px-2 py-1">JOC</li>}
        </ul>
      )}
    </article>
  );
}
