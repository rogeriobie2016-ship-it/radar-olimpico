// Capas dos jogos, desenhadas em 3D com o mesmo traço do Planeta Estante. Roda no navegador, por scripts/capas/gerar.mjs.
// O título não entra na imagem: é texto de verdade na página.
import * as THREE from "three";
import { caixa, capsula, cilindro, esfera, Lote, torno, toro } from "../../src/lab/lote";
import { criarPersonagem, type Quem } from "../../src/lab/personagem";
import { tingir } from "../../src/planeta/motor";
import { criarMateriais, TINTA, type Materiais } from "../../src/planeta/mundo";

type V3 = [number, number, number];
type Ctx = { cena: THREE.Scene; l: Lote; fino: Lote; m: Materiais; rotulo: (txt: string, cor: string, tinta: string, pos: V3, tam?: number, rot?: V3) => void; boneco: (q: Quem, pos: V3, yaw: number, ajuste?: (p: ReturnType<typeof criarPersonagem>) => void) => void; chao: (a: string, b: string, raio?: number) => void; nuvem: (x: number, y: number, z: number, e?: number, cor?: string) => void };
type Capa = { slug: string; ceu: [string, string, string]; estrelas?: boolean; camera?: { pos: V3; olha: V3; fov?: number }; montar: (c: Ctx) => void };

const copa = (r: number) => new THREE.IcosahedronGeometry(r, 1);
const ICO = (r: number) => new THREE.IcosahedronGeometry(r, 0);
const cone = (r: number, a: number, s = 12) => new THREE.ConeGeometry(r, a, s);

