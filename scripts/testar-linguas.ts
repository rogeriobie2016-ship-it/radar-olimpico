// Confere o conteúdo de Língua Galáctica: estrutura das lições, gabaritos, escrita, regras de pontuação e ligação com o catálogo.
// Rodar: npm run testar:linguas
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  conferirEscrita, conferirExercicio, CURSOS, embaralharBlocos, estrelasPorErros, fraseAlvo, gabarito, interpretarProgresso, licaoAberta, mascara, normalizar, progressoVazio, proximaLicao,
  registrarLicao, sequenciaAtual, VIDAS, xpDaLicao,
} from "../src/lib/estudo/motor";
import type { Exercicio, Idioma } from "../src/lib/estudo/tipos";
import { CARIMBOS } from "../src/lib/guia";
import { JOGOS } from "../src/lib/jogos";

const erros: string[] = [];
const conferir = (ok: boolean, msg: string) => void (ok || erros.push(msg));

const TIPOS: Exercicio["tipo"][] = ["traduzir", "montar", "pares", "completar", "ouvir", "ler"];
const palavras = (t: string) => normalizar(t).split(" ");

/** Frases no idioma estudado que precisam estar certas (as opções erradas são erradas de propósito). */
function corretas(ex: Exercicio): string[] {
  switch (ex.tipo) {
    case "traduzir":
      return [ex.de === "alvo" ? ex.frase : ex.certa];
    case "completar":
      return [ex.frase.replace("___", ex.certa)];
    case "montar":
      return [ex.blocos.join(" "), ...(ex.aceitas ?? [])];
    case "ouvir":
      return [ex.frase, ...(ex.aceitas ?? [])];
    case "ler":
      return [ex.texto];
    case "pares":
      return ex.pares.map((p) => p[0]);
  }
}

/** Todo texto do exercício, para as regras de escrita valerem também nas opções erradas e nas explicações. */
function textos(ex: Exercicio): string[] {
  const { tipo: _t, ...resto } = ex;
  return JSON.stringify(resto).split('"').filter((s) => s.length > 1);
}

// Erros clássicos que não podem aparecer em uma resposta dada como certa.
const PROIBIDO: Record<Idioma, RegExp[]> = {
  en: [/\bmore (better|big|bigger|fast|hot|good)\b/i, /\bdidn't (went|saw|ate|bought)\b/i, /\bdid\b.*\b(went|studied|played)\b/i, /\bdoesn't (likes|goes|plays)\b/i, /\bcan to\b/i, /\bshould to\b/i, /\bpeoples\b/i, /\b(he|she|it) (go|study|play|like)\b/i, /\ba (eclipse|apple)\b/i, /\bhave (saw|went|ate)\b/i],
  es: [/\bmuy (mucho|poco|amigos|calor|tiempo)\b/i, /\bmucho (grande|lejos|alto|bueno|bien)\b/i, /\ba el\b/i, /\bde el\b/i, /\bel (leche|nariz|sangre|sal)\b/i, /\bla (viaje|puente|árbol|paisaje)\b/i, /\blo (niños|libros|chicos)\b/i, /\bmás mejor\b/i, /\b(voy|vas|va|vamos|van) (estudiar|viajar|aprender)\b/i, /\bfué\b/i, /\bfuí\b/i, /\bhicé\b/i, /\btuvé\b/i, /\bdijé\b/i, /\ben el la\b/i],
};

