// Equipamentos do Laboratório Vivo e as contas dos experimentos. Sem dependência de 3D: também alimenta a versão em lista e os testes.

export type IdEstacao = "telescopio" | "microscopio" | "quimica" | "fisica" | "matematica" | "robotica" | "historia" | "planeta" | "projetos" | "financas" | "mundo";

export type Estacao = {
  id: IdEstacao;
  nome: string;
  campo: string;
  cor: string;
  tinta: string;
  convite: string;
  concluido: string;
  /** Ids de data/oportunidades.json. O teste falha se algum deixar de existir. */
  olimpiadas: string[];
  jogo?: { slug: string; nome: string };
};

export const ESTACOES: Estacao[] = [
  {
    id: "telescopio",
    nome: "Telescópio",
    campo: "Astronomia",
    cor: "#7fb0ff",
    tinta: "#06213f",
    convite: "Aponta o telescópio para três planetas. Quanto mais longe, mais a luz do Sol demora para chegar.",
    concluido: "Você acabou de medir o Sistema Solar em tempo de luz. É assim que se pensa em astronomia.",
    olimpiadas: ["oba", "obafog", "onad", "onc", "olaa", "ioaa"],
    jogo: { slug: "lancamento", nome: "Lançamento" },
  },
  {
    id: "microscopio",
    nome: "Microscópio",
    campo: "Biologia",
    cor: "#4bd68c",
    tinta: "#04261a",
    convite: "Ajusta o foco até a célula aparecer. Depois toca em três partes dela.",
    concluido: "Olho treinado! Observar com cuidado é metade da biologia.",
    olimpiadas: ["obb", "tnbio", "obbs", "obsma", "oiab", "ibo"],
  },
  {
    id: "quimica",
    nome: "Bancada de química",
    campo: "Química",
    cor: "#f8a8c8",
    tinta: "#35081f",
    convite: "O suco de repolho roxo muda de cor conforme o pH. Testa três substâncias no frasco.",
    concluido: "Você usou um indicador natural de pH. Dá para repetir em casa, com um adulto por perto.",
    olimpiadas: ["ocq", "obq", "oqep", "quimeninas", "oiaq", "icho"],
    jogo: { slug: "balanco", nome: "Balanço" },
  },
  {
    id: "fisica",
    nome: "Pêndulo",
    campo: "Física",
    cor: "#fdc13f",
    tinta: "#2b1c00",
    convite: "Muda o comprimento do fio até o pêndulo levar 2 segundos para ir e voltar.",
    concluido: "Quase 1 metro! O período não depende da massa, só do comprimento e da gravidade.",
    olimpiadas: ["ocf", "obf", "obfep", "obofe", "tfm", "ipho"],
  },
  {
    id: "matematica",
    nome: "Lousa de padrões",
    campo: "Matemática",
    cor: "#f58a33",
    tinta: "#2b1200",
    convite: "Descobre o próximo número de cada sequência. A lousa muda a cada acerto.",
    concluido: "Enxergar padrões é o coração da matemática olímpica.",
    olimpiadas: ["obmep", "mcem", "ocm", "omifce", "canguru", "obm", "imo"],
    jogo: { slug: "alvo", nome: "Alvo" },
  },
  {
    id: "robotica",
    nome: "Oficina de robôs",
    campo: "Robótica e código",
    cor: "#00c9c8",
    tinta: "#04211f",
    convite: "Monta o programa e leva o robô até a bateria, sem bater nas paredes.",
    concluido: "Funcionou! Pensar a sequência antes de executar é programar.",
    olimpiadas: ["obr", "obi", "oci", "onia", "cf-obi", "ioi"],
    jogo: { slug: "algoritmo", nome: "Algoritmo" },
  },
  {
    id: "historia",
    nome: "Arquivo histórico",
    campo: "História e humanas",
    cor: "#e8a06a",
    tinta: "#2e1404",
    convite: "Coloca estes fatos em ordem. Tem um que aconteceu antes aqui no Ceará.",
    concluido: "Isso! O Ceará aboliu a escravidão em 1884, quatro anos antes da Lei Áurea.",
    olimpiadas: ["oche", "onhb", "obapo", "onfil", "oscear", "olimpiada-de-portugues"],
    jogo: { slug: "linha-do-tempo", nome: "Linha do Tempo" },
  },
  {
    id: "planeta",
    nome: "Estufa",
    campo: "Planeta e natureza",
    cor: "#0fa85a",
    tinta: "#04261a",
    convite: "A planta precisa de três coisas para fazer fotossíntese. Liga as três e vê o que acontece.",
    concluido: "Luz, água e gás carbônico viram glicose e oxigênio. A planta cresceu!",
    olimpiadas: ["o2-oceano", "obsma", "restaura-natureza", "obg", "obrac", "premio-criativos"],
  },
  {
    id: "projetos",
    nome: "Feira de projetos",
    campo: "Pesquisa e feiras",
    cor: "#c9a0ff",
    tinta: "#1d0b3a",
    convite: "Toda pesquisa segue um caminho. Coloca as etapas na ordem certa.",
    concluido: "É esse o caminho de um projeto de feira. O próximo pode ser o da sua escola.",
    olimpiadas: ["ceara-cientifico", "mocica", "fenecit", "febrace", "febic", "milset-brasil"],
    jogo: { slug: "jornada-cientifica", nome: "Jornada Científica" },
  },
  {
    id: "financas",
    nome: "Mesa de finanças",
    campo: "Dinheiro e futuro",
    cor: "#ffd166",
    tinta: "#2b1c00",
    convite: "R$ 100 rendendo 1% ao mês. Puxa o tempo até o dinheiro dobrar.",
    concluido: "Quase 6 anos! Juros compostos crescem sobre o que já cresceu.",
    olimpiadas: ["olitef", "obef", "obinvest", "obmf", "obecon", "one"],
  },
  {
    id: "mundo",
    nome: "Portal Mundo Afora",
    campo: "Internacional",
    cor: "#3ee8e6",
    tinta: "#04211f",
    convite: "Fala inglês, espanhol ou quer aprender? Olha o que existe para quem quer ir além do Brasil.",
    concluido: "Portal aberto. Volta sempre: oportunidades novas entram aqui.",
    olimpiadas: [],
  },
];

