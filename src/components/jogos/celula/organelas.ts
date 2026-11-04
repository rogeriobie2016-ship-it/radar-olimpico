import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { acaso, bolhaProteina, bolsaAchatada, criarRuido, curvaAndante, deformarEsfera, fbm } from "./feitio";
import { CLOROPLASTOS, GOLGI, MITOCONDRIAS, NUCLEO, POLISSOMO, RAIO_CELULA, RETICULO_DIRECAO, VACUOLO, type Corpo, type V3 } from "./mapa";
import { materialFibra, materialHalo, materialPoeira, vivo, type Nevoa, type Partilha } from "./shaders";

export type Ctx = { partilha: Partilha; nevoa: Nevoa; lipidios: THREE.Texture; detalhe: number };

export type Mundo = {
  grupo: THREE.Group;
  /** Materiais com transmissão: viram gel quando o aparelho sofre. */
  transmissivos: THREE.MeshPhysicalMaterial[];
  /** Tudo que é só partícula, para desligar de uma vez. */
  particulas: THREE.Object3D[];
  poeiras: THREE.ShaderMaterial[];
  atualizar: (t: number, cam: THREE.Vector3) => void;
};

const quad = () => new THREE.PlaneGeometry(2, 2);

export function criarHalo(ctx: Ctx, geo: THREE.BufferGeometry, pos: THREE.Vector3 | V3, cor: THREE.ColorRepresentation, raio: number, recuo: number, forca: number) {
  const mat = materialHalo(ctx.nevoa, ctx.partilha.tempo, cor, forca);
  mat.uniforms.uRaio.value = raio;
  mat.uniforms.uRecuo.value = recuo;
  const m = new THREE.Mesh(geo, mat);
  if (Array.isArray(pos)) m.position.set(pos[0], pos[1], pos[2]);
  else m.position.copy(pos);
  m.frustumCulled = false;
  m.renderOrder = -2;
  return m;
}

const fisico = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);

function colocar(g: THREE.Object3D, b: Corpo) {
  g.position.set(b.c[0], b.c[1], b.c[2]);
  g.rotation.set(0, b.yaw, b.pitch, "YXZ");
  g.scale.setScalar(b.escala);
}

function criarMembrana(ctx: Ctx, grupo: THREE.Group) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const lip = ctx.lipidios.clone();
  lip.repeat.set(44, 22);
  lip.needsUpdate = true;
  const mat = vivo(
    fisico({ color: "#121f47", roughness: 0.42, metalness: 0.05, side: THREE.BackSide, normalMap: lip, normalScale: new THREE.Vector2(0.9, 0.9), clearcoat: 0.35, clearcoatRoughness: 0.42, sheen: 0.25, sheenColor: new THREE.Color("#4f6cdf"), sheenRoughness: 0.5, envMapIntensity: 0.7 }),
    ctx.partilha,
    { onda: { amp: 1.3, freq: 0.04, vel: 0.1 }, borda: { cor: "#2c62e0", pot: 2.4, forca: 0.42 }, manchas: { cor: "#128ca8", escala: 1.3, vel: 0.008, forca: 0.3 } },
  );
  const m = new THREE.Mesh(new THREE.SphereGeometry(RAIO_CELULA, n(220), n(140)), mat);
  grupo.add(m);

  // Proteínas de membrana: bolhas enfiadas na parede, com brilho na borda.
  const geo = bolhaProteina(5, { seg: n(30), lobos: 6, amp: 0.04, forcaLobo: 0.55 });
  const matP = vivo(
    fisico({ color: "#3a4ca8", roughness: 0.42, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.45, vertexColors: true, emissive: "#2436a8", emissiveIntensity: 0.22, envMapIntensity: 0.3 }),
    ctx.partilha,
    { borda: { cor: "#3fc8ff", pot: 2.6, forca: 0.8 } },
  );
  const r = acaso(99);
  const qtd = n(180);
  const inst = new THREE.InstancedMesh(geo, matP, qtd);
  const obj = new THREE.Object3D();
  const d = new THREE.Vector3();
  const cor = new THREE.Color();
  for (let i = 0; i < qtd; i++) {
    d.set(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    if (i < 30) d.set((r() - 0.5) * 1.1, (r() - 0.5) * 1.1, 1).normalize(); // mais gente perto dos portões
    obj.position.copy(d).multiplyScalar(RAIO_CELULA - 1.6 - r() * 0.8);
    obj.lookAt(0, 0, 0);
    obj.rotateZ(r() * 6.28);
    const e = 0.9 + r() * 1.5;
    obj.scale.set(e, e, e * (0.8 + r() * 0.6));
    obj.updateMatrix();
    inst.setMatrixAt(i, obj.matrix);
    inst.setColorAt(i, cor.setHSL(0.56 + r() * 0.2, 0.7, 0.42 + r() * 0.2));
  }
  grupo.add(inst);
}

