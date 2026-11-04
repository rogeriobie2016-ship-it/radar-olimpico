"use client";

import { useEffect } from "react";
import { destravarSom, tocar, useSom, type NomeSom } from "@/lib/som";

/** Libera o áudio no primeiro gesto e dá um som discreto a tudo que é tocável. Use data-som para trocar ou calar ("nada"). */
export function SomGlobal() {
  useEffect(() => {
    const gesto = () => destravarSom();
    const clique = (e: MouseEvent) => {
      const alvo = (e.target as Element | null)?.closest<HTMLElement>("a, button, summary, label, [role=button]");
      if (!alvo || (alvo as HTMLButtonElement).disabled) return;
      const pedido = alvo.dataset.som;
      if (pedido === "nada") return;
      tocar((pedido as NomeSom) || "toque");
    };
    window.addEventListener("pointerdown", gesto, { passive: true });
    window.addEventListener("keydown", gesto);
    document.addEventListener("click", clique);
    return () => {
      window.removeEventListener("pointerdown", gesto);
      window.removeEventListener("keydown", gesto);
      document.removeEventListener("click", clique);
    };
  }, []);
  return null;
}

/** Botão de ligar e desligar o som, sempre à vista. */
export function BotaoSom({ className = "" }: { className?: string }) {
  const { ligado, alternar } = useSom();
  return (
    <button type="button" onClick={alternar} aria-pressed={ligado} aria-label={ligado ? "Desligar os sons do site" : "Ligar os sons do site"} title={ligado ? "Desligar som" : "Ligar som"} data-som="nada" className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-fundo-2 ${className}`}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" />
        {ligado ? (
          <>
            <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
            <path d="M18 6.5a7.8 7.8 0 0 1 0 11" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
    </button>
  );
}
