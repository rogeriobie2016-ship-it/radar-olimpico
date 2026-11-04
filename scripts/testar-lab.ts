// Confere o que o Laboratório Vivo afirma: ids do catálogo, contas dos experimentos e se todo desafio tem solução.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALVO_PERIODO, BATERIA, carater, DELTA, ESTACOES, ETAPAS_PESQUISA, FATOS, GRADE_ROBO, INICIO_ROBO, minutosLuz, periodo, PLANETAS, rodarPrograma, saldo, SEQUENCIAS, SUBSTANCIAS, TOLERANCIA_PERIODO, type Comando } from "../src/lab/estacoes";

const erros: string[] = [];
const conferir = (ok: boolean, msg: string) => void (ok || erros.push(msg));

const catalogo = JSON.parse(readFileSync(join(process.cwd(), "data/oportunidades.json"), "utf8")) as { id: string }[];
const ids = new Set(catalogo.map((o) => o.id));
for (const e of ESTACOES) {
  for (const id of e.olimpiadas) conferir(ids.has(id), `${e.id}: "${id}" não existe em oportunidades.json`);
  for (const t of [e.convite, e.concluido, e.nome]) conferir(!/[—–]/.test(t), `${e.id}: travessão em "${t}"`);
}
conferir(new Set(ESTACOES.map((e) => e.id)).size === ESTACOES.length, "estações com id repetido");

// Física: um pêndulo de cerca de 1 m tem período de 2 s, e a meta precisa estar ao alcance da faixa do controle.
conferir(Math.abs(periodo(0.993) - 2) < 0.002, "período do pêndulo de 0,993 m");
conferir(periodo(0.25) < ALVO_PERIODO - TOLERANCIA_PERIODO && periodo(1.5) > ALVO_PERIODO + TOLERANCIA_PERIODO, "meta do pêndulo fora da faixa do controle");

// Astronomia: luz do Sol até a Terra leva cerca de 8,3 minutos. Planetas em ordem de distância.
conferir(Math.abs(minutosLuz(1) - 8.3) < 0.1, "tempo de luz até a Terra");
PLANETAS.forEach((p, i) => i && conferir(p.ua > PLANETAS[i - 1].ua, `ordem dos planetas: ${p.nome}`));

// Química
conferir(carater(2) === "ácido" && carater(7) === "neutro" && carater(10) === "básico", "caráter do pH");
conferir(new Set(SUBSTANCIAS.map((s) => s.cor)).size === SUBSTANCIAS.length, "substâncias com a mesma cor");

// Matemática: a resposta certa está entre as opções e segue a regra de cada sequência.
for (const s of SEQUENCIAS) conferir(s.opcoes.includes(s.certa), `sequência sem a resposta: ${s.numeros}`);
const [fib, tri, pot] = SEQUENCIAS;
conferir(fib.certa === fib.numeros.at(-1)! + fib.numeros.at(-2)!, "Fibonacci");
conferir(tri.certa - tri.numeros.at(-1)! === tri.numeros.at(-1)! - tri.numeros.at(-2)! + 1, "triangulares");
conferir(pot.certa === pot.numeros.at(-1)! * 2, "potências de 2");

// Finanças: com 1% ao mês, dobra no mês 70, dentro da faixa do controle (0 a 100).
conferir(saldo(69) < 200 && saldo(70) >= 200, "juros compostos: mês em que dobra");

// História em ordem
FATOS.forEach((f, i) => i && conferir(f.ano > FATOS[i - 1].ano, `fatos fora de ordem: ${f.texto}`));
conferir(FATOS.some((f) => f.ano === 1884) && FATOS.some((f) => f.ano === 1888), "abolição no Ceará e Lei Áurea");
conferir(new Set(ETAPAS_PESQUISA).size === ETAPAS_PESQUISA.length, "etapas repetidas");

// Robótica: busca em largura. O desafio precisa ter solução dentro do limite de 12 comandos.
const fila: { x: number; y: number; p: Comando[] }[] = [{ ...INICIO_ROBO, p: [] }];
const vistos = new Set([`${INICIO_ROBO.x},${INICIO_ROBO.y}`]);
let solucao: Comando[] | null = null;
while (fila.length && !solucao) {
  const a = fila.shift()!;
  if (a.x === BATERIA.x && a.y === BATERIA.y) solucao = a.p;
  for (const c of Object.keys(DELTA) as Comando[]) {
    const x = a.x + DELTA[c].x;
    const y = a.y + DELTA[c].y;
    if (GRADE_ROBO[y]?.[x] !== 0 || vistos.has(`${x},${y}`)) continue;
    vistos.add(`${x},${y}`);
    fila.push({ x, y, p: [...a.p, c] });
  }
}
conferir(!!solucao && solucao.length <= 12, "robô sem solução em até 12 comandos");
if (solucao) conferir(rodarPrograma(solucao).chegou, "o programa da solução não chega à bateria");
conferir(rodarPrograma(["esquerda"]).bateu, "sair da grade deveria contar como batida");

if (erros.length) {
  console.error("Laboratório com problemas:\n" + erros.map((e) => `  ${e}`).join("\n"));
  process.exit(1);
}
console.log(`Laboratório conferido: ${ESTACOES.length} equipamentos, solução do robô com ${solucao!.length} comandos.`);
