// Confere o jogo Nave Celular: ciência das contas, regras da partida, mapa sem colisões e registro no site.
// Rodar: npm run testar:celula
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { COLISORES, COLISORES_CRISTA, INICIO, LIMITE_CRISTA, LIMITE_NAVE, POSICOES, POSICOES_CRISTA, POUSOS, RAIO_NAVE, type V3 } from "../src/components/jogos/celula/mapa";
import { alvosAtivos, anticodon, ATP_POR_NADH, chegar, CODIGO, comecarMissao, CURIOSIDADES, deltaE, deltaG, desafioAtual, ENERGIA_ATP, EQUACAO_RESPIRACAO, MISSOES, novaPartida, nucleotideosDaProteina, PONTOS, pontuacaoMaxima, POTENCIAL, proximoDesafio, razaoFotons, razaoProtons, rendimentoRespiracao, responder, tocarAlvo, transcrever, type Partida } from "../src/lib/estudo/celula";
import { JOGOS } from "../src/lib/jogos";

const erros: string[] = [];
const conferir = (ok: boolean, msg: string) => void (ok || erros.push(msg));
const perto = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

const desafio = (id: string) => {
  for (const m of MISSOES) for (const d of m.desafios) if (d.id === id) return d;
  throw new Error(`desafio sumiu: ${id}`);
};
const certa = (id: string) => {
  const d = desafio(id);
  return d.opcoes[d.certa];
};

// Texto: tudo em português, sem travessão, sem opção repetida e sem resposta faltando.
const SEM_TRAVESSAO = /[—–]/;
const textos = (o: unknown): string[] => (typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(textos) : o && typeof o === "object" ? Object.values(o).flatMap(textos) : []);
for (const t of [...textos(MISSOES), ...textos(CURIOSIDADES), EQUACAO_RESPIRACAO.texto]) conferir(!SEM_TRAVESSAO.test(t), `travessão em "${t}"`);

const idsMissao = new Set<string>();
for (const m of MISSOES) {
  conferir(!idsMissao.has(m.id), `missão repetida: ${m.id}`);
  idsMissao.add(m.id);
  conferir(m.desafios.length >= m.quantosDesafios && m.quantosDesafios > 0, `${m.id}: faltam desafios`);
  conferir(m.passos.length > 0, `${m.id}: sem passos`);
  const ids = new Set(m.alvos.map((a) => a.id));
  conferir(ids.size === m.alvos.length, `${m.id}: alvo repetido`);
  const usados = new Set<string>();
  for (const p of m.passos) {
    for (const c of p.certos) {
      conferir(ids.has(c), `${m.id}: passo aponta para alvo inexistente "${c}"`);
      conferir(!usados.has(c), `${m.id}: "${c}" é a resposta de mais de um passo`);
      usados.add(c);
    }
    for (const c of p.confusoes ?? []) {
      conferir(ids.has(c), `${m.id}: confusão inexistente "${c}"`);
      conferir(!p.certos.includes(c), `${m.id}: "${c}" é certa e confusão no mesmo passo`);
    }
    if (p.confusoes?.length) conferir(!!p.erro, `${m.id}: passo com confusão precisa explicar o erro`);
    conferir(p.aoCompletar.length > 10, `${m.id}: passo sem explicação`);
  }
  for (const a of m.alvos) conferir(usados.has(a.id) || m.passos.some((p) => p.confusoes?.includes(a.id)), `${m.id}: alvo "${a.id}" nunca aparece`);
  for (const d of m.desafios) {
    conferir(d.certa >= 0 && d.certa < d.opcoes.length, `${d.id}: índice da resposta`);
    conferir(new Set(d.opcoes).size === d.opcoes.length, `${d.id}: opções repetidas`);
    conferir(d.opcoes.length >= 3 && d.opcoes.length <= 4, `${d.id}: quantidade de opções`);
    conferir(d.explicacao.length > 40, `${d.id}: explicação curta demais`);
    conferir(d.enunciado.length > 20, `${d.id}: enunciado curto demais`);
  }
}
const idsDesafio = MISSOES.flatMap((m) => m.desafios.map((d) => d.id));
conferir(new Set(idsDesafio).size === idsDesafio.length, "desafio com id repetido");