function criarNucleo(ctx: Ctx, grupo: THREE.Group, q: THREE.BufferGeometry, transmissivos: THREE.MeshPhysicalMaterial[]) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const c = new THREE.Vector3(...NUCLEO.c);
  const g = new THREE.Group();
  g.position.copy(c);
  grupo.add(g);

  // Envelope: a transmissão deixa ver a cromatina, borrada e refratada. A borda ciano dá a dupla membrana.
  const env = vivo(
    fisico({ color: "#d6dcff", roughness: 0.035, metalness: 0, transmission: 1, thickness: 2.2, ior: 1.18, attenuationColor: new THREE.Color("#5a56ff"), attenuationDistance: 30, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.8, iridescenceIOR: 1.35, iridescenceThicknessMinimum: 180, iridescenceThicknessMaximum: 520, specularIntensity: 1, envMapIntensity: 1.1, opacity: 0.5 }),
    ctx.partilha,
    { onda: { amp: 0.34, freq: 0.14, vel: 0.22 }, borda: { cor: "#1fb8ff", pot: 3.1, forca: 1 }, gel: { min: 0.1, max: 0.85, pot: 2.4 } },
  );
  env.depthWrite = true;
  env.transparent = false;
  transmissivos.push(env);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(NUCLEO.r, n(160), n(110)), env));

  // Cromatina: fios longos, em novelo.
  const matC = vivo(fisico({ color: "#3a1460", roughness: 0.3, emissive: "#e01ac0", emissiveIntensity: 0.56, clearcoat: 1, clearcoatRoughness: 0.2 }), ctx.partilha, { borda: { cor: "#ff6ae8", pot: 1.4, forca: 1.5 } });
  const fios: THREE.BufferGeometry[] = [];
  const zero = new THREE.Vector3();
  for (let i = 0; i < 9; i++) fios.push(new THREE.TubeGeometry(curvaAndante(40 + i, 70, NUCLEO.r * 0.86, zero, 1.5), n(340), [0.13, 0.09, 0.17][i % 3], 7, false));
  const cromatina = new THREE.Mesh(mergeGeometries(fios), matC);
  fios.forEach((f) => f.dispose());
  g.add(cromatina);

  // Nucléolo: o miolo dourado onde nascem os ribossomos.
  const nucleolo = new THREE.Mesh(
    bolhaProteina(21, { seg: n(110), lobos: 10, amp: 0.1, freq: 2.3 }),
    vivo(fisico({ color: "#6a3208", roughness: 0.22, emissive: "#e05a04", emissiveIntensity: 0.42, vertexColors: true, clearcoat: 1, clearcoatRoughness: 0.15, iridescence: 0.4 }), ctx.partilha, { onda: { amp: 0.06, freq: 0.8, vel: 0.4 }, borda: { cor: "#ffb040", pot: 1.8, forca: 1.15 } }),
  );
  nucleolo.scale.setScalar(4.6);
  nucleolo.position.set(3.2, 2.1, 2.4);
  g.add(nucleolo);

  // Poros nucleares: anéis acesos, na superfície.
  const poro = new THREE.TorusGeometry(0.44, 0.11, 10, n(26));
  const matP = fisico({ color: "#123d55", roughness: 0.25, metalness: 0.5, emissive: "#16c8ff", emissiveIntensity: 1, clearcoat: 1 });
  const qtd = n(210);
  const inst = new THREE.InstancedMesh(poro, matP, qtd);
  const miolo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color("#7ff0ff").multiplyScalar(1.5) }), qtd);
  const obj = new THREE.Object3D();
  const ouro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < qtd; i++) {
    const y = 1 - ((i + 0.5) / qtd) * 2;
    const raio = Math.sqrt(1 - y * y);
    const a = i * ouro;
    obj.position.set(Math.cos(a) * raio, y, Math.sin(a) * raio).multiplyScalar(NUCLEO.r + 0.08);
    obj.lookAt(zero);
    obj.updateMatrix();
    inst.setMatrixAt(i, obj.matrix);
    miolo.setMatrixAt(i, obj.matrix);
  }
  g.add(inst, miolo);

  grupo.add(criarHalo(ctx, q, c, "#2a5cff", NUCLEO.r * 2.1, NUCLEO.r * 0.9, 0.34));
  const luz = new THREE.PointLight("#70b6ff", 1500, 90, 2);
  luz.position.copy(c).add(new THREE.Vector3(0, 0, 0));
  grupo.add(luz);
  const luz2 = new THREE.PointLight("#ff9a55", 200, 26, 2);
  luz2.position.set(c.x + 3.2, c.y + 2.1, c.z + 2.4);
  grupo.add(luz2);
}