for (const idioma of ["en", "es"] as Idioma[]) {
  const curso = CURSOS[idioma];
  conferir(curso.idioma === idioma, `${idioma}: curso com idioma trocado`);
  conferir(curso.licoes.length >= 6, `${idioma}: menos de 6 lições`);
  const tiposCurso = new Set<string>();

  curso.licoes.forEach((l, li) => {
    const onde = (i?: number) => `${l.id}${i === undefined ? "" : ` #${i + 1}`}`;
    conferir(l.id === `${idioma}-${li + 1}`, `${onde()}: id fora da sequência`);
    conferir(Boolean(l.nome && l.tema), `${onde()}: sem nome ou tema`);
    conferir(l.ideias.length >= 2, `${onde()}: explicação curta demais`);
    conferir(l.exercicios.length >= 6, `${onde()}: menos de 6 exercícios`);
    conferir(new Set(l.exercicios.map((e) => e.tipo)).size >= 4, `${onde()}: pouca variedade de exercícios`);
    conferir(l.exercicios.length > VIDAS, `${onde()}: dá para perder todas as vidas sem ver a lição inteira`);

    for (const t of [l.nome, l.tema, ...l.ideias]) conferir(!/[—–]/.test(t), `${onde()}: travessão em "${t}"`);

    l.exercicios.forEach((ex, i) => {
      tiposCurso.add(ex.tipo);
      conferir(ex.porque.trim().length >= 12, `${onde(i)}: explicação vazia`);
      conferir(/[.!?]$/.test(ex.porque.trim()), `${onde(i)}: explicação sem ponto final: "${ex.porque}"`);
      for (const t of textos(ex)) {
        conferir(!/[—–]/.test(t), `${onde(i)}: travessão em "${t}"`);
        conferir(!/\s{2,}/.test(t), `${onde(i)}: espaço duplo em "${t}"`);
      }

      if (ex.tipo === "traduzir" || ex.tipo === "completar" || ex.tipo === "ler") {
        conferir(ex.opcoes.length >= 3, `${onde(i)}: menos de 3 opções`);
        conferir(new Set(ex.opcoes).size === ex.opcoes.length, `${onde(i)}: opções repetidas`);
        conferir(ex.opcoes.includes(ex.certa), `${onde(i)}: resposta "${ex.certa}" fora das opções`);
        conferir(conferirExercicio(ex, ex.certa) === "certo", `${onde(i)}: gabarito não confere`);
        for (const o of ex.opcoes) if (o !== ex.certa) conferir(conferirExercicio(ex, o) === "errado", `${onde(i)}: opção errada aceita: ${o}`);
      }
      if (ex.tipo === "completar") {
        conferir(ex.frase.split("___").length === 2, `${onde(i)}: a frase precisa de exatamente uma lacuna`);
        conferir(Boolean(ex.pt.trim()), `${onde(i)}: sem tradução`);
        conferir(!gabarito(ex).includes("___"), `${onde(i)}: gabarito com lacuna`);
      }
      if (ex.tipo === "montar") {
        conferir(ex.blocos.length >= 3, `${onde(i)}: frase curta demais para montar`);
        conferir(ex.extras.length >= 1, `${onde(i)}: sem blocos sobrando`);
        conferir(ex.extras.every((b) => !ex.blocos.includes(b)), `${onde(i)}: bloco extra igual a um bloco da resposta`);
        conferir(conferirExercicio(ex, ex.blocos.join(" ")) === "certo", `${onde(i)}: ordem certa recusada`);
        conferir(conferirExercicio(ex, [...ex.blocos].reverse().join(" ")) === "errado", `${onde(i)}: ordem invertida aceita`);
        // Toda forma aceita precisa dar para montar com os blocos disponíveis.
        const banco = [...ex.blocos, ...ex.extras].map(normalizar);
        for (const a of ex.aceitas ?? []) {
          const sobra = [...banco];
          for (const p of palavras(a)) {
            const k = sobra.indexOf(p);
            conferir(k >= 0, `${onde(i)}: forma aceita "${a}" usa "${p}", que não está nos blocos`);
            if (k >= 0) sobra.splice(k, 1);
          }
        }
        for (let t = 0; t < 40; t++) {
          const e = embaralharBlocos(ex);
          conferir(e.length === banco.length, `${onde(i)}: embaralhar perdeu blocos`);
          conferir(!e.join(" ").startsWith(ex.blocos.join(" ")), `${onde(i)}: embaralhar entregou a resposta pronta`);
        }
      }
      if (ex.tipo === "pares") {
        conferir(ex.pares.length >= 3 && ex.pares.length <= 6, `${onde(i)}: quantidade de pares ruim para a tela`);
        conferir(new Set(ex.pares.map((p) => p[0])).size === ex.pares.length, `${onde(i)}: termo repetido`);
        conferir(new Set(ex.pares.map((p) => p[1])).size === ex.pares.length, `${onde(i)}: par repetido`);
        conferir(fraseAlvo(ex) === null, `${onde(i)}: pares não têm frase para ouvir`);
      }
      if (ex.tipo === "ouvir") {
        conferir(conferirExercicio(ex, ex.frase) === "certo", `${onde(i)}: a própria frase foi recusada`);
        conferir(conferirExercicio(ex, ex.frase.toUpperCase()) === "certo", `${onde(i)}: maiúsculas contam como erro`);
        conferir(Boolean(ex.pt.trim()), `${onde(i)}: sem tradução para quem não pode ouvir`);
        for (const a of ex.aceitas ?? []) conferir(conferirExercicio(ex, a) === "certo", `${onde(i)}: forma aceita recusada`);
        const pista = mascara(ex.frase);
        conferir(pista.length === ex.frase.length, `${onde(i)}: a pista precisa ter o tamanho da frase`);
        conferir(pista !== ex.frase || palavras(ex.frase).every((p) => p.length === 1), `${onde(i)}: a pista entrega a frase`);
      }
      const alvo = fraseAlvo(ex);
      if (alvo) conferir(!alvo.includes("___"), `${onde(i)}: voz leria a lacuna`);

      // Escrita e gramática das respostas certas.
      for (const frase of corretas(ex)) {
        for (const r of PROIBIDO[idioma]) conferir(!r.test(frase), `${onde(i)}: "${frase}" bate no erro clássico ${r}`);
        if (idioma === "en") conferir(!/[¿¡ñáéíóú]/i.test(frase), `${onde(i)}: caractere de espanhol em "${frase}"`);
        if (idioma === "es") {
          conferir(!/\?/.test(frase) || /¿/.test(frase), `${onde(i)}: pergunta sem ¿ em "${frase}"`);
          conferir(!/!/.test(frase) || /¡/.test(frase), `${onde(i)}: exclamação sem ¡ em "${frase}"`);
          conferir(!/\b(voce|nao|tambem|muito|obrigado|escola|cidade)\b/i.test(frase), `${onde(i)}: português em "${frase}"`);
        }
      }
      if (idioma === "es" && ex.tipo === "traduzir" && ex.de === "pt") {
        for (const o of ex.opcoes) conferir(!/\?/.test(o) || /¿/.test(o), `${onde(i)}: pergunta sem ¿ em "${o}"`);
      }
    });
  });

  for (const t of TIPOS) conferir(tiposCurso.has(t), `${idioma}: nenhum exercício do tipo ${t}`);
}
conferir(new Set(Object.values(CURSOS).flatMap((c) => c.licoes.map((l) => l.id))).size === CURSOS.en.licoes.length + CURSOS.es.licoes.length, "id de lição repetido");

