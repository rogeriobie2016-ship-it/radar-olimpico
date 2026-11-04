// Confere os jogos narrativos: todo caminho chega a um final, nenhuma cena fica órfã, todo erro explica por quê
// e nenhum texto usa travessão. Rodar: npm run testar:narrativos
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CENAS, CENAS_POR_ID, INICIO, INTEGRIDADE_INICIAL, PERDA_POR_ERRO, entrarEm, escolhasDe, type Cena } from "../src/lib/estudo/arquivo-perdido";
import { CASOS, ETAPAS, FINAIS, MINIMO_DE_CASOS, PRECISAO_MINIMA, ROTULO_FICCAO, ROTULO_NOTA, finalDe, lacunas, type Caso, type Documento } from "../src/lib/estudo/crononauta";
import { JOGOS } from "../src/lib/jogos";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
let falhas = 0;
const erro = (m: string) => {
  falhas++;
  console.error("✗", m);
};
const textoCheio = (t: string | undefined, onde: string) => {
  if (!t || t.trim().length < 3) erro(`${onde}: texto vazio`);
};

// ---- Arquivo Perdido: estrutura de cada cena ----
function destinos(c: Cena): string[] {
  if (c.tipo === "narrativa") return c.escolhas.map((e) => e.vai);
  if (c.tipo === "desafio" || c.tipo === "ordem") return [c.vai];
  if (c.tipo === "ramo") return [...c.regras.map((r) => r.vai), c.senao];
  return [];
}

const ids = new Set<string>();
for (const c of CENAS) {
  if (ids.has(c.id)) erro(`Arquivo: cena repetida ${c.id}`);
  ids.add(c.id);
}
if (!ids.has(INICIO)) erro("Arquivo: cena inicial não existe");

for (const c of CENAS) {
  for (const d of destinos(c)) if (!ids.has(d)) erro(`Arquivo: ${c.id} aponta para ${d}, que não existe`);
  if (c.tipo === "narrativa" && !c.escolhas.length) erro(`Arquivo: ${c.id} sem saída`);
  if (c.tipo === "desafio") {
    const certas = c.opcoes.filter((o) => o.certa);
    if (certas.length !== 1) erro(`Arquivo: ${c.id} tem ${certas.length} respostas certas`);
    if (c.opcoes.length < 3) erro(`Arquivo: ${c.id} com poucas opções`);
    if (new Set(c.opcoes.map((o) => o.t)).size !== c.opcoes.length) erro(`Arquivo: ${c.id} com opções repetidas`);
    // Ao errar, sempre explica. Explicação curta demais não ensina.
    for (const o of c.opcoes) if (!o.porque || o.porque.length < 30) erro(`Arquivo: ${c.id}, "${o.t}" sem explicação`);
    textoCheio(c.estudo, `Arquivo: ${c.id} estudo`);
    textoCheio(c.pergunta, `Arquivo: ${c.id} pergunta`);
    textoCheio(c.dica, `Arquivo: ${c.id} dica`);
    if (c.mensagem.linhas.some((l) => l.includes("{lacuna}")) !== !!c.mensagem.lacuna) erro(`Arquivo: ${c.id} com lacuna incoerente`);
    if (c.mensagem.lacuna && certas[0]?.t !== c.mensagem.lacuna) erro(`Arquivo: ${c.id} tem lacuna "${c.mensagem.lacuna}", mas a certa é "${certas[0]?.t}"`);
  }
  if (c.tipo === "ordem") {
    const n = c.fragmentos.length;
    if ([...c.mostrar].sort().join() !== Array.from({ length: n }, (_, i) => i).join()) erro(`Arquivo: ${c.id} com ordem de exibição inválida`);
    if (c.mostrar.every((v, i) => v === i)) erro(`Arquivo: ${c.id} já aparece resolvida`);
    for (const f of c.fragmentos) if (f.foraDeOrdem.length < 30) erro(`Arquivo: ${c.id} sem explicação de ordem`);
    textoCheio(c.estudo, `Arquivo: ${c.id} estudo`);
  }
  if (c.tipo === "final") {
    textoCheio(c.titulo, `Arquivo: ${c.id} título`);
    textoCheio(c.licao, `Arquivo: ${c.id} lição`);
  }
}

