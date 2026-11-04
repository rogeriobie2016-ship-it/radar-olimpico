// Regras do jogo de idiomas, sem nenhuma dependência de tela: conferir respostas, XP, destravar lições e contar a sequência de dias.
// Tudo aqui é coberto por scripts/testar-linguas.ts.
import { ESPANHOL } from "./espanhol";
import { INGLES } from "./ingles";
import type { Curso, Exercicio, Idioma, Licao } from "./tipos";

export const CURSOS: Record<Idioma, Curso> = { en: INGLES, es: ESPANHOL };
export const VIDAS = 3;
export const XP_DIRETO = 10;
export const XP_REVISAO = 5;
export const XP_PERFEITO = 20;

export type Nota = "certo" | "quase" | "errado";

/** Tira maiúsculas, pontuação e espaços sobrando. Acento continua, porque ele é avaliado à parte. */
export function normalizar(t: string) {
  return t
    .normalize("NFC")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[¿¡?!.,;:"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tira acentos e apóstrofos para comparar, mas mantém o ñ: em espanhol, ano e año são palavras diferentes. */
export function semAcento(t: string) {
  return t
    .replace(/ñ/g, "\u0001")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0001/g, "ñ")
    .replace(/'/g, "");
}

/** Frase digitada: "quase" é a frase certa só com acento ou apóstrofo faltando. */
export function conferirEscrita(resposta: string, certa: string, aceitas: string[] = []): Nota {
  const r = normalizar(resposta);
  if (!r) return "errado";
  const validas = [certa, ...aceitas].map(normalizar);
  if (validas.includes(r)) return "certo";
  return validas.map(semAcento).includes(semAcento(r)) ? "quase" : "errado";
}

/** Confere a resposta guardada como texto. Pares não passa por aqui: a própria tela sabe se houve erro. */
export function conferirExercicio(ex: Exercicio, resposta: string): Nota {
  switch (ex.tipo) {
    case "traduzir":
    case "completar":
    case "ler":
      return resposta === ex.certa ? "certo" : "errado";
    case "montar":
      return [ex.blocos.join(" "), ...(ex.aceitas ?? [])].map(normalizar).includes(normalizar(resposta)) ? "certo" : "errado";
    case "ouvir":
      return conferirEscrita(resposta, ex.frase, ex.aceitas);
    case "pares":
      return "certo";
  }
}

/** A frase completa no idioma estudado, para ouvir depois de responder. */
export function fraseAlvo(ex: Exercicio): string | null {
  switch (ex.tipo) {
    case "traduzir":
      return ex.de === "alvo" ? ex.frase : ex.certa;
    case "completar":
      return ex.frase.replace("___", ex.certa);
    case "montar":
      return ex.blocos.join(" ");
    case "ouvir":
      return ex.frase;
    case "ler":
      return ex.texto;
    case "pares":
      return null;
  }
}

/** O que mostrar como resposta certa, na correção e na revisão final. */
export function gabarito(ex: Exercicio): string {
  switch (ex.tipo) {
    case "traduzir":
    case "ler":
      return ex.certa;
    case "completar":
      return ex.frase.replace("___", ex.certa);
    case "montar":
      return ex.blocos.join(" ");
    case "ouvir":
      return ex.frase;
    case "pares":
      return ex.pares.map(([a, b]) => `${a} = ${b}`).join("; ");
  }
}

/** A pergunta em uma linha, para a lista de revisão. */
export function enunciado(ex: Exercicio): string {
  switch (ex.tipo) {
    case "traduzir":
      return ex.frase;
    case "completar":
      return ex.frase;
    case "montar":
      return ex.pt;
    case "ouvir":
      return ex.pt;
    case "ler":
      return ex.pergunta;
    case "pares":
      return "Ligar os pares";
  }
}

/** Pista para quem não pode ouvir: a inicial de cada palavra e um traço por letra. */
export function mascara(frase: string) {
  return frase.replace(/\p{L}+(?:'\p{L}+)*/gu, (p) => [...p].map((c, i) => (i === 0 || c === "'" ? c : "_")).join(""));
}

export function embaralhar<T>(lista: readonly T[], sorteio: () => number = Math.random): T[] {
  const l = [...lista];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

/** Embaralha sem deixar a resposta pronta na primeira posição, quando há outra ordem possível. */
export function embaralharBlocos(ex: { blocos: string[]; extras: string[] }, sorteio: () => number = Math.random): string[] {
  const certo = ex.blocos.join(" ");
  const todos = [...ex.blocos, ...ex.extras];
  for (let t = 0; t < 20; t++) {
    const l = embaralhar(todos, sorteio);
    if (!l.join(" ").startsWith(certo)) return l;
  }
  return [...ex.extras, ...ex.blocos];
}

export const estrelasPorErros = (erros: number) => (erros === 0 ? 3 : erros === 1 ? 2 : 1);

/** XP da lição concluída. Repetir uma lição já feita vale metade: dá para treinar, mas a trilha continua sendo o caminho. */
export function xpDaLicao({ diretos, revisados, erros, repeticao }: { diretos: number; revisados: number; erros: number; repeticao: boolean }) {
  const base = diretos * XP_DIRETO + revisados * XP_REVISAO + (erros === 0 ? XP_PERFEITO : 0);
  return repeticao ? Math.ceil(base / 2) : base;
}

// Progresso salvo só neste aparelho.

export type Progresso = {
  xp: number;
  licoes: Record<string, { estrelas: number; vezes: number }>;
  dias: number; // sequência de dias seguidos
  ultimoDia: string | null; // AAAA-MM-DD do último dia com lição concluída
  idioma: Idioma;
};

export const CHAVE_PROGRESSO = "radar-lingua-galactica";
export const progressoVazio = (): Progresso => ({ xp: 0, licoes: {}, dias: 0, ultimoDia: null, idioma: "en" });

/** Diferença em dias entre duas datas AAAA-MM-DD. */
export function diasEntre(a: string, b: string) {
  const ms = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(b) - ms(a)) / 86400000);
}

/** A sequência que vale hoje: se passou um dia inteiro sem lição, ela já está perdida. */
export function sequenciaAtual(p: Pick<Progresso, "dias" | "ultimoDia">, hoje: string) {
  if (!p.ultimoDia) return 0;
  const d = diasEntre(p.ultimoDia, hoje);
  return d <= 1 ? p.dias : 0;
}

export const fezHoje = (p: Pick<Progresso, "ultimoDia">, hoje: string) => p.ultimoDia === hoje;

export function registrarLicao(p: Progresso, id: string, { xp, estrelas }: { xp: number; estrelas: number }, hoje: string): Progresso {
  const antes = p.licoes[id];
  const d = p.ultimoDia ? diasEntre(p.ultimoDia, hoje) : null;
  // Relógio atrasado (d negativo) não mexe na sequência.
  const dias = d === null ? 1 : d === 0 || d < 0 ? p.dias : d === 1 ? p.dias + 1 : 1;
  return {
    ...p,
    xp: p.xp + xp,
    licoes: { ...p.licoes, [id]: { estrelas: Math.max(antes?.estrelas ?? 0, estrelas), vezes: (antes?.vezes ?? 0) + 1 } },
    dias,
    ultimoDia: d !== null && d < 0 ? p.ultimoDia : hoje,
  };
}

export const licaoFeita = (p: Progresso, l: Licao) => Boolean(p.licoes[l.id]);

/** A lição abre quando a anterior foi concluída. A primeira já começa aberta. */
export const licaoAberta = (p: Progresso, c: Curso, i: number) => i === 0 || licaoFeita(p, c.licoes[i - 1]);

/** Índice da próxima lição a fazer, ou -1 se a trilha acabou. */
export const proximaLicao = (p: Progresso, c: Curso) => c.licoes.findIndex((l) => !licaoFeita(p, l));

/** Lê e confere o que veio do armazenamento: conteúdo estragado vira progresso vazio, sem quebrar a tela. */
export function interpretarProgresso(bruto: string | null): Progresso {
  const vazio = progressoVazio();
  if (!bruto) return vazio;
  try {
    const v = JSON.parse(bruto) as Partial<Progresso> | null;
    if (!v || typeof v !== "object") return vazio;
    const licoes: Progresso["licoes"] = {};
    if (v.licoes && typeof v.licoes === "object") {
      for (const [id, l] of Object.entries(v.licoes)) {
        if (l && typeof l.estrelas === "number" && typeof l.vezes === "number") licoes[id] = { estrelas: Math.min(3, Math.max(1, l.estrelas)), vezes: l.vezes };
      }
    }
    return {
      xp: typeof v.xp === "number" && v.xp >= 0 ? v.xp : 0,
      licoes,
      dias: typeof v.dias === "number" && v.dias >= 0 ? v.dias : 0,
      ultimoDia: typeof v.ultimoDia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.ultimoDia) ? v.ultimoDia : null,
      idioma: v.idioma === "es" ? "es" : "en",
    };
  } catch {
    return vazio;
  }
}

export function lerProgresso(): Progresso {
  try {
    return interpretarProgresso(localStorage.getItem(CHAVE_PROGRESSO));
  } catch {
    return progressoVazio();
  }
}

export function salvarProgresso(p: Progresso) {
  try {
    localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(p));
  } catch {
    /* sem armazenamento, o progresso vale só nesta visita */
  }
}
