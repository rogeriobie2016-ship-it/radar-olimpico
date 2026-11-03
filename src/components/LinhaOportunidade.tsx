"use client";

import Link from "./L";
import { Salvar } from "./Salvar";
import { Novidade } from "./Sala";
import { Status } from "./Status";
import { dataCurta, ROTULO_CUSTO, ROTULO_NIVEL, ROTULO_TIPO } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

/** Sigla curta quando existe. Sem ela, a primeira palavra útil do nome. */
export const rotuloCurto = (i: { sigla: string | null; nome: string }) =>
  i.sigla && i.sigla.length <= 9 ? i.sigla : null;

export function LinhaOportunidade({ item }: { item: Resumo }) {
  const curta = rotuloCurto(item);
  const sigla = curta && !item.nome.startsWith(curta) ? curta : null;
  const meta = [ROTULO_TIPO[item.tipo], ROTULO_NIVEL[item.nivel], item.custo ? ROTULO_CUSTO[item.custo] : null, item.vagaOlimpica ? "Aceita na UFC" : null].filter(Boolean);
  return (
    <article className="linha-lista relative py-4 pr-11">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex items-center gap-2.5">
          {item.novidade && <Novidade />}
          <Status inicio={item.inicio} fim={item.fim} />
        </span>
        {item.fim && <span className="num text-sm text-tinta-2">até {dataCurta(item.fim)}</span>}
      </div>
      <h3 className="mt-1.5 text-[1.5rem] leading-[1.08]">
        <Link href={`/oportunidade/${item.slug}/`} className="no-underline after:absolute after:inset-0">
          {sigla ? (
            <>
              {sigla} <span className="font-medium text-tinta-2">{item.nome}</span>
            </>
          ) : (
            item.nome
          )}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-tinta-2">{meta.join(", ")}</p>
      <div className="absolute right-0 top-3">
        <Salvar id={item.id} nome={item.nome} />
      </div>
    </article>
  );
}