// ---- Arquivo Perdido: percorre TODOS os caminhos ----
// O estado é cena + marcas + integridade. Cada resposta errada possível vira um ramo do percurso,
// então os caminhos com muitos erros também são testados.
const finaisAlcancados = new Set<string>();
const visitadas = new Set<string>();
const memo = new Set<string>();
let caminhosDeFim = 0;

function percorrer(id: string, marcas: string[], integridade: number, pilha: Set<string>) {
  const chave = `${id}|${[...marcas].sort().join(",")}|${integridade}`;
  if (pilha.has(chave)) {
    erro(`Arquivo: ciclo em ${chave}`);
    return;
  }
  if (memo.has(chave)) return;

  const entrada = entrarEm(id, marcas, integridade);
  visitadas.add(id);
  // Ramos são resolvidos sozinhos, mas contam como visitados.
  visitadas.add(entrada.id);
  const c = CENAS_POR_ID[entrada.id];
  pilha.add(chave);

  if (c.tipo === "final") {
    finaisAlcancados.add(c.id);
    caminhosDeFim++;
  } else if (c.tipo === "narrativa") {
    const abertas = escolhasDe(c, entrada.marcas, integridade);
    if (!abertas.length) erro(`Arquivo: ${c.id} fica sem escolha disponível com marcas [${entrada.marcas}]`);
    for (const e of abertas) percorrer(e.vai, e.marca && !entrada.marcas.includes(e.marca) ? [...entrada.marcas, e.marca] : entrada.marcas, integridade, pilha);
  } else if (c.tipo === "desafio") {
    const errosPossiveis = c.opcoes.length - 1;
    for (let k = 0; k <= errosPossiveis; k++) percorrer(c.vai, entrada.marcas, Math.max(0, integridade - k * PERDA_POR_ERRO), pilha);
  } else if (c.tipo === "ordem") {
    // Em cada posição, dá para errar tocando em qualquer frase que ainda falta, menos a certa.
    const errosPossiveis = (c.fragmentos.length * (c.fragmentos.length - 1)) / 2;
    for (let k = 0; k <= errosPossiveis; k++) percorrer(c.vai, entrada.marcas, Math.max(0, integridade - k * PERDA_POR_ERRO), pilha);
  } else {
    erro(`Arquivo: ramo não resolvido em ${c.id}`);
  }

  pilha.delete(chave);
  memo.add(chave);
}
percorrer(INICIO, [], INTEGRIDADE_INICIAL, new Set());

for (const c of CENAS) {
  if (visitadas.has(c.id)) continue;
  // O ramo é atravessado dentro de entrarEm, então é conferido pelas referências.
  const citada = c.tipo === "ramo" && CENAS.some((o) => destinos(o).includes(c.id));
  if (!citada) erro(`Arquivo: cena órfã ${c.id}`);
}
const finaisArquivo = CENAS.filter((c) => c.tipo === "final");
if (finaisArquivo.length < 2) erro("Arquivo: precisa de ao menos 2 finais");
for (const f of finaisArquivo) if (!finaisAlcancados.has(f.id)) erro(`Arquivo: final ${f.id} nunca é alcançado`);

// Escolhas mudam o caminho de verdade: o final especial exige as duas alas.
{
  const decisao = CENAS_POR_ID.decisao;
  if (decisao.tipo !== "narrativa") erro("Arquivo: decisão não é narrativa");
  else {
    const n = (m: string[]) => escolhasDe(decisao, m, 100).map((e) => e.vai);
    if (n(["padrao"]).includes("f-conversa") || n(["arremedo"]).includes("f-conversa")) erro("Arquivo: final da conversa não deveria abrir com uma ala só");
    if (!n(["padrao", "arremedo"]).includes("f-conversa")) erro("Arquivo: final da conversa não abre com as duas alas");
  }
}

