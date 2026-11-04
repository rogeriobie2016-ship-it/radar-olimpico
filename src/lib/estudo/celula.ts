// Conteúdo científico do jogo Nave Celular, em nível de ensino médio.
// Sem nada de tela aqui: o texto, as contas e as regras da partida valem para o 3D e para a versão 2D,
// e scripts/testar-celula.ts confere tudo isto a cada build.

export type IdMissao = "membrana" | "nucleo" | "ribossomo" | "reticulo" | "cloroplasto" | "mitocondria" | "cadeia";
export type CorAlvo = "ciano" | "ambar" | "rosa" | "verde" | "violeta" | "azul" | "vermelho" | "branco";
export type FormaAlvo = "portal" | "orbe";

export type Alvo = { id: string; rotulo: string; forma: FormaAlvo; cor: CorAlvo };
export type Passo = { pedido: string; certos: string[]; confusoes?: string[]; erro?: string; aoCompletar: string };
export type Desafio = { id: string; estilo: "OBB" | "ONC"; enunciado: string; opcoes: string[]; certa: number; explicacao: string };
export type Missao = {
  id: IdMissao;
  organela: string;
  titulo: string;
  convite: string; // fala durante a viagem
  abertura: string;
  alvos: Alvo[];
  passos: Passo[];
  fechamento: string;
  desafios: Desafio[];
  quantosDesafios: number;
};

// Física e química da cadeia respiratória. Potenciais padrão em pH 7, em volts.
export const FARADAY = 96500; // C/mol
export const POTENCIAL = { nadh: -0.32, ubiquinona: 0.05, citocromoC: 0.25, oxigenio: 0.82 };
export const ELETRONS_POR_NADH = 2;
export const ENERGIA_ATP = 30.5; // kJ/mol
export const ATP_POR_NADH = 2.5;
export const PH_MATRIZ = 7.8;
export const PH_INTERMEMBRANAS = 7.0;

export const deltaE = () => POTENCIAL.oxigenio - POTENCIAL.nadh;
/** Energia livre, em kJ/mol: ΔG = −n·F·ΔE. */
export const deltaG = () => (-ELETRONS_POR_NADH * FARADAY * deltaE()) / 1000;
export const rendimentoRespiracao = () => (ATP_POR_NADH * ENERGIA_ATP) / Math.abs(deltaG());
export const razaoProtons = () => 10 ** (PH_MATRIZ - PH_INTERMEMBRANAS);
/** A energia de um fóton é inversamente proporcional ao comprimento de onda. */
export const razaoFotons = (lambdaMenor: number, lambdaMaior: number) => lambdaMaior / lambdaMenor;

// Genética: só o trecho do código genético que os desafios usam.
export const CODIGO: Record<string, string> = {
  AUG: "Metionina", UUU: "Fenilalanina", GGC: "Glicina", GAA: "Ácido glutâmico", GAG: "Ácido glutâmico", CCU: "Prolina", AAG: "Lisina",
};
const PAR_RNA: Record<string, string> = { A: "U", T: "A", U: "A", C: "G", G: "C" };
/** RNAm transcrito de um molde de DNA lido de 3' para 5'. */
export const transcrever = (molde: string) => [...molde].map((b) => (b === " " ? " " : PAR_RNA[b])).join("");
/** Anticódon do RNAt que pareia com um códon do RNAm. */
export const anticodon = (codon: string) => [...codon].map((b) => PAR_RNA[b]).join("");
export const nucleotideosDaProteina = (aminoacidos: number) => aminoacidos * 3 + 3;

export const EQUACAO_RESPIRACAO: { reagentes: { c: number; f: Record<string, number> }[]; produtos: { c: number; f: Record<string, number> }[]; texto: string } = {
  reagentes: [{ c: 1, f: { C: 6, H: 12, O: 6 } }, { c: 6, f: { O: 2 } }],
  produtos: [{ c: 6, f: { C: 1, O: 2 } }, { c: 6, f: { H: 2, O: 1 } }],
  texto: "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O",
};

