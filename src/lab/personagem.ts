import * as THREE from "three";
import { caixa, capsula, cilindro, esfera, Lote, materialContorno, materialDesenho, torno, toro } from "./lote";

// Os dois estudantes do logo JOC em 3D. Proporções e cores vêm da ilustração oficial:
// cabeça grande, jaleco branco longo, gola verde com laranja, luvas turquesa e contorno branco de adesivo.

export type Quem = "menino" | "menina";

const COR = {
  jaleco: "#ffffff",
  dobra: "#d9dde0",
  traco: "#5f5f5f",
  luva: "#00d0cc",
  luvaEscura: "#00a8a6",
  verde: "#04a757",
  laranja: "#f68935",
  jeans: "#3f6c9c",
  jeansEscuro: "#2f5580",
  tenis: "#1d3350",
  vidro: "#aee6fb",
};
const PELE = { menino: "#c9773a", menina: "#feadcd" };
const SOMBRA_PELE = { menino: "#a95f2c", menina: "#e784ad" };
const BOCHECHA = { menino: "#a5563a", menina: "#ea7fa9" };

/** Pontos bem distribuídos numa esfera: dão ao cabelo crespo o volume do desenho, sem aleatoriedade. */
function pontosEsfera(n: number) {
  const r: THREE.Vector3[] = [];
  const dourado = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const raio = Math.sqrt(1 - y * y);
    const t = dourado * i;
    r.push(new THREE.Vector3(Math.cos(t) * raio, y, Math.sin(t) * raio));
  }
  return r;
}

function cabecaMenino(l: Lote) {
  l.add(esfera(0.37, 18, 14), PELE.menino, [0, 0, 0], [0, 0, 0], [1, 1.04, 0.98]);
  // Orelhas
  l.add(esfera(0.085, 10, 8), PELE.menino, [0.365, -0.04, -0.02], [0, 0, 0], [0.7, 1.1, 1]);
  l.add(esfera(0.085, 10, 8), PELE.menino, [-0.365, -0.04, -0.02], [0, 0, 0], [0.7, 1.1, 1]);
  // Cabelo crespo: cachos em volta de tudo, deixando o rosto livre
  pontosEsfera(84).forEach((p, i) => {
    const rosto = p.z > 0.28 && p.y < 0.42 && Math.abs(p.x) < 0.82;
    const nuca = p.y < -0.62;
    const orelha = p.y < -0.05 && Math.abs(p.x) > 0.72 && p.z > -0.35;
    if (rosto || nuca || orelha) return;
    const tam = 0.135 + (i % 4) * 0.018;
    const raio = 0.47 + (i % 3) * 0.025;
    l.add(esfera(tam, 8, 6), i % 5 === 0 ? "#4a3535" : "#3d2b2b", [p.x * raio, 0.07 + p.y * raio * 1.02, p.z * raio]);
  });
  // Mechas sobre a testa, como no logo
  l.add(esfera(0.09, 8, 6), "#3d2b2b", [-0.08, 0.28, 0.31], [0, 0, 0.5], [1.5, 0.75, 0.6]);
  l.add(esfera(0.08, 8, 6), "#3d2b2b", [0.12, 0.3, 0.3], [0, 0, -0.4], [1.4, 0.7, 0.6]);
  // Sobrancelhas grossas e bochechas
  l.add(capsula(0.024, 0.09), "#2a1c17", [-0.135, 0.125, 0.335], [0, 0, 1.75]);
  l.add(capsula(0.024, 0.09), "#2a1c17", [0.135, 0.11, 0.335], [0, 0, 1.2]);
  l.add(esfera(0.062, 10, 8), BOCHECHA.menino, [-0.205, -0.08, 0.285], [0, -0.5, 0], [1.1, 0.8, 0.35]);
  l.add(esfera(0.062, 10, 8), BOCHECHA.menino, [0.205, -0.08, 0.285], [0, 0.5, 0], [1.1, 0.8, 0.35]);
  // Nariz
  l.add(esfera(0.03, 8, 6), SOMBRA_PELE.menino, [0, -0.04, 0.365], [0, 0, 0], [0.9, 1.2, 0.8]);
}

