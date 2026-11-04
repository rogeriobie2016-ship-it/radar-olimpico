"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Carrossel } from "@/components/Carrossel";
import { Fala } from "@/components/Fala";
import Link from "@/components/L";
import { LogoOlimpiada } from "@/components/LogoOlimpiada";
import { Mascote, type Quem } from "@/components/Mascote";
import { BotaoSom } from "@/components/Som";
import { asset, BASE_PATH } from "@/lib/base";
import { carimbar, confete, useGuia } from "@/lib/guia";
import { COM_LOGO } from "@/lib/logos";
import { tocar } from "@/lib/som";
import { ESTACOES, type Estacao, type IdEstacao } from "./estacoes";
import { Joystick, temWebGL } from "./Joystick";
import { Experimento, type ItemInternacional } from "./Experimentos";
import type { Laboratorio } from "./motor";

export type FichaLab = { id: string; slug: string; nome: string; sigla: string | null };

const CHAVE = "radar-lab";
const lerFeitos = (): IdEstacao[] => {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
  } catch {
    return [];
  }
};

type Fase = "inicio" | "carregando" | "dentro" | "lista";

/** Painel de um equipamento: narrador, experimento e as olimpíadas daquele campo. */
function Painel({ e, fichas, internacionais, feito, controlar, aoConcluir, aoFechar, aoProximo, quem, lista }: { lista: boolean; e: Estacao; fichas: Record<string, FichaLab>; internacionais: ItemInternacional[]; feito: boolean; controlar: (nome: string, v?: unknown) => void; aoConcluir: () => void; aoFechar: () => void; aoProximo: () => void; quem: Quem }) {
  const [fala, setFala] = useState(e.convite);
  const [concluiuAgora, setConcluiuAgora] = useState(false);
  const fechar = useRef<HTMLButtonElement>(null);
  const concluir = useCallback(() => {
    setConcluiuAgora(true);
    aoConcluir();
  }, [aoConcluir]);
  useEffect(() => {
    if (concluiuAgora) setFala(e.concluido);
  }, [concluiuAgora, e.concluido]);
  useEffect(() => fechar.current?.focus(), []);
  const olimpiadas = e.olimpiadas.map((id) => fichas[id]).filter(Boolean);

  return (
    <aside role="dialog" aria-label={`${e.nome}: ${e.campo}`} className={`lab-painel ${lista ? "lab-painel-lista" : ""}`} style={{ "--cor-estacao": e.cor, "--tinta-estacao": e.tinta } as React.CSSProperties}>
      <header className="lab-painel-topo">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide opacity-85">{e.campo}</p>
          <h2 className="!text-[1.35rem] uppercase leading-none">{e.nome}</h2>
        </div>
        <button ref={fechar} type="button" onClick={aoFechar} aria-label="Voltar para o laboratório" className="lab-fechar">
          ✕
        </button>
      </header>
      <div className="lab-painel-corpo">
        <Fala texto={fala} quem={quem} pose={concluiuAgora || feito ? "comemora" : "aponta"} tamanho={58} />
        <Experimento id={e.id} controlar={controlar} concluir={concluir} falar={setFala} feito={feito || concluiuAgora} internacionais={internacionais} />

        {(concluiuAgora || feito) && (
          <button type="button" onClick={aoProximo} className="lab-acao">
            Próximo equipamento →
          </button>
        )}

        {olimpiadas.length > 0 && (
          <section className="mt-1">
            <h3 className="!text-base">Treine isso de verdade em:</h3>
            <div className="mt-1.5">
              <Carrossel rotulo={`Olimpíadas de ${e.campo}`} classe="gap-2 pb-1">
                {olimpiadas.map((o) => (
                  <Link key={o.id} href={`/oportunidade/${o.slug}/`} className="lab-olimpiada" aria-label={o.nome}>
                    <LogoOlimpiada id={o.id} nome={o.nome} sigla={o.sigla} className="h-16 w-24" />
                    <span className="line-clamp-2 text-xs font-bold leading-tight">{o.sigla && o.sigla.length <= 12 ? o.sigla : o.nome}</span>
                  </Link>
                ))}
              </Carrossel>
            </div>
          </section>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
          {e.jogo && (
            <Link href={`/jogos/${e.jogo.slug}/`} className="underline">
              Jogar {e.jogo.nome}
            </Link>
          )}
          <Link href="/escada/" className="underline">
            Descobrir as minhas olimpíadas
          </Link>
        </div>
        <p className="text-xs opacity-80">Experimento de treino do Radar Olímpico, sem vínculo com a organização das olimpíadas.</p>
      </div>
    </aside>
  );
}

/** Joystick para o polegar. */
function CartaoEstacao({ e, feito, aoAbrir }: { e: Estacao; feito: boolean; aoAbrir: () => void }) {
  return (
    <button type="button" className="lab-cartao" onClick={aoAbrir}>
      <span aria-hidden="true" className="ponto-campo" style={{ background: feito ? "#2fd27f" : e.cor }} />
      <span className="estreito leading-tight">
        {feito ? "✓ " : ""}
        {e.nome}
      </span>
      <span className="text-sm opacity-75">{e.campo}</span>
    </button>
  );
}

const ANGULO = (i: number) => (i / ESTACOES.length) * Math.PI * 2;

/** Mapa redondo: mostra onde você está e leva até o equipamento com um toque. */
function Mapa({ feitos, aoIr, jogador }: { feitos: IdEstacao[]; aoIr: (id: IdEstacao) => void; jogador: React.Ref<SVGGElement> }) {
  return (
    <svg viewBox="-27 -27 54 54" className="lab-mapa" role="group" aria-label="Mapa do laboratório">
      <circle r="25.5" fill="#071a3acc" stroke="#00c9c8" strokeWidth="1.2" />
      <circle r="4.6" fill="#fdc13f" />
      {ESTACOES.map((e, i) => {
        const x = Math.sin(ANGULO(i)) * 18;
        const z = Math.cos(ANGULO(i)) * 18;
        const ok = feitos.includes(e.id);
        return (
          <g key={e.id} role="button" tabIndex={0} aria-label={`Ir até: ${e.nome}${ok ? " (feito)" : ""}`} onClick={() => aoIr(e.id)} onKeyDown={(ev) => ev.key === "Enter" && aoIr(e.id)} className="cursor-pointer">
            <circle cx={x} cy={z} r="7" fill="transparent" />
            <circle cx={x} cy={z} r="3.6" fill={ok ? "#0fa85a" : e.cor} stroke="#fff" strokeWidth="1" />
            {ok && <path d={`M${x - 1.8} ${z}l1.3 1.4l2.4-2.8`} fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" />}
          </g>
        );
      })}
      <g ref={jogador}>
        <path d="M0 -3.4L2.6 2.6L0 1.2L-2.6 2.6Z" fill="#fff" stroke="#071a2e" strokeWidth=".6" />
      </g>
    </svg>
  );
}

const PREVIA_SRCSET = `${asset("/lab-previa-740.webp")} 740w, ${asset("/lab-previa.webp")} 960w`;
const PREVIA_SIZES = "(min-width: 1024px) 560px, 100vw";

export function LabCliente({ fichas, internacionais, embutido = false }: { fichas: Record<string, FichaLab>; internacionais: ItemInternacional[]; embutido?: boolean }) {
  const Titulo = embutido ? "h2" : "h1";
  const Subtitulo = embutido ? "h3" : "h2";
  const { quem, escolher } = useGuia();
  const [fase, setFase] = useState<Fase>("inicio");
  const [feitos, setFeitos] = useState<IdEstacao[]>([]);
  const [perto, setPerto] = useState<IdEstacao | null>(null);
  const [aberta, setAberta] = useState<IdEstacao | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [dica, setDica] = useState(true);
  const [toqueFino, setToqueFino] = useState(false);
  const tela = useRef<HTMLCanvasElement>(null);
  const motor = useRef<Laboratorio | null>(null);
  const marcador = useRef<SVGGElement>(null);
  const abertaRef = useRef<IdEstacao | null>(null);
  abertaRef.current = aberta;

  useEffect(() => {
    setFeitos(lerFeitos());
    setToqueFino(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const abrir = useCallback((id: IdEstacao) => {
    const l = window.innerWidth >= 900;
    setAberta(id);
    setDica(false);
    tocar("virar");
    motor.current?.focar(id, l ? { direita: Math.min(440, window.innerWidth * 0.42), baixo: 0 } : { direita: 0, baixo: window.innerHeight * 0.6 });
  }, []);

  const fechar = useCallback(() => {
    setAberta(null);
    motor.current?.soltarFoco();
    tela.current?.focus({ preventScroll: true });
  }, []);

  const proxima = useCallback(
    (feitosAgora: IdEstacao[], atual: IdEstacao | null) => {
      const i = atual ? ESTACOES.findIndex((e) => e.id === atual) : -1;
      const ordem = [...ESTACOES.slice(i + 1), ...ESTACOES.slice(0, i + 1)];
      return (ordem.find((e) => !feitosAgora.includes(e.id)) ?? ordem[0]).id;
    },
    [],
  );

  const irProximo = useCallback(() => {
    const destino = proxima(feitos, abertaRef.current ?? perto);
    setAberta(null);
    motor.current?.soltarFoco();
    if (motor.current) motor.current.irPara(destino);
    else setAberta(destino);
    setDica(false);
  }, [feitos, perto, proxima]);

  const concluir = useCallback((id: IdEstacao) => {
    setFeitos((a) => {
      if (a.includes(id)) return a;
      const novo = [...a, id];
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novo));
      } catch {
        /* sem armazenamento, o progresso vale só nesta visita */
      }
      if (novo.length === ESTACOES.length) {
        carimbar("laboratorio");
        confete(80);
      }
      return novo;
    });
    motor.current?.comemorar();
    if (id !== "mundo") confete(26);
  }, []);

  const sair = useCallback(() => {
    motor.current?.descartar();
    motor.current = null;
    setAberta(null);
    setPerto(null);
    setFase("inicio");
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => () => {
    motor.current?.descartar();
    motor.current = null;
    document.documentElement.style.overflow = "";
  }, []);

  // O botão voltar do navegador sai do laboratório, em vez de sair do site.
  useEffect(() => {
    if (fase !== "dentro" && fase !== "lista") return;
    window.history.pushState({ lab: 1 }, "");
    const volta = () => sair();
    window.addEventListener("popstate", volta);
    return () => window.removeEventListener("popstate", volta);
  }, [fase === "dentro" || fase === "lista", sair]); // eslint-disable-line react-hooks/exhaustive-deps

  const pedirSaida = () => (window.history.state?.lab ? window.history.back() : sair());

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (fase !== "dentro" && fase !== "lista") return;
      if (e.key === "Escape") {
        if (abertaRef.current) fechar();
        return;
      }
      if (abertaRef.current || (e.target as HTMLElement).closest?.("button, a, input")) return;
      if ((e.key === "Enter" || e.key.toLowerCase() === "e") && perto) abrir(perto);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fase, perto, abrir, fechar]);

  useEffect(() => {
    if (fase !== "carregando" || !tela.current) return;
    let cancelado = false;
    import("./motor")
      .then(({ Laboratorio: Motor }) => {
        if (cancelado || !tela.current) return;
        const m = new Motor(
          tela.current,
          quem,
          {
            aoPerto: (id) => {
              setPerto(id);
              if (id) tocar("surgir");
            },
            aoChegar: (id) => abrir(id),
            aoMover: (x, z, a) => {
              marcador.current?.setAttribute("transform", `translate(${(x / 22) * 25} ${(z / 22) * 25}) rotate(${180 - (a * 180) / Math.PI})`);
            },
            aoAndar: () => setDica(false),
            aoPasso: () => tocar("pisada"),
            aoPronto: () => setFase("dentro"),
            aoPerderContexto: () => setAviso("O celular precisou liberar memória e o 3D parou. Use a versão em lista para continuar."),
          },
          BASE_PATH,
        );
        const logos: Partial<Record<IdEstacao, string[]>> = {};
        for (const e of ESTACOES) logos[e.id] = e.olimpiadas.filter((id) => fichas[id] && COM_LOGO.has(id));
        m.definirLogos(logos);
        motor.current = m;
      })
      .catch(() => {
        if (!cancelado) {
          setAviso("Não deu para abrir o 3D neste aparelho. Aqui está a versão em lista, com os mesmos experimentos.");
          setFase("lista");
        }
      });
    return () => {
      cancelado = true;
    };
  }, [fase, quem, abrir, fichas]);

  // Depois de um tempo, ou ao andar, a dica some sozinha.
  useEffect(() => {
    if (fase !== "dentro" || !dica) return;
    const t = setTimeout(() => setDica(false), 9000);
    return () => clearTimeout(t);
  }, [fase, dica]);

  const entrar = () => {
    if (!temWebGL()) {
      setAviso("Este aparelho não abre o 3D. Aqui está a versão em lista, com os mesmos experimentos.");
      setFase("lista");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    setDica(true);
    setFase("carregando");
  };

  const controlar = useCallback((nome: string, v?: unknown) => {
    const id = abertaRef.current;
    if (id) motor.current?.controlar(id, nome, v);
  }, []);
  const aoConcluirAberta = useCallback(() => {
    if (abertaRef.current) concluir(abertaRef.current);
  }, [concluir]);

  const estacaoAberta = useMemo(() => ESTACOES.find((e) => e.id === aberta) ?? null, [aberta]);
  const estacaoPerto = useMemo(() => ESTACOES.find((e) => e.id === perto) ?? null, [perto]);
  const dentro = fase === "dentro" || fase === "carregando";

  return (
    <>
      {fase === "inicio" || fase === "lista" ? (
        <section id="laboratorio" aria-label="Laboratório Vivo" className={`lab-capa ${embutido ? "lab-capa-secao" : ""}`}>
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 lg:py-8">
            <div className="grid items-center gap-5 lg:grid-cols-[1fr_1.1fr]">
              <div className="flex flex-col gap-3">
                <p className="estreito text-sm uppercase text-turquesa">Em 3D, direto no navegador. Sem instalar nada.</p>
                <Titulo className="titulo-1">
                  Laboratório <span className="text-amarelo">Vivo</span>
                </Titulo>
                <p className="max-w-xl text-lg font-bold leading-snug">Entra, anda e mexe nos equipamentos. Cada um é um experimento de verdade e uma porta para as olimpíadas daquele campo.</p>

                {fase === "inicio" && (
                  <>
                    <div className="grid max-w-md grid-cols-2 gap-2" role="group" aria-label="Com quem você entra?">
                      {(["menina", "menino"] as Quem[]).map((q) => (
                        <button key={q} type="button" onClick={() => escolher(q)} aria-pressed={quem === q} className="lab-escolha">
                          <Mascote quem={q} pose={quem === q ? "acena" : "parado"} prioridade={!embutido} className="w-12 shrink-0" />
                          <span className="estreito text-left text-[0.9375rem] leading-tight">{q === "menina" ? "Entrar com ela" : "Entrar com ele"}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={entrar} className="btn btn-marca w-full text-xl sm:w-auto" data-som="achou">
                        {feitos.length ? "Voltar para o laboratório" : "Entrar no laboratório"} →
                      </button>
                      <button type="button" onClick={() => setFase("lista")} className="underline">
                        Ver sem 3D
                      </button>
                    </div>
                    {feitos.length > 0 && (
                      <p className="text-sm font-bold">
                        {feitos.length} de {ESTACOES.length} equipamentos usados.
                      </p>
                    )}
                  </>
                )}
                {fase === "lista" && (
                  <button type="button" onClick={pedirSaida} className="self-start underline">
                    Voltar
                  </button>
                )}
                {aviso && <p role="alert" className="balao max-w-xl">{aviso}</p>}
              </div>
              {fase === "inicio" && (
                <button type="button" onClick={entrar} aria-label="Entrar no laboratório" data-som="achou" className="lab-previa">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset("/lab-previa.webp")} srcSet={PREVIA_SRCSET} sizes={PREVIA_SIZES} alt="" width={960} height={540} fetchPriority={embutido ? undefined : "high"} loading={embutido ? "lazy" : undefined} />
                  <span className="lab-previa-toque" aria-hidden="true">▶</span>
                </button>
              )}
            </div>

            <div>
              <Subtitulo className="estreito !text-lg">O que tem lá dentro</Subtitulo>
              {embutido ? (
                <div className="-mx-4 mt-3">
                  <Carrossel rotulo="Equipamentos do laboratório" classe="gap-2 px-4 pb-2">
                    {ESTACOES.map((e) => (
                      <div key={e.id} className="w-44">
                        <CartaoEstacao e={e} feito={feitos.includes(e.id)} aoAbrir={() => { setFase("lista"); setAberta(e.id); }} />
                      </div>
                    ))}
                  </Carrossel>
                </div>
              ) : (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ESTACOES.map((e) => (
                    <li key={e.id}>
                      <CartaoEstacao e={e} feito={feitos.includes(e.id)} aoAbrir={() => { setFase("lista"); setAberta(e.id); }} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {dentro &&
        createPortal(
        <div className="lab-tela">
          <canvas ref={tela} tabIndex={0} className="lab-canvas" role="application" aria-label="Laboratório em 3D. Use as setas ou W, A, S, D para andar e Enter para usar o equipamento. O mapa e a lista levam aos mesmos experimentos." />

          {fase === "carregando" && (
            <div className="lab-carregando" role="status">
              <div className="flex items-end gap-1">
                <Mascote quem="menino" pose="acena" prioridade className="w-24" />
                <Mascote quem="menina" pose="tubo" prioridade className="w-24" />
              </div>
              <p className="estreito text-xl">Ligando o laboratório</p>
            </div>
          )}

          {fase === "dentro" && (
            <>
              <div className="lab-topo">
                <button type="button" onClick={pedirSaida} className="lab-botao">
                  ← Sair
                </button>
                <div className="lab-progresso" aria-label={`${feitos.length} de ${ESTACOES.length} equipamentos usados`}>
                  <span className="estreito">
                    {feitos.length}/{ESTACOES.length}
                  </span>
                  <span className="lab-barra">
                    <i style={{ width: `${(feitos.length / ESTACOES.length) * 100}%` }} />
                  </span>
                </div>
                <BotaoSom className="lab-botao !size-11 !p-0" />
              </div>

              {!aberta && (
                <>
                  <Mapa feitos={feitos} aoIr={(id) => motor.current?.irPara(id)} jogador={marcador} />

                  {dica && (
                    <div className="lab-dica" role="status">
                      <Mascote quem={quem === "menino" ? "menina" : "menino"} pose="acena" className="w-12 shrink-0" />
                      <p>{toqueFino ? "Arrasta o círculo para andar, ou toca em qualquer lugar do chão. Toca num equipamento para ir até ele." : "Anda com W, A, S, D ou as setas, ou clica no chão. Arrasta para olhar em volta. Clica num equipamento para ir até ele."}</p>
                    </div>
                  )}

                  <div className="lab-base">
                    {toqueFino && <Joystick aoMover={(x, y) => motor.current?.definirJoystick(x, y)} />}
                    <div className="lab-acoes">
                      {estacaoPerto ? (
                        <button type="button" onClick={() => abrir(estacaoPerto.id)} className="lab-entrar" style={{ background: estacaoPerto.cor, color: estacaoPerto.tinta }}>
                          Usar: {estacaoPerto.nome}
                          {!toqueFino && <kbd>E</kbd>}
                        </button>
                      ) : (
                        <button type="button" onClick={irProximo} className="lab-botao lab-proximo">
                          {feitos.length === ESTACOES.length ? "Passear" : "Ir ao próximo equipamento"} →
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {aviso && fase === "dentro" && (
            <div className="lab-carregando" role="alert">
              <p className="balao max-w-sm">{aviso}</p>
              <button type="button" className="btn btn-primario" onClick={() => { setAviso(null); pedirSaida(); setTimeout(() => setFase("lista"), 60); }}>
                Abrir a lista
              </button>
            </div>
          )}
        </div>,
        document.body,
      )}

      {estacaoAberta &&
        (dentro || fase === "lista") &&
        createPortal(<Painel key={estacaoAberta.id} e={estacaoAberta} lista={fase === "lista"} fichas={fichas} internacionais={internacionais} feito={feitos.includes(estacaoAberta.id)} controlar={controlar} aoConcluir={aoConcluirAberta} aoFechar={fechar} aoProximo={irProximo} quem={quem} />, document.body)}
    </>
  );
}
