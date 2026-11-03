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
    return () => c.stop();
  }, [visivel, valor, reduzir]);

  return <span ref={ref}>{atual}</span>;
}
