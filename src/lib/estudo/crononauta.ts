// Crononauta: investigação de documentos em viagens no tempo.
//
// REGRA DESTE ARQUIVO
// Todo documento aqui é uma recriação didática, com autor fictício e rótulo visível na tela.
// O que é inventado é o papel e quem escreve. Os fatos históricos citados foram conferidos na web em 04/11/2026.
// Nenhuma pessoa real recebe frase inventada: personagens reais só aparecem como assunto, em fatos confirmados.
// Quando as fontes divergem em um detalhe, o jogo usa a formulação mais ampla e o detalhe fica anotado aqui.
//
// FONTES CONSULTADAS
//
// Greve dos jangadeiros, Dragão do Mar, José Luís Napoleão e Tia Simoa (1881):
// - O Povo, "140 anos da greve contra a escravidão: a jangada perdida do Dragão do Mar" (2021)
//   https://mais.opovo.com.br/reportagens-especiais/dragoes-do-ceara/2021/08/28/140-anos-da-greve-contra-a-escravidao-a-jangada-perdida-do-dragao-do-mar.html
// - O Povo, "Napoleão, o outro dragão da liberdade" (2021), que cita a Gazeta do Norte de 28/01/1881
//   https://mais.opovo.com.br/reportagens-especiais/dragoes-do-ceara/2021/01/27/napoleao--o-outro-dragao-da-liberdade.html
// - Wikipédia, "Dragão do Mar" (nascimento em 1839, morte em 1914, prático-mor)
//   https://pt.wikipedia.org/wiki/Drag%C3%A3o_do_Mar
// - Diário do Nordeste, "Entenda os mitos sobre a Abolição no Ceará"
//   https://diariodonordeste.verdesmares.com.br/ceara/entenda-os-mitos-sobre-a-abolicao-no-ceara-que-libertou-escravizados-4-anos-antes-do-brasil-1.3510703
// Divergência: os dias da greve de janeiro aparecem como 27, 30 e 31 ou como 27, 29 e 30. O jogo diz "janeiro de 1881".
// Divergência: o lema aparece como "não se embarcam mais escravos" e "não embarcam mais escravos", sempre atribuído pela memória do movimento.
//
// Abolição no Ceará (1883 a 1888):
// - Diário do Nordeste, mesma reportagem acima (Sociedade Cearense Libertadora em 1880, Acarape, Fortaleza, 25/03/1884,
//   tráfico interno, seca de 1877, 500 cativos em Milagres em 1886, fugitivos devolvidos, indenização em Redenção, 13/05/1888, 15/11/1889)
// - O Povo, "Data Magna do Ceará: entenda o feriado do dia 25 de março" (116 cartas em Acarape, Sátiro Dias)
//   https://www.opovo.com.br/noticias/ceara/data-magna-do-ceara-entenda-o-feriado-do-dia-25-de-marco.html
// - O Povo, "Data Magna do Ceará: primeira província a libertar escravizados manteve exploração mesmo após abolição, apontam historiadoras"
//   https://www.opovo.com.br/noticias/ceara/2020/03/24/data-magna-do-ceara--primeira-provincia-a-libertar-escravizados-manteve-exploracao-mesmo-apos-abolicao--aponta-historiadoras.html
// - O Povo, "Sétima ruptura: o protagonismo negro na abolição da escravidão no Ceará" (Terra da Luz, Sociedade das Cearenses Libertadoras)
//   https://mais.opovo.com.br/reportagens-especiais/fortaleza-300-anos-biografia-rupturas/2026/05/29/setima-ruptura-o-protagonismo-negro-na-abolicao-da-escravidao-no-ceara.html
// Divergência: a fundação da Sociedade das Cearenses Libertadoras aparece com datas diferentes. O jogo não cita o ano.
//
// Sedição de Juazeiro (1911 a 1914):
// - Wikipédia, "Sedição de Juazeiro" e "Juazeiro Sedition" (Pacto dos Coronéis em outubro de 1911, viagem de Floro em agosto de 1913,
//   tropas em dezembro de 1913, valado, canhão, Crato em 24/01/1914, Setembrino de Carvalho, Benjamin Barroso)
//   https://pt.wikipedia.org/wiki/Sedi%C3%A7%C3%A3o_de_Juazeiro
//   https://en.wikipedia.org/wiki/Juazeiro_Sedition
// - Toda Matéria, "Revolta do Juazeiro" (Política das Salvações, Pacto dos Coronéis, Pinheiro Machado, Padre Cícero vice-governador)
//   https://www.todamateria.com.br/revolta-do-juazeiro/
// - O Povo, "Nona ruptura: a sedição que mudou o Ceará" (queda de Accioly em janeiro de 1912, deposição de Franco Rabelo)
//   https://mais.opovo.com.br/reportagens-especiais/fortaleza-300-anos-biografia-rupturas/2026/06/12/nona-ruptura-a-sedicao-que-mudou-o-ceara.html
// Divergência: o valado aparece como Círculo da Mãe das Dores ou da Mãe de Deus, e o dia da deposição varia. O jogo diz "valado" e "março de 1914".
//
// Revolta da Vacina (1904):
// - Correio Braziliense, "Revolta da Vacina: como lei de vacinação obrigatória provocou caos no Rio de Janeiro" (2024), com a historiadora Tania Fernandes, da Fiocruz
//   https://www.correiobraziliense.com.br/mundo/2024/10/6977596-revolta-da-vacina-como-lei-de-vacinacao-obrigatoria-provocou-caos-no-rio-de-janeiro.html
// - História do Mundo, "Revolta da Vacina"
//   https://www.historiadomundo.com.br/idade-contemporanea/insurreicao-popular-na-revolta-da-vacina.htm
//
// Revolução Haitiana (1791 a 1804):
// - Wikipédia, "Toussaint Louverture" (captura em 07/06/1802, morte em Fort-de-Joux em 07/04/1803, abolição francesa em 04/02/1794, independência em 01/01/1804)
//   https://en.wikipedia.org/wiki/Toussaint_Louverture
// - Wikipédia, "Timeline of Haitian history" (Bois-Caïman, Vertières, Dessalines)
//   https://en.wikipedia.org/wiki/Timeline_of_Haitian_history
// - Revista Ponto de Vista (UFV), "Haitianismo e percepção da Revolução Haitiana na sociedade escravista brasileira do século XIX"
//   https://periodicos.ufv.br/RPV/article/download/14537/7546/68454
//
// Datas usadas nos anacronismos:
// - República em 15/11/1889 e Lei Áurea em 13/05/1888: Diário do Nordeste, acima.
// - Primeira transmissão oficial de rádio no Brasil em 07/09/1922: Jovem Pan, "Dia Nacional do Rádio"
//   https://jovempan.com.br/programas/jornal-da-manha/dia-nacional-do-radio-no-brasil-a-primeira-transmissao-aconteceu-em-1922.html
// - Penicilina em 1928: Live Science, "Alexander Fleming wakes up to funny mold in his petri dish"
//   https://www.livescience.com/health/science-history-alexander-fleming-wakes-up-to-funny-mold-in-his-petri-dish-and-accidentally-discovers-the-first-antibiotic-sept-28-1928
//
// Este arquivo não depende de React: o teste em scripts/testar-narrativos.ts confere toda a estrutura.

