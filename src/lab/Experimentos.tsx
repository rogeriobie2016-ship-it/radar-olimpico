"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Carrossel } from "@/components/Carrossel";
import Link from "@/components/L";
import { LogoOlimpiada } from "@/components/LogoOlimpiada";
import { tocar } from "@/lib/som";
import { ALVO_PERIODO, BATERIA, CAPITAL, carater, embaralhar, ETAPAS_PESQUISA, FATOS, FOCO_CERTO, GRADE_ROBO, INICIO_ROBO, minutosLuz, nitidez, PARTES_CELULA, periodo, PLANETAS, rodarPrograma, saldo, SEQUENCIAS, SUBSTANCIAS, TAXA, TOLERANCIA_PERIODO, type Comando, type IdEstacao } from "./estacoes";

export type ItemInternacional = { id: string; slug: string; nome: string; sigla: string | null; tipo: string; idiomas: string[] | null; bolsa: boolean };

export type PropsExperimento = {
  controlar: (nome: string, valor?: unknown) => void;
  concluir: () => void;
  falar: (texto: string) => void;
  feito: boolean;
};

const num = (v: number, casas = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

const tempoLuz = (min: number) => (min < 60 ? `${num(min, min < 10 ? 1 : 0)} minutos` : `${Math.floor(min / 60)} h ${Math.round(min % 60)} min`);

function Telescopio({ controlar, concluir, falar }: PropsExperimento) {
  const [vistos, setVistos] = useState<string[]>([]);
  const [i, setI] = useState<number | null>(null);
  const p = i === null ? null : PLANETAS[i];
  const ver = (n: number) => {
    const alvo = PLANETAS[n];
    setI(n);
    controlar("apontar", n);
    tocar("virar");
    const novo = vistos.includes(alvo.id) ? vistos : [...vistos, alvo.id];
    setVistos(novo);
    falar(`${alvo.nome} está, em média, a ${num(alvo.ua, 2)} vezes a distância Terra-Sol. A luz do Sol leva cerca de ${tempoLuz(minutosLuz(alvo.ua))} até lá.`);
    if (novo.length === 3) concluir();
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="ocular" aria-hidden="true">
        {p ? (
          <span className="relative block rounded-full" key={p.id} style={{ width: p.raio * 2, height: p.raio * 2, background: `radial-gradient(circle at 35% 30%, #ffffffaa, ${p.cor} 45%, #0008 130%)` }}>
            {p.aneis && <span className="absolute left-1/2 top-1/2 h-[28%] w-[190%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[50%] border-[5px] border-[#f2e2b6]" />}
          </span>
        ) : (
          <span className="px-6 text-center text-sm font-bold text-[#bfe8ff]">Escolhe um planeta</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Planetas">
        {PLANETAS.map((pl, n) => (
          <button key={pl.id} type="button" onClick={() => ver(n)} aria-pressed={i === n} data-som="nada" className="lab-opcao !px-1 text-[0.8125rem]">
            {vistos.includes(pl.id) ? "✓ " : ""}
            {pl.nome}
          </button>
        ))}
      </div>
      <p className="text-sm font-bold">{num(Math.min(vistos.length, 3))} de 3 planetas observados</p>
    </div>
  );
}

function Microscopio({ controlar, concluir, falar }: PropsExperimento) {
  const [foco, setFoco] = useState(18);
  const [partes, setPartes] = useState<string[]>([]);
  const n = nitidez(foco);
  const nitido = Math.abs(foco - FOCO_CERTO) <= 7;
  useEffect(() => controlar("nitidez", n), [controlar, n]);
  const tocarParte = (id: string) => {
    const pt = PARTES_CELULA.find((x) => x.id === id)!;
    tocar("acerto");
    falar(`${pt.nome}: ${pt.texto}`);
    const novo = partes.includes(id) ? partes : [...partes, id];
    setPartes(novo);
    if (novo.length === 3) concluir();
  };
  const ponto = (id: string, x: string, y: string) => (
    <button key={id} type="button" disabled={!nitido} onClick={() => tocarParte(id)} data-som="nada" aria-label={PARTES_CELULA.find((p) => p.id === id)!.nome} className={`ponto-celula ${partes.includes(id) ? "ponto-visto" : ""}`} style={{ left: x, top: y }}>
      {partes.includes(id) ? "✓" : "+"}
    </button>
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="ocular">
        <svg viewBox="0 0 200 200" className="size-full transition-[filter] duration-150" style={{ filter: `blur(${(1 - n) * 12}px)` }} aria-hidden="true">
          <rect width="200" height="200" fill="#d9f5c9" />
          <rect x="24" y="30" width="152" height="140" rx="16" fill="#b9e8a0" stroke="#3f8f3a" strokeWidth="7" />
          <rect x="62" y="60" width="86" height="82" rx="26" fill="#d9f0ff" stroke="#7fb0d6" strokeWidth="2" />
          <circle cx="52" cy="72" r="15" fill="#7a3fc9" />
          {[[44, 118], [66, 150], [152, 54], [160, 150], [100, 46], [40, 148], [162, 104]].map(([x, y]) => (
            <ellipse key={`${x}${y}`} cx={x} cy={y} rx="10" ry="6" fill="#1f9a4d" transform={`rotate(${x} ${x} ${y})`} />
          ))}
        </svg>
        {ponto("parede", "13%", "48%")}
        {ponto("nucleo", "26%", "36%")}
        {ponto("cloroplasto", "80%", "75%")}
        {ponto("vacuolo", "52%", "50%")}
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Foco
        <input type="range" min={0} max={100} value={foco} onChange={(e) => setFoco(Number(e.target.value))} className="lab-faixa" aria-valuetext={nitido ? "Nítido" : "Fora de foco"} />
      </label>
      <p className="text-sm font-bold">{nitido ? `Nítido! Toca nos pontos: ${partes.length} de 3` : "Ainda embaçado. Vai girando o foco."}</p>
    </div>
  );
}

function Quimica({ controlar, concluir, falar }: PropsExperimento) {
  const [testados, setTestados] = useState<string[]>([]);
  const [atual, setAtual] = useState<(typeof SUBSTANCIAS)[number] | null>(null);
  const testar = (s: (typeof SUBSTANCIAS)[number]) => {
    setAtual(s);
    controlar("cor", s.cor);
    tocar("pouso");
    falar(`${s.nome}: pH perto de ${num(s.ph, s.ph % 1 ? 1 : 0)}. É ${carater(s.ph)}, e o suco de repolho fica com esta cor.`);
    const novo = testados.includes(s.id) ? testados : [...testados, s.id];
    setTestados(novo);
    if (novo.length === 3) concluir();
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-center gap-3" aria-hidden="true">
        <span className="frasco" style={{ "--cor": atual?.cor ?? "#7a3fc9" } as React.CSSProperties} />
        <div className="regua-ph">
          {[2, 4, 6, 7, 8, 10, 12].map((v) => (
            <span key={v} data-ativo={atual ? Math.abs(atual.ph - v) <= 1 : false}>
              {v}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Substâncias">
        {SUBSTANCIAS.map((s) => (
          <button key={s.id} type="button" onClick={() => testar(s)} aria-pressed={atual?.id === s.id} data-som="nada" className="lab-opcao text-[0.875rem]">
            {testados.includes(s.id) ? "✓ " : ""}
            {s.nome}
          </button>
        ))}
      </div>
      <p className="text-sm">Valores aproximados: variam com a concentração de cada produto.</p>
    </div>
  );
}

function Fisica({ controlar, concluir, falar, feito }: PropsExperimento) {
  const [l, setL] = useState(0.5);
  const t = periodo(l);
  const certo = Math.abs(t - ALVO_PERIODO) <= TOLERANCIA_PERIODO;
  useEffect(() => controlar("comprimento", l), [controlar, l]);
  useEffect(() => {
    if (certo && !feito) {
      falar("Isso! Um pêndulo de cerca de 1 metro leva uns 2 segundos para ir e voltar.");
      concluir();
    }
  }, [certo, feito, concluir, falar]);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 text-center">
        <p className="lab-medida">
          <span>Comprimento</span>
          <strong>{num(l, 2)} m</strong>
        </p>
        <p className={`lab-medida ${certo ? "lab-medida-certa" : ""}`}>
          <span>Período</span>
          <strong>{num(t, 2)} s</strong>
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Comprimento do fio
        <input type="range" min={0.25} max={1.5} step={0.01} value={l} onChange={(e) => setL(Number(e.target.value))} className="lab-faixa" aria-valuetext={`${num(l, 2)} metros`} />
      </label>
      <p className="text-sm font-bold">Meta: período de {num(ALVO_PERIODO)} segundos. Fórmula: T = 2π√(L/g), para balanços pequenos.</p>
    </div>
  );
}

function Matematica({ controlar, concluir, falar }: PropsExperimento) {
  const [n, setN] = useState(0);
  const [errada, setErrada] = useState<number | null>(null);
  const atual = SEQUENCIAS[Math.min(n, SEQUENCIAS.length - 1)];
  useEffect(() => controlar("escrever", [`${atual.numeros.join(", ")}, ?`, "Qual é o próximo?"]), [controlar, atual]);
  const responder = (o: number) => {
    if (o !== atual.certa) {
      tocar("erro");
      setErrada(o);
      falar(`Quase. Dica: ${atual.dica}`);
      return;
    }
    tocar("acerto");
    setErrada(null);
    falar(atual.dica);
    if (n + 1 >= SEQUENCIAS.length) {
      controlar("escrever", ["Três de três!", "Olho clínico para padrões"]);
      setN(SEQUENCIAS.length);
      concluir();
    } else setN(n + 1);
  };
  if (n >= SEQUENCIAS.length) return <p className="lab-medida lab-medida-certa py-4 text-center font-bold">Três de três!</p>;
  return (
    <div className="flex flex-col gap-3">
      <p className="estreito rounded-xl bg-[#0d5c54] p-3 text-center text-xl text-white">{atual.numeros.join(", ")}, ?</p>
      <div className="grid grid-cols-3 gap-1.5">
        {atual.opcoes.map((o) => (
          <button key={o} type="button" onClick={() => responder(o)} data-som="nada" className={`lab-opcao estreito text-xl ${errada === o ? "lab-opcao-errada" : ""}`}>
            {o}
          </button>
        ))}
      </div>
      <p className="text-sm font-bold">Sequência {n + 1} de {SEQUENCIAS.length}</p>
    </div>
  );
}

const ROTULO_CMD: Record<Comando, string> = { cima: "↑", baixo: "↓", esquerda: "←", direita: "→" };
const NOME_CMD: Record<Comando, string> = { cima: "Para cima", baixo: "Para baixo", esquerda: "Para a esquerda", direita: "Para a direita" };

function Robotica({ controlar, concluir, falar }: PropsExperimento) {
  const [programa, setPrograma] = useState<Comando[]>([]);
  const [robo, setRobo] = useState(INICIO_ROBO);
  const [rodando, setRodando] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const rodar = () => {
    if (!programa.length || rodando) return;
    const r = rodarPrograma(programa);
    setRodando(true);
    let i = 0;
    const passo = () => {
      setRobo(r.caminho[i]);
      tocar("passo", 1 + i * 0.05);
      i++;
      if (i < r.caminho.length) {
        timer.current = setTimeout(passo, 320);
        return;
      }
      setRodando(false);
      if (r.chegou) {
        controlar("festejar");
        falar("Bateria carregada! Funcionou porque você pensou a sequência antes.");
        concluir();
      } else {
        tocar("erro");
        falar(r.bateu ? "O robô bateu na parede. Ajusta o programa e tenta de novo." : "O programa acabou antes da bateria. Falta caminho.");
        timer.current = setTimeout(() => setRobo(INICIO_ROBO), 700);
      }
    };
    passo();
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="grade-robo" role="img" aria-label={`Grade de 4 por 4. Robô na coluna ${robo.x + 1}, linha ${robo.y + 1}. Bateria na coluna ${BATERIA.x + 1}, linha ${BATERIA.y + 1}.`}>
        {GRADE_ROBO.flatMap((linha, y) =>
          linha.map((c, x) => (
            <span key={`${x}-${y}`} data-parede={c === 1}>
              {robo.x === x && robo.y === y ? "🤖" : BATERIA.x === x && BATERIA.y === y ? "🔋" : ""}
            </span>
          )),
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Adicionar comando">
        {(Object.keys(ROTULO_CMD) as Comando[]).map((c) => (
          <button key={c} type="button" disabled={rodando || programa.length >= 12} onClick={() => setPrograma([...programa, c])} aria-label={NOME_CMD[c]} className="lab-opcao text-xl">
            {ROTULO_CMD[c]}
          </button>
        ))}
      </div>
      <p className="min-h-9 rounded-xl bg-black/25 px-3 py-1.5 font-bold tracking-widest" aria-label={`Programa: ${programa.map((c) => NOME_CMD[c]).join(", ") || "vazio"}`}>
        {programa.map((c) => ROTULO_CMD[c]).join(" ") || <span className="text-sm font-semibold tracking-normal opacity-80">Toca nas setas para montar o programa</span>}
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-1.5">
        <button type="button" onClick={rodar} disabled={rodando || !programa.length} className="lab-acao">
          {rodando ? "Rodando" : "Rodar programa"}
        </button>
        <button type="button" onClick={() => { setPrograma([]); setRobo(INICIO_ROBO); }} disabled={rodando} className="lab-opcao">
          Limpar
        </button>
      </div>
    </div>
  );
}

/** Tocar os itens na ordem certa. Serve para a linha do tempo e para as etapas da pesquisa. */
function Ordenar({ itens, instrucao, concluir, falar, erro }: { itens: string[]; instrucao: string; concluir: () => void; falar: (t: string) => void; erro: string }) {
  const baralho = useMemo(() => embaralhar(itens), [itens]);
  const [feitos, setFeitos] = useState<string[]>([]);
  const [errado, setErrado] = useState<string | null>(null);
  const tocarItem = (t: string) => {
    if (t !== itens[feitos.length]) {
      tocar("erro");
      setErrado(t);
      falar(erro);
      return;
    }
    tocar("passo", 1 + feitos.length * 0.1);
    setErrado(null);
    const novo = [...feitos, t];
    setFeitos(novo);
    if (novo.length === itens.length) concluir();
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold">{instrucao}</p>
      <ol className="flex flex-col gap-1">
        {itens.map((_, i) => (
          <li key={i} className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-1 text-[0.9375rem] font-bold ${feitos[i] ? "bg-[#0a7f43] text-white" : "border-2 border-dashed border-white/30"}`}>
            <span className="opacity-70">{i + 1}.</span> {feitos[i] ?? ""}
          </li>
        ))}
      </ol>
      <div className="mt-1 grid gap-1.5">
        {baralho
          .filter((t) => !feitos.includes(t))
          .map((t) => (
            <button key={t} type="button" onClick={() => tocarItem(t)} data-som="nada" className={`lab-opcao text-left ${errado === t ? "lab-opcao-errada" : ""}`}>
              {t}
            </button>
          ))}
      </div>
    </div>
  );
}

const TEXTOS_FATOS = FATOS.map((f) => f.texto);

function Historia({ concluir, falar, feito }: PropsExperimento) {
  return feito ? (
    <ul className="grid gap-1 text-[0.9375rem] font-bold">
      {FATOS.map((f) => (
        <li key={f.ano} className="rounded-xl bg-[#0fa85a] px-3 py-1.5 text-white">
          {f.ano}: {f.texto}
        </li>
      ))}
    </ul>
  ) : (
    <Ordenar itens={TEXTOS_FATOS} instrucao="Toca do mais antigo para o mais recente." concluir={concluir} falar={falar} erro="Hum, esse não é o próximo. Pensa no que veio antes." />
  );
}

const CONDICOES = [
  { id: "luz", nome: "Luz", marca: "☀" },
  { id: "agua", nome: "Água", marca: "💧" },
  { id: "co2", nome: "Gás carbônico", marca: "CO₂" },
];

function Planeta({ controlar, concluir, falar }: PropsExperimento) {
  const [ligado, setLigado] = useState<string[]>([]);
  const alternar = (id: string) => {
    const novo = ligado.includes(id) ? ligado.filter((x) => x !== id) : [...ligado, id];
    setLigado(novo);
    tocar(novo.length === 3 ? "achou" : "passo");
    controlar("crescer", 0.45 + (novo.length === 3 ? 0.55 : novo.length * 0.04));
    if (novo.length === 3) {
      falar("Com as três, a planta produz glicose e libera oxigênio. Olha as bolinhas subindo!");
      concluir();
    } else if (novo.length) falar("Bom começo, mas sozinho isso não basta. O que mais falta?");
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1.5">
        {CONDICOES.map((c) => (
          <button key={c.id} type="button" aria-pressed={ligado.includes(c.id)} onClick={() => alternar(c.id)} data-som="nada" className="lab-opcao flex flex-col items-center gap-0.5 !py-2 text-[0.8125rem]">
            <span className="text-xl leading-none">{c.marca}</span>
            {c.nome}
          </button>
        ))}
      </div>
      <p className="rounded-xl bg-black/25 p-2 text-center text-[0.8125rem] font-bold">6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂</p>
    </div>
  );
}

function Projetos({ concluir, falar, feito }: PropsExperimento) {
  return feito ? (
    <ol className="grid gap-1 text-[0.9375rem] font-bold">
      {ETAPAS_PESQUISA.map((f, i) => (
        <li key={f} className="rounded-xl bg-[#0fa85a] px-3 py-1.5 text-white">
          {i + 1}. {f}
        </li>
      ))}
    </ol>
  ) : (
    <Ordenar itens={ETAPAS_PESQUISA} instrucao="Toca na ordem: o que vem primeiro numa pesquisa?" concluir={concluir} falar={falar} erro="Essa etapa vem depois. O que precisa acontecer antes dela?" />
  );
}

function Financas({ controlar, concluir, falar, feito }: PropsExperimento) {
  const [meses, setMeses] = useState(12);
  const valor = saldo(meses);
  const dobrou = valor >= CAPITAL * 2;
  useEffect(() => controlar("moedas", Math.min(1, (valor - CAPITAL) / (CAPITAL * 1.3) + 0.12)), [controlar, valor]);
  useEffect(() => {
    if (dobrou && !feito) {
      falar(`Dobrou com ${meses} meses: quase 6 anos. Conta fácil: 72 dividido pela taxa dá o tempo aproximado.`);
      concluir();
    }
  }, [dobrou, feito, concluir, falar, meses]);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 text-center">
        <p className="lab-medida">
          <span>Tempo</span>
          <strong>{meses} meses</strong>
        </p>
        <p className={`lab-medida ${dobrou ? "lab-medida-certa" : ""}`}>
          <span>Saldo</span>
          <strong>R$ {num(valor, 2)}</strong>
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Quantos meses?
        <input type="range" min={0} max={100} value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="lab-faixa" aria-valuetext={`${meses} meses`} />
      </label>
      <p className="text-sm">
        Exemplo de conta, com taxa fixa de {num(TAXA * 100)}% ao mês. Não é recomendação de investimento.
      </p>
    </div>
  );
}

function Mundo({ internacionais, concluir }: PropsExperimento & { internacionais: ItemInternacional[] }) {
  const [tipo, setTipo] = useState("oportunidades");
  const [idioma, setIdioma] = useState<string | null>(null);
  const idiomas = useMemo(() => [...new Set(internacionais.flatMap((i) => i.idiomas ?? []))].sort(), [internacionais]);
  const filtrados = internacionais.filter((i) => (tipo === "oportunidades" ? i.tipo !== "olimpiada" : i.tipo === "olimpiada") && (!idioma || i.idiomas?.includes(idioma)));
  useEffect(() => concluir(), [concluir]);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="O que você procura">
        <button type="button" onClick={() => setTipo("oportunidades")} aria-pressed={tipo === "oportunidades"} className="lab-opcao text-[0.875rem]">
          Bolsas, programas e feiras
        </button>
        <button type="button" onClick={() => setTipo("olimpiada")} aria-pressed={tipo === "olimpiada"} className="lab-opcao text-[0.875rem]">
          Olimpíadas lá fora
        </button>
      </div>
      {idiomas.length > 0 && (
        <Carrossel rotulo="Idiomas" compacto classe="gap-1.5">
          <button type="button" onClick={() => setIdioma(null)} aria-pressed={!idioma} className="lab-opcao shrink-0 !min-h-9 !py-1 text-[0.8125rem]">
            Qualquer idioma
          </button>
          {idiomas.map((i) => (
            <button key={i} type="button" onClick={() => setIdioma(i)} aria-pressed={idioma === i} className="lab-opcao shrink-0 !min-h-9 !py-1 text-[0.8125rem]">
              {i}
            </button>
          ))}
        </Carrossel>
      )}
      {filtrados.length ? (
        <ul className="grid max-h-72 gap-1.5 overflow-y-auto pr-1">
          {filtrados.map((i) => (
            <li key={i.id}>
              <Link href={`/oportunidade/${i.slug}/`} className="flex items-center gap-2 rounded-xl bg-white/10 p-1.5 no-underline hover:bg-white/20">
                <LogoOlimpiada id={i.id} nome={i.nome} sigla={i.sigla} className="h-11 w-14 shrink-0" />
                <span className="min-w-0 text-[0.875rem] font-bold leading-tight">
                  {i.nome}
                  {i.idiomas?.length ? <span className="block text-xs font-semibold opacity-80">{i.idiomas.join(", ")}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-bold">Nada com esse filtro por enquanto. O radar é atualizado sempre.</p>
      )}
    </div>
  );
}

export function Experimento({ id, internacionais, ...p }: PropsExperimento & { id: IdEstacao; internacionais: ItemInternacional[] }) {
  switch (id) {
    case "telescopio":
      return <Telescopio {...p} />;
    case "microscopio":
      return <Microscopio {...p} />;
    case "quimica":
      return <Quimica {...p} />;
    case "fisica":
      return <Fisica {...p} />;
    case "matematica":
      return <Matematica {...p} />;
    case "robotica":
      return <Robotica {...p} />;
    case "historia":
      return <Historia {...p} />;
    case "planeta":
      return <Planeta {...p} />;
    case "projetos":
      return <Projetos {...p} />;
    case "financas":
      return <Financas {...p} />;
    case "mundo":
      return <Mundo {...p} internacionais={internacionais} />;
  }
}
