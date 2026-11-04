import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { caixa, cilindro, esfera, Lote, materialContorno, toro } from "@/lab/lote";

// O Planeta Estante: um mundinho redondo, desenhado com tinta, onde cada campo do conhecimento é uma região com a sua estante.

export const RAIO = 26;
const TINTA = "#1d1836";

export type SitioBase = { id: string; titulo: string; cor: string; videos: { titulo: string; canal: string; duracao: string | null }[]; materiais: number };

export type Fita = { malha: THREE.Mesh; contorno: THREE.Mesh; base: THREE.Vector3; saida: number; alvo: number; atraso: number };

export type Sitio = SitioBase & {
  dir: THREE.Vector3;
  frente: THREE.Vector3;
  /** Onde o jogador para, de frente para a estante. */
  ponto: THREE.Vector3;
  grupo: THREE.Group;
  estante: THREE.Group;
  fitas: Fita[];
  alvo: THREE.Mesh;
};

export type Obstaculo = { dir: THREE.Vector3; raio: number; cos: number };
export type Coleta = { id: string; dir: THREE.Vector3; malha: THREE.Group };

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Latitude e longitude em graus. O conjunto todo é inclinado para nada ficar no polo da textura. */
const INCLINA = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0.2, 0.35));
const ponto = (lat: number, lon: number) => {
  const a = THREE.MathUtils.degToRad(lat);
  const o = THREE.MathUtils.degToRad(lon);
  return v(Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)).applyQuaternion(INCLINA).normalize();
};

const POSICOES: Record<string, [number, number]> = {
  matematica: [34, 20],
  natureza: [34, 140],
  humanas: [34, 260],
  linguagens: [-22, 80],
  tecnologia: [-22, 200],
  "linguas-estrangeiras": [-22, 320],
  pesquisa: [-78, 150],
};
export const PRACA = ponto(88, 0);

const ORDEM = ["matematica", "linguagens", "natureza", "tecnologia", "humanas", "linguas-estrangeiras"];

/** Os caminhos de terra que ligam as regiões. */
function trilhas(): [THREE.Vector3, THREE.Vector3][] {
  const d = (id: string) => ponto(...POSICOES[id]);
  const t: [THREE.Vector3, THREE.Vector3][] = [
    [PRACA, d("matematica")],
    [PRACA, d("natureza")],
    [PRACA, d("humanas")],
    [d("linguagens"), d("pesquisa")],
    [d("tecnologia"), d("pesquisa")],
    [d("linguas-estrangeiras"), d("pesquisa")],
  ];
  ORDEM.forEach((id, i) => t.push([d(id), d(ORDEM[(i + 1) % ORDEM.length])]));
  return t;
}

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const CENTROS = [PRACA, ...Object.values(POSICOES).map(([la, lo]) => ponto(la, lo))];

/** Relevo. As regiões são planas para a estante assentar; entre elas o chão ondula. */
export function altura(d: THREE.Vector3) {
  const h = 0.62 * Math.sin(d.x * 5.1 + 1.3) * Math.cos(d.y * 4.3 + 0.7) + 0.34 * Math.sin(d.z * 9.2 + d.x * 3.1) + 0.12 * Math.sin(d.y * 17 + d.z * 11);
  let perto = 0;
  for (const c of CENTROS) perto = Math.max(perto, d.dot(c));
  return h * (1 - suave(0.91, 0.975, perto));
}

const ruido = (x: number, y: number, z: number) => Math.sin(x * 6.3 + Math.sin(y * 4.1) * 1.7) * Math.cos(y * 5.7 + Math.sin(z * 3.3) * 1.9) + 0.5 * Math.sin(z * 13.1 + x * 7.7);

