"use client";

import { useMemo, useState } from "react";
import type { CearaCientifico } from "@/lib/schema";

type Props = { ganhadores: CearaCientifico["ganhadores"]; areas: string[]; anos: number[] };

const unicos = <T,>(l: T[]) => [...new Set(l)];

export function Galeria({ ganhadores, areas, anos }: Props) {
  const [ano, setAno] = useState("");
  const [categoria, setCategoria] = useState("");
  const [crede, setCrede] = useState("");

  const listaCredes = useMemo(() => unicos(ganhadores.map((g) => g.crede)).sort((a, b) => a.localeCompare(b, "pt-BR")), [ganhadores]);
  const listaCategorias = useMemo(() => unicos([...areas, ...ganhadores.map((g) => g.categoria)]), [areas, ganhadores]);
  const lista = ganhadores.filter((g) => (!ano || String(g.ano) === ano) && (!categoria || g.categoria === categoria) && (!crede || g.crede === crede));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col text-[0.9375rem] font-medium">
          Ano
          <select value={ano} onChange={(e) => setAno(e.target.value)} className="campo bg-transparent">
            <option value="">Todos</option>
            {anos.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[0.9375rem] font-medium">
          Área
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="campo bg-transparent">
            <option value="">Todas</option>
            {listaCategorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex flex-col text-[0.9375rem] font-medium">
          CREDE/SEFOR
          <select value={crede} onChange={(e) => setCrede(e.target.value)} className="campo bg-transparent" disabled={!listaCredes.length}>
            <option value="">Todas</option>
            {listaCredes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      {lista.length ? (
        <ul className="border-t border-linha">
          {lista.map((g) => (
            <li key={`${g.ano}-${g.categoria}-${g.projeto}`} className="border-b border-linha py-3">
              <p className="text-sm text-tinta-2">{g.ano}, {g.categoria}{g.colocacao ? `, ${g.colocacao}` : ""}</p>
              <h3 className="mt-1">{g.projeto}</h3>
              <p className="text-[0.9375rem]">{g.escola}, {g.crede}{g.municipio ? `, ${g.municipio}` : ""}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="border-t border-linha pt-3 text-tinta-2">
          {ganhadores.length ? "Nenhum projeto com esses filtros." : "Os ganhadores ainda não foram publicados aqui. A COPES adiciona os projetos, e eles aparecem por ano, área e CREDE."}
        </p>
      )}
    </div>
  );
}
