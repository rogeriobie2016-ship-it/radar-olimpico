"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArteCartaz, temaDe } from "./Cartaz";
import Link from "./L";
import { Salvar } from "./Salvar";
import { Seta } from "./Seta";
import { Status } from "./Status";
import { dataCurta, ROTULO_CUSTO, ROTULO_NIVEL, ROTULO_TIPO } from "@/lib/rotulos";
import { calcularStatus, diasEntre, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

export type ItemSala = Resumo & { resumo: string | null };
export type FileiraDados = { id: string; titulo: string; ids: string[] } | { id: string; titulo: string; dinamica: "abertas" };

const DIAS_NOVIDADE = 30;
const novo = (i: { novidade: string | null }, hoje: string) => !!i.novidade && diasEntre(i.novidade, hoje) <= DIAS_NOVIDADE;

export function Novidade({ className = "" }: { className?: string }) {
  return <span className={`inline-block bg-marca px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none tracking-[0.04em] text-[#111210] ${className}`}>NOVIDADE</span>;
}

const curto = (i: { sigla: string | null; nome: string }) => (i.sigla && i.sigla.length <= 9 && !i.nome.startsWith(`${i.sigla}:`) ? i.sigla : i.nome);

/** Cartaz da fileira. Toque abre a prévia. No computador, o cartaz cresce ao apontar. */
function Cartaz({ item, aoAbrir, hoje }: { item: ItemSala; aoAbrir: (i: ItemSala) => void; hoje: string }) {
  const t = temaDe(item.areas[0]);
  const nome = curto(item);
  return (
    <button
      type="button"
      onClick={() => aoAbrir(item)}
      aria-label={`${nome}. ${nome === item.nome ? "" : `${item.nome}. `}Ver prévia`}
      className="group relative aspect-[2/3] w-[9.25rem] shrink-0 snap-start overflow-hidden rounded-[3px] text-left outline-offset-2 transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:z-10 hover:scale-[1.05] focus-visible:z-10 focus-visible:scale-[1.05] active:scale-[0.98] sm:w-[11.5rem]"
    >
      <ArteCartaz id={item.id} area={item.areas[0]} className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-110" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: `linear-gradient(to top, ${t.fundo} 18%, transparent)` }} />
      {novo(item, hoje) && <Novidade className="absolute left-0 top-2.5" />}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5" style={{ color: t.texto }}>
        <span className={`estreito font-bold leading-[0.98] ${nome.length > 22 ? "text-[1.1rem]" : nome.length > 10 ? "text-[1.45rem]" : "text-[2.1rem]"}`}>{nome}</span>
        <span className="text-[0.75rem] font-medium opacity-90">{item.fim && item.fim >= hoje ? `Até ${dataCurta(item.fim)}` : ROTULO_NIVEL[item.nivel]}</span>
      </span>
    </button>
  );
}

/** Fileira horizontal com inércia natural no toque, setas no computador e arrasto com o mouse. */
function Fileira({ titulo, itens, aoAbrir, hoje }: { titulo: string; itens: ItemSala[]; aoAbrir: (i: ItemSala) => void; hoje: string }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [fim, setFim] = useState({ inicio: true, final: false });

  const medir = useCallback(() => {
    const t = trilho.current;
    if (t) setFim({ inicio: t.scrollLeft < 8, final: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  }, []);
  useEffect(medir, [medir, itens.length]);

  const rolar = (dir: 1 | -1) => trilho.current?.scrollBy({ left: dir * trilho.current.clientWidth * 0.85, behavior: "smooth" });

  if (!itens.length) return null;
  return (
    <section aria-label={titulo} className="group/fileira relative">
      <h2 className="mb-2.5 px-4 text-[1.5rem] sm:text-[1.75rem] lg:px-8">{titulo}</h2>
      <div ref={trilho} onScroll={medir} className="flex snap-x gap-2 overflow-x-auto scroll-smooth px-4 py-2 [scrollbar-width:none] lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden" style={{ scrollPaddingLeft: "1rem" }}>
        {itens.map((i) => (
          <Cartaz key={i.id} item={i} aoAbrir={aoAbrir} hoje={hoje} />
        ))}
      </div>
      {!fim.inicio && (
        <button type="button" onClick={() => rolar(-1)} aria-label={`Voltar em ${titulo}`} className="absolute bottom-2 left-0 top-10 z-20 hidden w-14 place-items-center bg-gradient-to-r from-[#0b0b0a] to-transparent text-white opacity-0 transition-opacity group-hover/fileira:opacity-100 focus-visible:opacity-100 lg:grid">
          <Seta direcao="esquerda" tamanho={28} />
        </button>
      )}
      {!fim.final && (
        <button type="button" onClick={() => rolar(1)} aria-label={`Avançar em ${titulo}`} className="absolute bottom-2 right-0 top-10 z-20 hidden w-14 place-items-center bg-gradient-to-l from-[#0b0b0a] to-transparent text-white opacity-0 transition-opacity group-hover/fileira:opacity-100 focus-visible:opacity-100 lg:grid">
          <Seta tamanho={28} />
        </button>
      )}
    </section>
  );
}

const TEMPO = 8000;

/** Destaque em tela cheia: troca sozinho, pausa ao apontar ou focar, aceita deslizar o dedo. */
function Destaque({ itens, aoAbrir, hoje }: { itens: ItemSala[]; aoAbrir: (i: ItemSala) => void; hoje: string }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const inicioToque = useRef<number | null>(null);

  useEffect(() => {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (pausado || reduzir || itens.length < 2) return;
    const t = setTimeout(() => setAtual((a) => (a + 1) % itens.length), TEMPO);
    return () => clearTimeout(t);
  }, [atual, pausado, itens.length]);

  const item = itens[atual];
  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative h-[34rem] overflow-hidden sm:h-[38rem] lg:h-[42rem]"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return;
        const d = e.changedTouches[0].clientX - inicioToque.current;
        if (Math.abs(d) > 48) setAtual((a) => (a + (d < 0 ? 1 : -1) + itens.length) % itens.length);
        inicioToque.current = null;
      }}
    >
      {itens.map((i, n) => (
        <div key={i.id} aria-hidden={n !== atual} className="absolute inset-0 transition-opacity duration-1000 ease-out" style={{ opacity: n === atual ? 1 : 0 }}>
          <ArteCartaz id={i.id} area={i.areas[0]} className={`absolute right-0 top-0 h-full w-full transition-transform duration-[9000ms] ease-linear lg:w-[62%] ${n === atual ? "scale-110" : "scale-100"}`} />
        </div>
      ))}
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,#0b0b0a_6%,rgb(11_11_10/.72)_42%,rgb(11_11_10/.12)_72%)] lg:bg-[linear-gradient(to_right,#0b0b0a_34%,rgb(11_11_10/.55)_62%,transparent),linear-gradient(to_top,#0b0b0a,transparent_30%)]" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-4 pb-5 lg:bottom-6 lg:max-w-[42rem] lg:px-8">
        <div key={item.id} className="entrada-seq flex flex-col items-start gap-3">
          <div className="flex items-center gap-3">
            {novo(item, hoje) && <Novidade />}
            <Status inicio={item.inicio} fim={item.fim} />
          </div>
          <h2 className="text-[clamp(2.75rem,12vw,5.5rem)] leading-[0.95]">{curto(item)}</h2>
          {curto(item) !== item.nome && <p className="estreito text-[1.3rem] font-semibold leading-tight">{item.nome}</p>}
          {item.resumo && <p className="line-clamp-4 max-w-xl text-[0.9375rem] leading-snug text-[#d7d8d2]">{item.resumo}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => aoAbrir(item)} className="btn bg-[#f3f3ef] text-[#111210] hover:bg-marca">
              Ver detalhes
            </button>
            <Link href="/escada/" className="btn border-[1.5px] border-[#f3f3ef] hover:bg-[#f3f3ef] hover:text-[#111210]">
              Descobrir a minha
            </Link>
          </div>
        </div>
        <div className="flex gap-1.5 pt-2">
          {itens.map((i, n) => (
            <button key={i.id} type="button" onClick={() => setAtual(n)} aria-label={`Destaque ${n + 1}: ${i.nome}`} aria-current={n === atual} className="flex h-6 flex-1 items-center">
              <span className="block h-[3px] w-full overflow-hidden bg-white/25">
                <span className={`block h-full origin-left bg-white ${n === atual ? "barra-tempo" : n < atual ? "" : "scale-x-0"}`} style={n === atual ? { animationDuration: `${TEMPO}ms`, animationPlayState: pausado ? "paused" : "running" } : undefined} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Prévia que sobe da base da tela, sem tirar a pessoa da fileira. */
function Previa({ item, aoFechar, hoje }: { item: ItemSala | null; aoFechar: () => void; hoje: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (item && !ref.current?.open) ref.current?.showModal();
    if (!item && ref.current?.open) ref.current.close();
  }, [item]);

  const meta = item ? [ROTULO_TIPO[item.tipo], ROTULO_NIVEL[item.nivel], item.custo ? ROTULO_CUSTO[item.custo] : null, item.areas[0]].filter(Boolean) : [];

  return (
    <dialog
      ref={ref}
      aria-label={item?.nome ?? "Prévia"}
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === ref.current) aoFechar();
      }}
      className="previa"
    >
      {item && (
        <div>
          <div className="relative h-52 overflow-hidden sm:h-64">
            <ArteCartaz id={item.id} area={item.areas[0]} className="size-full" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[var(--fundo)] to-transparent to-70%" />
            <button type="button" onClick={aoFechar} className="absolute right-3 top-3 min-h-11 bg-[#111210] px-3 text-[0.9375rem] font-medium text-white">
              Fechar
            </button>
          </div>
          <div className="flex flex-col gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-wrap items-center gap-3">
              {novo(item, hoje) && <Novidade />}
              <Status inicio={item.inicio} fim={item.fim} />
              {item.fim && <span className="num text-sm text-tinta-2">até {dataCurta(item.fim)}</span>}
            </div>
            <h2 className="text-[2.5rem] leading-[0.98]">{curto(item)}</h2>
            {curto(item) !== item.nome && <p className="estreito text-[1.3rem] font-semibold leading-tight">{item.nome}</p>}
            <p className="text-sm text-tinta-2">{meta.join(", ")}</p>
            {item.resumo && <p className="text-[0.9375rem]">{item.resumo}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href={`/oportunidade/${item.slug}/`} className="btn btn-primario" onClick={aoFechar}>
                Ver ficha completa
                <Seta />
              </Link>
              <Salvar id={item.id} nome={item.nome} completo />
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function Sala({ itens, destaques, fileiras }: { itens: ItemSala[]; destaques: string[]; fileiras: FileiraDados[] }) {
  const hoje = useHoje();
  const [previa, setPrevia] = useState<ItemSala | null>(null);
  const porId = useMemo(() => new Map(itens.map((i) => [i.id, i])), [itens]);
  const listaDestaques = destaques.map((d) => porId.get(d)!).filter(Boolean);

  return (
    <div className="sala">
      <Destaque itens={listaDestaques} aoAbrir={setPrevia} hoje={hoje} />
      <div className="flex flex-col gap-7 pb-10 pt-2">
        {fileiras.map((f) => {
          const lista = "dinamica" in f ? itens.filter((i) => estaAberto(calcularStatus(i, hoje))) : f.ids.map((id) => porId.get(id)!).filter(Boolean);
          return <Fileira key={f.id} titulo={f.titulo} itens={lista} aoAbrir={setPrevia} hoje={hoje} />;
        })}
      </div>
      <Previa item={previa} aoFechar={() => setPrevia(null)} hoje={hoje} />
    </div>
  );
}