function criarVacuolo(ctx: Ctx, grupo: THREE.Group, q: THREE.BufferGeometry, transmissivos: THREE.MeshPhysicalMaterial[]) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const mat = vivo(
    fisico({ color: "#c8f5f0", roughness: 0.03, transmission: 1, thickness: 3, ior: 1.33, attenuationColor: new THREE.Color("#20c7c0"), attenuationDistance: 34, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 0.4, envMapIntensity: 1.4, opacity: 0.4 }),
    ctx.partilha,
    { onda: { amp: 0.55, freq: 0.09, vel: 0.16 }, borda: { cor: "#14d8c4", pot: 3.2, forca: 0.7 }, gel: { min: 0.06, max: 0.7, pot: 2.6 } },
  );
  mat.depthWrite = true;
  mat.transparent = false;
  transmissivos.push(mat);
  const m = new THREE.Mesh(new THREE.SphereGeometry(VACUOLO.r, n(120), n(84)), mat);
  m.position.set(...VACUOLO.c);
  grupo.add(m);
  // Cristais e íons em suspensão, para o interior não ficar vazio.
  const r = acaso(71);
  const qtd = n(30);
  const inst = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.36, 0), fisico({ color: "#7fe8e0", roughness: 0.12, metalness: 0.2, clearcoat: 1, emissive: "#30d8c8", emissiveIntensity: 0.45, flatShading: true, envMapIntensity: 1.6 }), qtd);
  const obj = new THREE.Object3D();
  for (let i = 0; i < qtd; i++) {
    obj.position.set(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(VACUOLO.r * (0.2 + r() * 0.65)).add(m.position);
    obj.rotation.set(r() * 6, r() * 6, r() * 6);
    obj.scale.setScalar(0.5 + r() * 1.3);
    obj.updateMatrix();
    inst.setMatrixAt(i, obj.matrix);
  }
  grupo.add(inst);
  grupo.add(criarHalo(ctx, q, VACUOLO.c, "#25bfc4", VACUOLO.r * 1.8, VACUOLO.r * 0.9, 0.2));
}

