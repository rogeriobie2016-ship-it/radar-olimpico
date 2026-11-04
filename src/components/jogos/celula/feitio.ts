import * as THREE from "three";

// Geradores sem nenhum arquivo externo: ruído, texturas, ambiente de reflexo e formas orgânicas.

export function acaso(semente: number) {
  let s = semente >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruído de gradiente 3D, com semente. */
export function criarRuido(semente: number) {
  const r = acaso(semente);
  const p = new Uint8Array(512);
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  const G = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  const suave = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const mis = (a: number, b: number, t: number) => a + (b - a) * t;
  const grad = (h: number, x: number, y: number, z: number) => {
    const g = G[h % 12];
    return g[0] * x + g[1] * y + g[2] * z;
  };
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = suave(x);
    const v = suave(y);
    const w = suave(z);
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    const AA = p[A & 255] + Z;
    const AB = p[(A + 1) & 255] + Z;
    const BA = p[B & 255] + Z;
    const BB = p[(B + 1) & 255] + Z;
    return mis(
      mis(mis(grad(p[AA & 511], x, y, z), grad(p[BA & 511], x - 1, y, z), u), mis(grad(p[AB & 511], x, y - 1, z), grad(p[BB & 511], x - 1, y - 1, z), u), v),
      mis(mis(grad(p[(AA + 1) & 511], x, y, z - 1), grad(p[(BA + 1) & 511], x - 1, y, z - 1), u), mis(grad(p[(AB + 1) & 511], x, y - 1, z - 1), grad(p[(BB + 1) & 511], x - 1, y - 1, z - 1), u), v),
      w,
    );
  };
}

export type Ruido = ReturnType<typeof criarRuido>;

export const fbm = (r: Ruido, x: number, y: number, z: number, oitavas = 4) => {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oitavas; i++) {
    s += a * r(x * f, y * f, z * f);
    a *= 0.5;
    f *= 2.03;
  }
  return s;
};

