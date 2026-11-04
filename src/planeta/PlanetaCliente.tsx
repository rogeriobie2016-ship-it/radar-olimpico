"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BotaoTelaCheia, TelaCheiaProvider, useTelaCheiaDoPalco } from "@/components/jogos/TelaCheia";
import Link from "@/components/L";
import { Mascote, type Quem } from "@/components/Mascote";
import { BotaoSom } from "@/components/Som";
import { Joystick, temWebGL } from "@/lab/Joystick";
import { asset } from "@/lib/base";
import { carimbar, confete, useGuia } from "@/lib/guia";
import { tocar } from "@/lib/som";
import type { Planeta } from "./motor";

export type VideoPlaneta = { id: string; fonte: "youtube" | "commons"; titulo: string; canal: string; duracao: string | null; idioma: string; pagina: string };
export type MaterialPlaneta = { titulo: string; tipo: string; url: string };
export type EstantePlaneta = {
  id: string;
  titulo: string;
  cor: string;
  tinta: string;
  videos: VideoPlaneta[];
  materiais: MaterialPlaneta[];
  ligacoes: { href: string; rotulo: string }[];
};

const CHAVE = "radar-planeta";
type Progresso = { fitas: string[]; carimbos: string[] };
const lerProgresso = (): Progresso => {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
    return { fitas: Array.isArray(p.fitas) ? p.fitas : [], carimbos: Array.isArray(p.carimbos) ? p.carimbos : [] };
  } catch {
    return { fitas: [], carimbos: [] };
  }
};
const gravarProgresso = (p: Progresso) => {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* sem armazenamento, vale só nesta visita */
  }
};

export const IDIOMAS: Record<string, string> = { pt: "Em português", en: "Em inglês", de: "Em alemão", mudo: "Filme mudo" };