// O problema de linguística precisa ter resposta única pelos dados: confere com a gramática usada para escrever os dados.
{
  const nomes: Record<string, string> = { água: "tiru", pedra: "bel" };
  const verbos: Record<string, string> = { cantar: "sa", dormir: "mo" };
  const frase = (n: string, v: string, plural: boolean, neg: boolean) => [nomes[n], verbos[v], plural && "ni", neg && "ke"].filter(Boolean).join(" ");
  const certa = (id: string) => {
    const c = CENAS_POR_ID[id];
    return c.tipo === "desafio" ? c.opcoes.find((o) => o.certa)?.t : undefined;
  };
  if (certa("lin1") !== frase("pedra", "cantar", true, false)) erro("Linguística: lin1 não confere");
  if (certa("lin2") !== frase("água", "dormir", true, true)) erro("Linguística: lin2 não confere");
  const lin3 = CENAS_POR_ID.lin3;
  if (lin3.tipo === "desafio" && !lin3.mensagem.linhas[0].includes(frase("água", "dormir", false, true))) erro("Linguística: lin3 não confere");
  const tabelas: [string, string][] = [["tiru sa", frase("água", "cantar", false, false)], ["tiru sa ni", frase("água", "cantar", true, false)], ["bel sa", frase("pedra", "cantar", false, false)], ["tiru mo", frase("água", "dormir", false, false)], ["bel mo ni", frase("pedra", "dormir", true, false)], ["bel sa ke", frase("pedra", "cantar", false, true)], ["bel sa ni ke", frase("pedra", "cantar", true, true)]];
  for (const [a, b] of tabelas) if (a !== b) erro(`Linguística: tabela ${a} difere de ${b}`);
}

// ---- Crononauta: estrutura de cada caso ----
function conferirDoc(d: Documento, onde: string) {
  if (d.rotulo !== ROTULO_FICCAO && d.rotulo !== ROTULO_NOTA) erro(`${onde}: ${d.id} sem rótulo de recriação`);
  if (d.tipo === "nota" && d.rotulo !== ROTULO_NOTA) erro(`${onde}: nota ${d.id} com rótulo errado`);
  if (d.tipo !== "nota" && d.rotulo !== ROTULO_FICCAO) erro(`${onde}: ${d.id} precisa do rótulo de ficção`);
  if (!d.origem) erro(`${onde}: ${d.id} sem origem`);
  if (d.trechos.length < 3) erro(`${onde}: ${d.id} com poucos trechos`);
}

function conferirOpcoes(os: { t: string; certa?: boolean; porque: string }[], onde: string) {
  const certas = os.filter((o) => o.certa);
  if (certas.length !== 1) erro(`${onde}: ${certas.length} respostas certas`);
  if (os.length < 3) erro(`${onde}: poucas opções`);
  if (new Set(os.map((o) => o.t)).size !== os.length) erro(`${onde}: opções repetidas`);
  for (const o of os) if (!o.porque || o.porque.length < 15) erro(`${onde}: "${o.t}" sem explicação`);
}