/** Pinta o planeta pixel a pixel: regiões com bordas de mapa, manchas de tinta e caminhos com contorno. */
function pintarChao(sitios: SitioBase[], largura: number) {
  const altura2 = largura / 2;
  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura2;
  const g = tela.getContext("2d")!;
  const img = g.createImageData(largura, altura2);
  const creme = new THREE.Color("#f7e9c8");
  const tinta = new THREE.Color(TINTA);
  const regioes = [
    { dir: PRACA, a: new THREE.Color("#f4b6c2"), b: new THREE.Color("#ee9fb2") },
    ...sitios.map((s) => {
      const base = new THREE.Color(s.cor);
      return { dir: ponto(...POSICOES[s.id]), a: base.clone().lerp(new THREE.Color("#ffffff"), 0.16), b: base.clone().lerp(new THREE.Color("#2a1d5c"), 0.16) };
    }),
  ];
  const arcos = trilhas().map(([a, b]) => ({ a, b, n: a.clone().cross(b).normalize(), cos: a.dot(b) }));
  const larguraTrilha = 0.042;
  const contorno = 0.0065;
  const px = (Math.PI * 2) / largura;
  const q = new THREE.Vector3();
  const lin = (c: THREE.Color) => [Math.round(Math.pow(c.r, 1 / 2.2) * 255), Math.round(Math.pow(c.g, 1 / 2.2) * 255), Math.round(Math.pow(c.b, 1 / 2.2) * 255)];
  const cores = regioes.map((r) => ({ a: lin(r.a), b: lin(r.b) }));
  const cCreme = lin(creme);
  const cTinta = lin(tinta);
  let i = 0;
  for (let y = 0; y < altura2; y++) {
    const fi = ((y + 0.5) / altura2) * Math.PI;
    const sy = Math.cos(fi);
    const r = Math.sin(fi);
    for (let x = 0; x < largura; x++) {
      const te = ((x + 0.5) / largura) * Math.PI * 2;
      // Mesma convenção da esfera do Three.js.
      const dx = -Math.cos(te) * r;
      const dz = Math.sin(te) * r;
      const onda = ruido(dx, sy, dz) * 0.035;
      // Entorta o espaço antes de escolher a região: a fronteira vira contorno de mapa, não linha reta.
      const wx = dx + ruido(sy * 1.7 + 3, dz * 1.7, dx * 1.7) * 0.085;
      const wy = sy + ruido(dz * 1.7 - 1, dx * 1.7, sy * 1.7) * 0.085;
      const wz = dz + ruido(dx * 1.7, sy * 1.7 + 2, dz * 1.7) * 0.085;
      let melhor = -2;
      let segundo = -2;
      let qual = 0;
      for (let k = 0; k < regioes.length; k++) {
        const p = regioes[k].dir;
        const prod = wx * p.x + wy * p.y + wz * p.z - (k === 0 ? 0.2 : 0);
        if (prod > melhor) {
          segundo = melhor;
          melhor = prod;
          qual = k;
        } else if (prod > segundo) segundo = prod;
      }
      const mancha = ruido(dx * 2.3 + 1, sy * 2.3, dz * 2.3 - 2) + onda * 4 > 0.42;
      let c = mancha ? cores[qual].b : cores[qual].a;
      if (melhor - segundo < 0.0045) c = cTinta;

      let dist = 9;
      for (const t of arcos) {
        const s = dx * t.n.x + sy * t.n.y + dz * t.n.z;
        if (s > 0.09 || s < -0.09) continue;
        q.set(dx - t.n.x * s, sy - t.n.y * s, dz - t.n.z * s);
        const l = q.length() || 1;
        const qa = (q.x * t.a.x + q.y * t.a.y + q.z * t.a.z) / l;
        const qb = (q.x * t.b.x + q.y * t.b.y + q.z * t.b.z) / l;
        if (qa >= t.cos && qb >= t.cos && Math.abs(s) < dist) dist = Math.abs(s);
      }
      dist += onda * 0.35;
      for (const ce of CENTROS) {
        if (dx * ce.x + sy * ce.y + dz * ce.z > 0.982) {
          dist = Math.min(dist, 0.03);
          break;
        }
      }
      // Borda suave de um pixel: sem isso o contorno do caminho fica serrilhado.
      let r0 = c[0];
      let g0 = c[1];
      let b0 = c[2];
      const f1 = Math.min(1, Math.max(0, (larguraTrilha + contorno - dist) / px + 0.5));
      r0 += (cTinta[0] - r0) * f1;
      g0 += (cTinta[1] - g0) * f1;
      b0 += (cTinta[2] - b0) * f1;
      const f2 = Math.min(1, Math.max(0, (larguraTrilha - dist) / px + 0.5));
      r0 += (cCreme[0] - r0) * f2;
      g0 += (cCreme[1] - g0) * f2;
      b0 += (cCreme[2] - b0) * f2;

      img.data[i++] = r0;
      img.data[i++] = g0;
      img.data[i++] = b0;
      img.data[i++] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  // Tracinhos soltos, como em ilustração feita à mão.
  g.strokeStyle = "rgba(29,24,54,.46)";
  g.lineWidth = largura / 900;
  g.lineCap = "round";
  let sem = 12345;
  const aleat = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 2600; k++) {
    const x = aleat() * largura;
    const y = (0.08 + aleat() * 0.84) * altura2;
    const t = (largura / 300) * (0.5 + aleat());
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + t * 0.4, y - t * 0.7, x + t, y - t * 0.1);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(tela);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Toon com hachura: três faixas de luz e riscos na sombra, como desenho a nanquim. */
export function criarMateriais(dpr: number) {
  const faixas = new THREE.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, THREE.RedFormat);
  faixas.minFilter = faixas.magFilter = THREE.NearestFilter;
  faixas.needsUpdate = true;
  const passo = { value: 8 * dpr };
  const nanquim = (m: THREE.MeshToonMaterial) => {
    m.onBeforeCompile = (s) => {
      s.uniforms.uPasso = passo;
      s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uPasso;").replace(
        "#include <opaque_fragment>",
        `float luz = dot(outgoingLight, vec3(.3,.59,.11)) / max(dot(diffuseColor.rgb, vec3(.3,.59,.11)), .001);
         float risco = step(mod(gl_FragCoord.x + gl_FragCoord.y, uPasso), uPasso * .2);
         outgoingLight *= 1. - .16 * step(luz, .66) * risco;
         #include <opaque_fragment>`,
      );
    };
    m.customProgramCacheKey = () => "nanquim";
    return m;
  };
  const desenho = nanquim(new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: faixas }));
  const dosDois = nanquim(new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: faixas, side: THREE.DoubleSide }));
  const contorno = materialContorno(TINTA, 0.05);
  const contornoFino = materialContorno(TINTA, 0.026);
  return { faixas, nanquim, desenho, dosDois, contorno, contornoFino, passo };
}
export type Materiais = ReturnType<typeof criarMateriais>;

type V3 = [number, number, number];
type Pincel = { add: (g: THREE.BufferGeometry, cor: string, pos?: V3, rot?: V3, esc?: V3) => void };

/** Matriz que assenta um objeto no chão: Y local aponta para fora do planeta. */
export function assentar(dir: THREE.Vector3, yaw = 0, afunda = 0.06, olhaPara?: THREE.Vector3) {
  const cima = dir.clone().normalize();
  const ref = olhaPara ? olhaPara.clone() : Math.abs(cima.y) > 0.9 ? v(1, 0, 0) : v(0, 1, 0);
  const z = ref.sub(cima.clone().multiplyScalar(ref.dot(cima))).normalize().applyAxisAngle(cima, yaw);
  const x = cima.clone().cross(z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, cima, z);
  m.setPosition(cima.clone().multiplyScalar(RAIO + altura(cima) - afunda));
  return m;
}

/** Desenha em coordenadas locais do lugar e guarda no lote em coordenadas do planeta. */
function pincel(l: Lote, m: THREE.Matrix4): Pincel {
  return {
    add(g, cor, pos = [0, 0, 0], rot = [0, 0, 0], esc = [1, 1, 1]) {
      const local = new THREE.Matrix4().compose(v(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), v(...esc));
      g.applyMatrix4(local);
      g.applyMatrix4(m);
      l.add(g, cor);
    },
  };
}

const copa = (r: number) => new THREE.IcosahedronGeometry(r, 1);

