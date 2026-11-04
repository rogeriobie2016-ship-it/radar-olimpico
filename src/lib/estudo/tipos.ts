// Formato do conteúdo de estudo. A interface só conhece estes tipos, então dá para revisar ou acrescentar lições sem tocar nela.

export type Idioma = "en" | "es";

/** Múltipla escolha de tradução. "alvo": a frase vem no idioma estudado. "pt": vem em português e as opções no idioma estudado. */
export type Traduzir = { tipo: "traduzir"; de: "alvo" | "pt"; frase: string; opcoes: string[]; certa: string; porque: string };
/** Montar a frase com blocos. `blocos` está na ordem certa; `extras` são os blocos que sobram. `aceitas` guarda outras ordens corretas. */
export type Montar = { tipo: "montar"; pt: string; blocos: string[]; extras: string[]; aceitas?: string[]; porque: string };
/** Ligar pares. Cada par tem o termo no idioma estudado e o correspondente. */
export type Pares = { tipo: "pares"; pares: [string, string][]; porque: string };
/** Completar a lacuna, marcada com ___ na frase. `pt` é a tradução da frase inteira. */
export type Completar = { tipo: "completar"; frase: string; pt: string; opcoes: string[]; certa: string; porque: string };
/** Ouvir e escrever. Sem voz no aparelho, vira escrever a partir de `pt`, com as iniciais de cada palavra como pista. */
export type Ouvir = { tipo: "ouvir"; frase: string; pt: string; aceitas?: string[]; porque: string };
/** Ler um texto curto e responder em português. */
export type Ler = { tipo: "ler"; texto: string; pergunta: string; opcoes: string[]; certa: string; porque: string };

export type Exercicio = Traduzir | Montar | Pares | Completar | Ouvir | Ler;

export type Licao = {
  id: string;
  nome: string; // nome do planeta ou estação no mapa
  tema: string; // o que se treina, em poucas palavras
  nivel: "Iniciante" | "Básico" | "Intermediário";
  ideias: string[]; // explicação curta mostrada antes dos exercícios
  exercicios: Exercicio[];
};

export type Curso = {
  idioma: Idioma;
  nome: string; // "Inglês"
  licoes: Licao[];
};
