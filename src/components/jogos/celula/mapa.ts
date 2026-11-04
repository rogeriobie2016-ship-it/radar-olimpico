// Onde cada coisa fica na célula. Sem Three.js, para o teste poder conferir que nada nasce dentro de uma parede.
import type { CorAlvo, IdMissao } from "@/lib/estudo/celula";

export type V3 = [number, number, number];

export const CORES_ALVO: Record<CorAlvo, string> = {
  ciano: "#3df2ff",
  ambar: "#ffb43a",
  rosa: "#ff5fc8",
  verde: "#4dff8a",
  violeta: "#a98bff",
  azul: "#4f9dff",
  vermelho: "#ff4a3a",
  branco: "#eafcff",
};
export type Colisor = { c: V3; r: number };

export const RAIO_CELULA = 92;
export const LIMITE_NAVE = RAIO_CELULA - 7;
export const RAIO_NAVE = 1.4;

export const INICIO: { pos: V3; yaw: number } = { pos: [3, -2, 58], yaw: Math.PI };
export const CRISTA_INICIO: { pos: V3; yaw: number } = { pos: [0, 15, 44], yaw: 0 };

export const NUCLEO = { c: [-6, 2, -6] as V3, r: 18 };
export const VACUOLO = { c: [-52, -16, 22] as V3, r: 22 };
export const GOLGI = { c: [40, -8, -46] as V3, r: 8 };
/** O retículo envolve o núcleo por este lado. */
export const RETICULO_DIRECAO: V3 = [0.72, 0.1, -0.68];
export const POLISSOMO = { c: [14, -44, 22] as V3 };

export type Corpo = { c: V3; yaw: number; pitch: number; escala: number };
// O primeiro de cada lista é a organela da missão.
export const MITOCONDRIAS: Corpo[] = [
  { c: [38, 28, 32], yaw: 0.5, pitch: 0.3, escala: 1 },
  { c: [56, -6, 44], yaw: 1.7, pitch: -0.4, escala: 0.8 },
  { c: [18, 58, 26], yaw: 2.4, pitch: 0.7, escala: 0.75 },
  { c: [-16, -60, -6], yaw: 0.2, pitch: 1.0, escala: 0.85 },
  { c: [-30, -44, 54], yaw: 1.1, pitch: -0.9, escala: 0.7 },
  { c: [58, 18, -22], yaw: 2.9, pitch: 0.2, escala: 0.75 },
];
export const CLOROPLASTOS: Corpo[] = [
  { c: [-32, 44, -38], yaw: 0.9, pitch: 0.15, escala: 1 },
  { c: [-64, 22, -16], yaw: 2.1, pitch: -0.5, escala: 0.8 },
  { c: [-8, 68, -26], yaw: 0.3, pitch: 0.6, escala: 0.75 },
  { c: [-50, 2, -56], yaw: 1.4, pitch: 0.9, escala: 0.85 },
  { c: [10, 34, -68], yaw: 2.7, pitch: -0.2, escala: 0.7 },
];

// Partes alongadas viram duas esferas ao longo do corpo; basta para a nave deslizar por fora.
const eixo = (b: Corpo): V3 => [Math.cos(b.pitch) * Math.cos(b.yaw), Math.sin(b.pitch), -Math.cos(b.pitch) * Math.sin(b.yaw)];
const naPonta = (b: Corpo, d: number): V3 => {
  const e = eixo(b);
  return [b.c[0] + e[0] * d * b.escala, b.c[1] + e[1] * d * b.escala, b.c[2] + e[2] * d * b.escala];
};

export const COLISORES: Colisor[] = [
  { c: NUCLEO.c, r: NUCLEO.r + 0.6 },
  { c: VACUOLO.c, r: VACUOLO.r + 0.5 },
  { c: GOLGI.c, r: GOLGI.r },
  ...MITOCONDRIAS.flatMap((b) => [{ c: naPonta(b, -5.5), r: 6.6 * b.escala }, { c: naPonta(b, 5.5), r: 6.6 * b.escala }]),
  ...CLOROPLASTOS.flatMap((b) => [{ c: naPonta(b, -5), r: 7.6 * b.escala }, { c: naPonta(b, 5), r: 7.6 * b.escala }]),
];

