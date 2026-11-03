"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Número que sobe até o valor. O HTML já traz o valor certo, e uma garantia evita parar no meio. */
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
    const c = animate(0, valor, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setAtual(Math.round(v)) });
    const garantia = setTimeout(() => {
      c.stop();
      setAtual(valor);
    }, 1200);
    return () => {
      c.stop();
      clearTimeout(garantia);
    };
  }, [visivel, valor, reduzir]);

  return (
    <span ref={ref} className="num">
      {atual.toLocaleString("pt-BR")}
    </span>
  );
}
