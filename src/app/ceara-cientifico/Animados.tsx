"use client";

import { m } from "framer-motion";
import { Contador } from "@/components/Contador";
import type { CearaCientifico } from "@/lib/schema";

const NOS: [number, number, number][] = [
  [58, 66, 22], [132, 34, 12], [168, 112, 30], [92, 170, 20], [214, 40, 14], [264, 92, 20],
  [236, 176, 25], [316, 148, 15], [160, 232, 24], [296, 232, 30], [362, 72, 12], [384, 206, 16],
];
const LIGACOES: [number, number][] = [
  [0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [5, 7], [3, 8], [6, 8], [6, 9], [7, 9], [5, 10], [9, 11],
];

/** Rede de moléculas, da família do logo: as ligações se desenham e os átomos acendem. */
export function Molecula({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 270" aria-hidden="true" className={className}>
      {LIGACOES.map(([a, b], i) => (
        <m.line key={i} x1={NOS[a][0]} y1={NOS[a][1]} x2={NOS[b][0]} y2={NOS[b][1]} stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeOut" }} />
      ))}
      {NOS.map(([x, y, r], i) => (
        <m.circle key={i} cx={x} cy={y} r={r} fill={i % 4 === 2 ? "var(--cc-laranja)" : "currentColor"} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: `${x}px ${y}px` }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.25 + i * 0.05 }} />
      ))}
    </svg>
  );
}

export function EtapasAnimadas({ etapas }: { etapas: CearaCientifico["etapas"] }) {
  return (
    <ol className="grid md:grid-cols-3">
      {etapas.map((e, i) => (
        <li key={e.nome} className={`relative border-t-[3px] border-[#0e3a23] py-3 md:pr-6 ${i ? "" : ""}`}>
          <m.span aria-hidden="true" className="absolute -top-[3px] left-0 h-[3px] w-full origin-left bg-cc-laranja" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.25, ease: [0.2, 0.8, 0.2, 1] }} />
          <span className="estreito num block text-[5rem] font-bold leading-[0.9]">{i + 1}</span>
          <span className="estreito mt-1 block text-[1.75rem] font-bold leading-none">{e.nome}</span>
          <span className="mt-1.5 block text-[0.9375rem]">{e.texto}</span>
        </li>
      ))}
    </ol>
  );
}

export function NumeroCC({ valor, rotulo, prefixo }: { valor: number; rotulo: string; prefixo?: string }) {
  return (
    <div className="border-t border-[#0e3a23]/30 py-3">
      <dd className="estreito text-[3.5rem] font-bold leading-none sm:text-7xl">
        {prefixo}
        <Contador valor={valor} />
      </dd>
      <dt className="mt-1 text-[0.9375rem]">{rotulo}</dt>
    </div>
  );
}
