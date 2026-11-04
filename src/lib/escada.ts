// Motor da Escada Olímpica. Função pura, sem interface, para poder ser testada (scripts/testar-escada.ts).
//
// Duas camadas:
//  1. Regras eliminatórias: o que o regulamento impede (série, rede, convite, exclusivo para meninas).
//     Uma regra eliminatória nunca é compensada por pontos.
//  2. Pontuação de afinidade: o que combina melhor com a pessoa e a escola.
import type { Resumo } from "./tipos";

export type Respostas = {
  perfil: "estudante" | "professor" | "gestor";
  series: string[];
  escola: "regular" | "integral" | "profissional" | "afirmativa" | "ceja";
  meninas: boolean;
  areas: string[]; // em ordem de preferência
  experiencia: "nunca" | "escola" | "premiado";
  formato: "prova" | "projeto" | "ambos";
  participacao: "individual" | "grupo" | "ambos";
  tempo: "pouco" | "medio" | "muito";
  objetivo: "aprender" | "medalha" | "universidade" | "viajar";
  custo: "gratuito" | "qualquer";
  orientador: boolean;
  internet: boolean;
  viagem: boolean;
};

/** Condições escritas nos documentos da COPES e nas fichas do Catálogo 2026. */
type Regra = {
  meninas?: boolean; // exclusivo para meninas
  escolaPublica?: boolean;
  redeEstadual?: boolean;
  soIntegral?: boolean; // exige EEMTI com a eletiva
  convite?: string; // não há inscrição aberta: depende de outra etapa
  depende?: string; // só participa quem já está em outra olimpíada
  professorResponsavel?: boolean;
  bienal?: boolean;
  dificuldade?: 1 | 2 | 3; // 1 entrada, 2 intermediária, 3 alto desempenho
  aberta?: boolean; // aberta a quem nunca competiu, com material de apoio ou prova curta
};

export const REGRAS: Record<string, Regra> = {
  quimeninas: { meninas: true, dificuldade: 2 },
  tfm: { meninas: true, dificuldade: 2 },
  "cf-obi": { meninas: true, dificuldade: 2 },
  "futuras-cientistas": { meninas: true, escolaPublica: true, redeEstadual: true, dificuldade: 2 },
  tm2: { meninas: true, dificuldade: 3 },
  egmo: { meninas: true, convite: "Seleção nacional", dificuldade: 3 },
  egoi: { meninas: true, convite: "Seleção nacional", dificuldade: 3 },

  mcem: { redeEstadual: true, dificuldade: 1, aberta: true },
  "controle-social": { redeEstadual: true, soIntegral: true, dificuldade: 2 },
  "ceara-cientifico": { redeEstadual: true, dificuldade: 2 },
  "alunos-que-inspiram": { redeEstadual: true, dificuldade: 2 },
  omifce: { escolaPublica: true, dificuldade: 1, aberta: true },
  oqep: { escolaPublica: true, dificuldade: 1, aberta: true },
  ocerq: { dificuldade: 2 },
  ocq: { dificuldade: 2 },
  ocef: { dificuldade: 1, aberta: true },
  oche: { dificuldade: 1, aberta: true },
  oci: { dificuldade: 2 },
  oscear: { dificuldade: 1, aberta: true },
  gepemac: { dificuldade: 2 },

  obmep: { dificuldade: 2, aberta: true },
  obm: { convite: "Só por convite: 300 melhores da OBMEP, regionais apoiadas ou medalhistas", dificuldade: 3 },
  obq: { convite: "Acesso pelas seletivas estaduais, como a OCQ", dificuldade: 3 },
  obafog: { depende: "OBA", professorResponsavel: true, dificuldade: 2 },
  oba: { professorResponsavel: true, dificuldade: 1, aberta: true },
  obfep: { escolaPublica: true, professorResponsavel: true, dificuldade: 2 },
  onc: { dificuldade: 1, aberta: true },
  onhb: { dificuldade: 2, aberta: true },
  "onhb-a": { dificuldade: 1, aberta: true },
  obl: { bienal: true, dificuldade: 2 },
  obsma: { bienal: true, dificuldade: 2 },
  obi: { dificuldade: 2 },
  obr: { dificuldade: 2 },
  onia: { dificuldade: 1, aberta: true },
  obli: { dificuldade: 1, aberta: true },
  obgp: { dificuldade: 1, aberta: true },
  olitef: { dificuldade: 1, aberta: true },
  obinvest: { dificuldade: 1, aberta: true },
  onee: { dificuldade: 1, aberta: true },
  "o2-oceano": { dificuldade: 1, aberta: true },
  febrace: { dificuldade: 3 },
  febic: { dificuldade: 2 },
  mocica: { dificuldade: 2 },
  fenecit: { dificuldade: 3 },
  "milset-brasil": { dificuldade: 3 },
  oimc: { dificuldade: 2 },
};

const regra = (id: string): Regra => REGRAS[id] ?? {};

