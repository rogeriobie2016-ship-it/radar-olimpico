// Toda a arte da Órbita Numérica, em pixels desenhados por código: nenhuma imagem para baixar.
// Os desenhos são texto (uma letra por pixel) e viram telas prontas na primeira vez que são usados.

export type Paleta = Record<string, string>;
type Tela = HTMLCanvasElement;

/** Fonte 5 por 7 própria, para as cápsulas e os avisos do canvas. */
const GLIFOS: Record<string, string> = {
  "0": "01110 10001 10011 10101 11001 10001 01110",
  "1": "00100 01100 00100 00100 00100 00100 01110",
  "2": "01110 10001 00001 00110 01000 10000 11111",
  "3": "11110 00001 00001 01110 00001 00001 11110",
  "4": "00010 00110 01010 10010 11111 00010 00010",
  "5": "11111 10000 11110 00001 00001 10001 01110",
  "6": "00110 01000 10000 11110 10001 10001 01110",
  "7": "11111 00001 00010 00100 01000 01000 01000",
  "8": "01110 10001 10001 01110 10001 10001 01110",
  "9": "01110 10001 10001 01111 00001 00010 01100",
  A: "01110 10001 10001 11111 10001 10001 10001",
  B: "11110 10001 10001 11110 10001 10001 11110",
  C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110",
  E: "11111 10000 10000 11110 10000 10000 11111",
  F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111",
  H: "10001 10001 10001 11111 10001 10001 10001",
  I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100",
  K: "10001 10010 10100 11000 10100 10010 10001",
  L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001",
  N: "10001 11001 10101 10011 10001 10001 10001",
  O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000",
  Q: "01110 10001 10001 10001 10101 10010 01101",
  R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110",
  T: "11111 00100 00100 00100 00100 00100 00100",
  U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100",
  W: "10001 10001 10001 10101 10101 11011 10001",
  X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100",
  Z: "11111 00001 00010 00100 01000 10000 11111",
  "/": "00001 00001 00010 00100 01000 10000 10000",
  "%": "11001 11001 00010 00100 01000 10011 10011",
  "°": "01100 10010 10010 01100 00000 00000 00000",
  "+": "00000 00100 00100 11111 00100 00100 00000",
  "-": "00000 00000 00000 11111 00000 00000 00000",
  ":": "00000 01100 01100 00000 01100 01100 00000",
  ",": "00000 00000 00000 00000 01100 00100 01000",
  ".": "00000 00000 00000 00000 00000 01100 01100",
  "!": "00100 00100 00100 00100 00100 00000 00100",
  "?": "01110 10001 00001 00110 00100 00000 00100",
  "×": "00000 10001 01010 00100 01010 10001 00000",
  " ": "00000 00000 00000 00000 00000 00000 00000",
};

/** Acentos ficam acima da letra, sem mudar a altura da linha. */
const ACENTOS: Record<string, [string, string]> = {
  Á: ["A", "00010 00100"], À: ["A", "01000 00100"], Â: ["A", "00100 01010"], Ã: ["A", "01101 10010"],
  É: ["E", "00010 00100"], Ê: ["E", "00100 01010"], Í: ["I", "00010 00100"],
  Ó: ["O", "00010 00100"], Ô: ["O", "00100 01010"], Õ: ["O", "01101 10010"], Ú: ["U", "00010 00100"],
};

export const LARGURA_LETRA = 6;

export const temGlifo = (c: string) => c in GLIFOS || c in ACENTOS || c === "Ç" || c.toUpperCase() in GLIFOS || c.toUpperCase() in ACENTOS || c.toUpperCase() === "Ç";

function novaTela(l: number, a: number): [Tela, CanvasRenderingContext2D] {
  const t = document.createElement("canvas");
  t.width = Math.max(1, l);
  t.height = Math.max(1, a);
  return [t, t.getContext("2d")!];
}

