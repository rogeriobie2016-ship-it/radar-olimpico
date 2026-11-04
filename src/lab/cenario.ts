import * as THREE from "three";
import { caixa, capsula, cilindro, esfera, Lote, materialContorno, materialDesenho, torno, toro } from "./lote";
import { ESTACOES, periodo, type Estacao, type IdEstacao } from "./estacoes";

export const RAIO_SALA = 22;
export const RAIO_ESTACAO = 15.5;

export type PecaEstacao = {
  estacao: Estacao;
  grupo: THREE.Group;
  posicao: THREE.Vector3;
  /** Onde a pessoa fica para usar o equipamento. */
  ponto: THREE.Vector3;
  /** Para onde a câmera olha quando entra no experimento. */
  foco: THREE.Vector3;
  atualizar: (t: number, dt: number) => void;
  controles: Record<string, (v: unknown) => void>;
  anel: THREE.Mesh;
  seta: THREE.Object3D;
  logos: THREE.Group;
  logosCarregados: boolean;
};

export const TOON = () => materialDesenho();

function textura(tela: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(tela);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 12;
  return t;
}

function tela2d(l: number, a: number) {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = a;
  return { c, g: c.getContext("2d")! };
}

const familia = (v: string, reserva: string) => (typeof document === "undefined" ? reserva : getComputedStyle(document.documentElement).getPropertyValue(v).trim() || reserva);
const FONTE = () => `800 {t}px ${familia("--fonte-titulo", "'Trebuchet MS', sans-serif")}`;

function chao(pecas: { cor: string; angulo: number }[]) {
  const T = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 2048 : 4096;
  const { c, g } = tela2d(T, T);
  const m = T / 2;
  const fundo = g.createRadialGradient(m, m, 60, m, m, m);
  fundo.addColorStop(0, "#102b56");
  fundo.addColorStop(0.65, "#0a1b3c");
  fundo.addColorStop(1, "#060f24");
  g.fillStyle = fundo;
  g.fillRect(0, 0, T, T);
  const u = m / RAIO_SALA;
  // Malha do laboratório
  g.strokeStyle = "rgba(127,245,239,.055)";
  g.lineWidth = T / 1024;
  for (let i = -RAIO_SALA; i <= RAIO_SALA; i += 2) {
    g.beginPath();
    g.moveTo(m + i * u, 0);
    g.lineTo(m + i * u, T);
    g.moveTo(0, m + i * u);
    g.lineTo(T, m + i * u);
    g.stroke();
  }
  // Anéis
  for (const [r, cor, l] of [[4.1, "rgba(253,193,63,.75)", 7], [9, "rgba(0,201,200,.3)", 5], [RAIO_SALA - 0.8, "rgba(0,201,200,.5)", 8]] as const) {
    g.strokeStyle = cor;
    g.lineWidth = l;
    g.beginPath();
    g.arc(m, m, r * u, 0, Math.PI * 2);
    g.stroke();
  }
  // Caminhos coloridos até cada equipamento. Dá para seguir sem mapa.
  for (const p of pecas) {
    const x = Math.sin(p.angulo);
    const z = Math.cos(p.angulo);
    g.strokeStyle = p.cor;
    g.globalAlpha = 0.5;
    g.lineWidth = 0.22 * u;
    g.setLineDash([]);
    g.beginPath();
    g.moveTo(m + x * 4.4 * u, m + z * 4.4 * u);
    g.lineTo(m + x * (RAIO_ESTACAO - 3.9) * u, m + z * (RAIO_ESTACAO - 3.9) * u);
    g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 0.14;
    g.fillStyle = p.cor;
    g.beginPath();
    g.arc(m + x * RAIO_ESTACAO * u, m + z * RAIO_ESTACAO * u, 3.9 * u, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = p.cor;
    g.lineWidth = (T / 2048) * 4;
    g.beginPath();
    g.arc(m + x * RAIO_ESTACAO * u, m + z * RAIO_ESTACAO * u, 3.9 * u, 0, Math.PI * 2);
    g.stroke();
  }
  const piso = new THREE.Mesh(new THREE.CircleGeometry(RAIO_SALA, 128), new THREE.MeshStandardMaterial({ map: textura(c), roughness: 0.42, metalness: 0.08, envMapIntensity: 0.35 }));
  piso.receiveShadow = true;
  piso.rotation.x = -Math.PI / 2;
  // O círculo do three tem a textura mapeada no plano XY: girar leva +Y da textura para -Z do mundo.
  return piso;
}

function ceu() {
  const grupo = new THREE.Group();
  const { c, g } = tela2d(32, 256);
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#05102a");
  gr.addColorStop(0.5, "#0d2a5c");
  gr.addColorStop(1, "#071a3a");
  g.fillStyle = gr;
  g.fillRect(0, 0, 32, 256);
  grupo.add(new THREE.Mesh(new THREE.SphereGeometry(180, 24, 12), new THREE.MeshBasicMaterial({ map: textura(c), side: THREE.BackSide, fog: false })));

  const n = 900;
  const pos = new Float32Array(n * 3);
  const cor = new Float32Array(n * 3);
  const paleta = [new THREE.Color("#ffffff"), new THREE.Color("#fdc13f"), new THREE.Color("#3ee8e6")];
  for (let i = 0; i < n; i++) {
    const a = ((i * 2654435761) % 4294967296) / 4294967296;
    const b = ((i * 340573321) % 4294967296) / 4294967296;
    const fi = a * Math.PI * 2;
    const y = b * 0.95 + 0.02;
    const r = Math.sqrt(1 - y * y) * 160;
    pos.set([Math.cos(fi) * r, y * 160, Math.sin(fi) * r], i * 3);
    cor.set(paleta[i % 3].toArray(), i * 3);
  }
  const gp = new THREE.BufferGeometry();
  gp.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  gp.setAttribute("color", new THREE.BufferAttribute(cor, 3));
  grupo.add(new THREE.Points(gp, new THREE.PointsMaterial({ size: 1.1, vertexColors: true, sizeAttenuation: true })));

  // Planeta com anéis e planeta azul, os mesmos da abertura do site
  const toon = TOON();
  const l = new Lote();
  l.add(esfera(13, 40, 28), "#f58a33", [55, 58, -80]);
  l.add(toro(21, 1, 48), "#fdc13f", [55, 58, -80], [1.25, 0.25, 0]);
  l.add(esfera(8, 20, 14), "#00b8b6", [-70, 38, 70]);
  l.add(esfera(2.2, 12, 8), "#f4fbff", [-55, 46, 62]);
  const astros = l.malha(toon);
  astros.traverse((o) => void (o.castShadow = o.receiveShadow = false));
  grupo.add(astros);
  return grupo;
}

function estrutura(toon: THREE.Material) {
  const l = new Lote();
  // Mureta com faixa de luz
  l.add(torno([[RAIO_SALA + 0.8, 0], [RAIO_SALA, 0], [RAIO_SALA, 1.5], [RAIO_SALA + 0.8, 1.5]], 72), "#123a70");
  // Pilares e nervuras da cúpula de vidro
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    if (i % 2 === 0) l.add(caixa(0.28, 7.5, 0.28), "#1d4f8c", [Math.sin(a) * RAIO_SALA, 5.2, Math.cos(a) * RAIO_SALA], [0, a, 0]);
    // Nervura da cúpula: um quarto de arco, achatado para a cúpula ficar baixa
    if (i % 2 === 0) l.add(toro(RAIO_SALA, 0.09, 18, Math.PI / 2), "#2a64a8", [0, 8.8, 0], [0, a - Math.PI / 2, 0], [1, 0.5, 1]);
  }
  // Anel de luz no alto
    l.add(toro(RAIO_SALA - 0.05, 0.14, 72), "#2a64a8", [0, 8.8, 0], [Math.PI / 2, 0, 0]);
  // Pódio central
  l.add(cilindro(3.4, 0.5, 40, 3.1), "#1d4f8c", [0, 0.25, 0]);
  l.add(cilindro(2.2, 0.35, 32, 2), "#fdc13f", [0, 0.67, 0]);
  // Plantas e bancos entre os equipamentos deixam o espaço vivo
  ESTACOES.forEach((_, i) => {
    const a = ((i + 0.5) / ESTACOES.length) * Math.PI * 2;
    const r = RAIO_SALA - 1.7;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    l.add(cilindro(0.45, 0.7, 10, 0.55), "#f58a33", [x, 0.35, z]);
    l.add(esfera(0.72, 8, 6), "#0fa85a", [x, 1.25, z]);
    l.add(esfera(0.5, 8, 6), "#2cc97a", [x + 0.25, 1.75, z + 0.1]);
    l.add(esfera(0.42, 8, 6), "#0d8c4c", [x - 0.3, 1.6, z - 0.15]);
  });
  const grupo = l.malha(toon);
  // Faixas de luz na mureta e no pódio
  const neon = new THREE.MeshBasicMaterial({ color: new THREE.Color("#00e5e3").multiplyScalar(1.7) });
  const faixa = new THREE.Mesh(new THREE.TorusGeometry(RAIO_SALA - 0.04, 0.05, 8, 144), neon);
  faixa.rotation.x = Math.PI / 2;
  faixa.position.y = 1.56;
  const faixaPodio = new THREE.Mesh(new THREE.TorusGeometry(3.42, 0.035, 8, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color("#fdc13f").multiplyScalar(1.7) }));
  faixaPodio.rotation.x = Math.PI / 2;
  faixaPodio.position.y = 0.06;
  grupo.add(faixa, faixaPodio);
  return grupo;
}

