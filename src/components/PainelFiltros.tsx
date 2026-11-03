"use client";

import { useRef } from "react";
import { contarFiltros, GRUPOS, opcoesDe, TITULO_GRUPO, type Filtros, type Grupo } from "@/lib/filtros";
import type { Resumo } from "@/lib/tipos";

type Props = { itens: Resumo[]; filtros: Filtros; setFiltros: (f: Filtros) => void; alternar: (g: Grupo, v: string) => void; limpar: () => void; total: number };

function Opcao({ ativo, rotulo, onClick }: { ativo: boolean; rotulo: string; onClick: () => void }) {
  return (
    <button type="button" className="opcao" aria-pressed={ativo} onClick={onClick}>
      {rotulo}
    </button>
  );
}

export function PainelFiltros({ itens, filtros, setFiltros, alternar, limpar, total }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const opcoes = opcoesDe(itens);
  const n = contarFiltros(filtros);
  const trocar = (k: "abertas" | "vaga" | "joc") => setFiltros({ ...filtros, [k]: !filtros[k] });

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={filtros.q}
        onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
        placeholder="Buscar por nome, sigla ou área"
        aria-label="Buscar por nome, sigla ou área"
        enterKeyHint="search"
        className="campo estreito !text-[1.5rem] font-semibold"
      />
      <div className="rolagem-x" role="group" aria-label="Filtros">
        <button type="button" className="opcao font-semibold" aria-pressed={n > 0} onClick={() => dialogo.current?.showModal()}>
          Filtros{n ? ` (${n})` : ""}
        </button>
        <Opcao ativo={filtros.abertas} rotulo="Inscrições abertas" onClick={() => trocar("abertas")} />
        <Opcao ativo={filtros.vaga} rotulo="Aceita na UFC" onClick={() => trocar("vaga")} />
        <Opcao ativo={filtros.joc} rotulo="Financiável pelo JOC" onClick={() => trocar("joc")} />
        <Opcao ativo={filtros.custo.includes("gratuito")} rotulo="Gratuita" onClick={() => alternar("custo", "gratuito")} />
      </div>

      <dialog
        ref={dialogo}
        aria-label="Filtros"
        className="folha"
        onClick={(e) => {
          if (e.target === dialogo.current) dialogo.current?.close();
        }}
      >
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-linha bg-fundo px-4">
          <p className="estreito text-2xl font-bold">Filtros</p>
          <button type="button" className="min-h-11 font-medium" onClick={() => dialogo.current?.close()}>
            Fechar
          </button>
        </div>
        <div className="flex flex-col gap-6 p-4">
          {GRUPOS.map((g: Grupo) => (
            <fieldset key={g}>
              <legend className="mb-2 font-semibold">{TITULO_GRUPO[g]}</legend>
              <div className="flex flex-wrap gap-1.5">
                {opcoes[g].map((o) => (
                  <Opcao key={o.valor} ativo={filtros[g].includes(o.valor)} rotulo={o.rotulo} onClick={() => alternar(g, o.valor)} />
                ))}
              </div>
              {g === "modalidade" && <p className="mt-2 text-sm text-tinta-2">A maioria dos eventos ainda não informa a modalidade.</p>}
              {g === "serie" && <p className="mt-2 text-sm text-tinta-2">Eventos sem série informada continuam na lista.</p>}
            </fieldset>
          ))}
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-linha bg-fundo p-3">
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
