// Arquivo Perdido: história ramificada em que restaurar mensagens exige interpretar texto.
// A história, as personagens e os versos de Bento são autorais e fictícios.
//
// Citações de literatura, ambas em domínio público:
// - Luís de Camões, soneto "Amor é fogo que arde sem se ver" (ortografia atualizada).
//   Conferido em https://pt.wikisource.org/wiki/Amor_%C3%A9_fogo_que_arde_sem_se_ver
// - José de Alencar, Iracema (1865), primeira frase do capítulo I.
//   Conferido em https://pt.wikisource.org/wiki/Iracema/I
//
// Este arquivo não depende de React: o teste em scripts/testar-narrativos.ts percorre todo o grafo.

export type Cenario = "orbita" | "corredor" | "laboratorio" | "estufa" | "nucleo" | "lago" | "conversa" | "aberto" | "silencio" | "ruina";
export type Pose = "parado" | "acena" | "aponta" | "pensa" | "comemora" | "lupa" | "triste";

export type Condicao = { tem?: string[]; naoTem?: string[]; integridadeMenorQue?: number };

export type Mensagem = {
  rotulo: string;
  autor: string;
  linhas: string[];
  /** Palavra apagada: aparece como ruído em {lacuna} até a pessoa acertar. */
  lacuna?: string;
  /** Mensagem em verso, com uma linha por verso. */
  verso?: boolean;
};

export type Opcao = { t: string; certa?: boolean; porque: string };

type Base = { id: string; capitulo: number; cenario: Cenario };

export type CenaNarrativa = Base & {
  tipo: "narrativa";
  paragrafos: string[];
  fala?: string;
  pose?: Pose;
  /** Marcas ganhas ao entrar nesta cena. */
  marcas?: string[];
  escolhas: { t: string; vai: string; marca?: string; exige?: Condicao }[];
};

export type CenaDesafio = Base & {
  tipo: "desafio";
  habilidade: string;
  mensagem: Mensagem;
  /** Dados do problema, sempre visíveis: pares de frase e tradução. */
  tabela?: [string, string][];
  pergunta: string;
  dica: string;
  opcoes: Opcao[];
  estudo: string;
  vai: string;
};

export type CenaOrdem = Base & {
  tipo: "ordem";
  habilidade: string;
  mensagem: Pick<Mensagem, "rotulo" | "autor">;
  pergunta: string;
  dica: string;
  /** Já na ordem certa. A tela embaralha com a ordem fixa em `mostrar`. */
  fragmentos: { t: string; foraDeOrdem: string }[];
  mostrar: number[];
  explicacao: string;
  estudo: string;
  vai: string;
};

export type CenaRamo = Base & {
  tipo: "ramo";
  regras: { se: Condicao; vai: string }[];
  senao: string;
};

export type CenaFinal = Base & {
  tipo: "final";
  titulo: string;
  paragrafos: string[];
  licao: string;
  bonus: number;
};

export type Cena = CenaNarrativa | CenaDesafio | CenaOrdem | CenaRamo | CenaFinal;

export const INICIO = "abertura";
export const INTEGRIDADE_INICIAL = 100;
export const PERDA_POR_ERRO = 4;
export const INTEGRIDADE_MINIMA = 50;
export const PONTOS_DESAFIO = 100;
export const PERDA_DE_PONTOS = 25;
export const PONTOS_MINIMOS = 25;

export const CAPITULOS = ["O chamado", "A primeira mensagem", "A ala do laboratório", "A ala da estufa", "O núcleo", "A língua do lago", "A última mensagem", "Quem decide é você", "Fim do arquivo"];

const IARA = "Comandante Iara Moura";
const BENTO = "Bento Araújo, técnico de cultivo";