function placaNome(e: Estacao) {
  const { c, g } = tela2d(1024, 400);
  g.scale(2, 2);
  g.fillStyle = e.cor;
  g.beginPath();
  g.roundRect(0, 0, 512, 200, 44);
  g.fill();
  g.fillStyle = "rgba(0,0,0,.14)";
  g.beginPath();
  g.roundRect(0, 172, 512, 28, [0, 0, 44, 44]);
  g.fill();
  g.fillStyle = e.tinta;
  g.textAlign = "center";
  let t = 58;
  g.font = FONTE().replace("{t}", String(t));
  while (g.measureText(e.nome.toUpperCase()).width > 470 && t > 28) {
    t -= 2;
    g.font = FONTE().replace("{t}", String(t));
  }
  g.fillText(e.nome.toUpperCase(), 256, 92);
  g.font = `700 34px ${familia("--fonte-texto", "'Trebuchet MS', sans-serif")}`;
  g.fillText(e.campo, 256, 142);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: textura(c), depthWrite: false }));
  sp.scale.set(4.3, 1.68, 1);
  return sp;
}

function selo() {
  // Seta animada acima do equipamento: "é aqui".
  const l = new Lote();
  l.add(new THREE.ConeGeometry(0.34, 0.6, 4), "#fdc13f", [0, 0, 0], [Math.PI, Math.PI / 4, 0]);
  return l.malha(new THREE.MeshBasicMaterial({ vertexColors: true }));
}

// ---------------------------------------------------------------- equipamentos

type Equip = { grupo: THREE.Group; atualizar?: (t: number, dt: number) => void; controles?: Record<string, (v: unknown) => void>; foco?: number };
type Mats = { toon: THREE.Material; contorno: THREE.Material | null; vidro: THREE.Material };

function mesa(l: Lote, largura = 4, cor = "#e8eef2") {
  l.add(caixa(largura, 0.18, 1.8), cor, [0, 1.05, 0]);
  for (const x of [-1, 1]) for (const z of [-1, 1]) l.add(cilindro(0.08, 1.05, 8), "#6d7a84", [(x * largura) / 2.3, 0.52, z * 0.72]);
}