export const ROTULO_FICCAO = "Recriação didática. Autor e texto fictícios, escritos para este jogo. Não é documento de época.";
export const ROTULO_NOTA = "Recriação didática. Resumo escrito para este jogo, com fatos conferidos em fontes reais.";

export type Tipo = "carta" | "jornal" | "oficio" | "registro" | "nota" | "boletim" | "folheto" | "relato";
export type Trecho = { id: string; t: string };
export type Documento = { id: string; tipo: Tipo; titulo: string; origem: string; rotulo: string; trechos: Trecho[] };
export type Opcao = { t: string; certa?: boolean; porque: string };
export type Parte = string | { opcoes: Opcao[] };

export type Caso = {
  id: string;
  ano: number;
  periodo: string;
  lugar: string;
  titulo: string;
  cenario: "porto" | "aurora" | "sertao" | "rio" | "ilha";
  missao: string;
  briefing: string;
  documentos: Documento[];
  fonte: { doc: string; pergunta: string; opcoes: Opcao[]; estudo: string };
  comparar: {
    pergunta: string;
    a: string;
    b: string;
    certosA: string[];
    certosB: string[];
    /** Por que cada trecho que não é o certo não resolve a comparação. */
    errosA: Record<string, string>;
    errosB: Record<string, string>;
    explicacao: string;
    estudo: string;
  };
  anacronismo: {
    doc: Documento;
    impossivel: string;
    /** Por que o trecho certo não pode ser daquela data. */
    porque: string;
    /** Por que cada um dos outros trechos é compatível com a data. */
    compativeis: Record<string, string>;
    selo: string;
    estudo: string;
  };
  conclusao: { partes: Parte[]; estudo: string };
  balanco: { fatos: string[]; fontes: string };
};

export const ETAPAS = ["fonte", "comparar", "anacronismo", "conclusao", "balanco"] as const;
export type Etapa = (typeof ETAPAS)[number];
export const NOME_ETAPA: Record<Etapa, string> = { fonte: "Analisar a fonte", comparar: "Comparar versões", anacronismo: "Caçar o anacronismo", conclusao: "Montar a conclusão", balanco: "O que a pesquisa registra" };

export const PONTOS_ETAPA = 100;
export const PERDA_POR_ERRO = 25;
export const PONTOS_MINIMOS = 25;
export const PRECISAO_MINIMA = 70;
export const MINIMO_DE_CASOS = 2;

const doc = (id: string, tipo: Tipo, titulo: string, origem: string, trechos: string[], rotulo = ROTULO_FICCAO): Documento => ({
  id, tipo, titulo, origem, rotulo,
  trechos: trechos.map((t, i) => ({ id: `${id}-${i + 1}`, t })),
});

