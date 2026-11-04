// Repetição espaçada simples, no modelo de caixas de Leitner. Tudo fica no aparelho.
// Os intervalos são uma escolha simples de projeto. A pesquisa apoia espaçar, mas não fixa estes números.

export const INTERVALOS = [1, 2, 4, 8, 16] as const;

export type EstadoCarta = { caixa: number; proxima: string };

/** Data local no formato AAAA-MM-DD. */
export const hojeLocal = (d = new Date()) => d.toLocaleDateString("en-CA");

export function somarDias(dia: string, n: number) {
  const [a, m, d] = dia.split("-").map(Number);
  const data = new Date(Date.UTC(a, m - 1, d + n));
  return data.toISOString().slice(0, 10);
}

/** Acertou: sobe uma caixa e volta depois de mais tempo. Errou: volta para a primeira caixa e para amanhã. */
export function responder(estado: EstadoCarta | undefined, acertou: boolean, hoje: string): EstadoCarta {
  if (!acertou) return { caixa: 0, proxima: somarDias(hoje, INTERVALOS[0]) };
  const caixa = estado ? Math.min(estado.caixa + 1, INTERVALOS.length - 1) : 0;
  return { caixa, proxima: somarDias(hoje, INTERVALOS[caixa]) };
}

export const estaPendente = (estado: EstadoCarta | undefined, hoje: string) => !estado || estado.proxima <= hoje;

/** Dia em que há revisão de novo, se nada estiver pendente hoje. */
export function proximaRevisao(estados: (EstadoCarta | undefined)[], hoje: string): string | null {
  if (estados.some((e) => estaPendente(e, hoje))) return hoje;
  const datas = estados.map((e) => e?.proxima).filter((d): d is string => !!d).sort();
  return datas[0] ?? null;
}

export const chaveCarta = (baralho: string, frente: string) => `${baralho}::${frente}`;

/** Mantém só estados bem formados: o que vem do armazenamento pode ter sido alterado ou corrompido. */
export function limparEstados(bruto: unknown): Record<string, EstadoCarta> {
  if (!bruto || typeof bruto !== "object") return {};
  const saida: Record<string, EstadoCarta> = {};
  for (const [k, v] of Object.entries(bruto as Record<string, unknown>)) {
    const e = v as Partial<EstadoCarta> | null;
    if (e && Number.isInteger(e.caixa) && (e.caixa as number) >= 0 && (e.caixa as number) < INTERVALOS.length && typeof e.proxima === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.proxima)) {
      saida[k] = { caixa: e.caixa as number, proxima: e.proxima };
    }
  }
  return saida;
}
