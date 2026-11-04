"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

function Ponta({ lado }: { lado: "esquerda" | "direita" }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={lado === "direita" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
    </svg>
  );
}

/**
 * Tudo que rola para o lado passa por aqui: setas sempre visíveis enquanto houver mais conteúdo.
 * Continua funcionando no dedo, no trackpad e no teclado.
 */
export function Carrossel({ children, rotulo, classe = "", compacto = false, role }: { children: ReactNode; rotulo: string; classe?: string; compacto?: boolean; role?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lados, setLados] = useState({ esq: false, dir: false });

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const esq = el.scrollLeft > 6;
    const dir = el.scrollLeft + el.clientWidth < el.scrollWidth - 6;
    setLados((a) => (a.esq === esq && a.dir === dir ? a : { esq, dir }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    const r = new ResizeObserver(medir);
    r.observe(el);
    const m = new MutationObserver(medir);
    m.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", medir);
      r.disconnect();
      m.disconnect();
    };
  }, [medir]);

  const andar = (s: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: s * Math.max(160, el.clientWidth * 0.8), behavior: suave ? "smooth" : "auto" });
  };

  return (
    <div className={`carrossel ${compacto ? "carrossel-compacto" : ""}`}>
      <div ref={ref} className={`carrossel-faixa ${classe}`} role={role ?? "group"} aria-label={rotulo}>
        {children}
      </div>
      <button type="button" className="carrossel-seta carrossel-esq" onClick={() => andar(-1)} disabled={!lados.esq} aria-label={`Voltar: ${rotulo}`} data-som="virar">
        <Ponta lado="esquerda" />
      </button>
      <button type="button" className={`carrossel-seta carrossel-dir ${lados.dir ? "carrossel-chama" : ""}`} onClick={() => andar(1)} disabled={!lados.dir} aria-label={`Ver mais: ${rotulo}`} data-som="virar">
        <Ponta lado="direita" />
      </button>
    </div>
  );
}
