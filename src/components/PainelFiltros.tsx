"use client";

import { useRef } from "react";
import { Icone } from "./Icone";
import { contarFiltros, GRUPOS, opcoesDe, TITULO_GRUPO, type Filtros, type Grupo } from "@/lib/filtros";
import type { Resumo } from "@/lib/tipos";

type Props = {
  itens: Resumo[];
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  alternar: (g: Grupo, v: string) => void;
  limpar: () => void;
  total: number;
};

function Opcao({ ativo, rotulo, onClick }: { ativo: boolean; rotulo: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`min-h-11 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold ${
        ativo ? "border-laranja bg-laranja text-[#24170e]" : "border-linha bg-superficie text-tinta"
      }`}
    >
      {rotulo}
    </button>
  );
}

/** Busca, filtros rápidos e painel completo que abre de baixo para cima no celular. */
export function PainelFiltros({ itens, filtros, setFiltros, alternar, limpar, total }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const opcoes = opcoesDe(itens);
  const n = contarFiltros(filtros);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <label htmlFor="busca-radar" className="sr-only">
          Buscar por nome, sigla ou área
        </label>
        <Icone nome="busca" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-2" />
        <input
          id="busca-radar"
          type="search"
          value={filtros.q}
          onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
          placeholder="Buscar: matemática, OBMEP, robótica..."
          className="campo pl-11 text-base"
          enterKeyHint="search"
        />
      </div>

      <div className="rolagem-x !pb-1" role="group" aria-label="Filtros rápidos">
        <button type="button" onClick={() => dialogo.current?.showModal()} className="btn btn-secundario !min-h-11 !py-1.5 text-sm">
          <Icone nome="filtro" tamanho={18} />
          Filtros{n > 0 ? ` (${n})` : ""}
        </button>
        <Opcao ativo={filtros.abertas} rotulo="Inscrições abertas" onClick={() => setFiltros({ ...filtros, abertas: !filtros.abertas })} />
        <Opcao ativo={filtros.vaga} rotulo="Vale vaga olímpica" onClick={() => setFiltros({ ...filtros, vaga: !filtros.vaga })} />
        <Opcao ativo={filtros.joc} rotulo="Financiável pelo JOC" onClick={() => setFiltros({ ...filtros, joc: !filtros.joc })} />
        <Opcao ativo={filtros.custo.includes("gratuito")} rotulo="Gratuitas" onClick={() => alternar("custo", "gratuito")} />
      </div>

      <dialog
        ref={dialogo}
        aria-label="Filtros"
        className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border-0 bg-superficie p-0 text-tinta backdrop:bg-black/50 md:m-auto md:max-w-xl md:rounded-3xl"
        onClick={(e) => {
          if (e.target === dialogo.current) dialogo.current?.close();
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-linha bg-superficie px-4 py-3">
          <p className="font-display text-lg font-black">Filtros</p>
          <button type="button" className="grid size-11 place-items-center rounded-xl" aria-label="Fechar filtros" onClick={() => dialogo.current?.close()}>
            <Icone nome="fechar" />
          </button>
        </div>
        <div className="flex flex-col gap-5 p-4">
          {GRUPOS.map((g: Grupo) => (
            <fieldset key={g}>
              <legend className="mb-2 font-bold">{TITULO_GRUPO[g]}</legend>
              <div className="flex flex-wrap gap-2">
                {opcoes[g].map((o) => (
                  <Opcao key={o.valor} ativo={filtros[g].includes(o.valor)} rotulo={o.rotulo} onClick={() => alternar(g, o.valor)} />
                ))}
              </div>
              {g === "modalidade" && <p className="mt-2 text-xs text-tinta-2">A maioria dos eventos ainda não informa a modalidade.</p>}
              {g === "serie" && <p className="mt-2 text-xs text-tinta-2">Itens sem série informada continuam aparecendo.</p>}
            </fieldset>
          ))}
          <fieldset>
            <legend className="mb-2 font-bold">Mais</legend>
            <div className="flex flex-wrap gap-2">
              <Opcao ativo={filtros.abertas} rotulo="Inscrições abertas" onClick={() => setFiltros({ ...filtros, abertas: !filtros.abertas })} />
              <Opcao ativo={filtros.vaga} rotulo="Vale vaga olímpica" onClick={() => setFiltros({ ...filtros, vaga: !filtros.vaga })} />
              <Opcao ativo={filtros.joc} rotulo="Financiável pelo JOC" onClick={() => setFiltros({ ...filtros, joc: !filtros.joc })} />
            </div>
          </fieldset>
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-linha bg-superficie p-3">
          <button type="button" className="btn btn-secundario" onClick={limpar}>
            Limpar
          </button>
          <button type="button" className="btn btn-primario flex-1" onClick={() => dialogo.current?.close()}>
            Ver {total} {total === 1 ? "resultado" : "resultados"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