export type Motivo = { texto: string; peso: number };
export type Recomendacao = {
  item: Resumo;
  pontos: number;
  compatibilidade: number; // de 0 a 100
  motivos: string[];
  alertas: string[];
  degrau: 1 | 2 | 3 | 4;
};
export type Excluida = { item: Resumo; motivo: string };
export type Resultado = {
  degraus: Record<1 | 2 | 3 | 4, Recomendacao[]>;
  excluidas: Excluida[];
  planoEscola: string[];
  total: number;
};

const TEXTO_SERIE: Record<string, string> = { "EF-iniciais": "até o 5º ano", "6EF": "6º ano", "7EF": "7º ano", "8EF": "8º ano", "9EF": "9º ano", "1EM": "1ª série", "2EM": "2ª série", "3EM": "3ª série", TEC: "técnico", EJA: "EJA" };

/** Devolve o motivo pelo qual o item não serve, ou null se pode participar. */
export function eliminar(i: Resumo, r: Respostas): string | null {
  const c = regra(i.id);
  if (i.series.length && !i.series.some((s) => r.series.includes(s))) return `Não atende ${r.series.map((s) => TEXTO_SERIE[s]).join(", ")}`;
  if (c.meninas && !r.meninas) return "Exclusiva para meninas";
  if (c.soIntegral && r.escola !== "integral") return "Exige escola em tempo integral com a eletiva de Controle Social";
  if (c.convite) return c.convite;
  if (r.custo === "gratuito" && (i.custo === "pago" || i.custo === "valor")) return "Tem taxa de inscrição";
  if (!i.temFicha && !i.fim) return "Sem informações suficientes para recomendar";
  return null;
}

function classificarDegrau(i: Resumo): 1 | 2 | 3 | 4 {
  if (i.nivel === "internacional") return 4;
  return regra(i.id).dificuldade ?? 2;
}

export function pontuar(i: Resumo, r: Respostas, hoje: string): Omit<Recomendacao, "degrau"> {
  const c = regra(i.id);
  const motivos: string[] = [];
  const alertas: string[] = [];
  let p = 0;

  // Interesse: 40 pontos. A primeira área escolhida vale mais que a terceira.
  const posicao = r.areas.findIndex((a) => i.areas.includes(a));
  if (posicao >= 0) {
    p += [40, 32, 25, 20, 20, 20, 20, 20][posicao];
    motivos.push(`Combina com o seu interesse em ${r.areas[posicao]}`);
  } else if (i.areas.includes("Multidisciplinar")) {
    p += 14;
    motivos.push("Aceita projetos de várias áreas");
  }

  // Formato: 14 pontos.
  if (r.formato === "ambos") p += 7;
  else if (r.formato === i.formato) {
    p += 14;
    motivos.push(i.formato === "prova" ? "O formato é prova, como você prefere" : "O formato é projeto, como você prefere");
  }

  // Participação: 8 pontos.
  if (r.participacao === "ambos" || !i.participacao) p += 4;
  else if (i.participacao === "individual-ou-grupo" || i.participacao === r.participacao) {
    p += 8;
    motivos.push(r.participacao === "grupo" ? "Dá para participar em equipe" : "Dá para participar individualmente");
  } else alertas.push(i.participacao === "grupo" ? "Exige equipe" : "É individual");

  // Objetivo: 16 pontos.
  if (r.objetivo === "universidade" && i.vagaOlimpica) {
    p += 16;
    motivos.push("Está na lista de premiações aceitas no edital de vagas olímpicas da UFC");
  } else if (r.objetivo === "viajar" && i.financiavelJOC && (i.tipo === "feira" || i.nivel === "nacional")) {
    p += 14;
    motivos.push("Pode ter viagem financiada pelo JOC se a equipe chegar à etapa final");
  } else if (r.objetivo === "medalha" && i.tipo === "olimpiada") {
    p += 10;
    if (i.nivel !== "internacional") motivos.push("Tem premiação em medalhas ou classificação");
  } else if (r.objetivo === "aprender" && (c.aberta || c.dificuldade === 1)) {
    p += 14;
    motivos.push("Boa para aprender, sem exigir experiência anterior");
  }

  // Experiência e tempo: 12 pontos.
  const d = c.dificuldade ?? 2;
  if (r.experiencia === "nunca") p += d === 1 ? 8 : d === 2 ? 3 : -10;
  if (r.experiencia === "escola") p += d === 2 ? 8 : d === 1 ? 5 : 0;
  if (r.experiencia === "premiado") p += d === 3 ? 8 : d === 2 ? 5 : 0;
  if (r.tempo === "pouco") p += d === 1 ? 4 : d === 3 ? -8 : 0;
  if (r.tempo === "muito") p += d === 3 ? 4 : 1;

  // Escola: rede, professor, internet, viagem.
  if (c.redeEstadual) {
    p += 6;
    motivos.push("É voltada à rede estadual do Ceará");
  } else if (i.nivel === "estadual") {
    p += 4;
    motivos.push("Acontece aqui no Ceará");
  }
  if (i.formato === "projeto" && !r.orientador) {
    p -= 8;
    alertas.push("Projeto precisa de um professor orientador");
  }
  if (c.professorResponsavel && !r.orientador) {
    p -= 6;
    alertas.push("A escola precisa ter um professor responsável cadastrado");
  } else if (c.professorResponsavel) motivos.push("Você tem o professor responsável que ela exige");
  if (i.modalidade === "online" && !r.internet) {
    p -= 10;
    alertas.push("A prova é on-line e pede internet estável");
  }
  if (i.modalidade === "presencial" && !r.viagem && i.nivel !== "estadual") {
    p -= 8;
    alertas.push("Pode exigir deslocamento");
  }

  // Condições que a pessoa precisa saber, mesmo quando a recomendação é boa.
  if (c.depende) alertas.push(`Só participa quem está na ${c.depende}`);
  if (c.bienal) alertas.push("Acontece a cada dois anos: confira se há edição no seu ano");
  if (c.meninas) motivos.push("É uma oportunidade exclusiva para meninas");
  if (i.custo === "pago" || i.custo === "valor") alertas.push("Tem taxa de inscrição");
  if (i.custo === "gratuito") p += 2;

  // Calendário: prazo aberto ganha, prazo encerrado segue valendo para a próxima edição.
  const fim = i.fim;
  if (fim && fim >= hoje) {
    p += 10;
    motivos.unshift(`Inscrições abertas até ${fim.split("-").reverse().slice(0, 2).join("/")}`);
  } else if (fim) alertas.push("Inscrições desta edição encerradas: acompanhe a próxima");
  else alertas.push("Data da próxima edição a confirmar no site oficial");

  const pontos = Math.round(p);
  return { item: i, pontos, compatibilidade: Math.max(5, Math.min(99, Math.round((p / 92) * 100))), motivos: motivos.slice(0, 4), alertas };
}