function arvore(p: Pincel, cor: string, a = 1) {
  p.add(cilindro(0.17 * a, 1.2 * a, 6, 0.11 * a), "#6d4a3a", [0, 0.6 * a, 0]);
  p.add(copa(0.82 * a), cor, [0, 1.65 * a, 0], [0.3, 0.4, 0]);
  p.add(copa(0.55 * a), cor, [0.42 * a, 1.25 * a, 0.18 * a], [0.8, 0.1, 0]);
}

function pilhaLivros(p: Pincel, cores: string[], n: number, sem: number) {
  let y = 0;
  for (let i = 0; i < n; i++) {
    const a = 0.26 + ((sem + i * 7) % 4) * 0.05;
    const l = 1.5 - i * 0.08;
    const rot = ((sem * 13 + i * 31) % 10) / 16 - 0.3;
    p.add(caixa(l, a, 1.05), cores[(i + sem) % cores.length], [0, y + a / 2, 0], [0, rot, 0]);
    p.add(caixa(l - 0.08, a - 0.1, 0.02), "#fff6dc", [Math.sin(rot) * 0.53, y + a / 2, Math.cos(rot) * 0.53], [0, rot, 0]);
    y += a;
  }
}

// ---------------------------------------------------- marcos de cada região

function marcoMatematica(p: Pincel) {
  p.add(new THREE.IcosahedronGeometry(1.5, 0), "#ffd257", [-1.6, 1.5, 0], [0.4, 0.5, 0]);
  p.add(new THREE.OctahedronGeometry(1.15, 0), "#f4f1ff", [1.2, 1.2, 0.8], [0, 0.4, 0.2]);
  p.add(new THREE.TetrahedronGeometry(1.15, 0), "#00c9c8", [0.1, 0.8, -1.5], [0.5, 0.9, 0.2]);
  for (let i = 0; i < 6; i++) p.add(caixa(0.9, 0.45 * (i + 1), 0.9), i % 2 ? "#ffe6a8" : "#7f4cc4", [3 + i * 0.05, 0.22 * (i + 1), -2.4 + i * 0.9]);
  p.add(toro(0.9, 0.16, 16), "#7f4cc4", [-3.3, 1.1, 1.2], [0, 0.6, 0]);
}

function marcoLinguagens(p: Pincel) {
  // Livro aberto do tamanho de um morro.
  p.add(caixa(3, 0.28, 4.2), "#c43d4e", [-1.45, 0.3, 0], [0, 0, 0.22]);
  p.add(caixa(3, 0.28, 4.2), "#c43d4e", [1.45, 0.3, 0], [0, 0, -0.22]);
  p.add(caixa(2.75, 0.26, 3.9), "#fff6dc", [-1.42, 0.58, 0], [0, 0, 0.22]);
  p.add(caixa(2.75, 0.26, 3.9), "#fff6dc", [1.42, 0.58, 0], [0, 0, -0.22]);
  for (let i = 0; i < 6; i++) {
    p.add(caixa(1.9, 0.03, 0.09), TINTA, [-1.45, 0.76 - 0.015 * i, -1.2 + i * 0.48], [0, 0, 0.22]);
    p.add(caixa(1.9, 0.03, 0.09), TINTA, [1.45, 0.76 - 0.015 * i, -1.2 + i * 0.48], [0, 0, -0.22]);
  }
  // Pena gigante.
  p.add(cilindro(0.07, 3.6, 6, 0.02), "#fff6dc", [2.5, 2.4, -1], [0.1, 0, -0.45]);
  p.add(esfera(0.7, 8, 6), "#3f7fe0", [3.1, 3.5, -0.85], [0.1, 0, -0.45], [0.45, 1.6, 0.12]);
}

function marcoLinguas(p: Pincel) {
  // Globo no suporte e balões de conversa.
  p.add(cilindro(0.95, 0.35, 12), "#20356f", [0, 0.17, 0]);
  p.add(cilindro(0.14, 1.4, 8), "#20356f", [0, 0.9, 0]);
  p.add(toro(1.85, 0.11, 22, Math.PI * 1.5), "#f58a33", [0, 2.95, 0], [0, 1.3, 0.4]);
  p.add(esfera(1.55, 14, 10), "#3f7fe0", [0, 3, 0]);
  p.add(copa(0.72), "#2fd27f", [0.92, 3.5, 0.9], [0, 0, 0], [1, 0.7, 0.6]);
  p.add(copa(0.6), "#2fd27f", [-1.05, 2.5, 0.75], [0, 0, 0], [0.9, 1, 0.6]);
  const bal: [number, number, number, string][] = [[-3, 3.2, 0.5, "#fff6dc"], [3.1, 2.4, 0.3, "#fdc13f"], [2.5, 4.6, -0.4, "#f58a33"]];
  for (const [x, y, z, c] of bal) {
    p.add(esfera(0.72, 10, 8), c, [x, y, z], [0, 0, 0], [1.25, 0.85, 0.5]);
    p.add(new THREE.ConeGeometry(0.2, 0.42, 5), c, [x + 0.3, y - 0.7, z], [0, 0, 0.5]);
    for (const k of [-0.32, 0, 0.32]) p.add(esfera(0.08, 6, 4), TINTA, [x + k, y, z + 0.36]);
  }
}

function marcoNatureza(p: Pincel) {
  // Vulcão pequeno, cogumelos e cactos da caatinga.
  p.add(cilindro(3, 3.1, 12, 1), "#7b5a4d", [0, 1.5, -1]);
  p.add(cilindro(1.08, 0.32, 12, 0.95), "#ff6a3d", [0, 3.14, -1]);
  p.add(copa(0.55), "#f4f1ff", [0.25, 4.1, -1]);
  p.add(copa(0.75), "#f4f1ff", [-0.25, 5, -1.1]);
  for (const [x, z, a] of [[3.6, 1, 1], [4.4, -0.4, 0.7]] as const) {
    p.add(cilindro(0.2 * a, 1.05 * a, 8), "#fff6dc", [x, 0.5 * a, z]);
    p.add(esfera(0.72 * a, 12, 6), "#e8415e", [x, 1.05 * a, z], [0, 0, 0], [1, 0.6, 1]);
    p.add(esfera(0.13 * a, 6, 4), "#fff6dc", [x + 0.3 * a, 1.42 * a, z + 0.2 * a]);
  }
  for (const [x, z] of [[-3.7, 1.2], [-4.6, -0.6]] as const) {
    p.add(cilindro(0.26, 2.2, 8), "#148a55", [x, 1.1, z]);
    p.add(cilindro(0.15, 0.85, 8), "#148a55", [x + 0.48, 1.42, z]);
    p.add(caixa(0.5, 0.17, 0.17), "#148a55", [x + 0.24, 1.05, z]);
  }
}

