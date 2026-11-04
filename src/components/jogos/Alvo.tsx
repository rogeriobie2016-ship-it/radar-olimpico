"use client";

import { tocar as som } from "@/lib/som";
import { useEffect, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import { Placar, type AoTerminar } from "./Molde";

type Peca = { id: number; v: number };
const OPS = ["+", "−", "×", "÷"] as const;
type Op = (typeof OPS)[number];
const RODADAS = 6;
const TEMPO = 150;

const sortear = (n: number) => Math.floor(Math.random() * n);

function aplicar(a: number, op: Op, b: number): number | null {
  if (op === "+") return a + b;
  if (op === "×") return a * b;
  if (op === "−") return a - b > 0 ? a - b : null;
  return b !== 0 && a % b === 0 ? a / b : null;
}

/** Sorteia as peças e monta o alvo com uma conta real, então toda rodada tem solução. */
export function gerarRodada(n: number) {
  const pequenos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const grandes = [25, 50, 75, 100];
  const qtd = n < 2 ? 4 : n < 4 ? 5 : 6;
  for (;;) {
    const pecas: number[] = n >= 2 ? [grandes[sortear(4)]] : [];
    while (pecas.length < qtd) pecas.push(pequenos[sortear(10)]);
    const pool = [...pecas].sort(() => Math.random() - 0.5);
    let atual = pool[0];
    const usadas = Math.min(pool.length, n < 2 ? 3 : n < 4 ? 4 : 5);
    let ok = true;
    for (let i = 1; i < usadas; i++) {
      const candidatas = [...OPS].sort(() => Math.random() - 0.5);
      const op = candidatas.find((o) => {
        const r = aplicar(atual, o, pool[i]);
        return r !== null && r > 1 && !(o === "×" && pool[i] === 1) && !(o === "÷" && pool[i] === 1);
      });
      if (!op) {
        ok = false;
        break;
      }
      atual = aplicar(atual, op, pool[i])!;
    }
    if (ok && atual >= 12 && atual <= (n < 2 ? 100 : 600) && !pecas.includes(atual)) return { alvo: atual, pecas };
  }
}

export default function Alvo({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const idRef = useRef(1);
  const novas = (l: number[]): Peca[] => l.map((v) => ({ id: idRef.current++, v }));
  const [rodada, setRodada] = useState(0);
  const [dados, setDados] = useState(() => gerarRodada(0));
  const [pecas, setPecas] = useState<Peca[]>(() => novas(dados.pecas));
  const [historico, setHistorico] = useState<Peca[][]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [tempo, setTempo] = useState(TEMPO);
  const [certas, setCertas] = useState(0);
  const [aviso, setAviso] = useState("");
  const [acertou, setAcertou] = useState(false);
  const terminou = useRef(false);

  const concluir = (acertos: number, resta: number) => {
    if (terminou.current) return;
    terminou.current = true;
    aoTerminar(acertos * 100 + (acertos ? resta * 2 : 0), `${acertos} de ${RODADAS} alvos. Cálculo mental é a base da OBMEP e das olimpíadas de Matemática.`);
  };

  useEffect(() => {
    const t = setInterval(() => setTempo((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (tempo <= 0) concluir(certas, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo]);

  const avancar = (acertos: number) => {
    if (rodada + 1 >= RODADAS) {
      concluir(acertos, tempo);
      return;
    }
    const d = gerarRodada(rodada + 1);
    setRodada((r) => r + 1);
    setDados(d);
    setPecas(novas(d.pecas));
    setHistorico([]);
    setSel(null);
    setOp(null);
    setAviso("");
    setAcertou(false);
  };

  const tocar = (p: Peca) => {
    if (acertou) return;
    setAviso("");
    if (sel === null || op === null) {
      setSel(sel === p.id ? null : p.id);
      return;
    }
    if (p.id === sel) return;
    const a = pecas.find((x) => x.id === sel)!;
    const r = aplicar(a.v, op, p.v);
    if (r === null) {
      setAviso(op === "÷" ? "Essa divisão não dá resultado inteiro." : "O resultado precisa ser positivo.");
      setOp(null);
      return;
    }
    const nova: Peca = { id: idRef.current++, v: r };
    setHistorico((h) => [...h, pecas]);
    setPecas([...pecas.filter((x) => x.id !== a.id && x.id !== p.id), nova]);
    setSel(nova.id);
    setOp(null);
    if (r === dados.alvo) {
      setAcertou(true);
      som("acerto");
      const novoTotal = certas + 1;
      setCertas(novoTotal);
      setTimeout(() => avancar(novoTotal), 750);
    }
  };

  const desfazer = () => {
    setHistorico((h) => {
      if (!h.length) return h;
      setPecas(h[h.length - 1]);
      return h.slice(0, -1);
    });
    setSel(null);
    setOp(null);
  };

  return (
    <>
      <Placar esquerda={`Rodada ${rodada + 1} de ${RODADAS}`} direita={`${tempo}s`} />
      <div className="h-[3px] bg-[#1f4a68]">
        <div className="h-full bg-marca transition-[width] duration-1000 ease-linear" style={{ width: `${(tempo / TEMPO) * 100}%` }} />
      </div>
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
        <div>
          <p className="text-[0.9375rem] text-[#a9c6d8]">Chegue a</p>
          <p className={`estreito num text-[6rem] font-bold leading-[0.9] transition-colors ${acertou ? "text-[#4bd68c]" : ""}`} aria-live="polite">
            {dados.alvo}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {pecas.map((p) => (
            <button key={p.id} type="button" aria-pressed={sel === p.id} onClick={() => tocar(p)} className="tecla estreito num entrada-peca min-h-[4.25rem] text-[2.25rem] font-bold">
              {p.v}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {OPS.map((o) => (
            <button key={o} type="button" aria-pressed={op === o} aria-label={{ "+": "somar", "−": "subtrair", "×": "multiplicar", "÷": "dividir" }[o]} disabled={sel === null || acertou} onClick={() => setOp(op === o ? null : o)} className="tecla text-[1.75rem] font-medium">
              {o}
            </button>
          ))}
        </div>
        <div className="min-h-[4.75rem]"><Fala texto={acertou ? "Na mosca! Próximo alvo." : aviso || "Toca num número, numa operação e em outro número."} pose={acertou ? "comemora" : aviso ? "pensa" : "aponta"} tamanho={60} /></div>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button type="button" className="tecla" onClick={desfazer} disabled={!historico.length || acertou}>Desfazer</button>
          <button type="button" className="tecla" onClick={() => avancar(certas)} disabled={acertou}>Pular rodada</button>
        </div>
      </div>
    </>
  );
}
