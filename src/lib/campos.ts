/**
 * Liga as três portas de cada campo do conhecimento: olimpíadas (Radar), jogos e estudos.
 * Um jogo novo entra aqui, e `npm run validar` acusa se faltar ou se algo não existir.
 */
export type Campo = {
  id: string;
  titulo: string;
  cor: string;
  /** Áreas do catálogo que levam a este campo. */
  areas: string[];
  /** Filtro do Radar, como vai na URL. */
  radar: string;
  rotuloRadar: string;
  rotuloJogos: string;
  /** Página de estudo deste campo. */
  estudo: string;
  rotuloEstudo: string;
  /** Área da Biblioteca de Estudos, quando existe. */
  areaEstudo: string | null;
  jogos: [slug: string, estilo: string][];
};

const filtroAreas = (areas: string[]) => `area=${areas.map(encodeURIComponent).join(",")}`;

function campo(id: string, titulo: string, de: string, cor: string, areas: string[], jogos: Campo["jogos"], extra: Partial<Campo> = {}): Campo {
  return {
    id,
    titulo,
    cor,
    areas,
    radar: filtroAreas(areas),
    rotuloRadar: `Olimpíadas ${de}`,
    rotuloJogos: `Jogos ${de}`,
    estudo: `/estudos/area/${id}/`,
    rotuloEstudo: `Estudar ${titulo}`,
    areaEstudo: id,
    jogos,
    ...extra,
  };
}

export const CAMPOS: Campo[] = [
  campo("matematica", "Matemática", "de Matemática", "#f58a33", ["Matemática"], [["orbita-numerica", "Arcade em pixel art"], ["alvo", "Desafio de cálculo"]]),
  campo("linguagens", "Linguagens", "de Linguagens", "#fdc13f", ["Linguagens e Códigos"], [["arquivo-perdido", "História com escolhas"]]),
  campo("linguas-estrangeiras", "Línguas estrangeiras", "de línguas", "#9cc4ff", [], [["lingua-galactica", "Trilha de lições"]], {
    // O catálogo não tem área de línguas: quem fala outro idioma costuma procurar o que é lá fora.
    radar: "nivel=internacional",
    rotuloRadar: "Oportunidades lá fora",
  }),
  campo("natureza", "Ciências da natureza", "de Natureza", "#2fd27f", ["Ciências da Natureza", "Meio Ambiente"], [["nave-celular", "Aventura em 3D"], ["lancamento", "Simulador de física"], ["balanco", "Quebra-cabeça de química"]], {
    rotuloEstudo: "Estudar Natureza",
  }),
  campo("humanas", "História e humanas", "de Humanas", "#e8a06a", ["Ciências Humanas e Sociais Aplicadas"], [["crononauta", "Investigação de documentos"], ["linha-do-tempo", "Linha do tempo"]], {
    rotuloEstudo: "Estudar Humanas",
  }),
  campo("tecnologia", "Tecnologia", "de Tecnologia", "#00c9c8", ["Tecnologia e Computação"], [["algoritmo", "Programação em blocos"]]),
  campo("pesquisa", "Pesquisa e olimpíadas", "de pesquisa", "#c9a0ff", ["Multidisciplinar", "Educação Financeira e Gestão"], [["jornada-cientifica", "História de pesquisa"], ["escada", "Ritmo e perguntas"]], {
    rotuloRadar: "Olimpíadas multidisciplinares",
    estudo: "/estudos/como-estudar/",
    rotuloEstudo: "Como estudar",
    areaEstudo: null,
  }),
];

export const hrefRadar = (c: Campo) => `/radar/?${c.radar}`;
export const hrefJogos = (c: Campo) => `/jogos/#${c.id}`;

export const campoDoJogo = (slug: string) => CAMPOS.find((c) => c.jogos.some(([s]) => s === slug));
export const campoDoEstudo = (areaEstudo: string) => CAMPOS.find((c) => c.areaEstudo === areaEstudo);

/** Campo que corresponde a um filtro de área do Radar. Só quando todas as áreas marcadas cabem nele. */
export const campoDoFiltro = (areas: string[]) => (areas.length ? CAMPOS.find((c) => areas.every((a) => c.areas.includes(a))) : undefined);