export function escreverEm(g: CanvasRenderingContext2D, texto: string, x: number, y: number, cor: string) {
  g.fillStyle = cor;
  let px = x;
  for (const original of texto.toUpperCase()) {
    const acento = ACENTOS[original];
    const base = acento ? acento[0] : original === "Ç" ? "C" : original;
    const linhas = (GLIFOS[base] ?? GLIFOS["?"]).split(" ");
    linhas.forEach((l, ly) => {
      for (let lx = 0; lx < 5; lx++) if (l[lx] === "1") g.fillRect(px + lx, y + ly, 1, 1);
    });
    if (acento) acento[1].split(" ").forEach((l, ly) => {
      for (let lx = 0; lx < 5; lx++) if (l[lx] === "1") g.fillRect(px + lx, y - 3 + ly, 1, 1);
    });
    if (original === "Ç") g.fillRect(px + 2, y + 7, 2, 1);
    px += LARGURA_LETRA;
  }
}

const cacheTexto = new Map<string, Tela>();

/** Texto pronto numa tela pequena: desenhar vira só uma cópia, o que mantém o quadro leve. */
export function textoPronto(texto: string, cor: string, sombra = "#050b1a") {
  const k = `${texto}|${cor}|${sombra}`;
  let t = cacheTexto.get(k);
  if (!t) {
    if (cacheTexto.size > 240) cacheTexto.clear();
    const [c, g] = novaTela(texto.length * LARGURA_LETRA + 1, 13);
    escreverEm(g, texto, 1, 4, sombra);
    escreverEm(g, texto, 0, 3, cor);
    cacheTexto.set(k, c);
    t = c;
  }
  return t;
}

