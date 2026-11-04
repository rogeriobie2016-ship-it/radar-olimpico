export type Jogo = {
  slug: string;
  titulo: string;
  olimpiada: string;
  resumo: string;
  como: string;
  oportunidades: string[]; // fichas em que o jogo aparece
  principal: string; // ficha para onde o resultado aponta
};

export const JOGOS: Jogo[] = [
  {
    slug: "jornada-cientifica", titulo: "Jornada Científica", olimpiada: "Ceará Científico",
    resumo: "Leve um projeto da etapa escolar à estadual, decidindo como um cientista.",
    como: "Escolha um problema e tome nove decisões de pesquisa. Cada escolha acende uma parte da sua rede e a banca comenta o resultado.",
    oportunidades: ["ceara-cientifico", "febrace", "febic", "mocica", "fenecit", "milset-brasil", "alunos-que-inspiram"], principal: "ceara-cientifico",
  },
  {
    slug: "escada", titulo: "Escada", olimpiada: "Da escola à competição internacional",
    resumo: "Suba os cinco níveis no ritmo certo e responda sobre as olimpíadas reais do catálogo.",
    como: "Toque em esquerda ou direita conforme o próximo degrau. O tempo corre. A cada patamar, uma pergunta sobre o catálogo devolve tempo.",
    oportunidades: [], principal: "obm",
  },
  {
    slug: "alvo", titulo: "Alvo", olimpiada: "OBMEP e olimpíadas de Matemática",
    resumo: "Combine os números com as quatro operações até chegar ao valor exato.",
    como: "Toque num número, numa operação e em outro número. O resultado vira uma nova peça. São seis rodadas contra o relógio.",
    oportunidades: ["obmep", "obmep-jr", "mcem", "omifce", "gepemac", "obm", "ocm", "mandacaru", "canguru", "omu", "obrl", "olimpiada-da-coruja"], principal: "obmep",
  },
  {
    slug: "lancamento", titulo: "Lançamento", olimpiada: "OBA e OBAFOG",
    resumo: "Ajuste ângulo e velocidade e acerte o foguete no alvo, com física de verdade.",
    como: "Defina o ângulo e a velocidade e lance. Cada rodada muda a distância e o vento. Quanto mais perto do centro, mais pontos.",
    oportunidades: ["oba", "obafog", "onc", "obfep", "onad", "tfm", "obf"], principal: "obafog",
  },
  {
    slug: "algoritmo", titulo: "Algoritmo", olimpiada: "OBI, OBR e computação",
    resumo: "Programe um robô com poucos comandos para chegar ao destino.",
    como: "Monte a sequência com avançar, virar e repetir. Execute e veja o robô seguir exatamente o que você mandou.",
    oportunidades: ["obi", "cf-obi", "oci", "obr", "onia", "obt", "onda"], principal: "obi",
  },
  {
    slug: "linha-do-tempo", titulo: "Linha do Tempo", olimpiada: "ONHB e OCHE",
    resumo: "Coloque os fatos da história do Brasil e do Ceará na ordem certa.",
    como: "A cada fato, toque no ponto da linha do tempo onde ele deve entrar. Você pode errar três vezes.",
    oportunidades: ["onhb", "onhb-a", "oche", "oscear", "obapo", "obg"], principal: "onhb",
  },
  {
    slug: "balanco", titulo: "Balanço", olimpiada: "OCQ, OQEP e Quimeninas",
    resumo: "Acerte os coeficientes até os átomos dos dois lados da reação empatarem.",
    como: "Use mais e menos em cada substância. As barras mostram quantos átomos há de cada lado. Equilibre com o menor número de toques.",
    oportunidades: ["ocq", "oqep", "quimeninas", "obq", "olimpiada-da-coruja", "tbc"], principal: "ocq",
  },
  {
    slug: "lingua-galactica", titulo: "Língua Galáctica", olimpiada: "OBLI, The Big Challenge e Olimpíada de Inglês",
    resumo: "Viaje de astro em astro com lições curtas de inglês e espanhol, do iniciante ao intermediário.",
    como: "Escolha o idioma e toque no astro que está brilhando. Traduza, monte frases, ligue pares, complete e escreva o que ouvir. Cada lição concluída destrava a próxima, e o que você errar volta no final.",
    oportunidades: ["obli", "olimpiada-de-ingles", "the-big-challenge", "prep-estudar-fora", "estudar-fora-ceara"], principal: "obli",
  },
];

export const jogosDe = (id: string) => JOGOS.filter((j) => j.oportunidades.includes(id));