export const MISSOES: Missao[] = [
  {
    id: "membrana",
    organela: "Membrana plasmática",
    titulo: "Os portões da membrana",
    convite: "Vamos até a membrana.",
    abertura: "Esta é uma célula vegetal, vista de dentro. Estamos colados na membrana plasmática, uma bicamada de fosfolipídios. Logo atrás dela fica a parede celular. Cada molécula atravessa por um caminho, e você vai escolher qual.",
    alvos: [
      { id: "bicamada", rotulo: "Entre os lipídios", forma: "portal", cor: "violeta" },
      { id: "aquaporina", rotulo: "Aquaporina", forma: "portal", cor: "ciano" },
      { id: "bomba", rotulo: "Bomba de prótons", forma: "portal", cor: "ambar" },
    ],
    passos: [
      { pedido: "O₂ é pequeno e apolar. Por onde ele passa?", certos: ["bicamada"], confusoes: ["aquaporina", "bomba"], erro: "O₂ não precisa de canal nem de energia. Procure o caminho mais simples.", aoCompletar: "Difusão simples: o O₂ atravessa entre os fosfolipídios, a favor do gradiente." },
      { pedido: "Muita água precisa entrar depressa. Qual caminho?", certos: ["aquaporina"], confusoes: ["bicamada", "bomba"], erro: "A água até passa devagar pela bicamada, mas há um canal só para ela.", aoCompletar: "Osmose pela aquaporina, um canal específico para água. Não gasta ATP." },
      { pedido: "H⁺ precisa sair, contra o gradiente. Qual caminho?", certos: ["bomba"], confusoes: ["bicamada", "aquaporina"], erro: "Ir contra o gradiente exige gasto de energia.", aoCompletar: "Transporte ativo: a bomba usa ATP para empurrar H⁺ para fora da célula." },
    ],
    fechamento: "Portões entendidos. Agora vire a nave: o núcleo espera lá no meio da célula.",
    quantosDesafios: 1,
    desafios: [
      {
        id: "membrana-plasmolise", estilo: "OBB",
        enunciado: "Uma célula de folha foi colocada em solução muito concentrada de sal. Depois de alguns minutos, o que se observa ao microscópio?",
        opcoes: ["A membrana se afasta da parede, porque a célula perde água por osmose", "A célula estoura, porque entra água demais", "A parede celular se dissolve no sal", "Nada muda, porque a parede impede a saída de água"],
        certa: 0,
        explicacao: "A água vai do meio menos concentrado para o mais concentrado. O vacúolo encolhe e a membrana descola da parede: é a plasmólise. A parede é permeável, e por isso não impede a saída.",
      },
      {
        id: "membrana-bicamada", estilo: "OBB",
        enunciado: "A bicamada deixa passar O₂ e CO₂ com facilidade, mas quase não deixa passar K⁺. Qual é a melhor explicação?",
        opcoes: ["O miolo da bicamada é hidrofóbico e barra partículas com carga", "O K⁺ é muito maior que o O₂ e por isso não cabe", "A membrana só deixa passar gases", "O K⁺ reage com os fosfolipídios e fica preso"],
        certa: 0,
        explicacao: "As caudas dos fosfolipídios são apolares. Moléculas pequenas e apolares atravessam, enquanto íons dependem de canais e transportadores. Tamanho não é o motivo: o K⁺ é um íon pequeno.",
      },
      {
        id: "membrana-transporte", estilo: "ONC",
        enunciado: "Uma proteína da membrana usa ATP para levar H⁺ de onde há menos para onde há mais H⁺. Como esse processo se classifica?",
        opcoes: ["Transporte ativo", "Difusão simples", "Difusão facilitada", "Osmose"],
        certa: 0,
        explicacao: "Mover uma substância contra o gradiente aumenta a energia do sistema, então precisa de uma fonte de energia, aqui o ATP. Difusão e osmose acontecem a favor do gradiente.",
      },
    ],
  },
  {
    id: "nucleo",
    organela: "Núcleo",
    titulo: "A mensagem do DNA",
    convite: "Siga até o núcleo, a maior organela à vista.",
    abertura: "Aqui dentro está o DNA. Uma enzima, a RNA polimerase, lê o molde e monta o RNA mensageiro. Sua missão é conferir a cópia e escoltar a mensagem para fora, pelos poros do envelope nuclear.",
    alvos: [
      { id: "rna-certo", rotulo: "AUG", forma: "orbe", cor: "rosa" },
      { id: "rna-t", rotulo: "ATG", forma: "orbe", cor: "violeta" },
      { id: "rna-igual", rotulo: "UAC", forma: "orbe", cor: "azul" },
      { id: "poro-1", rotulo: "Poro nuclear", forma: "portal", cor: "ciano" },
      { id: "poro-2", rotulo: "Poro nuclear", forma: "portal", cor: "ciano" },
    ],
    passos: [
      { pedido: "O molde de DNA diz TAC. Qual é o RNAm certo?", certos: ["rna-certo"], confusoes: ["rna-t", "rna-igual"], erro: "Pareamento no RNA: T com A, A com U, C com G. E o RNA não usa timina.", aoCompletar: "Isso: TAC vira AUG. No RNA, a uracila entra no lugar da timina." },
      { pedido: "Escolte o RNAm pelos dois poros acesos.", certos: ["poro-1", "poro-2"], aoCompletar: "Mensagem fora do núcleo. O DNA fica guardado, e só as cópias viajam." },
    ],
    fechamento: "O RNAm está no citoplasma. Agora ele precisa de quem saiba ler: os ribossomos.",
    quantosDesafios: 1,
    desafios: [
      {
        id: "nucleo-transcricao", estilo: "OBB",
        enunciado: "Um trecho do molde de DNA, lido de 3' para 5', é TAC GGA TTC. Qual é o RNAm produzido?",
        opcoes: ["AUG CCU AAG", "ATG CCT AAG", "UAC GGA UUC", "AUC CCU AAG"],
        certa: 0,
        explicacao: "Cada base do molde pareia com a complementar: T com A, A com U, C com G e G com C. A opção com T é DNA, não RNA.",
      },
      {
        id: "nucleo-chargaff", estilo: "ONC",
        enunciado: "Uma molécula de DNA de fita dupla tem 30% de adenina. Qual é a porcentagem de citosina?",
        opcoes: ["20%", "30%", "40%", "70%"],
        certa: 0,
        explicacao: "A pareia com T e C pareia com G. Se A = 30%, T = 30%, e sobram 40% para C e G, que ficam com 20% cada. É a regra de Chargaff.",
      },
      {
        id: "nucleo-nucleolo", estilo: "OBB",
        enunciado: "O nucléolo aparece bem desenvolvido em células que fabricam muita proteína. Por quê?",
        opcoes: ["Ele produz RNA ribossômico e monta as subunidades dos ribossomos", "Ele guarda os aminoácidos usados na tradução", "Ele fabrica as proteínas no lugar dos ribossomos", "Ele copia o DNA antes de cada proteína ser feita"],
        certa: 0,
        explicacao: "No nucléolo o RNA ribossômico é produzido e reunido a proteínas. As subunidades saem pelos poros e terminam de se montar no citoplasma. Quem faz proteína é o ribossomo.",
      },
    ],
  },
  {
    id: "ribossomo",
    organela: "Ribossomos",
    titulo: "Traduzir é parear",
    convite: "Desça até o colar de ribossomos sobre o RNAm.",
    abertura: "Vários ribossomos leem o mesmo RNAm ao mesmo tempo. Cada trinca do RNAm é um códon. O RNA transportador traz o aminoácido e tem o anticódon, que pareia com o códon. Ache o RNAt certo para cada um.",
    alvos: [
      { id: "trna-uac", rotulo: "RNAt UAC", forma: "orbe", cor: "ambar" },
      { id: "trna-aaa", rotulo: "RNAt AAA", forma: "orbe", cor: "verde" },
      { id: "trna-ccg", rotulo: "RNAt CCG", forma: "orbe", cor: "rosa" },
      { id: "trna-ggc", rotulo: "RNAt GGC", forma: "orbe", cor: "azul" },
    ],
    passos: [
      { pedido: "Códon AUG no ribossomo. Qual RNAt encaixa?", certos: ["trna-uac"], confusoes: ["trna-aaa", "trna-ccg", "trna-ggc"], erro: "O anticódon é o complemento do códon: A com U, G com C.", aoCompletar: "UAC pareia com AUG e traz metionina. É assim que quase toda proteína começa." },
      { pedido: "Próximo códon: UUU. Qual RNAt encaixa?", certos: ["trna-aaa"], confusoes: ["trna-uac", "trna-ccg", "trna-ggc"], erro: "U pareia com A.", aoCompletar: "AAA pareia com UUU e traz fenilalanina." },
      { pedido: "Agora o códon GGC. Qual RNAt encaixa?", certos: ["trna-ccg"], confusoes: ["trna-uac", "trna-aaa", "trna-ggc"], erro: "G pareia com C e C pareia com G.", aoCompletar: "CCG pareia com GGC e traz glicina. Três aminoácidos ligados: a cadeia está crescendo." },
    ],
    fechamento: "A proteína vai crescendo. Se ela for destinada à exportação, segue para o retículo.",
    quantosDesafios: 1,
    desafios: [
      {
        id: "ribossomo-conta", estilo: "ONC",
        enunciado: "Uma proteína tem 150 aminoácidos. Quantos nucleotídeos, no mínimo, tem a região do RNAm que a codifica, contando o códon de parada?",
        opcoes: ["453", "450", "153", "150"],
        certa: 0,
        explicacao: "Cada aminoácido usa um códon de 3 nucleotídeos: 150 × 3 = 450. O códon de parada não traz aminoácido, mas soma mais 3, e o total é 453.",
      },
      {
        id: "ribossomo-degenerado", estilo: "OBB",
        enunciado: "Uma mutação troca o códon GAA por GAG no RNAm. Os dois codificam ácido glutâmico. O que acontece com a proteína?",
        opcoes: ["Não muda, porque o código genético é degenerado", "Ganha um aminoácido a mais", "Para de ser produzida nesse ponto", "Troca o aminoácido e perde a função"],
        certa: 0,
        explicacao: "Mais de um códon pode indicar o mesmo aminoácido. Essa é a degeneração do código, e por isso essa mutação é chamada de silenciosa.",
      },
      {
        id: "ribossomo-antibiotico", estilo: "OBB",
        enunciado: "Muitos antibióticos travam os ribossomos das bactérias sem travar os ribossomos do citoplasma humano. O que torna isso possível?",
        opcoes: ["Os ribossomos de bactérias (70S) são diferentes dos nossos (80S)", "As bactérias não têm ribossomos", "Os ribossomos humanos ficam só dentro do núcleo", "As bactérias usam outro código genético"],
        certa: 0,
        explicacao: "Os ribossomos bacterianos têm subunidades menores e outra composição. O antibiótico se liga onde eles diferem dos nossos, e o código genético é praticamente o mesmo nos dois.",
      },
    ],
  },
  {
    id: "reticulo",
    organela: "Retículo endoplasmático",
    titulo: "A rota de exportação",
    convite: "Voe até as dobras azuis do retículo, ao lado do núcleo.",
    abertura: "O retículo rugoso tem ribossomos colados na superfície e recebe as proteínas à medida que elas nascem. Daqui em diante, elas viajam dentro de bolsas. Siga a rota, portal por portal.",
    alvos: [
      { id: "re-entrada", rotulo: "Retículo rugoso", forma: "portal", cor: "azul" },
      { id: "re-canal", rotulo: "Saída do retículo", forma: "portal", cor: "azul" },
      { id: "re-vesicula", rotulo: "Vesícula", forma: "portal", cor: "violeta" },
      { id: "re-golgi", rotulo: "Complexo de Golgi", forma: "portal", cor: "rosa" },
    ],
    passos: [
      { pedido: "Entre no retículo rugoso.", certos: ["re-entrada"], aoCompletar: "A proteína entra no retículo enquanto é fabricada e começa a se dobrar." },
      { pedido: "Siga até a saída do retículo.", certos: ["re-canal"], aoCompletar: "Proteína bem dobrada segue viagem. A mal dobrada fica retida ali." },
      { pedido: "Embarque na vesícula de transporte.", certos: ["re-vesicula"], aoCompletar: "Vesículas brotam do retículo levando a carga pelo citoplasma." },
      { pedido: "Entregue no Complexo de Golgi.", certos: ["re-golgi"], aoCompletar: "O Golgi modifica, separa e endereça cada proteína ao seu destino." },
    ],
    fechamento: "Entrega feita. E de onde vem a energia que paga tudo isso? Do Sol. Vamos ao cloroplasto.",
    quantosDesafios: 1,
    desafios: [
      {
        id: "reticulo-trajeto", estilo: "OBB",
        enunciado: "Células receberam aminoácidos radioativos para acompanhar a produção de uma enzima de secreção. Em que ordem a radioatividade aparece?",
        opcoes: ["Ribossomos do retículo rugoso, retículo, Golgi, vesículas, membrana", "Golgi, retículo, ribossomos, vesículas, membrana", "Núcleo, Golgi, ribossomos, membrana, retículo", "Membrana, vesículas, Golgi, retículo, ribossomos"],
        certa: 0,
        explicacao: "Esse é o desenho clássico de experimento de pulso e caça: o aminoácido marcado entra na proteína no ribossomo e segue a via de secreção até sair pela membrana.",
      },
      {
        id: "reticulo-liso", estilo: "OBB",
        enunciado: "O retículo liso fica muito desenvolvido em células do fígado de quem usa certos medicamentos por muito tempo. Qual função explica isso?",
        opcoes: ["Desintoxicação, com enzimas que modificam essas substâncias", "Fabricação de RNA mensageiro", "Fotossíntese em células sem cloroplasto", "Montagem dos ribossomos"],
        certa: 0,
        explicacao: "O retículo liso produz lipídios e abriga enzimas que tornam várias substâncias mais fáceis de eliminar. Com uso prolongado, a célula amplia esse retículo.",
      },
      {
        id: "reticulo-diferenca", estilo: "ONC",
        enunciado: "O que melhor diferencia o retículo rugoso do liso?",
        opcoes: ["O rugoso tem ribossomos e atua na síntese de proteínas; o liso não tem e atua com lipídios", "O rugoso fica no núcleo e o liso fica fora da célula", "O liso tem ribossomos e o rugoso tem DNA próprio", "Só o rugoso tem membrana"],
        certa: 0,
        explicacao: "O aspecto rugoso vem dos ribossomos aderidos à superfície. Os dois são sistemas de membranas, ligados entre si.",
      },
    ],
  },
  {
    id: "cloroplasto",
    organela: "Cloroplasto",
    titulo: "Pescar luz",
    convite: "Suba até o cloroplasto, a organela verde com pilhas de discos.",
    abertura: "Os discos empilhados são os tilacoides. Na membrana deles está a clorofila, que captura energia da luz. Mas ela não aproveita todas as cores igualmente. Pesque só as cores certas.",
    alvos: [
      { id: "luz-azul-1", rotulo: "Azul 450 nm", forma: "orbe", cor: "azul" },
      { id: "luz-azul-2", rotulo: "Azul 450 nm", forma: "orbe", cor: "azul" },
      { id: "luz-verm-1", rotulo: "Vermelho 680 nm", forma: "orbe", cor: "vermelho" },
      { id: "luz-verm-2", rotulo: "Vermelho 680 nm", forma: "orbe", cor: "vermelho" },
      { id: "luz-verde-1", rotulo: "Verde 550 nm", forma: "orbe", cor: "verde" },
      { id: "tilacoide", rotulo: "Tilacoide", forma: "portal", cor: "verde" },
    ],
    passos: [
      { pedido: "Colete as duas cores que a clorofila mais absorve.", certos: ["luz-azul-1", "luz-azul-2", "luz-verm-1", "luz-verm-2"], confusoes: ["luz-verde-1"], erro: "A clorofila absorve pouco o verde, que é em boa parte refletido. Por isso as folhas parecem verdes.", aoCompletar: "Azul e vermelho: os picos de absorção da clorofila." },
      { pedido: "Leve a energia para o tilacoide.", certos: ["tilacoide"], aoCompletar: "A luz excita elétrons e a água é quebrada, liberando O₂. O ATP e o NADPH formados alimentam o ciclo de Calvin, no estroma." },
    ],
    fechamento: "Açúcar feito com luz. Hora de ver como a célula queima esse açúcar: siga para a mitocôndria.",
    quantosDesafios: 1,
    desafios: [
      {
        id: "cloroplasto-engelmann", estilo: "OBB",
        enunciado: "Em 1882, Engelmann iluminou uma alga filamentosa com a luz separada por um prisma. Bactérias que buscam O₂ se juntaram nas faixas azul e vermelha. O que ele concluiu?",
        opcoes: ["Nessas cores a alga faz mais fotossíntese e libera mais O₂", "As bactérias preferem essas cores por causa do calor", "A alga consome O₂ nessas cores", "A luz verde mata as bactérias"],
        certa: 0,
        explicacao: "As bactérias funcionaram como detectores de O₂. Onde havia mais gás, havia mais fotossíntese, e isso desenhou o espectro de ação da clorofila.",
      },
      {
        id: "cloroplasto-isotopo", estilo: "OBB",
        enunciado: "Plantas receberam água com oxigênio marcado (H₂¹⁸O) e CO₂ comum. O O₂ liberado saiu marcado com ¹⁸O. O que isso mostra?",
        opcoes: ["O O₂ da fotossíntese vem da água", "O O₂ da fotossíntese vem do CO₂", "A planta não usa água na fotossíntese", "O ¹⁸O vira carbono dentro da folha"],
        certa: 0,
        explicacao: "A fotólise da água, nos tilacoides, libera O₂. O carbono e o oxigênio do CO₂ acabam nos açúcares e na água formada, não no gás liberado.",
      },
      {
        id: "cloroplasto-foton", estilo: "ONC",
        enunciado: "A energia de um fóton é E = h·c/λ. Comparando um fóton azul de 450 nm com um vermelho de 680 nm, o azul tem:",
        opcoes: ["Cerca de 1,5 vez mais energia", "Cerca de 1,5 vez menos energia", "A mesma energia, porque ambos viajam à velocidade da luz", "Cerca de 230 vezes mais energia"],
        certa: 0,
        explicacao: "E é inversamente proporcional a λ. A razão é 680 ÷ 450, cerca de 1,5. A velocidade é a mesma, mas a frequência do azul é maior.",
      },
    ],
  },
  {
    id: "mitocondria",
    organela: "Mitocôndria",
    titulo: "Combustível na porta",
    convite: "Procure a mitocôndria, a organela alaranjada com dobras por dentro.",
    abertura: "A glicose é quebrada ainda no citosol, na glicólise, e cada molécula vira dois piruvatos. São eles que entram na mitocôndria. Encontre o combustível certo e leve para a matriz.",
    alvos: [
      { id: "piruvato-1", rotulo: "Piruvato", forma: "orbe", cor: "ambar" },
      { id: "piruvato-2", rotulo: "Piruvato", forma: "orbe", cor: "ambar" },
      { id: "glicose", rotulo: "Glicose", forma: "orbe", cor: "branco" },
      { id: "matriz", rotulo: "Entrada da matriz", forma: "portal", cor: "ambar" },
    ],
    passos: [
      { pedido: "Colete o que realmente entra na mitocôndria.", certos: ["piruvato-1", "piruvato-2"], confusoes: ["glicose"], erro: "A glicose inteira fica no citosol. Primeiro ela vira dois piruvatos, na glicólise.", aoCompletar: "Dois piruvatos na nave. A glicólise já rendeu 2 ATP e 2 NADH no citosol." },
      { pedido: "Leve os piruvatos à matriz.", certos: ["matriz"], aoCompletar: "Na matriz, o ciclo de Krebs solta CO₂ e carrega NADH e FADH₂ com elétrons de alta energia." },
    ],
    fechamento: "Os NADH estão carregados. Falta a parte mais bonita: vamos entrar numa crista da mitocôndria.",
    quantosDesafios: 1,
    desafios: [
      {
        id: "mitocondria-cianeto", estilo: "OBB",
        enunciado: "O cianeto se liga ao complexo IV da cadeia respiratória. O que acontece logo depois na célula?",
        opcoes: ["Os elétrons não chegam ao O₂ e a produção de ATP na mitocôndria desaba", "A célula passa a produzir mais ATP", "O O₂ deixa de entrar na célula", "A glicólise para de acontecer no citosol"],
        certa: 0,
        explicacao: "Sem o último passo, a cadeia inteira congestiona, os prótons param de ser bombeados e a ATP sintase perde sua fonte. O O₂ continua chegando, mas não é usado.",
      },
      {
        id: "mitocondria-fermentacao", estilo: "OBB",
        enunciado: "Em exercício intenso, um músculo produz lactato quando falta O₂. Para que serve a fermentação?",
        opcoes: ["Regenerar NAD⁺ para a glicólise continuar", "Produzir muito mais ATP que a respiração", "Transformar lactato em O₂", "Levar elétrons até a cadeia respiratória"],
        certa: 0,
        explicacao: "A glicólise consome NAD⁺. Reduzindo piruvato a lactato, a célula devolve o NAD⁺ e continua fazendo seus 2 ATP por glicose, mesmo sem O₂.",
      },
      {
        id: "mitocondria-endossimbiose", estilo: "ONC",
        enunciado: "Qual conjunto de fatos reforça que mitocôndrias vieram de bactérias englobadas por outra célula?",
        opcoes: ["DNA circular próprio, ribossomos parecidos com os bacterianos e dupla membrana", "Presença de parede celular e de clorofila", "Núcleo próprio com poros e nucléolo", "Fabricação de proteínas sem nenhum RNA"],
        certa: 0,
        explicacao: "É a teoria endossimbiótica. As mitocôndrias também se dividem de forma parecida com a divisão das bactérias, e o mesmo raciocínio vale para os cloroplastos.",
      },
    ],
  },
  {
    id: "cadeia",
    organela: "Crista da mitocôndria",
    titulo: "O trajeto da energia",
    convite: "Entre na mitocôndria pelo portal aceso.",
    abertura: "Sua nave agora leva um par de elétrons do NADH. Eles descem uma escada de energia, sempre para quem tem maior potencial de redução, até o O₂. A energia liberada bombeia prótons, e os prótons fazem a ATP sintase girar. Faça os elétrons percorrerem o caminho.",
    alvos: [
      { id: "complexo-1", rotulo: "Complexo I", forma: "portal", cor: "ciano" },
      { id: "ubiquinona", rotulo: "Ubiquinona +0,05 V", forma: "orbe", cor: "ambar" },
      { id: "complexo-3", rotulo: "Complexo III", forma: "portal", cor: "violeta" },
      { id: "citocromo", rotulo: "Citocromo c +0,25 V", forma: "orbe", cor: "vermelho" },
      { id: "complexo-4", rotulo: "Complexo IV", forma: "portal", cor: "rosa" },
      { id: "oxigenio", rotulo: "O₂ +0,82 V", forma: "orbe", cor: "branco" },
      { id: "atp-sintase", rotulo: "ATP sintase", forma: "portal", cor: "verde" },
    ],
    passos: [
      { pedido: "NADH (−0,32 V) entrega os elétrons. Quem recebe primeiro?", certos: ["complexo-1"], confusoes: ["ubiquinona", "complexo-3", "citocromo", "complexo-4", "oxigenio", "atp-sintase"], erro: "O NADH entrega seus elétrons no primeiro complexo da cadeia.", aoCompletar: "O complexo I recebe os elétrons e bombeia prótons para o espaço intermembranas." },
      { pedido: "Qual carreador tem o menor potencial acima do NADH?", certos: ["ubiquinona"], confusoes: ["complexo-3", "citocromo", "complexo-4", "oxigenio", "atp-sintase"], erro: "Procure o menor salto: o elétron desce a escada um degrau de cada vez.", aoCompletar: "A ubiquinona, solta na membrana, leva os elétrons adiante." },
      { pedido: "A ubiquinona entrega ao próximo complexo. Qual?", certos: ["complexo-3"], confusoes: ["citocromo", "complexo-4", "oxigenio", "atp-sintase"], erro: "Depois do I e da ubiquinona vem o complexo III.", aoCompletar: "O complexo III bombeia mais prótons." },
      { pedido: "Agora o carreador seguinte da escada de potenciais.", certos: ["citocromo"], confusoes: ["complexo-4", "oxigenio", "atp-sintase"], erro: "Compare os potenciais: o próximo degrau é +0,25 V.", aoCompletar: "O citocromo c leva um elétron de cada vez até o último complexo." },
      { pedido: "Qual é o último complexo antes do oxigênio?", certos: ["complexo-4"], confusoes: ["oxigenio", "atp-sintase"], erro: "Falta passar pelo complexo IV.", aoCompletar: "O complexo IV bombeia prótons e prepara a entrega final." },
      { pedido: "Entregue os elétrons ao aceptor final.", certos: ["oxigenio"], confusoes: ["atp-sintase"], erro: "O aceptor final tem o maior potencial de todos.", aoCompletar: "O₂ recebe elétrons e H⁺ e vira água. A escada terminou em +0,82 V." },
      { pedido: "Os prótons voltam pela turbina. Voe até ela.", certos: ["atp-sintase"], erro: "Procure o cogumelo dourado que gira: a ATP sintase.", aoCompletar: "Os prótons voltam a favor do gradiente, o rotor gira e a energia mecânica vira ligação química: ATP." },
    ],
    fechamento: "Energia de um elétron virou rotação, e a rotação virou ATP. Sobraram só as contas.",
    quantosDesafios: 4,
    desafios: [
      {
        id: "cadeia-potencial", estilo: "ONC",
        enunciado: "Dados: E°' (NAD⁺/NADH) = −0,32 V e E°' (O₂/H₂O) = +0,82 V. Qual é a diferença de potencial entre o início e o fim da cadeia?",
        opcoes: ["1,14 V", "0,50 V", "0,82 V", "−1,14 V"],
        certa: 0,
        explicacao: "ΔE = E°' final − E°' inicial = 0,82 − (−0,32) = 1,14 V. Os elétrons vão espontaneamente para o maior potencial.",
      },
      {
        id: "cadeia-energia", estilo: "ONC",
        enunciado: "Use ΔG = −n·F·ΔE, com n = 2, F = 96 500 C/mol e ΔE = 1,14 V. Qual é a energia liberada por NADH?",
        opcoes: ["−220 kJ/mol", "−110 kJ/mol", "+220 kJ/mol", "−2 200 kJ/mol"],
        certa: 0,
        explicacao: "ΔG = −2 × 96 500 × 1,14 ≈ −220 000 J/mol = −220 kJ/mol. O sinal negativo indica processo espontâneo, que libera energia.",
      },
      {
        id: "cadeia-rendimento", estilo: "ONC",
        enunciado: "Cada NADH rende cerca de 2,5 ATP, e cada ATP guarda 30,5 kJ/mol. Dos 220 kJ/mol liberados, que fração fica guardada em ATP?",
        opcoes: ["Cerca de 35%", "Cerca de 14%", "Cerca de 65%", "100%"],
        certa: 0,
        explicacao: "2,5 × 30,5 ≈ 76 kJ/mol, e 76 ÷ 220 ≈ 0,35. O restante vira calor, que ajuda a manter a temperatura do corpo nos animais.",
      },
      {
        id: "cadeia-ph", estilo: "ONC",
        enunciado: "Em uma mitocôndria, a matriz está em pH 7,8 e o espaço intermembranas em pH 7,0. Quantas vezes a concentração de H⁺ é maior no espaço intermembranas?",
        opcoes: ["Cerca de 6 vezes", "Cerca de 0,8 vez", "Cerca de 2 vezes", "Cerca de 80 vezes"],
        certa: 0,
        explicacao: "pH é logarítmico: a diferença de 0,8 unidade dá uma razão de 10 elevado a 0,8, cerca de 6,3. Esse gradiente, somado à diferença de carga, é o que move a ATP sintase.",
      },
    ],
  },
];