// Conferência escrita: pontuação e maiúsculas não contam, acento vira "quase", e ñ não é n.
const casos: [string, string, string[] | undefined, string][] = [
  ["how are you", "How are you?", undefined, "certo"],
  ["HOW ARE YOU???", "How are you?", undefined, "certo"],
  ["  how   are you ", "How are you?", undefined, "certo"],
  ["how you are", "How are you?", undefined, "errado"],
  ["", "How are you?", undefined, "errado"],
  ["como te llamas", "¿Cómo te llamas?", undefined, "quase"],
  ["¿cómo te llamas?", "¿Cómo te llamas?", undefined, "certo"],
  ["quiero aprender espanol", "Quiero aprender español.", undefined, "errado"],
  ["quiero aprender español", "Quiero aprender español.", undefined, "certo"],
  ["i will call you tomorrow", "I will call you tomorrow.", ["I'll call you tomorrow"], "certo"],
  ["I’ll call you tomorrow", "I will call you tomorrow.", ["I'll call you tomorrow"], "certo"],
  ["ill call you tomorrow", "I will call you tomorrow.", ["I'll call you tomorrow"], "quase"],
];
for (const [r, c, a, n] of casos) conferir(conferirEscrita(r, c, a) === n, `conferirEscrita("${r}", "${c}") deveria ser ${n}`);
conferir(mascara("I read a book.") === "I r___ a b___.", `pista: ${mascara("I read a book.")}`);
conferir(mascara("¿Cómo te llamas?") === "¿C___ t_ l_____?", `pista: ${mascara("¿Cómo te llamas?")}`);
conferir(mascara("I'll go.") === "I'__ g_.", `pista: ${mascara("I'll go.")}`);