function marcoHumanas(p: Pincel) {
  // Farol, colunas e jangada: história daqui e de longe.
  p.add(cilindro(0.95, 5.2, 12, 0.6), "#fff6dc", [-3, 2.6, -0.6]);
  for (const y of [1.2, 3.1]) p.add(cilindro(0.87 - y * 0.06, 0.55, 12, 0.84 - y * 0.06), "#c43d4e", [-3, y, -0.6]);
  p.add(cilindro(0.62, 0.8, 10), "#ffd257", [-3, 5.55, -0.6]);
  p.add(new THREE.ConeGeometry(0.85, 0.75, 10), "#c43d4e", [-3, 6.3, -0.6]);
  for (const x of [1.3, 2.75, 4.2]) {
    p.add(cilindro(0.34, 3, 10), "#fff6dc", [x, 1.5, -1.3]);
    p.add(caixa(0.9, 0.24, 0.9), "#e7d3a8", [x, 3.1, -1.3]);
  }
  p.add(caixa(4.1, 0.5, 1.05), "#e7d3a8", [2.75, 3.46, -1.3]);
  p.add(caixa(2.5, 0.2, 0.9), "#8c5a3c", [2.8, 0.25, 1.9]);
  p.add(cilindro(0.05, 2.5, 6), "#6d4a3a", [2.8, 1.5, 1.9]);
  p.add(new THREE.ConeGeometry(1, 2.1, 3), "#f7e9c8", [3.25, 1.7, 1.9], [0, 0, 0], [0.75, 1, 0.08]);
}

function marcoTecnologia(p: Pincel) {
  // Antena parabólica, torre e um robozinho parado, esperando.
  p.add(cilindro(0.34, 2.5, 8, 0.5), "#3d4f7d", [-3, 1.25, -0.6]);
  p.add(esfera(1.7, 14, 8), "#f4f1ff", [-3, 3, -0.6], [1.0, 0, 0.5], [1, 0.32, 1]);
  p.add(cilindro(0.07, 1, 6), "#f58a33", [-2.9, 3.5, -0.2], [0.9, 0, 0.4]);
  for (let i = 0; i < 5; i++) p.add(caixa(1.5 - i * 0.22, 0.14, 1.5 - i * 0.22), "#00a8a6", [3.3, 0.7 + i * 1, -1.2]);
  p.add(cilindro(0.1, 5.2, 6), "#20356f", [3.3, 2.6, -1.2]);
  p.add(esfera(0.26, 8, 6), "#ff6a3d", [3.3, 5.35, -1.2]);
  p.add(caixa(1.15, 1.2, 0.85), "#ffd257", [0.3, 0.92, 1.9]);
  p.add(caixa(0.92, 0.78, 0.82), "#f4f1ff", [0.3, 1.95, 1.9]);
  for (const x of [-0.08, 0.68]) p.add(esfera(0.12, 8, 6), TINTA, [x, 2, 2.3]);
  p.add(cilindro(0.04, 0.42, 5), TINTA, [0.3, 2.56, 1.9]);
  p.add(esfera(0.1, 6, 4), "#ff6a3d", [0.3, 2.82, 1.9]);
  for (const x of [-0.07, 0.68]) p.add(caixa(0.32, 0.4, 0.5), "#3d4f7d", [x, 0.2, 1.9]);
}

function marcoPesquisa(p: Pincel) {
  // Observatório e microscópio gigante.
  p.add(cilindro(2.3, 1.9, 16), "#f4f1ff", [-2.7, 0.95, -1]);
  p.add(esfera(2.3, 16, 8), "#7f4cc4", [-2.7, 1.9, -1], [0, 0, 0], [1, 0.9, 1]);
  p.add(cilindro(0.27, 2.8, 8, 0.4), "#20356f", [-2.1, 3.9, -0.5], [0.5, 0, -0.65]);
  p.add(cilindro(1.05, 0.28, 12), "#20356f", [3, 0.14, -1]);
  p.add(caixa(1.6, 0.14, 1.2), "#7f4cc4", [3, 1.2, -0.65]);
  p.add(cilindro(0.2, 2.8, 8), "#20356f", [3.2, 1.4, -1.6], [-0.1, 0, 0]);
  p.add(cilindro(0.34, 1.9, 10, 0.22), "#f58a33", [3, 2.55, -1], [0.42, 0, 0]);
  p.add(cilindro(0.18, 0.4, 8), "#00c9c8", [3, 1.55, -0.6], [0.42, 0, 0]);
}

const MARCOS: Record<string, (p: Pincel) => void> = {
  matematica: marcoMatematica,
  linguagens: marcoLinguagens,
  "linguas-estrangeiras": marcoLinguas,
  natureza: marcoNatureza,
  humanas: marcoHumanas,
  tecnologia: marcoTecnologia,
  pesquisa: marcoPesquisa,
};

const COPAS: Record<string, string[]> = {
  matematica: ["#7f4cc4", "#ffd257"],
  linguagens: ["#e8415e", "#ff8d5c"],
  "linguas-estrangeiras": ["#3f7fe0", "#fff6dc"],
  natureza: ["#148a55", "#0d6f6b"],
  humanas: ["#c43d4e", "#8c5a3c"],
  tecnologia: ["#00a8a6", "#3d4f7d"],
  pesquisa: ["#7f4cc4", "#ff8d5c"],
};

// ---------------------------------------------------- estante

const L_ESTANTE = 6.4;
const A_ESTANTE = 4.5;
const CAPA = { l: 1.14, a: 1.58 };

function escurecer(cor: string, q: number) {
  return `#${new THREE.Color(cor).lerp(new THREE.Color(TINTA), q).getHexString()}`;
}