// A final precisa ser de física ou química.
const final = MISSOES[MISSOES.length - 1];
conferir(final.id === "cadeia", "a última missão precisa ser a cadeia respiratória");
conferir(final.desafios.every((d) => d.estilo === "ONC"), "final: desafios de cálculo no estilo ONC");

// Física e química da cadeia respiratória.
conferir(perto(deltaE(), 1.14, 1e-9), `ΔE deveria ser 1,14 V, deu ${deltaE()}`);
conferir(perto(deltaG(), -220, 0.1), `ΔG deveria ser perto de −220 kJ/mol, deu ${deltaG()}`);
conferir(perto(rendimentoRespiracao(), 0.35, 0.01), `rendimento deveria ser perto de 35%, deu ${rendimentoRespiracao()}`);
conferir(perto(ATP_POR_NADH * ENERGIA_ATP, 76, 0.5), "energia guardada por NADH");
conferir(perto(razaoProtons(), 6.3, 0.05), `razão de prótons deveria ser perto de 6,3, deu ${razaoProtons()}`);
conferir(certa("cadeia-potencial").includes(deltaE().toFixed(2).replace(".", ",")), "resposta de ΔE não bate com a conta");
conferir(certa("cadeia-energia").includes(String(Math.round(Math.abs(deltaG())))), "resposta de ΔG não bate com a conta");
conferir(certa("cadeia-rendimento").includes(`${Math.round(rendimentoRespiracao() * 100)}%`), "resposta do rendimento não bate com a conta");
conferir(certa("cadeia-ph").includes(`${Math.round(razaoProtons())} vezes`), "resposta de pH não bate com a conta");
// Os elétrons só podem descer para potenciais maiores.
const degraus = [POTENCIAL.nadh, POTENCIAL.ubiquinona, POTENCIAL.citocromoC, POTENCIAL.oxigenio];
degraus.forEach((v, i) => i && conferir(v > degraus[i - 1], "potenciais fora de ordem"));
// A ordem dos alvos na missão final é a ordem da cadeia.
conferir(final.passos.map((p) => p.certos[0]).join() === "complexo-1,ubiquinona,complexo-3,citocromo,complexo-4,oxigenio,atp-sintase", "ordem da cadeia respiratória");
const rotulo = (id: string) => final.alvos.find((a) => a.id === id)!.rotulo;
conferir(rotulo("ubiquinona").includes(POTENCIAL.ubiquinona.toFixed(2).replace(".", ",")), "potencial da ubiquinona no rótulo");
conferir(rotulo("citocromo").includes(POTENCIAL.citocromoC.toFixed(2).replace(".", ",")), "potencial do citocromo no rótulo");
conferir(rotulo("oxigenio").includes(POTENCIAL.oxigenio.toFixed(2).replace(".", ",")), "potencial do O₂ no rótulo");

// Equação da respiração balanceada.
const contar = (lado: { c: number; f: Record<string, number> }[]) => {
  const t: Record<string, number> = {};
  for (const s of lado) for (const [el, n] of Object.entries(s.f)) t[el] = (t[el] ?? 0) + n * s.c;
  return t;
};
const r = contar(EQUACAO_RESPIRACAO.reagentes);
const p = contar(EQUACAO_RESPIRACAO.produtos);
for (const el of new Set([...Object.keys(r), ...Object.keys(p)])) conferir(r[el] === p[el], `equação desbalanceada em ${el}: ${r[el]} x ${p[el]}`);

