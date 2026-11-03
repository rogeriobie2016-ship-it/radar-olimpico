"use client";

import Link from "@/components/L";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartaoOportunidade } from "@/components/CartaoOportunidade";
import { Contador } from "@/components/Contador";
import { Icone } from "@/components/Icone";
import { calcularStatus, compararPrazo, diasEntre, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

export function BuscaInicio() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/radar/?q=${encodeURIComponent(q.trim())}` : "/radar/");
      }}
    >
      <label htmlFor="busca-inicio" className="sr-only">
        Buscar oportunidades
      </label>
      <Icone nome="busca" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#65564a]" />
      <input
        id="busca-inicio"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Qual olimpíada você procura?"
        enterKeyHint="search"
        className="min-h-14 w-full rounded-2xl border-2 border-[#24170e] bg-white py-3 pl-12 pr-24 text-base text-[#24170e] placeholder:text-[#65564a]"
      />
      <button type="submit" className="absolute right-1.5 top-1/2 min-h-11 -translate-y-1/2 rounded-xl bg-[#24170e] px-4 font-bold text-white">
        Buscar
      </button>
    </form>
  );
}

export function ContadoresInicio({ itens }: { itens: Resumo[] }) {
  const hoje = useHoje();
  const abertas = itens.filter((i) => estaAberto(calcularStatus(i, hoje))).length;
  const vagas = itens.filter((i) => i.vagaOlimpica).length;
  const tiles = [
    { n: abertas, t: abertas === 1 ? "oportunidade aberta agora" : "oportunidades abertas agora", cor: "bg-[#fff] text-[#24170e]", href: "/radar/?abertas=1" },
    { n: itens.length, t: "no catálogo", cor: "bg-turquesa text-[#06312f]", href: "/radar/" },
    { n: vagas, t: "valem vaga na UFC", cor: "bg-amarelo text-[#24170e]", href: "/radar/?vaga=1" },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2">
      {tiles.map((t) => (
        <li key={t.t} className="grid">
          <Link href={t.href} className={`azulejo flex flex-col justify-between gap-1 p-3 no-underline ${t.cor}`}>
            <span className="font-display text-[1.85rem] font-black leading-none sm:text-4xl">
              <Contador valor={t.n} />
            </span>
            <span className="text-xs font-bold leading-tight sm:text-sm">{t.t}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FechamSemana({ itens, edicao }: { itens: Resumo[]; edicao: string }) {
  const hoje = useHoje();
  const logo = itens
    .filter((i) => {
      const s = calcularStatus(i, hoje);
      return s.tipo === "fecha" && i.fim && diasEntre(hoje, i.fim) <= 7;
    })
    .sort((a, b) => compararPrazo(a, b, hoje));
  const proximas = itens.filter((i) => estaAberto(calcularStatus(i, hoje))).sort((a, b) => compararPrazo(a, b, hoje));
  const recentes = itens
    .filter((i) => calcularStatus(i, hoje).tipo === "encerrado")
    .sort((a, b) => compararPrazo(a, b, hoje))
    .slice(0, 6);

  const lista = logo.length ? logo : proximas;
  const titulo = logo.length ? "Fecham esta semana" : proximas.length ? "Próximos prazos" : "Fecham esta semana";

  return (
    <section aria-labelledby="titulo-fecham" className="flex flex-col gap-3">
      <h2 id="titulo-fecham" className="text-2xl font-black">{titulo}</h2>
      {lista.length ? (
        <div className="rolagem-x" tabIndex={0} role="group" aria-label={titulo}>
          {lista.map((i) => (
            <CartaoOportunidade key={i.id} item={i} largura="w-[17rem]" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2.5 rounded-2xl bg-amarelo-suave p-3.5 text-sm">
            <Icone nome="alerta" className="mt-0.5 shrink-0" />
            <p>
              <strong>Nenhum prazo confirmado para os próximos dias.</strong> O Radar mais recente é o de {edicao}. Enquanto o próximo não chega, explore o catálogo: muitas oportunidades têm calendário próprio no site oficial.
            </p>
          </div>
          {recentes.length > 0 && (
            <>
              <h3 className="mt-1 text-lg font-extrabold">Encerraram há pouco</h3>
              <div className="rolagem-x" tabIndex={0} role="group" aria-label="Encerraram há pouco">
                {recentes.map((i) => (
                  <CartaoOportunidade key={i.id} item={i} largura="w-[17rem]" />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
