"use client";

// Guia escolhido pela pessoa e Passaporte Científico. Tudo fica só neste aparelho, sem login.
import { useCallback, useSyncExternalStore } from "react";
import { tocar } from "@/lib/som";
import type { Quem } from "@/components/Mascote";

const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((o) => o());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
};

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}
function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento, vale só nesta visita */
  }
}

let guiaAtual: Quem | null = null;
const lerGuia = () => (guiaAtual ??= ler<Quem>("radar-guia", "menina"));

export function useGuia() {
  const quem = useSyncExternalStore(inscrever, lerGuia, () => "menina" as Quem);
  const escolher = useCallback((q: Quem) => {
    guiaAtual = q;
    gravar("radar-guia", q);
    avisar();
  }, []);
  return { quem, escolher, outro: (quem === "menina" ? "menino" : "menina") as Quem };
}

export type Carimbo = { id: string; titulo: string; como: string; cor: string };

export const CARIMBOS: Carimbo[] = [
  { id: "lupa", titulo: "Olho de cientista", como: "Encontre todas as olimpíadas escondidas com a lupa", cor: "#fdc13f" },
  { id: "escada", titulo: "Escada montada", como: "Termine a Escada Olímpica", cor: "#f58a33" },
  { id: "lista", titulo: "Primeira escolha", como: "Salve uma oportunidade", cor: "#00c9c8" },
  { id: "jornada-cientifica", titulo: "Pesquisa aprovada", como: "Jogue a Jornada Científica", cor: "#2e8f54" },
  { id: "jogo-escada", titulo: "Alpinista", como: "Jogue a Escada", cor: "#7fb0ff" },
  { id: "alvo", titulo: "Mente rápida", como: "Jogue Alvo", cor: "#f58a33" },
  { id: "lancamento", titulo: "Rumo às estrelas", como: "Jogue Lançamento", cor: "#c9a0ff" },
  { id: "algoritmo", titulo: "Código no ponto", como: "Jogue Algoritmo", cor: "#47e0df" },
  { id: "linha-do-tempo", titulo: "Viajante do tempo", como: "Jogue Linha do Tempo", cor: "#fdc13f" },
  { id: "balanco", titulo: "Nada se perde", como: "Jogue Balanço", cor: "#f8a8c8" },
  { id: "laboratorio", titulo: "Laboratório completo", como: "Use todos os equipamentos do Laboratório Vivo", cor: "#3ee8e6" },
];

let carimbosAtuais: string[] | null = null;
const lerCarimbos = () => (carimbosAtuais ??= ler<string[]>("radar-carimbos", []));
const VAZIO: string[] = [];

export const useCarimbos = () => useSyncExternalStore(inscrever, lerCarimbos, () => VAZIO);

/** Dá um carimbo uma única vez, e anuncia para a tela comemorar. */
export function carimbar(id: string) {
  const atual = lerCarimbos();
  if (atual.includes(id)) return;
  carimbosAtuais = [...atual, id];
  gravar("radar-carimbos", carimbosAtuais);
  avisar();
  window.dispatchEvent(new CustomEvent("radar-carimbo", { detail: id }));
}

/** Confete leve: poucos elementos, só com CSS, e nada se a pessoa pediu menos movimento. */
export function confete(quantos = 42) {
  tocar("festa");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cores = ["#f58a33", "#00c9c8", "#fdc13f", "#f8a8c8", "#ffffff", "#0fa85a"];
  const caixa = document.createElement("div");
  caixa.setAttribute("aria-hidden", "true");
  caixa.className = "confete";
  for (let i = 0; i < quantos; i++) {
    const p = document.createElement("i");
    p.style.cssText = `left:${Math.random() * 100}%;background:${cores[i % cores.length]};--x:${(Math.random() - 0.5) * 180}px;--g:${Math.random() * 720 - 360}deg;animation-delay:${Math.random() * 180}ms;animation-duration:${1100 + Math.random() * 800}ms;border-radius:${i % 3 ? "2px" : "50%"}`;
    caixa.appendChild(p);
  }
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 2300);
}