export const CASOS: Caso[] = [
  {
    id: "haiti", ano: 1791, periodo: "1791 a 1804", lugar: "Saint-Domingue, Caribe", titulo: "A revolução que assustou as Américas", cenario: "ilha",
    missao: "Quem fez a Revolução Haitiana, e por que o medo dela chegou ao Brasil?",
    briefing: "Colônia francesa de Saint-Domingue. Uma carta diz que tudo é obra de agitadores. Outra voz diz que não. Investiga comigo.",
    documentos: [
      doc("hai-carta", "carta", "Carta de um senhor de terras", "Recriação: colono francês fictício, fim de 1791", [
        "Desde agosto, os levantes se espalham pela colônia.",
        "Isto só pode ser obra de agitadores vindos de fora, pois os cativos não teriam ideia própria.",
        "Exijo que a França mande tropas sem demora.",
        "Não durmo mais em paz nesta colônia.",
      ]),
      doc("hai-relato", "relato", "Relato de um combatente", "Recriação: ex-escravizado fictício, 1794", [
        "Na noite de agosto, juramos morrer pela liberdade.",
        "Ninguém nos deu essa luta: a França só proclamou o fim da escravidão quando já combatíamos havia anos.",
        "Ainda temo que voltem a nos pôr correntes.",
        "Conto isso para que meus netos saibam.",
      ]),
      doc("hai-nota", "nota", "Nota de pesquisa", "Resumo atual", [
        "Em agosto de 1791, uma cerimônia em Bois-Caïman, ligada a Dutty Boukman e Cécile Fatiman, é lembrada como início do levante.",
        "A França revolucionária proclamou o fim da escravidão em 4 de fevereiro de 1794.",
        "Toussaint Louverture foi capturado em junho de 1802 e morreu preso em Fort-de-Joux, na França, em 7 de abril de 1803.",
        "Depois da vitória em Vertières, em novembro de 1803, Jean-Jacques Dessalines proclamou a independência do Haiti em 1º de janeiro de 1804.",
        "No Brasil escravista, o medo de um novo Haiti ganhou o nome de haitianismo.",
      ], ROTULO_NOTA),
    ],
    fonte: {
      doc: "hai-carta",
      pergunta: "A carta do colono é cheia de preconceito. Ela ainda serve como fonte?",
      opcoes: [
        { t: "Serve para mostrar como os senhores viam os escravizados e o medo que sentiam, desde que não seja lida como descrição neutra.", certa: true, porque: "Isso. Uma fonte parcial não é uma fonte inútil. Ela é ótima para estudar quem escreveu, ainda que seja ruim para explicar sozinha quem fez a revolta." },
        { t: "Não serve: fonte com preconceito precisa ser descartada.", porque: "Se a pesquisa descartasse toda fonte com ponto de vista, sobraria muito pouco. O trabalho é perguntar quem escreve, para quem e por quê." },
        { t: "Serve para provar que havia agitadores de fora no comando.", porque: "A carta afirma isso, mas não prova. Ele nem apresenta evidência, só diz que os cativos “não teriam ideia própria”. Isso é crença de quem escreve." },
        { t: "Serve como relato imparcial, porque é da época.", porque: "Ser da época não torna ninguém imparcial. Ele era dono de terras e tinha muito a perder. Fonte antiga também tem interesse." },
      ],
      estudo: "Diante de qualquer fonte, faça quatro perguntas: quem escreveu, quando, para quem e com que interesse.",
    },
    comparar: {
      pergunta: "As duas fontes discordam sobre quem conduz a revolta. Marque o trecho de cada uma em que isso aparece.",
      a: "hai-carta", b: "hai-relato",
      certosA: ["hai-carta-2"], certosB: ["hai-relato-1", "hai-relato-2"],
      errosA: {
        "hai-carta-1": "Este trecho só informa que os levantes aconteceram, e o combatente não discordaria disso. Procure onde o colono explica quem está por trás.",
        "hai-carta-3": "Este trecho mostra o que o colono quer, mas não diz quem conduz a revolta.",
        "hai-carta-4": "Aqui ele conta como se sente. É útil para entender o medo, mas não entra na disputa sobre quem conduz.",
      },
      errosB: {
        "hai-relato-3": "Este trecho mostra um temor do combatente. Ele não responde a quem conduziu a luta.",
        "hai-relato-4": "Este trecho explica por que ele conta a história, e não quem fez a revolta.",
      },
      explicacao: "De um lado, os cativos não teriam ideia própria. Do outro, eles mesmos juraram e combateram. As duas versões dizem muito sobre quem as escreveu, e a nota de pesquisa mostra que a luta partiu das pessoas escravizadas.",
      estudo: "Para comparar versões, procure o ponto exato do desacordo. Comparar o texto inteiro costuma dar em conclusão vaga.",
    },
    anacronismo: {
      doc: doc("hai-susp", "boletim", "Proclamação copiada", "Cópia suspeita, datada de 1º de janeiro de 1804", [
        "Jean-Jacques Dessalines proclama hoje a independência.",
        "O território passa a se chamar Haiti.",
        "Toussaint Louverture assina este ato ao lado de Dessalines.",
        "A vitória de Vertières, em novembro passado, abriu este caminho.",
      ]),
      impossivel: "hai-susp-3",
      porque: "Toussaint Louverture morreu preso na França em 7 de abril de 1803, nove meses antes dessa data. Ele não poderia assinar nada em 1804. Um detalhe assim revela que a cópia foi feita depois, por alguém que confiou na memória.",
      compativeis: {
        "hai-susp-1": "Esse fato é da própria data: Dessalines proclamou a independência em 1º de janeiro de 1804.",
        "hai-susp-2": "O nome Haiti foi adotado junto com a independência. O trecho combina com a data.",
        "hai-susp-4": "Vertières foi em 18 de novembro de 1803, poucas semanas antes. O trecho combina com a data.",
      },
      selo: "Impossível em 1804",
      estudo: "Para achar anacronismo, confira uma coisa por vez: as pessoas citadas estavam vivas? O objeto, a palavra e o cargo já existiam?",
    },
    conclusao: {
      partes: [
        "A Revolução Haitiana começou ",
        { opcoes: [
          { t: "em 1791, com o levante de pessoas escravizadas", certa: true, porque: "Isso. As datas e os relatos apontam para agosto de 1791." },
          { t: "em 1794, com uma ordem vinda da França", porque: "1794 é a data em que a França proclamou o fim da escravidão, e isso veio depois de anos de luta. O começo foi antes." },
          { t: "em 1804, com a chegada de agitadores estrangeiros", porque: "1804 é o ano da independência, o fim do processo. E os agitadores de fora são só uma crença do colono, sem prova na mesa." },
        ] },
        ", pressionou a França a ",
        { opcoes: [
          { t: "proclamar o fim da escravidão em 1794", certa: true, porque: "Sim. A nota registra 4 de fevereiro de 1794." },
          { t: "vender a colônia para Portugal", porque: "Nenhuma fonte da mesa fala nisso. Em uma conclusão, cada afirmação precisa ter um documento por trás." },
          { t: "aumentar a escravidão nas outras colônias", porque: "As fontes da mesa não sustentam essa afirmação. O que elas registram em 1794 é a proclamação do fim da escravidão." },
        ] },
        " e terminou com ",
        { opcoes: [
          { t: "a independência proclamada por Dessalines em 1804", certa: true, porque: "Exato, em 1º de janeiro de 1804." },
          { t: "a independência proclamada por Toussaint em 1804", porque: "Essa é a armadilha da cópia suspeita: Toussaint morreu em 1803. Ele foi uma figura central, mas não proclamou a independência." },
          { t: "a volta da colônia ao domínio francês", porque: "A nota mostra o contrário: em 1803, a vitória em Vertières, e em 1804, a independência." },
        ] },
        ". No Brasil escravista, ela ",
        { opcoes: [
          { t: "virou motivo de medo entre as elites, o haitianismo", certa: true, porque: "Sim. O termo nomeia o temor de que o Haiti se repetisse aqui." },
          { t: "passou despercebida", porque: "A nota registra o contrário: o medo ganhou até nome próprio, haitianismo." },
          { t: "levou à abolição imediata", porque: "A escravidão no Brasil só terminou por lei em 1888. O exemplo haitiano gerou medo entre as elites, e não abolição." },
        ] },
        ".",
      ],
      estudo: "Boa conclusão histórica une fato, data e contexto, e não afirma nada que as fontes não sustentem.",
    },
    balanco: {
      fatos: [
        "Em 1º de janeiro de 1804, o Haiti se tornou independente depois de uma revolução feita por pessoas escravizadas.",
        "A França proclamou o fim da escravidão em 1794, e Napoleão enviou uma expedição militar em 1802 para retomar o controle.",
        "Toussaint Louverture, capturado em 1802, morreu em Fort-de-Joux em 7 de abril de 1803.",
        "No Brasil, o medo do exemplo haitiano é chamado de haitianismo. Pesquisas o ligam à repressão de revoltas como a dos Malês, na Bahia, em 1835.",
      ],
      fontes: "Wikipédia (Toussaint Louverture; cronologia do Haiti) e Revista Ponto de Vista, da UFV.",
    },
  },
  {
    id: "jangadeiros", ano: 1881, periodo: "1881", lugar: "Porto de Fortaleza", titulo: "A greve que fechou o porto", cenario: "porto",
    missao: "Quem parou o embarque de pessoas escravizadas em Fortaleza, e por que a memória guardou um nome só?",
    briefing: "Praia de Fortaleza, 1881. O comércio de gente para outras províncias passa por aqui, e os homens do mar decidiram parar. Vamos ver quem conta essa história, e como.",
    documentos: [
      doc("jan-carta", "carta", "Carta de um comerciante", "Recriação: comerciante fictício de Fortaleza, agosto de 1881", [
        "Os jangadeiros recusaram de novo levar os cativos até os navios.",
        "Sem as jangadas, ninguém chega aos vapores.",
        "Dizem por aí que a greve é coisa de meia dúzia de agitadores.",
        "A venda de cativos para outras províncias está perdida neste porto.",
      ]),
      doc("jan-folha", "jornal", "A Voz da Praia", "Recriação: folha abolicionista fictícia, agosto de 1881", [
        "O povo da praia fechou o porto ao comércio de gente.",
        "À frente desta jornada está Francisco José do Nascimento, o Chico da Matilde.",
        "A Sociedade Cearense Libertadora saúda os homens do mar.",
        "Corre pela praia a frase: no porto do Ceará não se embarcam mais escravos.",
      ]),
      doc("jan-nota", "nota", "Nota de pesquisa", "Resumo atual", [
        "A primeira greve foi em janeiro de 1881. Em 28 de janeiro, a Gazeta do Norte apontou o liberto José Napoleão à frente dela.",
        "José Luís Napoleão nasceu em Icó e foi escravizado. Depois de conquistar a liberdade, trabalhou para libertar as quatro irmãs.",
        "Tia Simoa, Maria Simoa da Conceição, companheira de Napoleão, também é lembrada no movimento.",
        "A segunda greve, em 30 de agosto de 1881, teve a liderança de Francisco José do Nascimento, depois conhecido como Dragão do Mar.",
      ], ROTULO_NOTA),
    ],
    fonte: {
      doc: "jan-carta",
      pergunta: "O comerciante chama os grevistas de agitadores. Qual é o melhor uso dessa carta?",
      opcoes: [
        { t: "Mostrar que o embarque estava mesmo sendo interrompido, e como quem lucrava com o tráfico enxergava o movimento.", certa: true, porque: "Isso. Até um adversário confirma que os navios não recebiam os cativos. Quando a fonte contrária confirma o fato, ele ganha força." },
        { t: "Provar que eram só meia dúzia de pessoas.", porque: "Ele mesmo escreve “dizem por aí”, ou seja, é boato, dito por quem tinha interesse em diminuir a greve. Boato não é prova de número." },
        { t: "Descartar, porque o comerciante era contra a greve.", porque: "Ser contra não invalida a fonte. Ela é justamente valiosa para entender o outro lado e confirmar o efeito da greve." },
        { t: "Concluir que os jangadeiros agiram por ordem dos comerciantes.", porque: "A carta mostra o contrário: o comerciante está sendo prejudicado. Nada indica que os comerciantes mandavam na greve." },
      ],
      estudo: "Fonte adversária que confirma um fato pesa muito, porque ela não teria motivo para inventá-lo.",
    },
    comparar: {
      pergunta: "As duas fontes contam a greve de modos diferentes. Marque onde cada uma diz quem está fazendo o movimento.",
      a: "jan-carta", b: "jan-folha",
      certosA: ["jan-carta-3"], certosB: ["jan-folha-1"],
      errosA: {
        "jan-carta-1": "Neste ponto as duas fontes concordam: houve recusa. Procure onde elas discordam sobre quem está por trás.",
        "jan-carta-2": "Este trecho explica como o porto funcionava. Não é um julgamento sobre os grevistas.",
        "jan-carta-4": "Este trecho mostra o prejuízo do comerciante, e a folha abolicionista não negaria isso.",
      },
      errosB: {
        "jan-folha-2": "Este trecho aponta um líder, mas a comparação pede quem é o conjunto do movimento: agitadores ou o povo?",
        "jan-folha-3": "Este trecho mostra quem apoia, e não quem faz a greve.",
        "jan-folha-4": "É um lema do movimento. Ele diz o que se quer, e não quem está na praia.",
      },
      explicacao: "“Meia dúzia de agitadores” e “o povo da praia” descrevem a mesma greve. O comerciante precisa diminuir o movimento, e a folha precisa engrandecê-lo. Nenhuma das duas é neutra.",
      estudo: "Repare nas palavras escolhidas para nomear o mesmo grupo. Agitador, povo e herói já trazem uma opinião embutida.",
    },
    anacronismo: {
      doc: doc("jan-susp", "boletim", "Boletim do porto", "Cópia suspeita, datada de setembro de 1881", [
        "O porto amanheceu sem embarque de cativos.",
        "Os jangadeiros foram saudados pelos abolicionistas da cidade.",
        "O presidente da República exigiu explicações da província.",
        "A Sociedade Cearense Libertadora, fundada no ano anterior, comemorou.",
      ]),
      impossivel: "jan-susp-3",
      porque: "Em 1881, o Brasil era um Império. A República só foi proclamada em 15 de novembro de 1889. Não existia presidente da República. Existia presidente de província, que é outra coisa.",
      compativeis: {
        "jan-susp-1": "A greve de agosto de 1881 fez exatamente isso. O trecho combina com a data.",
        "jan-susp-2": "O movimento abolicionista de Fortaleza apoiava os jangadeiros. O trecho combina com a data.",
        "jan-susp-4": "A Sociedade Cearense Libertadora foi fundada em 1880, o ano anterior. O trecho combina com a data.",
      },
      selo: "Impossível em 1881",
      estudo: "Cargos e formas de governo são pistas ótimas de anacronismo. Antes de 1889, pense em Império e província. Depois, em República e estado.",
    },
    conclusao: {
      partes: [
        "Em 1881, ",
        { opcoes: [
          { t: "jangadeiros e libertos do porto de Fortaleza", certa: true, porque: "Sim. A nota e as duas fontes colocam esses grupos na praia." },
          { t: "os comerciantes de Fortaleza", porque: "O comerciante aparece como prejudicado, e não como autor da greve." },
          { t: "tropas enviadas pela Corte", porque: "Nenhuma fonte da mesa menciona tropas enviadas para fazer a greve. Não afirme o que os documentos não sustentam." },
        ] },
        " recusaram-se a levar pessoas escravizadas aos navios, o que atingiu ",
        { opcoes: [
          { t: "a venda de cativos para outras províncias", certa: true, porque: "Isso. O tráfico interno passava pelo porto, e a própria carta do comerciante reconhece o prejuízo." },
          { t: "o tráfico vindo da África, que crescia em 1881", porque: "O tráfico africano tinha sido proibido em 1850. Em 1881, o comércio em Fortaleza era o tráfico interno, para outras províncias." },
          { t: "a exportação de carnaúba", porque: "Nenhuma fonte da mesa fala em carnaúba. A disputa é sobre o embarque de pessoas." },
        ] },
        ". A memória consagrou ",
        { opcoes: [
          { t: "Dragão do Mar", certa: true, porque: "Certo. É o nome que atravessou o tempo." },
          { t: "José Napoleão", porque: "É o contrário: a nota mostra que Napoleão foi apontado à frente da greve de janeiro, e pesquisadores falam em lacuna sobre ele. O nome consagrado é outro." },
          { t: "o comerciante da carta", porque: "Esse personagem é fictício, criado para o jogo. E a memória não guarda os adversários da greve como heróis." },
        ] },
        ", mas a pesquisa mostra ",
        { opcoes: [
          { t: "a liderança do liberto José Napoleão em janeiro e a presença de Tia Simoa", certa: true, porque: "Exato. Um jornal da própria época já registrava Napoleão à frente da greve de janeiro." },
          { t: "que a greve nunca aconteceu", porque: "Todas as fontes confirmam a greve, até a adversária. Questionar a memória é diferente de negar o fato." },
          { t: "que Dragão do Mar não existiu", porque: "Francisco José do Nascimento existiu e liderou a greve de agosto. O ponto é ampliar a história, e não apagá-lo." },
        ] },
        ".",
      ],
      estudo: "Separe o que aconteceu do que a memória escolheu lembrar. A ONHB gosta de perguntar por que um nome ficou e outro não.",
    },
    balanco: {
      fatos: [
        "Os jangadeiros pararam o embarque em janeiro e em 30 de agosto de 1881.",
        "A Gazeta do Norte de 28 de janeiro de 1881 apontou o liberto José Napoleão à frente da greve de janeiro.",
        "Francisco José do Nascimento (1839 a 1914), prático do porto, liderou a greve de agosto e virou o Dragão do Mar. Em 1884, a jangada ligada a ele foi levada ao Rio de Janeiro e doada ao Museu Nacional.",
        "O museólogo Saulo Moreno aponta a atuação de Napoleão e de Tia Simoa como uma lacuna da historiografia.",
      ],
      fontes: "O Povo (Dragões do Ceará), Diário do Nordeste e Wikipédia.",
    },
  },
  {
    id: "abolicao", ano: 1884, periodo: "1884 a 1886", lugar: "Província do Ceará", titulo: "A luz e a sombra da Terra da Luz", cenario: "aurora",
    missao: "O Ceará acabou mesmo com a escravidão em 25 de março de 1884?",
    briefing: "Março de 1884. Há festa e discurso. O Ceará se declara livre quatro anos antes da Lei Áurea. Agora, vamos conferir a festa contra outros papéis.",
    documentos: [
      doc("abo-folheto", "folheto", "Folheto da festa", "Recriação: panfleto comemorativo fictício, março de 1884", [
        "Hoje o presidente da província, Sátiro de Oliveira Dias, declara livre o Ceará.",
        "Não resta um só cativo nesta terra.",
        "Acarape abriu o caminho em 1883, e Fortaleza veio logo atrás.",
        "O Ceará é agora a Terra da Luz.",
      ]),
      doc("abo-registro", "registro", "Caderno de um escrivão", "Recriação: escrivão fictício do Cariri, 1886", [
        "A contagem feita em Milagres ainda acha perto de 500 cativos.",
        "Fugidos de outras províncias são caçados e mandados de volta.",
        "A festa de 1884 parece coisa distante aqui no sul da província.",
        "No resto do Império, a escravidão segue como lei.",
      ]),
      doc("abo-nota", "nota", "Nota de pesquisa", "Resumo atual", [
        "A partir de 1850, vender pessoas escravizadas para o Sul virou fonte de renda na província, e a seca de 1877 intensificou essas vendas.",
        "A Sociedade Cearense Libertadora foi fundada em 1880. Maria Tomásia Figueira Lima presidiu a Sociedade das Cearenses Libertadoras.",
        "Em 1º de janeiro de 1883, Acarape, hoje Redenção, declarou o fim da escravidão, com a entrega de 116 cartas de alforria. Os donos foram indenizados.",
        "Fortaleza declarou a abolição em 24 de maio de 1883. A Lei Áurea só veio em 13 de maio de 1888.",
      ], ROTULO_NOTA),
    ],
    fonte: {
      doc: "abo-folheto",
      pergunta: "O folheto diz que “não resta um só cativo”. Como ler essa frase?",
      opcoes: [
        { t: "Como registro da comemoração e do projeto político da época, que precisa ser conferido com outros documentos.", certa: true, porque: "Isso. Folheto de festa é feito para celebrar. Ele mostra muito bem o que aquela gente queria afirmar, e pouco sobre o que acontecia em cada vila." },
        { t: "Como prova de que não havia mais nenhuma pessoa escravizada.", porque: "Um folheto comemorativo tem interesse em afirmar a vitória. Prova de fato pede outra conferência, como uma contagem local." },
        { t: "Como mentira sem nenhum valor histórico.", porque: "Exagero não é inutilidade. A declaração de 1884 foi um marco real, e o folheto mostra como ela foi vivida por quem comemorou." },
        { t: "Como lei oficial do Império.", porque: "Folheto não é lei. E a lei do Império que encerrou a escravidão em todo o país só viria em 1888." },
      ],
      estudo: "Pergunte sempre para que aquele documento foi feito. Festa celebra, lei ordena, denúncia acusa e propaganda convence.",
    },
    comparar: {
      pergunta: "Uma fonte afirma o fim total, e a outra desmente. Marque o trecho de cada uma.",
      a: "abo-folheto", b: "abo-registro",
      certosA: ["abo-folheto-2"], certosB: ["abo-registro-1"],
      errosA: {
        "abo-folheto-1": "A declaração de 25 de março aconteceu. O escrivão não nega isso. A discordância está em outra frase.",
        "abo-folheto-3": "Acarape e Fortaleza são marcos confirmados. O escrivão não contesta nenhum dos dois.",
        "abo-folheto-4": "“Terra da Luz” é um apelido. Ele celebra, mas não afirma um número que possa ser desmentido.",
      },
      errosB: {
        "abo-registro-2": "Este trecho mostra outra permanência da escravidão, a caça a fugidos, mas o folheto fala de cativos na província. A resposta mais direta é a contagem.",
        "abo-registro-3": "Este trecho é uma impressão do escrivão. Compare com o dado que dá para conferir.",
        "abo-registro-4": "Este trecho fala do resto do Império, e o folheto trata só do Ceará. Eles não estão em conflito.",
      },
      explicacao: "“Não resta um só cativo” e “perto de 500 cativos” não podem ser verdade ao mesmo tempo. A contagem de 1886 em Milagres, no Cariri, mostra que a declaração foi um marco real, mas não encerrou tudo no mesmo dia.",
      estudo: "Número, lugar e data ajudam a desempatar versões. Sempre que achar um dado concreto, compare com as frases gerais.",
    },
    anacronismo: {
      doc: doc("abo-susp", "oficio", "Ata da festa", "Cópia suspeita, datada de 25 de março de 1884", [
        "O presidente da província declara livre o Ceará.",
        "A capital, Fortaleza, já se declarara livre em maio do ano anterior.",
        "A província segue o exemplo da Lei Áurea, assinada pela princesa Isabel.",
        "Abolicionistas da província estão presentes ao ato.",
      ]),
      impossivel: "abo-susp-3",
      porque: "A Lei Áurea é de 13 de maio de 1888, quatro anos depois dessa data. O Ceará não poderia seguir um exemplo que ainda não existia. Na verdade, foi o contrário: a abolição no Ceará veio antes.",
      compativeis: {
        "abo-susp-1": "Sátiro de Oliveira Dias, presidente da província, fez essa declaração em 25 de março de 1884.",
        "abo-susp-2": "Fortaleza declarou a abolição em 24 de maio de 1883, o ano anterior. O trecho combina com a data.",
        "abo-susp-4": "O movimento abolicionista cearense era forte e participou das comemorações. O trecho combina com a data.",
      },
      selo: "Impossível em 1884",
      estudo: "Monte uma linha do tempo mínima antes de ler: 1850, 1884, 1888, 1889. Muitos anacronismos caem na hora.",
    },
    conclusao: {
      partes: [
        "A declaração de 25 de março de 1884 foi ",
        { opcoes: [
          { t: "um marco político real e pioneiro", certa: true, porque: "Isso. O Ceará declarou o fim da escravidão quatro anos antes da Lei Áurea." },
          { t: "uma invenção posterior, que nunca ocorreu", porque: "Ela aconteceu e está confirmada. Questionar o alcance de um fato é diferente de negar o fato." },
          { t: "uma ordem da princesa Isabel", porque: "A declaração foi feita pelo presidente da província, Sátiro de Oliveira Dias. A assinatura da princesa é da Lei Áurea, em 1888." },
        ] },
        ", resultado de ",
        { opcoes: [
          { t: "luta popular e de sociedades abolicionistas", certa: true, porque: "Sim. Jangadeiros, libertos e sociedades como a Libertadora fazem parte dessa história." },
          { t: "uma decisão isolada, sem movimento nenhum", porque: "As fontes da mesa mostram sociedades abolicionistas, marcos anteriores e uma greve anos antes. Nada indica decisão isolada." },
          { t: "um pedido dos compradores de escravizados do Sul", porque: "Esses compradores se beneficiavam do tráfico. Nenhuma fonte os coloca do lado da abolição." },
        ] },
        ". Mas ",
        { opcoes: [
          { t: "a escravidão não sumiu de imediato: em 1886 ainda se contavam cativos no Cariri", certa: true, porque: "Exato. É isso que separa um marco político de uma mudança completa." },
          { t: "todos os libertos receberam terras naquele ano", porque: "Nenhuma fonte da mesa diz isso. Pelo contrário, em Acarape quem foi indenizado foram os donos." },
          { t: "a escravidão já tinha terminado em todo o Brasil", porque: "Ela só terminou por lei no Brasil em 1888, como mostra a nota." },
        ] },
        ", e a abolição em todo o país só veio em ",
        { opcoes: [
          { t: "1888, com a Lei Áurea", certa: true, porque: "Certo: 13 de maio de 1888." },
          { t: "1850, com o fim do tráfico africano", porque: "1850 foi o fim do tráfico vindo da África, e não da escravidão." },
          { t: "1889, com a República", porque: "A República veio um ano depois da abolição. São dois eventos diferentes." },
        ] },
        ".",
      ],
      estudo: "Evite os dois extremos: nem “o Ceará resolveu tudo”, nem “não aconteceu nada”. Conclusão boa tem um “mas” bem fundamentado.",
    },
    balanco: {
      fatos: [
        "Acarape declarou o fim da escravidão em 1º de janeiro de 1883, Fortaleza em 24 de maio de 1883, e a província em 25 de março de 1884.",
        "Dois anos depois, uma contagem achou 500 cativos em Milagres, no Cariri, e fugitivos de outras províncias eram caçados e devolvidos.",
        "O apelido Terra da Luz é creditado a José do Patrocínio.",
        "Historiadoras lembram que a exploração continuou depois da abolição, e perguntam para quem ela de fato serviu.",
      ],
      fontes: "Diário do Nordeste (mitos sobre a abolição) e O Povo (Data Magna; Sétima ruptura).",
    },
  },
  {
    id: "vacina", ano: 1904, periodo: "novembro de 1904", lugar: "Rio de Janeiro, então capital", titulo: "A cidade contra a vacina?", cenario: "rio",
    missao: "O povo do Rio se revoltou só contra a vacina?",
    briefing: "Rio de Janeiro, novembro de 1904. A cidade está parada, com conflito nas ruas. A vacina contra a varíola salva vidas, e mesmo assim a cidade explodiu. Vamos entender por quê.",
    documentos: [
      doc("vac-jornal", "jornal", "Gazeta da Ordem", "Recriação: jornal fictício favorável ao governo, novembro de 1904", [
        "A vacina é a defesa da cidade contra a varíola.",
        "Os motins nascem só da ignorância de um povo que teme a vacina.",
        "O governo age para o bem de todos.",
        "O Diretor Geral de Saúde Pública, Oswaldo Cruz, cumpre o seu dever.",
      ]),
      doc("vac-moradora", "relato", "Relato de uma moradora", "Recriação: lavadeira fictícia do centro, novembro de 1904", [
        "Derrubaram o cortiço onde eu morava, por causa da reforma da cidade.",
        "Agora dizem que, sem atestado de vacina, não tem emprego nem matrícula.",
        "Ninguém veio explicar o que essa vacina faz.",
        "Também tenho medo do que ouvi falar dela.",
      ]),
      doc("vac-nota", "nota", "Nota de pesquisa", "Resumo atual", [
        "Em 31 de outubro de 1904, o presidente Rodrigues Alves assinou a vacinação obrigatória contra a varíola.",
        "Em 9 de novembro, o jornal A Notícia publicou um projeto de regulamentação que exigia comprovante para empregos, matrículas, viagens, hotéis e casamentos.",
        "A reforma urbana do prefeito Pereira Passos tinha destruído cortiços no centro. Oswaldo Cruz tinha autoridade para vistoriar e demolir imóveis.",
        "A cidade ficou paralisada de 10 a 16 de novembro. O saldo oficial: 30 mortos, 110 feridos, 945 presos e 461 deportados para o Acre.",
      ], ROTULO_NOTA),
    ],
    fonte: {
      doc: "vac-jornal",
      pergunta: "O jornal diz que a revolta é “só ignorância”. Como tratar essa afirmação?",
      opcoes: [
        { t: "Como a posição de quem defendia o governo, que acerta sobre a vacina, mas simplifica as causas da revolta.", certa: true, porque: "Isso. A vacina funcionava de fato. Mas explicar a revolta só por ignorância deixa de fora despejos, obrigações e falta de diálogo." },
        { t: "Como explicação completa, porque o jornal estava certo sobre a vacina.", porque: "Estar certo em um ponto não garante acerto em todos. A vacina ser eficaz não explica sozinha por que milhares foram às ruas." },
        { t: "Como prova de que a vacina fazia mal.", porque: "O jornal não diz isso, e a história mostra o contrário: a vacinação em massa levou ao fim da varíola no mundo, declarado em 1980." },
        { t: "Como texto sem importância, por ser a favor do governo.", porque: "Texto governista é fonte valiosa para entender como o poder via o povo. O problema é lê-lo sem comparar." },
      ],
      estudo: "Separe as afirmações dentro de um mesmo texto. Uma fonte pode acertar em uma coisa e errar em outra.",
    },
    comparar: {
      pergunta: "O jornal dá uma causa única para a revolta. Marque essa frase, e depois o trecho da moradora que mostra outra causa.",
      a: "vac-jornal", b: "vac-moradora",
      certosA: ["vac-jornal-2"], certosB: ["vac-moradora-1", "vac-moradora-2", "vac-moradora-3"],
      errosA: {
        "vac-jornal-1": "A moradora não discute a eficácia da vacina, e esse ponto é correto. A disputa está na causa dos motins.",
        "vac-jornal-3": "É uma frase de defesa do governo, mas não diz o que causou a revolta.",
        "vac-jornal-4": "Este trecho fala do trabalho de Oswaldo Cruz, e não do motivo da revolta.",
      },
      errosB: {
        "vac-moradora-4": "Este trecho até se aproxima do que o jornal diz: o medo de boatos existia. Procure o que o jornal deixou de fora.",
      },
      explicacao: "Despejo, atestado para trabalhar e falta de explicação não aparecem no jornal. Historiadores apontam a vacina como um estopim, somado a descontentamento social, carestia e má comunicação das medidas sanitárias.",
      estudo: "Desconfie de causa única. Em revoltas, procure o estopim e também o que já vinha se acumulando antes.",
    },
    anacronismo: {
      doc: doc("vac-susp", "oficio", "Relatório policial", "Cópia suspeita, datada de novembro de 1904", [
        "O presidente Rodrigues Alves assinou a obrigatoriedade em outubro.",
        "A cidade ficou paralisada por dias.",
        "Nos hospitais, os feridos foram tratados com penicilina.",
        "Os presos foram levados à Ilha das Cobras.",
      ]),
      impossivel: "vac-susp-3",
      porque: "Alexander Fleming só identificou a penicilina em 1928, 24 anos depois. Nenhum hospital poderia usá-la em 1904. Objetos, remédios e tecnologias são pistas fortes de anacronismo.",
      compativeis: {
        "vac-susp-1": "Rodrigues Alves assinou em 31 de outubro de 1904. O trecho combina com a data.",
        "vac-susp-2": "A paralisação foi de 10 a 16 de novembro. O trecho combina com a data.",
        "vac-susp-4": "Os 945 presos foram levados à Ilha das Cobras, segundo o saldo oficial. O trecho combina com a data.",
      },
      selo: "Impossível em 1904",
      estudo: "Ao ler sobre o passado, pergunte: isso já tinha sido inventado? Remédio, transporte e comunicação são os enganos mais comuns.",
    },
    conclusao: {
      partes: [
        "A Revolta da Vacina teve como estopim ",
        { opcoes: [
          { t: "a obrigatoriedade e o projeto que exigia comprovante", certa: true, porque: "Isso. A publicação do projeto, em 9 de novembro, veio um dia antes de a cidade parar." },
          { t: "a chegada da penicilina ao Rio", porque: "Essa é a armadilha da cópia suspeita. A penicilina é de 1928." },
          { t: "a proclamação da República", porque: "A República é de 1889, quinze anos antes. Ela não pode ser estopim de algo em 1904." },
        ] },
        ", mas juntou também ",
        { opcoes: [
          { t: "despejos da reforma urbana, carestia e falta de diálogo", certa: true, porque: "Sim. A vacina foi a faísca em um ambiente que já estava tenso." },
          { t: "apenas a ignorância da população", porque: "Essa é a versão do jornal governista. A moradora e a nota mostram outras causas." },
          { t: "uma guerra contra outro país", porque: "Nenhuma fonte da mesa fala em guerra externa. Foi um conflito dentro da cidade." },
        ] },
        ". O governo ",
        { opcoes: [
          { t: "reprimiu com prisões e deportações para o Acre", certa: true, porque: "Certo. O saldo oficial registra 945 presos e 461 deportados." },
          { t: "atendeu a todos sem nenhum conflito", porque: "Houve 30 mortos e 110 feridos segundo o saldo oficial. Não foi sem conflito." },
          { t: "transferiu a capital para Brasília", porque: "Nenhuma fonte da mesa diz isso. A capital continuava no Rio de Janeiro em 1904, como a própria missão informa." },
        ] },
        ". A vacina em si ",
        { opcoes: [
          { t: "funcionava, e sua ausência custou caro em 1908", certa: true, porque: "Isso. Com a fiscalização enfraquecida, uma epidemia matou quase 6,4 mil pessoas no Rio em 1908." },
          { t: "não funcionava, como a revolta prova", porque: "Uma revolta não prova nada sobre a eficácia de um remédio. A varíola foi declarada erradicada no mundo em 1980, graças à vacinação." },
          { t: "nunca chegou a ser aplicada no Brasil", porque: "Ela foi aplicada, e o último caso de varíola no Brasil foi em 1971." },
        ] },
        ".",
      ],
      estudo: "Você pode defender a ciência e, ao mesmo tempo, criticar o jeito como uma medida foi imposta. A história pede as duas coisas juntas.",
    },
    balanco: {
      fatos: [
        "A cidade parou de 10 a 16 de novembro de 1904. O governo decretou estado de sítio e suspendeu a vacinação obrigatória.",
        "A historiadora Tania Fernandes conta que a lei continuou valendo, mas sem fiscalização.",
        "Em 1908, uma epidemia de varíola matou quase 6,4 mil pessoas no Rio.",
        "O último caso de varíola no Brasil foi em 1971, e a doença foi declarada erradicada no mundo em 1980. Vacinas salvam vidas.",
      ],
      fontes: "Correio Braziliense (com a historiadora Tania Fernandes) e História do Mundo.",
    },
  },
  {
    id: "juazeiro", ano: 1914, periodo: "1913 e 1914", lugar: "Juazeiro, Cariri cearense", titulo: "Fé, trincheira e política", cenario: "sertao",
    missao: "A Sedição de Juazeiro foi só uma guerra de fé?",
    briefing: "Cariri, dezembro de 1913. A tropa do governo estadual marcha para Juazeiro, e os romeiros cavam um valado. Uma fonte fala em fanatismo, e outra fala em acordo entre chefes. Vamos abrir tudo na mesa.",
    documentos: [
      doc("jua-oficio", "oficio", "Ofício de um oficial", "Recriação: oficial fictício das forças do governo estadual, dezembro de 1913", [
        "A tropa do governo marcha para o Cariri.",
        "Não há política nisso: é fanatismo de romeiros, e nada mais.",
        "Encontramos Juazeiro cercada por um valado.",
        "O canhão que nos mandam há de encerrar o assunto.",
      ]),
      doc("jua-chefe", "carta", "Carta de um chefe político", "Recriação: chefe local fictício do Cariri, início de 1914", [
        "Desde o pacto de 1911, os chefes do Cariri agem juntos.",
        "O doutor Floro foi ao Rio em agosto do ano passado conversar com o senador Pinheiro Machado.",
        "Queremos fora o governo de Franco Rabelo.",
        "O Padre Cícero perdeu a intendência do Juazeiro por ato do governo.",
      ]),
      doc("jua-romeiro", "relato", "Relato de um romeiro", "Recriação: romeiro fictício, 1914", [
        "Cavei no valado porque disseram que vinham tomar a terra do meu Padrinho.",
        "Não entendo de governo. Entendo de promessa.",
        "Tenho fé que não vão passar.",
      ]),
      doc("jua-nota", "nota", "Nota de pesquisa", "Resumo atual", [
        "Em outubro de 1911, Juazeiro ganhou autonomia diante do Crato, e chefes políticos da região firmaram o Pacto dos Coronéis.",
        "Em janeiro de 1912, Nogueira Accioly deixou o governo do Ceará sob pressão popular. Marcos Franco Rabelo foi eleito depois, no contexto da Política das Salvações, do presidente Hermes da Fonseca.",
        "Em agosto de 1913, Floro Bartolomeu foi ao Rio encontrar Accioly e o senador Pinheiro Machado.",
        "Em janeiro de 1914, os revoltosos ocuparam o Crato. Em março, Franco Rabelo foi deposto. Hermes nomeou Setembrino de Carvalho como interino.",
      ], ROTULO_NOTA),
    ],
    fonte: {
      doc: "jua-romeiro",
      pergunta: "O romeiro só fala de fé. O que esse relato permite concluir?",
      opcoes: [
        { t: "Mostra por que muita gente pegou na enxada, mas não explica sozinho a disputa pelo governo do Ceará.", certa: true, porque: "Isso. A fé é real e importante nessa história. Mas o próprio romeiro avisa: “não entendo de governo”. Para isso, outras fontes são necessárias." },
        { t: "Prova que não houve política nenhuma na Sedição.", porque: "O romeiro não está em posição de saber, e ele mesmo diz isso. Se uma pessoa não vê a política, isso não significa que ela não exista." },
        { t: "Não tem valor, porque é um relato religioso.", porque: "Relato religioso é fonte legítima sobre crenças e motivações. Descartar a voz de quem cavou o valado apagaria quem fez a história." },
        { t: "Prova que o Padre Cícero comandava a tropa federal.", porque: "O relato não fala em tropa federal, e nenhuma fonte da mesa diz isso. Não é possível tirar essa afirmação do texto." },
      ],
      estudo: "Preste atenção no lugar de onde a pessoa fala. O que ela podia ver dali, e o que não podia?",
    },
    comparar: {
      pergunta: "O oficial nega que exista política no conflito. Marque essa frase, e depois um trecho do chefe local que a desmente.",
      a: "jua-oficio", b: "jua-chefe",
      certosA: ["jua-oficio-2"], certosB: ["jua-chefe-1", "jua-chefe-2", "jua-chefe-3"],
      errosA: {
        "jua-oficio-1": "O avanço da tropa é um fato que o chefe local não negaria. A disputa está no motivo do conflito.",
        "jua-oficio-3": "O valado é um fato físico, confirmado por todos. Ele não entra na discussão sobre fé e política.",
        "jua-oficio-4": "Este trecho mostra a confiança do oficial no canhão. O registro é que o canhão falhou, mas a pergunta aqui é outra.",
      },
      errosB: {
        "jua-chefe-4": "Esse trecho explica uma das razões da briga, mas o oficial não diz nada sobre isso. Procure uma articulação política clara.",
      },
      explicacao: "Pacto entre chefes, viagem ao Rio para falar com um senador e a meta de derrubar um governador: isso é política. Chamar tudo de fanatismo servia a quem queria tirar legitimidade dos adversários.",
      estudo: "Quando alguém diz “não há política nisso”, pergunte quem ganha com essa frase.",
    },
    anacronismo: {
      doc: doc("jua-susp", "boletim", "Boletim de guerra", "Cópia suspeita, datada de março de 1914", [
        "As forças de Juazeiro ocuparam o Crato em janeiro.",
        "O governador Franco Rabelo caiu neste mês.",
        "As rádios do Cariri transmitem a notícia ao vivo para todo o sertão.",
        "O presidente Hermes da Fonseca nomeou Setembrino de Carvalho para o governo interino.",
      ]),
      impossivel: "jua-susp-3",
      porque: "A primeira transmissão oficial de rádio no Brasil foi em 7 de setembro de 1922, oito anos depois. Em 1914, não havia emissora de rádio no Cariri.",
      compativeis: {
        "jua-susp-1": "Os revoltosos ocuparam o Crato em 24 de janeiro de 1914. O trecho combina com a data.",
        "jua-susp-2": "A deposição de Franco Rabelo foi em março de 1914. O trecho combina com a data.",
        "jua-susp-4": "Hermes da Fonseca governou de 1910 a 1914 e nomeou Setembrino de Carvalho. O trecho combina com a data.",
      },
      selo: "Impossível em 1914",
      estudo: "Tecnologia de comunicação é pista clássica. Lembre a ordem no Brasil: jornal, telégrafo, rádio em 1922 e televisão em 1950.",
    },
    conclusao: {
      partes: [
        "A Sedição de Juazeiro juntou ",
        { opcoes: [
          { t: "a fé dos romeiros", certa: true, porque: "Sim. O relato do romeiro mostra essa motivação." },
          { t: "a falta de religião no sertão", porque: "É o oposto do que os documentos mostram. A fé dos romeiros é central nessa história." },
          { t: "uma revolta de operários de fábrica", porque: "Nenhuma fonte da mesa fala em operários. A base era de romeiros e sertanejos." },
        ] },
        " e ",
        { opcoes: [
          { t: "a disputa entre oligarquias e o governo de Franco Rabelo", certa: true, porque: "Isso. O Pacto dos Coronéis e a viagem de Floro Bartolomeu mostram a articulação política." },
          { t: "a luta pela abolição da escravidão", porque: "A abolição é de 1888, décadas antes. Essa não era a questão em 1914." },
          { t: "um conflito contra a monarquia", porque: "Desde 1889 o Brasil era República, e o conflito aconteceu dentro dela." },
        ] },
        ". O conflito terminou com ",
        { opcoes: [
          { t: "a deposição de Franco Rabelo em março de 1914", certa: true, porque: "Certo, com Setembrino de Carvalho nomeado como interino." },
          { t: "a vitória de Franco Rabelo sobre Juazeiro", porque: "A nota mostra o contrário: os revoltosos ocuparam o Crato em janeiro, e Rabelo caiu em março." },
          { t: "a morte de Padre Cícero", porque: "Padre Cícero viveu até 1934 e, depois do conflito, seguiu na política como vice-governador." },
        ] },
        ", e isso mostra que ",
        { opcoes: [
          { t: "religião e política se misturavam na República Velha", certa: true, porque: "Essa é a conclusão que as fontes juntas sustentam." },
          { t: "tudo foi fanatismo, como disse o oficial", porque: "Essa era a versão de um lado da guerra. O chefe local e a nota mostram que havia política." },
          { t: "a fé não teve papel nenhum", porque: "É o erro oposto. O romeiro mostra que a fé moveu muita gente. Uma causa não apaga a outra." },
        ] },
        ".",
      ],
      estudo: "Evite o “ou”. Em História, fé e política, economia e cultura, raramente são alternativas que se excluem.",
    },
    balanco: {
      fatos: [
        "Em dezembro de 1913, uma assembleia dissidente declarou ilegal o governo de Franco Rabelo e nomeou Floro Bartolomeu para um governo provisório.",
        "Os defensores de Juazeiro derrotaram a primeira ofensiva, em 20 de dezembro, com ajuda de um valado. Um canhão enviado depois falhou.",
        "Depois da deposição de Rabelo, Benjamin Barroso foi eleito governador, com Padre Cícero como vice.",
        "Floro Bartolomeu, médico vindo da Bahia, chegou a Juazeiro em 1908 e se tornou o principal articulador político do movimento.",
      ],
      fontes: "Wikipédia (Sedição de Juazeiro), Toda Matéria e O Povo (Nona ruptura).",
    },
  },
];