/** O que aparece quando a nave passa perto de algo que não é missão. */
export const CURIOSIDADES: { id: string; nome: string; texto: string }[] = [
  { id: "vacuolo", nome: "Vacúolo", texto: "Vacúolo: guarda água, íons e pigmentos. Cheio, ele empurra a membrana contra a parede e deixa a planta firme." },
  { id: "golgi", nome: "Complexo de Golgi", texto: "Complexo de Golgi: bolsas achatadas que modificam proteínas e despacham tudo em vesículas." },
  { id: "microtubulo", nome: "Citoesqueleto", texto: "Citoesqueleto: microtúbulos são trilhos por onde proteínas motoras carregam vesículas." },
];

export const AVISO_ESCALA = "Tudo fora de escala, para caber no passeio.";

// Regras da partida. Funções puras: quem desenha só chama estas funções e mostra o resultado.
export const PONTOS = { alvo: 20, erroAlvo: 5, desafio: 100, desafioSegunda: 50, missao: 50 };

export type Etapa = "viagem" | "abertura" | "alvos" | "desafio" | "fim";
export type Partida = {
  m: number;
  etapa: Etapa;
  passo: number;
  feitos: string[]; // alvos já tocados
  desafios: Desafio[][]; // sorteados, um conjunto por missão
  d: number;
  tentativas: number;
  respondido: boolean;
  pontos: number;
  acertos: number;
  errosAlvo: number;
};