function estante(p: Pincel, cor: string, materiais: number, sem: number) {
  const moldura = escurecer(cor, 0.34);
  const fundo = escurecer(cor, 0.76);
  p.add(caixa(L_ESTANTE, A_ESTANTE, 0.14), fundo, [0, A_ESTANTE / 2, -0.42]);
  for (const x of [-L_ESTANTE / 2, L_ESTANTE / 2]) p.add(caixa(0.24, A_ESTANTE + 0.1, 1), moldura, [x, A_ESTANTE / 2, 0]);
  for (const y of [0.09, 1.08, 2.28, A_ESTANTE]) p.add(caixa(L_ESTANTE + 0.1, 0.17, 1), moldura, [0, y, 0]);
  // Base com degrau, para a estante não parecer solta.
  p.add(caixa(L_ESTANTE + 0.9, 0.2, 1.8), escurecer(cor, 0.58), [0, 0.04, 0.2]);
  // Cada livro da prateleira de baixo é um material de verdade da área.
  const CORES = ["#fff6dc", "#ffd257", "#f58a33", "#e8415e", "#00c9c8", "#7f4cc4", "#3f7fe0", "#2fd27f", cor];
  const uteis = L_ESTANTE - 0.6;
  const larg = Math.min(0.52, uteis / Math.max(1, materiais) - 0.025);
  let x = -uteis / 2;
  for (let i = 0; i < materiais; i++) {
    const a = 0.82 - ((i * 5 + sem) % 4) * 0.08;
    p.add(caixa(larg, a, 0.58), CORES[(i * 3 + sem) % CORES.length], [x + larg / 2, 0.17 + a / 2, -0.03]);
    p.add(caixa(larg * 0.62, 0.07, 0.02), TINTA, [x + larg / 2, 0.17 + a * 0.72, 0.27]);
    p.add(caixa(larg * 0.62, 0.04, 0.02), TINTA, [x + larg / 2, 0.17 + a * 0.58, 0.27]);
    x += larg + 0.025;
  }
  // Prateleira do meio: troféus, tubos de ensaio e plantas, a casa de quem gosta de competir e descobrir.
  const y = 1.17;
  p.add(cilindro(0.2, 0.1, 10), "#7a5a1e", [-2.3, y + 0.05, 0]);
  p.add(cilindro(0.06, 0.26, 8), "#ffd257", [-2.3, y + 0.22, 0]);
  p.add(cilindro(0.16, 0.34, 12, 0.32), "#ffd257", [-2.3, y + 0.5, 0]);
  p.add(toro(0.14, 0.03, 12), "#ffd257", [-2.56, y + 0.52, 0]);
  p.add(toro(0.14, 0.03, 12), "#ffd257", [-2.04, y + 0.52, 0]);
  for (const [k, c] of [[-1.2, "#00c9c8"], [-0.95, "#e8415e"], [-0.7, "#2fd27f"]] as const) {
    p.add(cilindro(0.085, 0.62, 10), "#eaf6ff", [k, y + 0.34, 0]);
    p.add(cilindro(0.075, 0.32, 10), c, [k, y + 0.2, 0]);
  }
  p.add(caixa(1, 0.05, 0.22), "#8c5a3c", [-0.95, y + 0.03, 0]);
  p.add(cilindro(0.2, 0.3, 10, 0.15), "#c9673a", [0.55, y + 0.15, 0]);
  p.add(copa(0.32), "#148a55", [0.55, y + 0.55, 0], [0.4, 0.3, 0]);
  p.add(esfera(0.42, 12, 8), "#3f7fe0", [1.75, y + 0.5, 0]);
  p.add(cilindro(0.19, 0.08, 8), "#20356f", [1.75, y + 0.04, 0]);
  p.add(copa(0.17), "#2fd27f", [1.86, y + 0.62, 0.28]);
  pilhaMini(p, 2.65, y, CORES, sem);
}

function pilhaMini(p: Pincel, x: number, y: number, cores: string[], sem: number) {
  let alt = y;
  for (let i = 0; i < 4; i++) {
    p.add(caixa(0.7 - i * 0.05, 0.13, 0.48), cores[(i * 2 + sem) % cores.length], [x, alt + 0.065, 0], [0, (i % 2) * 0.2, 0]);
    alt += 0.13;
  }
}

function textura(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const fonte = () => (typeof document === "undefined" ? "" : getComputedStyle(document.body).getPropertyValue("--fonte-titulo").trim()) || "sans-serif";

function placa(titulo: string, cor: string) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 150;
  const g = c.getContext("2d")!;
  g.fillStyle = TINTA;
  g.beginPath();
  g.roundRect(0, 0, 768, 150, 28);
  g.fill();
  g.fillStyle = cor;
  g.beginPath();
  g.roundRect(9, 9, 750, 132, 22);
  g.fill();
  g.fillStyle = luminancia(cor) > 0.46 ? TINTA : "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let tam = 74;
  do {
    g.font = `800 ${tam}px ${fonte()}`;
    tam -= 3;
  } while (g.measureText(titulo).width > 700);
  g.fillText(titulo, 384, 80);
  return textura(c);
}