export const estacaoPorId = (id: string) => ESTACOES.find((e) => e.id === id);

// --- Telescópio. Distância média ao Sol em unidades astronômicas. A luz leva cerca de 8,3 minutos por unidade.
export const PLANETAS = [
  { id: "mercurio", nome: "Mercúrio", ua: 0.39, cor: "#b9a48f", raio: 18 },
  { id: "venus", nome: "Vênus", ua: 0.72, cor: "#e9c78b", raio: 26 },
  { id: "terra", nome: "Terra", ua: 1, cor: "#3d9be0", raio: 27 },
  { id: "marte", nome: "Marte", ua: 1.52, cor: "#d9663a", raio: 21 },
  { id: "jupiter", nome: "Júpiter", ua: 5.2, cor: "#d9a671", raio: 46 },
  { id: "saturno", nome: "Saturno", ua: 9.58, cor: "#e6cf95", raio: 40, aneis: true },
  { id: "urano", nome: "Urano", ua: 19.2, cor: "#8fe0e6", raio: 32 },
  { id: "netuno", nome: "Netuno", ua: 30.05, cor: "#4a70e0", raio: 31 },
];
export const minutosLuz = (ua: number) => ua * 8.317;

// --- Microscópio. O foco certo é uma faixa, não um ponto exato.
export const FOCO_CERTO = 62;
export const nitidez = (foco: number) => Math.max(0, 1 - Math.abs(foco - FOCO_CERTO) / 40);
export const PARTES_CELULA = [
  { id: "parede", nome: "Parede celular", texto: "Dá forma e proteção à célula vegetal." },
  { id: "nucleo", nome: "Núcleo", texto: "Guarda o DNA e coordena a célula." },
  { id: "cloroplasto", nome: "Cloroplasto", texto: "Onde acontece a fotossíntese." },
  { id: "vacuolo", nome: "Vacúolo", texto: "Armazena água e outras substâncias." },
];