const sortear = <T,>(lista: T[], n: number, acaso: () => number): T[] => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(acaso() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n);
};

/** Embaralha as opções sem perder qual é a certa. */
const embaralharOpcoes = (d: Desafio, acaso: () => number): Desafio => {
  const ordem = sortear(d.opcoes.map((_, i) => i), d.opcoes.length, acaso);
  return { ...d, opcoes: ordem.map((i) => d.opcoes[i]), certa: ordem.indexOf(d.certa) };
};

export const novaPartida = (acaso: () => number = Math.random): Partida => ({
  m: 0,
  etapa: "abertura",
  passo: 0,
  feitos: [],
  desafios: MISSOES.map((x) => sortear(x.desafios, x.quantosDesafios, acaso).map((d) => embaralharOpcoes(d, acaso))),
  d: 0,
  tentativas: 0,
  respondido: false,
  pontos: 0,
  acertos: 0,
  errosAlvo: 0,
});

export const missaoAtual = (p: Partida) => MISSOES[Math.min(p.m, MISSOES.length - 1)];
export const passoAtual = (p: Partida) => missaoAtual(p).passos[p.passo];
export const desafioAtual = (p: Partida) => p.desafios[p.m]?.[p.d];

/** Alvos que estão no mundo agora: os certos que faltam e os que confundem. */
export function alvosAtivos(p: Partida): Alvo[] {
  if (p.etapa !== "alvos") return [];
  const passo = passoAtual(p);
  return missaoAtual(p).alvos.filter((a) => (passo.certos.includes(a.id) && !p.feitos.includes(a.id)) || passo.confusoes?.includes(a.id));
}

