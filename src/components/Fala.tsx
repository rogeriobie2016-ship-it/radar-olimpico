"use client";

import { useEffect, useState } from "react";
import { Mascote, type Pose, type Quem } from "./Mascote";
import { useGuia } from "@/lib/guia";
import { tocar } from "@/lib/som";

/** Texto que vai aparecendo, como alguém falando. Com movimento reduzido, aparece inteiro. */
function useDigitando(texto: string, tom: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(texto.length);
      return;
    }
    setN(0);
    let batida = 0;
    const t = setInterval(() => {
      // Cada personagem tem a própria voz: uma batida curta a cada poucas letras.
      if (batida++ % 4 === 0) tocar("fala", tom);
      setN((v) => {
        if (v >= texto.length) clearInterval(t);
        return v >= texto.length ? v : v + 2;
      });
    }, 18);
    return () => clearInterval(t);
  }, [texto, tom]);
  return n;
}

/** Um mascote com balão de fala. É o narrador dos jogos e do quiz. */
export function Fala({ texto, pose = "parado", quem, escuro = true, tamanho = 76 }: { texto: string; pose?: Pose; quem?: Quem; escuro?: boolean; tamanho?: number }) {
  const { quem: guia } = useGuia();
  const n = useDigitando(texto, (quem ?? guia) === "menino" ? 1 : 1.4);
  if (!texto) return null;
  return (
    <div className="flex items-end gap-2" role="status">
      <Mascote quem={quem ?? guia} pose={pose} falando={n < texto.length} className="shrink-0" style={{ width: tamanho }} />
      <p className={`balao mb-3 min-w-0 flex-1 ${escuro ? "" : "balao-claro"}`}>
        <span aria-hidden="true">{texto.slice(0, n)}</span>
        <span className="sr-only">{texto}</span>
      </p>
    </div>
  );
}