function telescopio(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    l.add(cilindro(0.09, 2.5, 8), "#6d7a84", [Math.sin(a) * 0.62, 1.15, Math.cos(a) * 0.62], [-Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]);
  }
  l.add(esfera(0.28, 12, 8), "#3d4a54", [0, 2.35, 0]);
  grupo.add(l.malha(m.toon, m.contorno));

  const cabeca = new THREE.Group();
  cabeca.position.y = 2.4;
  const lt = new Lote();
  lt.add(cilindro(0.34, 2.8, 16, 0.42), "#ffffff", [0, 0.1, 0]);
  lt.add(cilindro(0.47, 0.5, 16), "#f58a33", [0, 1.4, 0]);
  lt.add(cilindro(0.5, 0.1, 16), "#fdc13f", [0, 1.68, 0]);
  lt.add(cilindro(0.4, 0.04, 20), "#123a70", [0, 1.73, 0]);
  lt.add(esfera(0.1, 10, 8), "#bfe8ff", [0.14, 1.75, 0.14], [0, 0, 0], [1, 0.12, 1]);
  lt.add(cilindro(0.2, 0.5, 12), "#3d4a54", [0, -1.4, 0]);
  lt.add(cilindro(0.14, 0.75, 10), "#00c9c8", [0.42, 0.45, 0], [0, 0, 0], [1, 1, 1]);
  const tubo = lt.malha(m.toon, m.contorno);
  tubo.rotation.x = 0.95;
  cabeca.add(tubo);
  grupo.add(cabeca);

  // Holograma do Sistema Solar girando ao lado
  const orbita = new THREE.Group();
  orbita.position.set(-2.1, 3.1, 0.2);
  const lp = new Lote();
  lp.add(esfera(0.32, 14, 10), "#fdc13f");
  orbita.add(lp.malha(new THREE.MeshBasicMaterial({ vertexColors: true })));
  const corpos: { o: THREE.Object3D; r: number; v: number }[] = [];
  for (const [r, v, s, c] of [[0.7, 1.4, 0.08, "#d9663a"], [1.05, 0.9, 0.12, "#3d9be0"], [1.5, 0.55, 0.17, "#e6cf95"]] as const) {
    const a = new Lote();
    a.add(toro(r, 0.008, 44), "#7ff5ef", [0, 0, 0], [Math.PI / 2, 0, 0]);
    orbita.add(a.malha(new THREE.MeshBasicMaterial({ vertexColors: true })));
    const b = new Lote();
    b.add(esfera(s, 10, 8), c);
    const o = b.malha(m.toon);
    orbita.add(o);
    corpos.push({ o, r, v });
  }
  grupo.add(orbita);

  let alvoY = 0;
  let alvoX = 0.95;
  return {
    grupo,
    foco: 2.6,
    atualizar: (t, dt) => {
      corpos.forEach((c) => c.o.position.set(Math.cos(t * c.v) * c.r, 0, Math.sin(t * c.v) * c.r));
      cabeca.rotation.y += (alvoY + Math.sin(t * 0.25) * 0.05 - cabeca.rotation.y) * Math.min(1, dt * 3);
      tubo.rotation.x += (alvoX - tubo.rotation.x) * Math.min(1, dt * 3);
    },
    controles: {
      apontar: (v) => {
        const i = v as number;
        alvoY = -1 + (i / 7) * 2;
        alvoX = 0.75 + (i % 3) * 0.12;
      },
    },
  };
}

function microscopio(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  mesa(l);
  // O mesmo microscópio cinza do logo
  const b = 1.14;
  l.add(caixa(1.5, 0.14, 1), "#6d7276", [0, b + 0.07, 0.1]);
  l.add(caixa(1.25, 0.1, 0.85), "#e6e7e9", [0, b + 0.62, 0.32]);
  l.add(caixa(0.5, 0.75, 0.42), "#6d7276", [0.42, b + 0.45, -0.1]);
  l.add(toro(0.78, 0.13, 18, Math.PI * 0.95), "#6d7276", [0.0, b + 1.36, -0.12], [0, Math.PI / 2, -Math.PI / 2 + 0.05], [1, 1, 1]);
  l.add(cilindro(0.2, 0.5, 14), "#f0f1f3", [0, b + 1.3, 0.34]);
  l.add(cilindro(0.11, 0.2, 10), "#6d7276", [0, b + 1.0, 0.34]);
  l.add(cilindro(0.19, 0.9, 14), "#e6e7e9", [0, b + 1.9, 0.33]);
  l.add(cilindro(0.13, 0.5, 12), "#6d7276", [0, b + 2.5, 0.33]);
  l.add(cilindro(0.2, 0.12, 12), "#6d7276", [0, b + 2.72, 0.33]);
  l.add(cilindro(0.2, 0.14, 14), "#6d7276", [0.45, b + 1.24, -0.18], [0, 0, Math.PI / 2]);
  grupo.add(l.malha(m.toon, m.contorno));

  // Célula em holograma, que fica nítida com o foco
  const celula = new THREE.Group();
  celula.position.set(-1.9, 3.1, 0.3);
  const mat = new THREE.MeshBasicMaterial({ color: "#4bd68c", transparent: true, opacity: 0.3, depthWrite: false });
  celula.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 2), mat));
  const lc = new Lote();
  lc.add(esfera(0.26, 12, 8), "#7a3fc9", [0.1, 0.05, 0.1]);
  for (let i = 0; i < 7; i++) lc.add(esfera(0.1, 8, 6), "#0fa85a", [Math.cos(i * 1.1) * 0.55, Math.sin(i * 2.1) * 0.5, Math.sin(i * 1.7) * 0.45], [0, 0, i], [1.4, 0.7, 0.7]);
  celula.add(lc.malha(m.toon));
  grupo.add(celula);
  let nit = 0.35;
  let alvo = 0.35;
  return {
    grupo,
    foco: 2.5,
    atualizar: (t, dt) => {
      nit += (alvo - nit) * Math.min(1, dt * 5);
      celula.rotation.y = t * 0.4;
      celula.scale.setScalar(0.72 + nit * 0.4 + Math.sin(t * 2) * 0.012);
      mat.opacity = 0.14 + nit * 0.26;
    },
    controles: { nitidez: (v) => (alvo = v as number) },
  };
}

