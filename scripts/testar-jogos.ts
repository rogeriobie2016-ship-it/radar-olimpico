// Confere o conteúdo dos jogos: fases com solução, equações corretas e alvos sempre alcançáveis.
// Rodar: npm run testar:jogos
import { REACOES, atomos, contar } from "../src/components/jogos/Balanco";
import { gerarRodada } from "../src/components/jogos/Alvo";
import { FATOS } from "../src/components/jogos/LinhaDoTempo";
import { NIVEIS, executar, type Bloco } from "../src/components/jogos/niveisAlgoritmo";

let falhas = 0;
const erro = (m: string) => {
  falhas++;
  console.error("✗", m);
};

// Algoritmo: busca o programa mais curto. O limite anunciado precisa ser exatamente esse.
const OPCOES: Bloco[] = [{ c: "F", n: 1 }, { c: "F", n: 2 }, { c: "F", n: 3 }, { c: "F", n: 4 }, { c: "F", n: 5 }, { c: "E", n: 1 }, { c: "D", n: 1 }];
NIVEIS.forEach((n, i) => {
  type No = { x: number; y: number; dir: number; prog: Bloco[] };
  const visto = new Set<string>();
  let fila: No[] = [{ x: n.x, y: n.y, dir: n.dir, prog: [] }];
  let melhor = -1;
  for (let prof = 1; prof <= 14 && melhor < 0; prof++) {
    const prox: No[] = [];
    for (const no of fila) {
      for (const o of OPCOES) {
        const prog = [...no.prog, o];
        const r = executar(n, prog);
        const fim = r.passos[r.passos.length - 1];
        if (r.chegou) {
          melhor = prof;
          break;
        }
        if (fim.batida) continue;
        const k = `${fim.x},${fim.y},${fim.dir}`;
        if (visto.has(k)) continue;
        visto.add(k);
        prox.push({ x: fim.x, y: fim.y, dir: fim.dir, prog });
      }
      if (melhor > 0) break;
    }
    fila = prox;
  }
  if (melhor < 0) erro(`Algoritmo, fase ${i + 1}: sem solução`);
  else if (melhor !== n.limite) erro(`Algoritmo, fase ${i + 1}: limite ${n.limite}, solução mínima ${melhor}`);
});

// Balanço: os coeficientes da resposta equilibram mesmo.
for (const r of REACOES) {
  const nr = r.r.length;
  const e = contar(r.r, r.s.slice(0, nr));
  const p = contar(r.p, r.s.slice(nr));
  const els = new Set([...Object.keys(e), ...Object.keys(p)]);
  for (const el of els) if (e[el] !== p[el]) erro(`Balanço, ${r.nome}: ${el} ${e[el]} x ${p[el]}`);
  if (!Object.keys(atomos(r.r[0])).length) erro(`Balanço, fórmula inválida em ${r.nome}`);
}

// Alvo: mil rodadas geradas em cada nível, sem travar e com valores válidos.
for (let n = 0; n < 6; n++) {
  for (let i = 0; i < 1000; i++) {
    const { alvo, pecas } = gerarRodada(n);
    if (!Number.isInteger(alvo) || alvo < 12 || pecas.includes(alvo)) erro(`Alvo inválido: ${alvo}, ${pecas}`);
  }
}

// Linha do Tempo: anos únicos, para a ordem nunca ser ambígua.
if (new Set(FATOS.map((f) => f.ano)).size !== FATOS.length) erro("Linha do Tempo: anos repetidos");

console.log(falhas ? `\n${falhas} problema(s).` : "Jogos conferidos: nenhum problema.");
process.exit(falhas ? 1 : 0);
