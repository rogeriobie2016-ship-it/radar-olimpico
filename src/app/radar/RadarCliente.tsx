"use client";

import { m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { LinhaOportunidade } from "@/components/LinhaOportunidade";
import { PainelFiltros } from "@/components/PainelFiltros";
import { TrilhaCampo } from "@/components/TrilhaCampo";
import { campoDoFiltro } from "@/lib/campos";
import { aplicarFiltros, FILTROS_VAZIOS, useFiltros } from "@/lib/filtros";
import { calcularStatus, compararPrazo, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

const POR_PAGINA = 30;

export function RadarCliente({ itens }: { itens: Resumo[] }) {
  const { filtros, setFiltros, alternar, limpar } = useFiltros();
  const hoje = useHoje();
  const campoFiltrado = campoDoFiltro(filtros.area);
  const [ordem, setOrdem] = useState<"prazo" | "nome">("prazo");
  const [limite, setLimite] = useState(POR_PAGINA);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const resultado = useMemo(() => {
    const f = aplicarFiltros(itens, filtros, (i) => estaAberto(calcularStatus(i, hoje)));
    return [...f].sort((a, b) => (ordem === "prazo" ? compararPrazo(a, b, hoje) : a.nome.localeCompare(b.nome, "pt-BR")));
  }, [itens, filtros, hoje, ordem]);

  return (
    <div className="flex flex-col gap-4">
      <PainelFiltros itens={itens} filtros={filtros} setFiltros={setFiltros} alternar={alternar} limpar={limpar} total={resultado.length} />

      {campoFiltrado && <TrilhaCampo campo={campoFiltrado} atual="olimpiadas" />}

      <div className="flex items-center justify-between gap-3">
        <p className="num font-semibold" role="status">
          {resultado.length} {resultado.length === 1 ? "resultado" : "resultados"}
        </p>
        <label className="flex items-center gap-2 text-[0.9375rem]">
          <span className="text-tinta-2">Ordem</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as "prazo" | "nome")} className="min-h-11 bg-transparent font-medium">
            <option value="prazo">Prazo</option>
            <option value="nome">Nome</option>
          </select>
        </label>
      </div>

      {resultado.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-6">
          <p className="estreito text-2xl font-bold">Nada com esses critérios</p>
          <button type="button" onClick={() => setFiltros(FILTROS_VAZIOS)} className="btn btn-secundario">
            Limpar busca e filtros
          </button>
        </div>
      ) : (
        <ul aria-label="Resultados" className="grid lg:grid-cols-2 lg:gap-x-3">
          {resultado.slice(0, limite).map((item) => (
            <m.li key={item.id} initial={montado ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}>
              <LinhaOportunidade item={item} />
            </m.li>
          ))}
        </ul>
      )}

      {resultado.length > limite && (
        <button type="button" className="btn btn-secundario self-start" onClick={() => setLimite((l) => l + POR_PAGINA)}>
          Mostrar mais {Math.min(POR_PAGINA, resultado.length - limite)}
        </button>
      )}
    </div>
  );
}
