"use client";

import Link from "./L";
import { LogoOlimpiada } from "./LogoOlimpiada";
import { Novidade } from "./Novidade";
import { Salvar } from "./Salvar";
import { Status } from "./Status";
import { dataCurta, ROTULO_CUSTO, ROTULO_NIVEL, ROTULO_TIPO } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

export const rotuloCurto = (i: { sigla: string | null; nome: string }) => (i.sigla && i.sigla.length <= 9 ? i.sigla : null);

export function LinhaOportunidade({ item }: { item: Resumo }) {
  const curta = rotuloCurto(item);
  const sigla = curta && !item.nome.startsWith(curta) ? curta : null;
  const meta = [ROTULO_TIPO[item.tipo], ROTULO_NIVEL[item.nivel], item.custo ? ROTULO_CUSTO[item.custo] : null, item.vagaOlimpica ? "Aceita na UFC" : null].filter(Boolean);
  return (
    <article className="linha-lista relative flex gap-3 py-3 pr-10">
      <LogoOlimpiada id={item.id} nome={item.nome} sigla={item.sigla} className="size-[4.75rem]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {item.novidade && <Novidade />}
          <Status inicio={item.inicio} fim={item.fim} />
          {item.fim && <span className="num text-xs font-bold text-tinta-2">até {dataCurta(item.fim)}</span>}
        </div>
        <h3 className="mt-1 text-[1.125rem] leading-[1.12]">
          <Link href={`/oportunidade/${item.slug}/`} className="no-underline after:absolute after:inset-0">
            {sigla ? (
              <>
                {sigla} <span className="font-semibold text-tinta-2">{item.nome}</span>
              </>
            ) : (
              item.nome
            )}
          </Link>
        </h3>
        <p className="mt-1 text-[0.8125rem] font-semibold text-tinta-2">{meta.join(", ")}</p>
      </div>
      <div className="absolute right-0 top-2">
        <Salvar id={item.id} nome={item.nome} />
      </div>
    </article>
  );
}
