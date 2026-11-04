"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Fala } from "@/components/Fala";
import Link from "@/components/L";
import { BotaoSom } from "@/components/Som";
import { BotaoTelaCheia, useDestinoDoJogo } from "../TelaCheia";
import { confete } from "@/lib/guia";
import { tocar } from "@/lib/som";
import { alvosAtivos, AVISO_ESCALA, chegar, comecarMissao, CURIOSIDADES, desafioAtual, missaoAtual, MISSOES, novaPartida, passoAtual, POTENCIAL, proximoDesafio, responder, resumoFinal, tocarAlvo, type Alvo, type Partida } from "@/lib/estudo/celula";
import { Placar, type AoTerminar } from "../Molde";
import { Celula2D } from "./Celula2D";
import { CORES_ALVO, CRISTA_INICIO, FOCOS, POSICOES, POSICOES_CRISTA, POUSOS, type V3 } from "./mapa";
import type { AlvoMotor, MotorCelula } from "./motor";
import { PainelAbertura, PainelDesafio } from "./Paineis";

function temWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const FAROL = (m: string) => `farol-${m}`;
const raioDe = (a: Alvo) => (a.forma === "portal" ? 3.2 : 1.7);

/** Joystick de um dedo: para cima acelera, para os lados vira. */
function Joystick({ aoMover }: { aoMover: (x: number, y: number) => void }) {
  const caixa = useRef<HTMLDivElement>(null);
  const ponta = useRef<HTMLSpanElement>(null);
  const id = useRef<number | null>(null);
  const mover = (e: React.PointerEvent) => {
    const r = caixa.current!.getBoundingClientRect();
    const raio = r.width / 2;
    let x = (e.clientX - r.left - raio) / raio;
    let y = (e.clientY - r.top - raio) / raio;
    const d = Math.hypot(x, y);
    if (d > 1) {
      x /= d;
      y /= d;
    }
    ponta.current!.style.transform = `translate(${x * raio * 0.6}px,${y * raio * 0.6}px)`;
    aoMover(Math.abs(x) < 0.08 ? 0 : x, Math.abs(y) < 0.08 ? 0 : y);
  };
  const soltar = () => {
    id.current = null;
    ponta.current!.style.transform = "";
    aoMover(0, 0);
  };
  return (
    <div
      ref={caixa}
      className="nave-joystick"
      aria-hidden="true"
      onPointerDown={(e) => {
        id.current = e.pointerId;
        caixa.current!.setPointerCapture(e.pointerId);
        mover(e);
      }}
      onPointerMove={(e) => id.current === e.pointerId && mover(e)}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <span ref={ponta} />
    </div>
  );
}

const DEGRAUS: { rotulo: string; v: number; apos: string }[] = [
  { rotulo: "NADH", v: POTENCIAL.nadh, apos: "" },
  { rotulo: "Q", v: POTENCIAL.ubiquinona, apos: "ubiquinona" },
  { rotulo: "Cit c", v: POTENCIAL.citocromoC, apos: "citocromo" },
  { rotulo: "O₂", v: POTENCIAL.oxigenio, apos: "oxigenio" },
];

