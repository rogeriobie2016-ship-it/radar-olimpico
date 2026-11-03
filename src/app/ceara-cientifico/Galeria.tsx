"use client";

import { useMemo, useState } from "react";
import type { CearaCientifico } from "@/lib/schema";

type Props = { ganhadores: CearaCientifico["ganhadores"]; categorias: string[]; anos: number[] };

const unicos = <T,>(l: T[]) => [...new Set(l)];

export function Galeria({ ganhadores, categorias, anos }: Props) {
  const [ano, setAno] = useState("");
  const [categoria, setCategoria] = useState("");
  const [crede, setCrede] = useState("");

  const listaCredes = useMemo(() => unicos(ganhadores.map((g) => g.crede)).sort((a, b) => a.localeCompare(b, "pt-BR")), [ganhadores]);
  const listaCategorias = useMemo(() => unicos([...categorias, ...ganhadores.map((g) => g.categoria)]), [categorias, ganhadores]);

  const lista = ganhadores.filter((g) => (!ano || String(g.ano) === ano) && (!categoria || g.categoria === categoria) && (!crede || g.crede === crede));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Ano
          <select value={ano} onChange={(e) => setAno(e.target.value)} className="campo font-normal">
            <option value="">Todos</option>
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="campo font-normal">
            <option value="">Todas</option>
            {listaCategorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          CREDE/SEFOR
          <select value={crede} onChange={(e) => setCrede(e.target.value)} className="campo font-normal" disabled={!listaCredes.length}>
            <option value="">Todas</option>
            {listaCredes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {lista.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((g) => (
            <li key={`${g.ano}-${g.categoria}-${g.projeto}`} className="rounded-2xl border border-cc-verde/40 bg-superficie p-4">
              <p className="text-xs font-bold text-cc-verde-forte">
                {g.ano} · {g.categoria}
                {g.colocacao ? ` · ${g.colocacao}` : ""}
              </p>
              <h3 className="mt-1 text-lg">{g.projeto}</h3>
              <p className="text-sm">
                {g.escola}, {g.crede}
                {g.municipio ? `, ${g.municipio}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-cc-verde/50 p-6 text-center" role="status">
          <p className="font-bold">{ganhadores.length ? "Nenhum projeto com esses filtros." : "Os ganhadores ainda não foram publicados aqui."}</p>
          {!ganhadores.length && <p className="mt-1 text-sm">A galeria já está pronta: assim que a COPES adicionar os projetos, eles aparecem aqui, por ano, categoria e CREDE.</p>}
        </div>
      )}
    </div>
  );
}