function cabecaMenina(l: Lote) {
  const cabelo = COR.laranja;
  l.add(esfera(0.37, 18, 14), PELE.menina, [0, -0.02, 0], [0, 0, 0], [1, 1.02, 0.98]);
  l.add(esfera(0.085, 10, 8), PELE.menina, [0.365, -0.04, -0.02], [0, 0, 0], [0.7, 1.15, 1]);
  l.add(esfera(0.085, 10, 8), PELE.menina, [-0.365, -0.04, -0.02], [0, 0, 0], [0.7, 1.15, 1]);
  // Calota do cabelo, mais atrás do rosto
  l.add(esfera(0.43, 18, 14), cabelo, [0, 0.07, -0.07], [0, 0, 0], [1.02, 1.0, 1.0]);
  // Franja em mechas, deixando a testa à mostra como no logo
  l.add(esfera(0.17, 10, 8), cabelo, [-0.17, 0.27, 0.22], [0, 0, 0.6], [1.15, 0.7, 0.75]);
  l.add(esfera(0.16, 10, 8), cabelo, [0.17, 0.28, 0.22], [0, 0, -0.5], [1.15, 0.65, 0.75]);
  l.add(esfera(0.1, 10, 8), cabelo, [0.0, 0.33, 0.25], [0, 0, 0], [1.25, 0.6, 0.7]);
  // Cabelo longo descendo pelas costas e pelos lados, até a cintura
  l.add(esfera(0.42, 16, 12), cabelo, [0, -0.42, -0.15], [0, 0, 0], [1.14, 1.5, 0.56]);
  l.add(esfera(0.18, 12, 10), cabelo, [-0.42, -0.34, -0.03], [0, 0, 0.1], [0.72, 2.2, 0.82]);
  l.add(esfera(0.18, 12, 10), cabelo, [0.42, -0.34, -0.03], [0, 0, -0.1], [0.72, 2.2, 0.82]);
  // Sobrancelhas em laranja escuro, acima dos óculos
  l.add(capsula(0.02, 0.07), "#d9592e", [-0.135, 0.195, 0.325], [0, 0, 1.45]);
  l.add(capsula(0.02, 0.07), "#d9592e", [0.135, 0.195, 0.325], [0, 0, 1.7]);
  // Bochechas
  l.add(esfera(0.058, 10, 8), BOCHECHA.menina, [-0.205, -0.075, 0.285], [0, -0.5, 0], [1.1, 0.75, 0.35]);
  l.add(esfera(0.058, 10, 8), BOCHECHA.menina, [0.205, -0.075, 0.285], [0, 0.5, 0], [1.1, 0.75, 0.35]);
  // Óculos redondos turquesa
  l.add(toro(0.122, 0.017, 22), COR.luva, [-0.145, 0.04, 0.345], [0, -0.22, 0]);
  l.add(toro(0.122, 0.017, 22), COR.luva, [0.145, 0.04, 0.345], [0, 0.22, 0]);
  l.add(cilindro(0.014, 0.075, 6), COR.luva, [0, 0.055, 0.375], [0, 0, Math.PI / 2]);
  l.add(cilindro(0.014, 0.2, 6), COR.luva, [-0.3, 0.05, 0.2], [Math.PI / 2, 0, 0.12]);
  l.add(cilindro(0.014, 0.2, 6), COR.luva, [0.3, 0.05, 0.2], [Math.PI / 2, 0, -0.12]);
}