/** A escada de potenciais da missão final: mostra quanto o elétron já desceu em energia. */
function EscadaEnergia({ feitos }: { feitos: string[] }) {
  const L = 148;
  const A = 76;
  const y = (v: number) => 12 + ((v + 0.32) / 1.14) * (A - 28);
  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="nave-escada" role="img" aria-label={`Escada de potenciais. O elétron já passou por ${feitos.length} etapas.`}>
      <text x="6" y="9" className="nave-escada-t">Potencial (V)</text>
      {DEGRAUS.map((d, i) => {
        const x = 6 + i * 35;
        const aceso = i === 0 || feitos.includes(d.apos);
        return (
          <g key={d.rotulo}>
            <rect x={x} y={y(d.v)} width="30" height="4" rx="2" fill={aceso ? "#ffe07a" : "#39566a"} />
            <text x={x + 15} y={y(d.v) + 13} textAnchor="middle" className="nave-escada-t" fill={aceso ? "#fff" : "#8eb0c4"}>{d.rotulo}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function NaveCelular({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const destino = useDestinoDoJogo();
  const [montado, setMontado] = useState(false);
  const [modo, setModo] = useState<"carregando" | "3d" | "2d">("carregando");
  const [partida, setPartidaEstado] = useState<Partida>(() => novaPartida());
  const [dica, setDica] = useState(true);
  const [fala, setFala] = useState<{ t: string; n: number } | null>(null);
  const [cortina, setCortina] = useState(false);
  const [cristaPronta, setCristaPronta] = useState(false);
  const [aviso, setAviso] = useState("");

  const refPartida = useRef(partida);
  const motor = useRef<MotorCelula | null>(null);
  const palco = useRef<HTMLDivElement>(null);
  const terminou = useRef(false);
  const entrandoCrista = useRef(false);

  const mudar = useCallback((p: Partida) => {
    refPartida.current = p;
    setPartidaEstado(p);
  }, []);
  const falar = useCallback((t: string) => setFala(t ? { t, n: Date.now() } : null), []);

  const m = missaoAtual(partida);
  const naCadeia = m.id === "cadeia";
  const posDe = useCallback((id: string): V3 => (id in POSICOES_CRISTA ? POSICOES_CRISTA[id] : POSICOES[id]), []);

  // Toque em alvo: quem decide é a regra da partida; o motor só mostra o resultado.
  const aoTocar = useCallback(
    (id: string) => {
      const p = refPartida.current;
      if (p.etapa === "viagem") {
        if (id === FAROL(missaoAtual(p).id)) {
          tocar("pouso");
          motor.current?.marcar(id, "certo");
          mudar(chegar(p));
          falar("");
        }
        return;
      }
      const r = tocarAlvo(p, id);
      if (r.resultado === "ignorado") return;
      if (r.resultado === "errado") {
        tocar("erro");
        motor.current?.marcar(id, "errado");
        falar(r.mensagem);
      } else {
        tocar(r.passoCompleto ? "achou" : "acerto");
        motor.current?.marcar(id, "certo");
        if (r.mensagem) falar(r.mensagem);
        if (missaoAtual(p).id === "cadeia") {
          const de = p.feitos.length ? posDe(p.feitos[p.feitos.length - 1]) : CRISTA_INICIO.pos;
          motor.current?.ligarTrilha(de, posDe(id));
          if (id === "atp-sintase") {
            motor.current?.girarTurbinas();
            motor.current?.comemorar();
            confete(30);
          }
        }
      }
      mudar(r.partida);
    },
    [falar, mudar, posDe],
  );

  useEffect(() => {
    setMontado(true);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  // O Three.js só é baixado aqui, depois que a pessoa aperta Jogar.
  useEffect(() => {
    if (!montado) return;
    if (!temWebGL2()) {
      setModo("2d");
      return;
    }
    let cancelado = false;
    let local: MotorCelula | null = null;
    (async () => {
      try {
        const { MotorCelula: Classe } = await import("./motor");
        if (cancelado || !palco.current) return;
        const parametro = new URLSearchParams(window.location.search).get("qualidade");
        const travar = parametro !== null && /^\d$/.test(parametro) ? Number(parametro) : null;
        local = new Classe(
          palco.current,
          {
            aoTocarAlvo: (id) => aoTocar(id),
            aoPerto: (id) => {
              const c = CURIOSIDADES.find((x) => x.id === id);
              if (c && refPartida.current.etapa === "viagem") falar(c.texto);
            },
            aoQualidade: () => undefined,
            aoPerderContexto: () => {
              setAviso("A placa de vídeo do aparelho parou. Sua partida continua aqui, em 2D.");
              motor.current = null;
              setModo("2d");
            },
            aoPilotoInicio: () => tocar("lancar"),
          },
          { travarQualidade: travar },
        );
        await local.iniciar();
        if (cancelado) return;
        motor.current = local;
        setModo("3d");
      } catch {
        if (!cancelado) {
          local?.descartar();
          local = null;
          motor.current = null;
          setAviso("Este aparelho não conseguiu abrir o 3D. Os mesmos desafios seguem aqui, em 2D.");
          setModo("2d");
        }
      }
    })();
    return () => {
      cancelado = true;
      local?.descartar();
      motor.current = null;
    };
  }, [montado, aoTocar, falar]);

  // Mantém o motor em dia com a partida.
  useEffect(() => {
    const mo = motor.current;
    if (!mo || modo !== "3d" || dica) return;
    const missao = missaoAtual(partida);
    if (missao.id === "cadeia" && partida.etapa === "abertura" && !cristaPronta) {
      mo.definirAlvos([]);
      mo.definirControle(false);
      mo.painelAberto = false;
      if (entrandoCrista.current) return;
      entrandoCrista.current = true;
      setCortina(true);
      tocar("lancar");
      window.setTimeout(async () => {
        await motor.current?.entrarCrista();
        setCristaPronta(true);
        window.setTimeout(() => setCortina(false), 120);
      }, 620);
      return;
    }
    const foco = FOCOS[missao.id];
    switch (partida.etapa) {
      case "viagem": {
        const farol: AlvoMotor = { id: FAROL(missao.id), forma: "farol", cor: "#ffe07a", pos: POUSOS[missao.id], raio: 5.2 };
        mo.painelAberto = false;
        mo.soltarFoco();
        mo.definirControle(true);
        mo.definirAlvos([farol]);
        break;
      }
      case "abertura":
        mo.definirAlvos([]);
        mo.painelAberto = true;
        mo.focar(foco.c, foco.d, foco.a, foco.el);
        break;
      case "alvos": {
        const lista = alvosAtivos(partida).map<AlvoMotor>((a) => ({ id: a.id, forma: a.forma, cor: CORES_ALVO[a.cor], pos: posDe(a.id), raio: raioDe(a) }));
        mo.painelAberto = false;
        mo.soltarFoco();
        mo.definirControle(true);
        mo.definirAlvos(lista);
        break;
      }
      case "desafio":
        mo.definirAlvos([]);
        mo.painelAberto = true;
        mo.focar(foco.c, foco.d, foco.a, foco.el);
        break;
      case "fim":
        mo.painelAberto = false;
        break;
    }
  }, [partida, modo, dica, cristaPronta, posDe]);

  useEffect(() => {
    if (partida.etapa === "fim" && !terminou.current) {
      terminou.current = true;
      motor.current?.comemorar();
      window.setTimeout(() => aoTerminar(partida.pontos, resumoFinal(partida)), 900);
    }
  }, [partida.etapa, partida.m]); // eslint-disable-line react-hooks/exhaustive-deps

  // A fala some sozinha, para não cobrir a cena.
  useEffect(() => {
    if (!fala) return;
    const id = window.setTimeout(() => setFala(null), 7000);
    return () => window.clearTimeout(id);
  }, [fala]);

  const ativos = partida.etapa === "alvos" ? alvosAtivos(partida) : [];
  const etiquetas: { id: string; rotulo: string; cor: string }[] =
    partida.etapa === "viagem" ? [{ id: FAROL(m.id), rotulo: m.organela, cor: "#ffe07a" }] : ativos.map((a) => ({ id: a.id, rotulo: a.rotulo, cor: CORES_ALVO[a.cor] }));
  const destinoUnico = etiquetas.length === 1 ? etiquetas[0] : null;
  const pilotoLigado = modo === "3d" && !dica && !!destinoUnico;

  // Enter fora de um botão chama o piloto automático.
  useEffect(() => {
    if (!pilotoLigado) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || (e.target as HTMLElement).closest?.("button, a")) return;
      motor.current?.voarPara(destinoUnico!.id);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [pilotoLigado, destinoUnico]);

  const aoComecar = () => {
    mudar(comecarMissao(refPartida.current));
    falar("");
  };
  const aoResponder = (i: number) => {
    const r = responder(refPartida.current, i);
    mudar(r.partida);
    return { certa: r.certa, encerrou: r.encerrou };
  };
  const aoContinuar = () => {
    const antes = refPartida.current;
    const prox = proximoDesafio(antes);
    if (prox.m !== antes.m) {
      falar(missaoAtual(antes).fechamento);
      tocar("achou");
    }
    mudar(prox);
  };

  if (!montado) return null;

  const d = desafioAtual(partida);
  const quantos = MISSOES.length;
  const pedido = partida.etapa === "viagem" ? m.convite : partida.etapa === "alvos" ? passoAtual(partida).pedido : "";

  if (modo === "2d") {
    return createPortal(
      <div className="nave-tela nave-tela-2d">
        <Celula2D
          partida={partida}
          aviso={aviso}
          aoTocar={aoTocar}
          aoChegar={() => {
            tocar("pouso");
            mudar(chegar(refPartida.current));
            falar("");
          }}
          aoComecar={aoComecar}
          aoResponder={aoResponder}
          aoContinuar={aoContinuar}
          fala={fala?.t ?? ""}
        />
      </div>,
      destino,
    );
  }

  return createPortal(
    <div className="nave-tela">
      <div ref={palco} className="nave-palco" />

      {modo === "carregando" && (
        <div className="nave-carregando" role="status">
          <span className="nave-spinner" aria-hidden="true" />
          <p>Miniaturizando a nave</p>
          <p className="nave-pequeno">Na primeira vez, pode levar alguns segundos.</p>
        </div>
      )}

      {modo === "3d" && (
        <>
          <div className="nave-topo">
            <div className="nave-placar">
              <Placar esquerda={`Missão ${partida.m + 1} de ${quantos}`} direita={partida.pontos} />
            </div>
            <BotaoSom className="nave-botao" />
            <BotaoTelaCheia className="nave-botao" soIcone />
            <Link href="/jogos/" className="nave-botao" aria-label="Sair do jogo">
              Sair
            </Link>
          </div>

          {pedido && !dica && (
            <p key={pedido} className="nave-pedido">
              {pedido}
            </p>
          )}

          {naCadeia && cristaPronta && partida.etapa === "alvos" && <EscadaEnergia feitos={partida.feitos} />}

          {!dica && etiquetas.map((e) => (
            <button key={e.id} type="button" ref={(el) => motor.current?.registrarRotulo(e.id, el)} className="nave-rotulo" style={{ "--cor": e.cor } as React.CSSProperties} onClick={() => motor.current?.voarPara(e.id)} aria-label={`Voar até ${e.rotulo}`} data-som="nada">
              <i aria-hidden="true" />
              <span>{e.rotulo}</span>
            </button>
          ))}

          {!dica && (partida.etapa === "viagem" || partida.etapa === "alvos") && (
            <div className="nave-base">
              <Joystick aoMover={(x, y) => motor.current?.joystick(x, y)} />
              <p className="nave-teclas" aria-hidden="true">
                <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> pilotar. <kbd>Q</kbd><kbd>E</kbd> subir e descer.
              </p>
              {destinoUnico && (
                <button type="button" className="nave-piloto" onClick={() => motor.current?.voarPara(destinoUnico.id)}>
                  Piloto automático
                </button>
              )}
            </div>
          )}

          {fala && !dica && (partida.etapa === "viagem" || partida.etapa === "alvos") && (
            <div className="nave-fala" key={fala.n}>
              <Fala texto={fala.t} pose="aponta" tamanho={48} />
            </div>
          )}

          {!dica && partida.etapa === "abertura" && (!naCadeia || cristaPronta) && !cortina && <PainelAbertura key={m.id} m={m} indice={partida.m} total={quantos} aoComecar={aoComecar} />}

          {!dica && partida.etapa === "desafio" && d && (
            <PainelDesafio key={d.id} d={d} indice={partida.d} total={partida.desafios[partida.m].length} aoResponder={aoResponder} aoContinuar={aoContinuar} />
          )}

          {dica && (
            <div className="nave-dica" role="dialog" aria-label="Como pilotar">
              <p className="nave-sobre">Nave Celular</p>
              <h2 className="nave-titulo">Você cabe dentro de uma célula</h2>
              <ul>
                <li className="nave-so-toque"><b>Círculo:</b> empurre para cima para acelerar, e para os lados para virar.</li>
                <li className="nave-so-teclado"><b>Teclado:</b> W, A, S e D ou as setas para pilotar. Q e E sobem e descem.</li>
                <li><b>Etiquetas:</b> toque em uma e a nave voa sozinha até lá.</li>
                <li><b>Arrastar a tela:</b> olha para os lados.</li>
              </ul>
              <p className="nave-pequeno">{AVISO_ESCALA}</p>
              <button type="button" className="nave-acao" onClick={() => setDica(false)} data-som="virar" autoFocus>
                Entendi, ligar os motores
              </button>
            </div>
          )}
        </>
      )}

      <div className={`nave-cortina ${cortina ? "nave-cortina-on" : ""}`} aria-hidden="true" />
    </div>,
    destino,
  );
}
