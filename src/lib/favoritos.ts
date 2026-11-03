"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHAVE = "radar-minha-lista";
const VAZIO: string[] = [];
let cache: string[] | null = null;
const ouvintes = new Set<() => void>();

// Armazenamento pode falhar (aba anônima, navegador sem permissão): nesse caso a lista vale só nesta visita.
function ler(): string[] {
  if (cache) return cache;
  try {
    const bruto = localStorage.getItem(CHAVE);
    const lista = bruto ? JSON.parse(bruto) : [];
    cache = Array.isArray(lista) ? lista.filter((v) => typeof v === "string") : [];
  } catch {
    cache = [];
  }
  return cache as string[];
}

function gravar(lista: string[]) {
  cache = lista;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* segue só em memória */
  }
  ouvintes.forEach((o) => o());
}

const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  const aoMudar = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      cache = null;
      fn();
    }
  };
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(fn);
    window.removeEventListener("storage", aoMudar);
  };
};

export function useFavoritos() {
  const lista = useSyncExternalStore(inscrever, ler, () => VAZIO);
  const alternar = useCallback((id: string) => {
    const atual = ler();
    gravar(atual.includes(id) ? atual.filter((v) => v !== id) : [...atual, id]);
  }, []);
  return { lista, alternar };
}