/** Um modelo de mitocôndria com cristas; os outros são cópias que compartilham a geometria. */
function criarMitocondrias(ctx: Ctx, grupo: THREE.Group, q: THREE.BufferGeometry) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const R = 6.2;
  const meio = 6.4;
  const modelo = new THREE.Group();

  const casca = new THREE.CapsuleGeometry(R, meio * 2, n(24), n(56));
  casca.rotateZ(Math.PI / 2);
  const dentro = new THREE.Mesh(
    casca,
    vivo(fisico({ color: "#3a0c04", roughness: 0.55, transparent: true, side: THREE.BackSide, emissive: "#c82a04", emissiveIntensity: 0.3 }), ctx.partilha, { gel: { min: 0.72, max: 0.9, pot: 1.4 } }),
  );
  dentro.scale.setScalar(0.97);
  dentro.renderOrder = 1;

  // Cristas: dobras que entram alternadas, de um lado e do outro.
  const placas: THREE.BufferGeometry[] = [];
  const ruido = criarRuido(8);
  const qtd = 15;
  for (let i = 0; i < qtd; i++) {
    const u = i / (qtd - 1);
    const x = -meio - R * 0.62 + u * (2 * meio + R * 1.24);
    const dxBorda = Math.max(0, Math.abs(x) - meio);
    const Rl = Math.sqrt(Math.max(0.2, (R * 0.86) ** 2 - dxBorda * dxBorda));
    const lado = i % 2 ? 1 : -1;
    const alt = Rl * (0.62 + 0.14 * Math.sin(i * 2.3));
    const g = new THREE.SphereGeometry(1, n(26), n(20));
    deformarEsfera(g, (a, b, c) => 1 + 0.12 * fbm(ruido, a * 2 + i, b * 2, c * 2, 2));
    g.scale(0.22, alt, Rl * 0.66);
    g.translate(x, lado * (Rl - alt * 0.98), 0);
    g.rotateX(lado * 0.12 * Math.sin(i * 1.7));
    placas.push(g);
  }
  const cristas = new THREE.Mesh(
    mergeGeometries(placas),
    vivo(fisico({ color: "#8a2c04", roughness: 0.38, emissive: "#ff4a00", emissiveIntensity: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.45 }), ctx.partilha, { borda: { cor: "#ffa040", pot: 1.5, forca: 1.5 }, onda: { amp: 0.09, freq: 0.5, vel: 0.5 } }),
  );
  placas.forEach((p) => p.dispose());

  const fora = new THREE.Mesh(
    casca,
    vivo(fisico({ color: "#ff8a4a", roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true, iridescence: 0.6, iridescenceIOR: 1.3, envMapIntensity: 1.5 }), ctx.partilha, { onda: { amp: 0.16, freq: 0.28, vel: 0.35 }, borda: { cor: "#ff5a18", pot: 2.8, forca: 0.85 }, gel: { min: 0.04, max: 0.92, pot: 2.1 } }),
  );
  fora.renderOrder = 2;
  modelo.add(dentro, cristas, fora);

  MITOCONDRIAS.forEach((b, i) => {
    const m = modelo.clone();
    colocar(m, b);
    grupo.add(m);
    grupo.add(criarHalo(ctx, q, b.c, "#ff6a1e", (R + meio) * 1.5 * b.escala, R * 1.2 * b.escala, i === 0 ? 0.55 : 0.32));
  });
  const luz = new THREE.PointLight("#ff8a3a", 430, 60, 2);
  luz.position.set(MITOCONDRIAS[0].c[0] - 14, MITOCONDRIAS[0].c[1] + 6, MITOCONDRIAS[0].c[2] - 16);
  grupo.add(luz);
}

function criarCloroplastos(ctx: Ctx, grupo: THREE.Group, q: THREE.BufferGeometry) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const modelo = new THREE.Group();
  const RX = 14.5;
  const RY = 7.4;
  const casca = new THREE.SphereGeometry(1, n(80), n(56));
  casca.scale(RX, RY, RY);

  const dentro = new THREE.Mesh(casca, vivo(fisico({ color: "#06381a", roughness: 0.6, transparent: true, side: THREE.BackSide, emissive: "#088a30", emissiveIntensity: 0.26 }), ctx.partilha, { gel: { min: 0.68, max: 0.9, pot: 1.2 } }));
  dentro.scale.setScalar(0.975);
  dentro.renderOrder = 1;

  // Tilacoides: discos empilhados em granos, ligados por lamelas.
  const perfil = [new THREE.Vector2(0, -0.14), new THREE.Vector2(1.45, -0.14), new THREE.Vector2(1.72, -0.09), new THREE.Vector2(1.8, 0), new THREE.Vector2(1.72, 0.09), new THREE.Vector2(1.45, 0.14), new THREE.Vector2(0, 0.14)];
  const disco = new THREE.LatheGeometry(perfil, n(28));
  const matD = vivo(fisico({ color: "#0d5a22", roughness: 0.22, emissive: "#0cb83a", emissiveIntensity: 0.34, clearcoat: 1, clearcoatRoughness: 0.15, iridescence: 0.5, envMapIntensity: 1.3 }), ctx.partilha, { borda: { cor: "#8dff5a", pot: 1.5, forca: 1.1 } });
  const r = acaso(17);
  const granos: THREE.Vector3[] = [];
  for (let i = 0; i < 11; i++) {
    const x = -10.4 + (i / 10) * 20.8;
    const lim = Math.sqrt(Math.max(0, 1 - (x / (RX * 0.9)) ** 2)) * RY * 0.5;
    granos.push(new THREE.Vector3(x, (r() - 0.5) * 2.2 * lim, (r() - 0.5) * 2 * lim));
  }
  const camadas = 9;
  const inst = new THREE.InstancedMesh(disco, matD, granos.length * camadas);
  const obj = new THREE.Object3D();
  const cor = new THREE.Color();
  let k = 0;
  for (const g of granos) {
    const incl = (r() - 0.5) * 0.5;
    const e = 0.8 + r() * 0.32;
    for (let c = 0; c < camadas; c++) {
      obj.position.copy(g).add(new THREE.Vector3(Math.sin(incl) * (c - 4) * 0.36, (c - 4) * 0.36, 0));
      obj.rotation.set(0, r() * 6, incl);
      obj.scale.set(e, 1, e);
      obj.updateMatrix();
      inst.setMatrixAt(k, obj.matrix);
      inst.setColorAt(k, cor.setHSL(0.34 + r() * 0.06, 0.85, 0.5 + r() * 0.25));
      k++;
    }
  }
  const lamelas: THREE.BufferGeometry[] = [];
  for (let i = 0; i < granos.length - 1; i++) {
    for (let j = 0; j < 2; j++) {
      const a = granos[i].clone().add(new THREE.Vector3(0, (j - 0.5) * 1.5, 0));
      const b = granos[i + 1].clone().add(new THREE.Vector3(0, (0.5 - j) * 1.1, 0));
      const c = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2));
      lamelas.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, c, b]), 14, 0.09, 6));
    }
  }
  const lamMesh = new THREE.Mesh(mergeGeometries(lamelas), fisico({ color: "#0a4a20", emissive: "#2aff5a", emissiveIntensity: 0.7, roughness: 0.4 }));
  lamelas.forEach((l) => l.dispose());

  const fora = new THREE.Mesh(
    casca,
    vivo(fisico({ color: "#a8ffba", roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, iridescence: 0.75, iridescenceIOR: 1.35, iridescenceThicknessMinimum: 120, iridescenceThicknessMaximum: 420, envMapIntensity: 1.5 }), ctx.partilha, { onda: { amp: 0.2, freq: 0.22, vel: 0.28 }, borda: { cor: "#20e860", pot: 2.9, forca: 0.8 }, gel: { min: 0.03, max: 0.9, pot: 2.2 } }),
  );
  fora.renderOrder = 2;
  modelo.add(dentro, inst, lamMesh, fora);

  CLOROPLASTOS.forEach((b, i) => {
    const m = modelo.clone();
    colocar(m, b);
    grupo.add(m);
    grupo.add(criarHalo(ctx, q, b.c, "#27d65e", RX * 1.55 * b.escala, RY * 1.1 * b.escala, i === 0 ? 0.5 : 0.28));
  });
  const luz = new THREE.PointLight("#7dff9a", 380, 58, 2);
  luz.position.set(CLOROPLASTOS[0].c[0] + 6, CLOROPLASTOS[0].c[1] - 10, CLOROPLASTOS[0].c[2] + 18);
  grupo.add(luz);
}

