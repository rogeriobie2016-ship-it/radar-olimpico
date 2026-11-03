"use client";

import { m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CartaoOportunidade } from "@/components/CartaoOportunidade";
import { PainelFiltros } from "@/components/PainelFiltros";
import { aplicarFiltros, useFiltros } from "@/lib/filtros";
import { calcularStatus, compararPrazo, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

const POR_PAGINA = 24;

export function RadarCliente({ itens }: { itens: Resumo[] }) {
  const { filtros, setFiltros, alternar, limpar } = useFiltros();
  const hoje = useHoje();
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold" role="status" aria-live="polite">
          {resultado.length} {resultado.length === 1 ? "oportunidade" : "oportunidades"}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-tinta-2">Ordenar por</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as "prazo" | "nome")} className="min-h-11 rounded-lg border-2 border-linha bg-superficie px-2 font-semibold">
            <option value="prazo">Prazo</option>
            <option value="nome">Nome (A a Z)</option>
          </select>
        </label>
      </div>

      {resultado.length === 0 ? (
        <div className="cartao p-6 text-center">
          <p className="font-bold">Nada encontrado com esses filtros.</p>
          <p className="mt-1 text-sm text-tinta-2">Tente tirar um filtro ou buscar por outra palavra.</p>
          <button type="button" onClick={() => setFiltros({ ...filtros, q: "", ...{ area: [], serie: [], tipo: [], nivel: [], custo: [], modalidade: [], vaga: false, joc: false, abertas: false } })} className="btn btn-primario mt-4">
            Limpar busca e filtros
          </button>
        </div>
      ) : (
        <ul aria-label="Resultados" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resultado.slice(0, limite).map((item, i) => (
            <m.li
              key={item.id}
              className={`cv-auto grid ${i < 9 ? "entrada" : ""}`}
              style={i < 9 ? { animationDelay: `${i * 30}ms` } : undefined}
              // Na primeira pintura quem anima é o CSS. Depois, cartões novos de um filtro entram com Framer Motion.
              initial={montado ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <CartaoOportunidade item={item} />
            </m.li>
          ))}
        </ul>
      )}

      {resultado.length > limite && (
        <button type="button" className="btn btn-secundario self-center" onClick={() => setLimite((l) => l + POR_PAGINA)}>
          Mostrar mais ({resultado.length - limite})
        </button>
      )}
    </div>
  );
}
