import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { criarCrista, type Crista } from "./crista";
import { criarAmbiente, texturaLipidios, texturaRuido } from "./feitio";
import { COLISORES, COLISORES_CRISTA, CRISTA_INICIO, CURIOSOS, INICIO, LIMITE_CRISTA, LIMITE_NAVE, RAIO_NAVE, type Colisor, type V3 } from "./mapa";
import { criarNave, type Nave } from "./nave";
import { criarHalo, criarMundo, type Ctx, type Mundo } from "./organelas";
import { ACABAMENTO, materialPortal, vivo, type Nevoa, type Partilha } from "./shaders";

export type AlvoMotor = { id: string; forma: "portal" | "orbe" | "farol"; cor: string; pos: V3; raio: number };

export type EventosMotor = {
  aoTocarAlvo: (id: string) => void;
  aoPerto: (id: string) => void;
  aoQualidade: (nivel: number, texto: string, dpr: number) => void;
  aoPerderContexto: () => void;
  aoPilotoInicio?: () => void;
};

/** Escada de queda de qualidade. Bloom e partículas vão primeiro; a resolução é a última, e nunca abaixo de 1x. */
export const NIVEIS = ["completo", "sem bloom", "sem partículas", "sem transmissão"];

type VisualAlvo = {
  a: AlvoMotor;
  grupo: THREE.Group;
  girar: THREE.Object3D[];
  fita?: THREE.ShaderMaterial;
  entrada: number;
  saindo: number; // 0 = parado no mundo, >0 = comemorando a saída
  erro: number;
  brilho?: THREE.MeshBasicMaterial;
  basico?: THREE.Color;
};

const COR_CELULA = "#04202c";
const DENS_CELULA = 0.0094;
const COR_CRISTA = "#2a0d0f";
const DENS_CRISTA = 0.0125;

export class MotorCelula {
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private bloom!: UnrealBloomPass;
  private acabamento!: ShaderPass;
  private rt!: THREE.WebGLRenderTarget;
  private cena = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
  private tela: HTMLCanvasElement;
  private resize?: ResizeObserver;
  private raf = 0;
  private ultimo = 0;
  private pausado = false;
  private descartado = false;
  private contextoPerdido = false;

  private tempo = { value: 0 };
  private nevoa: Nevoa = { cor: { value: new THREE.Color(COR_CELULA) }, dens: { value: DENS_CELULA } };
  private partilha!: Partilha;
  private ctx!: Ctx;
  private mundo!: Mundo;
  private crista: Crista | null = null;
  private ambienteCelula?: THREE.WebGLRenderTarget;
  private ambienteCrista?: THREE.WebGLRenderTarget;
  private texturas: THREE.Texture[] = [];
  private geoQuad = new THREE.PlaneGeometry(2, 2);
  private detalhe = 1;

  // Nave
  private nave!: Nave;
  private pos = new THREE.Vector3(...INICIO.pos);
  private vel = new THREE.Vector3();
  private yaw = INICIO.yaw;
  private pitch = 0;
  private roll = 0;
  private yawTaxa = 0;
  private forca = 0;
  private colisores: Colisor[] = COLISORES;
  private naCrista = false;
  private manualPitch = 0;

  // Entrada
  private teclas = new Set<string>();
  private joy = { x: 0, y: 0 };
  private arraste: { id: number; x: number; y: number; x0: number; y0: number; t: number; moveu: boolean } | null = null;
  private controlavel = false;
  private piloto: string | null = null;

  // Câmera
  private camPos = new THREE.Vector3(-27, 15, 56);
  private camOlha = new THREE.Vector3(...([-6, 2, -6] as V3));
  private foco: { c: THREE.Vector3; d: number; a: number; el: number } | null = { c: new THREE.Vector3(-6, 2, -6), d: 66, a: -0.32, el: 0.2 };
  private desvio = { x: 0, y: 0 };
  private tam = { w: 1, h: 1 };
  private movReduzido = false;
  private mq?: MediaQueryList;

  // Alvos
  private alvos = new Map<string, VisualAlvo>();
  private dentro = new Set<string>();
  private matsAlvo = new Map<string, { anel: THREE.MeshPhysicalMaterial; casca: THREE.MeshPhysicalMaterial }>();
  private geoAlvo: { anel: THREE.TorusGeometry; arco: THREE.TorusGeometry; filme: THREE.CircleGeometry; sat: THREE.SphereGeometry; miolo: THREE.SphereGeometry; casca: THREE.SphereGeometry; orbita: THREE.TorusGeometry } | null = null;
  private rotulos = new Map<string, HTMLElement>();
  private temporario: THREE.Material[] = [];
  private curiosos = new Set<string>();
  private guia!: THREE.InstancedMesh;
  private guiaId: string | null = null;
  private objAux = new THREE.Object3D();

  // Faíscas
  private faiscas!: THREE.Points;
  private fPos!: Float32Array;
  private fCor!: Float32Array;
  private fVel!: Float32Array;
  private fVida!: Float32Array;
  private fProx = 0;

  // Qualidade
  private nivel = 0;
  private dprMax = 1;
  private dpr = 1;
  private travada: number | null;
  private soma = 0;
  private conta = 0;
  private espera = 3;

  private aux = new THREE.Vector3();
  private aux2 = new THREE.Vector3();
  private fim = new THREE.Vector3();

  constructor(
    private host: HTMLElement,
    private eventos: EventosMotor,
    opcoes: { travarQualidade?: number | null } = {},
  ) {
    this.travada = opcoes.travarQualidade ?? null;
    this.tela = document.createElement("canvas");
    this.tela.className = "nave-canvas";
    this.tela.tabIndex = 0;
    this.tela.setAttribute("role", "application");
    this.tela.setAttribute("aria-label", "Interior de uma célula em 3D. Use as setas ou W, A, S e D para pilotar, Q e E para subir e descer. As etiquetas na tela são botões que levam a nave até cada alvo.");
    host.appendChild(this.tela);
  }