function criarReticulo(ctx: Ctx, grupo: THREE.Group) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const c = new THREE.Vector3(...NUCLEO.c);
  const dir = new THREE.Vector3(...RETICULO_DIRECAO).normalize();
  const lip = ctx.lipidios.clone();
  lip.repeat.set(30, 8);
  lip.needsUpdate = true;
  const mat = vivo(
    fisico({ color: "#16286e", roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.14, normalMap: lip, normalScale: new THREE.Vector2(0.28, 0.28), sheen: 0.5, sheenColor: new THREE.Color("#4f7aff"), sheenRoughness: 0.4, emissive: "#0c2ab8", emissiveIntensity: 0.18, side: THREE.DoubleSide, iridescence: 0.7, iridescenceIOR: 1.4, envMapIntensity: 1.25 }),
    ctx.partilha,
    { onda: { amp: 0.22, freq: 0.16, vel: 0.26 }, borda: { cor: "#2f8cff", pot: 2.6, forca: 1.15 }, manchas: { cor: "#2b6cff", escala: 0.9, vel: 0.02, forca: 0.5 } },
  );
  const bolsas: THREE.BufferGeometry[] = [];
  const rib = acaso(5);
  const pontos: { p: THREE.Vector3; n: THREE.Vector3 }[] = [];
  // Cisternas em fita, em camadas à volta do núcleo. As frestas deixam ver as camadas de dentro.
  const lados = [dir, new THREE.Vector3(0.1, 0.8, -0.58).normalize(), new THREE.Vector3(0.8, -0.56, -0.2).normalize()];
  const sobe = new THREE.Vector3(0, 1, 0);
  lados.forEach((d, g) => {
    const camadas = g === 0 ? 5 : 3;
    const eixoLat = new THREE.Vector3().crossVectors(d, sobe).normalize();
    for (let i = 0; i < camadas; i++) {
      const raio = NUCLEO.r + 3.4 + i * 2.7;
      const fitas = g === 0 ? 4 : 3;
      for (let k = 0; k < fitas; k++) {
        const lat = (k - (fitas - 1) / 2) * 0.33 + (i % 2) * 0.12;
        const onde = d.clone().applyAxisAngle(eixoLat, lat).normalize();
        const geo = bolsaAchatada({ centro: c, raioEsfera: raio, dir: onde, abertura: (g === 0 ? 0.66 : 0.46) - i * 0.03, espessura: 0.52, semente: 3 + i * 7 + k * 3 + g * 11, aneis: n(13), setores: n(110), achatar: 0.2, giro: 0.15 * Math.sin(i * 2.1 + k), alisar: 0.34 });
        bolsas.push(geo);
        // Ribossomos colados na face externa: é isso que faz o retículo ser rugoso.
        const pos = geo.attributes.position as THREE.BufferAttribute;
        const nor = geo.attributes.normal as THREE.BufferAttribute;
        const metade = pos.count / 2;
        const quantos = n(g === 0 ? 42 : 26);
        for (let q = 0; q < quantos; q++) {
          const v = Math.floor(rib() * metade);
          pontos.push({ p: new THREE.Vector3().fromBufferAttribute(pos, v), n: new THREE.Vector3().fromBufferAttribute(nor, v) });
        }
      }
    }
  });
  const m = new THREE.Mesh(mergeGeometries(bolsas), mat);
  bolsas.forEach((b) => b.dispose());
  grupo.add(m);

  const dot = new THREE.IcosahedronGeometry(0.2, 1);
  const instR = new THREE.InstancedMesh(dot, fisico({ color: "#6a3b08", roughness: 0.3, emissive: "#ff8a10", emissiveIntensity: 0.9, clearcoat: 1 }), pontos.length);
  const obj = new THREE.Object3D();
  pontos.forEach((o, i) => {
    obj.position.copy(o.p).addScaledVector(o.n, 0.12);
    obj.scale.setScalar(0.65 + rib() * 0.7);
    obj.updateMatrix();
    instR.setMatrixAt(i, obj.matrix);
  });
  grupo.add(instR);

  // Retículo liso: tubos ramificados, sem ribossomos.
  const tubos: THREE.BufferGeometry[] = [];
  const r = acaso(23);
  for (let i = 0; i < 9; i++) {
    const a = dir.clone().add(new THREE.Vector3((r() - 0.5) * 1.2, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2)).normalize();
    const pts: THREE.Vector3[] = [];
    let p = c.clone().addScaledVector(a, NUCLEO.r + 15 + r() * 5);
    const d = a.clone();
    for (let k = 0; k < 7; k++) {
      pts.push(p.clone());
      d.add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.9)).normalize();
      p = p.clone().addScaledVector(d, 3.2);
    }
    tubos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n(60), 0.3, 10));
  }
  const liso = new THREE.Mesh(mergeGeometries(tubos), vivo(fisico({ color: "#1c1f6c", roughness: 0.24, emissive: "#3a20e0", emissiveIntensity: 0.25, clearcoat: 1, envMapIntensity: 1.2 }), ctx.partilha, { onda: { amp: 0.06, freq: 0.45, vel: 0.35 }, borda: { cor: "#7a58ff", pot: 2.2, forca: 0.9 } }));
  tubos.forEach((b) => b.dispose());
  grupo.add(liso);
  const luz = new THREE.PointLight("#6a8cff", 260, 60, 2);
  luz.position.copy(c).addScaledVector(dir, NUCLEO.r + 30).add(new THREE.Vector3(0, 8, 0));
  grupo.add(luz);
}

