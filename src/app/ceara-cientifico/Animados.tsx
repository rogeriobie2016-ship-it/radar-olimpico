"use client";

import { m } from "framer-motion";
import { Contador } from "@/components/Contador";
import type { CearaCientifico } from "@/lib/schema";

// Rede de moléculas inspirada no logo: desenha as ligações e depois acende os átomos.
const NOS: [number, number, number][] = [
  [58, 66, 24], [132, 34, 13], [168, 112, 34], [92, 170, 22], [214, 40, 15], [264, 92, 22],
  [236, 176, 27], [316, 148, 16], [160, 232, 26], [296, 232, 34], [362, 72, 13], [384, 206, 18],
];
const LIGACOES: [number, number][] = [
  [0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [5, 7], [3, 8], [6, 8], [6, 9], [7, 9], [5, 10], [9, 11],
];

export function Molecula({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 270" aria-hidden="true" className={className}>
      {LIGACOES.map(([a, b], i) => (
        <m.line
          key={i}
          x1={NOS[a][0]}
          y1={NOS[a][1]}
          x2={NOS[b][0]}
          y2={NOS[b][1]}
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: "easeOut" }}
        />
      ))}
      {NOS.map(([x, y, r], i) => (
        <m.circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill={i % 4 === 2 ? "var(--cc-laranja)" : "currentColor"}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
          transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.25 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}

const TAMANHO = ["size-24", "size-28", "size-32"];

export function EtapasAnimadas({ etapas }: { etapas: CearaCientifico["etapas"] }) {
  return (
    <ol className="relative flex flex-col gap-0 md:flex-row md:items-end md:justify-between md:gap-4">
      {etapas.map((e, i) => (
        <m.li
          key={e.nome}
          className="relative flex flex-1 items-center gap-4 pb-8 last:pb-0 md:flex-col md:items-start md:pb-0"
          initial={{ y: 26 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: i * 0.18 }}
        >
          {i < etapas.length - 1 && (
            <m.span
              aria-hidden="true"
              className="absolute left-[calc(3rem-3px)] top-20 h-[calc(100%-3.5rem)] w-1.5 origin-top rounded-full bg-cc-verde md:hidden"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.18 }}
            />
          )}
          <span className={`relative z-10 grid shrink-0 place-items-center rounded-full font-cc text-3xl ${TAMANHO[i]} ${i === 2 ? "bg-cc-laranja text-[#2b1206]" : "bg-cc-verde text-white"}`}>
            {i + 1}
          </span>
          <span>
            <span className="block font-cc text-xl leading-tight">{e.nome}</span>
            <span className="mt-1 block text-sm">{e.texto}</span>
          </span>
        </m.li>
      ))}
    </ol>
  );
}

export function NumeroAtomo({ valor, rotulo, cor, prefixo }: { valor: number; rotulo: string; cor: string; prefixo?: string }) {
  return (
    <div className={`flex aspect-square flex-col items-center justify-center rounded-full p-2 text-center ${cor}`}>
      <span className="font-cc text-[1.9rem] leading-none sm:text-4xl">
        {prefixo}
        <Contador valor={valor} />
      </span>
      <span className="mt-1 text-xs font-bold leading-tight">{rotulo}</span>
    </div>
  );
}