function quimica(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  mesa(l, 4.6);
  const erl = (x: number, cor: string, s = 1) => {
    l.add(torno([[0.0, 0], [0.38 * s, 0], [0.4 * s, 0.1], [0.13 * s, 0.72 * s], [0.13 * s, 1.0 * s], [0.17 * s, 1.03 * s]], 14), "#d7f3fb", [x, 1.14, 0.1]);
    l.add(torno([[0, 0.03], [0.34 * s, 0.03], [0.32 * s, 0.32 * s], [0, 0.32 * s]], 14), cor, [x, 1.14, 0.1], [0, 0, 0], [1.02, 1, 1.02]);
  };
  erl(-1.65, "#fdc13f", 0.85);
  erl(1.65, "#3f7fd6", 0.85);
  l.add(caixa(1.1, 0.5, 0.35), "#f58a33", [1.3, 1.4, -0.55]);
  for (let i = 0; i < 4; i++) l.add(cilindro(0.075, 0.55, 10), "#d7f3fb", [0.92 + i * 0.25, 1.68, -0.55]);
  // Bico de Bunsen
  l.add(cilindro(0.2, 0.08, 12), "#3d4a54", [0, 1.17, 0.12]);
  grupo.add(l.malha(m.toon, m.contorno));

  // Frasco principal com líquido que muda de cor
  const frasco = new THREE.Group();
  frasco.position.set(0, 1.14, 0.1);
  const liquido = new THREE.MeshStandardMaterial({ color: "#7a3fc9" });
  const lg = torno([[0, 0.06], [0.68, 0.06], [0.66, 0.2], [0.43, 0.68], [0, 0.68]], 18);
  frasco.add(new THREE.Mesh(lg, liquido));
  const corpo = new THREE.Mesh(torno([[0, 0], [0.72, 0], [0.74, 0.14], [0.23, 1.25], [0.23, 1.7], [0.3, 1.75]], 18), m.vidro);
  frasco.add(corpo);
  grupo.add(frasco);

  // Bolhas subindo
  const bolhas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.75 }), 14);
  bolhas.position.copy(frasco.position);
  grupo.add(bolhas);
  const d = new THREE.Object3D();
  const cor = new THREE.Color("#7a3fc9");
  return {
    grupo,
    foco: 1.9,
    atualizar: (t, dt) => {
      liquido.color.lerp(cor, Math.min(1, dt * 3));
      for (let i = 0; i < 14; i++) {
        const p = (t * 0.32 + i / 14) % 1;
        const r = 0.34 * (1 - p * 0.7);
        d.position.set(Math.cos(i * 2.4) * r, 0.15 + p * 1.55, Math.sin(i * 2.4) * r);
        d.scale.setScalar(0.6 + p * 0.9);
        d.updateMatrix();
        bolhas.setMatrixAt(i, d.matrix);
      }
      bolhas.instanceMatrix.needsUpdate = true;
    },
    controles: { cor: (v) => void cor.set(v as string) },
  };
}

function pendulo(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  const A = 5;
  l.add(caixa(3.4, 0.2, 1.6), "#1d4f8c", [0, 0.1, 0]);
  for (const x of [-1.5, 1.5]) l.add(caixa(0.2, A, 0.2), "#fdc13f", [x, A / 2, 0]);
  l.add(caixa(3.4, 0.22, 0.28), "#f58a33", [0, A, 0]);
  // Régua de altura
  for (let i = 0; i < 6; i++) l.add(caixa(0.3, 0.03, 0.02), "#ffffff", [-1.34, A - 0.1 - i * 0.8, 0.12]);
  grupo.add(l.malha(m.toon, m.contorno));

  const braco = new THREE.Group();
  braco.position.set(0, A - 0.08, 0);
  const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 6), new THREE.MeshBasicMaterial({ color: "#f4fbff" }));
  const lb = new Lote();
  lb.add(esfera(0.28, 16, 12), "#00c9c8");
  const bola = lb.malha(m.toon, m.contorno);
  braco.add(fio, bola);
  grupo.add(braco);
  let metros = 0.5;
  let alvo = 0.5;
  // 1 metro de fio equivale a 3,2 unidades da cena: o desenho acompanha a escala da régua.
  const escala = 3.2;
  let fase = 0;
  return {
    grupo,
    foco: 2.8,
    atualizar: (_t, dt) => {
      metros += (alvo - metros) * Math.min(1, dt * 6);
      fase += (dt * 2 * Math.PI) / periodo(metros);
      braco.rotation.z = 0.32 * Math.sin(fase);
      const c = metros * escala;
      fio.scale.y = c;
      fio.position.y = -c / 2;
      bola.position.y = -c;
    },
    controles: { comprimento: (v) => (alvo = v as number) },
  };
}

function lousa(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  for (const x of [-2.6, 2.6]) l.add(caixa(0.2, 4, 0.2), "#8a5a2e", [x, 2, -0.1]);
  l.add(caixa(5.5, 3, 0.16), "#8a5a2e", [0, 2.9, -0.1]);
  l.add(caixa(5.2, 0.12, 0.3), "#8a5a2e", [0, 1.32, 0.02]);
  grupo.add(l.malha(m.toon, m.contorno));

  const { c, g } = tela2d(1024, 512);
  const tex = textura(c);
  const desenhar = (linhas: string[]) => {
    g.fillStyle = "#0d5c54";
    g.fillRect(0, 0, 1024, 512);
    g.fillStyle = "#f4fbff";
    g.textAlign = "center";
    g.font = FONTE().replace("{t}", "92");
    g.fillText(linhas[0], 512, 190);
    g.fillStyle = "#fdc13f";
    g.font = `700 62px ${familia("--fonte-texto", "'Trebuchet MS', sans-serif")}`;
    g.fillText(linhas[1] ?? "", 512, 330);
    g.fillStyle = "rgba(255,255,255,.4)";
    g.font = `700 40px ${familia("--fonte-texto", "sans-serif")}`;
    g.fillText("a² + b² = c²        E = mc²        π ≈ 3,14", 512, 450);
    tex.needsUpdate = true;
  };
  desenhar(["1, 1, 2, 3, 5, 8, ?", "Qual é o próximo?"]);
  const quadro = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.7), new THREE.MeshBasicMaterial({ map: tex }));
  quadro.position.set(0, 2.9, 0.0);
  grupo.add(quadro);

  // Sólidos flutuando, como o tetraedro do logo
  const tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(0.55), new THREE.MeshStandardMaterial({ color: "#f58a33" }));
  tetra.position.set(-2.3, 4.9, 0.5);
  const cubo = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), new THREE.MeshStandardMaterial({ color: "#00c9c8" }));
  cubo.position.set(2.3, 4.9, 0.5);
  grupo.add(tetra, cubo);
  return {
    grupo,
    foco: 2.9,
    atualizar: (t) => {
      tetra.rotation.set(t * 0.6, t * 0.9, 0);
      tetra.position.y = 4.9 + Math.sin(t * 1.2) * 0.12;
      cubo.rotation.set(t * 0.8, t * 0.5, 0);
      cubo.position.y = 4.9 + Math.cos(t * 1.1) * 0.12;
    },
    controles: { escrever: (v) => desenhar(v as string[]) },
  };
}

