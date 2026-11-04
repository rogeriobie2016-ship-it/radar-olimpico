"use client";

import { useEffect, useRef, useState } from "react";
import { ArteCartaz, temaDe } from "./Cartaz";
import Link from "./L";
import { LogoOlimpiada } from "./LogoOlimpiada";
import { Mascote, type Pose, type Quem } from "./Mascote";
import { Novidade } from "./Novidade";
import { Salvar } from "./Salvar";
import { Status } from "./Status";
import { dataCurta, ROTULO_CUSTO, ROTULO_NIVEL, ROTULO_PARTICIPACAO, ROTULO_TIPO } from "@/lib/rotulos";
import { useGuia } from "@/lib/guia";
import { calcularStatus, diasEntre, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

export type ItemCarta = Resumo & { resumo: string | null };

const novo = (i: { novidade: string | null }, hoje: string) => !!i.novidade && diasEntre(i.novidade, hoje) <= 30;
const curto = (i: { sigla: string | null; nome: string }) => (i.sigla && i.sigla.length <= 9 ? i.sigla : i.nome);

/** Carta que vira: na frente, o logo oficial. No verso, o que importa para decidir. */
export function Carta({ item, hoje }: { item: ItemCarta; hoje: string }) {
  const [virada, setVirada] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const t = temaDe(item.areas[0]);
  const nome = curto(item);

  return (
    <div
      className="carta"
      data-virada={virada}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || virada) return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: ((e.clientY - r.top) / r.height - 0.5) * -14 });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="carta-miolo" style={!virada && (tilt.x || tilt.y) ? { transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(1.04)`, transition: "transform 90ms linear" } : undefined}>
        <button type="button" onClick={() => setVirada(true)} tabIndex={virada ? -1 : 0} className="carta-face text-left" style={{ background: t.fundo, color: t.texto, boxShadow: "inset 0 0 0 5px rgb(0 0 0 / 12%)" }}>
          <span className="sr-only">{item.nome}. Virar a carta. </span>
          <span className="relative mx-2.5 mt-2.5 grid flex-1 place-items-center overflow-hidden rounded-[14px] bg-white p-2.5">
            <LogoOlimpiada id={item.id} nome={item.nome} sigla={item.sigla} className="absolute inset-2 !bg-transparent !p-0 !shadow-none" />
          </span>
          {novo(item, hoje) && <Novidade className="absolute -right-0.5 top-1" />}
          <span className="flex flex-col gap-0.5 px-3 pb-3 pt-2">
            <span className={`estreito line-clamp-2 leading-[1.05] ${nome.length > 16 ? "text-[0.95rem]" : "text-[1.2rem]"}`}>{nome}</span>
            <span className="text-[0.75rem] font-bold opacity-90">{item.fim && item.fim >= hoje ? `Inscrições até ${dataCurta(item.fim)}` : ROTULO_NIVEL[item.nivel]}</span>
          </span>
        </button>

        <div className="carta-face carta-verso p-3" aria-hidden={!virada}>
          <button type="button" onClick={() => setVirada(false)} tabIndex={virada ? 0 : -1} className="self-end text-xs font-extrabold underline">
            Virar de volta
          </button>
          <p className="estreito mt-0.5 line-clamp-3 text-[0.95rem] leading-tight">{item.nome}</p>
          <div className="mt-1">
            <Status inicio={item.inicio} fim={item.fim} />
          </div>
          <p className="mt-1 text-[0.75rem] font-semibold leading-snug text-[#a9c6d8]">
            {[ROTULO_TIPO[item.tipo], item.custo ? ROTULO_CUSTO[item.custo] : null, item.participacao ? ROTULO_PARTICIPACAO[item.participacao] : null].filter(Boolean).join(", ")}
          </p>
          <div className="mt-auto flex items-center gap-1">
            <Link href={`/oportunidade/${item.slug}/`} tabIndex={virada ? 0 : -1} className="btn btn-primario !min-h-10 flex-1 !px-2 !py-1 text-[0.8125rem]">
              Quero!
            </Link>
            <Salvar id={item.id} nome={item.nome} />
          </div>
        </div>
      </div>
    </div>
  );
}

export type DadosMundo = { id: string; titulo: string; frase: string; area: string; fundo: string; tinta: string; pose: Pose; quem: Quem | "guia"; itens: string[] };

export function Mundo({ m, itens, hoje, inverte }: { m: DadosMundo; itens: ItemCarta[]; hoje: string; inverte: boolean }) {
  const { quem } = useGuia();
  const ref = useRef<HTMLElement>(null);
  const [perto, setPerto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setPerto(true), { rootMargin: "500px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  if (!itens.length) return null;
  return (
    <section ref={ref} aria-label={m.titulo} className="mundo py-8" style={{ background: m.fundo, color: m.tinta }}>
      <ArteCartaz id={m.id} area={m.area} className="mundo-arte" />
      <div className="relative">
        <div className={`mx-auto flex max-w-6xl items-end gap-2 px-4 ${inverte ? "flex-row-reverse text-right" : ""}`}>
          <Mascote quem={m.quem === "guia" ? quem : m.quem} pose={m.pose} className="w-24 shrink-0 sm:w-32" />
          <div className="min-w-0 pb-2">
            <h2 className="uppercase">{m.titulo}</h2>
            <p className="mt-1 font-bold leading-snug">{m.frase}</p>
          </div>
        </div>
        <div className="mx-auto mt-4 flex min-h-[15.5rem] max-w-6xl snap-x gap-2.5 overflow-x-auto px-4 pb-4 pt-2 [scrollbar-width:none] sm:min-h-[18rem] [&::-webkit-scrollbar]:hidden" style={{ scrollPaddingLeft: "1rem" }}>
          {perto &&
            itens.map((i) => (
              <Carta key={i.id} item={i} hoje={hoje} />
            ))}
        </div>
      </div>
    </section>
  );
}

export function Mundos({ itens, mundos }: { itens: ItemCarta[]; mundos: DadosMundo[] }) {
  const hoje = useHoje();
  const porId = new Map(itens.map((i) => [i.id, i]));
  const abertas = itens.filter((i) => estaAberto(calcularStatus(i, hoje)));
  const comNovidade = itens.filter((i) => novo(i, hoje));
  const destaques = [...new Map([...abertas, ...comNovidade].map((i) => [i.id, i])).values()];

  return (
    <>
      {destaques.length > 0 && (
        <section aria-label="Agora no radar" className="mx-auto max-w-6xl px-4 pt-8">
          <h2 className="regua uppercase">Agora no radar</h2>
          <div className="-mx-4 mt-3 flex snap-x gap-2.5 overflow-x-auto px-4 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {destaques.map((i) => (
              <Carta key={i.id} item={i} hoje={hoje} />
            ))}
          </div>
        </section>
      )}
      <div className="mt-4">
        {mundos.map((m, n) => (
          <Mundo key={m.id} m={m} hoje={hoje} inverte={n % 2 === 1} itens={m.itens.map((id) => porId.get(id)!).filter(Boolean)} />
        ))}
      </div>
    </>
  );
}

export function FitaLogos({ itens }: { itens: { id: string; nome: string; slug: string; sigla: string | null }[] }) {
  const lista = [...itens, ...itens];
  return (
    <section aria-label="Logos das olimpíadas" className="overflow-hidden py-4">
      <div className="fita">
        {lista.map((i, n) => (
          <Link key={`${i.id}-${n}`} href={`/oportunidade/${i.slug}/`} tabIndex={n < itens.length ? 0 : -1} aria-hidden={n >= itens.length} aria-label={i.nome} className="block transition-transform duration-200 hover:-translate-y-1.5">
            <LogoOlimpiada id={i.id} nome={i.nome} sigla={i.sigla} className="h-[4.5rem] w-28" />
          </Link>
        ))}
      </div>
    </section>
  );
}