function criarGolgi(ctx: Ctx, grupo: THREE.Group, q: THREE.BufferGeometry) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const c = new THREE.Vector3(...GOLGI.c);
  const dir = new THREE.Vector3(0.45, 0.25, 0.86).normalize();
  const mat = vivo(
    fisico({ color: "#7a1a5e", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15, emissive: "#e0108a", emissiveIntensity: 0.4, side: THREE.DoubleSide, iridescence: 0.6, sheen: 0.6, sheenColor: new THREE.Color("#ff70c0") }),
    ctx.partilha,
    { onda: { amp: 0.14, freq: 0.3, vel: 0.3 }, borda: { cor: "#ff6ac0", pot: 2.2, forca: 0.8 } },
  );
  const bolsas: THREE.BufferGeometry[] = [];
  const raioBase = 20;
  const centro = c.clone().addScaledVector(dir, -raioBase);
  for (let i = 0; i < 7; i++) {
    bolsas.push(bolsaAchatada({ centro, raioEsfera: raioBase + (i - 3) * 1.9, dir, abertura: 0.46 - Math.abs(i - 3) * 0.035, espessura: 0.62, semente: 31 + i, alisar: 0.2, aneis: n(16), setores: n(44) }));
  }
  grupo.add(new THREE.Mesh(mergeGeometries(bolsas), mat));
  bolsas.forEach((b) => b.dispose());
  const r = acaso(61);
  const qtd = n(34);
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.62, 16, 12), fisico({ color: "#ff8ac8", roughness: 0.08, clearcoat: 1, emissive: "#ff2a98", emissiveIntensity: 0.7 }), qtd);
  const obj = new THREE.Object3D();
  for (let i = 0; i < qtd; i++) {
    obj.position.copy(c).add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(GOLGI.r + 1 + r() * 7));
    obj.scale.setScalar(0.5 + r() * 0.9);
    obj.updateMatrix();
    inst.setMatrixAt(i, obj.matrix);
  }
  grupo.add(inst);
  grupo.add(criarHalo(ctx, q, c, "#ff4fb0", 18, 8, 0.4));
}

