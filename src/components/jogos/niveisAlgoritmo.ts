export type Nivel = { tam: number; x: number; y: number; dir: number; ax: number; ay: number; paredes: [number, number][]; limite: number };

// dir: 0 cima, 1 direita, 2 baixo, 3 esquerda. O limite é o menor número de blocos, verificado por scripts/testar-jogos.ts.
export const NIVEIS: Nivel[] = [
  { tam: 5, x: 0, y: 2, dir: 1, ax: 4, ay: 2, paredes: [], limite: 1 },
  { tam: 5, x: 0, y: 4, dir: 1, ax: 3, ay: 1, paredes: [], limite: 3 },
  { tam: 5, x: 0, y: 4, dir: 0, ax: 4, ay: 0, paredes: [[2, 2], [2, 3], [2, 4]], limite: 3 },
  { tam: 6, x: 0, y: 5, dir: 1, ax: 5, ay: 0, paredes: [[2, 5], [2, 4], [2, 3], [4, 0], [4, 1], [4, 2]], limite: 10 },
  { tam: 6, x: 0, y: 0, dir: 1, ax: 0, ay: 5, paredes: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3]], limite: 7 },
  { tam: 6, x: 2, y: 5, dir: 0, ax: 3, ay: 0, paredes: [[2, 2], [3, 2], [4, 2], [1, 4], [3, 4], [0, 1], [1, 1]], limite: 6 },
  { tam: 7, x: 0, y: 6, dir: 1, ax: 6, ay: 0, paredes: [[1, 5], [2, 5], [3, 5], [5, 6], [5, 5], [5, 4], [1, 3], [2, 3], [3, 3], [4, 3], [3, 1], [4, 1], [5, 1], [6, 1]], limite: 6 },
];

export type Bloco = { c: "F" | "E" | "D"; n: number };
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

/** Executa o programa e devolve cada posição. Serve para o jogo e para o teste. */
export function executar(nivel: Nivel, programa: Bloco[]) {
  const paredes = new Set(nivel.paredes.map(([a, b]) => `${a},${b}`));
  let { x, y, dir } = nivel;
  const passos = [{ x, y, dir, batida: false }];
  for (const b of programa) {
    for (let i = 0; i < b.n; i++) {
      if (b.c === "E") dir = (dir + 3) % 4;
      else if (b.c === "D") dir = (dir + 1) % 4;
      else {
        const nx = x + DX[dir];
        const ny = y + DY[dir];
        if (nx < 0 || ny < 0 || nx >= nivel.tam || ny >= nivel.tam || paredes.has(`${nx},${ny}`)) {
          passos.push({ x, y, dir, batida: true });
          return { passos, chegou: false };
        }
        x = nx;
        y = ny;
      }
      passos.push({ x, y, dir, batida: false });
      if (x === nivel.ax && y === nivel.ay) return { passos, chegou: true };
    }
  }
  return { passos, chegou: x === nivel.ax && y === nivel.ay };
}