export function recomendar(itens: Resumo[], r: Respostas, hoje: string): Resultado {
  const excluidas: Excluida[] = [];
  const aptas: Recomendacao[] = [];
  for (const i of itens) {
    const motivo = eliminar(i, r);
    if (motivo) {
      excluidas.push({ item: i, motivo });
      continue;
    }
    aptas.push({ ...pontuar(i, r, hoje), degrau: classificarDegrau(i) });
  }
  aptas.sort((a, b) => b.pontos - a.pontos || a.item.nome.localeCompare(b.item.nome, "pt-BR"));

  // Só entra quem tem afinidade real. Sem isso, uma lista longa deixa de ser recomendação.
  const corte = (x: Recomendacao) => x.motivos.some((m) => m.startsWith("Combina") || m.startsWith("Aceita")) && x.compatibilidade >= 35;
  const degraus: Resultado["degraus"] = { 1: [], 2: [], 3: [], 4: [] };
  const limite = { 1: 4, 2: 4, 3: 3, 4: 3 } as const;
  for (const a of aptas) {
    if (!corte(a)) continue;
    if (degraus[a.degrau].length < limite[a.degrau]) degraus[a.degrau].push(a);
  }

  // Se a pessoa nunca competiu, o primeiro degrau não pode ficar vazio.
  if (!degraus[1].length) {
    const reserva = [...degraus[2], ...degraus[3]].shift();
    if (reserva) {
      degraus[reserva.degrau] = degraus[reserva.degrau].filter((x) => x !== reserva);
      degraus[1].push({ ...reserva, degrau: 1 });
    }
  }

  const planoEscola: string[] = [];
  const ee = r.perfil !== "estudante";
  if (r.objetivo === "viajar" || ee) planoEscola.push("Confira se a escola está na lista de cadastro SEDUC/COPES: vale 30 pontos na prioridade do JOC.");
  planoEscola.push("Registre toda participação no Portal Educação Científica. É o mesmo login do Ceará Científico.");
  if (!r.orientador) planoEscola.push("Procure um professor da área de interesse. Sem orientador, feiras e olimpíadas com professor responsável ficam de fora.");
  if (r.escola === "afirmativa" || r.escola === "ceja") planoEscola.push("No Ceará Científico, sua escola participa da Categoria II, de ações afirmativas e CEJA.");
  if (r.escola === "integral") planoEscola.push("Escola em tempo integral com a eletiva Cidadania e Controle Social pode disputar a Olimpíada de Controle Social das Contas Públicas.");
  if (r.objetivo === "universidade") planoEscola.push("Guarde os certificados de premiação. No edital 2026, a UFC aceitou premiações de 2022 a 2025 obtidas no Ensino Médio.");
  if (r.objetivo === "viajar") planoEscola.push("Assim que classificar, calcule o prazo no JOC: 30 dias antes para eventos estaduais e regionais, 40 para nacionais, 70 para internacionais.");

  const total = degraus[1].length + degraus[2].length + degraus[3].length + degraus[4].length;
  return { degraus, excluidas, planoEscola, total };
}
