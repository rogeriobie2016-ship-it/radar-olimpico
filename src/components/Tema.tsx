"use client";

import { useEffect, useState } from "react";

const CHAVE = "radar-tema";

/** Sol e lua. Sem escolha salva, o site acompanha o aparelho, inclusive se ele mudar com o site aberto. */
export function BotaoTema() {
  const [tema, setTema] = useState<"claro" | "escuro" | null>(null);

  useEffect(() => {
    const ler = () => setTema(document.documentElement.dataset.theme === "light" ? "claro" : "escuro");
    ler();
    const m = window.matchMedia("(prefers-color-scheme: light)");
    const mudou = (e: MediaQueryListEvent) => {
      let salvo: string | null = null;
      try {
        salvo = localStorage.getItem(CHAVE);
      } catch {
        /* sem armazenamento, segue o aparelho */
      }
      if (salvo) return;
      document.documentElement.dataset.theme = e.matches ? "light" : "dark";
      ler();
    };
    m.addEventListener("change", mudou);
    return () => m.removeEventListener("change", mudou);
  }, []);

  const alternar = () => {
    const novo = tema === "claro" ? "dark" : "light";
    document.documentElement.dataset.theme = novo;
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      /* sem armazenamento, a escolha vale só nesta visita */
    }
    setTema(novo === "light" ? "claro" : "escuro");
  };

  const claro = tema === "claro";
  return (
    <button type="button" onClick={alternar} aria-label={claro ? "Mudar para o tema escuro" : "Mudar para o tema claro"} title={claro ? "Tema escuro" : "Tema claro"} className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-fundo-2">
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {claro ? (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
          </>
        )}
      </svg>
    </button>
  );
}