/** Ribossomo: subunidade maior e menor, como dois gomos colados. */
function geoRibossomo(seg: number) {
  const a = bolhaProteina(2, { seg, lobos: 3, amp: 0.03, freq: 1.4, forcaLobo: 0.3 });
  a.scale(1, 0.82, 1);
  const b = bolhaProteina(3, { seg, lobos: 3, amp: 0.03, freq: 1.4, forcaLobo: 0.3 });
  b.scale(0.74, 0.46, 0.74);
  b.translate(0.08, 0.88, 0.05);
  const g = mergeGeometries([a, b])!;
  a.dispose();
  b.dispose();
  return g;
}

function criarRibossomos(ctx: Ctx, grupo: THREE.Group, q: THREE.BufferGeometry) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const mat = vivo(fisico({ color: "#8a4408", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, vertexColors: true, emissive: "#d86a04", emissiveIntensity: 0.3, iridescence: 0.5, envMapIntensity: 1.3 }), ctx.partilha, { borda: { cor: "#ffb040", pot: 1.6, forca: 1.1 }, respira: { amp: 0.22, freq: 0.5, vel: 0.9 } });

  // Soltos no citosol.
  const geo = geoRibossomo(n(16));
  const r = acaso(47);
  const qtd = n(260);
  const inst = new THREE.InstancedMesh(geo, mat, qtd);
  const obj = new THREE.Object3D();
  for (let i = 0; i < qtd; i++) {
    obj.position.set(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(26 + r() * 54);
    obj.rotation.set(r() * 6, r() * 6, r() * 6);
    obj.scale.setScalar(0.28 + r() * 0.2);
    obj.updateMatrix();
    inst.setMatrixAt(i, obj.matrix);
  }
  grupo.add(inst);

  // Polissomo: vários ribossomos sobre o mesmo RNAm. É o herói da missão.
  const c = new THREE.Vector3(...POLISSOMO.c);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const a = u * Math.PI * 3.1;
    pts.push(new THREE.Vector3(Math.cos(a) * (6 + u * 7), (u - 0.5) * 8 + Math.sin(a * 2.2) * 1.6, Math.sin(a) * (6 + u * 7)).add(c));
  }
  const curva = new THREE.CatmullRomCurve3(pts);
  const fio = new THREE.Mesh(new THREE.TubeGeometry(curva, n(320), 0.2, 8), vivo(fisico({ color: "#4a0d38", roughness: 0.3, clearcoat: 1, emissive: "#ff1fa8", emissiveIntensity: 0.9 }), ctx.partilha, { borda: { cor: "#ff8ae0", pot: 1.5, forca: 1.2 } }));
  grupo.add(fio);
  const qt = 11;
  const heroi = new THREE.InstancedMesh(geoRibossomo(n(34)), mat, qt);
  for (let i = 0; i < qt; i++) {
    obj.position.copy(curva.getPoint((i + 0.5) / qt));
    obj.lookAt(c);
    obj.rotateX(Math.PI / 2);
    obj.scale.setScalar(1.75);
    obj.updateMatrix();
    heroi.setMatrixAt(i, obj.matrix);
  }
  grupo.add(heroi);
  grupo.add(criarHalo(ctx, q, c, "#ff9a3a", 26, 10, 0.32));
  const luz = new THREE.PointLight("#ffb060", 300, 44, 2);
  luz.position.copy(c);
  grupo.add(luz);
}