function Player({ v, tocando, aoTocar }: { v: VideoPlaneta; tocando: boolean; aoTocar: () => void }) {
  if (v.fonte === "commons") {
    return (
      <a href={v.pagina} target="_blank" rel="noopener noreferrer" className="plan-play" onClick={aoTocar}>
        <span aria-hidden="true" className="plan-play-bola">▶</span>
        Assistir no Wikimedia Commons (abre em outra aba)
      </a>
    );
  }
  if (!tocando) {
    return (
      <button type="button" className="plan-play" onClick={aoTocar}>
        <span aria-hidden="true" className="plan-play-bola">▶</span>
        Assistir aqui
      </button>
    );
  }
  return (
    <div className="plan-video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
        title={v.titulo}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

/** A estante em lista: tudo o que dá para fazer tocando nas fitas, com leitor de tela ou teclado também. */
function Painel({ e, sel, tocando, aoEscolher, aoAssistir, aoSobre, aoFechar, carimbado }: { e: EstantePlaneta; sel: number | null; tocando: boolean; aoEscolher: (i: number, tocar: boolean) => void; aoAssistir: () => void; aoSobre: (i: number | null) => void; aoFechar: () => void; carimbado: boolean }) {
  const fechar = useRef<HTMLButtonElement>(null);
  useEffect(() => fechar.current?.focus({ preventScroll: true }), []);
  const v = sel === null ? null : e.videos[sel];
  return (
    <div role="dialog" aria-label={`Estante de ${e.titulo}`} className="lab-painel plan-painel" style={{ "--cor-estacao": e.cor, "--tinta-estacao": e.tinta } as React.CSSProperties}>
      <div className="lab-painel-topo">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide opacity-85">{carimbado ? "Estante carimbada" : "Estante"}</p>
          <h2 className="!text-[1.35rem] uppercase leading-none">{e.titulo}</h2>
        </div>
        <button ref={fechar} type="button" onClick={aoFechar} aria-label="Voltar para o planeta" className="lab-fechar">
          ✕
        </button>
      </div>
      <div className="lab-painel-corpo">
        {v ? (
          <section aria-label="Fita escolhida" className="plan-escolhida">
            <Player key={v.id} v={v} tocando={tocando} aoTocar={aoAssistir} />
            <h3 className="estreito !text-[1.2rem] leading-tight">{v.titulo}</h3>
            <p className="text-sm font-bold opacity-85">
              {v.canal}
              {v.duracao ? `. ${v.duracao}` : ""}. {IDIOMAS[v.idioma]}.
            </p>
            {v.fonte === "youtube" && (
              <p className="text-sm opacity-85">
                O vídeo vem do YouTube.{" "}
                <a href={v.pagina} target="_blank" rel="noopener noreferrer" className="underline">
                  Abrir lá
                </a>
              </p>
            )}
          </section>
        ) : (
          <p className="font-bold">Toque numa fita da estante para puxar, ou escolha aqui.</p>
        )}

        <ul className="plan-fitas" aria-label="Fitas desta estante">
          {e.videos.map((f, i) => (
            <li key={f.id}>
              <button type="button" className="plan-fita" aria-pressed={sel === i} onClick={() => aoEscolher(i, true)} onPointerEnter={() => aoSobre(i)} onPointerLeave={() => aoSobre(null)} onFocus={() => aoSobre(i)} onBlur={() => aoSobre(null)}>
                <span aria-hidden="true" className="plan-fita-seta">▶</span>
                <span className="min-w-0">
                  <span className="block font-extrabold leading-tight">{f.titulo}</span>
                  <span className="mt-0.5 block text-[0.8125rem] opacity-80">
                    {f.canal}
                    {f.duracao ? `. ${f.duracao}` : ""}
                    {f.idioma !== "pt" ? `. ${IDIOMAS[f.idioma]}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {e.materiais.length > 0 && (
          <details className="plan-livros">
            <summary>Livros da prateleira de baixo: {e.materiais.length} materiais gratuitos</summary>
            <ul>
              {e.materiais.map((m) => (
                <li key={m.url + m.titulo}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer">
                    <span className="font-bold">{m.titulo}</span>
                    <span className="block text-[0.8125rem] opacity-80">{m.tipo}</span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <nav aria-label={`Continue em ${e.titulo}`} className="flex flex-wrap gap-2">
          {e.ligacoes.map((l) => (
            <Link key={l.href} href={l.href} className="lab-opcao inline-flex items-center no-underline">
              {l.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TelaDoPlaneta({ estantes, quem, aoSair, progresso, setProgresso }: { estantes: EstantePlaneta[]; quem: Quem; aoSair: () => void; progresso: Progresso; setProgresso: React.Dispatch<React.SetStateAction<Progresso>> }) {
  const [pronto, setPronto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [perto, setPerto] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  const [dica, setDica] = useState(true);
  const [toqueFino, setToqueFino] = useState(false);
  const [recado, setRecado] = useState<string | null>(null);
  const palco = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const motor = useRef<Planeta | null>(null);
  const abertaRef = useRef<string | null>(null);
  abertaRef.current = aberta;
  const telaCheia = useTelaCheiaDoPalco(palco);

  const estante = useMemo(() => estantes.find((e) => e.id === aberta) ?? null, [estantes, aberta]);
  const estantePerto = useMemo(() => estantes.find((e) => e.id === perto) ?? null, [estantes, perto]);

  const abrir = useCallback((id: string) => {
    const largo = window.innerWidth >= 900;
    setAberta(id);
    setSel(null);
    setTocando(false);
    setDica(false);
    tocar("virar");
    motor.current?.focar(id, largo ? { direita: Math.min(440, window.innerWidth * 0.42), baixo: 0 } : { direita: 0, baixo: window.innerHeight * 0.6 });
  }, []);

  const fechar = useCallback(() => {
    setAberta(null);
    setSel(null);
    setTocando(false);
    motor.current?.soltarFoco();
    tela.current?.focus({ preventScroll: true });
  }, []);

  const escolher = useCallback((i: number, tocarJa: boolean) => {
    setSel(i);
    setTocando(false);
    motor.current?.selecionar(i);
    tocar("surgir");
    if (tocarJa) setTimeout(() => document.querySelector<HTMLElement>(".plan-play")?.focus({ preventScroll: true }), 30);
  }, []);

  const assistir = useCallback(() => {
    setTocando(true);
    const id = abertaRef.current;
    if (!id) return;
    setProgresso((p) => {
      if (p.carimbos.includes(id)) return p;
      const novo = { ...p, carimbos: [...p.carimbos, id] };
      gravarProgresso(novo);
      tocar("achou");
      motor.current?.comemorar();
      if (novo.carimbos.length === estantes.length) {
        carimbar("planeta");
        confete(80);
      } else confete(22);
      return novo;
    });
  }, [estantes.length, setProgresso]);

  useEffect(() => {
    setToqueFino(window.matchMedia("(pointer: coarse)").matches);
    let cancelado = false;
    let m: Planeta | null = null;
    const ini = async () => {
      // A placa e as capas são desenhadas com a fonte do site: espera ela chegar.
      await document.fonts?.ready;
      const { Planeta: Motor } = await import("./motor");
      if (cancelado || !tela.current) return;
      const base = estantes.map((e) => ({ id: e.id, titulo: e.titulo, cor: e.cor, videos: e.videos.map((v) => ({ titulo: v.titulo, canal: v.canal, duracao: v.duracao })), materiais: e.materiais.length }));
      m = new Motor(tela.current, quem, base, progresso.fitas, {
        aoPerto: (id) => {
          setPerto(id);
          if (id) tocar("surgir");
        },
        aoChegar: (id) => abrir(id),
        aoFita: (_id, i) => escolher(i, false),
        aoColetar: (id) => {
          tocar("acerto");
          setProgresso((p) => {
            if (p.fitas.includes(id)) return p;
            const novo = { ...p, fitas: [...p.fitas, id] };
            gravarProgresso(novo);
            setRecado(novo.fitas.length === estantes.length ? "Você achou todas as fitas douradas!" : `Fita dourada! ${novo.fitas.length} de ${estantes.length}.`);
            if (novo.fitas.length === estantes.length) confete(50);
            return novo;
          });
        },
        aoAndar: () => setDica(false),
        aoPasso: () => tocar("pisada"),
        aoPulo: () => tocar("lancar"),
        aoPronto: () => setPronto(true),
        aoPerderContexto: () => setAviso("O aparelho precisou liberar memória e o 3D parou. A lista de vídeos desta página tem o mesmo conteúdo."),
      });
      motor.current = m;
    };
    ini().catch(() => {
      if (!cancelado) setAviso("Não deu para abrir o 3D neste aparelho. A lista de vídeos desta página tem o mesmo conteúdo.");
    });
    return () => {
      cancelado = true;
      m?.descartar();
      motor.current = null;
    };
    // O motor nasce uma vez por visita: progresso muda durante o jogo sem recriar o mundo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (abertaRef.current) fechar();
        return;
      }
      if (abertaRef.current || (e.target as HTMLElement).closest?.("button, a, input")) return;
      if ((e.key === "Enter" || e.key.toLowerCase() === "e") && perto) abrir(perto);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [perto, abrir, fechar]);

  useEffect(() => {
    if (!recado) return;
    const t = setTimeout(() => setRecado(null), 3200);
    return () => clearTimeout(t);
  }, [recado]);

  useEffect(() => {
    if (!pronto || !dica) return;
    const t = setTimeout(() => setDica(false), 9000);
    return () => clearTimeout(t);
  }, [pronto, dica]);

  const proxima = estantes.find((e) => !progresso.carimbos.includes(e.id));

  return (
    <TelaCheiaProvider value={telaCheia}>
      <div ref={palco} className="lab-tela plan-tela">
        <canvas ref={tela} tabIndex={0} className="lab-canvas" role="application" aria-label="Planeta Estante em 3D. Use as setas ou W, A, S, D para andar, espaço para pular e Enter para abrir a estante. O cartão no topo leva direto a cada estante." />

        {!pronto && !aviso && (
          <div className="lab-carregando plan-carregando" role="status">
            <div className="flex items-end gap-1">
              <Mascote quem="menino" pose="acena" prioridade className="w-24" />
              <Mascote quem="menina" pose="tubo" prioridade className="w-24" />
            </div>
            <p className="estreito text-xl">Pintando o planeta</p>
          </div>
        )}

        {pronto && (
          <>
            <div className="lab-topo">
              <button type="button" onClick={aoSair} className="lab-botao">
                ← Sair
              </button>
              {!aberta && (
                <div className="plan-cartao" role="group" aria-label={`Cartão da biblioteca: ${progresso.carimbos.length} de ${estantes.length} estantes carimbadas. Toque em uma para ir até ela.`}>
                  {estantes.map((e) => {
                    const ok = progresso.carimbos.includes(e.id);
                    return (
                      <button key={e.id} type="button" aria-label={`Ir até ${e.titulo}${ok ? " (carimbada)" : ""}`} title={e.titulo} className="plan-carimbo" style={{ "--cor": e.cor } as React.CSSProperties} data-ok={ok} onClick={() => motor.current?.irPara(e.id)}>
                        {ok && <span aria-hidden="true">✓</span>}
                      </button>
                    );
                  })}
                  <span className="plan-douradas" aria-label={`${progresso.fitas.length} de ${estantes.length} fitas douradas`}>
                    <span aria-hidden="true" className="plan-dourada-icone" />
                    {progresso.fitas.length}/{estantes.length}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <BotaoTelaCheia className="lab-botao !size-11 !p-0" soIcone />
                <BotaoSom className="lab-botao !size-11 !p-0" />
              </div>
            </div>

            {recado && <p role="status" className="plan-recado">{recado}</p>}

            {!aberta && (
              <>
                {dica && (
                  <div className="lab-dica plan-dica" role="status">
                    <Mascote quem={quem === "menino" ? "menina" : "menino"} pose="acena" className="w-12 shrink-0" />
                    <p>{toqueFino ? "Arrasta o círculo para andar e toca numa estante para ir até ela. O botão pula." : "Anda com W, A, S, D ou as setas e pula com espaço. Arrasta para olhar em volta. Clica numa estante para ir até ela."}</p>
                  </div>
                )}
                <div className="lab-base">
                  {toqueFino && <Joystick aoMover={(x, y) => motor.current?.definirJoystick(x, y)} />}
                  <div className="lab-acoes flex items-end gap-2">
                    {estantePerto ? (
                      <button type="button" onClick={() => abrir(estantePerto.id)} className="lab-entrar" style={{ background: estantePerto.cor, color: estantePerto.tinta }}>
                        Abrir estante: {estantePerto.titulo}
                        {!toqueFino && <kbd>E</kbd>}
                      </button>
                    ) : (
                      proxima && (
                        <button type="button" onClick={() => motor.current?.irPara(proxima.id)} className="lab-botao lab-proximo">
                          Ir até {proxima.titulo} →
                        </button>
                      )
                    )}
                    {toqueFino && (
                      <button type="button" onClick={() => motor.current?.pular()} aria-label="Pular" className="plan-pular">
                        ↑
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {aviso && (
          <div className="lab-carregando plan-carregando" role="alert">
            <p className="balao max-w-sm">{aviso}</p>
            <button type="button" className="btn btn-primario" onClick={aoSair}>
              Ver a lista
            </button>
          </div>
        )}

        {estante && <Painel e={estante} sel={sel} tocando={tocando} aoEscolher={escolher} aoAssistir={assistir} aoSobre={(i) => motor.current?.destacar(i)} aoFechar={fechar} carimbado={progresso.carimbos.includes(estante.id)} />}
      </div>
    </TelaCheiaProvider>
  );
}

export function PlanetaCliente({ estantes }: { estantes: EstantePlaneta[] }) {
  const { quem, escolher } = useGuia();
  const [dentro, setDentro] = useState(false);
  const [progresso, setProgresso] = useState<Progresso>({ fitas: [], carimbos: [] });
  const [semTresD, setSemTresD] = useState(false);

  useEffect(() => setProgresso(lerProgresso()), []);

  const sair = useCallback(() => {
    setDentro(false);
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => () => {
    document.documentElement.style.overflow = "";
  }, []);

  // O botão voltar sai do planeta, em vez de sair do site.
  useEffect(() => {
    if (!dentro) return;
    window.history.pushState({ planeta: 1 }, "");
    const volta = () => sair();
    window.addEventListener("popstate", volta);
    return () => window.removeEventListener("popstate", volta);
  }, [dentro, sair]);

  const pedirSaida = () => (window.history.state?.planeta ? window.history.back() : sair());

  const entrar = () => {
    if (!temWebGL()) {
      setSemTresD(true);
      document.getElementById("lista-videos")?.scrollIntoView();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    setDentro(true);
  };

  return (
    <>
      <div className="plan-capa">
        <div className="flex flex-col gap-4">
          <p className="estreito text-sm uppercase text-turquesa">Jogo em 3D, direto no navegador</p>
          <h1 className="titulo-1">
            Planeta <span className="text-amarelo">Estante</span>
          </h1>
          <p className="max-w-xl text-lg font-bold leading-snug">Um mundinho redondo para explorar a pé. Cada região tem uma estante gigante com vídeos daquela área: chegue perto, puxe uma fita e assista. Carimbe as sete estantes e procure as fitas douradas.</p>
          <div className="grid max-w-md grid-cols-2 gap-2" role="group" aria-label="Com quem você entra?">
            {(["menina", "menino"] as Quem[]).map((q) => (
              <button key={q} type="button" onClick={() => escolher(q)} aria-pressed={quem === q} className="lab-escolha">
                <Mascote quem={q} pose={quem === q ? "acena" : "parado"} prioridade className="w-12 shrink-0" />
                <span className="estreito text-left text-[0.9375rem] leading-tight">{q === "menina" ? "Entrar com ela" : "Entrar com ele"}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={entrar} className="btn btn-marca w-full text-xl sm:w-auto" data-som="achou">
              {progresso.carimbos.length ? "Voltar ao planeta" : "Entrar no planeta"} →
            </button>
            <a href="#lista-videos" className="underline">
              Ver sem 3D
            </a>
          </div>
          {progresso.carimbos.length > 0 && (
            <p className="text-sm font-bold">
              {progresso.carimbos.length} de {estantes.length} estantes carimbadas. {progresso.fitas.length} de {estantes.length} fitas douradas.
            </p>
          )}
          {semTresD && <p role="alert" className="balao max-w-xl">Este aparelho não abre o 3D. Os mesmos vídeos estão na lista abaixo.</p>}
        </div>
        <button type="button" onClick={entrar} aria-label="Entrar no planeta" data-som="achou" className="lab-previa plan-previa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/planeta-previa.webp")} srcSet={`${asset("/planeta-previa-740.webp")} 740w, ${asset("/planeta-previa.webp")} 960w`} sizes="(min-width: 1024px) 560px, 100vw" alt="" width={960} height={720} fetchPriority="high" />
          <span className="lab-previa-toque" aria-hidden="true">▶</span>
        </button>
      </div>

      {dentro && createPortal(<TelaDoPlaneta estantes={estantes} quem={quem} aoSair={pedirSaida} progresso={progresso} setProgresso={setProgresso} />, document.body)}
    </>
  );
}
