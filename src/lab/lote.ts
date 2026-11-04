import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Muitas peças do mesmo material viram uma malha só: menos chamadas de desenho, mais fluidez em celular de escola.

type V3 = [number, number, number];

// Computador recebe o dobro de segmentos: curvas lisas de verdade. Celular fica no meio-termo.
const Q = typeof navigator !== "undefined" && !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 2 : 1.4;
const q = (n: number) => Math.round(n * Q);

export const caixa = (l: number, a: number, p: number) => {
  const menor = Math.min(l, a, p);
  // Quina levemente arredondada: é ela que pega o brilho e tira a cara de bloco.
  return menor > 0.035 ? new RoundedBoxGeometry(l, a, p, 2, Math.min(0.05, menor * 0.22)) : new THREE.BoxGeometry(l, a, p);
};
export const cilindro = (r: number, a: number, s = 12, r2 = r) => new THREE.CylinderGeometry(r2, r, a, q(s));
export const esfera = (r: number, w = 14, h = 10) => new THREE.SphereGeometry(r, q(w), q(h));
export const toro = (r: number, t: number, s = 20, arco = Math.PI * 2) => new THREE.TorusGeometry(r, t, 10, q(s), arco);
export const capsula = (r: number, a: number) => new THREE.CapsuleGeometry(r, a, 6, q(12));
export const torno = (pontos: [number, number][], s = 16, ini = 0, arco = Math.PI * 2) => new THREE.LatheGeometry(pontos.map(([x, y]) => new THREE.Vector2(x, y)), q(s), ini, arco);

/** Material principal: reage à luz e ao reflexo do ambiente, com brilho suave. */
export const materialDesenho = (lados: THREE.Side = THREE.FrontSide) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.52, metalness: 0.03, side: lados });

/** Contorno de adesivo: a malha cresce pela normal e só o lado de trás aparece. */
export function materialContorno(cor = "#ffffff", espessura = 0.03) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { cor: { value: new THREE.Color(cor) }, espessura: { value: espessura } },
    vertexShader: "uniform float espessura; void main(){ vec3 p = position + normal * espessura; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
    fragmentShader: "uniform vec3 cor; void main(){ gl_FragColor = vec4(cor, 1.0); }",
    toneMapped: false,
    // Empurrado para trás: o contorno só aparece na silhueta, não entre as peças de um mesmo boneco.
    polygonOffset: true,
    polygonOffsetFactor: 6,
    polygonOffsetUnits: 6,
  });
}

export class Lote {
  private partes: THREE.BufferGeometry[] = [];

  add(g: THREE.BufferGeometry, cor: string, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], esc: V3 = [1, 1, 1]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...esc));
    const n = g.index ? g.toNonIndexed() : g.clone();
    g.dispose();
    n.applyMatrix4(m);
    n.deleteAttribute("uv");
    n.deleteAttribute("uv1");
    n.morphAttributes = {};
    const c = new THREE.Color(cor);
    const total = n.getAttribute("position").count;
    const cores = new Float32Array(total * 3);
    for (let i = 0; i < total; i++) cores.set([c.r, c.g, c.b], i * 3);
    n.setAttribute("color", new THREE.BufferAttribute(cores, 3));
    this.partes.push(n);
    return this;
  }

  get vazio() {
    return this.partes.length === 0;
  }

  geometria() {
    const g = mergeGeometries(this.partes, false);
    this.partes.forEach((p) => p.dispose());
    this.partes = [];
    if (!g) throw new Error("Lote: não foi possível juntar as peças");
    return g;
  }

  /** Malha pronta, com contorno opcional por cima da mesma geometria. */
  malha(material: THREE.Material, contorno?: THREE.Material | null) {
    const g = this.geometria();
    const grupo = new THREE.Group();
    const m = new THREE.Mesh(g, material);
    m.castShadow = true;
    m.receiveShadow = true;
    grupo.add(m);
    if (contorno) grupo.add(new THREE.Mesh(g, contorno));
    return grupo;
  }
}