function criarCitoesqueleto(ctx: Ctx, grupo: THREE.Group) {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const r = acaso(13);
  const fazer = (qtd: number, raio: number, base: string, pulso: string) => {
    const lista: THREE.BufferGeometry[] = [];
    for (let i = 0; i < qtd; i++) {
      const a = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(RAIO_CELULA * 0.98);
      const b = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(RAIO_CELULA * 0.98);
      const pts = [a];
      for (let k = 1; k < 6; k++) {
        const u = k / 6;
        const m = a.clone().lerp(b, u);
        m.add(new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(26));
        // Contorna o núcleo: microtúbulo não atravessa organela.
        const dn = m.clone().sub(new THREE.Vector3(...NUCLEO.c));
        if (dn.length() < NUCLEO.r + 7) m.add(dn.setLength(NUCLEO.r + 9 - dn.length()));
        pts.push(m);
      }
      pts.push(b);
      lista.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n(120), raio, 6));
    }
    const g = mergeGeometries(lista)!;
    lista.forEach((l) => l.dispose());
    const m = new THREE.Mesh(g, materialFibra(ctx.nevoa, ctx.partilha.tempo, base, pulso));
    grupo.add(m);
  };
  fazer(16, 0.13, "#1a6e94", "#7ff0ff");
  fazer(18, 0.07, "#4a35a8", "#c0a0ff");
}

export function criarPoeira(ctx: Ctx, semente: number, qtd: number, op: Parameters<typeof materialPoeira>[2]) {
  const r = acaso(semente);
  const pos = new Float32Array(qtd * 3);
  const se = new Float32Array(qtd);
  for (let i = 0; i < qtd; i++) {
    pos[i * 3] = r() * op.caixa;
    pos[i * 3 + 1] = r() * op.caixa;
    pos[i * 3 + 2] = r() * op.caixa;
    se[i] = r();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(se, 1));
  const mat = materialPoeira(ctx.nevoa, ctx.partilha.tempo, op);
  const p = new THREE.Points(g, mat);
  p.frustumCulled = false;
  return p;
}

export function criarMundo(ctx: Ctx): Mundo {
  const grupo = new THREE.Group();
  const q = quad();
  const transmissivos: THREE.MeshPhysicalMaterial[] = [];

  criarMembrana(ctx, grupo);
  criarNucleo(ctx, grupo, q, transmissivos);
  criarVacuolo(ctx, grupo, q, transmissivos);
  criarMitocondrias(ctx, grupo, q);
  criarCloroplastos(ctx, grupo, q);
  criarReticulo(ctx, grupo);
  criarGolgi(ctx, grupo, q);
  criarRibossomos(ctx, grupo, q);
  criarCitoesqueleto(ctx, grupo);

  // Luz fria geral, só para dar volume ao que está longe das organelas.
  const d = new THREE.DirectionalLight("#7fb4ff", 0.42);
  d.position.set(-0.4, 1, 0.6);
  grupo.add(d);

  // Partículas: poeira fina à volta da câmera, moléculas grandes desfocadas e bolsões de cor no citosol.
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const fina = criarPoeira(ctx, 3, n(3400), { caixa: 70, tam: 0.11, cor1: "#7ff5ff", cor2: "#ffd29a", forca: 1.6, suave: 2 });
  const bokeh = criarPoeira(ctx, 9, n(260), { caixa: 110, tam: 0.82, cor1: "#2fc6ff", cor2: "#a06bff", forca: 0.16, suave: 1.4 });
  const particulas: THREE.Object3D[] = [fina, bokeh];
  grupo.add(fina, bokeh);

  const r = acaso(77);
  const cores = ["#0f8fb0", "#3a4cd8", "#7a2fd0", "#0fa892"];
  for (let i = 0; i < 16; i++) {
    const p = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(30 + r() * 44);
    const h = criarHalo(ctx, q, p, cores[i % cores.length], 34 + r() * 22, 0, 0.05 + r() * 0.05);
    particulas.push(h);
    grupo.add(h);
  }

  const poeiras = [fina.material as THREE.ShaderMaterial, bokeh.material as THREE.ShaderMaterial];
  return {
    grupo,
    transmissivos,
    particulas,
    poeiras,
    atualizar: (_t, cam) => {
      for (const p of poeiras) p.uniforms.uCentro.value.copy(cam);
    },
  };
}