function luminancia(cor: string) {
  const c = new THREE.Color(cor);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/** Quebra o título em linhas e reduz a letra até caber. */
function linhas(g: CanvasRenderingContext2D, texto: string, largura: number, maxLinhas: number, peso: number, tamMax: number) {
  for (let t = tamMax; t >= 16; t -= 2) {
    g.font = `${peso} ${t}px ${fonte()}`;
    const r: string[] = [];
    let atual = "";
    for (const p of texto.split(" ")) {
      const nova = atual ? `${atual} ${p}` : p;
      if (g.measureText(nova).width > largura && atual) {
        r.push(atual);
        atual = p;
      } else atual = nova;
    }
    r.push(atual);
    if (r.length <= maxLinhas && r.every((x) => g.measureText(x).width <= largura)) return { r, t };
  }
  return { r: [`${texto.slice(0, 40)}...`], t: 16 };
}

/** As capas das fitas: um quadro só com todas elas, em estilo de cartaz impresso com retícula. */
export function pintarCapas(sitios: SitioBase[]) {
  const COL = 7;
  const FIL = 5;
  const W = 292;
  const H = 404;
  const c = document.createElement("canvas");
  c.width = COL * W;
  c.height = FIL * H;
  const g = c.getContext("2d")!;
  const posicao = new Map<string, number>();
  let n = 0;
  for (const s of sitios) {
    s.videos.forEach((vd, i) => {
      const x = (n % COL) * W;
      const y = Math.floor(n / COL) * H;
      posicao.set(`${s.id}:${i}`, n);
      g.save();
      g.translate(x, y);
      g.beginPath();
      g.rect(0, 0, W, H);
      g.clip();
      const claro = new THREE.Color(s.cor).lerp(new THREE.Color("#ffffff"), 0.12);
      g.fillStyle = `#${claro.getHexString()}`;
      g.fillRect(0, 0, W, H);
      // Retícula em diagonal.
      g.fillStyle = "rgba(29,24,54,.16)";
      for (let ly = 0; ly < 16; ly++) for (let lx = 0; lx < 12; lx++) {
        const r = 2 + (lx + ly) * 0.34;
        g.beginPath();
        g.arc(lx * 26 + (ly % 2) * 13, ly * 26, Math.min(r, 8), 0, 7);
        g.fill();
      }
      // Forma grande, diferente em cada fita.
      g.fillStyle = "rgba(255,255,255,.3)";
      g.strokeStyle = TINTA;
      g.lineWidth = 5;
      const forma = (n * 3 + i) % 3;
      g.beginPath();
      if (forma === 0) g.arc(W * 0.72, H * 0.76, 92, 0, 7);
      else if (forma === 1) {
        g.moveTo(W * 0.42, H);
        g.lineTo(W * 1.02, H * 0.48);
        g.lineTo(W * 1.02, H);
        g.closePath();
      } else g.rect(W * 0.5, H * 0.58, 200, 200);
      g.fill();
      g.stroke();
      // Botão de assistir.
      g.fillStyle = TINTA;
      g.beginPath();
      g.arc(W - 56, H - 56, 34, 0, 7);
      g.fill();
      g.fillStyle = "#ffd257";
      g.beginPath();
      g.moveTo(W - 67, H - 74);
      g.lineTo(W - 67, H - 38);
      g.lineTo(W - 36, H - 56);
      g.closePath();
      g.fill();
      // Título em caixa de quadrinho.
      const { r, t } = linhas(g, vd.titulo, W - 54, 6, 800, 37);
      const altoTexto = r.length * t * 1.14 + 24;
      g.fillStyle = "#fff9e8";
      g.strokeStyle = TINTA;
      g.lineWidth = 5;
      g.beginPath();
      g.roundRect(13, 14, W - 26, altoTexto, 12);
      g.fill();
      g.stroke();
      g.fillStyle = TINTA;
      g.textBaseline = "top";
      g.font = `800 ${t}px ${fonte()}`;
      r.forEach((l, k) => g.fillText(l, 26, 25 + k * t * 1.14));
      // Canal e duração.
      const info = linhas(g, vd.canal, W - 118, 2, 700, 21);
      g.fillStyle = TINTA;
      g.font = `700 ${info.t}px ${fonte()}`;
      info.r.forEach((l, k) => g.fillText(l, 16, H - 74 + k * info.t * 1.14));
      if (vd.duracao) {
        g.font = `800 19px ${fonte()}`;
        g.fillText(vd.duracao, 16, H - 28);
      }
      g.lineWidth = 8;
      g.strokeRect(4, 4, W - 8, H - 8);
      g.restore();
      n++;
    });
  }
  const t = textura(c);
  return { textura: t, posicao, col: COL, fil: FIL };
}

// ---------------------------------------------------- planeta inteiro

export function criarMundo(sitiosBase: SitioBase[], m: Materiais, movel: boolean, coletadas: string[]) {
  const grupo = new THREE.Group();
  const obstaculos: Obstaculo[] = [];
  const obstar = (dir: THREE.Vector3, raio: number) => {
    const a = (raio + 0.7) / RAIO;
    obstaculos.push({ dir: dir.clone().normalize(), raio, cos: Math.cos(a) });
  };

  // Chão
  const geo = new THREE.SphereGeometry(RAIO, movel ? 96 : 180, movel ? 64 : 120);
  const pos = geo.getAttribute("position");
  const aux = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    aux.fromBufferAttribute(pos, i).normalize();
    const r = RAIO + altura(aux);
    pos.setXYZ(i, aux.x * r, aux.y * r, aux.z * r);
  }
  geo.computeVertexNormals();
  const chaoTex = pintarChao(sitiosBase, movel ? 1792 : 3072);
  const chao = new THREE.Mesh(geo, m.nanquim(new THREE.MeshToonMaterial({ map: chaoTex, gradientMap: m.faixas })));
  chao.receiveShadow = true;
  grupo.add(chao);

  // Capas e pecas que se mexem
  const capas = pintarCapas(sitiosBase);
  const matCapa = new THREE.MeshBasicMaterial({ map: capas.textura, toneMapped: false });
  const sitios: Sitio[] = [];
  const coletas: Coleta[] = [];
  let sem = 91;
  const aleat = () => (sem = (sem * 16807) % 2147483647) / 2147483647;

  sitiosBase.forEach((s, ind) => {
    const dir = ponto(...POSICOES[s.id]);
    // A estante olha para a praça: é de lá que quase todo mundo chega.
    const yaw = 0;
    const mat = assentar(dir, 0, 0.06, PRACA);
    const q = new THREE.Quaternion().setFromRotationMatrix(mat);
    const frente = v(0, 0, 1).applyQuaternion(q).normalize();
    const lado = v(1, 0, 0).applyQuaternion(q).normalize();
    const regiao = new THREE.Group();

    const lote = new Lote();
    estante(pincel(lote, mat), s.cor, s.materiais, ind * 3 + 1);
    // O marco fica atrás da estante; afastado no sentido contrário à frente dela.
    const dirMarco = dir.clone().add(frente.clone().multiplyScalar(-6.4 / RAIO)).normalize();
    const matMarco = assentar(dirMarco, yaw, 0.06, PRACA);
    MARCOS[s.id](pincel(lote, matMarco));
    const pecas = lote.malha(m.desenho, m.contorno);
    // Em celular só os estudantes projetam sombra: o passe de sombra custa quase um quadro inteiro.
    if (movel) pecas.traverse((o) => (o.castShadow = false));
    regiao.add(pecas);

    // Obstáculos: a estante é larga, então leva três círculos; o marco, um grande.
    for (const k of [-2.4, 0, 2.4]) obstar(dir.clone().add(lado.clone().multiplyScalar(k / RAIO)), 1.1);
    obstar(dirMarco, 4);

    // Árvores da região, longe do que importa.
    const verde = new Lote();
    const copas = COPAS[s.id];
    for (let k = 0; k < 11; k++) {
      const ang = aleat() * Math.PI * 2;
      const dist = (7 + aleat() * 5.5) / RAIO;
      const eixo = lado.clone().applyAxisAngle(dir, ang);
      const d = dir.clone().add(eixo.multiplyScalar(dist)).normalize();
      // Nada na frente da estante.
      if (d.clone().sub(dir).normalize().dot(frente) > 0.45) continue;
      if (noCaminho(d)) continue;
      const a = 0.85 + aleat() * 0.75;
      if (k % 4 === 3) pilhaLivros(pincel(verde, assentar(d, aleat() * 6)), ["#fff6dc", s.cor, "#f58a33", "#3f7fe0", "#e8415e"], 3 + Math.floor(aleat() * 4), k);
      else arvore(pincel(verde, assentar(d, aleat() * 6)), copas[k % copas.length], a);
      obstar(d, 0.75);
    }
    // Em celular, árvores sem traço nem sombra projetada: é onde dá para economizar sem perder o desenho.
    const verdeM = verde.malha(m.desenho, movel ? null : m.contornoFino);
    if (movel) verdeM.traverse((o) => (o.castShadow = false));
    regiao.add(verdeM);

    // Estante com placa e fitas
    const est = new THREE.Group();
    est.applyMatrix4(mat);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.02), new THREE.MeshBasicMaterial({ map: placa(s.titulo, s.cor), toneMapped: false, transparent: true }));
    pl.position.set(0, A_ESTANTE + 0.72, 0.1);
    est.add(pl);
    for (const x of [-2.1, 2.1]) {
      const haste = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), new THREE.MeshBasicMaterial({ color: TINTA }));
      haste.position.set(x, A_ESTANTE + 0.18, 0.05);
      est.add(haste);
    }

    const fitas: Fita[] = [];
    const n = s.videos.length;
    const passo = Math.min(1.26, (L_ESTANTE - 0.5) / Math.max(1, n));
    s.videos.forEach((_, i) => {
      const geoFita = new THREE.BoxGeometry(CAPA.l, CAPA.a, 0.14);
      const uv = geoFita.getAttribute("uv");
      const slot = capas.posicao.get(`${s.id}:${i}`)!;
      const u0 = (slot % capas.col) / capas.col;
      const v1 = 1 - Math.floor(slot / capas.col) / capas.fil;
      const du = 1 / capas.col;
      const dv = 1 / capas.fil;
      // Todas as faces usam a mesma capa; as bordas são finas demais para notar.
      for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) * du, v1 - dv + uv.getY(k) * dv);
      const malha = new THREE.Mesh(geoFita, matCapa);
      const contorno = new THREE.Mesh(geoFita, m.contornoFino);
      const base = v((i - (n - 1) / 2) * passo, 3.17, 0.08);
      malha.position.copy(base);
      malha.rotation.x = -0.05;
      malha.userData = { sitio: s.id, indice: i };
      malha.add(contorno);
      est.add(malha);
      fitas.push({ malha, contorno, base, saida: 0, alvo: 0, atraso: 0 });
    });

    const alvo = new THREE.Mesh(new THREE.BoxGeometry(L_ESTANTE + 1, A_ESTANTE + 2.2, 2), new THREE.MeshBasicMaterial({ visible: false }));
    alvo.position.set(0, A_ESTANTE / 2 + 0.8, 0);
    alvo.userData.sitio = s.id;
    est.add(alvo);
    regiao.add(est);
    grupo.add(regiao);

    const pontoParada = dir.clone().add(frente.clone().multiplyScalar(4.1 / RAIO)).normalize();
    sitios.push({ ...s, dir, frente, ponto: pontoParada, grupo: regiao, estante: est, fitas, alvo });

    // Fita dourada escondida atrás do marco ou ao lado da região.
    const idColeta = `dourada-${s.id}`;
    if (!coletadas.includes(idColeta)) {
      const dc = dir.clone().add(lado.clone().multiplyScalar(((ind % 2 ? 1 : -1) * 8.6) / RAIO)).add(frente.clone().multiplyScalar(-3 / RAIO)).normalize();
      const c = fitaDourada();
      c.applyMatrix4(assentar(dc, 0, -1.25));
      regiao.add(c);
      coletas.push({ id: idColeta, dir: dc, malha: c });
    }
  });

  // Praça de chegada
  const praca = new Lote();
  const pp = pincel(praca, assentar(PRACA, 0.3));
  pp.add(cilindro(2.2, 0.35, 16), "#20356f", [0, 0.17, -5.2]);
  pp.add(toro(2.1, 0.22, 20), "#fdc13f", [0, 0.42, -5.2], [Math.PI / 2, 0, 0]);
  pp.add(cilindro(0.3, 1.5, 8), "#f4f1ff", [0, 1, -5.2]);
  const mPilha = assentar(PRACA, 0.3).multiply(new THREE.Matrix4().makeTranslation(4.4, 0, -2.6));
  pilhaLivros(pincel(praca, mPilha), ["#f58a33", "#00c9c8", "#fdc13f", "#e8415e", "#7f4cc4"], 7, 2);
  obstar(v(0, 0, 0).applyMatrix4(mPilha).normalize(), 1);
  for (const [x, z] of [[-6, -2.4], [6, -2.4], [-4.6, 4.6], [4.6, 4.6]] as const) {
    pp.add(cilindro(0.09, 2.5, 6), "#20356f", [x, 1.25, z]);
    pp.add(esfera(0.34, 8, 6), "#ffd257", [x, 2.6, z]);
  }
  grupo.add(praca.malha(m.desenho, m.contornoFino));
  const lp = v(0, 0, -5.2).applyMatrix4(assentar(PRACA, 0.3)).normalize();
  obstar(lp, 2.5);

  // Nuvens que passam
  const nuvens = new Lote();
  for (let i = 0; i < 18; i++) {
    const d = v(aleat() - 0.5, aleat() - 0.5, aleat() - 0.5).normalize();
    const mn = new THREE.Matrix4().compose(d.clone().multiplyScalar(RAIO + 11 + aleat() * 4), new THREE.Quaternion().setFromUnitVectors(v(0, 1, 0), d), v(1, 1, 1));
    const pn = pincel(nuvens, mn);
    pn.add(copa(1.5), "#fff4e6", [0, 0, 0], [0, 0, 0], [1.1, 0.55, 1]);
    pn.add(copa(1.05), "#fff4e6", [1.3, 0.05, 0.3], [0, 0, 0], [1, 0.6, 1]);
    pn.add(copa(0.95), "#fff4e6", [-1.25, 0, -0.2], [0, 0, 0], [1, 0.55, 1]);
  }
  const nuvensM = nuvens.malha(m.desenho, m.contornoFino);
  nuvensM.traverse((o) => (o.castShadow = false));
  grupo.add(nuvensM);

  // Anel de livros em órbita: dá para vê-lo de qualquer ponto do planeta.
  const NL = movel ? 46 : 80;
  // Livro aberto batendo as capas, visto de longe como um passarinho de papel.
  const asaE = new THREE.BoxGeometry(0.72, 0.09, 1.05);
  asaE.translate(-0.36, 0, 0);
  asaE.rotateZ(-0.62);
  const asaD = new THREE.BoxGeometry(0.72, 0.09, 1.05);
  asaD.translate(0.36, 0, 0);
  asaD.rotateZ(0.62);
  const livro = mergeGeometries([asaE, asaD])!;
  const anel = new THREE.InstancedMesh(livro, new THREE.MeshBasicMaterial({ toneMapped: false }), NL);
  const CORES = ["#ffd257", "#f58a33", "#00c9c8", "#fff6dc", "#e8415e", "#c9a0ff", "#2fd27f"];
  const d = new THREE.Object3D();
  const cor = new THREE.Color();
  for (let i = 0; i < NL; i++) {
    const a = aleat() * Math.PI * 2;
    const r = RAIO * (2 + aleat() * 0.5);
    d.position.set(Math.cos(a) * r, (aleat() - 0.5) * 7, Math.sin(a) * r);
    d.rotation.set((aleat() - 0.5) * 0.7, -a, (aleat() - 0.5) * 0.7);
    d.scale.setScalar(1.3 + aleat() * 1.3);
    d.updateMatrix();
    anel.setMatrixAt(i, d.matrix);
    anel.setColorAt(i, cor.set(CORES[i % CORES.length]));
  }
  anel.rotation.set(0.5, 0, 0.32);
  anel.frustumCulled = false;
  const traco = new THREE.InstancedMesh(
    livro,
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: "void main(){ vec3 p = position + normalize(position) * .1; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.); }",
      fragmentShader: "void main(){ gl_FragColor = vec4(.114, .094, .212, 1.); }",
    }),
    NL,
  );
  for (let i = 0; i < NL; i++) {
    anel.getMatrixAt(i, d.matrix);
    traco.setMatrixAt(i, d.matrix);
  }
  traco.frustumCulled = false;
  anel.add(traco);
  grupo.add(anel);

  return { grupo, sitios, obstaculos, coletas, nuvens: nuvensM, anel, chao };
}