// Genética: as contas dos desafios, feitas de novo aqui.
conferir(transcrever("TAC GGA TTC") === "AUG CCU AAG", "transcrição do molde");
conferir(certa("nucleo-transcricao") === transcrever("TAC GGA TTC"), "resposta da transcrição");
conferir(transcrever("TAC") === MISSOES[1].alvos.find((a) => a.id === "rna-certo")!.rotulo, "alvo do RNAm na missão do núcleo");
conferir(certa("nucleo-chargaff") === `${(100 - 2 * 30) / 2}%`, "regra de Chargaff");
conferir(certa("ribossomo-conta") === String(nucleotideosDaProteina(150)), "contagem de nucleotídeos");
conferir(CODIGO.GAA === CODIGO.GAG, "GAA e GAG precisam codificar o mesmo aminoácido");
const ribo = MISSOES.find((m) => m.id === "ribossomo")!;
([["AUG", "trna-uac", "Metionina"], ["UUU", "trna-aaa", "Fenilalanina"], ["GGC", "trna-ccg", "Glicina"]] as const).forEach(([codon, alvo, aminoacido], i) => {
  const a = ribo.alvos.find((x) => x.id === alvo)!;
  conferir(a.rotulo === `RNAt ${anticodon(codon)}`, `anticódon de ${codon}: rótulo ${a.rotulo}`);
  conferir(CODIGO[codon] === aminoacido, `código genético: ${codon}`);
  conferir(ribo.passos[i].pedido.includes(codon) && ribo.passos[i].certos[0] === alvo, `passo do códon ${codon}`);
  conferir(ribo.passos[i].aoCompletar.toLowerCase().includes(aminoacido.toLowerCase()), `explicação do aminoácido ${aminoacido}`);
});

// Óptica: um fóton azul tem mais energia que um vermelho, na razão inversa do comprimento de onda.
conferir(perto(razaoFotons(450, 680), 1.5, 0.02), "razão de energia dos fótons");
conferir(certa("cloroplasto-foton").includes("1,5"), "resposta da energia do fóton");
const clo = MISSOES.find((m) => m.id === "cloroplasto")!;
conferir(clo.passos[0].certos.every((c) => /azul|verm/.test(c)) && clo.passos[0].confusoes?.join() === "luz-verde-1", "clorofila absorve azul e vermelho, não verde");
// Coerência com biologia vegetal: não há bomba de sódio e potássio, e a célula é vegetal.
conferir(!/s[óo]dio|Na⁺/i.test(textos(MISSOES[0]).join(" ")), "missão da membrana: em planta, a bomba citada é a de prótons");
conferir(/c[ée]lula vegetal/i.test(MISSOES[0].abertura) && /parede/i.test(MISSOES[0].abertura), "a abertura precisa dizer que é célula vegetal, com parede");