export function sprite(linhas: string[], paleta: Paleta): Tela {
  const larg = Math.max(...linhas.map((l) => l.length));
  const [t, g] = novaTela(larg, linhas.length);
  linhas.forEach((l, y) => {
    for (let x = 0; x < l.length; x++) {
      const cor = paleta[l[x]];
      if (cor) {
        g.fillStyle = cor;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
  return t;
}

/** Metade esquerda desenhada, a direita sai no espelho. A última coluna é o eixo. */
export const espelhar = (metade: string[]) => metade.map((l) => l + [...l.slice(0, -1)].reverse().join(""));

function girada(t: Tela, quartos: number) {
  const [c, g] = novaTela(quartos % 2 ? t.height : t.width, quartos % 2 ? t.width : t.height);
  g.translate(c.width / 2, c.height / 2);
  g.rotate((quartos * Math.PI) / 2);
  g.imageSmoothingEnabled = false;
  g.drawImage(t, -t.width / 2, -t.height / 2);
  return c;
}

const COR_NAVE: Paleta = { W: "#e8f4ff", S: "#9db8d6", G: "#5d7da3", B: "#2d4466", C: "#3ee8e6", c: "#0f8f96", O: "#f58a33", o: "#b95c14", Y: "#fdc13f", R: "#7a2f3a", K: "#101a30" };

export const DESENHO_NAVE = espelhar([
  "........W",
  ".......WW",
  ".......WC",
  "......WWC",
  "......WCC",
  "......WCc",
  ".....WSCc",
  ".....WSWW",
  "..Y..WSSS",
  ".OO.WWSGS",
  ".Oo.WSSGS",
  "OOoWWSGGS",
  "OoSWSGGBG",
  "ooGSGGBBG",
  "o.BGGBBKB",
  "...BBK.RR",
]);

const CHAMA_A = espelhar(["......YY", ".......Y", ".......O"].map((l) => l.padEnd(9, ".").slice(0, 9)));
const CHAMA_B = espelhar(["......YY", "......YO", ".......O", ".......o"].map((l) => l.padEnd(9, ".").slice(0, 9)));

const COR_ROCHA: Paleta = { a: "#a39a92", b: "#79706a", c: "#544d4c", d: "#332f35", e: "#c9c0b4" };

const ROCHA_GRANDE = [
  "....bbbbb....",
  "..bbeaaabbb..",
  ".baaaabbaabc.",
  ".beaacabbabc.",
  "baaaacdbbbbcc",
  "baabbcdcbbccd",
  "bbbbbbcccbccd",
  "cbbabbbbbcdcd",
  ".cbbbacbbccd.",
  ".ccbbbcdccdd.",
  "..ccccbcddd..",
  "....ddddd....",
];
const ROCHA_PEQUENA = ["..bbb..", ".eaabb.", "baacbbc", "babbcbd", "bbbbccd", ".ccbcd.", "..ddd.."];

export type Arte = ReturnType<typeof criarArte>;

export type Pose = { x: number; y: number; alvoX: number; t: number; movimento: boolean };

export function criarArte() {
  const nave = sprite(DESENHO_NAVE, COR_NAVE);
  const chamas = [sprite(CHAMA_A, COR_NAVE), sprite(CHAMA_B, COR_NAVE)];
  const girar = (t: Tela) => [t, girada(t, 1), girada(t, 2), girada(t, 3)];
  const rochas = [girar(sprite(ROCHA_GRANDE, COR_ROCHA)), girar(sprite(ROCHA_PEQUENA, COR_ROCHA))];
  const escudo = sprite(["..WWW..", ".WCCCW.", "WCCcCCW", "WCCcCCW", ".WCcCW.", "..WCW..", "...W..."], COR_NAVE);
  const escudoVazio = sprite(["..BBB..", ".B...B.", "B.....B", "B.....B", ".B...B.", "..B.B..", "...B..."], COR_NAVE);
  const tiro = [
    sprite([".m.", "mPm", "mPm", ".m."], { m: "#ff5fb0", P: "#ffe1f0" }),
    sprite([".P.", "mPm", "mPm", ".m."], { m: "#ff9f5f", P: "#fff1d6" }),
  ];
  const chefes = [chefeFracionador(), chefePorcentauro(), chefeExpoente(), chefePoliedro(), chefeParadoxo()];
  return { nave, chamas, rochas, escudo, escudoVazio, tiro, chefes };
}

/** Cápsula de resposta. Todas iguais de propósito: a cor nunca entrega a certa. */
export function criarCapsula(texto: string, largura: number) {
  const a = 17;
  const quadro = (brilho: number) => {
    const [t, g] = novaTela(largura, a);
    g.fillStyle = "#04303c";
    g.fillRect(2, 1, largura - 4, a - 2);
    g.fillRect(1, 2, largura - 2, a - 4);
    g.fillRect(0, 4, largura, a - 8);
    g.fillStyle = "#0a5566";
    g.fillRect(2, 2, largura - 4, a - 4);
    g.fillStyle = "#0b1d3a";
    g.fillRect(3, 3, largura - 6, a - 6);
    g.fillStyle = "#3ee8e6";
    g.fillRect(3, 1, largura - 6, 1);
    g.fillRect(3, a - 2, largura - 6, 1);
    g.fillRect(1, 4, 1, a - 8);
    g.fillRect(largura - 2, 4, 1, a - 8);
    g.fillRect(2, 2, 1, 2);
    g.fillRect(largura - 3, 2, 1, 2);
    g.fillRect(2, a - 4, 1, 2);
    g.fillRect(largura - 3, a - 4, 1, 2);
    g.fillStyle = "#e8fffe";
    const passo = Math.max(6, Math.floor((largura - 6) / 3));
    for (let x = 3 + brilho * 2; x < largura - 4; x += passo) g.fillRect(x, 1, 2, 1);
    for (let x = largura - 5 - brilho * 2; x > 2; x -= passo) g.fillRect(x, a - 2, 2, 1);
    escreverEm(g, texto, Math.floor((largura - texto.length * LARGURA_LETRA + 1) / 2), 5, "#ffffff");
    return t;
  };
  return { quadros: [quadro(0), quadro(1), quadro(2)], largura, altura: a };
}

export const larguraCapsula = (texto: string) => Math.max(26, texto.length * LARGURA_LETRA + 9);

// Fundo de cada fase: sempre escuro, com poeira pontilhada e um astro distante.
export const FUNDOS = [
  { ceu: "#060b1f", poeira: "#141f4d", astro: "#c76f1e", sombra: "#6d3410", anel: false },
  { ceu: "#0d0720", poeira: "#2f1450", astro: "#c9548f", sombra: "#6a2450", anel: false },
  { ceu: "#04121f", poeira: "#0d3347", astro: "#d8b25a", sombra: "#7a5c24", anel: true },
  { ceu: "#071410", poeira: "#123d2b", astro: "#3fb98a", sombra: "#17604a", anel: false },
  { ceu: "#14060e", poeira: "#3d1022", astro: "#ef6a4d", sombra: "#7e2517", anel: true },
];

export function criarFundo(fase: number, L: number, A: number) {
  const f = FUNDOS[fase % FUNDOS.length];
  const [t, g] = novaTela(L, A);
  g.fillStyle = f.ceu;
  g.fillRect(0, 0, L, A);
  // Nuvens pontilhadas, repetindo sem emenda na vertical.
  const nuvens = Array.from({ length: 5 }, () => ({ x: Math.random() * L, y: Math.random() * A, r: 22 + Math.random() * 34 }));
  g.fillStyle = f.poeira;
  for (let y = 0; y < A; y++) {
    for (let x = (y % 2) * 1; x < L; x += 2) {
      let forca = 0;
      for (const n of nuvens) {
        const dy = Math.min(Math.abs(y - n.y), A - Math.abs(y - n.y));
        const d = Math.hypot(x - n.x, dy) / n.r;
        if (d < 1) forca = Math.max(forca, 1 - d);
      }
      if (forca > 0.62 || (forca > 0.34 && (x + y) % 4 === 0) || (forca > 0.12 && (x * 3 + y * 5) % 16 === 0)) g.fillRect(x, y, 1, 1);
    }
  }
  return t;
}

export function criarAstro(fase: number) {
  const f = FUNDOS[fase % FUNDOS.length];
  const r = 16;
  const m = f.anel ? 12 : 0;
  const [t, g] = novaTela((r + m) * 2 + 2, r * 2 + 2);
  const cx = r + m + 1;
  const cy = r + 1;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue;
      const luz = -x * 0.6 - y * 0.8;
      const ponto = (x + y) & 1;
      g.fillStyle = luz > 3 + ponto * 2 ? f.astro : f.sombra;
      if (luz < -7 - ponto * 2) g.fillStyle = "#0b0a18";
      g.fillRect(cx + x, cy + y, 1, 1);
    }
  }
  if (f.anel) {
    // Anel inteiro, passando na frente do astro, com uma linha clara e outra escura.
    for (let x = -r - m; x <= r + m; x++) {
      const y = Math.round(x * 0.22);
      g.fillStyle = f.astro;
      g.fillRect(cx + x, cy + y, 1, 1);
      g.fillStyle = f.sombra;
      g.fillRect(cx + x, cy + y + 1, 1, 1);
    }
  }
  return t;
}

export type Chefe = { nome: string; largura: number; altura: number; desenhar: (g: CanvasRenderingContext2D, p: Pose) => void };

const inteiro = Math.round;
const onda = (p: Pose, v: number, a: number) => (p.movimento ? inteiro(Math.sin(p.t * v) * a) : 0);

function chefeFracionador(): Chefe {
  const cor: Paleta = { a: "#ffb35c", b: "#f58a33", c: "#b95c14", d: "#6d3410", e: "#fff1d6", k: "#2a1408", v: "#ff4d4d" };
  const cima = sprite(espelhar([
    "...........eaaaa",
    ".........eaaaaaa",
    ".......eaabbbbkk",
    "......eabbbbkkkk",
    ".....eabbbbkkvvk",
    "....eabbbbbkkvvk",
    "...aabbbbbbbkkkk",
    "..aabbbbbbbbbbbb",
    ".abbbccbbbbccbbb",
    "abbccccccccccccc",
  ]), cor);
  const baixo = sprite(espelhar([
    "abbccccccccccccc",
    ".dcccbbccccbbccc",
    "..dddccddddccddd",
    "....d..dd...dd.d",
    "....d...d....d..",
    "...dd...d....d..",
  ]), cor);
  return {
    nome: "Fracionador", largura: 31, altura: 26,
    desenhar: (g, p) => {
      const folga = 2 + Math.abs(onda(p, 2.2, 3));
      g.drawImage(cima, p.x - 15, p.y - 11 - folga);
      g.drawImage(baixo, p.x - 15, p.y + folga);
      g.fillStyle = "#fff1d6";
      g.fillRect(p.x - 19, p.y - 1, 39, 2);
      g.fillStyle = "#fdc13f";
      const brilho = p.movimento ? inteiro(((Math.sin(p.t * 3) + 1) / 2) * 34) : 17;
      g.fillRect(p.x - 19 + brilho, p.y - 1, 5, 2);
    },
  };
}

function chefePorcentauro(): Chefe {
  const cor: Paleta = { a: "#ff9fd0", b: "#e0559a", c: "#9c2a68", d: "#5c1440", e: "#ffffff", k: "#16060f" };
  const anel = sprite([
    "...bbbbb...",
    "..baaaaab..",
    ".baaccccab.",
    "bacc...ccab",
    "bac.....cab",
    "bac.....cab",
    "bac.....cab",
    "bacc...ccab",
    ".bbaccccbc.",
    "..cbbbbbc..",
    "...ccccc...",
  ], cor);
  const barra = sprite(Array.from({ length: 24 }, (_, i) => {
    const x = 16 - Math.floor(i * 0.72);
    return ".".repeat(Math.max(0, x)) + "abbbbcc";
  }), cor);
  return {
    nome: "Porcentauro", largura: 34, altura: 30,
    desenhar: (g, p) => {
      const b = onda(p, 2.4, 2);
      g.drawImage(barra, p.x - 11, p.y - 12);
      const olho = (ox: number, oy: number) => {
        g.drawImage(anel, ox - 5, oy - 5);
        g.fillStyle = "#ffffff";
        g.fillRect(ox - 2, oy - 2, 5, 5);
        const dx = Math.max(-1, Math.min(1, Math.sign(p.alvoX - ox)));
        g.fillStyle = "#16060f";
        g.fillRect(ox - 1 + dx, oy - 1, 3, 4);
      };
      olho(p.x - 11, p.y - 7 + b);
      olho(p.x + 12, p.y + 7 - b);
      // Patas que trocam de passo.
      const passo = p.movimento && Math.floor(p.t * 5) % 2 === 0;
      g.fillStyle = "#9c2a68";
      for (const [lx, alt] of [[-7, passo ? 5 : 3], [-2, passo ? 3 : 5], [3, passo ? 5 : 3]]) g.fillRect(p.x + lx, p.y + 11, 2, alt);
    },
  };
}

function bloco(l: number, a: number, cor: Paleta) {
  const linhas = Array.from({ length: a }, (_, y) => Array.from({ length: l }, (_, x) => {
    if (y === 0 || x === 0) return "a";
    if (y === a - 1 || x === l - 1) return "c";
    return (x + y) % 5 === 0 ? "d" : "b";
  }).join(""));
  return sprite(linhas, cor);
}

function chefeExpoente(): Chefe {
  const cor: Paleta = { a: "#fff0b8", b: "#e0b23c", c: "#8a6516", d: "#c9992c" };
  const grande = bloco(24, 20, cor);
  const medio = bloco(12, 10, cor);
  const miudo = bloco(6, 6, cor);
  return {
    nome: "Expoente", largura: 38, altura: 34,
    desenhar: (g, p) => {
      const b1 = onda(p, 2, 2);
      const b2 = onda(p, 3.1, 2);
      g.drawImage(grande, p.x - 18, p.y - 6);
      // Os blocos menores flutuam no alto, à direita, como um expoente.
      g.drawImage(medio, p.x + 8, p.y - 16 + b1);
      g.drawImage(miudo, p.x + 21, p.y - 22 + b2);
      g.fillStyle = "#2a1c05";
      g.fillRect(p.x - 13, p.y, 6, 5);
      g.fillRect(p.x - 2, p.y, 6, 5);
      g.fillStyle = "#ff4d4d";
      const dx = Math.max(-2, Math.min(2, Math.round((p.alvoX - p.x) / 30)));
      g.fillRect(p.x - 11 + dx, p.y + 2, 2, 2);
      g.fillRect(p.x + dx, p.y + 2, 2, 2);
      g.fillStyle = "#2a1c05";
      for (let i = 0; i < 5; i++) g.fillRect(p.x - 12 + i * 3, p.y + 9 + (i % 2), 2, 2);
    },
  };
}

function linha(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  let x = inteiro(x0);
  let y = inteiro(y0);
  const fx = inteiro(x1);
  const fy = inteiro(y1);
  const dx = Math.abs(fx - x);
  const dy = -Math.abs(fy - y);
  const sx = x < fx ? 1 : -1;
  const sy = y < fy ? 1 : -1;
  let e = dx + dy;
  for (let n = 0; n < 200; n++) {
    g.fillRect(x, y, 1, 1);
    if (x === fx && y === fy) break;
    const e2 = 2 * e;
    if (e2 >= dy) {
      e += dy;
      x += sx;
    }
    if (e2 <= dx) {
      e += dx;
      y += sy;
    }
  }
}

const VERTICES: [number, number, number][] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], [0, -1.7, 0], [0, 1.7, 0]];
const ARESTAS = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7], [8, 0], [8, 1], [8, 4], [8, 5], [9, 2], [9, 3], [9, 6], [9, 7]];
const projetados = VERTICES.map(() => [0, 0]);