// Pontuação
conferir(estrelasPorErros(0) === 3 && estrelasPorErros(1) === 2 && estrelasPorErros(2) === 1, "estrelas por erros");
conferir(xpDaLicao({ diretos: 8, revisados: 0, erros: 0, repeticao: false }) === 100, "XP de lição perfeita");
conferir(xpDaLicao({ diretos: 7, revisados: 1, erros: 1, repeticao: false }) === 75, "XP com um erro revisado");
conferir(xpDaLicao({ diretos: 8, revisados: 0, erros: 0, repeticao: true }) === 50, "XP de repetição vale metade");

// Sequência de dias: inclusive virada de mês e ano, dia repetido, pulo e relógio atrasado.
{
  let p = progressoVazio();
  conferir(sequenciaAtual(p, "2026-11-04") === 0, "sequência começa em zero");
  p = registrarLicao(p, "en-1", { xp: 100, estrelas: 3 }, "2026-11-04");
  conferir(p.dias === 1 && p.xp === 100, "primeira lição conta um dia");
  p = registrarLicao(p, "en-2", { xp: 50, estrelas: 2 }, "2026-11-04");
  conferir(p.dias === 1 && p.xp === 150, "duas lições no mesmo dia contam um dia");
  conferir(sequenciaAtual(p, "2026-11-05") === 1, "ontem ainda segura a sequência");
  conferir(sequenciaAtual(p, "2026-11-06") === 0, "um dia inteiro sem lição zera a sequência");
  p = registrarLicao(p, "en-1", { xp: 10, estrelas: 1 }, "2026-11-05");
  conferir(p.dias === 2, "dia seguinte soma");
  conferir(p.licoes["en-1"].estrelas === 3 && p.licoes["en-1"].vezes === 2, "repetir guarda a melhor nota");
  p = registrarLicao(p, "en-1", { xp: 10, estrelas: 3 }, "2026-11-03");
  conferir(p.dias === 2 && p.ultimoDia === "2026-11-05", "relógio atrasado não mexe na sequência");
  p = registrarLicao(p, "en-1", { xp: 10, estrelas: 3 }, "2026-11-09");
  conferir(p.dias === 1, "depois de um pulo, recomeça em um");
  let q = registrarLicao(progressoVazio(), "en-1", { xp: 1, estrelas: 1 }, "2026-12-31");
  q = registrarLicao(q, "en-1", { xp: 1, estrelas: 1 }, "2027-01-01");
  conferir(q.dias === 2, "virada de ano soma");
  let b = registrarLicao(progressoVazio(), "en-1", { xp: 1, estrelas: 1 }, "2028-02-28");
  b = registrarLicao(b, "en-1", { xp: 1, estrelas: 1 }, "2028-02-29");
  conferir(b.dias === 2, "ano bissexto soma");
}