// Regras: joga a partida inteira de vários jeitos.
function jogar(tentarErrado: boolean, responderErradoAntes: boolean): Partida {
  let pa = novaPartida(() => 0.42);
  let guarda = 0;
  while (pa.etapa !== "fim" && guarda++ < 1000) {
    if (pa.etapa === "viagem") pa = chegar(pa);
    else if (pa.etapa === "abertura") pa = comecarMissao(pa);
    else if (pa.etapa === "alvos") {
      const passo = MISSOES[pa.m].passos[pa.passo];
      const ativos = alvosAtivos(pa).map((a) => a.id);
      for (const c of passo.certos) if (!pa.feitos.includes(c)) conferir(ativos.includes(c), `${MISSOES[pa.m].id}: alvo certo "${c}" fora do mundo`);
      for (const c of passo.confusoes ?? []) conferir(ativos.includes(c), `${MISSOES[pa.m].id}: confusão "${c}" fora do mundo`);
      if (tentarErrado && passo.confusoes?.length) {
        const antes = pa.pontos;
        const t = tocarAlvo(pa, passo.confusoes[0]);
        conferir(t.resultado === "errado" && t.mensagem.length > 0, `${MISSOES[pa.m].id}: toque errado sem mensagem`);
        conferir(t.partida.pontos === Math.max(0, antes - PONTOS.erroAlvo), "penalidade de toque errado");
        pa = t.partida;
      }
      const falta = passo.certos.find((c) => !pa.feitos.includes(c))!;
      const t = tocarAlvo(pa, falta);
      conferir(t.resultado === "certo", `${MISSOES[pa.m].id}: toque certo em "${falta}"`);
      conferir(tocarAlvo(t.partida, falta).resultado !== "certo", `${MISSOES[pa.m].id}: mesmo alvo pontuou duas vezes`);
      pa = t.partida;
    } else if (pa.etapa === "desafio") {
      const d = desafioAtual(pa)!;
      conferir(d.opcoes[d.certa] === MISSOES[pa.m].desafios.find((x) => x.id === d.id)!.opcoes[MISSOES[pa.m].desafios.find((x) => x.id === d.id)!.certa], `${d.id}: embaralhar perdeu a resposta`);
      if (responderErradoAntes) {
        const r1 = responder(pa, (d.certa + 1) % d.opcoes.length);
        conferir(!r1.certa && !r1.encerrou, "primeira tentativa errada não encerra");
        pa = r1.partida;
      }
      pa = responder(pa, d.certa).partida;
      pa = proximoDesafio(pa);
    }
  }
  conferir(pa.etapa === "fim", "a partida não chegou ao fim");
  return pa;
}
const perfeita = jogar(false, false);
conferir(perfeita.pontos === pontuacaoMaxima(), `pontuação perfeita ${perfeita.pontos}, máximo ${pontuacaoMaxima()}`);
conferir(perfeita.acertos === MISSOES.reduce((s, m) => s + m.quantosDesafios, 0), "acertos da partida perfeita");
const comErros = jogar(true, true);
conferir(comErros.pontos < perfeita.pontos && comErros.pontos > 0, "errar precisa custar pontos sem zerar a partida");
// Duas tentativas erradas revelam a resposta, sem pontos.
{
  let pa = novaPartida(() => 0.42);
  pa = comecarMissao(pa);
  while (pa.etapa === "alvos") {
    const f = MISSOES[0].passos[pa.passo].certos.find((c) => !pa.feitos.includes(c))!;
    pa = tocarAlvo(pa, f).partida;
  }
  const d = desafioAtual(pa)!;
  const errada = (d.certa + 1) % d.opcoes.length;
  const antes = pa.pontos;
  const a = responder(pa, errada);
  const b = responder(a.partida, errada);
  conferir(b.encerrou && !b.certa && b.partida.pontos === antes, "duas erradas encerram sem pontos");
  conferir(proximoDesafio(b.partida).m === 1, "depois de revelar, segue para a próxima missão");
}

// Mapa: nada nasce dentro de uma parede ou fora da célula.
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const raioAlvo = 1.7;
const validarPonto = (nome: string, q: V3) => {
  conferir(Math.hypot(...q) < LIMITE_NAVE, `${nome} fora da célula`);
  for (const c of COLISORES) conferir(dist(q, c.c) >= c.r + RAIO_NAVE - raioAlvo, `${nome} dentro de um obstáculo (${c.c})`);
};
for (const [id, q] of Object.entries(POSICOES)) validarPonto(id, q);
for (const [id, q] of Object.entries(POUSOS)) validarPonto(`pouso ${id}`, q);
validarPonto("início", INICIO.pos);
for (const [id, q] of Object.entries(POSICOES_CRISTA)) {
  conferir(Math.abs(q[0]) < LIMITE_CRISTA.x && Math.abs(q[2]) < LIMITE_CRISTA.z && q[1] >= LIMITE_CRISTA.yMin && q[1] <= LIMITE_CRISTA.yMax, `${id} fora da crista`);
  for (const c of COLISORES_CRISTA) conferir(dist(q, c.c) >= c.r + RAIO_NAVE - 3.2, `${id} dentro de uma proteína`);
}
for (const m of MISSOES) {
  conferir(!!POUSOS[m.id], `${m.id}: sem ponto de chegada`);
  const mapa = m.id === "cadeia" ? POSICOES_CRISTA : POSICOES;
  for (const a of m.alvos) conferir(!!mapa[a.id], `${m.id}: alvo "${a.id}" sem posição`);
  // Alvos do mesmo passo precisam dar para distinguir um do outro.
  for (const pa of m.passos) {
    const lista = [...pa.certos, ...(pa.confusoes ?? [])];
    for (let i = 0; i < lista.length; i++) for (let j = i + 1; j < lista.length; j++) conferir(dist(mapa[lista[i]], mapa[lista[j]]) > 6, `${m.id}: "${lista[i]}" e "${lista[j]}" muito próximos`);
  }
}

