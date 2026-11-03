"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Resumo } from "./tipos";
import { ROTULO_CUSTO, ROTULO_MODALIDADE, ROTULO_NIVEL, ROTULO_SERIE, ROTULO_TIPO } from "./rotulos";

export type Filtros = {
  q: string;
  area: string[];
  serie: string[];
  tipo: string[];
  nivel: string[];
  custo: string[];
  modalidade: string[];
  vaga: boolean;
  joc: boolean;
  abertas: boolean;
};

export const FILTROS_VAZIOS: Filtros = {
  q: "",
  area: [],
  serie: [],
  tipo: [],
  nivel: [],
  custo: [],
  modalidade: [],
  vaga: false,
  joc: false,
  abertas: false,
};

export const GRUPOS = ["serie", "area", "tipo", "nivel", "custo", "modalidade"] as const;
export type Grupo = (typeof GRUPOS)[number];

export const TITULO_GRUPO: Record<Grupo, string> = {
  serie: "Série",
  area: "Área",
  tipo: "Tipo",
  nivel: "Nível",
  custo: "Custo",
  modalidade: "Modalidade",
};

export const opcoesDe = (itens: Resumo[]): Record<Grupo, { valor: string; rotulo: string }[]> => ({
  serie: Object.entries(ROTULO_SERIE).map(([valor, rotulo]) => ({ valor, rotulo })),
  area: [...new Set(itens.flatMap((i) => i.areas))].sort((a, b) => a.localeCompare(b, "pt-BR")).map((a) => ({ valor: a, rotulo: a })),
  tipo: Object.entries(ROTULO_TIPO)
    .filter(([v]) => itens.some((i) => i.tipo === v))
    .map(([valor, rotulo]) => ({ valor, rotulo })),
  nivel: Object.entries(ROTULO_NIVEL)
    .filter(([v]) => itens.some((i) => i.nivel === v))
    .map(([valor, rotulo]) => ({ valor, rotulo })),
  custo: Object.entries(ROTULO_CUSTO).map(([valor, rotulo]) => ({ valor, rotulo })),
  modalidade: Object.entries(ROTULO_MODALIDADE).map(([valor, rotulo]) => ({ valor, rotulo })),
});

export const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Vários itens no mesmo grupo somam (OU). Grupos diferentes restringem (E). */
export function aplicarFiltros(itens: Resumo[], f: Filtros, aberto: (i: Resumo) => boolean) {
  const termos = normalizar(f.q).split(/\s+/).filter(Boolean);
  return itens.filter((i) => {
    if (termos.length) {
      const alvo = normalizar(`${i.nome} ${i.sigla ?? ""} ${i.areas.join(" ")} ${ROTULO_TIPO[i.tipo]} ${ROTULO_NIVEL[i.nivel]}`);
      if (!termos.every((t) => alvo.includes(t))) return false;
    }
    if (f.area.length && !i.areas.some((a) => f.area.includes(a))) return false;
    // Série não informada não esconde o item: o público pode incluir o estudante.
    if (f.serie.length && i.series.length && !i.series.some((s) => f.serie.includes(s))) return false;
    if (f.tipo.length && !f.tipo.includes(i.tipo)) return false;
    if (f.nivel.length && !f.nivel.includes(i.nivel)) return false;
    if (f.custo.length && (!i.custo || !f.custo.includes(i.custo))) return false;
    if (f.modalidade.length && (!i.modalidade || !f.modalidade.includes(i.modalidade))) return false;
    if (f.vaga && !i.vagaOlimpica) return false;
    if (f.joc && !i.financiavelJOC) return false;
    if (f.abertas && !aberto(i)) return false;
    return true;
  });
}

export const contarFiltros = (f: Filtros) =>
  GRUPOS.reduce((n, g) => n + f[g].length, 0) + Number(f.vaga) + Number(f.joc) + Number(f.abertas);

function lerDaUrl(): Filtros {
  const p = new URLSearchParams(window.location.search);
  const lista = (k: string) => p.get(k)?.split(",").filter(Boolean) ?? [];
  return {
    q: p.get("q") ?? "",
    area: lista("area"),
    serie: lista("serie"),
    tipo: lista("tipo"),
    nivel: lista("nivel"),
    custo: lista("custo"),
    modalidade: lista("modalidade"),
    vaga: p.get("vaga") === "1",
    joc: p.get("joc") === "1",
    abertas: p.get("abertas") === "1",
  };
}

/** Filtros guardados na URL: copiou o link, levou a busca junto (bom para o WhatsApp). */
export function useFiltros() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setFiltros(lerDaUrl());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    const p = new URLSearchParams(window.location.search);
    const definir = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k));
    definir("q", filtros.q);
    GRUPOS.forEach((g) => definir(g, filtros[g].join(",")));
    definir("vaga", filtros.vaga ? "1" : "");
    definir("joc", filtros.joc ? "1" : "");
    definir("abertas", filtros.abertas ? "1" : "");
    const qs = p.toString().replace(/%2C/g, ",");
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [filtros, pronto]);

  const alternar = useCallback((g: Grupo, valor: string) => {
    setFiltros((f) => ({ ...f, [g]: f[g].includes(valor) ? f[g].filter((v) => v !== valor) : [...f[g], valor] }));
  }, []);

  const limpar = useCallback(() => setFiltros((f) => ({ ...FILTROS_VAZIOS, q: f.q })), []);

  return useMemo(() => ({ filtros, setFiltros, alternar, limpar }), [filtros, alternar, limpar]);
}