function robotica(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  mesa(l, 4.4, "#cfd8de");
  l.add(cilindro(0.5, 0.25, 16, 0.42), "#3d4a54", [0, 1.26, 0]);
  grupo.add(l.malha(m.toon, m.contorno));

  // Braço robótico com três juntas
  const fazSeg = (a: number, cor: string) => {
    const s = new Lote();
    s.add(capsula(0.15, a), cor, [0, a / 2 + 0.1, 0]);
    s.add(esfera(0.19, 12, 8), "#3d4a54");
    return s.malha(m.toon, m.contorno);
  };
  const j1 = new THREE.Group();
  j1.position.set(0, 1.38, 0);
  j1.add(fazSeg(1, "#00c9c8"));
  const j2 = new THREE.Group();
  j2.position.y = 1.2;
  j2.add(fazSeg(0.85, "#f58a33"));
  j1.add(j2);
  const j3 = new THREE.Group();
  j3.position.y = 1.05;
  const garra = new Lote();
  garra.add(esfera(0.13, 10, 8), "#3d4a54");
  garra.add(caixa(0.07, 0.34, 0.09), "#fdc13f", [-0.1, 0.2, 0], [0, 0, 0.25]);
  garra.add(caixa(0.07, 0.34, 0.09), "#fdc13f", [0.1, 0.2, 0], [0, 0, -0.25]);
  j3.add(garra.malha(m.toon, m.contorno));
  j2.add(j3);
  const raizBraco = new THREE.Group();
  raizBraco.add(j1);
  grupo.add(raizBraco);

  // Robozinho rodando no chão
  const robo = new THREE.Group();
  const lr = new Lote();
  lr.add(caixa(0.7, 0.5, 0.7), "#f4fbff", [0, 0.48, 0]);
  lr.add(esfera(0.3, 12, 8), "#00c9c8", [0, 0.9, 0], [0, 0, 0], [1, 0.8, 1]);
  for (const s of [-1, 1]) {
    lr.add(cilindro(0.18, 0.12, 12), "#3d4a54", [s * 0.42, 0.18, 0], [0, 0, Math.PI / 2]);
    lr.add(esfera(0.055, 8, 6), "#071a2e", [s * 0.12, 0.93, 0.24]);
  }
  robo.add(lr.malha(m.toon, m.contorno));
  grupo.add(robo);
  let festa = 0;
  return {
    grupo,
    foco: 2.2,
    atualizar: (t, dt) => {
      festa = Math.max(0, festa - dt);
      const vel = festa > 0 ? 5 : 1;
      raizBraco.rotation.y = Math.sin(t * 0.7 * vel) * 0.9;
      j1.rotation.z = Math.sin(t * 0.9 * vel) * 0.35;
      j2.rotation.z = 0.7 + Math.sin(t * 1.1 * vel) * 0.4;
      j3.rotation.z = Math.sin(t * 1.6 * vel) * 0.5;
      const a = t * 0.8;
      robo.position.set(Math.cos(a) * 2.8, 0, 1.7 + Math.sin(a) * 0.55);
      robo.rotation.y = -a;
    },
    controles: { festejar: () => (festa = 2.5) },
  };
}

function historia(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  const cores = ["#f58a33", "#00c9c8", "#fdc13f", "#f8a8c8", "#0fa85a", "#7fb0ff", "#c9a0ff"];
  l.add(caixa(5, 4.2, 0.8), "#8a5a2e", [0, 2.1, -0.75]);
  for (let f = 0; f < 3; f++) {
    l.add(caixa(4.8, 0.1, 0.75), "#6b431f", [0, 0.82 + f * 1.3, -0.45]);
    for (let i = 0; i < 16; i++) {
      const a = 0.72 + ((i * 7 + f * 3) % 5) * 0.07;
      l.add(caixa(0.22, a, 0.55), cores[(i + f * 2) % cores.length], [-2.15 + i * 0.285, 0.87 + f * 1.3 + a / 2, -0.42], [0, 0, ((i * 13) % 7 === 0 ? 0.1 : 0)]);
    }
  }
  // Púlpito com livro aberto
  l.add(cilindro(0.2, 1.1, 8), "#6b431f", [0, 0.55, 0.9]);
  l.add(caixa(1.3, 0.1, 0.95), "#8a5a2e", [0, 1.15, 0.9], [0.32, 0, 0]);
  l.add(caixa(0.58, 0.07, 0.8), "#fff7e0", [-0.3, 1.24, 0.9], [0.32, 0, 0.06]);
  l.add(caixa(0.58, 0.07, 0.8), "#fff7e0", [0.3, 1.24, 0.9], [0.32, 0, -0.06]);
  grupo.add(l.malha(m.toon, m.contorno));

  // Ampulheta girando
  const amp = new Lote();
  amp.add(cilindro(0.34, 0.06, 14), "#8a5a2e", [0, 0.6, 0]);
  amp.add(cilindro(0.34, 0.06, 14), "#8a5a2e", [0, -0.6, 0]);
  amp.add(torno([[0.02, 0], [0.26, 0.5], [0.0, 0.58]], 12), "#fdc13f");
  amp.add(torno([[0.0, -0.58], [0.26, -0.5], [0.02, 0]], 12), "#fdc13f");
  const ampulheta = amp.malha(m.toon, m.contorno);
  ampulheta.position.set(-2.4, 1.3, 1.0);
  grupo.add(ampulheta);
  return { grupo, foco: 2.2, atualizar: (t) => (ampulheta.rotation.z = Math.floor(t / 4) * Math.PI + Math.max(0, (t % 4) - 3.2) * (Math.PI / 0.8)) };
}

