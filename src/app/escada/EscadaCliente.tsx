"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import Link from "@/components/L";
import { LogoOlimpiada } from "@/components/LogoOlimpiada";
import { Mascote, type Pose, type Quem } from "@/components/Mascote";
import { Salvar } from "@/components/Salvar";
import { Seta } from "@/components/Seta";
import { Status } from "@/components/Status";
import { urlAbsoluta } from "@/lib/base";
import { recomendar, type Recomendacao, type Respostas } from "@/lib/escada";
import { useFavoritos } from "@/lib/favoritos";
import { carimbar, confete, useGuia } from "@/lib/guia";
import { linkWhatsApp } from "@/lib/ics";
import { ROTULO_NIVEL, ROTULO_SERIE, ROTULO_TIPO } from "@/lib/rotulos";
import { useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

type Op = { valor: string; titulo: string; texto?: string };
type Pergunta = {
  campo: keyof Respostas;
  secao: "Você" | "Sua escola";
  titulo: (r: Partial<Respostas>) => string;
  ajuda?: (r: Partial<Respostas>) => string | undefined;
  multipla?: (r: Partial<Respostas>) => boolean;
  ordenada?: boolean;
  maximo?: number;
  opcoes: Op[];
};

const sim = (t: string, x?: string): Op => ({ valor: "sim", titulo: t, texto: x });
const nao = (t: string, x?: string): Op => ({ valor: "nao", titulo: t, texto: x });
const estud = (r: Partial<Respostas>) => r.perfil === "estudante";

const PERGUNTAS: Pergunta[] = [
  {
    campo: "perfil", secao: "Você", titulo: () => "Quem está subindo a escada?",
    opcoes: [
      { valor: "estudante", titulo: "Sou estudante", texto: "Quero saber o que combina comigo" },
      { valor: "professor", titulo: "Sou professor", texto: "Quero orientar estudantes" },
      { valor: "gestor", titulo: "Sou da gestão da escola", texto: "Quero organizar a escola para participar" },
    ],
  },
  {
    campo: "series", secao: "Você", titulo: (r) => (estud(r) ? "Em que série você está?" : "Quais séries você quer mobilizar?"),
    ajuda: (r) => (estud(r) ? undefined : "Pode marcar mais de uma."),
    multipla: (r) => !estud(r),
    opcoes: Object.entries(ROTULO_SERIE).map(([valor, titulo]) => ({ valor, titulo })),
  },
  {
    campo: "areas", secao: "Você", titulo: (r) => (estud(r) ? "O que mais te interessa?" : "Em que áreas a turma tem mais interesse?"),
    ajuda: () => "Marque até três, na ordem de preferência.", multipla: () => true, ordenada: true, maximo: 3,
    opcoes: [
      { valor: "Matemática", titulo: "Matemática", texto: "Números, lógica, desafios" },
      { valor: "Ciências da Natureza", titulo: "Ciências da Natureza", texto: "Física, química, biologia, astronomia" },
      { valor: "Ciências Humanas e Sociais Aplicadas", titulo: "Ciências Humanas", texto: "História, geografia, sociologia, filosofia" },
      { valor: "Linguagens e Códigos", titulo: "Linguagens", texto: "Leitura, literatura, inglês, linguística" },
      { valor: "Tecnologia e Computação", titulo: "Tecnologia", texto: "Programação, robótica, inteligência artificial" },
      { valor: "Meio Ambiente", titulo: "Meio ambiente", texto: "Clima, oceano, restauração da natureza" },
      { valor: "Educação Financeira e Gestão", titulo: "Finanças e gestão", texto: "Dinheiro, investimentos, administração" },
    ],
  },
  {
    campo: "experiencia", secao: "Você", titulo: (r) => (estud(r) ? "Qual a sua experiência com olimpíadas?" : "Qual a experiência da escola com olimpíadas?"),
    opcoes: [
      { valor: "nunca", titulo: "Nunca participei", texto: "Vou começar agora" },
      { valor: "escola", titulo: "Já participei", texto: "Sem premiação ainda, ou só na etapa da escola" },
      { valor: "premiado", titulo: "Já fui premiado", texto: "Medalha, menção ou classificação" },
    ],
  },
  {
    campo: "objetivo", secao: "Você", titulo: () => "O que mais importa agora?",
    opcoes: [
      { valor: "aprender", titulo: "Aprender e ganhar confiança", texto: "Sem pressão de resultado" },
      { valor: "medalha", titulo: "Conquistar uma medalha", texto: "Quero competir para valer" },
      { valor: "universidade", titulo: "Abrir portas na universidade", texto: "Vagas olímpicas e currículo" },
      { valor: "viajar", titulo: "Viajar com um projeto", texto: "Feiras e etapas finais pelo Brasil e pelo mundo" },
    ],
  },
  {
    campo: "formato", secao: "Você", titulo: () => "Prova ou projeto?",
    opcoes: [
      { valor: "prova", titulo: "Prova", texto: "Resolver questões em tempo definido" },
      { valor: "projeto", titulo: "Projeto", texto: "Pesquisar e construir ao longo de meses" },
      { valor: "ambos", titulo: "Os dois" },
    ],
  },
  {
    campo: "participacao", secao: "Você", titulo: () => "Individual ou em equipe?",
    opcoes: [
      { valor: "individual", titulo: "Individual" },
      { valor: "grupo", titulo: "Em equipe" },
      { valor: "ambos", titulo: "Tanto faz" },
    ],
  },
  {
    campo: "tempo", secao: "Você", titulo: () => "Quanto tempo dá para treinar?",
    opcoes: [
      { valor: "pouco", titulo: "Pouco", texto: "Até 1 hora por semana" },
      { valor: "medio", titulo: "Algum", texto: "De 1 a 3 horas por semana" },
      { valor: "muito", titulo: "Bastante", texto: "Mais de 3 horas por semana" },
    ],
  },
  {
    campo: "meninas", secao: "Você", titulo: (r) => (estud(r) ? "Oportunidades exclusivas para meninas se aplicam a você?" : "Há meninas no grupo?"),
    ajuda: () => "Quimeninas, Torneio de Física para Meninas, Competição Feminina da OBI e Futuras Cientistas têm esse recorte.",
    opcoes: [sim("Sim"), nao("Não")],
  },
  {
    campo: "escola", secao: "Sua escola", titulo: () => "Qual o tipo da sua escola?",
    ajuda: () => "Algumas oportunidades e categorias dependem disso.",
    opcoes: [
      { valor: "regular", titulo: "Ensino Médio regular" },
      { valor: "integral", titulo: "Tempo integral (EEMTI)" },
      { valor: "profissional", titulo: "Educação profissional (EEEP)" },
      { valor: "afirmativa", titulo: "Indígena, quilombola, do campo ou família agrícola" },
      { valor: "ceja", titulo: "CEJA ou EJA" },
    ],
  },
  { campo: "orientador", secao: "Sua escola", titulo: (r) => (estud(r) ? "Algum professor pode te orientar?" : "Há professor disponível para orientar?"), opcoes: [sim("Sim"), nao("Ainda não")] },
  {
    campo: "custo", secao: "Sua escola", titulo: () => "Taxa de inscrição é um problema?",
    opcoes: [
      { valor: "gratuito", titulo: "Só gratuitas", texto: "Mostrar apenas o que não tem taxa" },
      { valor: "qualquer", titulo: "Podemos avaliar", texto: "Mostrar também as pagas" },
    ],
  },
  { campo: "internet", secao: "Sua escola", titulo: () => "Há internet estável para provas on-line?", opcoes: [sim("Sim"), nao("Nem sempre")] },
  { campo: "viagem", secao: "Sua escola", titulo: () => "É possível se deslocar para um evento?", ajuda: () => "O JOC pode apoiar viagens de etapas finais, conforme as regras do Regulamento.", opcoes: [sim("Sim"), nao("Hoje, não")] },
];

const FALAS: Partial<Record<keyof Respostas, { texto: string; pose: Pose }>> = {
  perfil: { texto: "Oi! Vou te ajudar a achar o caminho. Primeiro: quem é você?", pose: "acena" },
  series: { texto: "Toda olimpíada tem regra de série. Isso já corta muita coisa.", pose: "pensa" },
  areas: { texto: "Espaço? Números? História? Escolhe o que te dá vontade de investigar.", pose: "lupa" },
  experiencia: { texto: "Sem pressão. Todo medalhista começou de algum lugar.", pose: "parado" },
  objetivo: { texto: "Isso muda bastante o seu caminho. O que mais brilha os olhos?", pose: "foguete" },
  formato: { texto: "Prova é desafio rápido. Projeto é pesquisa de meses, que pode virar viagem.", pose: "tubo" },
  participacao: { texto: "Tem olimpíada que só aceita equipe, e tem a que é solo.", pose: "aponta" },
  tempo: { texto: "Seja sincero: eu não vou te recomendar o que não cabe na sua semana.", pose: "pensa" },
  meninas: { texto: "Tem oportunidade feita para aumentar a presença de meninas na ciência.", pose: "folha" },
  escola: { texto: "Agora sobre a sua escola. Algumas regras dependem disso.", pose: "aponta" },
  orientador: { texto: "Professor orientador abre muita porta. Mas dá para começar sem.", pose: "parado" },
  custo: { texto: "Tem muita coisa gratuita. Se preferir, eu tiro as pagas da lista.", pose: "pensa" },
  internet: { texto: "Quase lá! Algumas provas são on-line.", pose: "aponta" },
  viagem: { texto: "Última! O JOC pode apoiar viagens de etapas finais.", pose: "foguete" },
};

const POSE_DEGRAU: Record<number, Pose> = { 1: "acena", 2: "lupa", 3: "tubo", 4: "foguete" };
const COR_DEGRAU: Record<number, string> = { 1: "#00c9c8", 2: "#fdc13f", 3: "#f58a33", 4: "#f8a8c8" };

const ORDEM_DEGRAUS = [
  { n: 1 as const, titulo: "Comece aqui", texto: "Portas de entrada, sem exigir experiência." },
  { n: 2 as const, titulo: "Avance", texto: "Pedem preparo e dão resultado reconhecido." },
  { n: 3 as const, titulo: "Alcance", texto: "Alto desempenho e seleção mais forte." },
  { n: 4 as const, titulo: "Vá além", texto: "Competições internacionais." },
];

const SEP = ".";
function codificar(r: Partial<Respostas>) {
  return PERGUNTAS.map((p) => {
    const v = r[p.campo];
    if (Array.isArray(v)) return v.map((x) => p.opcoes.findIndex((o) => o.valor === x)).join("-");
    if (typeof v === "boolean") return v ? "1" : "0";
    return p.opcoes.findIndex((o) => o.valor === v);
  }).join(SEP);
}
function decodificar(t: string): Respostas | null {
  const partes = t.split(SEP);
  if (partes.length !== PERGUNTAS.length) return null;
  const r: Record<string, unknown> = {};
  try {
    PERGUNTAS.forEach((p, i) => {
      const parte = partes[i];
      if (p.campo === "series" || p.campo === "areas") r[p.campo] = parte.split("-").map((n) => p.opcoes[+n].valor);
      else if (["meninas", "orientador", "internet", "viagem"].includes(p.campo)) r[p.campo] = parte === "1";
      else r[p.campo] = p.opcoes[+parte].valor;
    });
  } catch {
    return null;
  }
  return r as Respostas;
}

function Linha({ rec }: { rec: Recomendacao }) {
  const i = rec.item;
  return (
    <article className="relative rounded-2xl bg-fundo-2 p-3 shadow-[inset_0_0_0_1.5px_var(--linha)]">
      <div className="flex items-start gap-3">
        <LogoOlimpiada id={i.id} nome={i.nome} sigla={i.sigla} className="size-[4.5rem]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Status inicio={i.inicio} fim={i.fim} />
          </div>
          <h4 className="estreito mt-1 text-[1.125rem] leading-[1.1]">
            <Link href={`/oportunidade/${i.slug}/`} className="no-underline hover:underline">
              {i.nome}
            </Link>
          </h4>
          <p className="text-[0.8125rem] font-semibold text-tinta-2">
            {ROTULO_TIPO[i.tipo]}, {ROTULO_NIVEL[i.nivel].toLowerCase()}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <span className="estreito num grid size-12 place-items-center rounded-full text-[1.0625rem]" style={{ background: `conic-gradient(#00c9c8 ${rec.compatibilidade * 3.6}deg, var(--linha) 0)` }} aria-label={`${rec.compatibilidade}% de compatibilidade`}>
            <span className="grid size-10 place-items-center rounded-full bg-fundo-2">{rec.compatibilidade}</span>
          </span>
          <Salvar id={i.id} nome={i.nome} />
        </div>
      </div>
      <ul className="mt-2 text-[0.875rem] font-semibold leading-snug">
        {rec.motivos.map((m) => (
          <li key={m} className="flex gap-2">
            <span aria-hidden="true" className="font-black text-ok">+</span>
            {m}
          </li>
        ))}
        {rec.alertas.map((a) => (
          <li key={a} className="flex gap-2 text-tinta-2">
            <span aria-hidden="true" className="font-black text-amarelo">!</span>
            {a}
          </li>
        ))}
      </ul>
      {i.link && i.fim && i.fim >= new Date().toISOString().slice(0, 10) && (
        <a href={i.link} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-3 w-full">
          Quero me inscrever
          <Seta direcao="externo" />
        </a>
      )}
    </article>
  );
}

function ResultadoEscada({ itens, r, aoRefazer }: { itens: Resumo[]; r: Respostas; aoRefazer: () => void }) {
  const hoje = useHoje();
  const res = useMemo(() => recomendar(itens, r, hoje), [itens, r, hoje]);
  const { lista, alternar } = useFavoritos();
  const todas = ORDEM_DEGRAUS.flatMap((d) => res.degraus[d.n]);
  const url = urlAbsoluta(`/escada/?r=${codificar(r)}`);
  const primeiras = todas.slice(0, 3).map((x) => x.item.sigla ?? x.item.nome).join(", ");
  const relevantes = res.excluidas.filter((e) => e.item.areas.some((a) => r.areas.includes(a)) && e.item.temFicha).slice(0, 8);
  const estudante = r.perfil === "estudante";
  const { quem } = useGuia();

  useEffect(() => {
    carimbar("escada");
    confete(60);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <header className="entrada-seq flex flex-col gap-3">
        <h2 className="titulo-1 !text-[clamp(2.4rem,10vw,4.5rem)]">{estudante ? <>Sua Escada <span className="text-amarelo">Olímpica</span></> : <>A Escada da sua <span className="text-amarelo">escola</span></>}</h2>
        <Fala texto={`Pronto! Separei ${todas.length} oportunidades entre ${itens.length}. Conferi as regras de cada uma primeiro, e depois o que combina com você.`} pose="comemora" tamanho={96} />
      </header>

      {todas.length === 0 && (
        <p className="regua pt-4">Nenhuma oportunidade atende a todas as respostas. Tente incluir mais áreas ou permitir eventos com taxa.</p>
      )}

      {/* Cada degrau recua um pouco à direita no computador: a lista sobe como uma escada. */}
      <ol className="flex flex-col gap-10">
        {ORDEM_DEGRAUS.filter((d) => res.degraus[d.n].length).map((d, idx) => (
          <li key={d.n} className="entrada-seq" style={{ marginLeft: `min(${idx * 3.5}rem, calc(${idx * 1.1}vw))` }}>
            <div>
              <div className="azulejo flex items-end justify-between gap-2 overflow-visible px-4 pt-3" style={{ background: COR_DEGRAU[d.n], color: "#10201f" }}>
                <div className="pb-3">
                  <h3 className="uppercase !text-[1.75rem]">
                    <span className="num">{d.n}.</span> {d.titulo}
                  </h3>
                  <p className="mt-0.5 text-[0.875rem] font-bold">{d.texto}</p>
                </div>
                <Mascote quem={idx % 2 ? (quem === "menina" ? "menino" : "menina") : quem} pose={POSE_DEGRAU[d.n]} className="-mt-8 w-20 shrink-0" />
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {res.degraus[d.n].map((rec) => (
                  <Linha key={rec.item.id} rec={rec} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="regua">
        <h3 className="uppercase !text-[1.625rem]">{estudante ? "Próximos passos com a escola" : "Plano para a escola"}</h3>
        <ol className="mt-3">
          {res.planoEscola.map((p, i) => (
            <li key={p} className="grid grid-cols-[1.75rem_1fr] border-b border-linha py-3 text-[0.9375rem]">
              <span className="estreito num font-bold">{i + 1}</span>
              {p}
            </li>
          ))}
        </ol>
      </section>

      {relevantes.length > 0 && (
        <details className="regua">
          <summary className="estreito min-h-11 cursor-pointer text-[1.25rem]">Da sua área, mas ficaram de fora ({relevantes.length})</summary>
          <ul className="mt-2">
            {relevantes.map((e) => (
              <li key={e.item.id} className="border-b border-linha py-2.5 text-[0.9375rem]">
                <Link href={`/oportunidade/${e.item.slug}/`} className="font-semibold no-underline hover:underline">
                  {e.item.sigla ?? e.item.nome}
                </Link>
                <span className="block text-tinta-2">{e.motivo}.</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="sem-print grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="btn btn-marca"
          onClick={() => {
            confete(30);
            todas.forEach((x) => {
              if (!lista.includes(x.item.id)) alternar(x.item.id);
            });
          }}
        >
          Salvar todas na lista
        </button>
        <a href={linkWhatsApp(`Minha Escada Olímpica: ${primeiras}. Monte a sua: ${url}`)} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
          Compartilhar no WhatsApp
        </a>
        <button type="button" className="btn btn-secundario" onClick={aoRefazer}>
          Refazer
        </button>
      </div>
      <p className="text-sm text-tinta-2">
        A compatibilidade é uma estimativa. Série, rede e exigências vêm do Catálogo 2026 e dos sites oficiais. Sempre confirme no regulamento de cada evento.
      </p>
    </div>
  );
}

/** Degraus de progresso: a cada resposta, um degrau a mais acende. */
function Progresso({ atual, total }: { atual: number; total: number }) {
  return (
    <div aria-hidden="true" className="flex h-9 items-end gap-[3px]">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="flex-1 rounded-t-[4px] transition-all duration-300" style={{ height: `${18 + (i / (total - 1)) * 82}%`, background: i <= atual ? ["#f58a33", "#00c9c8", "#fdc13f"][i % 3] : "var(--linha)" }} />
      ))}
    </div>
  );
}

export function EscadaCliente({ itens }: { itens: Resumo[] }) {
  const [fase, setFase] = useState<"inicio" | "perguntas" | "resultado">("inicio");
  const [passo, setPasso] = useState(0);
  const [r, setR] = useState<Partial<Respostas>>({});
  const topo = useRef<HTMLDivElement>(null);
  const { quem: guia, escolher: escolherGuia } = useGuia();
  const escolher_ = escolherGuia;

  useEffect(() => {
    const salvo = new URLSearchParams(window.location.search).get("r");
    const d = salvo ? decodificar(salvo) : null;
    if (d) {
      setR(d);
      setFase("resultado");
    }
  }, []);

  const p = PERGUNTAS[passo];

  const irPara = useCallback((n: number) => {
    if (n >= PERGUNTAS.length) setFase("resultado");
    else setPasso(n);
    requestAnimationFrame(() => topo.current?.scrollIntoView({ block: "start" }));
  }, []);

  useEffect(() => {
    if (fase === "resultado" && Object.keys(r).length === PERGUNTAS.length) window.history.replaceState(null, "", `?r=${codificar(r)}`);
  }, [fase, r]);

  const valorDe = (v: string): Respostas[keyof Respostas] => (v === "sim" ? true : v === "nao" ? false : (v as never));

  const escolher = useCallback(
    (op: Op) => {
      const multipla = p.multipla?.(r);
      if (multipla) {
        setR((a) => {
          const atual = (a[p.campo] as string[] | undefined) ?? [];
          if (atual.includes(op.valor)) return { ...a, [p.campo]: atual.filter((x) => x !== op.valor) };
          if (p.maximo && atual.length >= p.maximo) return a;
          return { ...a, [p.campo]: [...atual, op.valor] };
        });
        return;
      }
      const valor = p.campo === "series" ? [op.valor] : valorDe(op.valor);
      setR((a) => ({ ...a, [p.campo]: valor }));
      setTimeout(() => irPara(passo + 1), 170); // tempo de ver a opção marcada
    },
    [p, r, passo, irPara],
  );

  // Teclado: números escolhem, Enter avança.
  useEffect(() => {
    if (fase !== "perguntas") return;
    const tecla = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= p.opcoes.length) escolher(p.opcoes[n - 1]);
      else if (e.key === "Enter" && p.multipla?.(r) && ((r[p.campo] as string[] | undefined)?.length ?? 0) > 0) irPara(passo + 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fase, p, r, passo, escolher, irPara]);

  const refazer = () => {
    setR({});
    setPasso(0);
    setFase("perguntas");
    window.history.replaceState(null, "", window.location.pathname);
  };

  if (fase === "resultado" && Object.keys(r).length === PERGUNTAS.length) return <ResultadoEscada itens={itens} r={r as Respostas} aoRefazer={refazer} />;

  if (fase === "inicio")
    return (
      <div className="flex flex-col gap-5">
        <h1>
          Escada <span className="text-amarelo">Olímpica</span>
        </h1>
        <p className="max-w-xl text-[1.125rem] font-bold leading-snug">14 perguntas sobre você e a sua escola. No final, um caminho em degraus com as olimpíadas certas para vocês, do primeiro passo às competições internacionais.</p>

        <div>
          <p className="estreito text-lg">Quem vai subir com você?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["menina", "menino"] as Quem[]).map((q) => (
              <button key={q} type="button" onClick={() => escolher_(q)} aria-pressed={guia === q} className="azulejo relative flex flex-col items-center overflow-hidden pt-3 transition-transform duration-200 active:scale-95" style={{ background: guia === q ? (q === "menina" ? "#f58a33" : "#00c9c8") : "var(--fundo-2)", color: guia === q ? "#10201f" : "var(--tinta)" }}>
                <Mascote quem={q} pose={guia === q ? "comemora" : "acena"} className="w-28 sm:w-36" />
                <span className="estreito w-full bg-black/10 py-2 text-[0.9375rem]">{q === "menina" ? "Cientista da folha" : "Cientista do microscópio"}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={() => setFase("perguntas")} className="btn btn-primario text-lg sm:self-start">
          Começar a subir
          <Seta />
        </button>
        <ul className="grid gap-2 text-[0.875rem] font-semibold sm:grid-cols-3">
          <li className="rounded-2xl bg-fundo-2 p-3">Leva uns 3 minutos. Nada é enviado: fica tudo no seu aparelho.</li>
          <li className="rounded-2xl bg-fundo-2 p-3">Regra vem primeiro. Série, rede ou convite nunca são compensados por pontos.</li>
          <li className="rounded-2xl bg-fundo-2 p-3">Cada recomendação diz por que foi escolhida, e o que ficou de fora também.</li>
        </ul>
      </div>
    );

  const multipla = p.multipla?.(r);
  const marcados = r[p.campo];
  const ativo = (o: Op) => {
    if (Array.isArray(marcados)) return (marcados as string[]).includes(o.valor);
    if (typeof marcados === "boolean") return (marcados && o.valor === "sim") || (!marcados && o.valor === "nao");
    return marcados === o.valor;
  };
  const ordem = (o: Op) => (Array.isArray(marcados) ? (marcados as string[]).indexOf(o.valor) + 1 : 0);
  const qtd = Array.isArray(marcados) ? marcados.length : 0;

  return (
    <div ref={topo} className="flex min-h-[70dvh] scroll-mt-20 flex-col gap-5">
      <div>
        <Progresso atual={passo} total={PERGUNTAS.length} />
        <div className="mt-2 flex items-center justify-between text-[0.9375rem]">
          <span className="num font-medium">
            {p.secao}, {passo + 1} de {PERGUNTAS.length}
          </span>
          {passo > 0 && (
            <button type="button" onClick={() => irPara(passo - 1)} className="link min-h-11">
              Voltar
            </button>
          )}
        </div>
      </div>

      {FALAS[p.campo] && <Fala key={`f-${p.campo}`} texto={FALAS[p.campo]!.texto} pose={FALAS[p.campo]!.pose} tamanho={84} />}
      <fieldset key={p.campo} className="entrada-pergunta flex flex-col gap-4">
        <legend className="titulo titulo-2 mb-1">{p.titulo(r)}</legend>
        {p.ajuda?.(r) && <p className="-mt-2 text-[0.9375rem] text-tinta-2">{p.ajuda(r)}</p>}
        <ul className={`grid gap-2 ${p.campo === "series" ? "grid-cols-2" : ""}`}>
          {p.opcoes.map((o, i) => (
            <li key={o.valor} className="grid">
              <button type="button" aria-pressed={ativo(o)} onClick={() => escolher(o)} className={`flex min-h-[3.5rem] w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 ease-[cubic-bezier(.3,1.6,.5,1)] active:scale-[0.97] ${ativo(o) ? "scale-[1.02] bg-turquesa text-[#05272a]" : "bg-fundo-2 shadow-[inset_0_0_0_1.5px_var(--linha)] hover:-translate-y-0.5"}`}>
                <span aria-hidden="true" className={`num hidden w-5 text-sm sm:block ${ativo(o) ? "" : "text-tinta-2"}`}>
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="estreito block leading-snug">{o.titulo}</span>
                  {o.texto && <span className={`block text-[0.8125rem] font-semibold ${ativo(o) ? "" : "text-tinta-2"}`}>{o.texto}</span>}
                </span>
                {p.ordenada && ordem(o) > 0 && <span className="estreito num text-2xl font-bold">{ordem(o)}</span>}
              </button>
            </li>
          ))}
        </ul>
        {multipla && (
          <button type="button" className="btn btn-primario sticky bottom-[4.25rem] self-stretch sm:self-start lg:bottom-4" disabled={!qtd} onClick={() => irPara(passo + 1)}>
            Continuar
            <Seta />
          </button>
        )}
      </fieldset>
    </div>
  );
}
