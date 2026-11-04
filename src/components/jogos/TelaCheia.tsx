"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type RefObject } from "react";

type Controle = { cheia: boolean; alternar: () => void; palco: RefObject<HTMLElement | null> | null };

const Contexto = createContext<Controle>({ cheia: false, alternar: () => {}, palco: null });

export const TelaCheiaProvider = Contexto.Provider;

/** Jogo que cobre a janela precisa ficar dentro do palco: o que está fora dele some na tela cheia. */
export function useDestinoDoJogo(): HTMLElement {
  return useContext(Contexto).palco?.current ?? document.body;
}

type ComPrefixo = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type DocumentoComPrefixo = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void };

const elementoCheio = () => document.fullscreenElement ?? (document as DocumentoComPrefixo).webkitFullscreenElement ?? null;

function sairDoNativo() {
  const d = document as DocumentoComPrefixo;
  return (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d);
}

/**
 * Tela cheia de verdade onde o navegador deixa. No iPhone, que não deixa, o jogo ocupa a janela inteira:
 * por isso a classe vale nos dois casos, e o CSS não precisa saber qual foi.
 */
export function useTelaCheiaDoPalco(palco: RefObject<HTMLElement | null>): Controle {
  const [cheia, setCheia] = useState(false);
  const nativa = useRef(false);

  useEffect(() => {
    const mudou = () => {
      if (elementoCheio()) return;
      if (nativa.current) {
        nativa.current = false;
        setCheia(false);
      }
    };
    document.addEventListener("fullscreenchange", mudou);
    document.addEventListener("webkitfullscreenchange", mudou);
    return () => {
      document.removeEventListener("fullscreenchange", mudou);
      document.removeEventListener("webkitfullscreenchange", mudou);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("jogo-tela-cheia", cheia);
    if (!cheia) return;
    // Sem o modo nativo, o navegador não cuida do Esc.
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !nativa.current) setCheia(false);
    };
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("keydown", tecla);
      document.documentElement.classList.remove("jogo-tela-cheia");
    };
  }, [cheia]);

  // Sair da página não pode deixar o navegador preso em tela cheia.
  useEffect(
    () => () => {
      if (elementoCheio()) void sairDoNativo();
    },
    [],
  );

  const alternar = useCallback(() => {
    if (cheia) {
      setCheia(false);
      nativa.current = false;
      if (elementoCheio()) void sairDoNativo();
      return;
    }
    setCheia(true);
    const el = palco.current as ComPrefixo | null;
    const pedir = el?.requestFullscreen ?? el?.webkitRequestFullscreen;
    if (!el || !pedir) return;
    nativa.current = true;
    try {
      void Promise.resolve(pedir.call(el)).catch(() => {
        nativa.current = false;
      });
    } catch {
      nativa.current = false;
    }
  }, [cheia, palco]);

  return useMemo(() => ({ cheia, alternar, palco }), [cheia, alternar, palco]);
}

/** Use dentro de um jogo que cobre a janela e esconde a barra do palco. */
export function BotaoTelaCheia({ className, soIcone = false }: { className?: string; soIcone?: boolean }) {
  const { cheia, alternar } = useContext(Contexto);
  const rotulo = cheia ? "Sair da tela cheia" : "Tela cheia";
  return (
    <button type="button" onClick={alternar} aria-pressed={cheia} aria-label={rotulo} title={rotulo} className={className}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {cheia ? <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" /> : <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />}
      </svg>
      {!soIcone && <span>{rotulo}</span>}
    </button>
  );
}
