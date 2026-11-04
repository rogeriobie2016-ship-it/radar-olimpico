"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoOlimpiada } from "./LogoOlimpiada";
import { Status } from "./Status";
import { asset } from "@/lib/base";
import { normalizar } from "@/lib/filtros";
import { ROTULO_NIVEL } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

type Item = Pick<Resumo, "id" | "slug" | "nome" | "sigla" | "nivel" | "inicio" | "fim" | "areas">;

/** Busca em tela cheia, de qualquer página. Abre com o botão, com Ctrl+K ou com a tecla /. */
export function Busca() {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [itens, setItens] = useState<Item[] | null>(null);
  const [ativo, setAtivo] = useState(0);

  const abrir = useCallback(() => {
    dialogo.current?.showModal();
    setQ("");
    setAtivo(0);
    campo.current?.focus();
    // O índice só é baixado quando alguém busca, para não pesar em 3G.
    setItens((atual) => {
      if (!atual) fetch(asset("/busca.json")).then((r) => r.json()).then(setItens).catch(() => setItens([]));
      return atual;
    });
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      const digitando = /INPUT|TEXTAREA|SELECT/.test(alvo.tagName);
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !digitando)) {
        e.preventDefault();
        abrir();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abrir]);

  const resultados = useMemo(() => {
    if (!itens) return [];
    const termos = normalizar(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return itens.filter((i) => i.fim).slice(0, 8);
    return itens.filter((i) => {
      const alvo = normalizar(`${i.sigla ?? ""} ${i.nome} ${i.areas.join(" ")} ${i.nivel}`);
      return termos.every((t) => alvo.includes(t));
    }).slice(0, 30);
  }, [itens, q]);

  const ir = (i: Item) => {
    dialogo.current?.close();
    router.push(`/oportunidade/${i.slug}/`);
  };

  return (
    <>
      <button type="button" onClick={abrir} className="min-h-11 px-1 text-[0.9375rem] font-medium">
        Buscar
      </button>
      <dialog ref={dialogo} aria-label="Buscar oportunidades" className="tela-cheia">
        <div className="mx-auto flex h-full max-w-3xl flex-col px-4">
          <div className="flex items-center gap-3 border-b-[1.5px] border-tinta">
            <input
              ref={campo}
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setAtivo(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setAtivo((a) => Math.min(a + 1, resultados.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setAtivo((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter" && resultados[ativo]) ir(resultados[ativo]);
              }}
              placeholder="Olimpíada, sigla ou área"
              aria-label="Buscar"
              enterKeyHint="search"
              className="estreito min-h-20 w-full bg-transparent text-[1.75rem] outline-none placeholder:text-tinta-2"
            />
            <button type="button" onClick={() => dialogo.current?.close()} className="min-h-11 shrink-0 text-[0.9375rem] font-medium">
              Fechar
            </button>
          </div>
          <p className="py-3 text-sm text-tinta-2" role="status">
            {!itens ? "Carregando índice" : q ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}` : "Com prazo nos últimos Radares"}
          </p>
          <ul className="flex-1 overflow-y-auto pb-8">
            {resultados.map((i, n) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => ir(i)}
                  onMouseEnter={() => setAtivo(n)}
                  className={`flex w-full items-center justify-between gap-3 border-b border-linha px-1 py-2.5 text-left transition-colors ${n === ativo ? "bg-fundo-2" : ""}`}
                >
                  <LogoOlimpiada id={i.id} nome={i.nome} sigla={i.sigla} className="h-12 w-14" />
                  <span className="min-w-0 flex-1">
                    <span className="estreito block text-xl leading-tight">{i.sigla && i.sigla.length <= 9 ? i.sigla : i.nome}</span>
                    {i.sigla && i.sigla.length <= 9 && <span className="block truncate text-sm text-tinta-2">{i.nome}</span>}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <Status inicio={i.inicio} fim={i.fim} />
                    <span className="text-xs text-tinta-2">{ROTULO_NIVEL[i.nivel]}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