// Registro: jogo na lista, carimbo no passaporte, ids do catálogo existentes.
const catalogo = JSON.parse(readFileSync(join(process.cwd(), "data/oportunidades.json"), "utf8")) as { id: string; areas: string[] }[];
const ids = new Set(catalogo.map((o) => o.id));
const jogo = JOGOS.find((j) => j.slug === "nave-celular");
conferir(!!jogo, "jogo fora de src/lib/jogos.ts");
if (jogo) {
  for (const id of jogo.oportunidades) {
    conferir(ids.has(id), `"${id}" não existe em oportunidades.json`);
    conferir(catalogo.find((o) => o.id === id)?.areas.includes("Ciências da Natureza") ?? false, `"${id}" não é de ciências da natureza`);
  }
  conferir(ids.has(jogo.principal) && jogo.oportunidades.includes(jogo.principal), "ficha principal do jogo");
  conferir(["obb", "onc"].every((id) => jogo.oportunidades.includes(id)), "o jogo precisa aparecer na OBB e na ONC");
  for (const t of [jogo.titulo, jogo.olimpiada, jogo.resumo, jogo.como]) conferir(!SEM_TRAVESSAO.test(t), `travessão em "${t}"`);
}
conferir(readFileSync("src/lib/guia.ts", "utf8").includes('id: "nave-celular"'), "falta o carimbo em CARIMBOS");
conferir(readFileSync("src/app/jogos/[slug]/JogoCliente.tsx", "utf8").includes('"nave-celular"'), "falta o jogo em JogoCliente.tsx");

// Código: Three.js só pode entrar por import dinâmico, e nenhum texto de tela com travessão.
const pasta = "src/components/jogos/celula";
const tela = readFileSync(join(pasta, "NaveCelular.tsx"), "utf8");
conferir(!/^import\s+[^;]*from\s+"three"/m.test(tela), "a tela não pode importar three direto");
conferir(!/^import\s+\{[^}]*MotorCelula[^}]*\}\s+from\s+"\.\/motor"/m.test(tela.replace(/import type[^\n]*\n/g, "")), "o motor só pode entrar por import dinâmico");
conferir(tela.includes('await import("./motor")'), "motor sem import dinâmico");
for (const f of [...readdirSync(pasta).map((a) => join(pasta, a)), "src/lib/estudo/celula.ts"]) {
  const fonte = readFileSync(f, "utf8");
  conferir(!SEM_TRAVESSAO.test(fonte), `travessão em ${f}`);
}
// Regra de memória e de movimento reduzido: se sumirem, o jogo volta a vazar ou a enjoar.
const motor = readFileSync(join(pasta, "motor.ts"), "utf8");
for (const trecho of ["forceContextLoss", "visibilitychange", "prefers-reduced-motion", "Math.max(dprPiso"]) conferir(motor.includes(trecho), `motor perdeu: ${trecho}`);

if (erros.length) {
  console.error(erros.map((e) => `✗ ${e}`).join("\n"));
  console.error(`\n${erros.length} problema(s).`);
  process.exit(1);
}
console.log(`Nave Celular ok: ${MISSOES.length} missões, ${idsDesafio.length} desafios, ${Object.keys(POSICOES).length + Object.keys(POSICOES_CRISTA).length} alvos no mapa.`);
