"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Número que sobe até o valor. O HTML estático já traz o valor certo, para funcionar sem JavaScript. */
export function Contador({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true });
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(valor);

  useEffect(() => {
    if (!visivel || reduzir || valor === 0) {
      setAtual(valor);
      return;
    }
    const c = animate(0, valor, { duration: 0.8, ease: "easeOut", onUpdate: (v) => setAtual(Math.round(v)) });
    // Garante o número certo mesmo se o navegador pausar a animação.
    const garantia = setTimeout(() => {
      c.stop();
      setAtual(valor);
    }, 1200);
    return () => {
      c.stop();
      clearTimeout(garantia);
    };
  }, [visivel, valor, reduzir]);

  return <span ref={ref}>{atual}</span>;
}
