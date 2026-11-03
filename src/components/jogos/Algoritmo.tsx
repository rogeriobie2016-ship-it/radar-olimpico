"use client";

import { useEffect, useRef, useState } from "react";
import { Placar, type AoTerminar } from "./Molde";
import { executar, NIVEIS, type Bloco } from "./niveisAlgoritmo";

const NOME = { F: "Avançar", E: "Virar à esquerda", D: "Virar à direita" };
const CURTO = { F: "Avançar", E: "Esquerda", D: "Direita" };
const MAX_BLOCOS = 14;

export default function Algoritmo({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const [n, setN] = useState(0);
  const [programa, setPrograma] = useState<Bloco[]>([]);
  const [robo, setRobo] = useState({ x: NIVEIS[0].x, y: NIVEIS[0].y, dir: NIVEIS[0].dir, batida: false });
  const [rodando, setRodando] = useState(false);
  const [msg, setMsg] = useState("");
  const [pontos, setPontos] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nivel = NIVEIS[n];

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const colocarNoInicio = (i = n) => setRobo({ x: NIVEIS[i].x, y: NIVEIS[i].y, dir: NIVEIS[i].dir, batida: false });

  const adicionar = (c: Bloco["c"]) => {
    if (rodando) return;
    setMsg("");
    colocarNoInicio();
    setPrograma((p) => (p.length >= MAX_BLOCOS ? p : [...p, { c, n: 1 }]));
  };

  const repetir = (i: number) => {
    if (rodando) return;
    setPrograma((p) => p.map((b, k) => (k === i ? { ...b, n: b.n >= 5 ? 1 : b.n + 1 } : b)));
  };

  const rodar = () => {
    if (rodando || !programa.length) return;
    setRodando(true);
    setMsg("");
    const { passos, chegou } = executar(nivel, programa);
    let i = 0;
    const seguir = () => {
      setRobo(passos[i]);
      i++;
      if (i < passos.length) {
        timer.current = setTimeout(seguir, 300);
        return;
      }
      setRodando(false);
      if (chegou) {
        const extra = Math.max(0, programa.length - nivel.limite);
        const ganho = Math.max(40, 100 - extra * 15);
        const total = pontos + ganho;
        setPontos(total);
        setMsg(extra ? `Chegou, com ${programa.length} blocos. Dá para fazer em ${nivel.limite}.` : `Solução mais curta: ${nivel.limite} ${nivel.limite === 1 ? "bloco" : "blocos"}.`);
        timer.current = setTimeout(() => {
          if (n + 1 >= NIVEIS.length) {
            aoTerminar(total, "Pensar a sequência antes de executar é o centro da computação e da OBI. Na OBR, o robô é físico, e o raciocínio é o mesmo.");
            return;
          }
          setN(n + 1);
          setPrograma([]);
          colocarNoInicio(n + 1);
          setMsg("");
        }, 1300);
      } else {
        setMsg(passos[passos.length - 1].batida ? "O robô bateu. Ajuste o programa." : "O programa acabou antes do destino.");
      }
    };
    seguir();
  };

  const celula = 100 / nivel.tam;
  const paredes = new Set(nivel.paredes.map(([a, b]) => `${a},${b}`));

  return (
    <>
      <Placar esquerda={`Fase ${n + 1} de ${NIVEIS.length}, meta de ${nivel.limite} ${nivel.limite === 1 ? "bloco" : "blocos"}`} direita={pontos} />
      <div className="grid flex-1 gap-4 p-4 sm:grid-cols-[minmax(0,22rem)_1fr] sm:p-6">
        <div className="relative mx-auto aspect-square w-full max-w-[22rem] border border-[#4a4b45]" role="img" aria-label={`Grade de ${nivel.tam} por ${nivel.tam}, com o robô e o destino`}>
          {Array.from({ length: nivel.tam * nivel.tam }).map((_, i) => {
            const x = i % nivel.tam;
            const y = Math.floor(i / nivel.tam);
            return (
              <span key={i} className={`absolute border border-[#26271f] ${paredes.has(`${x},${y}`) ? "bg-[#4a4b45]" : ""}`} style={{ left: `${x * celula}%`, top: `${y * celula}%`, width: `${celula}%`, height: `${celula}%` }} />
            );
          })}
          <span className="absolute grid place-items-center bg-[#00c9c8]" style={{ left: `${nivel.ax * celula}%`, top: `${nivel.ay * celula}%`, width: `${celula}%`, height: `${celula}%` }} />
          <span
            className="absolute grid place-items-center transition-all duration-[260ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ left: `${robo.x * celula}%`, top: `${robo.y * celula}%`, width: `${celula}%`, height: `${celula}%`, transform: `rotate(${robo.dir * 90}deg)` }}
          >
            <svg viewBox="0 0 24 24" className="size-[70%]" fill={robo.batida ? "#ff8d50" : "#f58a33"} aria-hidden="true">
              <path d="M12 2 21 22 12 17 3 22z" />
            </svg>
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <ol aria-label="Programa" className="flex min-h-14 flex-wrap content-start gap-1.5 border border-[#33342f] p-2">
            {!programa.length && <li className="p-1.5 text-[0.9375rem] text-[#a5a79f]">Monte o programa com os comandos abaixo.</li>}
            {programa.map((b, i) => (
              <li key={i}>
                <button type="button" onClick={() => repetir(i)} aria-label={`${NOME[b.c]}, ${b.n} ${b.n === 1 ? "vez" : "vezes"}. Toque para repetir.`} className="tecla !min-h-10 !px-2 !py-1 text-sm">
                  {CURTO[b.c]}
                  {b.n > 1 && <strong className="ml-1 text-marca">{b.n}x</strong>}
                </button>
              </li>
            ))}
          </ol>
          <p className="text-sm text-[#a5a79f]">Toque num bloco do programa para repetir: 2x, 3x, 4x, 5x.</p>
          <div className="grid grid-cols-3 gap-2">
            {(["E", "F", "D"] as const).map((c) => (
              <button key={c} type="button" className="tecla" onClick={() => adicionar(c)} disabled={rodando}>
                {CURTO[c]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="tecla" disabled={rodando || !programa.length} onClick={() => { setPrograma((p) => p.slice(0, -1)); colocarNoInicio(); setMsg(""); }}>
              Apagar último
            </button>
            <button type="button" className="tecla" disabled={rodando || !programa.length} onClick={() => { setPrograma([]); colocarNoInicio(); setMsg(""); }}>
              Limpar
            </button>
          </div>
          <p className="min-h-6 text-[0.9375rem]" role="status">{msg}</p>
          <button type="button" className="tecla tecla-acesa mt-auto min-h-14 text-lg" onClick={rodar} disabled={rodando || !programa.length}>
            {rodando ? "Executando" : "Executar"}
          </button>
        </div>
      </div>
    </>
  );
}