function estufa(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  l.add(cilindro(2.2, 0.35, 28, 2.3), "#6b431f", [0, 0.18, 0]);
  l.add(cilindro(2.1, 0.05, 28), "#2e7d4a", [0, 0.37, 0]);
  grupo.add(l.malha(m.toon, m.contorno));

  const domo = new THREE.Mesh(new THREE.SphereGeometry(2.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.vidro);
  domo.position.y = 0.36;
  domo.scale.y = 1.55;
  grupo.add(domo);
  const nerv = new Lote();
  for (let i = 0; i < 3; i++) nerv.add(toro(2.27, 0.03, 40, Math.PI), "#f4fbff", [0, 0.36, 0], [0, (i / 3) * Math.PI, 0], [1, 1.55, 1]);
  grupo.add(nerv.malha(new THREE.MeshBasicMaterial({ vertexColors: true })));

  const arvore = new THREE.Group();
  arvore.position.y = 0.38;
  const la = new Lote();
  la.add(cilindro(0.17, 1.2, 8, 0.11), "#8a5a2e", [0, 0.6, 0]);
  la.add(new THREE.IcosahedronGeometry(0.72, 1), "#0fa85a", [0, 1.5, 0]);
  la.add(new THREE.IcosahedronGeometry(0.52, 1), "#2cc97a", [0.48, 1.3, 0.14]);
  la.add(new THREE.IcosahedronGeometry(0.5, 1), "#0d8c4c", [-0.46, 1.34, -0.1]);
  la.add(new THREE.IcosahedronGeometry(0.42, 1), "#2cc97a", [0, 2.05, 0.05]);
  // Folha amarela, a mesma da pinça no logo
  la.add(esfera(0.13, 8, 6), "#fdc13f", [0.2, 1.9, 0.5], [0, 0, 0.6], [1.5, 0.9, 0.35]);
  arvore.add(la.malha(m.toon, m.contorno));
  grupo.add(arvore);

  // Partículas de oxigênio saindo quando a planta faz fotossíntese
  const o2 = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshBasicMaterial({ color: "#c8fff0", transparent: true, opacity: 0.8 }), 16);
  o2.position.y = 1.4;
  o2.visible = false;
  grupo.add(o2);
  const d = new THREE.Object3D();
  let alvo = 0.45;
  let esc = 0.45;
  return {
    grupo,
    foco: 2,
    atualizar: (t, dt) => {
      esc += (alvo - esc) * Math.min(1, dt * 1.8);
      arvore.scale.setScalar(esc * (1 + Math.sin(t * 1.4) * 0.008));
      arvore.rotation.y = Math.sin(t * 0.4) * 0.12;
      o2.visible = alvo > 0.9;
      if (o2.visible) {
        for (let i = 0; i < 16; i++) {
          const p = (t * 0.28 + i / 16) % 1;
          d.position.set(Math.cos(i * 2.4) * (0.4 + p * 0.8), p * 1.8, Math.sin(i * 2.4) * (0.4 + p * 0.8));
          d.scale.setScalar(1 - p * 0.5);
          d.updateMatrix();
          o2.setMatrixAt(i, d.matrix);
        }
        o2.instanceMatrix.needsUpdate = true;
      }
    },
    controles: { crescer: (v) => (alvo = v as number) },
  };
}

function feira(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  mesa(l, 4.8, "#f4fbff");
  for (const [x, ry, c] of [[-1.7, 0.42, "#f58a33"], [0, 0, "#00c9c8"], [1.7, -0.42, "#fdc13f"]] as const) {
    l.add(caixa(1.65, 1.9, 0.06), c, [x, 2.1, -0.45], [0, ry, 0]);
    l.add(caixa(1.3, 0.3, 0.07), "#ffffff", [x, 2.72, -0.42], [0, ry, 0]);
    for (let i = 0; i < 3; i++) l.add(caixa(1.25, 0.09, 0.07), "#f4fbff", [x, 2.3 - i * 0.22, -0.42], [0, ry, 0]);
    l.add(caixa(0.55, 0.42, 0.07), "#071a2e", [x - 0.2, 1.5, -0.42], [0, ry, 0]);
  }
  // Maquete de vulcão sobre a mesa
  l.add(new THREE.ConeGeometry(0.42, 0.55, 12), "#8a5a2e", [1.45, 1.42, 0.25]);
  l.add(cilindro(0.1, 0.05, 10), "#f58a33", [1.45, 1.68, 0.25]);
  grupo.add(l.malha(m.toon, m.contorno));

  // Lâmpada da ideia, flutuando
  const ideia = new Lote();
  ideia.add(esfera(0.36, 14, 10), "#fdc13f");
  ideia.add(cilindro(0.16, 0.2, 10), "#6d7a84", [0, -0.42, 0]);
  const lampada = ideia.malha(new THREE.MeshBasicMaterial({ vertexColors: true }));
  lampada.position.set(-1.45, 1.95, 0.45);
  grupo.add(lampada);
  return {
    grupo,
    foco: 2.1,
    atualizar: (t) => {
      lampada.position.y = 1.95 + Math.sin(t * 1.5) * 0.09;
      lampada.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    },
  };
}

function financas(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  mesa(l, 4.6, "#17365c");
  l.add(caixa(3.4, 2.2, 0.14), "#071a2e", [0, 3.15, -0.7]);
  l.add(caixa(0.2, 1.1, 0.2), "#3d4a54", [0, 1.6, -0.7]);
  // Gráfico de velas: só um desenho, sem dados de mercado
  [0.4, 0.55, 0.5, 0.75, 0.68, 0.95, 1.2, 1.1, 1.45].forEach((a, i) => {
    l.add(caixa(0.2, a, 0.05), i % 3 === 2 ? "#f58a33" : "#2cc97a", [-1.35 + i * 0.34, 2.25 + a / 2, -0.6]);
  });
  grupo.add(l.malha(m.toon, m.contorno));

  const n = 34;
  const moedas = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.27, 0.27, 0.075, 16), new THREE.MeshStandardMaterial({ color: "#fdc13f" }), n);
  grupo.add(moedas);
  const d = new THREE.Object3D();
  let alvo = 0.3;
  let atual = 0;
  return {
    grupo,
    foco: 2.2,
    atualizar: (_t, dt) => {
      atual += (alvo - atual) * Math.min(1, dt * 4);
      const vis = Math.round(atual * n);
      for (let i = 0; i < n; i++) {
        const coluna = i % 3;
        const nivel = Math.floor(i / 3);
        d.position.set(-0.5 + coluna * 0.5, i < vis ? 1.18 + nivel * 0.075 : -5, 0.25);
        d.updateMatrix();
        moedas.setMatrixAt(i, d.matrix);
      }
      moedas.instanceMatrix.needsUpdate = true;
    },
    controles: { moedas: (v) => (alvo = v as number) },
  };
}