function tubo(l: Lote, liquido: string) {
  // Tubo de ensaio segurado na mão, com a boca para cima.
  l.add(cilindro(0.055, 0.42, 12), COR.vidro, [0, 0.14, 0]);
  l.add(esfera(0.055, 12, 8), COR.vidro, [0, -0.07, 0]);
  l.add(cilindro(0.046, 0.2, 10), liquido, [0, 0.0, 0]);
  l.add(esfera(0.046, 10, 8), liquido, [0, -0.1, 0]);
  l.add(cilindro(0.07, 0.03, 12), "#8fdfee", [0, 0.36, 0]);
}

function braco(l: Lote, pele: string) {
  // A manga do jaleco é larga no punho, como no logo. Origem no ombro.
  l.add(torno([[0.0, 0.03], [0.1, 0.02], [0.125, -0.15], [0.15, -0.42], [0.155, -0.5], [0.0, -0.5]], 12), COR.jaleco);
  l.add(cilindro(0.13, 0.03, 12), "#bfc3c6", [0, -0.5, 0]);
  l.add(cilindro(0.06, 0.1, 10), pele, [0, -0.55, 0]);
  // Luva: punho, palma, dedos e polegar
  l.add(cilindro(0.075, 0.13, 10, 0.095), COR.luva, [0, -0.64, 0]);
  l.add(esfera(0.1, 12, 10), COR.luva, [0, -0.75, 0.01], [0, 0, 0], [0.95, 1.05, 0.8]);
  l.add(capsula(0.034, 0.07), COR.luvaEscura, [0.075, -0.71, 0.045], [0, 0, -0.45]);
  for (let i = 0; i < 3; i++) l.add(capsula(0.024, 0.05), COR.luva, [-0.05 + i * 0.05, -0.85, 0.02]);
}

export type EstadoPersonagem = { andando: number; falando: boolean; acenando: boolean; comemorando: boolean; olhar: number };

export type Personagem = {
  raiz: THREE.Group;
  estado: EstadoPersonagem;
  atualizar: (dt: number, t: number) => void;
};