/** Ruído que se repete nas bordas, em três canais: R suave, G com ramos para os veios, B outra semente. */
export function texturaRuido(tam = 256) {
  const dados = new Uint8Array(tam * tam * 4);
  const r1 = criarRuido(11);
  const r2 = criarRuido(37);
  // Repetição por círculo no espaço 3D: anda em toro, e por isso não há emenda.
  const R = 1.1;
  for (let j = 0; j < tam; j++) {
    const v = (j / tam) * Math.PI * 2;
    for (let i = 0; i < tam; i++) {
      const u = (i / tam) * Math.PI * 2;
      const x = Math.cos(u) * (R + 0.45 * Math.cos(v));
      const y = Math.sin(u) * (R + 0.45 * Math.cos(v));
      const z = 0.45 * Math.sin(v);
      const a = fbm(r1, x * 2.2 + 5, y * 2.2 + 3, z * 2.2, 4);
      const b = fbm(r1, x * 1.9 + 9, y * 1.9 - 2, z * 1.9, 2);
      const c = fbm(r2, x * 2.7, y * 2.7, z * 2.7, 4);
      const k = (j * tam + i) * 4;
      dados[k] = Math.min(255, Math.max(0, (a * 1.6 + 0.5) * 255));
      dados[k + 1] = Math.min(255, Math.max(0, (b * 1.6 + 0.5) * 255));
      dados[k + 2] = Math.min(255, Math.max(0, (c * 1.6 + 0.5) * 255));
      dados[k + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(dados, tam, tam, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

/** Mapa de normais com cabeças de fosfolipídio em empacotamento hexagonal. */
export function texturaLipidios(tam = 256, colunas = 16) {
  const dados = new Uint8Array(tam * tam * 4);
  const alturas = new Float32Array(tam * tam);
  const passo = tam / colunas;
  const linhas = colunas; // par: fecha a repetição vertical
  const dy = tam / linhas;
  const raio = passo * 0.56;
  for (let j = 0; j < tam; j++) {
    for (let i = 0; i < tam; i++) {
      let m = 0;
      const lin = Math.floor(j / dy);
      for (let l = lin - 1; l <= lin + 1; l++) {
        const desl = ((l % 2) + 2) % 2 ? passo * 0.5 : 0;
        const col = Math.floor((i - desl) / passo);
        for (let c = col - 1; c <= col + 1; c++) {
          const dx = i - (c + 0.5) * passo - desl;
          const dyy = j - (l + 0.5) * dy;
          const d2 = (dx * dx + dyy * dyy) / (raio * raio);
          if (d2 < 1) m = Math.max(m, Math.sqrt(1 - d2));
        }
      }
      alturas[j * tam + i] = m;
    }
  }
  const alt = (i: number, j: number) => alturas[((j + tam) % tam) * tam + ((i + tam) % tam)];
  for (let j = 0; j < tam; j++) {
    for (let i = 0; i < tam; i++) {
      const nx = (alt(i - 1, j) - alt(i + 1, j)) * 1.6;
      const ny = (alt(i, j - 1) - alt(i, j + 1)) * 1.6;
      const nz = 1;
      const l = Math.hypot(nx, ny, nz);
      const k = (j * tam + i) * 4;
      dados[k] = (nx / l) * 127.5 + 127.5;
      dados[k + 1] = (ny / l) * 127.5 + 127.5;
      dados[k + 2] = (nz / l) * 127.5 + 127.5;
      dados[k + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(dados, tam, tam, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Ambiente de reflexos pintado por código: fundo escuro com janelas de luz coloridas, filtrado por PMREM. */
export function criarAmbiente(renderer: THREE.WebGLRenderer, luzes: { cor: string; forca: number; dir: [number, number, number]; tam: number }[], fundoCima: string, fundoBaixo: string) {
  const cena = new THREE.Scene();
  const ceu = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { uCima: { value: new THREE.Color(fundoCima) }, uBaixo: { value: new THREE.Color(fundoBaixo) } },
      vertexShader: `varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 uCima,uBaixo;varying vec3 vP;void main(){gl_FragColor=vec4(mix(uBaixo,uCima,smoothstep(-.7,.8,vP.y)),1.);}`,
    }),
  );
  cena.add(ceu);
  const geo = new THREE.SphereGeometry(1, 24, 16);
  const mats: THREE.Material[] = [ceu.material];
  for (const l of luzes) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(l.cor).multiplyScalar(l.forca) });
    mats.push(m);
    const b = new THREE.Mesh(geo, m);
    b.position.set(...l.dir).normalize().multiplyScalar(40);
    b.scale.setScalar(l.tam);
    cena.add(b);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(cena, 0.09);
  pmrem.dispose();
  ceu.geometry.dispose();
  geo.dispose();
  mats.forEach((m) => m.dispose());
  return rt;
}

/**
 * Deforma uma esfera unitária com uma função de altura e calcula a normal por diferenças finitas.
 * Calcular direto evita a emenda que computeVertexNormals deixaria na costura da esfera.
 */
export function deformarEsfera(g: THREE.BufferGeometry, altura: (x: number, y: number, z: number) => number, oclusao = 0) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const cores = new Float32Array(pos.count * 3);
  const n = new THREE.Vector3();
  const t = new THREE.Vector3();
  const b = new THREE.Vector3();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const aux = new THREE.Vector3();
  const e = 0.02;
  const ponto = (saida: THREE.Vector3, d: THREE.Vector3) => {
    aux.copy(d).normalize();
    return saida.copy(aux).multiplyScalar(altura(aux.x, aux.y, aux.z));
  };
  let mn = Infinity;
  let mx = -Infinity;
  const hs = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(pos, i).normalize();
    t.set(Math.abs(n.y) < 0.98 ? 0 : 1, Math.abs(n.y) < 0.98 ? 1 : 0, 0).cross(n).normalize();
    b.crossVectors(n, t);
    ponto(p0, n);
    const h = p0.length();
    hs[i] = h;
    mn = Math.min(mn, h);
    mx = Math.max(mx, h);
    ponto(p1, aux.copy(n).addScaledVector(t, e).clone());
    ponto(p2, aux.copy(n).addScaledVector(b, e).clone());
    p1.sub(p0);
    p2.sub(p0);
    aux.crossVectors(p1, p2).normalize();
    if (aux.dot(n) < 0) aux.negate();
    nor.setXYZ(i, aux.x, aux.y, aux.z);
    pos.setXYZ(i, p0.x, p0.y, p0.z);
  }
  // Fendas mais escuras: sombreamento de contato que não depende de nenhuma passada extra.
  for (let i = 0; i < pos.count; i++) {
    const v = oclusao ? 1 - oclusao * (1 - (hs[i] - mn) / Math.max(mx - mn, 1e-3)) : 1;
    cores[i * 3] = cores[i * 3 + 1] = cores[i * 3 + 2] = v;
  }
  g.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  g.computeBoundingSphere();
  return g;
}

/** Superfície de proteína: bolhas somadas com ruído, como nos desenhos de estrutura molecular. */
export function bolhaProteina(semente: number, opcoes: { seg?: number; lobos?: number; amp?: number; freq?: number; alongar?: [number, number, number]; forcaLobo?: number } = {}) {
  const { seg = 96, lobos = 7, amp = 0.08, freq = 1.9, alongar = [1, 1, 1], forcaLobo = 1 } = opcoes;
  const r = acaso(semente * 7 + 3);
  const ruido = criarRuido(semente * 13 + 1);
  const L = Array.from({ length: lobos }, () => {
    const d = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    return { x: d.x, y: d.y, z: d.z, w: 6 + r() * 14, a: (0.14 + r() * 0.34) * forcaLobo };
  });
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.66));
  deformarEsfera(
    g,
    (x, y, z) => {
      let h = 0.78;
      for (const l of L) h += l.a * Math.exp(-(1 - (x * l.x + y * l.y + z * l.z)) * l.w);
      h += amp * fbm(ruido, x * freq + 4, y * freq + 7, z * freq + 2, 3);
      h += amp * 0.12 * ruido(x * freq * 4, y * freq * 4, z * freq * 4);
      return h;
    },
    0.42,
  );
  g.scale(alongar[0], alongar[1], alongar[2]);
  g.computeBoundingSphere();
  return g;
}

/**
 * Bolsa achatada com bordas fechadas, como as cisternas do retículo e do Golgi. Fica assentada sobre uma esfera
 * e tem a borda irregular. Face de cima e de baixo se encontram, então não existe beirada aberta.
 */
export function bolsaAchatada(op: { centro: THREE.Vector3; raioEsfera: number; dir: THREE.Vector3; abertura: number; espessura: number; semente: number; aneis?: number; setores?: number; alisar?: number; achatar?: number; giro?: number }) {
  const { centro, raioEsfera, dir, abertura, espessura, semente, aneis = 26, setores = 72, alisar = 0.7, achatar = 1, giro = 0 } = op;
  const ruido = criarRuido(semente);
  const n = dir.clone().normalize();
  const t = new THREE.Vector3(0, 1, 0).cross(n).normalize();
  if (t.lengthSq() < 0.01) t.set(1, 0, 0);
  t.applyAxisAngle(n, giro);
  const b = new THREE.Vector3().crossVectors(n, t);
  const vts: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  const f1 = 2 + (semente % 3);
  const f2 = 5 + (semente % 4);
  const borda = (a: number) => 1 + 0.18 * Math.sin(a * f1 + semente) + 0.09 * Math.sin(a * f2 + semente * 2.1);
  const P = new THREE.Vector3();
  const colocar = (rho: number, a: number, lado: number) => {
    const ang = rho * abertura * borda(a);
    const dx = Math.sin(ang) * Math.cos(a);
    const dy = Math.sin(ang) * Math.sin(a) * achatar;
    const dz = Math.cos(ang);
    const d = P.set(0, 0, 0).addScaledVector(t, dx).addScaledVector(b, dy).addScaledVector(n, dz).normalize();
    const nx = d.x * 2.8 + semente;
    const nv = fbm(ruido, nx, d.y * 2.8, d.z * 2.8, 3);
    const nv2 = ruido(d.x * 7 + semente, d.y * 7, d.z * 7);
    const e = Math.sqrt(Math.max(0, 1 - rho * rho));
    const inchaco = espessura * (0.72 + 0.5 * ruido(d.x * 5, d.y * 5 + semente, d.z * 5)) * e;
    const R = raioEsfera + nv * alisar * 5 + nv2 * alisar * 0.8 + lado * inchaco;
    vts.push(centro.x + d.x * R, centro.y + d.y * R, centro.z + d.z * R);
    uvs.push(a / (Math.PI * 2), rho * 0.5 + (lado > 0 ? 0 : 0.5));
  };
  for (const lado of [1, -1]) {
    const base = vts.length / 3;
    for (let i = 0; i <= aneis; i++) {
      // Mais anéis perto da borda, onde a curvatura é maior.
      const rho = Math.sin(((i / aneis) * Math.PI) / 2);
      for (let j = 0; j < setores; j++) colocar(rho, (j / setores) * Math.PI * 2, lado);
    }
    for (let i = 0; i < aneis; i++) {
      for (let j = 0; j < setores; j++) {
        const a = base + i * setores + j;
        const c = base + i * setores + ((j + 1) % setores);
        const d = base + (i + 1) * setores + j;
        const e = base + (i + 1) * setores + ((j + 1) % setores);
        if (lado > 0) idx.push(a, d, c, c, d, e);
        else idx.push(a, c, d, c, e, d);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vts, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // Os anéis de borda das duas faces coincidem: junta as normais para não marcar a emenda.
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const borda0 = aneis * setores;
  const total = vts.length / 3 / 2;
  for (let j = 0; j < setores; j++) {
    const a = borda0 + j;
    const c = total + borda0 + j;
    const x = nor.getX(a) + nor.getX(c);
    const y = nor.getY(a) + nor.getY(c);
    const z = nor.getZ(a) + nor.getZ(c);
    const l = Math.hypot(x, y, z) || 1;
    nor.setXYZ(a, x / l, y / l, z / l);
    nor.setXYZ(c, x / l, y / l, z / l);
  }
  return g;
}

/** Curva macia que caminha ao acaso dentro de uma esfera. */
export function curvaAndante(semente: number, passos: number, raio: number, centro: THREE.Vector3, tamPasso: number) {
  const r = acaso(semente);
  const p = new THREE.Vector3((r() - 0.5) * raio, (r() - 0.5) * raio, (r() - 0.5) * raio);
  const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
  const pts: THREE.Vector3[] = [];
  const aux = new THREE.Vector3();
  for (let i = 0; i < passos; i++) {
    aux.set(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(1.15);
    dir.add(aux).normalize();
    // Longe do centro, volta: mantém o novelo dentro do núcleo.
    if (p.length() > raio * 0.8) dir.addScaledVector(p.clone().normalize(), -0.75).normalize();
    p.addScaledVector(dir, tamPasso);
    if (p.length() > raio) p.setLength(raio);
    pts.push(p.clone().add(centro));
  }
  return new THREE.CatmullRomCurve3(pts);
}