function chefePoliedro(): Chefe {
  return {
    nome: "Poliedro", largura: 40, altura: 40,
    desenhar: (g, p) => {
      const ang = p.movimento ? p.t * 0.9 : 0.6;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const inc = 0.42;
      const ci = Math.cos(inc);
      const si = Math.sin(inc);
      VERTICES.forEach(([x, y, z], i) => {
        const rx = x * c - z * s;
        const rz = x * s + z * c;
        const ry = y * ci - rz * si;
        projetados[i][0] = p.x + rx * 11;
        projetados[i][1] = p.y + ry * 11;
      });
      g.fillStyle = "#2f9e78";
      ARESTAS.slice(0, 12).forEach(([a, b]) => linha(g, projetados[a][0], projetados[a][1], projetados[b][0], projetados[b][1]));
      g.fillStyle = "#7dffd0";
      ARESTAS.slice(12).forEach(([a, b]) => linha(g, projetados[a][0], projetados[a][1], projetados[b][0], projetados[b][1]));
      g.fillStyle = "#ffffff";
      projetados.forEach(([x, y]) => g.fillRect(inteiro(x) - 1, inteiro(y) - 1, 2, 2));
      const nucleo = p.movimento ? 2 + (Math.floor(p.t * 4) % 2) : 2;
      g.fillStyle = "#ff4d4d";
      g.fillRect(p.x - nucleo, p.y - nucleo, nucleo * 2, nucleo * 2);
      g.fillStyle = "#ffd0d0";
      g.fillRect(p.x - 1, p.y - 1, 1, 1);
    },
  };
}