const idsCaso = new Set<string>();
function conferirCaso(c: Caso) {
  const onde = `Crononauta ${c.id}`;
  if (idsCaso.has(c.id)) erro(`${onde}: caso repetido`);
  idsCaso.add(c.id);
  if (!c.documentos.some((d) => d.tipo === "nota")) erro(`${onde}: sem nota de pesquisa`);
  c.documentos.forEach((d) => conferirDoc(d, onde));
  const doc = (id: string) => c.documentos.find((d) => d.id === id);
  if (!doc(c.fonte.doc)) erro(`${onde}: fonte aponta para documento inexistente`);
  conferirOpcoes(c.fonte.opcoes, `${onde} fonte`);
  textoCheio(c.fonte.estudo, `${onde} fonte estudo`);

  const { comparar: k } = c;
  const lados: ["a" | "b", string[], Record<string, string>][] = [["a", k.certosA, k.errosA], ["b", k.certosB, k.errosB]];
  for (const [lado, certos, erros] of lados) {
    const d = doc(k[lado]);
    if (!d) {
      erro(`${onde}: comparação aponta para documento inexistente`);
      continue;
    }
    if (!certos.length) erro(`${onde}: comparação sem trecho certo no lado ${lado}`);
    for (const t of d.trechos) {
      const eCerto = certos.includes(t.id);
      const explica = erros[t.id];
      if (eCerto && explica) erro(`${onde}: ${t.id} é certo e também tem explicação de erro`);
      // Tocar em qualquer outro trecho precisa explicar por que ele não resolve.
      if (!eCerto && (!explica || explica.length < 20)) erro(`${onde}: ${t.id} sem explicação`);
    }
    for (const id of [...certos, ...Object.keys(erros)]) if (!d.trechos.some((t) => t.id === id)) erro(`${onde}: comparação cita trecho inexistente ${id}`);
  }

  const a = c.anacronismo;
  conferirDoc(a.doc, `${onde} anacronismo`);
  if (!a.doc.trechos.some((t) => t.id === a.impossivel)) erro(`${onde}: anacronismo aponta para trecho inexistente`);
  for (const t of a.doc.trechos) {
    if (t.id === a.impossivel) continue;
    if (!a.compativeis[t.id] || a.compativeis[t.id].length < 20) erro(`${onde}: ${t.id} sem explicação de compatibilidade`);
  }
  if (a.porque.length < 40) erro(`${onde}: anacronismo mal explicado`);
  if (!a.selo.includes(String(a.doc.origem.match(/\d{4}/)?.[0]))) erro(`${onde}: selo do anacronismo não cita a data do papel`);

  const vagas = lacunas(c);
  if (vagas.length < 3) erro(`${onde}: conclusão com poucas partes`);
  vagas.forEach((v, i) => conferirOpcoes(v.opcoes, `${onde} conclusão ${i + 1}`));
  textoCheio(c.conclusao.estudo, `${onde} conclusão estudo`);
  if (c.balanco.fatos.length < 3) erro(`${onde}: balanço com poucos fatos`);
  textoCheio(c.balanco.fontes, `${onde} fontes`);
}
CASOS.forEach(conferirCaso);

if (CASOS.length < 4) erro("Crononauta: poucos casos");
const assuntos = CASOS.map((c) => c.lugar).join(" ");
for (const lugar of ["Fortaleza", "Ceará", "Cariri", "Rio de Janeiro", "Caribe"]) if (!assuntos.includes(lugar)) erro(`Crononauta: falta ${lugar}`);

// ---- Crononauta: todo caminho chega a um final ----
// A pessoa escolhe a ordem dos casos e pode entregar depois do mínimo. Simula todas as ordens, sem acertar nada de primeira e acertando tudo.
const terminais = new Set<string>();
let ordens = 0;
function viajar(feitos: string[], acertos: number, erros: number, jeito: "perfeito" | "sofrido") {
  const n = feitos.length;
  if (n === CASOS.length || n >= MINIMO_DE_CASOS) {
    terminais.add(finalDe(acertos, erros).id);
    ordens++;
    if (n === CASOS.length) return;
  }
  for (const c of CASOS) {
    if (feitos.includes(c.id)) continue;
    let a = acertos;
    let e = erros;
    for (const etapa of ETAPAS) {
      if (etapa === "balanco") continue;
      a++;
      if (jeito === "sofrido") {
        if (etapa === "fonte") e += c.fonte.opcoes.length - 1;
        if (etapa === "comparar") e += Object.keys(c.comparar.errosA).length + Object.keys(c.comparar.errosB).length;
        if (etapa === "anacronismo") e += Object.keys(c.anacronismo.compativeis).length;
        if (etapa === "conclusao") e += lacunas(c).reduce((s, v) => s + v.opcoes.length - 1, 0);
      }
    }
    viajar([...feitos, c.id], a, e, jeito);
  }
}
viajar([], 0, 0, "perfeito");
viajar([], 0, 0, "sofrido");
for (const f of Object.values(FINAIS)) if (!terminais.has(f.id)) erro(`Crononauta: final ${f.id} nunca é alcançado`);
if (finalDe(1, 0).id !== "firme" || finalDe(1, 9).id !== "tremida") erro("Crononauta: regra do final invertida");
if (PRECISAO_MINIMA < 50) erro("Crononauta: precisão mínima baixa demais");