  /** Monta tudo. Só resolve quando os shaders estão prontos, para o primeiro quadro não engasgar. */
  async iniciar() {
    const r = new THREE.WebGLRenderer({ canvas: this.tela, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
    this.renderer = r;
    this.tela.addEventListener("webglcontextlost", this.aoPerder);
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 0.92;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.transmissionResolutionScale = 0.6;

    const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    this.detalhe = this.travada === null && memoria !== undefined && memoria <= 2 ? 0.6 : 1;

    this.dprMax = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = Math.max(1, this.dprMax);
    r.setPixelRatio(this.dpr);

    // Composição em ponto flutuante com MSAA: o bloom trabalha com valores acima de 1 e a borda continua limpa.
    const flutuante = r.extensions.has("EXT_color_buffer_float") || r.extensions.has("EXT_color_buffer_half_float");
    this.rt = new THREE.WebGLRenderTarget(4, 4, { type: flutuante ? THREE.HalfFloatType : THREE.UnsignedByteType, samples: 4 });
    this.composer = new EffectComposer(r, this.rt);
    this.composer.addPass(new RenderPass(this.cena, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.34, 0.62, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.acabamento = new ShaderPass(ACABAMENTO);
    this.composer.addPass(this.acabamento);

    const ruido = texturaRuido();
    const lipidios = texturaLipidios();
    this.texturas.push(ruido, lipidios);
    this.partilha = { tempo: this.tempo, ruido };
    this.ctx = { partilha: this.partilha, nevoa: this.nevoa, lipidios, detalhe: this.detalhe };

    this.cena.background = new THREE.Color(COR_CELULA);
    this.cena.fog = new THREE.FogExp2(COR_CELULA, DENS_CELULA);

    this.ambienteCelula = criarAmbiente(
      r,
      [
        { cor: "#57c8ff", forca: 4.2, dir: [0.6, 0.7, 0.2], tam: 18 },
        { cor: "#ff5fd0", forca: 2.4, dir: [-0.7, 0.2, 0.6], tam: 14 },
        { cor: "#3dff9a", forca: 1.8, dir: [-0.2, -0.75, -0.5], tam: 15 },
        { cor: "#ffae50", forca: 2.8, dir: [0.8, -0.3, -0.5], tam: 13 },
        { cor: "#ffffff", forca: 6, dir: [0.05, 1, -0.2], tam: 10 },
        { cor: "#6a7cff", forca: 2.6, dir: [0, 0.1, 1], tam: 20 },
      ],
      "#0c2d50",
      "#031018",
    );
    this.cena.environment = this.ambienteCelula.texture;
    this.cena.environmentIntensity = 0.85;

    this.mundo = criarMundo(this.ctx);
    this.cena.add(this.mundo.grupo);

    this.nave = criarNave(this.detalhe);
    this.cena.add(this.nave.raiz);
    for (const f of this.nave.fitas) this.cena.add(f.malha);

    this.criarFaiscas();
    this.criarGuia();
    this.pos.set(...INICIO.pos);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camOlha);

    this.mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.movReduzido = this.mq.matches;
    this.mq.addEventListener("change", this.aoMudarMovimento);

    this.resize = new ResizeObserver(() => this.ajustar());
    this.resize.observe(this.host);
    this.ajustar();

    document.addEventListener("visibilitychange", this.aoVisibilidade);
    window.addEventListener("keydown", this.aoTeclaDown);
    window.addEventListener("keyup", this.aoTeclaUp);
    window.addEventListener("blur", this.aoSoltarTudo);
    this.tela.addEventListener("pointerdown", this.aoPonteiroDown);
    this.tela.addEventListener("pointermove", this.aoPonteiroMove);
    this.tela.addEventListener("pointerup", this.aoPonteiroUp);
    this.tela.addEventListener("pointercancel", this.aoPonteiroUp);

    if (this.travada !== null) this.aplicarNivel(this.travada);
    await r.compileAsync(this.cena, this.camera);
    if (this.descartado) return;
    this.anunciar();
    this.ultimo = performance.now();
    this.raf = requestAnimationFrame(this.quadro);
  }

  // Interface usada pela tela
  registrarRotulo(id: string, el: HTMLElement | null) {
    if (el) this.rotulos.set(id, el);
    else this.rotulos.delete(id);
  }

  definirControle(ligado: boolean) {
    this.controlavel = ligado;
    if (!ligado) {
      this.piloto = null;
      this.joy.x = this.joy.y = 0;
    }
  }

  joystick(x: number, y: number) {
    this.joy.x = x;
    this.joy.y = y;
    if (x || y) this.piloto = null;
  }

  /** Piloto automático até um alvo. */
  voarPara(id: string | null) {
    if (!this.controlavel) return;
    this.piloto = id && this.alvos.has(id) ? id : null;
    if (this.piloto) this.eventos.aoPilotoInicio?.();
    if (this.piloto && this.movReduzido) {
      // Movimento reduzido: sem voo. A nave aparece ao lado do alvo.
      const a = this.alvos.get(this.piloto)!.a;
      this.aux.set(...a.pos).sub(this.pos).normalize();
      this.pos.set(...a.pos).addScaledVector(this.aux, -(a.raio + RAIO_NAVE + 0.6));
      this.vel.set(0, 0, 0);
      this.yaw = Math.atan2(-this.aux.x, -this.aux.z);
      this.empurrarColisores(0);
    }
  }

  focar(c: V3, d: number, angulo?: number, elevacao?: number) {
    const centro = new THREE.Vector3(...c);
    this.aux.subVectors(this.camera.position, centro);
    const a = angulo ?? Math.atan2(this.aux.x, this.aux.z);
    const el = elevacao ?? Math.max(-0.5, Math.min(0.55, Math.asin(this.aux.y / Math.max(this.aux.length(), 0.01))));
    this.foco = { c: centro, d, a, el };
    this.definirControle(false);
  }

  soltarFoco() {
    this.foco = null;
  }

  /** Acerto, erro ou o toque que tira um alvo do mundo. */
  marcar(id: string, resultado: "certo" | "errado") {
    const v = this.alvos.get(id);
    if (!v) return;
    this.aux.set(...v.a.pos);
    if (resultado === "certo") {
      v.saindo = 0.0001;
      this.estourar(this.aux, new THREE.Color(v.a.cor), 70, 11);
      this.vel.multiplyScalar(0.7);
    } else {
      v.erro = 1;
      this.estourar(this.aux, new THREE.Color("#ff4a3a"), 26, 7);
      // Empurrãozinho para trás: o toque errado não trava a nave em cima do alvo.
      this.aux2.subVectors(this.pos, this.aux).normalize();
      this.vel.addScaledVector(this.aux2, 9);
    }
    this.piloto = null;
  }

  /** Conjunto de alvos no mundo. Os que saíram da lista somem e os novos crescem. */
  definirAlvos(lista: AlvoMotor[]) {
    const ids = new Set(lista.map((a) => a.id));
    for (const [id, v] of this.alvos) {
      if (!ids.has(id) && !v.saindo) v.saindo = 0.0001;
    }
    for (const a of lista) {
      const v = this.alvos.get(a.id);
      if (v && !v.saindo) continue;
      if (v) this.removerVisual(a.id);
      this.alvos.set(a.id, this.criarVisual(a));
    }
    for (const id of [...this.dentro]) if (!ids.has(id)) this.dentro.delete(id);
    if (this.piloto && !ids.has(this.piloto)) this.piloto = null;
    this.guiaId = lista.length === 1 ? lista[0].id : null;
  }

  /** Troca a célula pela crista. Quem chama cuida da cortina na tela. */
  async entrarCrista() {
    if (this.naCrista || this.descartado) return;
    this.renderer.setRenderTarget(null);
    this.ambienteCrista = criarAmbiente(
      this.renderer,
      [
        { cor: "#ff9a5a", forca: 3.4, dir: [0.4, 0.8, 0.3], tam: 18 },
        { cor: "#ff4fa8", forca: 2.4, dir: [-0.7, 0.4, 0.4], tam: 14 },
        { cor: "#40c8ff", forca: 1.6, dir: [0.2, 0.3, -0.9], tam: 12 },
        { cor: "#ffffff", forca: 3.6, dir: [-0.1, 1, 0], tam: 10 },
      ],
      "#40141c",
      "#1a0606",
    );
    this.crista = criarCrista(this.ctx, this.geoQuad);
    this.mundo.grupo.visible = false;
    this.cena.add(this.crista.grupo);
    this.cena.environment = this.ambienteCrista.texture;
    this.cena.environmentIntensity = 0.9;
    (this.cena.background as THREE.Color).set(COR_CRISTA);
    const fog = this.cena.fog as THREE.FogExp2;
    fog.color.set(COR_CRISTA);
    fog.density = DENS_CRISTA;
    this.nevoa.cor.value.set(COR_CRISTA);
    this.nevoa.dens.value = DENS_CRISTA;
    this.colisores = COLISORES_CRISTA;
    this.naCrista = true;
    this.pos.set(...CRISTA_INICIO.pos);
    this.yaw = CRISTA_INICIO.yaw;
    this.pitch = -0.1;
    this.vel.set(0, 0, 0);
    this.camPos.set(0, 22, 62);
    this.camOlha.set(0, 8, 0);
    this.camera.position.copy(this.camPos);
    for (const f of this.nave.fitas) f.reiniciar();
    this.sincronizarParticulas();
    this.ajustar();
    await this.renderer.compileAsync(this.cena, this.camera);
    if (this.descartado) return;
    this.espera = 3;
  }

  ligarTrilha(de: V3, para: V3) {
    this.crista?.ligar(new THREE.Vector3(...de), new THREE.Vector3(...para));
  }

  girarTurbinas() {
    this.crista?.girar();
  }

  comemorar() {
    const c = this.foco ? this.foco.c : this.pos;
    this.estourar(c, new THREE.Color("#ffd97a"), 120, 15);
  }

  // Montagem de peças
  private geos() {
    if (this.geoAlvo) return this.geoAlvo;
    const n = (x: number) => Math.round(x * this.detalhe);
    this.geoAlvo = {
      anel: new THREE.TorusGeometry(1, 0.05, n(18), n(110)),
      arco: new THREE.TorusGeometry(1.17, 0.018, 8, n(80), Math.PI * 1.25),
      filme: new THREE.CircleGeometry(0.97, n(64)),
      sat: new THREE.SphereGeometry(0.075, 14, 10),
      miolo: new THREE.SphereGeometry(0.4, n(32), n(22)),
      casca: new THREE.SphereGeometry(1, n(48), n(32)),
      orbita: new THREE.TorusGeometry(1.32, 0.012, 8, n(80)),
    };
    return this.geoAlvo;
  }

  private matAlvo(cor: string) {
    let m = this.matsAlvo.get(cor);
    if (!m) {
      m = {
        anel: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cor).multiplyScalar(0.5), metalness: 0.8, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, emissive: cor, emissiveIntensity: 1.5, envMapIntensity: 1.5 }),
        casca: vivo(new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, iridescence: 0.9, iridescenceIOR: 1.4, envMapIntensity: 1.8 }), this.partilha, { onda: { amp: 0.035, freq: 2.1, vel: 0.9 }, borda: { cor, pot: 2.4, forca: 0.9 }, gel: { min: 0.04, max: 0.9, pot: 2.1 } }),
      };
      this.matsAlvo.set(cor, m);
    }
    return m;
  }

  private criarVisual(a: AlvoMotor): VisualAlvo {
    const g = this.geos();
    const mats = this.matAlvo(a.cor);
    const grupo = new THREE.Group();
    grupo.position.set(...a.pos);
    const girar: THREE.Object3D[] = [];
    let fita: THREE.ShaderMaterial | undefined;
    let brilho: THREE.MeshBasicMaterial | undefined;
    const basico = new THREE.Color(a.cor).multiplyScalar(1.5);
    if (a.forma === "portal" || a.forma === "farol") {
      const anel = new THREE.Mesh(g.anel, mats.anel);
      const f = materialPortal(this.tempo, a.cor);
      this.temporario.push(f);
      fita = f;
      const filme = new THREE.Mesh(g.filme, f);
      const arco = new THREE.Object3D();
      arco.add(new THREE.Mesh(g.arco, mats.anel));
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(g.sat, mats.anel);
        const ang = (i / 3) * Math.PI * 2;
        s.position.set(Math.cos(ang) * 1.17, Math.sin(ang) * 1.17, 0);
        arco.add(s);
      }
      girar.push(arco);
      const corpo = new THREE.Group();
      corpo.scale.setScalar(a.raio);
      corpo.add(anel, filme, arco);
      grupo.add(corpo);
    } else {
      brilho = new THREE.MeshBasicMaterial({ color: basico.clone() });
      this.temporario.push(brilho);
      const miolo = new THREE.Mesh(g.miolo, brilho);
      const casca = new THREE.Mesh(g.casca, mats.casca);
      casca.renderOrder = 2;
      const orb = new THREE.Object3D();
      const o = new THREE.Mesh(g.orbita, mats.anel);
      orb.add(o);
      const s = new THREE.Mesh(g.sat, mats.anel);
      s.position.set(1.32, 0, 0);
      orb.add(s);
      orb.rotation.x = 1.1;
      girar.push(orb);
      const corpo = new THREE.Group();
      corpo.scale.setScalar(a.raio);
      corpo.add(miolo, casca, orb);
      grupo.add(corpo);
    }
    const halo = criarHalo(this.ctx, this.geoQuad, new THREE.Vector3(), a.cor, a.raio * (a.forma === "farol" ? 3.1 : 3.4), a.raio * 0.6, a.forma === "farol" ? 0.34 : 0.3);
    this.temporario.push(halo.material as THREE.Material);
    grupo.add(halo);
    this.cena.add(grupo);
    grupo.scale.setScalar(0.001);
    return { a, grupo, girar, fita, entrada: 0, saindo: 0, erro: 0, brilho, basico };
  }

  private removerVisual(id: string) {
    const v = this.alvos.get(id);
    if (!v) return;
    this.cena.remove(v.grupo);
    this.alvos.delete(id);
  }

  private criarFaiscas() {
    const n = 360;
    this.fPos = new Float32Array(n * 3).fill(99999);
    this.fCor = new Float32Array(n * 3);
    this.fVel = new Float32Array(n * 3);
    this.fVida = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.fPos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aCor", new THREE.BufferAttribute(this.fCor, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aVida", new THREE.BufferAttribute(this.fVida, 1).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uEscala: { value: 800 } },
      vertexShader: `attribute vec3 aCor;attribute float aVida;uniform float uEscala;varying vec3 vC;void main(){vC=aCor*aVida*aVida*5.;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp((.1+aVida*.3)*uEscala/max(-mv.z,.5),1.,48.);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec3 vC;void main(){vec2 c=gl_PointCoord*2.-1.;float r=dot(c,c);if(r>=1.)discard;gl_FragColor=vec4(vC*pow(1.-r,2.),1.);}`,
    });
    this.faiscas = new THREE.Points(g, m);
    this.faiscas.frustumCulled = false;
    this.cena.add(this.faiscas);
  }

  private estourar(c: THREE.Vector3, cor: THREE.Color, qtd: number, vel: number) {
    if (this.movReduzido || this.nivel >= 2) return;
    const total = this.fVida.length;
    for (let i = 0; i < qtd; i++) {
      const k = this.fProx;
      this.fProx = (this.fProx + 1) % total;
      this.fPos.set([c.x, c.y, c.z], k * 3);
      this.fCor.set([cor.r, cor.g, cor.b], k * 3);
      this.aux2.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(vel * (0.3 + Math.random()));
      this.fVel.set([this.aux2.x, this.aux2.y, this.aux2.z], k * 3);
      this.fVida[k] = 0.7 + Math.random() * 0.3;
    }
  }

  private atualizarFaiscas(dt: number) {
    const { fPos, fVel, fVida } = this;
    const atrito = Math.exp(-dt * 1.7);
    for (let i = 0; i < fVida.length; i++) {
      if (fVida[i] <= 0) continue;
      fVida[i] = Math.max(0, fVida[i] - dt * 0.75);
      fVel[i * 3] *= atrito;
      fVel[i * 3 + 1] *= atrito;
      fVel[i * 3 + 2] *= atrito;
      fPos[i * 3] += fVel[i * 3] * dt;
      fPos[i * 3 + 1] += fVel[i * 3 + 1] * dt;
      fPos[i * 3 + 2] += fVel[i * 3 + 2] * dt;
    }
    const a = this.faiscas.geometry.attributes;
    a.position.needsUpdate = true;
    a.aCor.needsUpdate = true;
    a.aVida.needsUpdate = true;
  }

  private criarGuia() {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff0b8").multiplyScalar(3.4) }), 12);
    m.frustumCulled = false;
    m.visible = false;
    this.guia = m;
    this.cena.add(m);
  }

  private atualizarGuia(t: number) {
    const v = this.guiaId ? this.alvos.get(this.guiaId) : null;
    const mostrar = !!v && !v.saindo && this.controlavel;
    this.guia.visible = mostrar;
    if (!mostrar || !v) return;
    this.aux.set(...v.a.pos).sub(this.pos);
    const dist = this.aux.length();
    this.aux.normalize();
    const alcance = Math.min(dist - v.a.raio, 26);
    for (let i = 0; i < 12; i++) {
      const u = ((i + (this.movReduzido ? 0 : t * 1.6)) % 12) / 12;
      const d = 2.4 + u * alcance;
      this.objAux.position.copy(this.pos).addScaledVector(this.aux, d);
      this.objAux.scale.setScalar(Math.sin(u * Math.PI) * 1.2 + 0.001);
      this.objAux.updateMatrix();
      this.guia.setMatrixAt(i, this.objAux.matrix);
    }
    this.guia.instanceMatrix.needsUpdate = true;
  }

  // Laço principal
  private quadro = (agora: number) => {
    if (this.descartado || this.pausado) return;
    this.raf = requestAnimationFrame(this.quadro);
    const dtReal = Math.min((agora - this.ultimo) / 1000, 1);
    this.ultimo = agora;
    const dt = Math.min(dtReal, 0.2);
    if (!this.movReduzido) this.tempo.value += dt;
    const t = this.tempo.value;

    this.adaptar(dtReal);
    this.atualizarNave(dt, t);
    this.atualizarCamera(dt, t);
    this.atualizarAlvos(dt, t);
    this.atualizarFaiscas(dt);
    this.atualizarGuia(t);
    this.mundo.atualizar(t, this.camera.position);
    this.crista?.atualizar(t, this.movReduzido ? 0 : dt, this.camera.position);
    this.projetarRotulos();

    (this.acabamento.uniforms.uTempo as { value: number }).value = this.movReduzido ? 0 : agora * 0.001;
    this.composer.render(dt);
    this.fimDoQuadro();
  };

  private fimDoQuadro() {
    this.tela.dataset.pos = `${this.pos.x.toFixed(1)},${this.pos.y.toFixed(1)},${this.pos.z.toFixed(1)}`;
  }

  private atualizarNave(dt: number, t: number) {
    let frente = 0;
    let vira = 0;
    let sobe = 0;
    if (this.controlavel && !this.foco) {
      const k = this.teclas;
      frente = (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) - (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0);
      vira = (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) - (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0);
      sobe = (k.has("KeyQ") || k.has("PageUp") ? 1 : 0) - (k.has("KeyE") || k.has("PageDown") ? 1 : 0);
      if (this.joy.x || this.joy.y) {
        vira = this.joy.x;
        frente = -this.joy.y;
      }
      if (frente || vira || sobe) this.piloto = null;
    }

    const v = this.piloto ? this.alvos.get(this.piloto) : null;
    if (this.piloto && (!v || v.saindo)) this.piloto = null;

    let alvoYaw = 0;
    if (v) {
      this.aux.set(...v.a.pos).sub(this.pos);
      const dist = this.aux.length();
      this.aux.normalize();
      const yawD = Math.atan2(-this.aux.x, -this.aux.z);
      const pitchD = Math.asin(THREE.MathUtils.clamp(this.aux.y, -0.95, 0.95));
      const dif = Math.atan2(Math.sin(yawD - this.yaw), Math.cos(yawD - this.yaw));
      const passoY = Math.min(Math.abs(dif), dt * 2.4) * Math.sign(dif);
      this.yaw += passoY;
      alvoYaw = passoY / Math.max(dt, 0.001);
      this.pitch += (pitchD - this.pitch) * (1 - Math.exp(-dt * 3));
      const alinhado = Math.abs(dif) < 0.6 ? 1 : 0.32;
      frente = alinhado * THREE.MathUtils.clamp(dist / 10, 0.5, 1);
    } else {
      this.yaw -= vira * dt * 1.75;
      alvoYaw = -vira * 1.75;
      if (sobe) {
        this.pitch += sobe * dt * 1.1;
        this.manualPitch = 1.6;
      }
      this.manualPitch = Math.max(0, this.manualPitch - dt);
      if (this.arraste?.moveu) this.manualPitch = 1.6;
      // Assistência: quem acelera apontando para um alvo é levado com jeito até ele. Em 3D, isso faz muita diferença.
      if (frente > 0 && this.manualPitch <= 0) this.assistir(dt, frente);
    }
    this.pitch = THREE.MathUtils.clamp(this.pitch, -1.25, 1.25);

    const fx = -Math.sin(this.yaw) * Math.cos(this.pitch);
    const fy = Math.sin(this.pitch);
    const fz = -Math.cos(this.yaw) * Math.cos(this.pitch);
    const vmax = v ? 30 : 24;
    const acel = (frente > 0 ? frente * vmax * 1.5 : frente * 12) * dt;
    this.vel.x += fx * acel;
    this.vel.y += fy * acel;
    this.vel.z += fz * acel;
    // Atrito do citosol: soltou, a nave desacelera devagar.
    const atrito = Math.exp(-dt * 1.45);
    this.vel.multiplyScalar(atrito);
    const velo = this.vel.length();
    if (velo > vmax) this.vel.multiplyScalar(vmax / velo);
    this.pos.addScaledVector(this.vel, dt);
    this.empurrarColisores(dt);

    this.forca += (Math.min(1, Math.max(0, frente) + velo / vmax * 0.5) - this.forca) * (1 - Math.exp(-dt * 6));
    this.yawTaxa += (alvoYaw - this.yawTaxa) * (1 - Math.exp(-dt * 5));
    const rollAlvo = this.movReduzido ? 0 : THREE.MathUtils.clamp(this.yawTaxa * 0.42, -0.7, 0.7);
    this.roll += (rollAlvo - this.roll) * (1 - Math.exp(-dt * 6));

    const raiz = this.nave.raiz;
    raiz.position.copy(this.pos);
    raiz.rotation.set(this.pitch, this.yaw, this.roll, "YXZ");
    raiz.updateMatrixWorld();
    this.nave.atualizar(t, this.forca);
    if (!this.movReduzido) {
      this.nave.fitas.forEach((f, i) => {
        f.empurrar(this.aux2.copy(this.nave.bocais[i]).applyMatrix4(raiz.matrixWorld), this.camera.position, this.forca);
      });
    }

    // Toques: só o destino do piloto conta, para o voo automático não encostar sem querer em outra coisa.
    if (this.controlavel) {
      for (const [id, va] of this.alvos) {
        if (va.saindo) continue;
        const dist = this.aux.set(...va.a.pos).distanceTo(this.pos);
        const dentro = dist < va.a.raio + RAIO_NAVE;
        const contar = !this.piloto || this.piloto === id;
        if (dentro && contar && !this.dentro.has(id)) {
          this.dentro.add(id);
          if (this.piloto === id) this.piloto = null;
          this.eventos.aoTocarAlvo(id);
        } else if (!dentro && dist > va.a.raio + RAIO_NAVE + 1.2) {
          this.dentro.delete(id);
        }
      }
      for (const id in CURIOSOS) {
        if (this.curiosos.has(id) || this.naCrista) continue;
        const c = CURIOSOS[id];
        if (this.aux.set(...c.c).distanceTo(this.pos) < c.r) {
          this.curiosos.add(id);
          this.eventos.aoPerto(id);
        }
      }
    }
  }

  private assistir(dt: number, frente: number) {
    let melhor: VisualAlvo | null = null;
    let melhorCos = 0.72;
    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    for (const v of this.alvos.values()) {
      if (v.saindo) continue;
      this.aux.set(...v.a.pos).sub(this.pos);
      const horiz = Math.hypot(this.aux.x, this.aux.z) || 1;
      const c = (this.aux.x * fx + this.aux.z * fz) / horiz;
      if (c > melhorCos) {
        melhorCos = c;
        melhor = v;
      }
    }
    if (!melhor) {
      // Sem nada à frente, a nave volta devagar a ficar nivelada.
      this.pitch += (0 - this.pitch) * (1 - Math.exp(-dt * 0.5 * frente));
      return;
    }
    this.aux.set(...melhor.a.pos).sub(this.pos);
    const pitchD = Math.asin(THREE.MathUtils.clamp(this.aux.y / (this.aux.length() || 1), -0.95, 0.95));
    this.pitch += (pitchD - this.pitch) * (1 - Math.exp(-dt * 2.2 * frente));
    const yawD = Math.atan2(-this.aux.x, -this.aux.z);
    const dif = Math.atan2(Math.sin(yawD - this.yaw), Math.cos(yawD - this.yaw));
    this.yaw += dif * (1 - Math.exp(-dt * 1.2 * frente));
  }

  private empurrarColisores(dt: number) {
    for (const c of this.colisores) {
      this.aux.set(...c.c);
      this.aux2.subVectors(this.pos, this.aux);
      const d = this.aux2.length() || 0.001;
      const min = c.r + RAIO_NAVE;
      if (d < min) {
        this.aux2.divideScalar(d);
        this.pos.copy(this.aux).addScaledVector(this.aux2, min);
        const vn = this.vel.dot(this.aux2);
        if (vn < 0) this.vel.addScaledVector(this.aux2, -vn);
        // Empurrão de lado, para ninguém ficar parado de frente para uma esfera.
        if (this.piloto) {
          this.fim.set(0, 1, 0).cross(this.aux2);
          if (this.fim.lengthSq() < 0.01) this.fim.set(1, 0, 0);
          this.vel.addScaledVector(this.fim.normalize(), dt * 14);
        }
      }
    }
    if (this.naCrista) {
      this.pos.x = THREE.MathUtils.clamp(this.pos.x, -LIMITE_CRISTA.x, LIMITE_CRISTA.x);
      this.pos.z = THREE.MathUtils.clamp(this.pos.z, -LIMITE_CRISTA.z, LIMITE_CRISTA.z);
      this.pos.y = THREE.MathUtils.clamp(this.pos.y, LIMITE_CRISTA.yMin, LIMITE_CRISTA.yMax);
    } else {
      const r = this.pos.length();
      if (r > LIMITE_NAVE) {
        this.pos.multiplyScalar(LIMITE_NAVE / r);
        this.aux2.copy(this.pos).normalize();
        const vn = this.vel.dot(this.aux2);
        if (vn > 0) this.vel.addScaledVector(this.aux2, -vn);
      }
    }
  }

  private atualizarCamera(dt: number, t: number) {
    const paisagem = this.tam.w > this.tam.h;
    let ox = 0;
    let oy = 0;
    if (this.foco) {
      const f = this.foco;
      if (!this.movReduzido) f.a += dt * 0.07;
      const ca = Math.cos(f.el);
      // Em pé, o campo de visão horizontal é estreito: a câmera recua para a organela caber inteira.
      const d = f.d * (paisagem ? 1 : 1.5);
      this.fim.set(f.c.x + Math.sin(f.a) * ca * d, f.c.y + Math.sin(f.el) * d, f.c.z + Math.cos(f.a) * ca * d);
      this.limitarCamera(this.fim);
      const k = this.movReduzido ? 1 : 1 - Math.exp(-dt * 2.2);
      this.camPos.lerp(this.fim, k);
      this.camOlha.lerp(f.c, k);
      if (this.painelAberto) {
        if (paisagem) ox = this.tam.w * 0.15;
        else oy = this.tam.h * 0.25;
      }
    } else {
      const dist = paisagem ? 6.2 : 7.4;
      const alt = paisagem ? 2.1 : 2.5;
      const fx = -Math.sin(this.yaw) * Math.cos(this.pitch);
      const fy = Math.sin(this.pitch);
      const fz = -Math.cos(this.yaw) * Math.cos(this.pitch);
      this.fim.set(this.pos.x - fx * dist, this.pos.y - fy * dist + alt, this.pos.z - fz * dist);
      this.limitarCamera(this.fim);
      const k = this.movReduzido ? 1 : 1 - Math.exp(-dt * 4.6);
      this.camPos.lerp(this.fim, k);
      this.aux.set(this.pos.x + fx * 7, this.pos.y + fy * 7 + 0.6, this.pos.z + fz * 7);
      this.camOlha.lerp(this.aux, this.movReduzido ? 1 : 1 - Math.exp(-dt * 7));
    }
    this.camera.position.copy(this.camPos);
    // Inclinação leve em curva: dá sensação de voo.
    const inc = this.movReduzido || this.foco ? 0 : THREE.MathUtils.clamp(this.yawTaxa * 0.06, -0.14, 0.14);
    this.camera.up.set(Math.sin(inc), Math.cos(inc), 0);
    this.camera.lookAt(this.camOlha);

    const base = paisagem ? 58 : 74;
    const fov = base + (this.movReduzido ? 0 : this.forca * 5);
    if (Math.abs(this.camera.fov - fov) > 0.02) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.atualizarEscala();
    }
    const kd = this.movReduzido ? 1 : 1 - Math.exp(-dt * 3);
    this.desvio.x += (ox - this.desvio.x) * kd;
    this.desvio.y += (oy - this.desvio.y) * kd;
    this.camera.setViewOffset(this.tam.w, this.tam.h, this.desvio.x, this.desvio.y, this.tam.w, this.tam.h);
    void t;
  }

  /** Painel lateral ou de baixo aberto: a câmera abre espaço para o que está em foco. */
  painelAberto = false;

  private limitarCamera(p: THREE.Vector3) {
    for (const c of this.colisores) {
      this.aux.set(...c.c);
      this.aux2.subVectors(p, this.aux);
      const d = this.aux2.length() || 0.01;
      const min = c.r + 1.2;
      if (d < min) p.copy(this.aux).addScaledVector(this.aux2, min / d);
    }
    if (this.naCrista) {
      p.y = THREE.MathUtils.clamp(p.y, 4, 40);
    } else {
      const r = p.length();
      if (r > LIMITE_NAVE + 2) p.multiplyScalar((LIMITE_NAVE + 2) / r);
    }
  }

  private atualizarAlvos(dt: number, t: number) {
    for (const [id, v] of this.alvos) {
      v.entrada = Math.min(1, v.entrada + dt * 2.6);
      const pulso = this.movReduzido ? 1 : 1 + Math.sin(t * 2.2 + v.a.pos[0]) * 0.03;
      let esc = THREE.MathUtils.smoothstep(v.entrada, 0, 1) * pulso;
      if (v.saindo) {
        v.saindo += dt * 2.6;
        esc *= 1 + v.saindo * 0.9;
        if (v.fita) v.fita.uniforms.uForca.value = Math.max(0, 1 - v.saindo);
        if (v.saindo >= 1) {
          this.removerVisual(id);
          continue;
        }
        esc *= 1 - Math.pow(v.saindo, 3);
      }
      v.grupo.scale.setScalar(Math.max(0.001, esc));
      for (const g of v.girar) {
        if (!this.movReduzido) g.rotation.z += dt * 1.2;
        if (!this.movReduzido && v.a.forma === "orbe") g.rotation.y += dt * 0.5;
      }
      // Portais olham para a nave: dá para entrar de qualquer lado.
      if (v.a.forma !== "orbe") v.grupo.lookAt(this.camera.position);
      if (v.erro > 0) {
        v.erro = Math.max(0, v.erro - dt * 1.8);
        const s = this.movReduzido ? 0 : Math.sin(v.erro * 26) * v.erro * 0.5;
        v.grupo.position.set(v.a.pos[0] + s, v.a.pos[1], v.a.pos[2]);
        if (v.fita) v.fita.uniforms.uCor.value.set(v.a.cor).lerp(new THREE.Color("#ff2a1a"), v.erro);
        if (v.brilho && v.basico) v.brilho.color.copy(v.basico).lerp(new THREE.Color(8, 0.6, 0.3), v.erro);
      }
    }
  }

  private projetarRotulos() {
    if (!this.rotulos.size) return;
    this.camera.updateMatrixWorld();
    const { w, h } = this.tam;
    const mt = 118;
    const mb = w < 800 ? 250 : 150; // acima do joystick e da fala
    const ml = 8;
    const itens: { el: HTMLElement; x: number; y: number; w: number; h: number; borda: boolean; ang: number; d: number }[] = [];
    for (const [id, el] of this.rotulos) {
      const v = this.alvos.get(id);
      if (!v || v.saindo) {
        el.style.visibility = "hidden";
        continue;
      }
      el.style.visibility = "visible";
      this.aux.set(...v.a.pos).project(this.camera);
      const atras = this.aux2.set(...v.a.pos).applyMatrix4(this.camera.matrixWorldInverse).z > 0;
      let x = (this.aux.x * 0.5 + 0.5) * w;
      let y = (-this.aux.y * 0.5 + 0.5) * h;
      const lw = el.offsetWidth || 90;
      const lh = el.offsetHeight || 36;
      const cx = w / 2;
      const cy = (mt + h - mb) / 2;
      let dx = x - cx;
      let dy = y - cy;
      if (atras) {
        dx = -dx;
        dy = -dy;
        if (Math.abs(dx) + Math.abs(dy) < 1) dy = 1;
        dx *= 1000;
        dy *= 1000;
        x = cx + dx;
        y = cy + dy;
      }
      const meioW = cx - ml - lw / 2;
      const meioH = (h - mb - mt) / 2 - lh / 2;
      const fora = atras || Math.abs(dx) > meioW || Math.abs(dy) > meioH;
      if (fora) {
        const k = Math.min(meioW / Math.max(Math.abs(dx), 1e-3), meioH / Math.max(Math.abs(dy), 1e-3));
        x = cx + dx * k;
        y = cy + dy * k;
      } else {
        // Etiqueta logo acima do alvo: o escalonamento usa a distância aparente.
        const d = this.aux2.set(...v.a.pos).distanceTo(this.camera.position);
        const py = v.a.raio * (h / (2 * Math.tan((this.camera.fov * Math.PI) / 360))) / Math.max(d, 1);
        y = Math.max(mt + lh / 2, y - py - lh / 2 - 8);
      }
      itens.push({ el, x, y, w: lw, h: lh, borda: fora, ang: Math.atan2(dy, dx), d: 0 });
    }
    // Afasta etiquetas sobrepostas.
    itens.sort((a, b) => a.y - b.y);
    for (let i = 0; i < itens.length; i++) {
      for (let j = i + 1; j < itens.length; j++) {
        const a = itens[i];
        const b = itens[j];
        if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 4 && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + 3) {
          b.y = a.y + (a.h + b.h) / 2 + 3;
        }
      }
    }
    // Se a pilha passou do limite de baixo, sobe todo mundo que encosta: nenhuma etiqueta fica por cima de outra.
    for (let i = itens.length - 1; i >= 0; i--) {
      const a = itens[i];
      a.y = Math.min(a.y, h - mb - a.h / 2);
      for (let j = i - 1; j >= 0; j--) {
        const b = itens[j];
        if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 4) b.y = Math.min(b.y, a.y - (a.h + b.h) / 2 - 3);
      }
    }
    for (const o of itens) {
      o.el.style.transform = `translate3d(${(o.x - o.w / 2).toFixed(1)}px,${(o.y - o.h / 2).toFixed(1)}px,0)`;
      if (o.borda) {
        o.el.dataset.borda = "1";
        o.el.style.setProperty("--ang", `${o.ang.toFixed(3)}rad`);
      } else {
        delete o.el.dataset.borda;
      }
    }
  }

  private atualizarEscala() {
    const px = (this.tam.h * this.dpr) / (2 * Math.tan((this.camera.fov * Math.PI) / 360));
    (this.faiscas.material as THREE.ShaderMaterial).uniforms.uEscala.value = px;
    for (const p of this.mundo.poeiras) p.uniforms.uEscala.value = px;
    if (this.crista) for (const p of this.crista.poeiras) p.uniforms.uEscala.value = px;
  }

  private ajustar() {
    if (this.descartado) return;
    const w = Math.max(this.host.clientWidth, 1);
    const h = Math.max(this.host.clientHeight, 1);
    this.tam = { w, h };
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.fov = w > h ? 58 : 74;
    this.camera.updateProjectionMatrix();
    this.atualizarEscala();
    this.tela.dataset.dpr = String(this.renderer.getPixelRatio());
  }

  // Qualidade automática
  private adaptar(dtReal: number) {
    if (this.travada !== null) return;
    this.espera -= dtReal;
    if (this.espera > 0) return;
    this.soma += dtReal;
    this.conta++;
    if (this.soma < 1.6 || this.conta < 4) return;
    const ms = (this.soma / this.conta) * 1000;
    this.soma = 0;
    this.conta = 0;
    this.tela.dataset.ms = ms.toFixed(0);
    if (ms > 30) {
      const pulo = ms > 110 ? 2 : 1;
      if (this.aplicarNivel(this.nivel + pulo)) this.espera = 1.4;
    }
  }

  /** Níveis 0 a 3 cortam efeitos. Depois, cada nível reduz a resolução, até o piso de 1x. */
  private aplicarNivel(n: number) {
    const dprPiso = 1;
    const ultimo = this.dprMax > dprPiso ? 6 : 3;
    const alvo = Math.min(n, ultimo);
    if (alvo === this.nivel && n !== 0) return false;
    const antes = this.nivel;
    this.nivel = alvo;
    this.bloom.enabled = alvo < 1;
    this.sincronizarParticulas();
    if (alvo >= 3 && antes < 3) {
      for (const m of this.mundo.transmissivos) {
        m.transmission = 0;
        m.transparent = true;
        m.depthWrite = false;
        m.needsUpdate = true;
      }
      this.rt.samples = 2;
      this.composer.renderTarget1.samples = 2;
      this.composer.renderTarget2.samples = 2;
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
    }
    if (alvo >= 4) {
      const fracao = [0.8, 0.65, 0][alvo - 4] ?? 0;
      const novo = Math.max(dprPiso, this.dprMax * fracao);
      if (novo !== this.dpr) {
        this.dpr = novo;
        this.ajustar();
      }
    }
    this.anunciar();
    return alvo !== antes;
  }

  private sincronizarParticulas() {
    const ligar = this.nivel < 2;
    for (const p of this.mundo.particulas) p.visible = ligar;
    if (this.crista) for (const p of this.crista.particulas) p.visible = ligar;
    this.faiscas.visible = ligar;
  }

  private anunciar() {
    const texto = this.nivel < NIVEIS.length ? NIVEIS[this.nivel] : `resolução ${this.dpr.toFixed(2)}x`;
    this.tela.dataset.qualidade = texto;
    this.tela.dataset.nivel = String(this.nivel);
    this.tela.dataset.dpr = String(this.renderer.getPixelRatio());
    this.eventos.aoQualidade(this.nivel, texto, this.dpr);
  }

  // Eventos do navegador
  private aoPerder = (e: Event) => {
    e.preventDefault();
    if (this.contextoPerdido || this.descartado) return;
    this.contextoPerdido = true;
    cancelAnimationFrame(this.raf);
    this.eventos.aoPerderContexto();
  };

  private aoVisibilidade = () => {
    if (document.hidden) {
      this.pausado = true;
      cancelAnimationFrame(this.raf);
      this.tela.dataset.pausado = "1";
    } else if (this.pausado && !this.descartado && !this.contextoPerdido) {
      this.pausado = false;
      delete this.tela.dataset.pausado;
      this.ultimo = performance.now();
      this.espera = 1.5;
      this.raf = requestAnimationFrame(this.quadro);
    }
  };

  private aoMudarMovimento = (e: MediaQueryListEvent) => {
    this.movReduzido = e.matches;
  };

  private aoTeclaDown = (e: KeyboardEvent) => {
    if (!this.controlavel) return;
    const alvo = e.target as HTMLElement | null;
    if (alvo?.tagName === "INPUT" || alvo?.tagName === "TEXTAREA") return;
    const usada = ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(e.code);
    if (!usada || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    this.teclas.add(e.code);
  };

  private aoTeclaUp = (e: KeyboardEvent) => {
    this.teclas.delete(e.code);
  };

  private aoSoltarTudo = () => {
    this.teclas.clear();
    this.joy.x = this.joy.y = 0;
    this.arraste = null;
  };

  private aoPonteiroDown = (e: PointerEvent) => {
    if (!this.controlavel) return;
    this.tela.setPointerCapture?.(e.pointerId);
    this.arraste = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), moveu: false };
  };

  private aoPonteiroMove = (e: PointerEvent) => {
    const a = this.arraste;
    if (!a || a.id !== e.pointerId || !this.controlavel) return;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    a.x = e.clientX;
    a.y = e.clientY;
    if (!a.moveu && Math.hypot(e.clientX - a.x0, e.clientY - a.y0) < 9) return;
    a.moveu = true;
    this.piloto = null;
    this.yaw -= dx * 0.0052;
    this.yawTaxa += -dx * 0.05;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.0042, -1.25, 1.25);
  };

  private aoPonteiroUp = (e: PointerEvent) => {
    const a = this.arraste;
    if (!a || a.id !== e.pointerId) return;
    this.arraste = null;
    if (a.moveu || performance.now() - a.t > 500) return;
    // Toque curto: voa até o alvo mais perto do dedo.
    const r = this.tela.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    let melhor: string | null = null;
    let d = 70;
    for (const [id, v] of this.alvos) {
      if (v.saindo) continue;
      this.aux.set(...v.a.pos);
      if (this.aux2.copy(this.aux).applyMatrix4(this.camera.matrixWorldInverse).z > 0) continue;
      this.aux.project(this.camera);
      const px = (this.aux.x * 0.5 + 0.5) * this.tam.w;
      const py = (-this.aux.y * 0.5 + 0.5) * this.tam.h;
      const dist = Math.hypot(px - x, py - y);
      if (dist < d) {
        d = dist;
        melhor = id;
      }
    }
    if (melhor) this.voarPara(melhor);
  };

  /** Libera toda a memória de placa de vídeo. O canvas sai da página. */
  descartar() {
    if (this.descartado) return;
    this.descartado = true;
    cancelAnimationFrame(this.raf);
    this.resize?.disconnect();
    this.mq?.removeEventListener("change", this.aoMudarMovimento);
    document.removeEventListener("visibilitychange", this.aoVisibilidade);
    window.removeEventListener("keydown", this.aoTeclaDown);
    window.removeEventListener("keyup", this.aoTeclaUp);
    window.removeEventListener("blur", this.aoSoltarTudo);
    this.tela.removeEventListener("pointerdown", this.aoPonteiroDown);
    this.tela.removeEventListener("pointermove", this.aoPonteiroMove);
    this.tela.removeEventListener("pointerup", this.aoPonteiroUp);
    this.tela.removeEventListener("pointercancel", this.aoPonteiroUp);
    this.tela.removeEventListener("webglcontextlost", this.aoPerder);

    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();
    const texs = new Set<THREE.Texture>();
    const coletar = (o: THREE.Object3D) => {
      const m = o as THREE.Mesh;
      if (m.geometry) geos.add(m.geometry);
      if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x));
      if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
    };
    this.cena.traverse(coletar);
    this.mundo?.grupo.traverse(coletar);
    this.crista?.grupo.traverse(coletar);
    for (const m of [...this.temporario, ...[...this.matsAlvo.values()].flatMap((x) => [x.anel, x.casca])]) mats.add(m);
    if (this.geoAlvo) Object.values(this.geoAlvo).forEach((g) => geos.add(g));
    geos.add(this.geoQuad);
    for (const m of mats) {
      for (const v of Object.values(m)) if ((v as THREE.Texture | null)?.isTexture) texs.add(v as THREE.Texture);
      m.dispose();
    }
    geos.forEach((g) => g.dispose());
    texs.forEach((t) => t.dispose());
    this.texturas.forEach((t) => t.dispose());
    this.ambienteCelula?.dispose();
    this.ambienteCrista?.dispose();
    this.bloom?.dispose();
    this.composer?.dispose();
    this.rt?.dispose();
    this.cena.clear();
    if (this.renderer) {
      this.renderer.renderLists.dispose();
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    this.tela.remove();
    this.rotulos.clear();
    this.alvos.clear();
  }
}