export type ToqueAlvo = { partida: Partida; resultado: "certo" | "errado" | "ignorado"; passoCompleto: boolean; mensagem: string };

export function tocarAlvo(p: Partida, id: string): ToqueAlvo {
  if (p.etapa !== "alvos") return { partida: p, resultado: "ignorado", passoCompleto: false, mensagem: "" };
  const passo = passoAtual(p);
  if (passo.certos.includes(id)) {
    if (p.feitos.includes(id)) return { partida: p, resultado: "ignorado", passoCompleto: false, mensagem: "" };
    const feitos = [...p.feitos, id];
    const completo = passo.certos.every((c) => feitos.includes(c));
    let prox: Partida = { ...p, feitos, pontos: p.pontos + PONTOS.alvo };
    if (completo) {
      const m = missaoAtual(p);
      prox = p.passo + 1 < m.passos.length ? { ...prox, passo: p.passo + 1 } : { ...prox, etapa: "desafio", d: 0, tentativas: 0, respondido: false, pontos: prox.pontos + PONTOS.missao };
    }
    return { partida: prox, resultado: "certo", passoCompleto: completo, mensagem: completo ? passo.aoCompletar : "" };
  }
  return { partida: { ...p, pontos: Math.max(0, p.pontos - PONTOS.erroAlvo), errosAlvo: p.errosAlvo + 1 }, resultado: "errado", passoCompleto: false, mensagem: passo.erro ?? "" };
}

