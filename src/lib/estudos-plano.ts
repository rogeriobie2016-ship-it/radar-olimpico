// Monta o plano semanal. Roda só no aparelho. As regras aplicam as técnicas da página Como estudar:
// espalhar pelos dias (repetição espaçada) e nunca repetir a mesma olimpíada em seguida (intercalação).
// Os tamanhos de bloco e a ordem das atividades são escolhas de projeto, não números da pesquisa.

export const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;

export type Atividade = { titulo: string; tecnica: string };

const APRENDER: Atividade = { titulo: "Assunto novo: estude e depois feche e recorde", tecnica: "recuperacao-ativa" };
const QUESTOES: Atividade = { titulo: "Questões misturadas", tecnica: "intercalacao" };
const EXPLICAR: Atividade = { titulo: "Explique em voz alta o que estudou", tecnica: "explicar" };
const REVISAR: Atividade = { titulo: "Revise nos baralhos", tecnica: "repeticao-espacada" };
const PROVA: Atividade = { titulo: "Prova antiga com tempo marcado", tecnica: "prova-antiga" };

/** Sequência de atividades para quantos blocos uma olimpíada recebe na semana. A prova antiga fecha sempre. */
export function atividadesDaSemana(blocos: number): Atividade[] {
  if (blocos <= 0) return [];
  if (blocos === 1) return [PROVA];
  const meio = [APRENDER, QUESTOES, EXPLICAR, REVISAR];
  const lista: Atividade[] = [];
  for (let i = 0; i < blocos - 1; i++) lista.push(meio[i % meio.length]);
  return [...lista, PROVA];
}

export type EntradaPlano = {
  /** Minutos disponíveis na semana. */
  minutosSemana: number;
  /** Índices em DIAS. */
  dias: number[];
  minutosBloco: number;
  /** Olimpíadas escolhidas, na ordem de prioridade. */
  ids: string[];
};

export type BlocoPlano = { id: string; atividade: Atividade };
export type DiaPlano = { dia: number; blocos: BlocoPlano[] };
export type Plano = { semana: DiaPlano[]; totalBlocos: number; sobraMinutos: number; blocosPorOlimpiada: Record<string, number> };

/** Reparte n em k partes o mais iguais possível, com as maiores primeiro. */
const repartir = (n: number, k: number) => Array.from({ length: k }, (_, i) => Math.floor(n / k) + (i < n % k ? 1 : 0));

export function gerarPlano({ minutosSemana, dias, minutosBloco, ids }: EntradaPlano): Plano {
  const diasOrdenados = [...new Set(dias)].sort((a, b) => a - b);
  const vazio: Plano = { semana: [], totalBlocos: 0, sobraMinutos: Math.max(0, minutosSemana), blocosPorOlimpiada: {} };
  if (!diasOrdenados.length || !ids.length || minutosBloco <= 0 || minutosSemana < minutosBloco) return vazio;

  const totalBlocos = Math.floor(minutosSemana / minutosBloco);
  const porDia = repartir(totalBlocos, diasOrdenados.length);
  const porOlimpiada = repartir(totalBlocos, ids.length);

  // Fila com as atividades de cada olimpíada, em rodízio: primeiro um bloco de cada, depois o segundo de cada...
  const filas = ids.map((id, i) => atividadesDaSemana(porOlimpiada[i]).map((atividade) => ({ id, atividade })));
  const ordem: BlocoPlano[] = [];
  for (let rodada = 0; ordem.length < totalBlocos; rodada++) {
    for (const fila of filas) if (fila[rodada]) ordem.push(fila[rodada]);
  }

  const semana: DiaPlano[] = [];
  let cursor = 0;
  diasOrdenados.forEach((dia, i) => {
    if (!porDia[i]) return;
    semana.push({ dia, blocos: ordem.slice(cursor, cursor + porDia[i]) });
    cursor += porDia[i];
  });

  return {
    semana,
    totalBlocos,
    sobraMinutos: minutosSemana - totalBlocos * minutosBloco,
    blocosPorOlimpiada: Object.fromEntries(ids.map((id, i) => [id, porOlimpiada[i]])),
  };
}