export function criarPersonagem(quem: Quem): Personagem {
  const toon = materialDesenho(THREE.DoubleSide);
  const contorno = materialContorno("#ffffff", 0.028);
  const raiz = new THREE.Group();
  const pele = PELE[quem];

  // Pernas
  const perna = () => {
    const l = new Lote();
    l.add(cilindro(0.135, 0.56, 10, 0.15), COR.jeans, [0, -0.28, 0]);
    l.add(capsula(0.095, 0.13), COR.tenis, [0, -0.6, 0.06], [Math.PI / 2, 0, 0]);
    const g = l.malha(toon, contorno);
    return g;
  };
  const pernaE = perna();
  const pernaD = perna();
  pernaE.position.set(-0.17, 0.68, 0);
  pernaD.position.set(0.17, 0.68, 0);

  // Tronco e jaleco
  const tronco = new THREE.Group();
  tronco.position.y = 0.68;
  const lt = new Lote();
  const z = 0.74;
  lt.add(torno([[0.0, 0.8], [0.13, 0.79], [0.37, 0.7], [0.42, 0.45], [0.42, 0.28]], 18), COR.jaleco, [0, 0, 0], [0, 0, 0], [1, 1, z]);
  // Saia aberta na frente, deixando o jeans à mostra
  lt.add(torno([[0.42, 0.3], [0.44, 0.0], [0.54, -0.3], [0.6, -0.42]], 20, 0.3, Math.PI * 2 - 0.6), COR.jaleco, [0, 0, 0], [0, 0, 0], [1, 1, z]);
  lt.add(cilindro(0.3, 0.26, 12), COR.jeansEscuro, [0, 0.14, 0], [0, 0, 0], [1, 1, 0.75]);
  // Pescoço
  lt.add(cilindro(0.115, 0.24, 10), SOMBRA_PELE[quem], [0, 0.88, 0.02]);
  lt.add(cilindro(0.085, 0.12, 4), SOMBRA_PELE[quem], [0, 0.72, 0.17], [0.35, 0, 0], [1.1, 1, 0.5]);
  // Gola verde com filete laranja
  for (const s of [-1, 1]) {
    lt.add(caixa(0.2, 0.17, 0.035), COR.laranja, [s * 0.11, 0.72, 0.205], [-0.3, s * 0.3, s * 0.66]);
    lt.add(caixa(0.19, 0.16, 0.04), COR.verde, [s * 0.105, 0.735, 0.215], [-0.3, s * 0.3, s * 0.66]);
    // Lapela e bolso em traço fino, como no desenho
    lt.add(caixa(0.018, 0.5, 0.015), COR.traco, [s * 0.09, 0.42, 0.315], [-0.04, 0, s * 0.22]);
    lt.add(caixa(0.15, 0.015, 0.015), COR.traco, [s * 0.23, 0.48, 0.285], [0, s * 0.45, s * 0.35]);
    lt.add(caixa(0.2, 0.05, 0.012), COR.dobra, [s * 0.3, -0.12, 0.36], [0.1, s * 0.5, s * -0.08]);
    lt.add(caixa(0.2, 0.012, 0.012), COR.traco, [s * 0.3, -0.095, 0.372], [0.1, s * 0.5, s * -0.08]);
  }
  // Marca no bolso do jaleco
  lt.add(caixa(0.05, 0.035, 0.01), COR.verde, [0.2, 0.52, 0.283], [0, 0.45, 0]);
  tronco.add(lt.malha(toon, contorno));

  // Cabeça com rosto separado, para piscar e falar
  const cabeca = new THREE.Group();
  cabeca.position.y = 1.02 + 0.33;
  const lc = new Lote();
  if (quem === "menino") cabecaMenino(lc);
  else cabecaMenina(lc);
  cabeca.add(lc.malha(toon, contorno));
  const basico = new THREE.MeshBasicMaterial({ vertexColors: true });

  const le = new Lote();
  const olhoY = quem === "menino" ? 0.045 : 0.035;
  const corOlho = quem === "menino" ? "#2a1c17" : "#6b3a2a";
  for (const s of [-1, 1]) {
    le.add(esfera(0.04, 10, 8), corOlho, [s * 0.135, olhoY, 0.345], [0, s * 0.3, 0], [0.85, 1.15, 0.45]);
    le.add(esfera(0.012, 6, 5), "#ffffff", [s * 0.135 + 0.012, olhoY + 0.02, 0.367]);
  }
  const olhos = new THREE.Mesh(le.geometria(), basico);
  olhos.position.y = 0;
  cabeca.add(olhos);

  const lb = new Lote();
  lb.add(esfera(0.07, 12, 8), "#5a1f22", [0, 0, 0], [0, 0, 0], [1, 0.42, 0.2]);
  lb.add(caixa(0.046, 0.024, 0.012), "#ffffff", [quem === "menino" ? -0.012 : 0.012, 0.014, 0.018]);
  const boca = new THREE.Mesh(lb.geometria(), basico);
  boca.position.set(0.01, -0.17, 0.335);
  boca.rotation.x = -0.28;
  cabeca.add(boca);
  tronco.add(cabeca);

  // Braços. O erguido segura o tubo, como no logo.
  let tuboPeca: THREE.Object3D | null = null;
  const fazBraco = (comTubo: boolean) => {
    const l = new Lote();
    braco(l, pele);
    const g = new THREE.Group();
    g.add(l.malha(toon, contorno));
    if (comTubo) {
      const lp = new Lote();
      tubo(lp, quem === "menino" ? "#6cc24a" : "#fdc13f");
      const p = lp.malha(toon);
      p.position.set(0.02, -0.8, 0.07);
      g.add(p);
      tuboPeca = p;
    }
    return g;
  };
  const bracoErguido = quem === "menino" ? -1 : 1;
  const bracoE = fazBraco(bracoErguido === -1);
  const bracoD = fazBraco(bracoErguido === 1);
  bracoE.position.set(-0.45, 0.62, 0);
  bracoD.position.set(0.45, 0.62, 0);
  tronco.add(bracoE, bracoD);

  raiz.add(pernaE, pernaD, tronco);

  // Sombra macia no chão, sem custo de luz em tempo real
  const tela = document.createElement("canvas");
  tela.width = tela.height = 64;
  const c2 = tela.getContext("2d")!;
  const gr = c2.createRadialGradient(32, 32, 4, 32, 32, 32);
  gr.addColorStop(0, "rgba(0,8,30,.55)");
  gr.addColorStop(1, "rgba(0,8,30,0)");
  c2.fillStyle = gr;
  c2.fillRect(0, 0, 64, 64);
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tela), transparent: true, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.02;
  raiz.add(sombra);

  const estado: EstadoPersonagem = { andando: 0, falando: false, acenando: false, comemorando: false, olhar: 0 };
  let fase = 0;
  let mistura = 0;
  let piscar = 2 + Math.random() * 2;
  let pulo = 0;

  const atualizar = (dt: number, t: number) => {
    mistura += (estado.andando - mistura) * Math.min(1, dt * 10);
    fase += dt * (5 + estado.andando * 6.5);
    const s = Math.sin(fase);
    pernaE.rotation.x = s * 0.72 * mistura;
    pernaD.rotation.x = -s * 0.72 * mistura;
    const balanco = Math.abs(Math.cos(fase)) * 0.06 * mistura;

    pulo = estado.comemorando ? Math.abs(Math.sin(t * 5.5)) * 0.32 : Math.max(0, pulo - dt * 2);
    const respira = Math.sin(t * 2) * 0.008;
    tronco.position.y = 0.68 + balanco + respira;
    raiz.position.y = pulo;
    tronco.rotation.z = Math.sin(fase) * 0.035 * mistura;
    tronco.rotation.x = mistura * 0.07;

    // Parado, repete a pose do logo: uma mão erguida com o tubo, a outra à frente do corpo.
    const parado = 1 - mistura;
    const erguido = bracoErguido === -1 ? bracoE : bracoD;
    const livre = bracoErguido === -1 ? bracoD : bracoE;
    const lado = bracoErguido;
    const onda = estado.acenando || estado.comemorando ? Math.sin(t * 9) * 0.35 : Math.sin(t * 1.4) * 0.05;
    erguido.rotation.x = -2.5 * parado + (lado === -1 ? s : -s) * 0.55 * mistura;
    erguido.rotation.z = lado * (0.42 + (estado.comemorando ? 0.4 : 0) + onda) * parado + lado * 0.1;
    if (tuboPeca) {
      tuboPeca.rotation.x = -erguido.rotation.x;
      tuboPeca.rotation.z = -erguido.rotation.z * 0.8;
    }
    livre.rotation.x = (estado.comemorando ? -2.5 : -1.05) * parado + (lado === -1 ? -s : s) * 0.55 * mistura;
    livre.rotation.z = -lado * (estado.comemorando ? 0.5 + onda : -0.32) * parado - lado * 0.1;

    const virar = estado.olhar;
    cabeca.rotation.y += (virar - cabeca.rotation.y) * Math.min(1, dt * 5);
    cabeca.rotation.z = Math.sin(t * 0.9) * 0.03;
    cabeca.rotation.x = (bracoErguido ? -0.05 : 0) + Math.sin(t * 1.3) * 0.015;

    piscar -= dt;
    if (piscar < -0.11) piscar = 2 + Math.random() * 3;
    olhos.scale.y = piscar < 0 ? 0.08 : 1;
    olhos.position.y = piscar < 0 ? olhoY * 0.92 : 0;
    const abre = estado.falando ? 1 + Math.abs(Math.sin(t * 15)) * 1.4 : 1;
    boca.scale.y = abre;
  };

  return { raiz, estado, atualizar };
}