export const chegar = (p: Partida): Partida => (p.etapa === "viagem" ? { ...p, etapa: "abertura" } : p);
export const comecarMissao = (p: Partida): Partida => (p.etapa === "abertura" ? { ...p, etapa: "alvos", passo: 0, feitos: [] } : p);

export type Resposta = { partida: Partida; certa: boolean; encerrou: boolean };

/** Duas tentativas: acerto de primeira vale tudo, de segunda vale metade, e depois disso a resposta é revelada. */
export function responder(p: Partida, opcao: number): Resposta {
  const d = desafioAtual(p);
  if (p.etapa !== "desafio" || !d || p.respondido) return { partida: p, certa: false, encerrou: false };
  const certa = opcao === d.certa;
  const tentativas = p.tentativas + 1;
  if (certa) {
    const ganho = tentativas === 1 ? PONTOS.desafio : PONTOS.desafioSegunda;
    return { partida: { ...p, tentativas, respondido: true, pontos: p.pontos + ganho, acertos: p.acertos + 1 }, certa: true, encerrou: true };
  }
  return { partida: { ...p, tentativas, respondido: tentativas >= 2 }, certa: false, encerrou: tentativas >= 2 };
}

export function proximoDesafio(p: Partida): Partida {
  if (p.etapa !== "desafio" || !p.respondido) return p;
  if (p.d + 1 < p.desafios[p.m].length) return { ...p, d: p.d + 1, tentativas: 0, respondido: false };
  if (p.m + 1 >= MISSOES.length) return { ...p, etapa: "fim", respondido: false };
  return { ...p, m: p.m + 1, etapa: "viagem", passo: 0, feitos: [], d: 0, tentativas: 0, respondido: false };
}

export const pontuacaoMaxima = () =>
  MISSOES.reduce((s, m) => s + m.passos.reduce((a, x) => a + x.certos.length, 0) * PONTOS.alvo + PONTOS.missao + m.quantosDesafios * PONTOS.desafio, 0);

export const resumoFinal = (p: Partida) => {
  const total = MISSOES.reduce((s, m) => s + m.quantosDesafios, 0);
  return `Você acertou ${p.acertos} de ${total} desafios e seguiu a energia até o ATP: ${EQUACAO_RESPIRACAO.texto}. Na OBB e na ONC, é esse tipo de raciocínio que conta.`;
};
