"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ALVOS = "main section, main h2, main .azulejo, main .linha-lista, main .placa";

/**
 * Faz os elementos surgirem conforme a pessoa rola.
 * Só esconde o que está abaixo da dobra, e só depois que o JavaScript já rodou: sem JS, tudo aparece normalmente.
 */
export function RevelarRolagem() {
  const caminho = usePathname();

  useEffect(() => {
    // Jogos e o quiz têm a própria coreografia.
    const emTelaPropria = /^\/(jogos\/[^/]+|escada)/.test(caminho);
    if (emTelaPropria || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const obs = new IntersectionObserver(
      (entradas) => {
        let ordem = 0;
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          obs.unobserve(el);
          el.style.animationDelay = `${Math.min(ordem++, 6) * 70}ms`;
          el.classList.remove("surge-oculto");
          el.classList.add("surge-ver");
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );

    const q = requestAnimationFrame(() => {
      const limite = window.innerHeight;
      for (const el of document.querySelectorAll<HTMLElement>(ALVOS)) {
        if (el.closest(".entrada-seq, .rolagem-x, .surge-fora, dialog")) continue;
        if (el.getBoundingClientRect().top < limite) continue;
        el.classList.add("surge-oculto");
        obs.observe(el);
      }
    });

    return () => {
      cancelAnimationFrame(q);
      obs.disconnect();
      for (const el of document.querySelectorAll(".surge-oculto")) el.classList.remove("surge-oculto");
    };
  }, [caminho]);

  return (
    <div className="trilha-rolagem sem-print" aria-hidden="true">
      <span className="trilha-barra" />
      <svg className="trilha-foguete" viewBox="0 0 40 24" width="30" height="18">
        <path d="M2 12L10 5H26C32 5 36 8 39 12C36 16 32 19 26 19H10Z" fill="#fff" />
        <path d="M28 5.2C32 5.6 36 8 39 12C36 16 32 18.4 28 18.8Z" fill="#f58a33" />
        <circle cx="20" cy="12" r="3.6" fill="#00c9c8" />
        <path d="M12 5L6 0H14L18 5ZM12 19L6 24H14L18 19Z" fill="#f58a33" />
        <path d="M2 9L-6 12L2 15Z" fill="#fdc13f" />
      </svg>
    </div>
  );
}
