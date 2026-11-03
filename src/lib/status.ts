"use client";

import { useSyncExternalStore } from "react";

export type Status =
  | { tipo: "aberto"; rotulo: string }
  | { tipo: "fecha"; rotulo: string; dias: number }
  | { tipo: "breve"; rotulo: string }
  | { tipo: "encerrado"; rotulo: string }
  | { tipo: "confirmar"; rotulo: string };

const DATA_BUILD = process.env.NEXT_PUBLIC_DATA_BUILD ?? "2026-01-01";

/** Data de hoje no Ceará (UTC-3). "?hoje=2026-09-01" na URL simula outra data, para a equipe testar. */
function calcularHoje() {
  try {
    const simulada = new URLSearchParams(window.location.search).get("hoje");
    if (simulada && /^\d{4}-\d{2}-\d{2}$/.test(simulada)) return simulada;
  } catch {
    /* segue com a data real */
  }
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(new Date());
}

let cache: string | null = null;
const instantaneo = () => (cache ??= calcularHoje());
const nada = () => () => {};

/** No HTML estático vale a data do build; ao abrir no aparelho, o status é recalculado para hoje. */
export const useHoje = () => useSyncExternalStore(nada, instantaneo, () => DATA_BUILD);

export function diasEntre(de: string, ate: string) {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);
}

export function calcularStatus(inscricoes: { inicio: string | null; fim: string | null }, hoje: string): Status {
  const { inicio, fim } = inscricoes;
  if (inicio && inicio > hoje) return { tipo: "breve", rotulo: "Abre em breve" };
  if (!fim) return inicio ? { tipo: "aberto", rotulo: "Aberto" } : { tipo: "confirmar", rotulo: "Datas a confirmar" };
  if (fim < hoje) return { tipo: "encerrado", rotulo: "Encerrado" };
  const dias = diasEntre(hoje, fim);
  if (dias === 0) return { tipo: "fecha", rotulo: "Fecha hoje", dias };
  if (dias === 1) return { tipo: "fecha", rotulo: "Fecha amanhã", dias };
  if (dias <= 30) return { tipo: "fecha", rotulo: `Fecha em ${dias} dias`, dias };
  return { tipo: "aberto", rotulo: "Aberto" };
}

export const estaAberto = (s: Status) => s.tipo === "aberto" || s.tipo === "fecha";

const PESO = { fecha: 0, aberto: 1, breve: 2, confirmar: 3, encerrado: 4 } as const;

/** Ordem por prazo: o que fecha primeiro, depois abertos, em breve, sem data e encerrados. */
export function compararPrazo<T extends { inicio: string | null; fim: string | null; nome: string; temFicha?: boolean }>(a: T, b: T, hoje: string) {
  const sa = calcularStatus(a, hoje);
  const sb = calcularStatus(b, hoje);
  if (PESO[sa.tipo] !== PESO[sb.tipo]) return PESO[sa.tipo] - PESO[sb.tipo];
  if (sa.tipo === "encerrado") return (b.fim ?? "").localeCompare(a.fim ?? "");
  // Sem data: quem tem ficha completa vem antes dos itens só listados.
  if (sa.tipo === "confirmar" && !!a.temFicha !== !!b.temFicha) return a.temFicha ? -1 : 1;
  return (a.fim ?? "9").localeCompare(b.fim ?? "9") || a.nome.localeCompare(b.nome, "pt-BR");
}