// ---- Registro nos jogos e nos carimbos ----
const dados = JSON.parse(readFileSync(join(raiz, "data/oportunidades.json"), "utf8"));
const lista: { id: string }[] = Array.isArray(dados) ? dados : dados.oportunidades;
const existentes = new Set(lista.map((o) => o.id));
const guia = readFileSync(join(raiz, "src/lib/guia.ts"), "utf8");
const cliente = readFileSync(join(raiz, "src/app/jogos/[slug]/JogoCliente.tsx"), "utf8");
for (const slug of ["arquivo-perdido", "crononauta"]) {
  const j = JOGOS.find((x) => x.slug === slug);
  if (!j) {
    erro(`Jogo ${slug} não registrado em jogos.ts`);
    continue;
  }
  if (!j.oportunidades.length) erro(`${slug}: sem olimpíadas ligadas`);
  for (const id of [...j.oportunidades, j.principal]) if (!existentes.has(id)) erro(`${slug}: id ${id} não existe em oportunidades.json`);
  if (!guia.includes(`id: "${slug}"`)) erro(`${slug}: sem carimbo em CARIMBOS`);
  if (!new RegExp(`"?${slug}"?: dynamic`).test(cliente)) erro(`${slug}: não está em JogoCliente.tsx com carregamento sob demanda`);
}

// ---- Texto: sem travessão em nenhum dos arquivos dos jogos ----
const arquivos = [
  ...readdirSync(join(raiz, "src/lib/estudo")).map((f) => join("src/lib/estudo", f)),
  "src/components/jogos/ArquivoPerdido.tsx",
  "src/components/jogos/Crononauta.tsx",
  "src/components/jogos/narrativa.tsx",
  "src/components/jogos/cenariosTita.tsx",
  "src/components/jogos/cenariosTempo.tsx",
];
for (const a of arquivos) {
  const conteudo = readFileSync(join(raiz, a), "utf8");
  conteudo.split("\n").forEach((linha, i) => {
    if (/[–—―]/.test(linha)) erro(`Travessão em ${a}, linha ${i + 1}`);
  });
}
// Confere também o texto já montado, caso algo venha de fora dos arquivos acima.
const tudo = JSON.stringify({ CENAS, CASOS, FINAIS });
if (/[–—―]/.test(tudo)) erro("Travessão no conteúdo dos jogos");
for (const slug of ["arquivo-perdido", "crononauta"]) if (/[–—―]/.test(JSON.stringify(JOGOS.find((j) => j.slug === slug) ?? ""))) erro(`Travessão no registro de ${slug}`);

if (falhas) {
  console.error(`\n${falhas} falha(s) nos jogos narrativos.`);
  process.exit(1);
}
console.log(`Narrativos ok: ${CENAS.length} cenas, ${memo.size} estados percorridos, ${caminhosDeFim} chegadas a ${finaisArquivo.length} finais. Crononauta: ${CASOS.length} casos, ${ordens} ordens simuladas, ${terminais.size} finais.`);
