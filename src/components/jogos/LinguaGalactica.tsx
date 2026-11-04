"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import type { Pose } from "@/components/Mascote";
import { Seta } from "@/components/Seta";
import { carimbar, confete } from "@/lib/guia";
import { tocar as som } from "@/lib/som";
import { useHoje } from "@/lib/status";
import {
  conferirExercicio, CURSOS, embaralhar, embaralharBlocos, enunciado, estrelasPorErros, fezHoje, fraseAlvo, gabarito, lerProgresso, licaoAberta, licaoFeita, mascara, proximaLicao,
  registrarLicao, salvarProgresso, sequenciaAtual, VIDAS, xpDaLicao, type Nota, type Progresso,
} from "@/lib/estudo/motor";
import type { Completar, Curso, Exercicio, Idioma, Licao, Montar, Ouvir, Pares, Traduzir, Ler } from "@/lib/estudo/tipos";
import { useVoz } from "@/lib/estudo/voz";
import { Placar, type AoTerminar } from "./Molde";

const CARIMBO = "lingua-galactica";
type Voz = ReturnType<typeof useVoz>;

// Desenhos

type Arte = "estacao" | "faixas" | "crateras" | "anel" | "nuvens" | "portal";
const ASTROS: { a: string; b: string; arte: Arte }[] = [
  { a: "#6ff4f2", b: "#007f80", arte: "estacao" },
  { a: "#ffb877", b: "#c2520c", arte: "faixas" },
  { a: "#eef3fb", b: "#7186a8", arte: "crateras" },
  { a: "#ffd978", b: "#b36f06", arte: "anel" },
  { a: "#fbc4da", b: "#b0417f", arte: "nuvens" },
  { a: "#8ff0b8", b: "#0f7a49", arte: "estacao" },
  { a: "#9cc4ff", b: "#2a56c4", arte: "anel" },
  { a: "#fdc13f", b: "#f58a33", arte: "portal" },
];

/** Cada lição é um astro próprio, desenhado aqui mesmo. Nada de imagem para baixar. */
function Astro({ i, className }: { i: number; className?: string }) {
  const id = useId();
  const { a, b, arte } = ASTROS[i % ASTROS.length];
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={`${id}g`} cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
        <clipPath id={`${id}c`}><circle cx="60" cy="60" r="36" /></clipPath>
      </defs>
      {arte === "portal" ? (
        <>
          <circle cx="60" cy="60" r="44" fill="none" stroke="#3ee8e6" strokeWidth="3" strokeDasharray="4 7" strokeLinecap="round" />
          <circle cx="60" cy="60" r="35" fill="#061029" stroke={`url(#${id}g)`} strokeWidth="11" />
          <circle cx="60" cy="60" r="19" fill="#3ee8e6" fillOpacity=".28" />
          <circle cx="60" cy="60" r="9" fill="#f4fbff" />
        </>
      ) : (
        <>
          {arte === "estacao" && (
            <g fill={b} stroke={a} strokeWidth="2.5">
              <rect x="2" y="50" width="26" height="20" rx="2" />
              <rect x="92" y="50" width="26" height="20" rx="2" />
              <path d="M28 60h64" />
            </g>
          )}
          {arte === "anel" && <ellipse cx="60" cy="60" rx="55" ry="15" fill="none" stroke={a} strokeOpacity=".65" strokeWidth="6" transform="rotate(-18 60 60)" />}
          <circle cx="60" cy="60" r={arte === "estacao" ? 30 : 36} fill={`url(#${id}g)`} />
          <g clipPath={`url(#${id}c)`}>
            {arte === "faixas" && (
              <g fill="#7a2f05" fillOpacity=".38">
                <rect x="20" y="38" width="80" height="8" />
                <rect x="20" y="56" width="80" height="13" />
                <rect x="20" y="78" width="80" height="6" />
              </g>
            )}
            {arte === "crateras" && (
              <g fill="#5c7294" fillOpacity=".55">
                <circle cx="46" cy="46" r="8" />
                <circle cx="74" cy="66" r="11" />
                <circle cx="48" cy="80" r="5" />
                <circle cx="76" cy="38" r="4" />
              </g>
            )}
            {arte === "nuvens" && (
              <g fill="#fff" fillOpacity=".5">
                <ellipse cx="44" cy="46" rx="22" ry="6" />
                <ellipse cx="78" cy="62" rx="24" ry="7" />
                <ellipse cx="46" cy="78" rx="18" ry="5" />
              </g>
            )}
            {arte === "estacao" && (
              <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5">
                <path d="M30 60h60M60 30v60" />
                <circle cx="60" cy="60" r="11" />
              </g>
            )}
          </g>
          {arte === "anel" && <path d="M8 76a55 15 -18 0 0 104 -32" fill="none" stroke={a} strokeWidth="6" strokeLinecap="round" />}
        </>
      )}
    </svg>
  );
}

function Nave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M16 2c5 5 7 11 7 18l4 6-7-1h-8l-7 1 4-6c0-7 2-13 7-18Z" fill="#f4fbff" />
      <path d="M16 2c5 5 7 11 7 18h-14c0-7 2-13 7-18Z" fill="#f58a33" />
      <circle cx="16" cy="13" r="3.4" fill="#071433" stroke="#f4fbff" strokeWidth="1.4" />
      <path className="lg-chama" d="M12.5 26h7L16 31.5Z" fill="#fdc13f" />
    </svg>
  );
}

