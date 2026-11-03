"use client";

import { Contador } from "@/components/Contador";
import Link from "@/components/L";
import { Status } from "@/components/Status";
import { dataCurta } from "@/lib/rotulos";
import { calcularStatus, compararPrazo, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

export function Numeros({ itens, total, vagas }: { itens: Resumo[]; total: number; vagas: number }) {
  const hoje = useHoje();
  const abertas = itens.filter((i) => estaAberto(calcularStatus(i, hoje))).length;
  const dados = [
    { n: abertas, t: "inscrições abertas hoje", href: "/radar/?abertas=1" },
    { n: total, t: "oportunidades no catálogo", href: "/radar/" },
    { n: vagas, t: "aceitas no edital da UFC", href: "/radar/?vaga=1" },
  ];
  return (
    <ul className="regua grid grid-cols-3">
      {dados.map((d, i) => (
        <li key={d.t} className={i ? "border-l border-linha" : ""}>
          <Link href={d.href} className="flex h-full flex-col gap-1 py-3 pr-2 no-underline transition-colors hover:bg-fundo-2 sm:py-4 [&:not(:first-child)]:pl-3" style={i ? { paddingLeft: "0.75rem" } : undefined}>
            <span className="estreito text-[2.75rem] font-bold leading-none sm:text-6xl">
              <Contador valor={d.n} />
            </span>
            <span className="text-[0.8125rem] leading-tight text-tinta-2 sm:text-[0.9375rem]">{d.t}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Quadro de prazos: data primeiro, como um painel de embarque. */
export function QuadroPrazos({ itens }: { itens: Resumo[] }) {
  const hoje = useHoje();
  const abertos = itens.filter((i) => estaAberto(calcularStatus(i, hoje))).sort((a, b) => compararPrazo(a, b, hoje));
  const recentes = itens.filter((i) => calcularStatus(i, hoje).tipo === "encerrado").sort((a, b) => compararPrazo(a, b, hoje));
  const lista = (abertos.length ? abertos : recentes).slice(0, 6);
  return (
    <section aria-labelledby="t-prazos">
      <div className="regua flex items-baseline justify-between gap-4 pt-3">
        <h2 id="t-prazos">{abertos.length ? "Próximos prazos" : "Últimos prazos"}</h2>
        <Link href="/calendario/" className="link shrink-0 text-[0.9375rem]">
          Calendário
        </Link>
      </div>
      <ul className="mt-4 border-t border-linha">
        {lista.map((i) => (
          <li key={i.id}>
            <Link href={`/oportunidade/${i.slug}/`} className="linha-lista grid grid-cols-[4.25rem_1fr] items-baseline gap-3 py-3.5">
              <span className="estreito num text-[1.75rem] font-bold leading-none">{i.fim ? dataCurta(i.fim) : ""}</span>
              <span className="min-w-0">
                <span className="block font-semibold leading-snug">{i.sigla && i.sigla.length <= 9 ? `${i.sigla}, ${i.nome}` : i.nome}</span>
                <span className="mt-0.5 block">
                  <Status inicio={i.inicio} fim={i.fim} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
