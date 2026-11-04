"use client";

import { useMemo, useState } from "react";
import { Fala } from "@/components/Fala";
import { Placar, type AoTerminar } from "./Molde";

type Op = { t: string; nota: 0 | 1 | 2; r: string };
type Decisao = { etapa: 0 | 1 | 2; p: string; ops: Op[] | ((tema: Tema) => Op[]) };
type Tema = { id: string; nome: string; foco: string; bom: string; medio: string; ruim: string; hBom: string; hMedio: string; hRuim: string };

const TEMAS: Tema[] = [
  {
    id: "agua", nome: "Água na escola", foco: "desperdício de água nos bebedouros",
    bom: "Quantos litros os bebedouros da escola desperdiçam por semana, e o que reduz esse volume?", medio: "Como economizar água na escola?", ruim: "A água é importante para a vida?",
    hBom: "Se trocarmos as torneiras por modelos com fechamento automático, o desperdício semanal vai cair.", hMedio: "Torneiras melhores devem ajudar de alguma forma.", hRuim: "Nosso projeto vai ser um sucesso.",
  },
  {
    id: "energia", nome: "Energia e calor", foco: "calor nas salas de aula",
    bom: "Pintar o telhado de branco reduz quantos graus a temperatura da sala às 14h?", medio: "Como deixar a sala menos quente?", ruim: "O que é o aquecimento global?",
    hBom: "Se o telhado for branco, a temperatura da sala às 14h será menor que a de uma sala igual com telhado escuro.", hMedio: "Telhado claro é melhor.", hRuim: "Todo mundo prefere uma sala fresca.",
  },
  {
    id: "residuos", nome: "Resíduos da merenda", foco: "restos orgânicos do refeitório",
    bom: "Quanto do resto orgânico da merenda vira composto em 60 dias, e essa compostagem melhora o crescimento de mudas?", medio: "O que fazer com o lixo da escola?", ruim: "Por que as pessoas jogam lixo no chão?",
    hBom: "Mudas cultivadas com o composto vão crescer mais, em 30 dias, que mudas em solo comum.", hMedio: "O composto deve ser bom para as plantas.", hRuim: "A escola vai ficar mais bonita.",
  },
];