function Estrelas({ quantas, grande }: { quantas: number; grande?: boolean }) {
  return (
    <span className={`lg-estrelas ${grande ? "lg-estrelas-grandes" : ""}`} role="img" aria-label={`${quantas} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" data-acesa={i < quantas} style={{ animationDelay: `${i * 130}ms` }}>
          <path d="M12 2.4l2.9 6.2 6.8.8-5 4.6 1.3 6.7-6-3.3-6 3.3 1.3-6.7-5-4.6 6.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

function IconeSom({ ligado }: { ligado?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.6L13 19V5L7.6 9.5H4Z" fill="currentColor" />
      <path d="M16.5 8.8a4.5 4.5 0 0 1 0 6.4" />
      {ligado && <path d="M19.2 6a8.4 8.4 0 0 1 0 12" />}
    </svg>
  );
}

const rotuloIdioma = (i: Idioma) => (i === "en" ? "inglês" : "espanhol");

// Exercícios

const INSTRUCAO = (ex: Exercicio, idioma: Idioma, escrever: boolean) => {
  const nome = rotuloIdioma(idioma);
  switch (ex.tipo) {
    case "traduzir":
      return ex.de === "alvo" ? "Qual é a tradução?" : `Como se diz em ${nome}?`;
    case "montar":
      return `Monte a frase em ${nome}`;
    case "pares":
      return "Ligue os pares";
    case "completar":
      return "Complete a frase";
    case "ouvir":
      return escrever ? `Escreva em ${nome}` : "Ouça e escreva";
    case "ler":
      return "Leia e responda";
  }
};

function BotaoOuvir({ texto, voz, rotulo }: { texto: string; voz: Voz; rotulo?: string }) {
  if (voz.estado !== "pronta") return null;
  return (
    <button type="button" data-som="nada" className={rotulo ? "tecla lg-ouvir-texto" : "lg-ouvir-mini"} aria-label={rotulo ? undefined : "Ouvir"} onClick={() => voz.falar(texto)}>
      <IconeSom ligado={voz.falando} />
      {rotulo}
    </button>
  );
}

function Opcoes({ ex, valor, escolher, travado, lang }: { ex: { opcoes: string[]; certa: string }; valor: string; escolher: (v: string) => void; travado: boolean; lang?: string }) {
  const lista = useMemo(() => embaralhar(ex.opcoes), [ex]);
  return (
    <div className="lg-opcoes" role="group" aria-label="Opções">
      {lista.map((o, i) => {
        const estado = !travado ? (valor === o ? "marcada" : "") : o === ex.certa ? "certa" : valor === o ? "errada" : "apagada";
        return (
          <button key={o} type="button" data-atalho="" disabled={travado} aria-pressed={valor === o} data-estado={estado} className="lg-opcao" lang={lang} onClick={() => escolher(o)}>
            <kbd className="lg-atalho" aria-hidden="true">{i + 1}</kbd>
            <span>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function ExTraduzir({ ex, valor, escolher, travado, lang, voz }: { ex: Traduzir; valor: string; escolher: (v: string) => void; travado: boolean; lang: string; voz: Voz }) {
  return (
    <>
      <div className="lg-frase-linha">
        <p className="lg-frase" lang={ex.de === "alvo" ? lang : undefined}>{ex.frase}</p>
        {ex.de === "alvo" && <BotaoOuvir texto={ex.frase} voz={voz} />}
      </div>
      <Opcoes ex={ex} valor={valor} escolher={escolher} travado={travado} lang={ex.de === "pt" ? lang : undefined} />
    </>
  );
}

function ExCompletar({ ex, valor, escolher, travado, lang }: { ex: Completar; valor: string; escolher: (v: string) => void; travado: boolean; lang: string }) {
  const [antes, depois] = ex.frase.split("___");
  return (
    <>
      <p className="lg-frase" lang={lang}>
        {antes}
        <span className="lg-lacuna" data-cheia={Boolean(valor)}>{valor || <span className="sr-only">lacuna</span>}</span>
        {depois}
      </p>
      <p className="lg-apoio">{ex.pt}</p>
      <Opcoes ex={ex} valor={valor} escolher={escolher} travado={travado} lang={lang} />
    </>
  );
}

function ExLer({ ex, valor, escolher, travado, lang, voz }: { ex: Ler; valor: string; escolher: (v: string) => void; travado: boolean; lang: string; voz: Voz }) {
  return (
    <>
      <div className="lg-texto">
        <p lang={lang}>{ex.texto}</p>
        <BotaoOuvir texto={ex.texto} voz={voz} />
      </div>
      <p className="lg-pergunta">{ex.pergunta}</p>
      <Opcoes ex={ex} valor={valor} escolher={escolher} travado={travado} />
    </>
  );
}

function ExMontar({ ex, aoMudar, travado, lang }: { ex: Montar; aoMudar: (v: string) => void; travado: boolean; lang: string }) {
  const banco = useMemo(() => embaralharBlocos(ex), [ex]);
  const [ordem, setOrdem] = useState<number[]>([]);
  const mudar = (n: number[]) => {
    setOrdem(n);
    aoMudar(n.map((i) => banco[i]).join(" "));
    som("passo");
  };
  return (
    <>
      <p className="lg-frase">{ex.pt}</p>
      <div className="lg-bandeja" data-travada={travado} aria-label="Sua frase">
        {ordem.length === 0 && <span className="lg-bandeja-vazia">Toque nos blocos para montar</span>}
        {ordem.map((i) => (
          <button key={i} type="button" data-som="nada" data-bandeja="" disabled={travado} lang={lang} className="lg-bloco lg-bloco-entra" aria-label={`Tirar ${banco[i]}`} onClick={() => mudar(ordem.filter((x) => x !== i))}>
            {banco[i]}
          </button>
        ))}
      </div>
      <div className="lg-banco" role="group" aria-label="Blocos">
        {banco.map((b, i) => {
          const usado = ordem.includes(i);
          return (
            <button key={i} type="button" data-som="nada" data-atalho="" disabled={travado || usado} data-usado={usado} lang={lang} className="lg-bloco" aria-label={usado ? `${b}, já usado` : b} onClick={() => mudar([...ordem, i])}>
              <kbd className="lg-atalho" aria-hidden="true">{i + 1}</kbd>
              {b}
            </button>
          );
        })}
      </div>
    </>
  );
}

const CORES_PAR = ["#f58a33", "#00c9c8", "#fdc13f", "#f8a8c8", "#8ff0b8", "#9cc4ff"];

function ExPares({ ex, aoConcluir, lang }: { ex: Pares; aoConcluir: (errou: boolean) => void; lang: string }) {
  const esq = useMemo(() => embaralhar(ex.pares.map((p) => p[0])), [ex]);
  const dir = useMemo(() => embaralhar(ex.pares.map((p) => p[1])), [ex]);
  const [sel, setSel] = useState<{ lado: 0 | 1; v: string } | null>(null);
  const [feitos, setFeitos] = useState<string[]>([]); // termos da esquerda já ligados
  const [falha, setFalha] = useState<string[]>([]);
  const [aviso, setAviso] = useState("");
  const errou = useRef(false);
  const relogios = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => relogios.current.forEach(clearTimeout), []);

  const tocarItem = (lado: 0 | 1, v: string) => {
    if (!sel || sel.lado === lado) {
      setSel(sel?.v === v && sel.lado === lado ? null : { lado, v });
      return;
    }
    const [e, d] = lado === 0 ? [v, sel.v] : [sel.v, v];
    setSel(null);
    if (ex.pares.some(([a, b]) => a === e && b === d)) {
      const n = [...feitos, e];
      setFeitos(n);
      setAviso(`Par certo: ${e} e ${d}.`);
      if (n.length === ex.pares.length) {
        som("acerto");
        relogios.current.push(setTimeout(() => aoConcluir(errou.current), 320));
      } else som("achou");
    } else {
      errou.current = true;
      setFalha([e, d]);
      setAviso(`${e} e ${d} não formam par.`);
      som("erro");
      relogios.current.push(setTimeout(() => setFalha([]), 480));
    }
  };

  const corDe = (v: string, lado: 0 | 1) => {
    const par = ex.pares.find((p) => p[lado] === v);
    if (!par || !feitos.includes(par[0])) return undefined;
    return CORES_PAR[feitos.indexOf(par[0]) % CORES_PAR.length];
  };

  const coluna = (lista: string[], lado: 0 | 1, base: number) => (
    <div className="lg-coluna">
      {lista.map((v, i) => {
        const cor = corDe(v, lado);
        return (
          <button
            key={v} type="button" data-som="nada" data-atalho="" disabled={Boolean(cor)} aria-pressed={sel?.lado === lado && sel.v === v}
            data-falha={falha.includes(v)} data-feito={Boolean(cor)} style={cor ? { background: cor } : undefined} lang={lado === 0 ? lang : undefined} className="lg-par" onClick={() => tocarItem(lado, v)}
          >
            <kbd className="lg-atalho" aria-hidden="true">{base + i + 1}</kbd>
            <span>{v}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="lg-pares">
        {coluna(esq, 0, 0)}
        {coluna(dir, 1, esq.length)}
      </div>
      <p className="sr-only" role="status">{aviso}</p>
    </>
  );
}

const TECLAS_ES = ["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"];

function ExOuvir({ ex, idioma, voz, escrever, aoPedirEscrita, valor, aoMudar, travado, lang }: { ex: Ouvir; idioma: Idioma; voz: Voz; escrever: boolean; aoPedirEscrita: () => void; valor: string; aoMudar: (v: string) => void; travado: boolean; lang: string }) {
  const campo = useRef<HTMLInputElement>(null);
  const cursor = useRef<number | null>(null);
  useEffect(() => {
    // Com mouse e teclado, já pode digitar. No celular, abrir o teclado sozinho cobriria o botão de ouvir.
    if (window.matchMedia("(pointer: fine)").matches) campo.current?.focus({ preventScroll: true });
  }, []);
  const inserir = (t: string) => {
    const c = campo.current;
    if (!c) return;
    const i = c.selectionStart ?? valor.length;
    const f = c.selectionEnd ?? i;
    c.focus({ preventScroll: true });
    cursor.current = i + t.length;
    aoMudar(valor.slice(0, i) + t + valor.slice(f));
  };
  // O cursor volta para depois da letra inserida antes de a tela aparecer, sem disputar com o que a pessoa digita em seguida.
  useLayoutEffect(() => {
    if (cursor.current === null) return;
    campo.current?.setSelectionRange(cursor.current, cursor.current);
    cursor.current = null;
  }, [valor]);
  return (
    <>
      {escrever ? (
        <>
          {voz.estado === "sem" && <p className="lg-apoio">Este aparelho não tem voz em {rotuloIdioma(idioma)}, então aqui o treino é pela escrita.</p>}
          <p className="lg-frase">{ex.pt}</p>
          <p className="lg-mascara" lang={lang}>
            <span className="sr-only">Pista com a inicial de cada palavra: </span>
            {mascara(ex.frase)}
          </p>
        </>
      ) : (
        <div className="lg-ouvir">
          <button type="button" data-som="nada" className="lg-falante" data-falando={voz.falando} disabled={voz.estado !== "pronta"} onClick={() => voz.falar(ex.frase)}>
            <IconeSom ligado />
            {voz.estado === "pronta" ? "Ouvir" : "Preparando"}
          </button>
          <button type="button" data-som="nada" className="tecla lg-devagar" disabled={voz.estado !== "pronta"} onClick={() => voz.falar(ex.frase, true)}>
            Mais devagar
          </button>
        </div>
      )}
      <input
        ref={campo} type="text" value={valor} disabled={travado} lang={lang} className="lg-campo" aria-label={`Escreva a frase em ${rotuloIdioma(idioma)}`} placeholder="Escreva aqui"
        autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" onChange={(e) => aoMudar(e.target.value)}
      />
      {idioma === "es" && !travado && (
        <div className="lg-teclas" role="group" aria-label="Letras do espanhol">
          {TECLAS_ES.map((t) => (
            <button key={t} type="button" data-som="nada" className="lg-tecla-letra" aria-label={`Inserir ${t}`} onMouseDown={(e) => e.preventDefault()} onClick={() => inserir(t)}>{t}</button>
          ))}
        </div>
      )}
      {!escrever && !travado && (
        <button type="button" className="lg-link" onClick={aoPedirEscrita}>Não dá para ouvir agora</button>
      )}
    </>
  );
}

// Lição em tela cheia

export type ErroItem = { enunciado: string; certa: string; dada: string; porque: string; falar: string | null };
export type FimLicao = { concluiu: boolean; diretos: number; revisados: number; erros: ErroItem[] };

const ELOGIOS = ["Isso!", "Mandou bem!", "Na órbita certa!", "Certinho!", "É isso aí!"];
const CONSOLOS = ["Quase.", "Essa escapou.", "Não foi dessa vez."];

function TelaLicao({ curso, licao, indice, melhor, voz, aoSair, aoFim }: { curso: Curso; licao: Licao; indice: number; melhor: number; voz: Voz; aoSair: () => void; aoFim: (r: FimLicao) => void }) {
  const lang = curso.idioma;
  const janela = useRef<HTMLDialogElement>(null);
  const titulo = useRef<HTMLParagraphElement>(null);
  const continuar = useRef<HTMLButtonElement>(null);
  const [etapa, setEtapa] = useState<"briefing" | "exercicio" | "pausa">("briefing");
  const [fila, setFila] = useState<number[]>(() => licao.exercicios.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [revisando, setRevisando] = useState(false);
  const [resp, setResp] = useState("");
  const [nota, setNota] = useState<Nota | null>(null);
  const [vidas, setVidas] = useState(VIDAS);
  const [perdeu, setPerdeu] = useState(false); // anima a nave que acabou de sumir
  const [erros, setErros] = useState<ErroItem[]>([]);
  const [erradas, setErradas] = useState<number[]>([]);
  const [diretos, setDiretos] = useState(0);
  const [revisados, setRevisados] = useState(0);
  const [recaidas, setRecaidas] = useState<number[]>([]); // erradas de novo na revisão não somam XP
  const [combo, setCombo] = useState(0);
  const [sair, setSair] = useState(false);
  const [semOuvir, setSemOuvir] = useState(false);

  const total = licao.exercicios.length;
  const idx = fila[pos];
  const ex = licao.exercicios[idx];
  const escrever = semOuvir || voz.estado === "sem";

  useEffect(() => {
    const d = janela.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = antes;
      if (d.open) d.close();
    };
  }, []);

  // Foco acompanha a lição: pergunta nova, para o leitor de tela anunciar; correção, no botão de continuar.
  useEffect(() => {
    if (etapa !== "exercicio" || nota) return;
    if (ex.tipo === "ouvir" && window.matchMedia("(pointer: fine)").matches) return;
    titulo.current?.focus({ preventScroll: true });
    titulo.current?.closest(".lg-miolo")?.scrollTo({ top: 0 });
  }, [etapa, pos, revisando, nota, ex.tipo]);
  useEffect(() => {
    if (nota) continuar.current?.focus({ preventScroll: true });
  }, [nota]);
  // Sem isto, o foco cairia no X ao abrir, e Enter perguntaria se a pessoa quer sair.
  useEffect(() => {
    if (etapa !== "exercicio") janela.current?.querySelector<HTMLButtonElement>("[data-principal]")?.focus({ preventScroll: true });
  }, [etapa]);
  const sairAntes = useRef(false);
  useEffect(() => {
    if (sairAntes.current && !sair) {
      const principal = janela.current?.querySelector<HTMLButtonElement>("[data-principal]");
      if (principal && !principal.disabled) principal.focus({ preventScroll: true });
      else titulo.current?.focus({ preventScroll: true });
    }
    sairAntes.current = sair;
  }, [sair]);

  // Atalhos na janela inteira: um bloco ou par desativado depois do toque perde o foco, e as teclas precisam continuar valendo.
  useEffect(() => {
    const teclado = (e: KeyboardEvent) => {
      // A busca do site escuta / e Ctrl+K. Durante a lição, essas teclas ficam só aqui.
      if (e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) e.stopPropagation();
      if (e.repeat || sair) return;
      const alvo = e.target as HTMLElement;
      const principal = janela.current?.querySelector<HTMLButtonElement>("[data-principal]");
      if (alvo.tagName === "INPUT") {
        if (e.key === "Enter") {
          e.preventDefault();
          principal?.click();
        }
        return;
      }
      if (/^[1-9]$/.test(e.key)) {
        janela.current?.querySelectorAll<HTMLButtonElement>("[data-atalho]")[Number(e.key) - 1]?.click();
      } else if (e.key === "Backspace") {
        const blocos = janela.current?.querySelectorAll<HTMLButtonElement>("[data-bandeja]");
        blocos?.[blocos.length - 1]?.click();
      } else if (e.key === "Enter" && alvo.tagName !== "BUTTON") {
        e.preventDefault();
        principal?.click();
      }
    };
    window.addEventListener("keydown", teclado, true);
    return () => window.removeEventListener("keydown", teclado, true);
  }, [sair]);

  const pontuar = (n: Nota, dada: string) => {
    setNota(n);
    if (n === "errado") {
      som("erro");
      setCombo(0);
      if (revisando) {
        setFila((f) => [...f, idx]);
        setRecaidas((r) => [...r, idx]);
        return;
      }
      setVidas((v) => v - 1);
      setPerdeu(true);
      setErradas((e) => [...e, idx]);
      setErros((e) => [...e, { enunciado: enunciado(ex), certa: gabarito(ex), dada, porque: ex.porque, falar: fraseAlvo(ex) }]);
      return;
    }
    som("acerto");
    setCombo((c) => c + 1);
    if (!revisando) setDiretos((d) => d + 1);
    else if (!recaidas.includes(idx)) setRevisados((r) => r + 1);
  };

  const verificar = () => {
    if (!resp.trim() || nota) return;
    pontuar(conferirExercicio(ex, resp), resp);
  };

  const seguir = () => {
    setNota(null);
    setResp("");
    setPerdeu(false);
    if (vidas <= 0) {
      som("pouso");
      aoFim({ concluiu: false, diretos, revisados, erros });
      return;
    }
    if (pos + 1 < fila.length) {
      setPos(pos + 1);
      return;
    }
    if (!revisando && erradas.length) {
      setFila(erradas);
      setPos(0);
      setRevisando(true);
      setEtapa("pausa");
      return;
    }
    som("pouso");
    aoFim({ concluiu: true, diretos, revisados, erros });
  };

  const avanco = revisando ? 1 : (pos + (nota ? 1 : 0)) / total;
  const acertou = nota === "certo" || nota === "quase";
  const elogio = combo >= 3 ? `${combo} acertos seguidos!` : ELOGIOS[pos % ELOGIOS.length];
  const fala = nota === "quase" ? `Valeu, mas repare na escrita. ${ex.porque}` : acertou ? `${elogio} ${ex.porque}` : `${CONSOLOS[pos % CONSOLOS.length]} ${ex.porque}`;

  return (
    <dialog
      ref={janela} className="lg-tela lg-ceu" aria-label={`Lição ${licao.nome}`}
      onCancel={(e) => {
        e.preventDefault();
        setSair((s) => !s);
      }}
      onClose={aoSair}
    >
      <header className="lg-topo">
        <button type="button" className="lg-fechar" aria-label="Sair da lição" onClick={() => setSair(true)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
        <div className="lg-progresso" role="progressbar" aria-label={revisando ? "Revisão de erros" : "Progresso da lição"} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.round(avanco * total)}>
          <div className="lg-progresso-cheio" style={{ width: `${Math.max(4, avanco * 100)}%` }} data-revisao={revisando}>
            <Nave className="lg-progresso-nave" />
          </div>
        </div>
        <div className="lg-vidas" role="img" aria-label={`${vidas} de ${VIDAS} vidas`}>
          {Array.from({ length: VIDAS }, (_, i) => (
            <span key={i} data-viva={i < vidas} data-perdeu={perdeu && i === vidas}><Nave /></span>
          ))}
        </div>
      </header>

      <div className="lg-miolo">
        <div className="lg-miolo-dentro">
          {etapa === "briefing" && (
            <div className="lg-briefing entrada-seq">
              <Astro i={indice} className="lg-briefing-astro" />
              <p className="lg-instrucao">{licao.nivel}, {curso.nome.toLowerCase()}</p>
              <h2 className="titulo titulo-2">{licao.nome}</h2>
              <p className="lg-apoio">{licao.tema}</p>
              {melhor > 0 && <Estrelas quantas={melhor} />}
              <ul className="lg-ideias">
                {licao.ideias.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <Fala texto={`São ${total} desafios e ${VIDAS} vidas. O que você errar a gente refaz no final, sem perder vida.`} pose="aponta" tamanho={64} />
            </div>
          )}
          {etapa === "pausa" && (
            <div className="lg-briefing entrada-seq">
              <p className="lg-instrucao">Revisão de erros</p>
              <h2 className="titulo titulo-2">{erradas.length === 1 ? "Falta refazer 1 desafio" : `Faltam refazer ${erradas.length} desafios`}</h2>
              <Fala texto="Quem revisa o erro aprende de verdade. Aqui você não perde vida." pose="lupa" tamanho={72} />
            </div>
          )}
          {etapa === "exercicio" && (
            <div key={`${revisando}-${pos}-${idx}`} className="lg-exercicio entrada-pergunta">
              <p ref={titulo} tabIndex={-1} className="lg-instrucao">
                {revisando && <span className="lg-selo-revisao">Revisão</span>}
                {INSTRUCAO(ex, curso.idioma, escrever)}
              </p>
              {ex.tipo === "traduzir" && <ExTraduzir ex={ex} valor={resp} escolher={setResp} travado={Boolean(nota)} lang={lang} voz={voz} />}
              {ex.tipo === "completar" && <ExCompletar ex={ex} valor={resp} escolher={setResp} travado={Boolean(nota)} lang={lang} />}
              {ex.tipo === "ler" && <ExLer ex={ex} valor={resp} escolher={setResp} travado={Boolean(nota)} lang={lang} voz={voz} />}
              {ex.tipo === "montar" && <ExMontar ex={ex} aoMudar={setResp} travado={Boolean(nota)} lang={lang} />}
              {ex.tipo === "pares" && <ExPares ex={ex} lang={lang} aoConcluir={(errou) => pontuar(errou ? "errado" : "certo", errou ? "um par trocado" : "")} />}
              {ex.tipo === "ouvir" && <ExOuvir ex={ex} idioma={curso.idioma} voz={voz} escrever={escrever} aoPedirEscrita={() => setSemOuvir(true)} valor={resp} aoMudar={setResp} travado={Boolean(nota)} lang={lang} />}
            </div>
          )}
        </div>
      </div>

      <footer className="lg-rodape" data-nota={nota ? (acertou ? "certo" : "errado") : undefined}>
        <div className="lg-rodape-dentro">
          {etapa === "briefing" && (
            <button type="button" data-principal="" data-som="lancar" className="tecla tecla-acesa lg-acao" onClick={() => { setEtapa("exercicio"); }}>
              Decolar
              <Seta />
            </button>
          )}
          {etapa === "pausa" && (
            <button type="button" data-principal="" className="tecla tecla-acesa lg-acao" onClick={() => setEtapa("exercicio")}>
              Refazer
              <Seta />
            </button>
          )}
          {etapa === "exercicio" && !nota && ex.tipo !== "pares" && (
            <button type="button" data-principal="" data-som="nada" className="tecla tecla-acesa lg-acao" disabled={!resp.trim()} onClick={verificar}>Verificar</button>
          )}
          {etapa === "exercicio" && !nota && ex.tipo === "pares" && <p className="lg-apoio lg-rodape-dica">Toque em um item de cada coluna.</p>}
          {etapa === "exercicio" && nota && (
            <div className="lg-correcao">
              {nota !== "certo" && (
                <p className="lg-gabarito">
                  {nota === "quase" ? "Com a escrita certa: " : "Resposta certa: "}
                  <strong lang={ex.tipo === "ler" || (ex.tipo === "traduzir" && ex.de === "alvo") ? undefined : lang}>{gabarito(ex)}</strong>
                </p>
              )}
              <Fala key={`${revisando}-${pos}`} texto={fala} pose={acertou ? "comemora" : "pensa"} tamanho={56} />
              <div className="lg-correcao-botoes">
                {ex.tipo !== "ouvir" && ex.tipo !== "pares" && <BotaoOuvir texto={fraseAlvo(ex) ?? ""} voz={voz} rotulo="Ouvir" />}
                <button ref={continuar} type="button" data-principal="" className="tecla tecla-acesa lg-acao" onClick={seguir}>
                  {vidas <= 0 ? "Ver resultado" : "Continuar"}
                  <Seta />
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>

      {sair && (
        <div className="lg-sair" role="alertdialog" aria-label="Sair da lição">
          <div className="lg-sair-caixa entrada-pergunta">
            <p className="titulo titulo-3">Sair da lição?</p>
            <p className="lg-apoio">O que você fez nesta tentativa não fica salvo.</p>
            <button type="button" autoFocus className="tecla tecla-acesa lg-acao" onClick={() => setSair(false)}>Continuar a lição</button>
            <button type="button" className="tecla lg-acao" onClick={aoSair}>Sair</button>
          </div>
        </div>
      )}
    </dialog>
  );
}

// Mapa da trilha

const POSICOES = [50, 27, 44, 72, 52, 27, 42, 70];
const xDe = (i: number) => POSICOES[i % POSICOES.length];

function Rota({ n, feitas }: { n: number; feitas: number }) {
  const ponto = (i: number) => [xDe(i), (i + 0.5) * 100] as const;
  const trecho = (i: number) => {
    const [x0, y0] = ponto(i);
    const [x1, y1] = ponto(i + 1);
    return `C${x0} ${y0 + 50} ${x1} ${y1 - 50} ${x1} ${y1}`;
  };
  const caminho = (de: number, ate: number) => {
    if (ate <= de) return "";
    const [x, y] = ponto(de);
    let d = `M${x} ${y}`;
    for (let i = de; i < ate; i++) d += trecho(i);
    return d;
  };
  return (
    <svg className="lg-rota" viewBox={`0 0 100 ${n * 100}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={caminho(0, n - 1)} className="lg-rota-base" />
      <path d={caminho(0, Math.min(feitas, n - 1))} className="lg-rota-feita" />
    </svg>
  );
}

function Trilha({ p, hoje, aoTrocarIdioma, aoAbrir, aoEncerrar }: { p: Progresso; hoje: string; aoTrocarIdioma: (i: Idioma) => void; aoAbrir: (i: number) => void; aoEncerrar: () => void }) {
  const curso = CURSOS[p.idioma];
  const atual = proximaLicao(p, curso);
  const feitas = curso.licoes.filter((l) => licaoFeita(p, l)).length;
  const seq = sequenciaAtual(p, hoje);
  const estrelas = curso.licoes.reduce((s, l) => s + (p.licoes[l.id]?.estrelas ?? 0), 0);
  const [aviso, setAviso] = useState("");
  const brilhando = useRef<HTMLButtonElement>(null);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No celular, o título da página empurraria o primeiro astro para baixo da navegação. Quem já avançou volta ao ponto em que parou.
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const longe = atual > 1 && brilhando.current;
    (longe ? brilhando.current : raiz.current)?.scrollIntoView({ block: longe ? "center" : "start", behavior: calmo ? "auto" : "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.idioma]);
  useEffect(() => setAviso(""), [p.idioma]);

  const textoFala =
    aviso ||
    (atual === -1
      ? `Trilha de ${curso.nome.toLowerCase()} completa! Repita um planeta para buscar três estrelas ou mude de idioma.`
      : feitas === 0
        ? `Primeira parada: ${curso.licoes[0].nome}. Toque no astro que está brilhando.`
        : `Próxima parada: ${curso.licoes[atual].nome}.`);

  const linhaSeq = seq === 0 ? "Conclua uma lição para começar a sequência" : fezHoje(p, hoje) ? "Hoje já conta" : "Faça uma lição hoje para manter";

  return (
    <div ref={raiz} className="lg lg-ceu">
      <Placar esquerda={`${curso.nome}: ${feitas} de ${curso.licoes.length} lições`} direita={`${p.xp.toLocaleString("pt-BR")} XP`} />
      <div className="lg-idiomas" role="group" aria-label="Idioma">
        {(["en", "es"] as Idioma[]).map((i) => {
          const c = CURSOS[i];
          const n = c.licoes.filter((l) => licaoFeita(p, l)).length;
          return (
            <button key={i} type="button" className="lg-idioma" data-idioma={i} aria-pressed={p.idioma === i} data-som="virar" onClick={() => aoTrocarIdioma(i)}>
              <span className="lg-idioma-sigla" aria-hidden="true">{i.toUpperCase()}</span>
              <span className="lg-idioma-nome">{c.nome}</span>
              <span className="lg-idioma-conta">{n} de {c.licoes.length}</span>
            </button>
          );
        })}
      </div>
      <dl className="lg-painel">
        <div>
          <dt>Sequência</dt>
          <dd className="num">{seq} {seq === 1 ? "dia" : "dias"}</dd>
          <dd className="lg-painel-nota">{linhaSeq}</dd>
        </div>
        <div>
          <dt>Estrelas</dt>
          <dd className="num">{estrelas} de {curso.licoes.length * 3}</dd>
          <dd className="lg-painel-nota">Lição sem erro vale três</dd>
        </div>
      </dl>
      <div className="lg-fala-trilha"><Fala texto={textoFala} pose={aviso ? "pensa" : atual === -1 ? "comemora" : "aponta"} tamanho={60} /></div>
      <div className="lg-mapa">
        <Rota n={curso.licoes.length} feitas={feitas} />
        <ol className="lg-paradas">
          {curso.licoes.map((l, i) => {
            const aberta = licaoAberta(p, curso, i);
            const feita = licaoFeita(p, l);
            const estado = feita ? "feita" : aberta ? "atual" : "trancada";
            const anterior = curso.licoes[i - 1]?.nome;
            return (
              <li key={l.id} className="lg-parada">
                <button
                  ref={estado === "atual" ? brilhando : undefined} type="button" className="lg-astro" data-estado={estado} data-som={aberta ? undefined : "nada"} style={{ left: `${xDe(i)}%` }} aria-disabled={!aberta}
                  aria-label={`${l.nome}, ${l.tema}. ${feita ? `Concluída, ${p.licoes[l.id].estrelas} de 3 estrelas.` : aberta ? "Lição aberta." : `Trancada: conclua ${anterior}.`}`}
                  onClick={() => {
                    if (!aberta) {
                      som("erro");
                      setAviso(`Esse astro ainda está trancado. Conclua ${anterior} para destravar.`);
                      return;
                    }
                    aoAbrir(i);
                  }}
                >
                  <span className="lg-astro-arte">
                    <Astro i={i} className="size-full" />
                    {estado === "atual" && <Nave className="lg-astro-nave" />}
                    {estado === "trancada" && (
                      <svg className="lg-cadeado" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7.5a5 5 0 0 1 10 0V10h1.5v11h-13V10H7Zm2.6 0h4.8V7.5a2.4 2.4 0 0 0-4.8 0V10Z" /></svg>
                    )}
                  </span>
                  <span className="lg-astro-nome">{l.nome}</span>
                  {feita && <Estrelas quantas={p.licoes[l.id].estrelas} />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {p.xp > 0 && (
        <div className="lg-encerrar">
          <button type="button" className="tecla" onClick={aoEncerrar}>Encerrar e ver placar</button>
        </div>
      )}
    </div>
  );
}

// Resultado, fora da tela cheia, para o confete e o carimbo aparecerem por cima

type Resultado = FimLicao & { licao: Licao; indice: number; xp: number; estrelas: number; dias: number; primeiroHoje: boolean; repeticao: boolean };

function TelaResultado({ r, curso, p, aoTentar, aoProxima, aoTrilha, aoEncerrar, voz }: { r: Resultado; curso: Curso; p: Progresso; aoTentar: () => void; aoProxima: () => void; aoTrilha: () => void; aoEncerrar: () => void; voz: Voz }) {
  const raiz = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
    raiz.current?.scrollIntoView({ block: "start" });
  }, []);

  const proxima = curso.licoes[r.indice + 1];
  const temProxima = r.concluiu && proxima !== undefined;
  let fala: string;
  let pose: Pose;
  if (!r.concluiu) {
    fala = "As vidas acabaram, mas cada erro abaixo é uma pista. Leia com calma e decole de novo.";
    pose = "pensa";
  } else if (r.erros.length === 0) {
    fala = r.repeticao ? "Sem nenhum erro nesta volta. É assim que o conteúdo fica." : "Pouso perfeito, sem nenhum erro. Próximo astro destravado.";
    pose = "comemora";
  } else {
    fala = "Lição concluída. Dá uma olhada no que escapou, porque é o que mais rende.";
    pose = "comemora";
  }

  return (
    <div ref={raiz} className="lg lg-ceu">
      <Placar esquerda={r.licao.nome} direita={r.concluiu ? `+${r.xp} XP` : "Sem XP"} />
      <div className="lg-resultado entrada-pergunta">
        {r.concluiu ? <Estrelas quantas={r.estrelas} grande /> : <Astro i={r.indice} className="lg-resultado-astro" />}
        <h2 ref={tituloRef} tabIndex={-1} className="titulo titulo-2">{r.concluiu ? "Pouso concluído" : "Vidas esgotadas"}</h2>
        <Fala texto={fala} pose={pose} tamanho={72} />
        {r.concluiu && (
          <dl className="lg-painel lg-painel-solto">
            <div>
              <dt>Acertos de primeira</dt>
              <dd className="num">{r.diretos} de {r.licao.exercicios.length}</dd>
            </div>
            <div>
              <dt>Sequência</dt>
              <dd className="num">{r.dias} {r.dias === 1 ? "dia" : "dias"}</dd>
              {r.primeiroHoje && <dd className="lg-painel-nota">Contou o dia de hoje</dd>}
            </div>
          </dl>
        )}
        {r.repeticao && r.concluiu && <p className="lg-apoio">Repetição vale metade do XP.</p>}
        {r.erros.length > 0 && (
          <section className="lg-revisao" aria-label="Revisão dos erros">
            <h3 className="titulo titulo-3">Revise seus erros</h3>
            <ul>
              {r.erros.map((e, i) => (
                <li key={i}>
                  <p className="lg-revisao-pergunta">{e.enunciado}</p>
                  {e.dada && <p className="lg-revisao-dada">Sua resposta: {e.dada}</p>}
                  <p className="lg-revisao-certa">Certo: <strong>{e.certa}</strong></p>
                  <p className="lg-revisao-porque">{e.porque}</p>
                  {e.falar && <BotaoOuvir texto={e.falar} voz={voz} rotulo="Ouvir" />}
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="lg-resultado-botoes">
          {!r.concluiu && <button type="button" data-som="lancar" className="tecla tecla-acesa lg-acao" onClick={aoTentar}>Tentar de novo <Seta /></button>}
          {temProxima && <button type="button" data-som="lancar" className="tecla tecla-acesa lg-acao" onClick={aoProxima}>Próxima lição <Seta /></button>}
          <button type="button" className={`tecla lg-acao ${r.concluiu && !temProxima ? "tecla-acesa" : ""}`} onClick={aoTrilha}>Voltar à trilha</button>
          {p.xp > 0 && <button type="button" className="tecla lg-acao" onClick={aoEncerrar}>Ver placar</button>}
        </div>
      </div>
    </div>
  );
}

// O jogo

export default function LinguaGalactica({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const hoje = useHoje();
  const [p, setP] = useState<Progresso>(lerProgresso);
  const [aberta, setAberta] = useState<{ indice: number; tentativa: number } | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const curso = CURSOS[p.idioma];
  const voz = useVoz(p.idioma);

  const abrir = (indice: number) => {
    setResultado(null);
    setAberta((a) => ({ indice, tentativa: (a?.tentativa ?? 0) + 1 }));
  };

  const trocarIdioma = (i: Idioma) => {
    const n = { ...p, idioma: i };
    setP(n);
    salvarProgresso(n);
  };

  const encerrar = () => {
    const feitas = Object.keys(p.licoes).length;
    const total = CURSOS.en.licoes.length + CURSOS.es.licoes.length;
    const seq = sequenciaAtual(p, hoje);
    // O placar é mais curto que o mapa: sem isto, quem encerra lá embaixo não vê a pontuação.
    const palco = document.querySelector(".palco");
    requestAnimationFrame(() => palco?.scrollIntoView({ block: "start" }));
    aoTerminar(p.xp, `${feitas} de ${total} lições concluídas e ${seq} ${seq === 1 ? "dia" : "dias"} de sequência. Leitura, escrita e compreensão auditiva estão entre as habilidades da OBLI.`);
  };

  const fimDaLicao = (r: FimLicao) => {
    if (!aberta) return;
    const licao = curso.licoes[aberta.indice];
    const repeticao = licaoFeita(p, licao);
    const estrelas = estrelasPorErros(r.erros.length);
    const xp = r.concluiu ? xpDaLicao({ diretos: r.diretos, revisados: r.revisados, erros: r.erros.length, repeticao }) : 0;
    const primeiroHoje = r.concluiu && !fezHoje(p, hoje);
    let novo = p;
    if (r.concluiu) {
      novo = registrarLicao(p, licao.id, { xp, estrelas }, hoje);
      setP(novo);
      salvarProgresso(novo);
      carimbar(CARIMBO);
      if (estrelas === 3) confete();
      else som("fim");
    }
    setAberta(null);
    setResultado({ ...r, licao, indice: aberta.indice, xp, estrelas, dias: sequenciaAtual(novo, hoje), primeiroHoje, repeticao });
  };

  return (
    <>
      {resultado ? (
        <TelaResultado
          r={resultado} curso={curso} p={p} voz={voz}
          aoTentar={() => abrir(resultado.indice)} aoProxima={() => abrir(resultado.indice + 1)} aoTrilha={() => setResultado(null)} aoEncerrar={encerrar}
        />
      ) : (
        <Trilha p={p} hoje={hoje} aoTrocarIdioma={trocarIdioma} aoAbrir={abrir} aoEncerrar={encerrar} />
      )}
      {aberta && (
        <TelaLicao
          key={`${p.idioma}-${aberta.indice}-${aberta.tentativa}`} curso={curso} licao={curso.licoes[aberta.indice]} indice={aberta.indice} melhor={p.licoes[curso.licoes[aberta.indice].id]?.estrelas ?? 0} voz={voz}
          aoSair={() => setAberta(null)} aoFim={fimDaLicao}
        />
      )}
    </>
  );
}
