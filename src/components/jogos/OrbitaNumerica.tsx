"use client";

import { useEffect, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import { sementeira } from "@/lib/estudo/orbita";
import { Placar, type AoTerminar } from "./Molde";
import { criarMotor, type Painel, type Tela } from "./orbitaMotor";

const ALTOS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
/** Leitor de tela não lê expoente pequeno direito: 2⁵ vira "2 elevado a 5". */
const paraLeitor = (s: string) => s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => ` elevado a ${[...m].map((c) => ALTOS.indexOf(c)).join("")}`);

const INICIAL: Tela = { rotulo: "Fase 1", pontos: 0, questao: null, aviso: "", tom: "neutro", painel: null };

export default function OrbitaNumerica({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const raiz = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const motor = useRef<ReturnType<typeof criarMotor> | null>(null);
  const fim = useRef(aoTerminar);
  const [ui, setUi] = useState<Tela>(INICIAL);

  useEffect(() => {
    fim.current = aoTerminar;
  }, [aoTerminar]);

  useEffect(() => {
    // ?semente=123 repete a mesma sequência de contas, como ?hoje= simula outra data nas páginas do Radar.
    const pedida = Number(new URLSearchParams(window.location.search).get("semente"));
    const m = criarMotor(canvas.current!, tela.current!, {
      sorteio: sementeira(pedida || (Date.now() ^ (Math.random() * 1e9))),
      aoMudar: (t) => setUi((u) => ({ ...u, ...t })),
      aoFim: (p, r) => fim.current(p, r),
    });
    motor.current = m;
    m.iniciar();
    // No celular o jogo cobre a tela. No computador, fica inteiro à vista dentro da página.
    document.documentElement.classList.add("orbita-aberta");
    raiz.current?.scrollIntoView({ block: "center" });
    return () => {
      m.destruir();
      motor.current = null;
      document.documentElement.classList.remove("orbita-aberta");
    };
  }, []);

  const q = ui.questao;
  return (
    <div ref={raiz} className="orbita-jogo">
      <div className="orbita-lateral">
        <Placar esquerda={ui.rotulo} direita={ui.pontos.toLocaleString("pt-BR")} />
        <div className="orbita-pergunta" data-tom={q ? "neutro" : ui.tom} aria-live="polite">
          {q ? (
            <>
              <span aria-hidden="true">{q.enunciado}</span>
              <span className="sr-only">{paraLeitor(q.enunciado)}</span>
            </>
          ) : (
            <span>{ui.aviso}</span>
          )}
        </div>
        <div className="orbita-opcoes" style={{ "--n": q?.opcoes.length ?? 3, "--c": q?.opcoes.length === 3 ? 3 : 2 } as React.CSSProperties}>
          {q?.opcoes.map((o, i) => (
            <button key={`${q.enunciado}-${o}`} type="button" className="orbita-opcao" data-som="nada" disabled={!!ui.painel} aria-label={`Levar a nave até a resposta ${o}`} onClick={() => motor.current?.pilotarPara(i)}>
              <kbd>{i + 1}</kbd>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div ref={tela} className="orbita-tela">
        <canvas ref={canvas} role="img" aria-label="Espaço com a nave, as cápsulas de resposta e os asteroides. Use as setas, arraste a nave ou toque nos botões de resposta." />
        <button type="button" className="orbita-pausa" aria-label="Pausar" onClick={() => motor.current?.pausar()}>
          <svg viewBox="0 0 10 10" width="18" height="18" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />
          </svg>
        </button>
        {ui.painel && <PainelJogo painel={ui.painel} aoContinuar={() => motor.current?.continuar()} aoEncerrar={() => motor.current?.encerrar()} />}
      </div>
    </div>
  );
}

function PainelJogo({ painel, aoContinuar, aoEncerrar }: { painel: Painel; aoContinuar: () => void; aoEncerrar: () => void }) {
  if (painel.tipo === "pausa") {
    return (
      <div className="orbita-painel">
        <h2>Jogo pausado</h2>
        <Fala texto="Pode respirar. A nave espera aqui." pose="parado" tamanho={56} />
        <div className="orbita-painel-acoes">
          <button type="button" autoFocus onClick={aoContinuar} className="tecla tecla-acesa min-h-14 text-lg">Continuar</button>
          <button type="button" onClick={aoEncerrar} className="tecla">Encerrar a partida</button>
        </div>
      </div>
    );
  }
  if (painel.tipo === "fase") {
    return (
      <div className="orbita-painel">
        <h2>Fase {painel.numero} concluída</h2>
        <Fala
          texto={`${painel.chefe} derrotado! Você acertou ${painel.acertos} de ${painel.contas} ${painel.contas === 1 ? "conta" : "contas"}.${painel.escudoGanho ? " Ganhou um escudo de volta." : ""}${painel.proxima ? ` Agora, ${painel.proxima}.` : " A viagem chegou ao fim."}`}
          pose="comemora"
          tamanho={56}
        />
        <div className="orbita-painel-acoes">
          <button type="button" autoFocus onClick={aoContinuar} className="tecla tecla-acesa min-h-14 text-lg">{painel.proxima ? "Próxima fase" : "Ver o resultado"}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="orbita-painel">
      {painel.tipo === "erro" ? (
        <h2>
          Você pegou <span className="orbita-erro">{painel.escolhida}</span>. A certa é <span className="orbita-certa">{painel.resposta}</span>.
        </h2>
      ) : (
        <h2>
          As cápsulas passaram. A certa era <span className="orbita-certa">{painel.resposta}</span>.
        </h2>
      )}
      <Fala texto={painel.explicacao} pose="pensa" tamanho={56} />
      <div className="orbita-painel-acoes">
        <button type="button" autoFocus onClick={aoContinuar} className="tecla tecla-acesa min-h-14 text-lg">
          {painel.tipo === "erro" && painel.ultimo ? "Ver o resultado" : "Entendi, continuar"}
        </button>
      </div>
    </div>
  );
}
