"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { urlAbsoluta } from "@/lib/base";
import { linkWhatsApp } from "@/lib/ics";
import type { Jogo } from "@/lib/jogos";

const chave = (s: string) => `radar-jogo-${s}`;

function lerRecorde(s: string) {
  try {
    return Number(localStorage.getItem(chave(s))) || 0;
  } catch {
    return 0;
  }
}

export type AoTerminar = (pontos: number, resumo: string) => void;

/** Tudo que é comum aos jogos: abertura, palco, resultado e recorde. O jogo em si vem por render prop. */
export function Molde({ jogo, nomeFicha, slugFicha, children }: { jogo: Jogo; nomeFicha: string; slugFicha: string; children: (fim: AoTerminar) => ReactNode }) {
  const [fase, setFase] = useState<"inicio" | "jogo" | "fim">("inicio");
  const [partida, setPartida] = useState(0);
  const [placar, setPlacar] = useState({ pontos: 0, resumo: "", novoRecorde: false });
  const [recorde, setRecorde] = useState(0);

  useEffect(() => setRecorde(lerRecorde(jogo.slug)), [jogo.slug]);

  const terminar = useCallback<AoTerminar>(
    (pontos, resumo) => {
      const atual = lerRecorde(jogo.slug);
      const novoRecorde = pontos > atual;
      if (novoRecorde) {
        try {
          localStorage.setItem(chave(jogo.slug), String(pontos));
        } catch {
          /* sem armazenamento, o recorde vale só nesta visita */
        }
        setRecorde(pontos);
      }
      setPlacar({ pontos, resumo, novoRecorde });
      setFase("fim");
    },
    [jogo.slug],
  );

  const jogar = () => {
    setPartida((p) => p + 1);
    setFase("jogo");
  };

  const url = urlAbsoluta(`/jogos/${jogo.slug}/`);

  return (
    <div className="palco -mx-4 flex min-h-[32rem] flex-col sm:mx-0">
      {fase === "inicio" && (
        <div className="entrada-seq flex flex-1 flex-col justify-end gap-4 p-5 sm:p-8">
          <p className="max-w-lg text-[1.0625rem]">{jogo.como}</p>
          {recorde > 0 && <p className="num text-sm text-tinta-2">Seu recorde: {recorde.toLocaleString("pt-BR")}</p>}
          <button type="button" onClick={jogar} className="btn btn-marca self-start text-lg">
            Jogar
            <Seta />
          </button>
        </div>
      )}
      {fase === "jogo" && <div className="flex flex-1 flex-col" key={partida}>{children(terminar)}</div>}
      {fase === "fim" && (
        <div className="entrada-seq flex flex-1 flex-col justify-end gap-4 p-5 sm:p-8">
          {placar.novoRecorde && <p className="text-[0.9375rem] font-semibold text-marca">Novo recorde</p>}
          <p className="estreito num text-[clamp(5rem,22vw,9rem)] font-bold leading-[0.85]">{placar.pontos.toLocaleString("pt-BR")}</p>
          <p className="max-w-lg text-[1.0625rem]">{placar.resumo}</p>
          <div className="grid gap-2 sm:flex">
            <button type="button" onClick={jogar} className="btn btn-marca">
              Jogar de novo
            </button>
            <Link href={`/oportunidade/${slugFicha}/`} className="btn border-[1.5px] border-[#f3f3ef] hover:bg-[#f3f3ef] hover:text-[#111210]">
              Conhecer {nomeFicha}
              <Seta />
            </Link>
            <a href={linkWhatsApp(`Fiz ${placar.pontos} pontos em ${jogo.titulo}, no Radar Olímpico. Tenta aí: ${url}`)} target="_blank" rel="noopener noreferrer" className="btn border-[1.5px] border-[#4a4b45] hover:border-[#f3f3ef]">
              Desafiar pelo WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/** Faixa superior dos jogos: progresso e pontos. */
export function Placar({ esquerda, direita }: { esquerda: ReactNode; direita: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#33342f] px-4 py-3 sm:px-6">
      <span className="text-[0.9375rem] text-[#a5a79f]">{esquerda}</span>
      <span className="estreito num text-[1.75rem] font-bold leading-none">{direita}</span>
    </div>
  );
}
