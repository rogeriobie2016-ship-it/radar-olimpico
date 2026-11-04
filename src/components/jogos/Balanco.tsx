"use client";

import { useMemo, useState } from "react";
import { Fala } from "@/components/Fala";
import { Placar, type AoTerminar } from "./Molde";

export const REACOES = [
  { nome: "Formação da água", r: ["H2", "O2"], p: ["H2O"], s: [2, 1, 2] },
  { nome: "Síntese da amônia", r: ["N2", "H2"], p: ["NH3"], s: [1, 3, 2] },
  { nome: "Queima do metano", r: ["CH4", "O2"], p: ["CO2", "H2O"], s: [1, 2, 1, 2] },
  { nome: "Sódio e água", r: ["Na", "H2O"], p: ["NaOH", "H2"], s: [2, 2, 2, 1] },
  { nome: "Decomposição do clorato", r: ["KClO3"], p: ["KCl", "O2"], s: [2, 2, 3] },
  { nome: "Ferrugem", r: ["Fe", "O2"], p: ["Fe2O3"], s: [4, 3, 2] },
  { nome: "Alumínio e ácido clorídrico", r: ["Al", "HCl"], p: ["AlCl3", "H2"], s: [2, 6, 2, 3] },
  { nome: "Queima do propano", r: ["C3H8", "O2"], p: ["CO2", "H2O"], s: [1, 5, 3, 4] },
];

export function atomos(f: string) {
  const m: Record<string, number> = {};
  for (const [, el, n] of f.matchAll(/([A-Z][a-z]?)(\d*)/g)) m[el] = (m[el] ?? 0) + (n ? +n : 1);
  return m;
}

export function contar(lista: string[], coef: number[]) {
  const t: Record<string, number> = {};
  lista.forEach((f, i) => {
    for (const [el, n] of Object.entries(atomos(f))) t[el] = (t[el] ?? 0) + n * coef[i];
  });
  return t;
}

const mdc = (a: number, b: number): number => (b ? mdc(b, a % b) : a);

function Formula({ f }: { f: string }) {
  return (
    <span>
      {f.split(/(\d+)/).map((p, i) => (/^\d+$/.test(p) ? <sub key={i} className="text-[0.65em]">{p}</sub> : <span key={i}>{p}</span>))}
    </span>
  );
}

const COR: Record<string, string> = { H: "#f4fbff", O: "#ff8d50", N: "#7fb0ff", C: "#a9c6d8", Na: "#fdc13f", K: "#c9a0ff", Cl: "#4bd68c", Fe: "#d97a4a", Al: "#47e0df" };

export default function Balanco({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const [n, setN] = useState(0);
  const reacao = REACOES[n];
  const total = reacao.r.length + reacao.p.length;
  const [coef, setCoef] = useState<number[]>(Array(total).fill(1));
  const [toques, setToques] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [certo, setCerto] = useState(false);

  const nr = reacao.r.length;
  const esq = useMemo(() => contar(reacao.r, coef.slice(0, nr)), [reacao, coef, nr]);
  const dir = useMemo(() => contar(reacao.p, coef.slice(nr)), [reacao, coef, nr]);
  const elementos = Object.keys(esq);

  const mudar = (i: number, d: number) => {
    if (certo) return;
    const novo = coef.map((c, k) => (k === i ? Math.max(1, Math.min(12, c + d)) : c));
    setCoef(novo);
    const nt = toques + 1;
    setToques(nt);
    const e = contar(reacao.r, novo.slice(0, nr));
    const p = contar(reacao.p, novo.slice(nr));
    const equilibrado = Object.keys(e).every((el) => e[el] === p[el]);
    if (equilibrado && novo.reduce(mdc) === 1) {
      const minimo = reacao.s.reduce((s, c) => s + c - 1, 0);
      const ganho = Math.max(30, 100 - Math.max(0, nt - minimo) * 8);
      const soma = pontos + ganho;
      setPontos(soma);
      setCerto(true);
      setTimeout(() => {
        if (n + 1 >= REACOES.length) {
          aoTerminar(soma, "Nada se perde: o número de átomos de cada elemento é o mesmo antes e depois da reação. Essa ideia está em todas as olimpíadas de Química.");
          return;
        }
        const prox = REACOES[n + 1];
        setN(n + 1);
        setCoef(Array(prox.r.length + prox.p.length).fill(1));
        setToques(0);
        setCerto(false);
      }, 1200);
    }
  };

  const Substancia = ({ f, i }: { f: string; i: number }) => (
    <div className="flex flex-col items-center gap-1">
      <button type="button" className="tecla !min-h-11 w-14 text-xl" onClick={() => mudar(i, 1)} disabled={certo} aria-label={`Aumentar coeficiente de ${f}`}>+</button>
      <div className="estreito flex items-baseline gap-1 py-1 text-[1.75rem] font-bold leading-none">
        <span className="num text-marca">{coef[i]}</span>
        <Formula f={f} />
      </div>
      <button type="button" className="tecla !min-h-11 w-14 text-xl" onClick={() => mudar(i, -1)} disabled={certo || coef[i] === 1} aria-label={`Diminuir coeficiente de ${f}`}>−</button>
    </div>
  );

  return (
    <>
      <Placar esquerda={`Reação ${n + 1} de ${REACOES.length}`} direita={pontos} />
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
        <p className="estreito text-[1.875rem] font-bold leading-none">{reacao.nome}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {reacao.r.map((f, i) => (
            <div key={f} className="contents">
              {i > 0 && <span className="text-2xl text-[#a9c6d8]">+</span>}
              <Substancia f={f} i={i} />
            </div>
          ))}
          <span className="px-1 text-2xl text-[#a9c6d8]" aria-label="produz">→</span>
          {reacao.p.map((f, i) => (
            <div key={f} className="contents">
              {i > 0 && <span className="text-2xl text-[#a9c6d8]">+</span>}
              <Substancia f={f} i={nr + i} />
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2" aria-live="polite">
          <div className="grid grid-cols-[1fr_2.5rem_1fr] text-sm text-[#a9c6d8]">
            <span>Reagentes</span>
            <span />
            <span className="text-right">Produtos</span>
          </div>
          {elementos.map((el) => {
            const a = esq[el] ?? 0;
            const b = dir[el] ?? 0;
            const igual = a === b;
            const quadro = (q: number, sentido: string) => (
              <span className={`flex flex-wrap gap-[3px] ${sentido}`}>
                {Array.from({ length: q }).map((_, k) => (
                  <span key={k} className="size-2.5" style={{ background: COR[el] ?? "#f4fbff" }} />
                ))}
              </span>
            );
            return (
              <div key={el} className="grid grid-cols-[1fr_2.5rem_1fr] items-center gap-1 border-t border-[#1f4a68] py-1.5">
                <span className="flex items-center justify-end gap-2">
                  {quadro(a, "justify-end")}
                  <span className="num w-5 text-right font-semibold">{a}</span>
                </span>
                <span className={`estreito text-center text-lg font-bold ${igual ? "text-[#4bd68c]" : ""}`}>{el}</span>
                <span className="flex items-center gap-2">
                  <span className="num w-5 font-semibold">{b}</span>
                  {quadro(b, "")}
                </span>
              </div>
            );
          })}
          <Fala texto={certo ? "Equilibrada! Nada se perde." : "Os dois lados precisam ter os mesmos átomos."} pose={certo ? "comemora" : "tubo"} tamanho={54} />
        </div>
      </div>
    </>
  );
}