function fitaDourada() {
  const c = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.2), new THREE.MeshBasicMaterial({ color: "#ffd257", toneMapped: false }));
  const contorno = new THREE.Mesh(corpo.geometry, materialContorno(TINTA, 0.05));
  const miolo = new THREE.Mesh(new THREE.CircleGeometry(0.27, 16), new THREE.MeshBasicMaterial({ color: "#f58a33", toneMapped: false }));
  miolo.position.z = 0.11;
  const miolo2 = miolo.clone();
  miolo2.position.z = -0.11;
  miolo2.rotation.y = Math.PI;
  c.add(corpo, contorno, miolo, miolo2);
  return c;
}

function noCaminho(d: THREE.Vector3) {
  for (const [a, b] of trilhas()) {
    const n = a.clone().cross(b).normalize();
    if (Math.abs(d.dot(n)) < 0.075 && d.dot(a) > a.dot(b) && d.dot(b) > a.dot(b)) return true;
  }
  return false;
}

/** Céu de fim de tarde: pêssego no horizonte, violeta no alto, com estrelas de tinta. */
export function criarCeu() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: { uCima: { value: v(0, 1, 0) } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
    fragmentShader: `
      varying vec3 vD; uniform vec3 uCima;
      float estrela(vec3 d){ vec3 c = floor(d * 90.); float h = fract(sin(dot(c, vec3(12.9, 78.2, 37.7))) * 43758.5); if (h < .985) return 0.; vec3 f = fract(d * 90.) - .5; return smoothstep(.34, .12, length(f)); }
      void main(){
        vec3 d = normalize(vD);
        float t = dot(d, uCima);
        vec3 a = vec3(1.0, .72, .55);
        vec3 b = vec3(.98, .44, .56);
        vec3 c = vec3(.40, .24, .72);
        vec3 e = vec3(.10, .10, .36);
        vec3 col = mix(a, b, smoothstep(-.42, -.02, t));
        col = mix(col, c, smoothstep(-.02, .34, t));
        col = mix(col, e, smoothstep(.34, .9, t));
        col = mix(col, vec3(1.,.97,.85), estrela(d) * smoothstep(.02, .32, t));
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 20), mat);
  ceu.renderOrder = -10;
  ceu.frustumCulled = false;
  return ceu;
}

export { TINTA };