export const POSICOES: Record<string, V3> = {
  // Membrana
  bicamada: [-15, 5, 78],
  aquaporina: [0, -4, 80],
  bomba: [15, 6, 77],
  // Núcleo
  "rna-certo": [-14, 12, 19],
  "rna-t": [-1, 4, 23],
  "rna-igual": [10, -6, 18],
  "poro-1": [1.2, 11.2, 11.4],
  "poro-2": [-17, 4, 12.5],
  // Ribossomos
  "trna-uac": [2, -36, 32],
  "trna-aaa": [18, -32, 40],
  "trna-ccg": [28, -40, 26],
  "trna-ggc": [12, -52, 40],
  // Retículo
  "re-entrada": [17, 14, -19],
  "re-canal": [26, 8, -30],
  "re-vesicula": [29, 0, -37],
  "re-golgi": [28, -6, -45],
  // Cloroplasto
  "luz-azul-1": [-44, 30, -22],
  "luz-azul-2": [-14, 48, -24],
  "luz-verm-1": [-16, 28, -36],
  "luz-verm-2": [-48, 50, -24],
  "luz-verde-1": [-30, 24, -24],
  tilacoide: [-32, 42, -22],
  // Mitocôndria
  "piruvato-1": [20, 32, 26],
  "piruvato-2": [42, 12, 26],
  glicose: [20, 12, 34],
  matriz: [28, 24, 22],
};

/** Ponto de chegada de cada viagem. */
export const POUSOS: Record<IdMissao, V3> = {
  membrana: [3, -2, 64],
  nucleo: [-3, 6, 30],
  ribossomo: [12, -30, 28],
  reticulo: [13, 18, -13],
  cloroplasto: [-27, 30, -20],
  mitocondria: [26, 18, 18],
  cadeia: [38, 28, 16],
};

/** Onde a câmera olha quando a missão é apresentada. */
export const FOCOS: Record<IdMissao, { c: V3; d: number; a?: number; el?: number }> = {
  membrana: { c: [0, 0, 84], d: 27, a: Math.PI + 0.25, el: 0.1 },
  nucleo: { c: NUCLEO.c, d: 42, a: 0.15, el: 0.16 },
  ribossomo: { c: POLISSOMO.c, d: 25, a: 0.5, el: 0.34 },
  reticulo: { c: [14, 6, -24], d: 28, a: 1.05, el: 0.32 },
  cloroplasto: { c: CLOROPLASTOS[0].c, d: 25, a: 0.9, el: -0.06 },
  mitocondria: { c: MITOCONDRIAS[0].c, d: 25, a: 0.5 + Math.PI, el: 0.08 },
  cadeia: { c: [0, 6, 0], d: 42, a: 0.2, el: 0.2 },
};

// A crista é uma outra cena, com o chão em y = 0: uma membrana com as proteínas enfiadas.
export const LIMITE_CRISTA = { x: 62, z: 62, yMin: 5, yMax: 38 };
export const POSICOES_CRISTA: Record<string, V3> = {
  "complexo-1": [-30, 13, 18],
  ubiquinona: [-8, 7, 30],
  "complexo-3": [10, 12, 8],
  citocromo: [-16, 10, -8],
  "complexo-4": [28, 13, -14],
  oxigenio: [4, 17, -30],
  "atp-sintase": [-32, 14, -32],
};
export const COLISORES_CRISTA: Colisor[] = [
  { c: [-30, 4, 18], r: 8 },
  { c: [10, 3, 8], r: 7 },
  { c: [28, 3, -14], r: 7 },
  { c: [-32, 4, -32], r: 7 },
];

export const CURIOSOS: Record<string, { c: V3; r: number }> = {
  vacuolo: { c: VACUOLO.c, r: VACUOLO.r + 16 },
  golgi: { c: GOLGI.c, r: GOLGI.r + 13 },
  microtubulo: { c: [0, 2, 40], r: 12 },
};