/** Partes da conclusão que pedem resposta. */
export const lacunas = (c: Caso) => c.conclusao.partes.filter((p): p is { opcoes: Opcao[] } => typeof p !== "string");

export const pontosDaEtapa = (erros: number) => Math.max(PONTOS_MINIMOS, PONTOS_ETAPA - erros * PERDA_POR_ERRO);

export const precisao = (acertos: number, erros: number) => (acertos + erros === 0 ? 0 : Math.round((acertos / (acertos + erros)) * 100));

export type Final = { id: string; titulo: string; texto: string; licao: string };

export const FINAIS: Record<"firme" | "tremida", Final> = {
  firme: {
    id: "firme", titulo: "Linha do tempo firme",
    texto: "A banca do Instituto de Tempo recebe o seu relatório. Cada conclusão aponta para um documento, e cada documento foi questionado. A linha do tempo fica estável, e o seu nome entra na lista de quem pode viajar sozinho.",
    licao: "Você fez o trabalho de quem pesquisa História: desconfiar com método, comparar e só afirmar o que as fontes sustentam.",
  },
  tremida: {
    id: "tremida", titulo: "Linha do tempo tremida",
    texto: "A banca do Instituto de Tempo recebe o seu relatório, e devolve com anotações. As conclusões estão no caminho, mas várias nasceram de tentativa. A linha do tempo treme, e o cronógrafo pede mais uma volta antes da próxima viagem.",
    licao: "Errar faz parte da investigação, e as explicações que você leu são o treino. Volte aos casos sem pressa e confira uma fonte por vez.",
  },
};

export const finalDe = (acertos: number, erros: number) => (precisao(acertos, erros) >= PRECISAO_MINIMA ? FINAIS.firme : FINAIS.tremida);
