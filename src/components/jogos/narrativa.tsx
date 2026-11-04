"use client";

// Peças comuns aos jogos narrativos: texto que aparece aos poucos, lista de respostas e bloco de explicação.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Fala } from "@/components/Fala";
import { tocar } from "@/lib/som";

export const menosMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resumo(t: string) {
  let v = 2166136261;
  for (const c of t) v = Math.imul(v ^ c.charCodeAt(0), 16777619);
  return v >>> 0;
}

/** Revela `total` caracteres aos poucos. Com movimento reduzido, tudo aparece de uma vez. */
export function useRevelacao(total: number, passo = 3) {
  const [n, setN] = useState(() => (menosMovimento() ? total : 0));
  useEffect(() => {
    if (n >= total) return;
    const t = setInterval(() => setN((v) => Math.min(total, v + passo)), 16);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, passo, n >= total]);
  const completar = useCallback(() => setN(total), [total]);
  return { n, completo: n >= total, completar };
}

const GLIFOS = "#%/=+*:<>~^";
const ruido = (t: string, inicio: number) => [...t].map((c, i) => (c === " " || c === "\n" ? c : GLIFOS[(i * 7 + inicio + c.charCodeAt(0)) % GLIFOS.length])).join("");

export const comprimento = (partes: string[]) => partes.reduce((a, p) => a + p.length, 0);

/**
 * Parágrafos que surgem até a posição `n`. O resto ocupa o mesmo espaço, então a tela não pula.
 * Em "ruido", o que falta aparece como dado corrompido, que vai sendo restaurado.
 */
export function TextoRevelado({ partes, n, modo = "limpo", className = "", classeParte = "" }: { partes: string[]; n: number; modo?: "limpo" | "ruido"; className?: string; classeParte?: string }) {
  let resto = n;
  return (
    <div className={className}>
      <div className="sr-only">{partes.map((p) => <p key={p}>{p}</p>)}</div>
      <div aria-hidden="true">
        {partes.map((p, i) => {
          const visivel = Math.max(0, Math.min(p.length, resto));
          resto -= p.length;
          return (
            <p key={i} className={classeParte}>
              {p.slice(0, visivel)}
              {visivel < p.length && (modo === "ruido" ? <span className="nv-ruido">{ruido(p.slice(visivel), visivel)}</span> : <span className="invisible">{p.slice(visivel)}</span>)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/** Leva o começo do jogo de volta à tela a cada troca de cena, e coloca o foco ali para quem usa teclado. */
export function useTopoDaCena<T extends HTMLElement>(chave: string): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < 56) el.scrollIntoView({ block: "start", behavior: "auto" });
    el.focus({ preventScroll: true });
  }, [chave]);
  return ref;
}

/** Traz o elemento para a tela quando ele aparece, por exemplo a explicação depois de uma resposta. */
export function useTrazerParaTela<T extends HTMLElement>(chave: unknown) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (chave === null || chave === undefined || chave === false) return;
    ref.current?.scrollIntoView({ block: "nearest", behavior: menosMovimento() ? "auto" : "smooth" });
  }, [chave]);
  return ref;
}

export type OpcaoBase = { t: string; certa?: boolean; porque: string };

/** Respostas em ordem fixa por pergunta, para a certa não ficar sempre no mesmo lugar. */
export function ListaOpcoes<O extends OpcaoBase>({ chave, opcoes, resolvida, aoResponder, cadeia }: { chave: string; opcoes: O[]; resolvida: boolean; aoResponder: (o: O) => void; cadeia?: boolean }) {
  const ordem = useMemo(() => {
    const h = resumo(chave);
    const giro = h % opcoes.length;
    const l = [...opcoes.slice(giro), ...opcoes.slice(0, giro)];
    return h & 1 ? l.reverse() : l;
  }, [chave, opcoes]);
  const [erradas, setErradas] = useState<string[]>([]);

  const tocarEm = (o: O) => {
    if (resolvida || erradas.includes(o.t)) return;
    if (!o.certa) setErradas((e) => [...e, o.t]);
    aoResponder(o);
  };

  return (
    <ul className={`nv-opcoes ${cadeia ? "nv-opcoes-cadeia" : ""}`}>
      {ordem.map((o) => {
        const errada = erradas.includes(o.t);
        const estado = errada ? "errada" : resolvida ? (o.certa ? "certa" : "apagada") : "livre";
        return (
          <li key={o.t}>
            <button type="button" className="nv-op" data-estado={estado} aria-disabled={estado !== "livre"} onClick={() => tocarEm(o)}>
              <span>{o.t}</span>
              {estado === "errada" && <small>Não é essa</small>}
              {estado === "certa" && <small>Resposta certa</small>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Mascote explicando, com a dica de estudo depois do acerto. */
export function Explicacao({ texto, certo, estudo }: { texto: string; certo: boolean; estudo?: string }) {
  const ref = useTrazerParaTela<HTMLDivElement>(texto);
  return (
    <div ref={ref} className="nv-explica">
      <Fala texto={texto} pose={certo ? "comemora" : "pensa"} tamanho={64} />
      {estudo && (
        <p className="nv-estudo">
          <strong>Para estudar.</strong> {estudo}
        </p>
      )}
    </div>
  );
}

/** Botão principal que recebe o foco ao aparecer: quem usa teclado segue com Enter. */
export function BotaoSeguir({ aoTocar, children, focar = true }: { aoTocar: () => void; children: ReactNode; focar?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focar) ref.current?.focus({ preventScroll: true });
  }, [focar]);
  return (
    <button
      ref={ref}
      type="button"
      className="tecla tecla-acesa nv-seguir"
      onClick={() => {
        tocar("passo");
        aoTocar();
      }}
    >
      {children}
    </button>
  );
}