function ceu(cores: [string, string, string], estrelas: boolean) {
  const c = document.createElement("canvas");
  c.width = 300;
  c.height = 420;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 420);
  gr.addColorStop(0, cores[0]);
  gr.addColorStop(0.55, cores[1]);
  gr.addColorStop(1, cores[2]);
  g.fillStyle = gr;
  g.fillRect(0, 0, 300, 420);
  if (estrelas) {
    g.fillStyle = "#fff8e0";
    let s = 7;
    const a = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) {
      g.beginPath();
      g.arc(a() * 300, a() * 300, 0.5 + a() * 1.3, 0, 7);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function montarCtx(cena: THREE.Scene, m: Materiais): Ctx {
  const l = new Lote();
  const fino = new Lote();
  return {
    cena,
    l,
    fino,
    m,
    rotulo(txt, cor, tinta, pos, tam = 0.9, rot = [0, 0, 0]) {
      const c = document.createElement("canvas");
      const larg = Math.max(1, txt.length * 0.62);
      c.width = Math.round(160 * larg);
      c.height = 160;
      const g = c.getContext("2d")!;
      g.fillStyle = cor;
      g.fillRect(0, 0, c.width, 160);
      g.fillStyle = tinta;
      g.font = `900 ${txt.length > 3 ? 92 : 112}px "Arial Black", Arial, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(txt, c.width / 2, 86);
      const tx = new THREE.CanvasTexture(c);
      tx.colorSpace = THREE.SRGBColorSpace;
      tx.anisotropy = 8;
      const w = tam * larg;
      const corpo = new THREE.Mesh(new THREE.BoxGeometry(w, tam, 0.2), [0, 0, 0, 0].map(() => new THREE.MeshBasicMaterial({ color: cor })).concat([new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }), new THREE.MeshBasicMaterial({ color: cor })]));
      const traco = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, tam + 0.1, 0.26), new THREE.MeshBasicMaterial({ color: TINTA, side: THREE.BackSide }));
      corpo.add(traco);
      corpo.position.set(...pos);
      corpo.rotation.set(...rot);
      cena.add(corpo);
    },
    boneco(q, pos, yaw, ajuste) {
      const p = criarPersonagem(q);
      tingir(p.raiz, m);
      ajuste?.(p);
      p.atualizar(0.3, 1.2);
      const grupo = new THREE.Group();
      grupo.add(p.raiz);
      grupo.position.set(...pos);
      grupo.rotation.y = yaw;
      cena.add(grupo);
    },
    chao(a, b, raio = 18) {
      const c = document.createElement("canvas");
      c.width = 2048;
      c.height = 1024;
      const g = c.getContext("2d")!;
      g.fillStyle = a;
      g.fillRect(0, 0, 2048, 1024);
      let s = 31;
      const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      g.fillStyle = b;
      for (let i = 0; i < 90; i++) {
        g.beginPath();
        g.ellipse(r() * 2048, r() * 1024, 20 + r() * 90, 8 + r() * 26, r() * 0.5, 0, 7);
        g.fill();
      }
      g.strokeStyle = "rgba(29,24,54,.5)";
      g.lineWidth = 2.4;
      g.lineCap = "round";
      for (let i = 0; i < 900; i++) {
        const x = r() * 2048;
        const y = r() * 1024;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + 4, y - 6, x + 11, y - 1);
        g.stroke();
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(raio, 96, 64), m.nanquim(new THREE.MeshToonMaterial({ map: t, gradientMap: m.faixas })));
      mesh.position.y = -raio;
      mesh.rotation.x = Math.PI / 2;
      mesh.receiveShadow = true;
      cena.add(mesh);
      const borda = new THREE.Mesh(new THREE.SphereGeometry(raio + 0.05, 64, 40), new THREE.MeshBasicMaterial({ color: TINTA, side: THREE.BackSide }));
      borda.position.y = -raio;
      cena.add(borda);
    },
    nuvem(x, y, z, e = 1, cor = "#fff4e6") {
      fino.add(copa(0.9 * e), cor, [x, y, z], [0, 0, 0], [1.2, 0.6, 0.8]);
      fino.add(copa(0.62 * e), cor, [x + 0.85 * e, y - 0.05 * e, z], [0, 0, 0], [1, 0.62, 0.8]);
      fino.add(copa(0.56 * e), cor, [x - 0.85 * e, y - 0.08 * e, z], [0, 0, 0], [1, 0.6, 0.8]);
    },
  };
}

function foguete(l: Lote, pos: V3, rot: V3, e = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
  const em = (x: number, y: number, z: number): V3 => {
    const v = new THREE.Vector3(x * e, y * e, z * e).applyQuaternion(q);
    return [pos[0] + v.x, pos[1] + v.y, pos[2] + v.z];
  };
  l.add(cilindro(0.42 * e, 1.7 * e, 14, 0.42 * e), "#f4f1ff", em(0, 0, 0), rot);
  l.add(cone(0.42 * e, 0.85 * e, 14), "#e8415e", em(0, 1.27 * e, 0), rot);
  l.add(cilindro(0.46 * e, 0.16 * e, 14, 0.46 * e), "#e8415e", em(0, -0.5, 0), rot);
  l.add(esfera(0.2 * e, 10, 8), "#00c9c8", em(0, 0.35, 0.34), rot);
  for (const [x, z] of [[0.48, 0], [-0.48, 0], [0, 0.48], [0, -0.48]] as const) l.add(caixa(0.3 * e + 0.02, 0.6 * e, 0.3 * e), "#f58a33", em(x, -0.72, z), rot, [Math.abs(x) > 0 ? 1 : 0.3, 1, Math.abs(z) > 0 ? 1 : 0.3]);
  l.add(cone(0.3 * e, 0.9 * e, 10), "#ffd257", em(0, -1.32, 0), [rot[0] + Math.PI, rot[1], rot[2]]);
}

export const CAPAS: Capa[] = [
  {
    slug: "orbita-numerica",
    ceu: ["#12113f", "#3a2a8c", "#0f9fb4"],
    estrelas: true,
    montar({ l, chao, rotulo }) {
      chao("#6c5aa8", "#574590", 16);
      // Nave em blocos, como pixel art.
      const P = ["...T...", "..TWT..", "..WBW..", ".WWBWW.", "OWWWWWO", "O.RRR.O", "...Y..."];
      const cores: Record<string, string> = { T: "#00c9c8", W: "#f4f1ff", B: "#3f7fe0", O: "#f58a33", R: "#e8415e", Y: "#ffd257" };
      P.forEach((lin, j) => [...lin].forEach((ch, i) => {
        if (cores[ch]) l.add(caixa(0.44, 0.44, 0.44), cores[ch], [(i - 3) * 0.46, 3.55 - j * 0.46, 0]);
      }));
      for (const [x, y, z, r] of [[-2.5, 5.8, -1, 0.72], [2.6, 3.4, -1.2, 0.55], [-2.8, 1.9, -0.5, 0.45], [2.3, 6.2, -2, 0.38]] as const) l.add(ICO(r), "#8d86a8", [x, y, z], [x, y, 0]);
      for (const [x, z] of [[-3, 0.6], [1.7, 1.3], [3, -0.6], [-0.9, 2.4]] as const) l.add(toro(0.42, 0.08, 14), "#493a7c", [x, 0.02, z], [Math.PI / 2, 0, 0]);
      rotulo("12", "#ffd257", TINTA, [-1.7, 5.15, 1], 0.72, [0, 0.25, -0.12]);
      rotulo("×7", "#2fd27f", TINTA, [0.1, 6.1, 1], 0.72, [0, -0.1, 0.08]);
      rotulo("81", "#ff8d5c", TINTA, [1.75, 5.05, 1], 0.72, [0, -0.25, 0.14]);
    },
  },
  {
    slug: "alvo",
    ceu: ["#c9264e", "#f4728e", "#ffd2a0"],
    montar({ l, chao, rotulo }) {
      chao("#ffe6a8", "#f6d283");
      const c: V3 = [0, 3.5, 0];
      const giro: V3 = [Math.PI / 2, 0, 0];
      ([[2.45, "#1d1836", 0.28], [2.3, "#f4f1ff", 0.36], [1.75, "#e8415e", 0.42], [1.2, "#f4f1ff", 0.48], [0.68, "#ffd257", 0.54]] as const).forEach(([r, cor, a]) => l.add(cilindro(r, a, 40), cor, c, giro));
      for (const x of [-1.25, 1.25]) l.add(caixa(0.26, 3.1, 0.26), "#8c5a3c", [x, 1.05, -0.42], [0.1, 0, x * 0.12]);
      // Flecha cravada no centro.
      l.add(cilindro(0.07, 3.3, 8), "#20356f", [0.95, 4.05, 1.4], [1.05, 0, -0.42]);
      for (const k of [0, 2.1, 4.2]) l.add(caixa(0.5, 0.42, 0.04), "#00c9c8", [1.82, 4.56, 2.8], [0.9, k, 0]);
      rotulo("8", "#7f4cc4", "#ffffff", [-2.45, 6.3, 0.6], 0.82, [0, 0.3, -0.2]);
      rotulo("×", "#ffd257", TINTA, [-0.75, 6.55, 0.8], 0.72, [0, 0.1, 0.12]);
      rotulo("3", "#3f7fe0", "#ffffff", [0.7, 6.5, 0.8], 0.82, [0, -0.1, -0.1]);
      rotulo("24", "#2fd27f", TINTA, [2.3, 6.2, 0.6], 0.8, [0, -0.3, 0.16]);
    },
  },
  {
    slug: "arquivo-perdido",
    ceu: ["#5e2412", "#d9722e", "#f9cf79"],
    montar({ l, chao, boneco, rotulo }) {
      chao("#c98a3a", "#a96d27");
      // Saturno visto de Titã.
      l.add(esfera(1.7, 28, 18), "#f6e0a6", [1.6, 6.3, -9]);
      l.add(toro(2.7, 0.16, 40), "#fff1c9", [1.6, 6.3, -9], [1.3, 0.25, 0]);
      l.add(toro(2.35, 0.1, 40), "#d9a860", [1.6, 6.3, -9], [1.3, 0.25, 0]);
      // Estação danificada.
      l.add(esfera(2.15, 24, 14), "#e9edf5", [-1.05, 0.2, -2.4], [0, 0, 0], [1, 0.92, 1]);
      l.add(caixa(1.15, 1.05, 0.2), "#20356f", [-0.7, 1.3, -0.35]);
      for (const y of [1.08, 1.32, 1.56]) l.add(caixa(0.78, 0.07, 0.04), "#2fd27f", [-0.7, y, -0.22]);
      l.add(cilindro(0.09, 3.2, 8), "#20356f", [-2.5, 3.2, -2.3], [0, 0, 0.13]);
      l.add(esfera(0.75, 14, 8), "#f4f1ff", [-2.75, 4.7, -2.3], [0.9, 0, 0.4], [1, 0.34, 1]);
      l.add(caixa(0.14, 0.14, 0.14), "#ff6a3d", [-2.4, 4.95, -2]);
      // Mensagens voando.
      for (const [x, y, r] of [[1.9, 3.7, 0.4], [0.5, 4.5, -0.3], [2.5, 2.6, -0.5], [-0.4, 3.5, 0.7]] as const) {
        l.add(caixa(0.78, 1, 0.03), "#fff9e8", [x, y, 0.6], [0.2, 0.3, r]);
        l.add(caixa(0.5, 0.06, 0.02), TINTA, [x, y + 0.2, 0.66], [0.2, 0.3, r]);
        l.add(caixa(0.5, 0.06, 0.02), TINTA, [x, y, 0.66], [0.2, 0.3, r]);
      }
      boneco("menina", [1.25, -0.05, 1.8], -0.55);
      rotulo("?", "#ffd257", TINTA, [2.3, 3.95, 1.9], 0.7, [0, -0.2, 0.2]);
    },
  },
  {
    slug: "lingua-galactica",
    ceu: ["#101352", "#3c2aa0", "#c64bb4"],
    estrelas: true,
    montar({ l, chao, rotulo }) {
      chao("#18b4a8", "#0d9690", 15);
      // Trilha de astros, como lições.
      const A: [number, number, number, string][] = [[-2.3, 1.55, 0.72, "#ff8d5c"], [1.15, 2.7, 0.92, "#ffd257"], [-1.1, 4.5, 0.82, "#2fd27f"], [1.75, 6.05, 1.1, "#f4728e"]];
      for (let i = 0; i < A.length - 1; i++) {
        for (let k = 1; k < 6; k++) {
          const t = k / 6;
          l.add(esfera(0.07, 8, 6), "#fff6dc", [A[i][0] + (A[i + 1][0] - A[i][0]) * t, A[i][1] + (A[i + 1][1] - A[i][1]) * t, -0.2]);
        }
      }
      A.forEach(([x, y, r, c]) => l.add(esfera(r, 22, 14), c, [x, y, -0.2]));
      l.add(toro(1.55, 0.09, 36), "#fff6dc", [1.75, 6.05, -0.2], [1.25, 0.3, 0]);
      l.add(esfera(0.22, 8, 6), "#c43d4e", [-2.1, 1.85, 0.42]);
      l.add(esfera(0.17, 8, 6), "#e9844f", [1.42, 3.05, 0.58]);
      foguete(l, [-2.65, 4.2, 0.2], [0, 0, -0.5], 0.55);
      rotulo("Hello!", "#fff9e8", TINTA, [-1.35, 6.2, 1], 0.68, [0, 0.14, -0.08]);
      rotulo("¡Hola!", "#ffd257", TINTA, [1.15, 4.35, 1.3], 0.62, [0, -0.14, 0.09]);
    },
  },
  {
    slug: "nave-celular",
    ceu: ["#6d1650", "#e6618a", "#ffc4a6"],
    montar({ l, fino, chao }) {
      chao("#f28aa0", "#e56f8c", 14);
      // Núcleo
      l.add(esfera(2, 28, 18), "#7f4cc4", [-1.65, 5.4, -3.2]);
      l.add(esfera(0.72, 16, 10), "#3e2277", [-1.15, 5.65, -1.65]);
      for (const [x, y] of [[-2.7, 6.3], [-1.05, 4.4], [-2.7, 4.5], [-0.4, 6.4]] as const) l.add(esfera(0.1, 8, 6), "#ffd257", [x, y, -1.5]);
      // Mitocôndria
      l.add(capsula(0.86, 2.3), "#ff8d3c", [2.05, 1.65, -0.8], [0, 0, 1.2]);
      l.add(capsula(0.56, 1.95), "#ffc58a", [2.05, 1.65, -0.42], [0, 0, 1.2], [1, 1, 0.7]);
      // As cristas ficam atravessadas no eixo da mitocôndria, alternando de lado.
      [-1, -0.5, 0, 0.5, 1].forEach((k, i) => l.add(caixa(0.13, 0.66, 0.08), "#c8461c", [2.05 + k * 0.93 + (i % 2 ? 0.09 : -0.09), 1.65 - k * 0.36 + (i % 2 ? 0.24 : -0.24), 0.04], [0, 0, -0.37]));
      // Retículo e ribossomos
      for (let i = 0; i < 4; i++) l.add(toro(0.9 + i * 0.28, 0.09, 26, 2.2), "#ffd9e4", [2.5, 5.8, -1.5], [0.2, 0.2, 2.6]);
      for (let i = 0; i < 16; i++) {
        const a = 2.5 + i * 0.16;
        fino.add(esfera(0.1, 8, 6), "#20356f", [2.5 + Math.cos(a) * (1 + (i % 4) * 0.28), 5.8 + Math.sin(a) * (1 + (i % 4) * 0.28), -1.1]);
      }
      // Nave em miniatura
      l.add(capsula(0.36, 0.9), "#00d4d0", [-0.35, 2.75, 1.5], [0, 0, -1.05]);
      l.add(esfera(0.3, 14, 10), "#e9f8ff", [0.13, 3.04, 1.65]);
      l.add(caixa(0.8, 0.09, 0.42), "#f4f1ff", [-0.65, 2.6, 1.5], [0, 0.2, 0.5]);
      l.add(cone(0.2, 0.7, 10), "#ffd257", [-1.05, 2.25, 1.5], [0, 0, 2.08]);
      for (const [x, y, z, r] of [[-2.6, 1.6, 0.8, 0.26], [0.1, 0.7, 1.9, 0.2], [-2.8, 2.9, 0, 0.16], [2.8, 3.6, 0, 0.2]] as const) fino.add(esfera(r, 12, 8), "#ffe56a", [x, y, z]);
    },
  },
  {
    slug: "lancamento",
    ceu: ["#274aa8", "#46a7dd", "#ffdca0"],
    montar({ l, fino, chao, nuvem }) {
      chao("#6cd97c", "#4cbd67");
      // Rastro em arco, do chão até o foguete.
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        const x = -2.35 + t * 2.9;
        const y = 1 + t * 3.1;
        fino.add(copa(0.62 - t * 0.42), i % 2 ? "#fff4e6" : "#ffe6c6", [x, y, 0.2], [i, i, 0]);
      }
      foguete(l, [1.45, 5.25, 0.2], [0, 0, -0.62], 1.15);
      // Rampa
      l.add(caixa(1.9, 0.24, 1.2), "#20356f", [-2.3, 0.75, 0], [0, 0, 0.62]);
      l.add(caixa(0.22, 0.95, 0.8), "#3d4f7d", [-1.65, 0.45, 0]);
      // Alvo no morro
      l.add(cilindro(0.09, 1.5, 8), "#8c5a3c", [2.6, 0.45, -0.6]);
      l.add(cilindro(0.78, 0.1, 24), "#f4f1ff", [2.6, 1.25, -0.5], [Math.PI / 2, 0, 0]);
      l.add(cilindro(0.5, 0.14, 24), "#e8415e", [2.6, 1.25, -0.5], [Math.PI / 2, 0, 0]);
      l.add(cilindro(0.22, 0.18, 20), "#ffd257", [2.6, 1.25, -0.5], [Math.PI / 2, 0, 0]);
      nuvem(-2.2, 6, -3, 1);
      nuvem(2.6, 3, -3, 0.75);
    },
  },
  {
    slug: "balanco",
    ceu: ["#5a2ea6", "#b75cc8", "#ffd27a"],
    montar({ l, chao, rotulo }) {
      chao("#4a35a0", "#3b2a86");
      // Balança de dois pratos
      l.add(cilindro(1.1, 0.3, 28, 0.9), "#ffd257", [0, 0.15, 0]);
      l.add(cilindro(0.17, 3.75, 12), "#ffd257", [0, 2.1, 0]);
      l.add(esfera(0.34, 14, 10), "#f58a33", [0, 4.05, 0]);
      l.add(caixa(5, 0.22, 0.3), "#ffd257", [0, 4, 0], [0, 0, -0.09]);
      for (const [x, y] of [[-2.3, 4.2], [2.3, 3.8]] as const) {
        const p = y - 1.95;
        for (const d of [-0.75, 0.75]) l.add(cilindro(0.022, 2.1, 5), TINTA, [x + d / 2, y - 1, 0], [0, 0, d * 0.34]);
        l.add(cilindro(0.95, 0.12, 26, 1.02), "#f4f1ff", [x, p, 0]);
      }
      // Molécula de água, de um lado
      const py = 2.25 + 0.55;
      l.add(esfera(0.6, 20, 14), "#e8415e", [-2.3, py, 0.1]);
      l.add(esfera(0.35, 16, 12), "#f4f1ff", [-2.85, py + 0.45, 0.2]);
      l.add(esfera(0.35, 16, 12), "#f4f1ff", [-1.75, py + 0.45, 0.2]);
      // Oxigênio e hidrogênio, do outro
      const qy = 1.85 + 0.42;
      l.add(esfera(0.42, 18, 12), "#3f7fe0", [1.95, qy, 0.1]);
      l.add(esfera(0.42, 18, 12), "#3f7fe0", [2.6, qy + 0.25, 0.1]);
      l.add(esfera(0.28, 14, 10), "#2fd27f", [2.3, qy + 0.72, 0.1]);
      rotulo("+", "#ffd257", TINTA, [-2.35, 5.4, 0.5], 0.72, [0, 0.2, -0.12]);
      rotulo("=", "#fff9e8", TINTA, [0, 5.75, 0.6], 0.72, [0, 0, 0.05]);
      rotulo("−", "#2fd27f", TINTA, [2.25, 5.25, 0.5], 0.72, [0, -0.2, 0.12]);
    },
  },
  {
    slug: "crononauta",
    ceu: ["#120f4a", "#4a1f96", "#e4498e"],
    estrelas: true,
    montar({ l, fino, chao }) {
      chao("#3a2a7c", "#2d2066", 16);
      // Portal do tempo
      l.add(toro(2.75, 0.3, 60), "#ffd257", [0, 3.7, -2]);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        l.add(caixa(0.26, 0.58, 0.46), "#f58a33", [Math.cos(a) * 3.05, 3.7 + Math.sin(a) * 3.05, -2], [0, 0, a + Math.PI / 2]);
      }
      l.add(cilindro(2.65, 0.05, 48), "#00c9c8", [0, 3.7, -2.15], [Math.PI / 2, 0, 0]);
      for (let i = 0; i < 4; i++) l.add(toro(0.6 + i * 0.52, 0.055, 40, 4.6), "#c9fff9", [0, 3.7, -2.05], [0, 0, i * 1.6]);
      // Ampulheta gigante
      const v: [number, number][] = [[1.05, 0], [1.05, 0.1], [0.9, 0.55], [0.5, 1.2], [0.11, 1.75], [0.5, 2.3], [0.9, 2.95], [1.05, 3.4], [1.05, 3.5]];
      l.add(torno(v, 28), "#d6f6ff", [0, 0.38, 0.8]);
      l.add(cilindro(1.3, 0.24, 28), "#8c5a3c", [0, 0.22, 0.8]);
      l.add(cilindro(1.3, 0.24, 28), "#8c5a3c", [0, 4, 0.8]);
      for (const a of [0.8, 2.35, 3.9, 5.45]) l.add(cilindro(0.075, 3.6, 8), "#8c5a3c", [Math.cos(a) * 1.15, 2.1, 0.8 + Math.sin(a) * 1.15]);
      l.add(cone(0.74, 0.86, 20), "#ffd257", [0, 2.8, 0.82], [Math.PI, 0, 0]);
      l.add(cone(0.84, 0.72, 20), "#ffd257", [0, 0.86, 0.82]);
      // Pergaminhos
      for (const [x, y, r] of [[-2.55, 1.8, 0.5], [2.55, 2.2, -0.45], [-2.5, 5.9, -0.3], [2.5, 6.1, 0.4]] as const) {
        l.add(caixa(0.86, 1.08, 0.04), "#f2dcaa", [x, y, 0.7], [0, 0, r]);
        l.add(cilindro(0.09, 0.98, 10), "#d6b676", [x + Math.sin(r) * 0.54, y + Math.cos(r) * 0.54, 0.74], [0, 0, r + Math.PI / 2]);
        fino.add(caixa(0.55, 0.05, 0.02), TINTA, [x, y + 0.1, 0.74], [0, 0, r]);
        fino.add(caixa(0.55, 0.05, 0.02), TINTA, [x, y - 0.1, 0.74], [0, 0, r]);
      }
    },
  },
  {
    slug: "linha-do-tempo",
    ceu: ["#d4581f", "#f9a23b", "#ffe2a2"],
    montar({ l, fino, chao, rotulo, nuvem }) {
      chao("#4dc0a8", "#37a791");
      // A linha sobe em curva, com um marco a cada época.
      const P: [number, number][] = [[-2.6, 1.05], [-0.9, 2.4], [0.9, 3.55], [2.5, 5.2]];
      for (let i = 0; i < 44; i++) {
        const t = i / 43;
        const x = -3.5 + t * 7;
        const y = 0.6 + Math.pow(t, 1.4) * 5.4;
        fino.add(esfera(0.1, 8, 6), "#20356f", [x, y, -0.4]);
      }
      const anos = ["1500", "1884", "1919", "2026"];
      P.forEach(([x, y], i) => {
        l.add(esfera(0.28, 14, 10), "#ffd257", [x, y, -0.3]);
        rotulo(anos[i], ["#fff9e8", "#ffd257", "#f4728e", "#7f4cc4"][i], i === 3 ? "#ffffff" : TINTA, [x, y - 0.68, 0.1], 0.5, [0, 0, (i % 2 ? 1 : -1) * 0.06]);
      });
      // Caravela
      l.add(caixa(1.45, 0.42, 0.56), "#8c5a3c", [-2.5, 1.75, -0.2]);
      l.add(cilindro(0.04, 1.2, 6), "#6d4a3a", [-2.5, 2.4, -0.2]);
      l.add(caixa(0.76, 0.68, 0.04), "#fff9e8", [-2.45, 2.55, -0.14]);
      l.add(caixa(0.2, 0.2, 0.05), "#e8415e", [-2.45, 2.55, -0.1], [0, 0, 0.78]);
      // Corrente quebrada: em 1884 o Ceará aboliu a escravidão.
      l.add(toro(0.2, 0.06, 14), "#d6dbe6", [-1.2, 3.1, -0.2], [0, 0.6, 0.3]);
      l.add(toro(0.2, 0.06, 14), "#d6dbe6", [-0.78, 3.28, -0.2], [0, -0.6, -0.2]);
      // Sol eclipsado: Sobral, 1919.
      l.add(esfera(0.62, 22, 14), "#20234e", [0.65, 4.65, -0.3]);
      l.add(toro(0.68, 0.09, 28), "#fff1c9", [0.65, 4.65, -0.3]);
      // Satélite, hoje.
      l.add(caixa(0.45, 0.45, 0.45), "#f4f1ff", [2.5, 6.25, -0.2], [0.3, 0.3, 0.2]);
      l.add(caixa(0.86, 0.34, 0.04), "#3f7fe0", [1.84, 6.1, -0.2], [0.3, 0.3, 0.2]);
      l.add(caixa(0.86, 0.34, 0.04), "#3f7fe0", [3.14, 6.42, -0.2], [0.3, 0.3, 0.2]);
      nuvem(-2.3, 5.8, -3, 0.85);
    },
  },
  {
    slug: "algoritmo",
    ceu: ["#0b2a5e", "#0d7d9a", "#57e0c8"],
    camera: { pos: [0.4, 10.5, 12.5], olha: [0, 1.2, 0.3], fov: 38 },
    montar({ l, fino, chao }) {
      chao("#1e4f9a", "#173f80", 26);
      // Tabuleiro
      for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) {
        l.add(caixa(1.14, 0.3, 1.14), (i + j) % 2 ? "#e9f8ff" : "#a8e6e2", [(i - 2) * 1.2, 0.05, (j - 3) * 1.2]);
      }
      // Caminho programado
      const C: [number, number, number][] = [[-2, 2, 0], [-1, 2, 0], [0, 2, Math.PI / 2], [0, 1, Math.PI / 2], [0, 0, 0], [1, 0, Math.PI / 2], [1, -1, Math.PI / 2]];
      C.forEach(([i, j, r]) => {
        const x = i * 1.2;
        const z = j * 1.2 - 0.6;
        l.add(caixa(1.02, 0.08, 1.02), "#ffd257", [x, 0.24, z]);
        fino.add(cone(0.22, 0.46, 3), "#c8461c", [x, 0.3, z], [Math.PI / 2, 0, r === 0 ? -Math.PI / 2 : Math.PI], [1, 1, 0.14]);
      });
      // Robô
      const rx = -2.4;
      const rz = 1.8;
      l.add(caixa(0.95, 1, 0.75), "#f58a33", [rx, 1.05, rz]);
      l.add(caixa(0.75, 0.62, 0.62), "#f4f1ff", [rx, 1.9, rz]);
      for (const k of [-0.18, 0.18]) l.add(esfera(0.09, 8, 6), TINTA, [rx + k, 1.95, rz + 0.33]);
      l.add(cilindro(0.04, 0.35, 6), TINTA, [rx, 2.38, rz]);
      l.add(esfera(0.1, 8, 6), "#e8415e", [rx, 2.6, rz]);
      for (const k of [-0.28, 0.28]) l.add(caixa(0.28, 0.34, 0.5), "#20356f", [rx + k, 0.37, rz]);
      for (const k of [-0.64, 0.64]) l.add(caixa(0.22, 0.72, 0.26), "#f58a33", [rx + k, 1.1, rz]);
      // Bandeira de chegada
      l.add(cilindro(0.06, 2.2, 8), "#20356f", [1.2, 1.3, -1.8]);
      l.add(caixa(1, 0.62, 0.05), "#2fd27f", [1.74, 2.05, -1.8]);
      l.add(caixa(0.26, 0.2, 0.06), "#f4f1ff", [1.55, 2.14, -1.76]);
      l.add(caixa(0.26, 0.2, 0.06), "#f4f1ff", [1.95, 1.95, -1.76]);
    },
  },
  {
    slug: "jornada-cientifica",
    ceu: ["#0b6a5a", "#2bbf8e", "#ffe38a"],
    montar({ l, chao, boneco, nuvem }) {
      chao("#f4b6c2", "#ee9fb2");
      // Banca de feira de ciências
      l.add(caixa(5.6, 0.2, 2), "#8c5a3c", [0, 1.28, -1.1]);
      for (const x of [-2.5, 2.5]) l.add(caixa(0.2, 1.3, 1.8), "#6d4a3a", [x, 0.6, -1.1]);
      // Painel de três partes
      l.add(caixa(2.2, 3.2, 0.1), "#fff9e8", [0, 3, -1.9]);
      l.add(caixa(1.55, 3.2, 0.1), "#f4efd9", [-1.85, 3, -1.55], [0, 0.48, 0]);
      l.add(caixa(1.55, 3.2, 0.1), "#f4efd9", [1.85, 3, -1.55], [0, -0.48, 0]);
      l.add(caixa(1.7, 0.46, 0.04), "#f58a33", [0, 4.2, -1.82]);
      l.add(caixa(0.8, 0.7, 0.04), "#3f7fe0", [-0.42, 3.26, -1.82]);
      l.add(caixa(0.7, 0.07, 0.04), TINTA, [0.5, 3.48, -1.82]);
      l.add(caixa(0.7, 0.07, 0.04), TINTA, [0.5, 3.28, -1.82]);
      l.add(caixa(0.7, 0.07, 0.04), TINTA, [0.5, 3.08, -1.82]);
      for (let i = 0; i < 4; i++) l.add(caixa(0.26, 0.28 + i * 0.26, 0.04), ["#00c9c8", "#2fd27f", "#ffd257", "#e8415e"][i], [-0.5 + i * 0.34, 2.14 + i * 0.13, -1.82]);
      // Vidraria e planta
      const v: [number, number][] = [[0.42, 0], [0.42, 0.06], [0.14, 0.75], [0.14, 1.1], [0.18, 1.14]];
      l.add(torno(v, 18), "#d6f6ff", [2, 1.38, -0.8]);
      l.add(cone(0.36, 0.48, 18), "#2fd27f", [2, 1.62, -0.8]);
      l.add(cilindro(0.28, 0.42, 12, 0.36), "#c9673a", [-2.05, 1.6, -0.75]);
      l.add(copa(0.48), "#148a55", [-2.05, 2.15, -0.75], [0.3, 0.3, 0]);
      // Medalha no alto
      l.add(cilindro(0.56, 0.14, 26), "#ffd257", [2.25, 5.5, -0.6], [Math.PI / 2, 0, 0]);
      l.add(cilindro(0.34, 0.17, 20), "#f58a33", [2.25, 5.5, -0.6], [Math.PI / 2, 0, 0]);
      nuvem(-2.2, 6.2, -3, 0.9);
      boneco("menino", [0, -0.02, 0.95], 0.16);
    },
  },
  {
    slug: "escada",
    ceu: ["#2a1468", "#b23ba6", "#ff9e7a"],
    estrelas: true,
    montar({ l, chao, boneco, nuvem }) {
      chao("#fff1c9", "#ffe19a");
      // Vinte degraus, em cinco cores: os níveis, da escola ao mundo.
      const CORES = ["#00c9c8", "#2fd27f", "#ffd257", "#f58a33", "#e8415e"];
      const N = 20;
      for (let i = 0; i < N; i++) {
        const a = 0.42 + i * 0.285;
        l.add(caixa(0.33, a, 1.9), CORES[Math.floor(i / 4)], [-3.15 + i * 0.32, a / 2 - 0.1, -0.6]);
      }
      // Estrela no topo
      const x = -3.15 + (N - 1) * 0.32;
      const ty = 0.42 + (N - 1) * 0.285 + 0.75;
      l.add(ICO(0.58), "#ffd257", [x - 0.1, ty, -0.6], [0.3, 0.4, 0]);
      l.add(toro(0.88, 0.05, 28), "#fff6dc", [x - 0.1, ty, -0.6], [1.2, 0.2, 0]);
      nuvem(2.6, 2.4, -3.5, 0.8);
      nuvem(-2.6, 4.8, -4, 0.7, "#ffd8e8");
      boneco("menina", [-1.2, 2.04, -0.4], 1.15);
    },
  },
];

/** Monta uma capa e devolve a imagem pronta. */
export async function renderizar(slug: string, largura: number, altura: number, renderer: THREE.WebGLRenderer) {
  const capa = CAPAS.find((c) => c.slug === slug)!;
  const cena = new THREE.Scene();
  cena.background = ceu(capa.ceu, !!capa.estrelas);
  const m = criarMateriais(2);
  const ctx = montarCtx(cena, m);
  cena.add(new THREE.HemisphereLight("#fff1e0", "#6d4fb0", 1.5));
  const sol = new THREE.DirectionalLight("#fff0d6", 2.3);
  sol.position.set(7, 12, 9);
  sol.castShadow = true;
  sol.shadow.mapSize.setScalar(4096);
  const s = sol.shadow.camera;
  s.left = s.bottom = -12;
  s.right = s.top = 12;
  s.near = 1;
  s.far = 40;
  sol.shadow.bias = -0.0006;
  sol.shadow.normalBias = 0.04;
  cena.add(sol);
  capa.montar(ctx);
  cena.add(ctx.l.malha(m.desenho, m.contorno));
  if (!ctx.fino.vazio) cena.add(ctx.fino.malha(m.desenho, m.contornoFino));
  const cc = capa.camera ?? { pos: [0, 3.5, 15] as V3, olha: [0, 3, 0] as V3, fov: 38 };
  const cam = new THREE.PerspectiveCamera(cc.fov ?? 38, largura / altura, 0.1, 200);
  cam.position.set(...cc.pos);
  cam.lookAt(...cc.olha);
  renderer.setSize(largura * 2, altura * 2, false);
  renderer.render(cena, cam);
  const saida = document.createElement("canvas");
  saida.width = largura;
  saida.height = altura;
  const g = saida.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(renderer.domElement, 0, 0, largura, altura);
  return saida.toDataURL("image/webp", 0.8);
}

export function iniciar() {
  const tela = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  return { renderer, slugs: CAPAS.map((c) => c.slug), renderizar: (slug: string, l: number, a: number) => renderizar(slug, l, a, renderer) };
}