const DECISOES: Decisao[] = [
  {
    etapa: 0, p: "Qual vai ser a pergunta de pesquisa?",
    ops: (t) => [
      { t: t.bom, nota: 2, r: "Pergunta específica e mensurável. Dá para saber quando foi respondida." },
      { t: t.medio, nota: 1, r: "Bom tema, mas ampla demais. Falta dizer o que será medido." },
      { t: t.ruim, nota: 0, r: "Já tem resposta conhecida. Não pede pesquisa nova." },
    ],
  },
  {
    etapa: 0, p: "O que fazer antes de coletar dados?",
    ops: [
      { t: "Ler trabalhos sobre o tema e registrar as fontes", nota: 2, r: "Saber o que já foi feito evita repetir erros, e a banca costuma perguntar sobre isso." },
      { t: "Começar logo, e pesquisar só se der tempo", nota: 1, r: "Dá para começar, mas você pode gastar tempo refazendo o que já existe." },
      { t: "Copiar um projeto de outra escola", nota: 0, r: "Plágio desclassifica. Inspirar-se é diferente de copiar, e toda fonte precisa ser citada." },
    ],
  },
  {
    etapa: 0, p: "Qual é a sua hipótese?",
    ops: (t) => [
      { t: t.hBom, nota: 2, r: "Afirmação que pode ser testada, e pode dar errado. É o que torna a hipótese útil." },
      { t: t.hMedio, nota: 1, r: "Aponta uma direção, mas falta dizer o que muda e quanto." },
      { t: t.hRuim, nota: 0, r: "Não é possível testar. Hipótese é uma previsão verificável." },
    ],
  },
  {
    etapa: 1, p: "Como comparar para saber se a sua solução funcionou?",
    ops: [
      { t: "Medir antes e depois, mantendo as outras condições iguais", nota: 2, r: "Sem comparação controlada, não dá para atribuir o resultado à sua solução." },
      { t: "Medir só depois de aplicar a solução", nota: 1, r: "Sem o antes, o número não diz se melhorou." },
      { t: "Perguntar aos colegas se acham que melhorou", nota: 0, r: "Opinião pode complementar, mas não substitui a medição." },
    ],
  },
  {
    etapa: 1, p: "Quantas medições fazer?",
    ops: [
      { t: "Repetir em vários dias e registrar todas", nota: 2, r: "Repetição mostra se o resultado é consistente ou se foi acaso." },
      { t: "Uma medição bem feita", nota: 1, r: "Pode ter sido um dia atípico. Uma única medida não dá segurança." },
      { t: "Várias, guardando só as que confirmam a hipótese", nota: 0, r: "Isso é viés de seleção, e invalida a pesquisa." },
    ],
  },
  {
    etapa: 1, p: "Um resultado contradiz a sua hipótese. E agora?",
    ops: [
      { t: "Registrar, investigar a causa e relatar", nota: 2, r: "Resultado inesperado é informação. Muitas descobertas começam assim." },
      { t: "Repetir a medição e, se mudar, usar só a nova", nota: 1, r: "Repetir é correto. Descartar a anterior sem explicar, não." },
      { t: "Apagar o dado", nota: 0, r: "Apagar dado é falha grave de integridade científica." },
    ],
  },
  {
    etapa: 2, p: "A pesquisa envolve colegas respondendo a perguntas. O que é preciso?",
    ops: [
      { t: "Autorização dos responsáveis, explicar o estudo e proteger a identidade", nota: 2, r: "Pesquisa com pessoas exige consentimento e anonimato. Vale conferir as regras de cada feira." },
      { t: "Avisar os participantes e não divulgar nomes", nota: 1, r: "Avançou, mas falta o registro formal da autorização." },
      { t: "Nada, porque são colegas da mesma escola", nota: 0, r: "Ser colega não dispensa o consentimento." },
    ],
  },
  {
    etapa: 2, p: "Como apresentar para a banca?",
    ops: [
      { t: "Pergunta, método, dados, limitações e próximos passos", nota: 2, r: "Mostrar as limitações passa confiança: indica que você entende o próprio trabalho." },
      { t: "Foco nos resultados, com todos os gráficos", nota: 1, r: "Sem o método, a banca não consegue avaliar os resultados." },
      { t: "Texto decorado, para não errar", nota: 0, r: "A banca pergunta fora do roteiro. Quem entende o projeto responde melhor do que quem decorou." },
    ],
  },
  {
    etapa: 2, p: "A banca aponta uma falha no seu método.",
    ops: [
      { t: "Reconhecer e explicar como corrigiria em uma nova etapa", nota: 2, r: "Ciência avança assim. Saber corrigir vale mais do que parecer perfeito." },
      { t: "Dizer que o tempo era curto", nota: 1, r: "Pode ser verdade, mas não mostra o que você aprendeu." },
      { t: "Defender que não há falha", nota: 0, r: "Negar a crítica passa a impressão de que você não compreendeu o método." },
    ],
  },
];

const ETAPAS = ["Etapa escolar", "Etapa regional", "Etapa estadual"];
const MINIMO = 3; // de 6, para seguir à próxima etapa

// Três moléculas ligadas, uma por etapa. Cada decisão acende um nó.
const NOS: [number, number][] = [[40, 118], [86, 62], [138, 104], [192, 50], [236, 112], [292, 66], [342, 118], [388, 56], [440, 96]];

function Rede({ notas }: { notas: number[] }) {
  return (
    <svg viewBox="0 0 480 160" className="w-full" aria-hidden="true">
      {NOS.slice(1).map(([x, y], i) => (
        <line key={i} x1={NOS[i][0]} y1={NOS[i][1]} x2={x} y2={y} stroke={notas[i + 1] !== undefined ? "#f4fbff" : "#1f4a68"} strokeWidth="2" style={{ transition: "stroke 400ms" }} />
      ))}
      {NOS.map(([x, y], i) => {
        const n = notas[i];
        const cor = n === undefined ? "#15395a" : n === 2 ? "#4bd68c" : n === 1 ? "#fdc13f" : "#ff8d50";
        const r = n === undefined ? 9 : n === 2 ? 16 : 12;
        return <circle key={i} cx={x} cy={y} r={r} fill={cor} style={{ transition: "r 400ms cubic-bezier(.2,.8,.2,1), fill 300ms" }} />;
      })}
    </svg>
  );
}

