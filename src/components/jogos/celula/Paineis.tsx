"use client";

import { useEffect, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import { tocar } from "@/lib/som";
import { type Desafio, type Missao, PONTOS } from "@/lib/estudo/celula";

/** Apresenta a missão quando a nave chega. */
export function PainelAbertura({ m, indice, total, aoComecar, lado = true }: { m: Missao; indice: number; total: number; aoComecar: () => void; lado?: boolean }) {
  const botao = useRef<HTMLButtonElement>(null);
  useEffect(() => botao.current?.focus({ preventScroll: true }), []);
  return (
    <aside className={`nave-painel ${lado ? "" : "nave-painel-fixo"}`} role="dialog" aria-label={m.titulo}>
      <p className="nave-sobre">Missão {indice + 1} de {total}. {m.organela}</p>
      <h2 className="nave-titulo">{m.titulo}</h2>
      <Fala texto={m.abertura} pose="aponta" tamanho={58} />
      <button ref={botao} type="button" onClick={aoComecar} className="nave-acao" data-som="virar">
        Começar missão
      </button>
    </aside>
  );
}

/** Desafio de múltipla escolha, com duas tentativas e a explicação no fim. */
export function PainelDesafio({ d, indice, total, aoResponder, aoContinuar, lado = true }: { d: Desafio; indice: number; total: number; aoResponder: (i: number) => { certa: boolean; encerrou: boolean }; aoContinuar: () => void; lado?: boolean }) {
  const [erradas, setErradas] = useState<number[]>([]);
  const [fim, setFim] = useState<{ certa: boolean; ponto: number } | null>(null);
  const primeira = useRef<HTMLButtonElement>(null);
  const seguir = useRef<HTMLButtonElement>(null);
  const corpo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    primeira.current?.focus({ preventScroll: true });
    corpo.current?.scrollTo?.({ top: 0 });
  }, []);
  useEffect(() => {
    if (fim) seguir.current?.focus({ preventScroll: false });
  }, [fim]);

  const escolher = (i: number) => {
    if (fim || erradas.includes(i)) return;
    const r = aoResponder(i);
    if (r.certa) {
      tocar("acerto");
      setFim({ certa: true, ponto: erradas.length ? PONTOS.desafioSegunda : PONTOS.desafio });
    } else {
      tocar("erro");
      setErradas((e) => [...e, i]);
      if (r.encerrou) setFim({ certa: false, ponto: 0 });
    }
  };

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= d.opcoes.length) escolher(n - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  const narracao = fim
    ? `${fim.certa ? `Certo, mais ${fim.ponto} pontos.` : "Essa não foi."} ${d.explicacao}`
    : erradas.length
      ? "Ainda não. Você tem mais uma tentativa: releia os dados com calma."
      : "";

  return (
    <aside className={`nave-painel ${lado ? "" : "nave-painel-fixo"}`} role="dialog" aria-label="Desafio" ref={corpo}>
      <p className="nave-sobre">
        Desafio no estilo {d.estilo === "OBB" ? "da OBB" : "da ONC"}
        {total > 1 ? `. ${indice + 1} de ${total}` : ""}
      </p>
      <h2 className="nave-pergunta">{d.enunciado}</h2>
      <div className="nave-opcoes">
        {d.opcoes.map((o, i) => {
          const errada = erradas.includes(i);
          const certa = !!fim && i === d.certa;
          return (
            <button key={o} ref={i === 0 ? primeira : undefined} type="button" onClick={() => escolher(i)} disabled={!!fim || errada} data-som="nada" className={`nave-opcao ${errada ? "nave-opcao-errada" : ""} ${certa ? "nave-opcao-certa" : ""}`}>
              <span className="nave-opcao-tecla" aria-hidden="true">{i + 1}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {narracao && <Fala texto={narracao} pose={fim ? (fim.certa ? "comemora" : "pensa") : "pensa"} tamanho={56} />}
      {fim && (
        <button ref={seguir} type="button" onClick={aoContinuar} className="nave-acao">
          Continuar
        </button>
      )}
    </aside>
  );
}