function portal(m: Mats): Equip {
  const grupo = new THREE.Group();
  const l = new Lote();
  l.add(cilindro(2.2, 0.3, 28, 2.4), "#1d4f8c", [0, 0.15, 0]);
  l.add(toro(2.4, 0.16, 48), "#fdc13f", [0, 3, 0]);
  grupo.add(l.malha(m.toon, m.contorno));

  // Globo com paralelos e meridianos. Sem continentes desenhados à mão: nada de mapa inventado.
  const globo = new THREE.Group();
  globo.position.y = 3;
  globo.add(new THREE.Mesh(new THREE.SphereGeometry(1.45, 28, 18), new THREE.MeshStandardMaterial({ color: "#1b7fd1" })));
  const linhas = new Lote();
  for (let i = 0; i < 6; i++) linhas.add(toro(1.47, 0.012, 44), "#bff5f4", [0, 0, 0], [0, (i / 6) * Math.PI, 0]);
  for (const y of [-0.9, -0.45, 0, 0.45, 0.9]) linhas.add(toro(Math.sqrt(1.47 * 1.47 - y * y), 0.012, 44), "#bff5f4", [0, y, 0], [Math.PI / 2, 0, 0]);
  globo.add(linhas.malha(new THREE.MeshBasicMaterial({ vertexColors: true })));
  grupo.add(globo);

  // Aviõezinhos de papel orbitando
  const voos: { o: THREE.Object3D; v: number; inc: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const a = new Lote();
    a.add(new THREE.ConeGeometry(0.12, 0.38, 3), ["#f4fbff", "#fdc13f", "#f8a8c8"][i], [0, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.5]);
    const o = a.malha(m.toon);
    grupo.add(o);
    voos.push({ o, v: 0.6 + i * 0.22, inc: 0.4 + i * 0.5 });
  }
  const anel = new THREE.Mesh(new THREE.CircleGeometry(2.3, 44), new THREE.MeshBasicMaterial({ color: "#3ee8e6", transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
  anel.position.y = 3;
  grupo.add(anel);
  return {
    grupo,
    foco: 3,
    atualizar: (t) => {
      globo.rotation.y = t * 0.3;
      (anel.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(t * 1.5) * 0.04;
      voos.forEach((f) => {
        const a = t * f.v;
        const r = 1.95;
        f.o.position.set(Math.cos(a) * r, 3 + Math.sin(a) * Math.sin(f.inc) * r * 0.6, Math.sin(a) * Math.cos(f.inc) * r);
        f.o.rotation.y = -a - Math.PI / 2;
      });
    },
  };
}

const FABRICA: Record<IdEstacao, (m: Mats) => Equip> = {
  telescopio,
  microscopio,
  quimica,
  fisica: pendulo,
  matematica: lousa,
  robotica,
  historia,
  planeta: estufa,
  projetos: feira,
  financas,
  mundo: portal,
};

export type Cenario = { grupo: THREE.Group; pecas: PecaEstacao[]; obstaculos: { x: number; z: number; r: number }[]; logoCentro: THREE.Sprite; atualizar: (t: number) => void };

export function criarCenario(): Cenario {
  const grupo = new THREE.Group();
  const toon = materialDesenho();
  // Equipamentos sem contorno: quem define a forma agora é a luz. O contorno fica só nos estudantes, como no logo.
  const contorno = null;
  const vidro = new THREE.MeshPhysicalMaterial({ color: "#d4f4ff", transparent: true, opacity: 0.26, roughness: 0.04, metalness: 0, clearcoat: 1, envMapIntensity: 1.8, depthWrite: false, side: THREE.DoubleSide });
  const m: Mats = { toon, contorno, vidro };

  const angulos = ESTACOES.map((e, i) => ({ cor: e.cor, angulo: (i / ESTACOES.length) * Math.PI * 2 }));
  grupo.add(ceu(), chao(angulos), estrutura(toon));

  const obstaculos: Cenario["obstaculos"] = [{ x: 0, z: 0, r: 3.7 }];
  const pecas: PecaEstacao[] = ESTACOES.map((estacao, i) => {
    const angulo = angulos[i].angulo;
    const eq = FABRICA[estacao.id](m);
    const raiz = new THREE.Group();
    const posicao = new THREE.Vector3(Math.sin(angulo) * RAIO_ESTACAO, 0, Math.cos(angulo) * RAIO_ESTACAO);
    raiz.position.copy(posicao);
    raiz.rotation.y = angulo + Math.PI; // a frente (+Z local) aponta para o centro
    raiz.add(eq.grupo);

    const nome = placaNome(estacao);
    nome.position.set(0, 6.6, -0.4);
    raiz.add(nome);
    const seta = selo();
    seta.position.set(0, 5.5, -0.4);
    raiz.add(seta);

    const anel = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.42, 40), new THREE.MeshBasicMaterial({ color: estacao.cor, transparent: true, opacity: 0.85, depthWrite: false }));
    anel.rotation.x = -Math.PI / 2;
    anel.position.set(0, 0.035, 3.4);
    raiz.add(anel);

    const logos = new THREE.Group();
    logos.position.set(0, 0, -0.4);
    raiz.add(logos);
    grupo.add(raiz);

    obstaculos.push({ x: posicao.x, z: posicao.z, r: 2.75 });
    const fora = posicao.clone().normalize();
    return {
      estacao,
      grupo: raiz,
      posicao,
      ponto: fora.clone().multiplyScalar(RAIO_ESTACAO - 3.4),
      foco: posicao.clone().setY(eq.foco ?? 2.2),
      atualizar: eq.atualizar ?? (() => {}),
      controles: eq.controles ?? {},
      anel,
      seta,
      logos,
      logosCarregados: false,
    };
  });

  // Cones de luz sobre cada equipamento e brilho no chão: é o que dá atmosfera sem custo de luz real.
  const { c: tc, g: tg } = tela2d(4, 128);
  const gc = tg.createLinearGradient(0, 0, 0, 128);
  gc.addColorStop(0, "rgba(255,255,255,.55)");
  gc.addColorStop(1, "rgba(255,255,255,0)");
  tg.fillStyle = gc;
  tg.fillRect(0, 0, 4, 128);
  const texCone = textura(tc);
  const { c: rc, g: rg } = tela2d(128, 128);
  const gr = rg.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,.75)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  rg.fillStyle = gr;
  rg.fillRect(0, 0, 128, 128);
  const texBrilho = textura(rc);
  for (const p of pecas) {
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 4.1, 9.5, 28, 1, true), new THREE.MeshBasicMaterial({ color: p.estacao.cor, map: texCone, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    cone.position.set(p.posicao.x, 4.75, p.posicao.z);
    grupo.add(cone);
    const chaoLuz = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: p.estacao.cor, map: texBrilho, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
    chaoLuz.rotation.x = -Math.PI / 2;
    chaoLuz.position.set(p.posicao.x, 0.025, p.posicao.z);
    grupo.add(chaoLuz);
  }

  // Poeira de luz flutuando no ar
  const nPo = 420;
  const posPo = new Float32Array(nPo * 3);
  for (let i = 0; i < nPo; i++) {
    const a = ((i * 2654435761) % 4294967296) / 4294967296;
    const b = ((i * 340573321) % 4294967296) / 4294967296;
    const d = ((i * 1640531527) % 4294967296) / 4294967296;
    const r = Math.sqrt(a) * (RAIO_SALA - 1);
    posPo.set([Math.cos(b * Math.PI * 2) * r, 0.4 + d * 9, Math.sin(b * Math.PI * 2) * r], i * 3);
  }
  const gPo = new THREE.BufferGeometry();
  gPo.setAttribute("position", new THREE.BufferAttribute(posPo, 3));
  const poeira = new THREE.Points(gPo, new THREE.PointsMaterial({ map: texBrilho, color: "#bff5f4", size: 0.14, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  grupo.add(poeira);

  const logoCentro = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
  logoCentro.scale.set(6.3, 3.9, 1);
  logoCentro.position.set(0, 3.7, 0);
  grupo.add(logoCentro);

  // Feixe do projetor central
  const feixe = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 1.5, 3.2, 28, 1, true), new THREE.MeshBasicMaterial({ color: "#3ee8e6", transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  feixe.position.y = 2.45;
  grupo.add(feixe);

  // O átomo do logo gira grande, no alto da cúpula
  const atomo = new THREE.Group();
  atomo.position.y = 11.5;
  const nucleo = new Lote();
  nucleo.add(esfera(0.85, 18, 12), "#f58a33");
  atomo.add(nucleo.malha(toon, contorno));
  const orbitas: { g: THREE.Group; e: THREE.Object3D; v: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    g.rotation.set(Math.PI / 2 + (i - 1) * 1.05, (i - 1) * 0.4, 0);
    const a = new Lote();
    a.add(toro(3.2, 0.055, 56), ["#fdc13f", "#00c9c8", "#f8a8c8"][i]);
    g.add(a.malha(new THREE.MeshBasicMaterial({ vertexColors: true })));
    const b = new Lote();
    b.add(esfera(0.3, 12, 8), ["#fdc13f", "#00c9c8", "#f8a8c8"][i]);
    const e = b.malha(toon, contorno);
    g.add(e);
    atomo.add(g);
    orbitas.push({ g, e, v: 0.7 + i * 0.25 });
  }
  grupo.add(atomo);

  // Drones de pesquisa passeando pelo laboratório
  const drones: { o: THREE.Object3D; r: number; v: number; y: number; f: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Lote();
    d.add(esfera(0.3, 12, 8), "#f4fbff", [0, 0, 0], [0, 0, 0], [1, 0.6, 1]);
    d.add(esfera(0.11, 8, 6), "#00c9c8", [0, -0.02, 0.26]);
    for (const [x, z] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) d.add(cilindro(0.2, 0.025, 12), "#fdc13f", [x, 0.15, z]);
    d.add(caixa(1.2, 0.04, 0.05), "#3d4a54", [0, 0.1, 0], [0, Math.PI / 4, 0]);
    d.add(caixa(1.2, 0.04, 0.05), "#3d4a54", [0, 0.1, 0], [0, -Math.PI / 4, 0]);
    const o = d.malha(toon, contorno);
    grupo.add(o);
    drones.push({ o, r: 7 + i * 2.6, v: (i % 2 ? -1 : 1) * (0.32 - i * 0.05), y: 5.2 + i * 0.7, f: i * 2.1 });
  }

  const atualizar = (t: number) => {
    atomo.rotation.y = t * 0.12;
    poeira.rotation.y = t * 0.012;
    poeira.position.y = Math.sin(t * 0.25) * 0.25;
    orbitas.forEach((o) => {
      const a = t * o.v;
      o.e.position.set(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0);
    });
    drones.forEach((d) => {
      const a = t * d.v + d.f;
      d.o.position.set(Math.sin(a) * d.r, d.y + Math.sin(t * 1.3 + d.f) * 0.3, Math.cos(a) * d.r);
      d.o.rotation.y = a + (d.v > 0 ? Math.PI / 2 : -Math.PI / 2);
      d.o.rotation.z = Math.sin(t * 1.7 + d.f) * 0.08;
    });
    (feixe.material as THREE.MeshBasicMaterial).opacity = 0.055 + Math.sin(t * 2) * 0.015;
  };

  return { grupo, pecas, obstaculos, logoCentro, atualizar };
}
