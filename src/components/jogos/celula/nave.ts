import * as THREE from "three";
import { materialFita } from "./shaders";

// A nave em miniatura: casco metálico torneado, cabine de vidro, asas com chanfro e dois motores. Aponta para −Z.

const sv = (x: number, y: number) => new THREE.Vector2(x, y);

function torno(pontos: THREE.Vector2[], seg: number, divs = 90) {
  const curva = new THREE.SplineCurve(pontos);
  const g = new THREE.LatheGeometry(curva.getPoints(divs), seg);
  g.rotateX(-Math.PI / 2); // eixo do torno vira o eixo da nave, com o nariz em −Z
  return g;
}

export type Nave = {
  raiz: THREE.Group;
  bocais: THREE.Vector3[];
  atualizar: (t: number, forcaMotor: number) => void;
  fitas: Fita[];
};

export function criarNave(detalhe: number): Nave {
  const n = (x: number) => Math.max(8, Math.round(x * detalhe));
  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  raiz.add(corpo);

  const metal = new THREE.MeshPhysicalMaterial({ color: "#aeb8c6", metalness: 0.6, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.24, envMapIntensity: 0.8 });
  const escuro = new THREE.MeshPhysicalMaterial({ color: "#1a2433", metalness: 0.75, roughness: 0.34, clearcoat: 0.8, envMapIntensity: 1.2 });
  const laranja = new THREE.MeshPhysicalMaterial({ color: "#f58a33", metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1, emissive: "#f58a33", emissiveIntensity: 0.25 });
  const vidro = new THREE.MeshPhysicalMaterial({ color: "#0d2a3e", metalness: 0.1, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.82, iridescence: 1, iridescenceIOR: 1.5, iridescenceThicknessMinimum: 200, iridescenceThicknessMaximum: 600, envMapIntensity: 2.2, specularIntensity: 1 });
  const luzCiano = new THREE.MeshBasicMaterial({ color: new THREE.Color("#7ff6ff").multiplyScalar(2.2) });
  // Bocal com centro quente e borda escura, em vez de um disco chapado.
  const fogo = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color("#3fd8ff") } },
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uC;varying vec2 vU;void main(){float r=length(vU-.5)*2.;float g=pow(1.-clamp(r,0.,1.),1.6);vec3 c=mix(uC*.12,uC*1.1+vec3(.5)*g*g,g);gl_FragColor=vec4(c,1.);}`,
  });

  // Casco
  const casco = torno([sv(0.001, 1.25), sv(0.3, 1.15), sv(0.42, 0.72), sv(0.46, 0.1), sv(0.4, -0.5), sv(0.28, -0.92), sv(0.12, -1.12), sv(0.001, -1.2)].reverse(), n(64));
  casco.scale(1, 0.82, 1);
  corpo.add(new THREE.Mesh(casco, metal));

  // Faixa laranja: a mesma cor do logo do programa.
  const faixa = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.032, 10, n(56)), laranja);
  faixa.scale.set(1, 0.82, 1);
  faixa.position.z = 0.35;
  corpo.add(faixa);

  // Cabine
  const cabine = new THREE.Mesh(new THREE.SphereGeometry(1, n(44), n(28)), vidro);
  cabine.scale.set(0.27, 0.2, 0.56);
  cabine.position.set(0, 0.26, -0.3);
  corpo.add(cabine);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, n(48)), escuro);
  aro.rotation.x = Math.PI / 2;
  aro.scale.set(0.28, 0.57, 1);
  aro.position.set(0, 0.24, -0.3);
  corpo.add(aro);

  // Asas em flecha, com chanfro
  const contorno = new THREE.Shape();
  contorno.moveTo(0, 0.42);
  contorno.bezierCurveTo(0.5, 0.25, 1.1, -0.2, 1.42, -0.62);
  contorno.lineTo(1.28, -0.74);
  contorno.bezierCurveTo(0.9, -0.5, 0.45, -0.42, 0, -0.5);
  contorno.closePath();
  const asa = new THREE.ExtrudeGeometry(contorno, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: n(20) });
  asa.rotateX(Math.PI / 2);
  for (const lado of [1, -1]) {
    const a = new THREE.Mesh(asa, metal);
    a.scale.x = lado;
    a.position.set(lado * 0.22, -0.03, 0.2);
    a.rotation.z = lado * -0.13;
    corpo.add(a);
    // Ponta da asa acesa
    const ponta = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), luzCiano);
    ponta.position.set(lado * 1.6, -0.2, 0.92);
    corpo.add(ponta);
    const friso = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.74, 4, 8), laranja);
    friso.rotation.set(Math.PI / 2, 0, lado * -0.92);
    friso.position.set(lado * 0.92, -0.08, 0.5);
    corpo.add(friso);
  }

  // Deriva
  const deriva = new THREE.Shape();
  deriva.moveTo(0, 0);
  deriva.bezierCurveTo(0.2, 0.15, 0.4, 0.5, 0.62, 0.62);
  deriva.lineTo(0.78, 0.62);
  deriva.bezierCurveTo(0.7, 0.3, 0.72, 0.1, 0.78, 0);
  deriva.closePath();
  const dg = new THREE.ExtrudeGeometry(deriva, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 3, curveSegments: n(14) });
  dg.rotateY(Math.PI / 2);
  dg.translate(-0.01, 0.2, -0.0);
  const derivaM = new THREE.Mesh(dg, metal);
  derivaM.position.set(0, 0, 1.08);
  derivaM.rotation.y = Math.PI;
  corpo.add(derivaM);

  // Motores
  const nacela = torno([sv(0.001, 0.86), sv(0.15, 0.74), sv(0.18, 0.2), sv(0.2, -0.3), sv(0.17, -0.62), sv(0.1, -0.72), sv(0.001, -0.74)].reverse(), n(36));
  const anel = new THREE.TorusGeometry(0.15, 0.03, 10, n(36));
  const bocais: THREE.Vector3[] = [];
  const chamas: THREE.Mesh[] = [];
  const chamaG = new THREE.ConeGeometry(0.115, 1, n(24), 1, true);
  chamaG.translate(0, -0.5, 0);
  chamaG.rotateX(-Math.PI / 2);
  const chamaM = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uF: { value: 0 }, uC: { value: new THREE.Color("#57dfff") } },
    vertexShader: `varying float vZ;void main(){vZ=position.z;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uF;uniform vec3 uC;varying float vZ;void main(){float k=pow(1.-clamp(vZ,0.,1.),2.5);gl_FragColor=vec4(uC*k*uF*1.,1.);}`,
  });
  for (const lado of [1, -1]) {
    const x = lado * 0.62;
    const y = -0.08;
    const z = 0.46;
    const c = new THREE.Mesh(nacela, metal);
    c.position.set(x, y, z);
    corpo.add(c);
    const a = new THREE.Mesh(anel, escuro);
    a.position.set(x, y, z + 0.8);
    corpo.add(a);
    const nucleo = new THREE.Mesh(new THREE.CircleGeometry(0.125, n(24)), fogo);
    nucleo.position.set(x, y, z + 0.8);
    corpo.add(nucleo);
    const f = new THREE.Mesh(chamaG, chamaM);
    f.position.set(x, y, z + 0.82);
    corpo.add(f);
    chamas.push(f);
    bocais.push(new THREE.Vector3(x, y, z + 0.95));
  }
  const luzProa = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), luzCiano);
  luzProa.position.set(0, 0.02, -1.22);
  corpo.add(luzProa);

  // Farol: é ele que faz as organelas reagirem à passagem da nave.
  const farol = new THREE.PointLight("#bfeaff", 30, 16, 2);
  farol.position.set(0, 1.2, -3.4);
  raiz.add(farol);
  // Luz de preenchimento: vem do lado da câmera, para o casco metálico não virar uma silhueta.
  const preenche = new THREE.PointLight("#fff4e6", 10, 9, 2);
  preenche.position.set(0, 3.4, 4.6);
  raiz.add(preenche);
  const motor = new THREE.PointLight("#57dfff", 10, 9, 2);
  motor.position.set(0, 0, 1.8);
  raiz.add(motor);

  const fitas = [new Fita(56, "#57dfff", 1.1), new Fita(56, "#57dfff", 1.1)];

  return {
    raiz,
    bocais,
    fitas,
    atualizar: (t, forca) => {
      const k = 0.35 + forca * 0.65;
      chamaM.uniforms.uF.value = (0.2 + forca * 0.8) * (0.86 + 0.14 * Math.sin(t * 43));
      for (const c of chamas) c.scale.set(1, 1, 0.5 + k * 1.6);
      motor.intensity = 3 + forca * 7;
      corpo.position.y = Math.sin(t * 1.3) * 0.035;
    },
  };
}

/** Rastro em fita virada para a câmera. */
export class Fita {
  readonly malha: THREE.Mesh;
  private pos: Float32Array;
  private hist: Float32Array;
  private alfa: Float32Array;
  private iniciada = false;
  private aux = new THREE.Vector3();
  private aux2 = new THREE.Vector3();
  private lado = new THREE.Vector3();

  constructor(private n: number, cor: THREE.ColorRepresentation, forca: number, private largura = 0.045) {
    this.pos = new Float32Array(n * 2 * 3);
    this.hist = new Float32Array(n * 3);
    this.alfa = new Float32Array(n * 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aA", new THREE.BufferAttribute(this.alfa, 1));
    const idx: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    g.setIndex(idx);
    for (let i = 0; i < n; i++) {
      const v = 1 - i / (n - 1);
      this.alfa[i * 2] = this.alfa[i * 2 + 1] = v;
    }
    this.malha = new THREE.Mesh(g, materialFita(cor, forca));
    this.malha.frustumCulled = false;
  }

  empurrar(p: THREE.Vector3, cam: THREE.Vector3, forca: number) {
    const { hist, pos, n } = this;
    if (!this.iniciada) {
      for (let i = 0; i < n; i++) p.toArray(hist, i * 3);
      this.iniciada = true;
    }
    hist.copyWithin(3, 0, (n - 1) * 3);
    p.toArray(hist, 0);
    for (let i = 0; i < n; i++) {
      this.aux.fromArray(hist, i * 3);
      this.aux2.fromArray(hist, Math.min(i + 1, n - 1) * 3).sub(this.aux);
      this.lado.subVectors(cam, this.aux).cross(this.aux2);
      if (this.lado.lengthSq() < 1e-8) this.lado.set(0, 1, 0);
      const l = this.largura * (1 - i / n) * (0.3 + forca);
      this.lado.setLength(l);
      pos[i * 6] = this.aux.x + this.lado.x;
      pos[i * 6 + 1] = this.aux.y + this.lado.y;
      pos[i * 6 + 2] = this.aux.z + this.lado.z;
      pos[i * 6 + 3] = this.aux.x - this.lado.x;
      pos[i * 6 + 4] = this.aux.y - this.lado.y;
      pos[i * 6 + 5] = this.aux.z - this.lado.z;
    }
    (this.malha.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  reiniciar() {
    this.iniciada = false;
  }
}
