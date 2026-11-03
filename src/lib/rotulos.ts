export const ROTULO_TIPO: Record<string, string> = {
  olimpiada: "Olimpíada",
  feira: "Feira",
  evento: "Evento",
  programa: "Programa",
  bolsa: "Bolsa",
  intercambio: "Intercâmbio",
};

export const ROTULO_NIVEL: Record<string, string> = {
  escolar: "Escolar",
  regional: "Regional",
  estadual: "Estadual",
  nacional: "Nacional",
  internacional: "Internacional",
};

export const ROTULO_MODALIDADE: Record<string, string> = {
  online: "On-line",
  presencial: "Presencial",
  hibrida: "Híbrida",
};

export const ROTULO_PARTICIPACAO: Record<string, string> = {
  individual: "Individual",
  grupo: "Em equipe",
  "individual-ou-grupo": "Individual ou em equipe",
};

export const ROTULO_CUSTO: Record<string, string> = {
  gratuito: "Gratuita",
  pago: "Paga",
  valor: "Valor varia",
};

export const ROTULO_SERIE: Record<string, string> = {
  "EF-iniciais": "Até o 5º ano",
  "6EF": "6º ano",
  "7EF": "7º ano",
  "8EF": "8º ano",
  "9EF": "9º ano",
  "1EM": "1ª série EM",
  "2EM": "2ª série EM",
  "3EM": "3ª série EM",
  TEC: "Técnico",
  EJA: "EJA",
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-09-11" vira "11 de setembro de 2026" (sem depender do fuso do aparelho). */
export function dataExtenso(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

export function dataCurta(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export const nomeMes = (mes: number) => MESES[mes];
