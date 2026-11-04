"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Molde } from "@/components/jogos/Molde";
import type { DadoEscada } from "@/components/jogos/EscadaJogo";
import type { Jogo } from "@/lib/jogos";

// Cada jogo é um arquivo separado: quem não joga não baixa nenhum deles.
const Carregando = () => <p className="p-5 text-[0.9375rem] text-[#a5a79f]">Carregando</p>;
const JOGOS_MAPA: Record<string, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentType<any>> = {
  alvo: dynamic(() => import("@/components/jogos/Alvo"), { ssr: false, loading: Carregando }),
  lancamento: dynamic(() => import("@/components/jogos/Lancamento"), { ssr: false, loading: Carregando }),
  algoritmo: dynamic(() => import("@/components/jogos/Algoritmo"), { ssr: false, loading: Carregando }),
  "linha-do-tempo": dynamic(() => import("@/components/jogos/LinhaDoTempo"), { ssr: false, loading: Carregando }),
  balanco: dynamic(() => import("@/components/jogos/Balanco"), { ssr: false, loading: Carregando }),
  "jornada-cientifica": dynamic(() => import("@/components/jogos/Jornada"), { ssr: false, loading: Carregando }),
  escada: dynamic(() => import("@/components/jogos/EscadaJogo"), { ssr: false, loading: Carregando }),
  "arquivo-perdido": dynamic(() => import("@/components/jogos/ArquivoPerdido"), { ssr: false, loading: Carregando }),
  crononauta: dynamic(() => import("@/components/jogos/Crononauta"), { ssr: false, loading: Carregando }),
  "lingua-galactica": dynamic(() => import("@/components/jogos/LinguaGalactica"), { ssr: false, loading: Carregando }),
  "orbita-numerica": dynamic(() => import("@/components/jogos/OrbitaNumerica"), { ssr: false, loading: Carregando }),
};

export function JogoCliente({ jogo, nomeFicha, slugFicha, dados }: { jogo: Jogo; nomeFicha: string; slugFicha: string; dados: DadoEscada[] }) {
  const Componente = JOGOS_MAPA[jogo.slug];
  return <Molde jogo={jogo} nomeFicha={nomeFicha} slugFicha={slugFicha}>{(fim) => <Componente aoTerminar={fim} dados={dados} />}</Molde>;
}
