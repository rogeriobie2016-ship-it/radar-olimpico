"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/L";
import { Salvar } from "@/components/Salvar";
import { Seta } from "@/components/Seta";
import { Status } from "@/components/Status";
import { urlAbsoluta } from "@/lib/base";
import { recomendar, type Recomendacao, type Respostas } from "@/lib/escada";
import { useFavoritos } from "@/lib/favoritos";
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
  const sigla = i.sigla && i.sigla.length <= 9 && !i.nome.startsWith(i.sigla) ? i.sigla : null;
  return (
    <article className="relative border-b border-linha py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Status inicio={i.inicio} fim={i.fim} />
            <span className="text-sm text-tinta-2">{ROTULO_TIPO[i.tipo]}, {ROTULO_NIVEL[i.nivel].toLowerCase()}</span>
          </div>
          <h4 className="estreito mt-1.5 text-[1.5rem] font-bold leading-[1.08]">
            <Link href={`/oportunidade/${i.slug}/`} className="no-underline hover:underline">
              {sigla ? `${sigla}, ` : ""}
              <span className={sigla ? "font-medium" : ""}>{i.nome}</span>
            </Link>
          </h4>
        </div>
        <div className="flex shrink-0 items-start gap-1">
          <span className="estreito num pt-1 text-[1.75rem] font-bold leading-none" aria-label={`${rec.compatibilidade}% de compatibilidade`}>
            {rec.compatibilidade}
            <span className="text-base">%</span>
          </span>
          <Salvar id={i.id} nome={i.nome} />
        </div>
      </div>
      <ul className="mt-2 text-[0.9375rem]">
        {rec.motivos.map((m) => (
          <li key={m} className="flex gap-2">
            <span aria-hidden="true" className="text-ok">+</span>
            {m}
          </li>
        ))}
        {rec.alertas.map((a) => (
          <li key={a} className="flex gap-2 text-tinta-2">
            <span aria-hidden="true">!</span>
            {a}
          </li>
        ))}
      </ul>
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

  return (
    <div className="flex flex-col gap-10">
      <header className="entrada-seq flex flex-col gap-3">
        <p className="text-[0.9375rem] font-semibold text-marca-forte">Resultado</p>
        <h2 className="titulo-1">{estudante ? "Sua Escada Olímpica" : "A Escada da sua escola"}</h2>
        <p className="max-w-xl">
          {todas.length} oportunidades em {ORDEM_DEGRAUS.filter((d) => res.degraus[d.n].length).length} degraus, escolhidas entre {itens.length}. As regras de cada olimpíada eliminam primeiro. Depois, a afinidade define a ordem.
        </p>
      </header>

      {todas.length === 0 && (
        <p className="regua pt-4">Nenhuma oportunidade atende a todas as respostas. Tente incluir mais áreas ou permitir eventos com taxa.</p>
      )}

      {/* Cada degrau recua um pouco à direita no computador: a lista sobe como uma escada. */}
      <ol className="flex flex-col gap-10">
        {ORDEM_DEGRAUS.filter((d) => res.degraus[d.n].length).map((d, idx) => (
          <li key={d.n} className="entrada-seq" style={{ marginLeft: `min(${idx * 3.5}rem, calc(${idx * 1.1}vw))` }}>
            <div className="border-t-[3px] border-tinta pt-3">
              <div className="flex items-baseline gap-3">
                <span className="estreito num text-[1.75rem] font-bold leading-none text-marca-forte">{d.n}</span>
                <h3 className="text-[1.875rem]">{d.titulo}</h3>
              </div>
              <p className="mt-1 text-[0.9375rem] text-tinta-2">{d.texto}</p>
              <div className="mt-2 border-t border-linha">
                {res.degraus[d.n].map((rec) => (
                  <Linha key={rec.item.id} rec={rec} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="regua pt-3">
        <h3 className="text-[1.875rem]">{estudante ? "Próximos passos com a escola" : "Plano para a escola"}</h3>
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
        <details className="regua pt-3">
          <summary className="estreito min-h-11 cursor-pointer text-[1.5rem] font-bold">Da sua área, mas ficaram de fora ({relevantes.length})</summary>
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
          className="btn btn-primario"
          onClick={() => {
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
        <span key={i} className={`flex-1 transition-colors duration-300 ${i <= atual ? "bg-marca" : "bg-linha"}`} style={{ height: `${18 + (i / (total - 1)) * 82}%` }} />
      ))}
    </div>
  );
}

export function EscadaCliente({ itens }: { itens: Resumo[] }) {
  const [fase, setFase] = useState<"inicio" | "perguntas" | "resultado">("inicio");
  const [passo, setPasso] = useState(0);
  const [r, setR] = useState<Partial<Respostas>>({});
  const topo = useRef<HTMLDivElement>(null);

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
      <div className="flex flex-col gap-6">
        <h1>Escada Olímpica</h1>
        <p className="max-w-xl text-[1.1875rem] leading-snug">
          Responda 14 perguntas sobre você e a sua escola. A Escada cruza as respostas com as regras de {itens.length} oportunidades e monta um caminho em degraus, do primeiro passo às competições internacionais.
        </p>
        <div aria-hidden="true" className="flex h-32 items-end gap-1 sm:h-44">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="subir-degrau flex-1 bg-tinta" style={{ height: `${10 + i * 6.9}%`, animationDelay: `${i * 45}ms` }} />
          ))}
        </div>
        <button type="button" onClick={() => setFase("perguntas")} className="btn btn-primario self-start text-lg">
          Começar
          <Seta />
        </button>
        <ul className="regua grid gap-x-8 pt-3 text-[0.9375rem] sm:grid-cols-3">
          <li className="border-b border-linha py-3 sm:border-0">Leva cerca de 3 minutos. Nada é enviado: tudo fica no seu aparelho.</li>
          <li className="border-b border-linha py-3 sm:border-0">Regra eliminatória vem primeiro. Série, rede ou convite nunca são compensados por pontos.</li>
          <li className="py-3">Cada recomendação diz por que foi escolhida, e o que ficou de fora também tem explicação.</li>
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

      <fieldset key={p.campo} className="entrada-pergunta flex flex-col gap-4">
        <legend className="titulo titulo-2 mb-1">{p.titulo(r)}</legend>
        {p.ajuda?.(r) && <p className="-mt-2 text-[0.9375rem] text-tinta-2">{p.ajuda(r)}</p>}
        <ul className={`regua ${p.campo === "series" ? "grid grid-cols-2 gap-x-6" : ""}`}>
          {p.opcoes.map((o, i) => (
            <li key={o.valor} className="border-b border-linha">
              <button type="button" aria-pressed={ativo(o)} onClick={() => escolher(o)} className={`flex min-h-[3.5rem] w-full items-center gap-3 py-3 pl-2 pr-2 text-left transition-colors duration-150 ${ativo(o) ? "bg-tinta text-fundo" : "hover:bg-fundo-2"}`}>
                <span aria-hidden="true" className={`num hidden w-5 text-sm sm:block ${ativo(o) ? "" : "text-tinta-2"}`}>
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{o.titulo}</span>
                  {o.texto && <span className={`block text-sm ${ativo(o) ? "" : "text-tinta-2"}`}>{o.texto}</span>}
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