export default function Jornada({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const [tema, setTema] = useState<Tema | null>(null);
  const [i, setI] = useState(0);
  const [notas, setNotas] = useState<number[]>([]);
  const [resposta, setResposta] = useState<Op | null>(null);
  const [parecer, setParecer] = useState<{ etapa: number; soma: number } | null>(null);

  const d = DECISOES[i];
  const opcoes = useMemo(() => {
    if (!tema) return [];
    const l = typeof d.ops === "function" ? d.ops(tema) : d.ops;
    // Ordem varia a cada pergunta, para a melhor resposta não ficar sempre na mesma posição.
    const giro = (i * 7 + tema.id.length) % 3;
    return [...l.slice(giro), ...l.slice(0, giro)];
  }, [d, tema, i]);

  const total = notas.reduce((a, b) => a + b, 0);

  if (!tema)
    return (
      <div className="entrada-pergunta flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <p className="titulo titulo-2">Escolha o problema do seu projeto</p>
        <ul className="border-t border-[#1f4a68]">
          {TEMAS.map((t) => (
            <li key={t.id} className="border-b border-[#1f4a68]">
              <button type="button" onClick={() => setTema(t)} className="w-full py-4 text-left transition-colors hover:text-marca">
                <span className="estreito block text-[1.75rem] font-bold leading-none">{t.nome}</span>
                <span className="mt-1 block text-[0.9375rem] text-[#a9c6d8]">Investigar o {t.foco}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-auto text-sm text-[#a9c6d8]">Treino livre. As etapas e a banca são uma simulação, e os critérios reais estão no regulamento do Ceará Científico.</p>
      </div>
    );

  const responder = (o: Op) => {
    if (resposta) return;
    setResposta(o);
    setNotas((n) => [...n, o.nota]);
  };

  const continuar = () => {
    const novoI = i + 1;
    const fimEtapa = novoI % 3 === 0;
    setResposta(null);
    if (fimEtapa) {
      const soma = notas.slice(novoI - 3, novoI).reduce((a, b) => a + b, 0);
      setParecer({ etapa: d.etapa, soma });
      return;
    }
    setI(novoI);
  };

  const seguirEtapa = () => {
    const p = parecer!;
    setParecer(null);
    const classificou = p.soma >= MINIMO;
    if (!classificou || p.etapa === 2) {
      const pontos = total * 50 + (classificou ? 200 : 0);
      aoTerminar(pontos, classificou ? `Projeto concluído com ${total} de 18 pontos de rigor. No Ceará Científico de verdade, a jornada começa na escola.` : `O projeto parou na ${ETAPAS[p.etapa].toLowerCase()}, com ${total} pontos de rigor. Reveja as explicações e tente outro caminho.`);
      return;
    }
    setI(i + 1);
  };

  return (
    <>
      <Placar esquerda={parecer ? ETAPAS[parecer.etapa] : `${ETAPAS[d.etapa]}, decisão ${(i % 3) + 1} de 3`} direita={`${total}/18`} />
      <div className="px-4 pt-3 sm:px-6"><Rede notas={notas} /></div>
      {parecer ? (
        <div className="entrada-pergunta flex flex-1 flex-col gap-3 p-4 sm:p-6">
          <p className="titulo titulo-2">{parecer.soma >= MINIMO ? (parecer.etapa === 2 ? "Projeto aprovado na etapa final" : `Classificado para a ${ETAPAS[parecer.etapa + 1].toLowerCase()}`) : "O projeto não avançou"}</p>
          <Fala texto={`Nesta etapa, seu projeto somou ${parecer.soma} de 6 pontos de rigor.`} pose={parecer.soma >= MINIMO ? "comemora" : "triste"} />
          <button type="button" onClick={seguirEtapa} className="tecla tecla-acesa mt-auto min-h-14 text-lg">
            {parecer.soma >= MINIMO && parecer.etapa < 2 ? "Seguir" : "Ver resultado"}
          </button>
        </div>
      ) : (
        <div key={i} className="entrada-pergunta flex flex-1 flex-col gap-3 p-4 sm:p-6">
          <p className="titulo text-[1.875rem]">{d.p}</p>
          <ul className="border-t border-[#1f4a68]">
            {opcoes.map((o) => {
              const escolhida = resposta === o;
              const cor = !resposta ? "" : escolhida ? (o.nota === 2 ? "text-[#4bd68c]" : o.nota === 1 ? "text-[#fdc13f]" : "text-[#ff8d50]") : "opacity-45";
              return (
                <li key={o.t} className="border-b border-[#1f4a68]">
                  <button type="button" disabled={!!resposta} onClick={() => responder(o)} className={`min-h-12 w-full py-3 text-left text-[0.9375rem] leading-snug transition-colors ${cor} ${resposta ? "" : "hover:text-marca"}`}>
                    {o.t}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="min-h-[5rem]"><Fala texto={resposta?.r ?? "Pensa como pesquisador. O que você faria?"} pose={resposta ? (resposta.nota === 2 ? "comemora" : resposta.nota === 1 ? "pensa" : "triste") : "lupa"} tamanho={60} /></div>
          <button type="button" onClick={continuar} disabled={!resposta} className="tecla tecla-acesa mt-auto min-h-14 text-lg">
            Continuar
          </button>
        </div>
      )}
    </>
  );
}