// --- Química. Valores aproximados de pH e a cor típica do indicador de repolho roxo.
export const SUBSTANCIAS = [
  { id: "limao", nome: "Suco de limão", ph: 2, cor: "#e8366b" },
  { id: "vinagre", nome: "Vinagre", ph: 3, cor: "#d9468f" },
  { id: "agua", nome: "Água", ph: 7, cor: "#7a5fc0" },
  { id: "bicarbonato", nome: "Bicarbonato", ph: 8.5, cor: "#3f7fd6" },
  { id: "sabao", nome: "Água com sabão", ph: 10, cor: "#2fb39a" },
];
export const carater = (ph: number) => (ph < 6.5 ? "ácido" : ph <= 7.5 ? "neutro" : "básico");

// --- Física. T = 2π√(L/g), válido para pequenas oscilações.
export const GRAVIDADE = 9.8;
export const periodo = (metros: number) => 2 * Math.PI * Math.sqrt(metros / GRAVIDADE);
export const ALVO_PERIODO = 2;
export const TOLERANCIA_PERIODO = 0.04;

// --- Matemática.
export const SEQUENCIAS = [
  { numeros: [1, 1, 2, 3, 5, 8], certa: 13, opcoes: [11, 13, 16], dica: "Cada número é a soma dos dois anteriores: é a sequência de Fibonacci." },
  { numeros: [1, 3, 6, 10, 15], certa: 21, opcoes: [20, 21, 25], dica: "Números triangulares: some 2, depois 3, depois 4..." },
  { numeros: [2, 4, 8, 16, 32], certa: 64, opcoes: [48, 64, 62], dica: "Potências de 2: cada número é o dobro do anterior." },
];

// --- Robótica. Grade 4 x 4: 0 é livre, 1 é parede. O robô começa em (0,3) e a bateria está em (3,0).
export const GRADE_ROBO = [
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1],
  [0, 1, 0, 0],
];
export const INICIO_ROBO = { x: 0, y: 3 };
export const BATERIA = { x: 3, y: 0 };
export type Comando = "cima" | "baixo" | "esquerda" | "direita";
export const DELTA: Record<Comando, { x: number; y: number }> = { cima: { x: 0, y: -1 }, baixo: { x: 0, y: 1 }, esquerda: { x: -1, y: 0 }, direita: { x: 1, y: 0 } };

export function rodarPrograma(programa: Comando[]) {
  const caminho = [{ ...INICIO_ROBO }];
  let { x, y } = INICIO_ROBO;
  for (const c of programa) {
    const nx = x + DELTA[c].x;
    const ny = y + DELTA[c].y;
    if (GRADE_ROBO[ny]?.[nx] !== 0) return { caminho, bateu: true, chegou: false };
    x = nx;
    y = ny;
    caminho.push({ x, y });
    if (x === BATERIA.x && y === BATERIA.y) return { caminho, bateu: false, chegou: true };
  }
  return { caminho, bateu: false, chegou: false };
}

// --- História.
export const FATOS = [
  { ano: 1822, texto: "Independência do Brasil" },
  { ano: 1884, texto: "Ceará abole a escravidão" },
  { ano: 1888, texto: "Lei Áurea" },
  { ano: 1889, texto: "Proclamação da República" },
];

// --- Pesquisa.
export const ETAPAS_PESQUISA = ["Fazer uma pergunta", "Levantar uma hipótese", "Testar com um experimento", "Analisar os dados", "Apresentar na feira"];

// --- Finanças. M = C(1 + i)^n.
export const CAPITAL = 100;
export const TAXA = 0.01;
export const saldo = (meses: number) => CAPITAL * (1 + TAXA) ** meses;

/** Embaralha sempre do mesmo jeito, para o servidor e o aparelho concordarem. */
export function embaralhar<T>(lista: T[], semente = 7): T[] {
  const r = [...lista];
  let s = semente;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