export const CENAS: Cena[] = [
  {
    id: "abertura", tipo: "narrativa", capitulo: 0, cenario: "orbita",
    paragrafos: [
      "Ano de 2148. A Estação Aracati fica na margem de um lago de metano em Titã, a maior lua de Saturno. Faz quarenta anos que ninguém escuta a voz dela.",
      "Na noite passada, chegaram à Terra 212 mensagens da estação, todas danificadas. As máquinas recuperam as letras. O sentido, só gente recupera.",
      "O Consórcio Espacial abriu uma seleção nas escolas públicas, atrás de quem lê com atenção. O seu nome saiu primeiro. Você vai entrar no arquivo à distância, pelos olhos do robô de manutenção da estação.",
    ],
    fala: "Vou no rádio com você. Cada mensagem restaurada abre a próxima. Se errar, eu explico o motivo e você tenta de novo.",
    pose: "aponta",
    escolhas: [{ t: "Abrir o arquivo", vai: "m1" }],
  },
  {
    id: "m1", tipo: "desafio", capitulo: 1, cenario: "corredor", habilidade: "Inferência",
    mensagem: {
      rotulo: "Diário de bordo, dia 3.104", autor: IARA,
      linhas: ["Bento voltou da margem com as botas cobertas de gelo e sem dizer uma palavra. Deixou o gravador em cima da minha mesa e foi dormir sem jantar. Em nove anos de missão, Bento nunca perdeu um jantar."],
    },
    pergunta: "O que a comandante dá a entender com a última frase?",
    dica: "Ela está falando de comida ou de outra coisa?",
    opcoes: [
      { t: "Que algo fora do comum aconteceu com Bento na margem.", certa: true, porque: "Isso. Ao dizer que em nove anos aquilo nunca tinha acontecido, ela mostra que o gesto é estranho, sem precisar escrever “Bento está abalado”." },
      { t: "Que Bento é guloso e a comida da estação é boa.", porque: "O texto não avalia a comida nem chama Bento de guloso. Essa leitura fica na superfície da frase. Pense no motivo de ela contar esse detalhe logo depois do gravador." },
      { t: "Que faltou comida na estação naquela noite.", porque: "Nada no texto fala em falta de comida. Foi Bento quem não jantou. Inferência precisa ter apoio em alguma frase, e essa não tem." },
      { t: "Que a comandante estava com raiva de Bento.", porque: "Não há nenhuma palavra de raiva nem de bronca. O que existe é estranhamento, e estranhar é diferente de brigar." },
    ],
    estudo: "Inferir é somar o que o texto diz com o que ele deixa claro sem dizer. Sempre aponte a frase que sustenta a sua leitura.",
    vai: "escolha-ala",
  },
  {
    id: "escolha-ala", tipo: "narrativa", capitulo: 1, cenario: "corredor",
    paragrafos: [
      "A mensagem fica inteira, e o corredor do arquivo se acende até uma bifurcação. À esquerda, os documentos de Iara, na ala do laboratório. À direita, as gravações de Bento, na ala da estufa.",
      "A energia do arquivo oscila. Você escolhe por onde começar.",
    ],
    fala: "As duas alas contam a mesma noite, cada uma do seu jeito. Por onde vamos?",
    pose: "pensa",
    escolhas: [
      { t: "Ala do laboratório, com os documentos de Iara", vai: "lab1" },
      { t: "Ala da estufa, com as gravações de Bento", vai: "est1" },
    ],
  },

  // Ala do laboratório
  {
    id: "lab1", tipo: "desafio", capitulo: 2, cenario: "laboratorio", habilidade: "Gênero textual",
    mensagem: {
      rotulo: "Documento 88", autor: IARA,
      linhas: [
        "Objetivo: verificar a origem dos pulsos captados no lago que a tripulação apelidou de Açude.",
        "Método: instalamos três sensores na margem e registramos o sinal por 40 dias.",
        "Resultado: os pulsos se repetem em intervalos regulares e não acompanham o vento nem a maré.",
        "Conclusão: a causa natural mais simples foi descartada. Recomenda-se nova coleta.",
      ],
    },
    pergunta: "A que gênero textual esse documento pertence, e qual pista decide isso?",
    dica: "Olhe como o texto se organiza, antes de olhar o assunto.",
    opcoes: [
      { t: "Relatório científico: tem objetivo, método, resultado e conclusão, em linguagem objetiva.", certa: true, porque: "Exato. A organização em seções e o tom impessoal são a marca do relatório. Ele serve para outra pessoa avaliar e repetir a pesquisa." },
      { t: "Notícia: conta um fato novo para o público em geral.", porque: "Notícia costuma ter manchete e responder o que, quem, quando e onde para leitores de fora do assunto. Aqui há seções técnicas, escritas para quem avalia a pesquisa." },
      { t: "Artigo de opinião: defende um ponto de vista da autora.", porque: "Não há tese pessoal nem argumentos para convencer ninguém. A conclusão sai dos dados, e não de uma opinião." },
      { t: "Diário: registro pessoal da rotina da comandante.", porque: "Diário é pessoal e cheio de impressões, como a mensagem sobre Bento que você acabou de ler. Compare as duas: aqui ninguém diz o que sentiu." },
    ],
    estudo: "Para reconhecer um gênero, pergunte quem escreve, para quem, com que objetivo e como o texto se organiza.",
    vai: "lab2",
  },
  {
    id: "lab2", tipo: "desafio", capitulo: 2, cenario: "laboratorio", habilidade: "Coesão",
    mensagem: {
      rotulo: "Documento 91, com palavra apagada", autor: IARA,
      linhas: ["O padrão apareceu sete vezes, sempre com o mesmo intervalo; {lacuna}, não pode ser ruído aleatório."],
      lacuna: "portanto",
    },
    pergunta: "Qual palavra restaura a relação entre as duas partes da frase?",
    dica: "A segunda parte é oposição, causa ou conclusão da primeira?",
    opcoes: [
      { t: "portanto", certa: true, porque: "Sim. A repetição regular é a razão, e “não pode ser ruído” é a conclusão. “Portanto” liga exatamente essas duas ideias." },
      { t: "porém", porque: "“Porém” indica oposição, e aqui não há oposição: a segunda parte concorda com a primeira e tira uma consequência dela." },
      { t: "porque", porque: "“Porque” apresentaria a segunda parte como causa da primeira. Só que não é o “não ser ruído” que causa a repetição. A ordem da relação fica invertida." },
      { t: "embora", porque: "“Embora” indica concessão e pede o verbo no subjuntivo, como em “embora não possa”. Além de mudar o sentido, a frase ficaria quebrada." },
    ],
    estudo: "Conectivo não é enfeite: ele diz qual é a relação entre as ideias. Antes de escolher, nomeie a relação: oposição, causa, conclusão, adição ou tempo.",
    vai: "lab3",
  },
  {
    id: "lab3", tipo: "desafio", capitulo: 2, cenario: "laboratorio", habilidade: "Coesão",
    mensagem: {
      rotulo: "Documento 93", autor: IARA,
      linhas: ["Pedi a Bento que guardasse o gravador porque ele estava com defeito."],
    },
    pergunta: "O restaurador travou nesta frase, com dois sentidos possíveis. Onde está o problema?",
    dica: "Procure uma palavra que aponta para algo já dito.",
    opcoes: [
      { t: "No pronome “ele”, que pode se referir a Bento ou ao gravador.", certa: true, porque: "Isso. Quem estava com defeito, o aparelho ou Bento? Uma reescrita resolve: “Pedi a Bento que guardasse o gravador, que estava com defeito”." },
      { t: "No verbo “guardasse”, que está no tempo errado.", porque: "“Pedi que guardasse” está certo: depois de um pedido no passado, o subjuntivo do pretérito é o esperado. O verbo não causa a dúvida." },
      { t: "Em “porque”, que deveria ser escrito separado.", porque: "“Porque” junto introduz uma causa, e é o caso aqui. A grafia está correta e não muda o sentido da frase." },
      { t: "Na falta de vírgula depois de “Pedi”.", porque: "Uma vírgula aí separaria o verbo do seu complemento, o que a norma-padrão não aceita. E não resolveria a dúvida sobre quem tem defeito." },
    ],
    estudo: "Coesão é fazer cada palavra apontar para o lugar certo. Ao usar ele, ela ou isso, confira se só existe um candidato possível.",
    vai: "lab-fim",
  },
  {
    id: "lab-fim", tipo: "narrativa", capitulo: 2, cenario: "laboratorio", marcas: ["padrao"],
    paragrafos: [
      "As telas do laboratório voltam a funcionar. No último gráfico, Iara escreveu à mão: o padrão não vem do vento. Vem do lago.",
      "Agora você sabe o que ela mediu. Falta saber por que Bento parou de jantar.",
    ],
    fala: "Pista guardada: o sinal é regular e nasce no lago. Ainda dá tempo de abrir outra ala.",
    pose: "lupa",
    escolhas: [
      { t: "Abrir também a ala da estufa", vai: "est1", exige: { naoTem: ["arremedo"] } },
      { t: "Seguir para o núcleo do arquivo", vai: "nuc0" },
    ],
  },

  // Ala da estufa
  {
    id: "est1", tipo: "desafio", capitulo: 3, cenario: "estufa", habilidade: "Variação linguística",
    mensagem: {
      rotulo: "Áudio transcrito, sem revisão", autor: BENTO,
      linhas: ["Oxente, comandante, esse lago é danado! A gente fala perto da margem e, com um tempo, ele arremeda a gente. Falei “bom dia” três vezes na semana passada. Hoje o gravador pegou o mesmo “bom dia” vindo da água, com a minha voz e tudo. Tô doido não, viu?"],
    },
    pergunta: "O restaurador marcou essa fala como “erro de português” e quer apagá-la. Qual é a melhor análise?",
    dica: "Quem fala, com quem, e em que situação?",
    opcoes: [
      { t: "Não é erro: é uma variedade regional e informal, adequada a uma conversa entre colegas, e o sentido está claro.", certa: true, porque: "Isso. Bento fala como se fala numa conversa de trabalho, com marcas da região dele. A mensagem chegou inteira, e apagá-la perderia a prova mais importante até aqui." },
      { t: "É erro, porque só a norma-padrão é português de verdade.", porque: "Todas as variedades do português têm regras próprias e são língua de verdade. A norma-padrão é a esperada em certas situações formais, como o relatório de Iara, mas não é a única legítima." },
      { t: "Pode apagar, porque quem fala assim tem pouco estudo.", porque: "Isso é preconceito linguístico: julgar a pessoa pelo jeito de falar. Bento é técnico da missão. A fala mostra origem e situação, e não capacidade." },
      { t: "É outra língua, sem relação com o português.", porque: "“Oxente”, “tô” e “arremedar” são português. Variação é a mesma língua mudando conforme o lugar, o grupo, a época e a situação." },
    ],
    estudo: "Em prova, troque certo e errado por adequado e inadequado. Julgue a fala pela situação em que ela acontece.",
    vai: "est2",
  },
  {
    id: "est2", tipo: "desafio", capitulo: 3, cenario: "estufa", habilidade: "Sentido pelo contexto",
    mensagem: {
      rotulo: "Mesmo áudio, trecho destacado", autor: BENTO,
      linhas: ["A gente fala perto da margem e, com um tempo, ele arremeda a gente. Falei “bom dia” três vezes na semana passada. Hoje o gravador pegou o mesmo “bom dia” vindo da água."],
    },
    pergunta: "Pelo contexto, o que “arremeda” quer dizer?",
    dica: "O exemplo do “bom dia” explica a palavra.",
    opcoes: [
      { t: "Imita, repete o que a gente diz.", certa: true, porque: "Certo. O próprio Bento dá o exemplo: ele disse “bom dia” e o mesmo “bom dia” voltou da água. A definição está na frase seguinte." },
      { t: "Ataca quem chega perto.", porque: "Ninguém é atacado na fala. O que volta da água é uma frase, e o texto liga “arremeda” a esse retorno." },
      { t: "Fica em silêncio.", porque: "É o contrário: o gravador captou som vindo da água. Se o lago ficasse quieto, não haveria o que Bento contar." },
      { t: "Responde com outras palavras.", porque: "Bento diz “o mesmo bom dia”. Se fossem outras palavras, seria resposta. Como é igual, é repetição." },
    ],
    estudo: "Palavra desconhecida não é motivo para pular. Olhe o que vem antes e depois: o entorno costuma trazer a definição.",
    vai: "est3",
  },
  {
    id: "est3", tipo: "desafio", capitulo: 3, cenario: "estufa", habilidade: "Figura de linguagem",
    mensagem: {
      rotulo: "Versos riscados na parede da estufa", autor: BENTO, verso: true,
      linhas: ["O Açude de Titã", "tem boca sem ter garganta.", "De noite, quando a gente dorme,", "é o metano quem canta."],
    },
    pergunta: "Qual figura de linguagem sustenta esses versos?",
    dica: "O que o lago faz que normalmente só gente faz?",
    opcoes: [
      { t: "Personificação", certa: true, porque: "Isso. Bento dá ao lago uma boca e ao metano a ação de cantar. Coisas sem vida ganham características humanas." },
      { t: "Hipérbole", porque: "Hipérbole é exagero de quantidade ou intensidade, como “chorei um oceano”. Aqui nada é aumentado: o lago ganha um gesto humano." },
      { t: "Eufemismo", porque: "Eufemismo suaviza algo duro de dizer, como “partiu” no lugar de “morreu”. Os versos não escondem nem amaciam nada." },
      { t: "Metonímia", porque: "Metonímia troca um termo por outro com o qual tem relação direta, como “ler Camões” no lugar de “ler a obra de Camões”. Não há troca desse tipo aqui." },
    ],
    estudo: "Para cada figura, guarde uma pergunta: exagera? suaviza? dá vida ao que não tem? troca por algo próximo? diz o contrário? A resposta costuma aparecer rápido.",
    vai: "est-fim",
  },
  {
    id: "est-fim", tipo: "narrativa", capitulo: 3, cenario: "estufa", marcas: ["arremedo"],
    paragrafos: [
      "As luzes da estufa acendem uma a uma. Entre as carnaúbas de teste, você encontra o gravador de Bento, com uma etiqueta: não apagar, ele está aprendendo.",
      "Agora você sabe o que Bento ouviu. Falta saber o que Iara provou.",
    ],
    fala: "Pista guardada: o lago imita a voz da gente. Ainda dá tempo de abrir outra ala.",
    pose: "lupa",
    escolhas: [
      { t: "Abrir também a ala do laboratório", vai: "lab1", exige: { naoTem: ["padrao"] } },
      { t: "Seguir para o núcleo do arquivo", vai: "nuc0" },
    ],
  },

  // Núcleo
  {
    id: "nuc0", tipo: "narrativa", capitulo: 4, cenario: "nucleo",
    paragrafos: [
      "O corredor termina no núcleo: um poço de colunas de memória, com o frio de quarenta anos. Aqui estão as mensagens entre a estação e a Terra, e as anotações que Iara não mandou para ninguém.",
    ],
    fala: "Agora o texto fica mais sutil. Muita coisa aqui não está dita com todas as letras.",
    pose: "pensa",
    escolhas: [{ t: "Ler a correspondência", vai: "nuc1" }],
  },
  {
    id: "nuc1", tipo: "desafio", capitulo: 4, cenario: "nucleo", habilidade: "Figura de linguagem",
    mensagem: {
      rotulo: "Mensagem recebida da Terra", autor: "Diretoria de Missões",
      linhas: ["Prezada comandante, parabéns pela pontualidade. Seu relatório chegou apenas onze meses depois do prazo. Aguardamos ansiosos o próximo, quem sabe ainda neste século."],
    },
    pergunta: "Qual é a atitude da Diretoria nessa mensagem?",
    dica: "Compare o que está escrito com a situação real.",
    opcoes: [
      { t: "Critica o atraso com ironia: diz “pontualidade” querendo dizer o contrário.", certa: true, porque: "Exato. Onze meses de atraso não combinam com “pontualidade”. O choque entre a palavra e a situação é o que denuncia a ironia." },
      { t: "Elogia com sinceridade o trabalho da comandante.", porque: "Quem elogia a pontualidade de quem atrasou onze meses não está sendo sincero. Leia a palavra junto com o fato que vem logo depois." },
      { t: "Pede desculpas por ter cobrado o relatório.", porque: "Não há nenhuma desculpa na mensagem. A Diretoria continua cobrando, tanto que já fala no próximo relatório." },
      { t: "Avisa que não quer mais receber relatórios.", porque: "A frase final diz “aguardamos”. O “quem sabe ainda neste século” é provocação sobre o atraso, e não um cancelamento." },
    ],
    estudo: "Ironia só aparece na comparação entre o que se diz e a situação. Por isso, em prova, nunca leia a frase isolada.",
    vai: "nuc2",
  },
  {
    id: "nuc2", tipo: "desafio", capitulo: 4, cenario: "nucleo", habilidade: "Figura de linguagem",
    mensagem: {
      rotulo: "Anotação pessoal, nunca enviada", autor: IARA,
      linhas: ["Bento me perguntou como é escutar o lago à noite. Respondi com Luís de Camões: “Amor é fogo que arde sem se ver; / É ferida que dói e não se sente”. Ele riu. Depois ficou sério."],
    },
    pergunta: "Em “arde sem se ver” e “dói e não se sente”, que figura junta ideias que parecem impossíveis lado a lado?",
    dica: "Dá para doer e não sentir? E mesmo assim o verso faz sentido.",
    opcoes: [
      { t: "Paradoxo", certa: true, porque: "Isso. Doer e não se sentir se negam, e o verso afirma as duas coisas sobre o mesmo sentimento. “Amor é fogo” também é metáfora, mas a pergunta aponta para esse choque." },
      { t: "Hipérbole", porque: "Hipérbole aumenta alguma coisa. Aqui o efeito não vem do tamanho, e sim de duas ideias que deveriam se excluir." },
      { t: "Eufemismo", porque: "Eufemismo suavizaria algo duro. Camões faz o contrário: deixa a contradição à mostra, sem amaciar nada." },
      { t: "Ironia", porque: "Na ironia, o sentido real é o oposto do que se diz. Aqui o poeta diz o que quer dizer: o amor é mesmo contraditório." },
    ],
    estudo: "Antítese coloca ideias opostas lado a lado. Paradoxo vai além e afirma as duas sobre a mesma coisa. Vale treinar a diferença com poemas de verdade.",
    vai: "nuc3",
  },
  {
    id: "nuc3", tipo: "desafio", capitulo: 4, cenario: "nucleo", habilidade: "Intertextualidade",
    mensagem: {
      rotulo: "Anotação pessoal, nunca enviada", autor: IARA,
      linhas: ["Toda noite abro a escotilha de som e leio em voz alta a primeira frase de Iracema, de José de Alencar: “Verdes mares bravios de minha terra natal, onde canta a jandaia nas frondes da carnaúba”. Aqui o mar é escuro e de metano, e jandaia nenhuma canta. Leio assim mesmo."],
    },
    pergunta: "Por que Iara retoma a frase de Alencar?",
    dica: "Compare os dois mares. O que falta a ela em Titã?",
    opcoes: [
      { t: "Para expressar saudade, contrastando o mar da terra natal com o lago de Titã.", certa: true, porque: "Isso. A frase de 1865 ganha outro peso numa lua distante. Quando um texto conversa com outro para criar sentido novo, chamamos de intertextualidade." },
      { t: "Para informar onde vivem as jandaias.", porque: "Iara não escreve um texto informativo sobre aves. E a última frase, “leio assim mesmo”, mostra que o motivo é pessoal." },
      { t: "Para provar que existem aves em Titã.", porque: "Ela diz o oposto: “jandaia nenhuma canta”. Confira sempre se a alternativa não contradiz o que está escrito." },
      { t: "Para copiar um texto sem dizer de onde veio.", porque: "Ela cita o título e o autor. Plágio é esconder a origem. Aqui a origem é parte do sentido." },
    ],
    estudo: "Ao achar uma citação, pergunte: o que muda quando esta frase antiga entra nesta situação nova? A resposta é quase sempre o ponto da questão.",
    vai: "nuc-fim",
  },
  {
    id: "nuc-fim", tipo: "narrativa", capitulo: 4, cenario: "lago",
    paragrafos: [
      "O arquivo entrega a última gravação feita na margem. São só pulsos. Você reduz a velocidade até a faixa da fala humana.",
      "E o lago diz, com a voz de Iara: verdes mares bravios.",
      "Ela percebeu antes de todo mundo. Nas páginas seguintes, a comandante parou de escrever sobre medições e começou a anotar a gramática.",
    ],
    fala: "O lago não só repetiu. Ele começou a juntar as palavras. Vamos ver como.",
    pose: "lupa",
    escolhas: [{ t: "Abrir as anotações de gramática", vai: "lin1" }],
  },

  // Língua do lago, no espírito dos problemas de linguística
  {
    id: "lin1", tipo: "desafio", capitulo: 5, cenario: "lago", habilidade: "Linguística",
    mensagem: {
      rotulo: "Caderno de Iara, página 1", autor: IARA,
      linhas: ["Transcrevi os pulsos como sílabas. Cada linha mostra o que o lago emite quando um sensor registra aquela cena. Não preciso conhecer a língua: basta comparar."],
    },
    tabela: [["tiru sa", "a água canta"], ["tiru sa ni", "as águas cantam"], ["bel sa", "a pedra canta"], ["tiru mo", "a água dorme"], ["bel mo ni", "as pedras dormem"]],
    pergunta: "Como o lago diria “as pedras cantam”?",
    dica: "Compare as frases que mudam uma parte só. O que entra quando a tradução vai para o plural?",
    opcoes: [
      { t: "bel sa ni", certa: true, porque: "Isso. “bel” é pedra, “sa” é cantar e “ni”, sempre no fim, marca o plural. Compare “tiru sa” com “tiru sa ni” e você vê o “ni” chegando." },
      { t: "bel ni sa", porque: "Em todas as linhas de plural, “ni” vem depois do verbo: “tiru sa ni”, “bel mo ni”. Nenhuma coloca “ni” logo depois do nome." },
      { t: "sa bel ni", porque: "Em todas as linhas, quem faz a ação vem primeiro: “bel sa”, “tiru mo”. A ordem aqui inverteria o padrão." },
      { t: "tiru sa ni", porque: "Essa linha está na tabela e significa “as águas cantam”. Para trocar água por pedra, “tiru” precisa virar “bel”." },
    ],
    estudo: "Em problema de linguística, isole uma parte por vez. Se a tradução muda em um ponto e a frase muda em um ponto, os dois provavelmente combinam.",
    vai: "lin2",
  },
  {
    id: "lin2", tipo: "desafio", capitulo: 5, cenario: "lago", habilidade: "Linguística",
    mensagem: {
      rotulo: "Caderno de Iara, página 2", autor: IARA,
      linhas: ["Novas linhas. Apareceu uma sílaba que nega."],
    },
    tabela: [["bel sa ke", "a pedra não canta"], ["bel sa ni ke", "as pedras não cantam"], ["tiru mo", "a água dorme"]],
    pergunta: "Como o lago diria “as águas não dormem”?",
    dica: "São duas marcas ao mesmo tempo. Qual vem primeiro?",
    opcoes: [
      { t: "tiru mo ni ke", certa: true, porque: "Certo. A linha “bel sa ni ke” mostra a ordem: nome, verbo, plural e, por último, a negação." },
      { t: "tiru mo ke ni", porque: "As duas marcas estão aí, mas fora de ordem. Em “bel sa ni ke”, “ni” vem antes de “ke”." },
      { t: "ke tiru mo ni", porque: "Em português a negação vem antes do verbo, e é fácil levar esse costume para outra língua. Aqui os dados mostram “ke” sempre no fim." },
      { t: "tiru sa ni ke", porque: "A estrutura está certa, mas “sa” é cantar. Essa frase quer dizer “as águas não cantam”." },
    ],
    estudo: "Cuidado com a sua própria língua: a tentação é aplicar a ordem do português. Em linguística, o que vale são os dados da tabela.",
    vai: "lin3",
  },
  {
    id: "lin3", tipo: "desafio", capitulo: 5, cenario: "lago", habilidade: "Linguística",
    mensagem: {
      rotulo: "Caderno de Iara, última página", autor: IARA,
      linhas: ["Há uma frase que o lago repete sem parar, mesmo sem ninguém por perto: tiru mo ke."],
    },
    tabela: [["tiru", "água"], ["mo", "dormir"], ["ni", "plural"], ["ke", "negação"]],
    pergunta: "O que o lago repete há quarenta anos?",
    dica: "Confira quais marcas estão presentes e quais não estão.",
    opcoes: [
      { t: "A água não dorme.", certa: true, porque: "Isso. Tem “ke”, então é negação, e não tem “ni”, então é singular. O lago está dizendo que continua acordado." },
      { t: "As águas não dormem.", porque: "Para ser plural, precisaria de “ni”, como em “tiru mo ni ke”. Essa marca não aparece aqui." },
      { t: "A água dorme.", porque: "Sem “ke”, seria essa a tradução. Como “ke” está lá, a frase é negativa." },
      { t: "A pedra não dorme.", porque: "A negação está certa, mas pedra é “bel”. A frase começa com “tiru”, que é água." },
    ],
    estudo: "Quem resolve bem esse tipo de questão confere a resposta marca por marca antes de responder. Faça o mesmo em qualquer prova.",
    vai: "ultima",
  },
  {
    id: "ultima", tipo: "ordem", capitulo: 6, cenario: "nucleo", habilidade: "Coesão",
    mensagem: { rotulo: "Última mensagem, com as frases embaralhadas", autor: IARA },
    pergunta: "Toque nas frases na ordem em que Iara as escreveu.",
    dica: "As palavras “essa”, “se nos escuta” e “por isso” apontam para o que já foi dito.",
    fragmentos: [
      { t: "Ontem o lago repetiu uma frase que só eu tinha lido em voz alta.", foraDeOrdem: "Esta frase apresenta o fato que todas as outras comentam. Ela precisa abrir o texto." },
      { t: "Essa frase prova que ele nos escuta há anos.", foraDeOrdem: "“Essa frase” retoma algo já dito. Antes dela, o texto precisa apresentar de que frase está falando." },
      { t: "Se nos escuta, também pode aprender tudo o que dissermos depois.", foraDeOrdem: "“Se nos escuta” parte de uma ideia que já precisa estar no texto. Primeiro vem a prova de que ele escuta." },
      { t: "Por isso, desliguei as antenas e coloquei a tripulação em sono profundo, até alguém ler este arquivo com cuidado.", foraDeOrdem: "“Por isso” introduz uma conclusão, e conclusão vem depois das razões. Ela não pode aparecer antes delas." },
    ],
    mostrar: [2, 0, 3, 1],
    explicacao: "Mensagem inteira. Repare no caminho: um fato, a prova, a consequência e a decisão. Cada frase segura a seguinte pela mão.",
    estudo: "Para ordenar um texto, procure as palavras que olham para trás, como essa, isso, por isso e assim. Elas nunca podem vir primeiro.",
    vai: "decisao-ramo",
  },
  {
    id: "decisao-ramo", tipo: "ramo", capitulo: 7, cenario: "nucleo",
    regras: [{ se: { integridadeMenorQue: INTEGRIDADE_MINIMA }, vai: "f-incompleto" }],
    senao: "decisao",
  },
  {
    id: "decisao", tipo: "narrativa", capitulo: 7, cenario: "lago",
    paragrafos: [
      "A tripulação está viva, dormindo nas câmaras da ala norte. E as antenas seguem desligadas há quarenta anos. Então as 212 mensagens, e o sinal que você usa agora, não saem da estação. Saem do lago.",
      "Na última linha, Iara deixou a decisão para quem conseguisse ler até aqui.",
    ],
    fala: "Essa escolha é sua. Não tem resposta certa no gabarito, só consequências.",
    pose: "pensa",
    escolhas: [
      { t: "Entregar todo o arquivo à Terra", vai: "f-aberto" },
      { t: "Lacrar o arquivo, como Iara pediu", vai: "f-silencio" },
      { t: "Ligar uma antena e responder ao lago, na língua dele", vai: "f-conversa", exige: { tem: ["padrao", "arremedo"] } },
    ],
  },

  // Finais
  {
    id: "f-conversa", tipo: "final", capitulo: 8, cenario: "conversa", bonus: 200,
    titulo: "A primeira conversa",
    paragrafos: [
      "Você sabe que o sinal é regular, porque leu Iara. Sabe que o lago aprende, porque ouviu Bento. Só quem abriu as duas alas consegue juntar as duas coisas.",
      "Você liga uma antena e transmite três sílabas: tiru sa ni. As águas cantam.",
      "O silêncio dura onze horas. Depois, o Açude responde com uma frase nova, que ninguém ensinou a ele. Na ala norte, a primeira câmara se abre, e Iara pergunta quem foi que respondeu.",
    ],
    licao: "Você só chegou aqui porque leu fontes diferentes sobre o mesmo fato e juntou o que cada uma sabia.",
  },
  {
    id: "f-aberto", tipo: "final", capitulo: 8, cenario: "aberto", bonus: 100,
    titulo: "Arquivo aberto",
    paragrafos: [
      "Você entrega tudo: o relatório de Iara, os versos de Bento e as páginas de gramática. Em uma semana, o arquivo está em todas as escolas do planeta, e o Consórcio prepara uma missão de resgate.",
      "Gente de todo lugar discute o que dizer ao lago, e muita gente discorda. Enquanto isso, ele continua lá, ouvindo.",
    ],
    licao: "Um texto bem restaurado vira de todo mundo. Agora o trabalho de interpretar também é.",
  },
  {
    id: "f-silencio", tipo: "final", capitulo: 8, cenario: "silencio", bonus: 100,
    titulo: "O silêncio guardado",
    paragrafos: [
      "Você entende o pedido de Iara: tudo o que o lago escuta, ele aprende. O arquivo é lacrado, e a Terra recebe só as coordenadas das câmaras, para um resgate discreto.",
      "O Consórcio não gosta. Você guarda a frase que ninguém mais conhece, e às vezes se pergunta se foi cuidado ou medo.",
    ],
    licao: "Ler com cuidado também é decidir o que fazer com o que se leu, e assumir essa decisão.",
  },
  {
    id: "f-incompleto", tipo: "final", capitulo: 8, cenario: "ruina", bonus: 0,
    titulo: "Leitura interrompida",
    paragrafos: [
      "Foram tantas tentativas erradas que o restaurador perdeu parte das mensagens. O que sobrou chega à Terra com lacunas, e cada jornal completa as lacunas como quer.",
      "Em poucos dias, há dez versões da história da Estação Aracati, e nenhuma delas fala do lago. O Consórcio pede que você tente de novo.",
    ],
    licao: "Um arquivo mal lido vira boato. Releia as explicações e volte: dá para chegar bem mais longe.",
  },
];

