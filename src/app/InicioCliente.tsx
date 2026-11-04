"use client";

import { Contador } from "@/components/Contador";
import Link from "@/components/L";
import { LogoOlimpiada } from "@/components/LogoOlimpiada";
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
    <ul className="grid grid-cols-3 gap-2">
      {dados.map((d, i) => (
        <li key={d.t} className="grid">
          <Link href={d.href} className="azulejo flex h-full flex-col gap-1 p-3 no-underline transition-transform duration-200 hover:-translate-y-1" style={{ background: ["#f58a33", "#00c9c8", "#fdc13f"][i], color: "#10201f" }}>
            <span className="estreito text-[2.5rem] leading-none sm:text-6xl">
              <Contador valor={d.n} />
            </span>
            <span className="text-[0.75rem] font-extrabold leading-tight sm:text-[0.9375rem]">{d.t}</span>
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
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="t-prazos" className="regua uppercase">{abertos.length ? "Próximos prazos" : "Últimos prazos"}</h2>
        <Link href="/calendario/" className="link shrink-0 text-[0.9375rem]">
          Calendário
        </Link>
      </div>
      <ul className="mt-4">
        {lista.map((i) => (
          <li key={i.id}>
            <Link href={`/oportunidade/${i.slug}/`} className="linha-lista grid grid-cols-[4.25rem_1fr] items-center gap-3 py-3">
              <LogoOlimpiada id={i.id} nome={i.nome} sigla={i.sigla} className="size-16" />
              <span className="min-w-0">
                <span className="estreito block leading-snug">{i.sigla && i.sigla.length <= 9 ? `${i.sigla}, ${i.nome}` : i.nome}</span>
                <span className="mt-0.5 block">
                  <Status inicio={i.inicio} fim={i.fim} />{" "}
                  {i.fim && <span className="num text-xs font-bold text-tinta-2">{dataCurta(i.fim)}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