function chefeParadoxo(): Chefe {
  const cor: Paleta = { a: "#ffb199", b: "#ef6a4d", c: "#a8331c", d: "#5e160c", e: "#fff6ee", f: "#e9d6c9" };
  const olho = sprite(espelhar([
    "..........ddddddd",
    ".......dddcccccbb",
    ".....ddccbbbaaaaa",
    "...ddcbbaaeeeeeee",
    "..dcbbaeeeeeeeeee",
    ".dcbaeeeeeeeeeeee",
    "dcbaeeeeeeeeeeeee",
    "dcbaeeeeeeeeeeeee",
    "dcbaeeeeeeeeeeeee",
    ".dcbaeeeeeeeeeeee",
    "..dcbbafeeeeeeeee",
    "...ddcbbaaffeeeee",
    ".....ddccbbbaaaaa",
    ".......dddcccccbb",
    "..........ddddddd",
  ]), cor);
  return {
    nome: "Paradoxo", largura: 33, altura: 36,
    desenhar: (g, p) => {
      // Tentáculos em blocos, cada um num ritmo.
      for (let k = 0; k < 5; k++) {
        const bx = p.x - 12 + k * 6;
        for (let s = 0; s < 6; s++) {
          const dx = p.movimento ? inteiro(Math.sin(p.t * 3 + k + s * 0.8) * (1 + s * 0.5)) : 0;
          g.fillStyle = s % 2 ? "#a8331c" : "#ef6a4d";
          g.fillRect(bx + dx, p.y + 6 + s * 3, s > 3 ? 2 : 3, 3);
        }
      }
      g.drawImage(olho, p.x - 16, p.y - 7);
      const dx = Math.max(-6, Math.min(6, Math.round((p.alvoX - p.x) / 12)));
      g.fillStyle = "#3a1d8a";
      g.fillRect(p.x - 4 + dx, p.y - 4, 9, 9);
      g.fillStyle = "#7f5cff";
      g.fillRect(p.x - 3 + dx, p.y - 3, 7, 7);
      g.fillStyle = "#0b0614";
      g.fillRect(p.x - 2 + dx, p.y - 2, 5, 5);
      g.fillStyle = "#ffffff";
      g.fillRect(p.x - 1 + dx, p.y - 2, 2, 2);
      // Pisca de vez em quando.
      if (p.movimento && Math.sin(p.t * 0.9) > 0.985) {
        g.fillStyle = "#a8331c";
        g.fillRect(p.x - 14, p.y - 5, 29, 11);
      }
    },
  };
}