export const CENAS_POR_ID: Record<string, Cena> = Object.fromEntries(CENAS.map((c) => [c.id, c]));

/** Confere uma condição contra as marcas e a integridade atuais. */
export function cumpre(c: Condicao | undefined, marcas: readonly string[], integridade: number) {
  if (!c) return true;
  if (c.tem && !c.tem.every((m) => marcas.includes(m))) return false;
  if (c.naoTem && c.naoTem.some((m) => marcas.includes(m))) return false;
  if (c.integridadeMenorQue !== undefined && !(integridade < c.integridadeMenorQue)) return false;
  return true;
}

export const escolhasDe = (c: CenaNarrativa, marcas: readonly string[], integridade: number) => c.escolhas.filter((e) => cumpre(e.exige, marcas, integridade));

export function resolverRamo(c: CenaRamo, marcas: readonly string[], integridade: number) {
  return c.regras.find((r) => cumpre(r.se, marcas, integridade))?.vai ?? c.senao;
}

export const pontosDoDesafio = (erros: number) => Math.max(PONTOS_MINIMOS, PONTOS_DESAFIO - erros * PERDA_DE_PONTOS);

/** Entra em uma cena: resolve ramos e soma as marcas que ela dá. */
export function entrarEm(id: string, marcas: readonly string[], integridade: number) {
  let atual = id;
  let cena = CENAS_POR_ID[atual];
  while (cena.tipo === "ramo") {
    atual = resolverRamo(cena, marcas, integridade);
    cena = CENAS_POR_ID[atual];
  }
  const novas = cena.tipo === "narrativa" && cena.marcas ? cena.marcas.filter((m) => !marcas.includes(m)) : [];
  return { id: atual, marcas: novas.length ? [...marcas, ...novas] : [...marcas] };
}