// Destravar: só a primeira abre, e cada lição concluída abre a seguinte.
{
  const c = CURSOS.es;
  let p = progressoVazio();
  conferir(licaoAberta(p, c, 0) && !licaoAberta(p, c, 1), "só a primeira lição começa aberta");
  conferir(proximaLicao(p, c) === 0, "próxima lição no começo");
  p = registrarLicao(p, c.licoes[0].id, { xp: 1, estrelas: 1 }, "2026-11-04");
  conferir(licaoAberta(p, c, 1) && !licaoAberta(p, c, 2), "concluir abre a seguinte");
  conferir(proximaLicao(p, c) === 1, "próxima lição depois da primeira");
  conferir(licaoAberta(p, CURSOS.en, 0) && !licaoAberta(p, CURSOS.en, 1), "progresso de um idioma não abre o outro");
  for (const l of c.licoes) p = registrarLicao(p, l.id, { xp: 1, estrelas: 1 }, "2026-11-04");
  conferir(proximaLicao(p, c) === -1, "trilha completa");
}

// Armazenamento estragado nunca pode quebrar a tela.
for (const bruto of [null, "", "{", "null", "[]", "42", '"x"', '{"xp":"muito","licoes":5,"dias":-3,"ultimoDia":"ontem","idioma":"fr"}', '{"licoes":{"en-1":null,"en-2":{"estrelas":"a"}}}']) {
  const p = interpretarProgresso(bruto);
  conferir(p.xp === 0 && p.dias === 0 && p.ultimoDia === null && p.idioma === "en" && Object.keys(p.licoes).length === 0, `progresso estragado aceito: ${bruto}`);
}
{
  const volta = interpretarProgresso(JSON.stringify(registrarLicao({ ...progressoVazio(), idioma: "es" }, "es-1", { xp: 80, estrelas: 2 }, "2026-11-04")));
  conferir(volta.xp === 80 && volta.idioma === "es" && volta.licoes["es-1"].estrelas === 2 && volta.ultimoDia === "2026-11-04", "progresso salvo não volta igual");
}

// Ligação com o resto do site.
{
  const catalogo = JSON.parse(readFileSync(join(process.cwd(), "data/oportunidades.json"), "utf8")) as { id: string; slug: string }[];
  const ids = new Set(catalogo.map((o) => o.id));
  const jogo = JOGOS.find((j) => j.slug === "lingua-galactica");
  conferir(Boolean(jogo), "jogo não registrado em jogos.ts");
  if (jogo) {
    for (const id of [...jogo.oportunidades, jogo.principal]) conferir(ids.has(id), `jogos.ts: "${id}" não existe em oportunidades.json`);
    conferir(jogo.oportunidades.includes(jogo.principal), "a ficha principal precisa estar nas oportunidades");
    for (const t of [jogo.titulo, jogo.olimpiada, jogo.resumo, jogo.como]) conferir(!/[—–]/.test(t), `jogos.ts: travessão em "${t}"`);
  }
  const carimbo = CARIMBOS.find((c) => c.id === "lingua-galactica");
  conferir(Boolean(carimbo), "carimbo não registrado em guia.ts");
  if (carimbo) conferir(!/[—–]/.test(carimbo.titulo + carimbo.como), "guia.ts: travessão no carimbo");
  const cliente = readFileSync(join(process.cwd(), "src/app/jogos/[slug]/JogoCliente.tsx"), "utf8");
  conferir(/"lingua-galactica": dynamic\(\(\) => import\("@\/components\/jogos\/LinguaGalactica"\)/.test(cliente), "jogo não carrega sob demanda em JogoCliente");
}

// A interface também segue a regra do travessão.
{
  const tela = readFileSync(join(process.cwd(), "src/components/jogos/LinguaGalactica.tsx"), "utf8");
  conferir(!/[—–]/.test(tela), "travessão na interface do jogo");
}

const totalEx = Object.values(CURSOS).reduce((s, c) => s + c.licoes.reduce((t, l) => t + l.exercicios.length, 0), 0);
if (erros.length) {
  for (const e of erros) console.error("✗", e);
  console.error(`\n${erros.length} problema(s) no conteúdo de Língua Galáctica.`);
  process.exit(1);
}
console.log(`✓ Língua Galáctica: ${CURSOS.en.licoes.length} lições de inglês, ${CURSOS.es.licoes.length} de espanhol, ${totalEx} exercícios conferidos.`);
