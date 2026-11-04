import * as THREE from "three";
import { criarPersonagem, type Personagem, type Quem } from "@/lab/personagem";
import { altura, criarCeu, criarMateriais, criarMundo, PRACA, RAIO, type Coleta, type Obstaculo, type Sitio, type SitioBase } from "./mundo";

export type Eventos = {
  aoPerto: (id: string | null) => void;
  aoChegar: (id: string) => void;
  aoFita: (id: string, indice: number) => void;
  aoColetar: (id: string) => void;
  aoAndar: () => void;
  aoPasso: () => void;
  aoPulo: () => void;
  aoPronto: () => void;
  aoPerderContexto: () => void;
};

const VELOCIDADE = 7;
const DIST_PERTO = 3.6;
const CIMA = new THREE.Vector3();

/** Base ortonormal: Y aponta para fora do planeta e Z para onde o boneco olha. */
function orientar(alvo: THREE.Object3D, cima: THREE.Vector3, olhar: THREE.Vector3) {
  const z = olhar.clone().sub(cima.clone().multiplyScalar(olhar.dot(cima))).normalize();
  const x = cima.clone().cross(z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, cima, z);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

/** Motor do planeta: uma cena, um laço, sem React. Andar numa esfera é girar a posição em volta do centro. */
export class Planeta {
  readonly cena = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sitios: Sitio[];
  private obstaculos: Obstaculo[];
  private coletas: Coleta[];
  private nuvens: THREE.Object3D;
  private anel: THREE.Object3D;
  private ceu: THREE.Mesh;
  private sol: THREE.DirectionalLight;
  private ceuLuz: THREE.HemisphereLight;
  private jogador: Personagem;
  private guia: Personagem;
  private casca = new THREE.Group();
  private cascaGuia = new THREE.Group();
  private marca: THREE.Mesh;

  // Posição na esfera, sempre unitária
  private pos = PRACA.clone();
  private guiaPos = PRACA.clone();
  private frente = new THREE.Vector3();
  private olhar = new THREE.Vector3();
  private salto = 0;
  private vSalto = 0;
  private teclas = new Set<string>();
  private joy = { x: 0, y: 0 };
  private destino: THREE.Vector3 | null = null;
  private destinoSitio: string | null = null;
  private tempoPreso = 0;
  private distAntes = Infinity;
  private perto: string | null = null;
  private tempoPasso = 0;

  // Câmera
  private pitch = 0.42;
  private dist = 9.5;
  private distAlvo = 9.5;
  private camPos = new THREE.Vector3();
  private camOlha = new THREE.Vector3();
  private camCima = new THREE.Vector3();
  private intro = 3.2;
  private focado: Sitio | null = null;
  private selecionada = -1;
  private sobre = -1;
  private deslocamento = { x: 0, y: 0, ax: 0, ay: 0 };
  private movimentoReduzido: boolean;

  private tempo = 0;
  private ultimo = performance.now();
  private quadro = 0;
  private descartado = false;
  private resize: ResizeObserver;
  private dpr: number;
  private soma = 0;
  private conta = 0;
  private passoHachura: { value: number };
  private ray = new THREE.Raycaster();
  private arraste: { id: number; x0: number; y0: number; x: number; y: number; t: number; moveu: boolean } | null = null;
  private dedos = new Map<number, { x: number; y: number }>();
  private distPinca = 0;

  constructor(private tela: HTMLCanvasElement, quem: Quem, base: SitioBase[], coletadas: string[], private eventos: Eventos) {
    this.movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const movel = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, powerPreference: "high-performance", alpha: false });
    this.dpr = Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 700);

    this.ceuLuz = new THREE.HemisphereLight("#fff1e0", "#6d4fb0", 1.5);
    this.sol = new THREE.DirectionalLight("#fff0d6", 2.3);
    this.sol.castShadow = true;
    this.sol.shadow.mapSize.setScalar(movel ? 1024 : 2048);
    const c = this.sol.shadow.camera;
    c.left = c.bottom = -24;
    c.right = c.top = 24;
    c.near = 5;
    c.far = 110;
    this.sol.shadow.bias = -0.0006;
    this.sol.shadow.normalBias = 0.05;
    this.cena.add(this.ceuLuz, this.sol, this.sol.target);

    const mats = criarMateriais(this.dpr);
    this.passoHachura = mats.passo;
    const mundo = criarMundo(base, mats, movel, coletadas);
    this.cena.add(mundo.grupo);
    this.sitios = mundo.sitios;
    this.obstaculos = mundo.obstaculos;
    this.coletas = mundo.coletas;
    this.nuvens = mundo.nuvens;
    this.anel = mundo.anel;
    this.ceu = criarCeu();
    this.cena.add(this.ceu);

    this.jogador = criarPersonagem(quem);
    this.guia = criarPersonagem(quem === "menino" ? "menina" : "menino");
    for (const [p, c2] of [[this.jogador, this.casca], [this.guia, this.cascaGuia]] as const) {
      tingir(p.raiz, mats);
      c2.add(p.raiz);
      this.cena.add(c2);
    }

    const marca = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.66, 24), new THREE.MeshBasicMaterial({ color: "#ffd257", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    this.marca = marca;
    this.cena.add(marca);

    // Começa na praça, olhando para a primeira região, com a guia um pouco atrás.
    const primeira = this.sitios[0].dir;
    this.frente.copy(primeira).sub(this.pos.clone().multiplyScalar(primeira.dot(this.pos))).normalize();
    this.olhar.copy(this.frente);
    const ladoGuia = this.frente.clone().cross(this.pos).normalize();
    this.guiaPos.add(ladoGuia.multiplyScalar(2.2 / RAIO)).add(this.frente.clone().multiplyScalar(1 / RAIO)).normalize();

    this.resize = new ResizeObserver(() => this.ajustar());
    this.resize.observe(tela);
    this.ajustar();

    window.addEventListener("keydown", this.aoTecla);
    window.addEventListener("keyup", this.aoSoltarTecla);
    window.addEventListener("blur", this.aoPerderFoco);
    tela.addEventListener("pointerdown", this.aoApertar);
    tela.addEventListener("pointermove", this.aoMoverPonteiro);
    tela.addEventListener("pointerup", this.aoLevantar);
    tela.addEventListener("pointercancel", this.aoLevantar);
    tela.addEventListener("wheel", this.aoRoda, { passive: false });
    tela.addEventListener("webglcontextlost", this.aoContexto);
    document.addEventListener("visibilitychange", this.aoVisibilidade);

    if (this.movimentoReduzido) this.intro = 0;
    // Só para os testes automáticos: dá para saltar até um ponto do planeta.
    if (new URLSearchParams(location.search).has("teste")) (window as unknown as { __planeta: Planeta }).__planeta = this;
    this.posicionarCamera(1, 0);
    this.camPos.copy(this.alvoCamera().pos);
    this.quadro = requestAnimationFrame(this.laco);
    requestAnimationFrame(() => this.eventos.aoPronto());
  }

  // ------------------------------------------------------------ API para a interface

  definirJoystick(x: number, y: number) {
    this.joy.x = x;
    this.joy.y = y;
    if (x || y) this.cancelarDestino();
  }

  pular() {
    if (this.salto > 0.02 || this.focado) return;
    this.vSalto = 8.6;
    this.eventos.aoPulo();
  }

  irPara(id: string) {
    const s = this.sitio(id);
    if (!s) return;
    this.destino = s.ponto.clone();
    this.destinoSitio = id;
    this.tempoPreso = 0;
    this.distAntes = Infinity;
    this.eventos.aoAndar();
  }

  /** Câmera vai para diante da estante e as fitas saem uma a uma. */
  focar(id: string, painel: { direita: number; baixo: number }) {
    const s = this.sitio(id);
    if (!s) return;
    this.focado = s;
    this.cancelarDestino();
    this.teclas.clear();
    this.joy.x = this.joy.y = 0;
    this.selecionada = -1;
    this.sobre = -1;
    const ladoS = s.frente.clone().cross(s.dir).normalize();
    this.pos.copy(s.dir).add(s.frente.clone().multiplyScalar(2.7 / RAIO)).add(ladoS.multiplyScalar(4.1 / RAIO)).normalize();
    this.olhar.copy(s.dir).sub(this.pos).normalize();
    this.jogador.estado.andando = 0;
    this.deslocamento.ax = painel.direita / 2;
    this.deslocamento.ay = painel.baixo / 2;
    s.fitas.forEach((f, i) => {
      f.atraso = i * 0.07;
      f.alvo = 0.14;
    });
  }

  soltarFoco() {
    if (this.focado) {
      this.focado.fitas.forEach((f) => {
        f.alvo = 0;
        f.atraso = 0;
      });
      // A câmera volta para trás do boneco, ainda com a estante à vista.
      this.frente.copy(this.focado.dir).sub(this.pos.clone().multiplyScalar(this.focado.dir.dot(this.pos))).normalize();
    }
    this.focado = null;
    this.selecionada = -1;
    this.deslocamento.ax = this.deslocamento.ay = 0;
  }

  /** Usado pelos testes: coloca o boneco num ponto sem andar até lá. */
  saltarPara(x: number, y: number, z: number) {
    this.pos.set(x, y, z).normalize();
    this.intro = 0;
  }

  /** Usado pelos testes: anda sem desenhar, para não depender da placa de vídeo. */
  simular(segundos: number) {
    for (let t = 0; t < segundos; t += 0.033) {
      this.tempo += 0.033;
      this.passo(0.033);
    }
  }

  get situacao() {
    return { pos: this.pos.toArray(), coletas: this.coletas.map((c) => ({ id: c.id, dir: c.dir.toArray() })), perto: this.perto, sitios: this.sitios.map((s) => ({ id: s.id, ponto: s.ponto.toArray(), fitas: s.fitas.length })), dpr: this.dpr, chamadas: this.renderer.info.render.calls, triangulos: this.renderer.info.render.triangles };
  }

  /** Puxa uma fita da prateleira. Os botões do painel usam o mesmo caminho do toque na fita. */
  selecionar(indice: number | null) {
    this.selecionada = indice ?? -1;
  }

  destacar(indice: number | null) {
    this.sobre = indice ?? -1;
  }

  comemorar(ms = 2200) {
    this.jogador.estado.comemorando = true;
    this.guia.estado.comemorando = true;
    setTimeout(() => {
      if (this.descartado) return;
      this.jogador.estado.comemorando = false;
      this.guia.estado.comemorando = false;
    }, ms);
  }

  descartar() {
    this.descartado = true;
    cancelAnimationFrame(this.quadro);
    this.resize.disconnect();
    window.removeEventListener("keydown", this.aoTecla);
    window.removeEventListener("keyup", this.aoSoltarTecla);
    window.removeEventListener("blur", this.aoPerderFoco);
    document.removeEventListener("visibilitychange", this.aoVisibilidade);
    const t = this.tela;
    t.removeEventListener("pointerdown", this.aoApertar);
    t.removeEventListener("pointermove", this.aoMoverPonteiro);
    t.removeEventListener("pointerup", this.aoLevantar);
    t.removeEventListener("pointercancel", this.aoLevantar);
    t.removeEventListener("wheel", this.aoRoda);
    t.removeEventListener("webglcontextlost", this.aoContexto);
    this.cena.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        (mat as THREE.MeshBasicMaterial).map?.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // ------------------------------------------------------------ eventos

  private sitio = (id: string) => this.sitios.find((s) => s.id === id);

  private cancelarDestino() {
    this.destino = null;
    this.destinoSitio = null;
    this.marca.visible = false;
  }

  private aoTecla = (e: KeyboardEvent) => {
    if (this.focado) return;
    const alvo = e.target as HTMLElement;
    if (alvo.closest?.("input, textarea, select")) return;
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      if (alvo.closest?.("button, a")) (alvo as HTMLElement).blur();
      this.teclas.add(k);
      this.cancelarDestino();
      this.eventos.aoAndar();
      e.preventDefault();
    }
    if (k === " " && !alvo.closest?.("button, a")) {
      this.pular();
      e.preventDefault();
    }
  };

  private aoSoltarTecla = (e: KeyboardEvent) => this.teclas.delete(e.key.toLowerCase());
  private aoPerderFoco = () => this.teclas.clear();
  private aoVisibilidade = () => {
    this.ultimo = performance.now();
    this.teclas.clear();
  };
  private aoContexto = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.quadro);
    this.eventos.aoPerderContexto();
  };
  private aoRoda = (e: WheelEvent) => {
    e.preventDefault();
    if (!this.focado) this.distAlvo = Math.min(15, Math.max(5.5, this.distAlvo + e.deltaY * 0.008));
  };

  private ndc(x: number, y: number) {
    const r = this.tela.getBoundingClientRect();
    return new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
  }

  private fitaEm(x: number, y: number) {
    if (!this.focado) return -1;
    this.ray.setFromCamera(this.ndc(x, y), this.camera);
    const hit = this.ray.intersectObjects(this.focado.fitas.map((f) => f.malha), false)[0];
    return hit ? (hit.object.userData.indice as number) : -1;
  }

  private aoApertar = (e: PointerEvent) => {
    this.tela.setPointerCapture(e.pointerId);
    this.dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.dedos.size === 2) {
      const [a, b] = [...this.dedos.values()];
      this.distPinca = Math.hypot(a.x - b.x, a.y - b.y);
      this.arraste = null;
      return;
    }
    this.arraste = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), moveu: false };
  };

  private aoMoverPonteiro = (e: PointerEvent) => {
    if (this.dedos.has(e.pointerId)) this.dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.dedos.size === 2) {
      const [a, b] = [...this.dedos.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (!this.focado) this.distAlvo = Math.min(15, Math.max(5.5, this.distAlvo - (d - this.distPinca) * 0.02));
      this.distPinca = d;
      return;
    }
    if (this.focado) {
      if (e.pointerType === "mouse") {
        const i = this.fitaEm(e.clientX, e.clientY);
        if (i !== this.sobre) this.sobre = i;
        this.tela.style.cursor = i >= 0 ? "pointer" : "";
      }
      return;
    }
    const a = this.arraste;
    if (!a || a.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - a.x0, e.clientY - a.y0) > 7) a.moveu = true;
    if (a.moveu) {
      const dx = e.clientX - a.x;
      const dy = e.clientY - a.y;
      this.frente.applyAxisAngle(this.pos, -dx * 0.0052).normalize();
      this.pitch = Math.min(1.05, Math.max(0.1, this.pitch + dy * 0.004));
    }
    a.x = e.clientX;
    a.y = e.clientY;
  };

  private aoLevantar = (e: PointerEvent) => {
    this.dedos.delete(e.pointerId);
    const a = this.arraste;
    if (!a || a.id !== e.pointerId) return;
    this.arraste = null;
    if (a.moveu || performance.now() - a.t > 500) return;
    if (this.focado) {
      const i = this.fitaEm(e.clientX, e.clientY);
      if (i >= 0) this.eventos.aoFita(this.focado.id, i);
      return;
    }
    this.tocar(e.clientX, e.clientY);
  };

  /** Toque numa estante leva até ela; toque no chão leva até o ponto. */
  private tocar(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.camera);
    const hit = this.ray.intersectObjects(this.sitios.filter((s) => s.grupo.visible).map((s) => s.alvo), false)[0];
    const esfera = new THREE.Sphere(new THREE.Vector3(), RAIO);
    const chao = this.ray.ray.intersectSphere(esfera, new THREE.Vector3());
    const dChao = chao ? chao.distanceTo(this.ray.ray.origin) : Infinity;
    if (hit && hit.distance < dChao + 3) {
      this.irPara(hit.object.userData.sitio);
      return;
    }
    if (!chao) return;
    this.destino = chao.clone().normalize();
    this.destinoSitio = null;
    this.tempoPreso = 0;
    this.distAntes = Infinity;
    const cima = this.destino.clone();
    this.marca.position.copy(cima).multiplyScalar(RAIO + altura(cima) + 0.08);
    this.marca.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cima);
    this.marca.visible = true;
    this.eventos.aoAndar();
  }

  private ajustar() {
    const w = this.tela.clientWidth || 1;
    const h = this.tela.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Celular em pé vê menos dos lados: abre um pouco mais a lente.
    this.camera.fov = w < h ? 64 : 52;
    this.camera.updateProjectionMatrix();
  }

  // ------------------------------------------------------------ simulação

  private mover(dirMov: THREE.Vector3, fator: number, dt: number) {
    const cima = this.pos;
    const ang = (VELOCIDADE * fator * dt) / RAIO;
    const eixo = cima.clone().cross(dirMov).normalize();
    if (!Number.isFinite(eixo.x)) return;
    const q = new THREE.Quaternion().setFromAxisAngle(eixo, ang);
    this.pos.applyQuaternion(q).normalize();
    this.frente.applyQuaternion(q);
    this.olhar.applyQuaternion(q);
    for (const o of this.obstaculos) {
      const prod = this.pos.dot(o.dir);
      if (prod < o.cos) continue;
      const dist = Math.acos(Math.min(1, prod)) * RAIO;
      const falta = o.raio + 0.7 - dist;
      if (falta <= 0) continue;
      const e = o.dir.clone().cross(this.pos).normalize();
      if (!Number.isFinite(e.x)) continue;
      const qp = new THREE.Quaternion().setFromAxisAngle(e, falta / RAIO);
      this.pos.applyQuaternion(qp).normalize();
    }
  }

  private passo(dt: number) {
    const cima = CIMA.copy(this.pos);
    // Corrige o desvio numérico: "frente" precisa continuar tangente à esfera.
    this.frente.sub(cima.clone().multiplyScalar(this.frente.dot(cima))).normalize();
    const lado = this.frente.clone().cross(cima).normalize();

    let ix = this.joy.x;
    let iy = -this.joy.y;
    if (this.teclas.has("a") || this.teclas.has("arrowleft")) ix -= 1;
    if (this.teclas.has("d") || this.teclas.has("arrowright")) ix += 1;
    if (this.teclas.has("w") || this.teclas.has("arrowup")) iy += 1;
    if (this.teclas.has("s") || this.teclas.has("arrowdown")) iy -= 1;

    let andando = 0;
    if (!this.focado) {
      const mov = this.frente.clone().multiplyScalar(iy).add(lado.clone().multiplyScalar(ix));
      let forca = Math.min(1, mov.length());
      if (forca < 0.06 && this.destino) {
        const para = this.destino.clone().sub(cima.clone().multiplyScalar(this.destino.dot(cima)));
        const d = Math.acos(Math.min(1, this.destino.dot(cima))) * RAIO;
        if (d < 0.35) {
          const sitio = this.destinoSitio;
          this.cancelarDestino();
          if (sitio) this.eventos.aoChegar(sitio);
        } else {
          mov.copy(para);
          forca = 1;
          // A câmera vai se virando para o rumo: o caminho fica sempre à vista.
          this.frente.lerp(para.clone().normalize(), Math.min(1, dt * 1.4)).normalize();
          this.tempoPreso += dt;
          if (this.tempoPreso > 1.4) {
            if (this.distAntes - d < 0.5) {
              // Trombou em alguma coisa e não saiu do lugar.
              const sitio = this.destinoSitio;
              this.cancelarDestino();
              if (sitio && d < 5) this.eventos.aoChegar(sitio);
            }
            this.distAntes = d;
            this.tempoPreso = 0;
          }
        }
      }
      if (forca > 0.06) {
        const dir = mov.normalize();
        this.mover(dir, forca, dt);
        this.olhar.lerp(dir, Math.min(1, dt * 11)).normalize();
        andando = forca;
        // Andar de lado faz a câmera acompanhar, como num jogo de plataforma.
        if (ix) this.frente.applyAxisAngle(this.pos, -ix * dt * 0.85).normalize();
        this.tempoPasso -= dt;
        if (this.tempoPasso <= 0 && this.salto < 0.02) {
          this.tempoPasso = 0.31;
          this.eventos.aoPasso();
        }
      }
    }

    // Salto
    if (this.salto > 0 || this.vSalto > 0) {
      this.vSalto -= 24 * dt;
      this.salto += this.vSalto * dt;
      if (this.salto <= 0) {
        this.salto = 0;
        this.vSalto = 0;
      }
    }

    this.jogador.estado.andando += (andando - this.jogador.estado.andando) * Math.min(1, dt * 10);
    const r = RAIO + altura(this.pos) + this.salto;
    this.casca.position.copy(this.pos).multiplyScalar(r);
    const qAlvo = orientar(this.casca, this.pos.clone(), this.olhar);
    this.casca.quaternion.slerp(qAlvo, Math.min(1, dt * 14));

    // A guia vem atrás, sem pressa.
    const dGuia = Math.acos(Math.min(1, this.guiaPos.dot(this.pos))) * RAIO;
    let guiaAnda = 0;
    if (dGuia > 3.2) {
      const para = this.pos.clone().sub(this.guiaPos.clone().multiplyScalar(this.pos.dot(this.guiaPos))).normalize();
      const eixo = this.guiaPos.clone().cross(para).normalize();
      if (Number.isFinite(eixo.x)) {
        const vel = dGuia > 9 ? VELOCIDADE * 1.4 : VELOCIDADE * 0.86;
        this.guiaPos.applyAxisAngle(eixo, (vel * dt) / RAIO).normalize();
        guiaAnda = 1;
      }
    }
    this.guia.estado.andando += (guiaAnda - this.guia.estado.andando) * Math.min(1, dt * 8);
    this.cascaGuia.position.copy(this.guiaPos).multiplyScalar(RAIO + altura(this.guiaPos));
    const paraJogador = this.pos.clone().sub(this.guiaPos).normalize();
    this.cascaGuia.quaternion.slerp(orientar(this.cascaGuia, this.guiaPos.clone(), paraJogador), Math.min(1, dt * 6));

    // Fitas douradas
    for (let i = this.coletas.length - 1; i >= 0; i--) {
      const c = this.coletas[i];
      c.malha.rotateY(dt * 1.8);
      if (this.pos.dot(c.dir) > Math.cos(1.9 / RAIO)) {
        c.malha.visible = false;
        this.coletas.splice(i, 1);
        this.eventos.aoColetar(c.id);
      }
    }

    // Perto de uma estante
    if (!this.focado) {
      let perto: string | null = null;
      for (const s of this.sitios) {
        if (this.pos.dot(s.ponto) > Math.cos(DIST_PERTO / RAIO)) perto = s.id;
      }
      if (perto !== this.perto) {
        this.perto = perto;
        this.eventos.aoPerto(perto);
      }
    }

    // O que está atrás do planeta não precisa ser desenhado.
    if (this.intro <= 0) for (const s of this.sitios) s.grupo.visible = s.dir.dot(this.pos) > -0.32;

    // Fitas: animação de saída
    for (const s of this.sitios) {
      const foco = this.focado === s;
      s.fitas.forEach((f, i) => {
        if (f.atraso > 0) {
          f.atraso -= dt;
          return;
        }
        let alvo = foco ? 0.14 : 0;
        if (foco && this.sobre === i) alvo = 0.42;
        if (foco && this.selecionada === i) alvo = 1;
        f.alvo = alvo;
        f.saida += (f.alvo - f.saida) * Math.min(1, dt * 9);
        const t = f.saida;
        f.malha.position.set(f.base.x * (1 - t * 0.12), f.base.y + (t > 0.5 ? (t - 0.5) * 0.3 : 0), f.base.z + t * 1.7);
        f.malha.rotation.x = -0.05 + Math.sin(this.tempo * 2 + i) * 0.015 * (foco ? 1 : 0);
        f.malha.rotation.y = (t > 0.5 ? Math.sin(this.tempo * 1.5) * 0.07 : 0) - f.base.x * 0.035 * Math.min(1, t * 3);
        const e = 1 + t * 0.42;
        f.malha.scale.set(e, e, 1);
        f.malha.renderOrder = t > 0.3 ? 2 : 0;
      });
    }

    // Marca do destino
    if (this.marca.visible) {
      const mt = this.marca.material as THREE.MeshBasicMaterial;
      mt.opacity = 0.7 + Math.sin(this.tempo * 6) * 0.25;
      this.marca.scale.setScalar(1 + Math.sin(this.tempo * 6) * 0.1);
    }

    this.nuvens.rotateOnWorldAxis(EIXO_NUVEM, dt * 0.012);
    if (!this.movimentoReduzido) this.anel.rotateY(dt * 0.02);
  }

  /** Onde a câmera deveria estar agora, sem suavizar. */
  private alvoCamera() {
    const cima = this.pos;
    if (this.focado) {
      const s = this.focado;
      const base = s.dir.clone().multiplyScalar(RAIO + altura(s.dir));
      const olha = base.clone().add(s.dir.clone().multiplyScalar(3));
      const ladoAlto = window.innerWidth < 900 ? 13.5 : 9.2;
      const p = base.clone().add(s.dir.clone().multiplyScalar(3.35)).add(s.frente.clone().multiplyScalar(ladoAlto));
      return { pos: p, olha, cima: s.dir.clone() };
    }
    const base = cima.clone().multiplyScalar(RAIO + altura(cima));
    const olha = base.clone().add(cima.clone().multiplyScalar(1.6)).add(this.frente.clone().multiplyScalar(2.2));
    const p = base
      .clone()
      .add(cima.clone().multiplyScalar(1.5 + Math.sin(this.pitch) * this.dist))
      .add(this.frente.clone().multiplyScalar(-Math.cos(this.pitch) * this.dist));
    return { pos: p, olha, cima: cima.clone() };
  }

  private posicionarCamera(dt: number, tRel: number) {
    const a = this.alvoCamera();
    const k = this.focado ? Math.min(1, dt * 3.4) : Math.min(1, dt * 7);
    this.camOlha.lerp(a.olha, k);
    this.camCima.lerp(a.cima, k).normalize();
    this.camPos.lerp(a.pos, k);
    this.dist += (this.distAlvo - this.dist) * Math.min(1, dt * 6);

    if (this.intro > 0) {
      // Abertura: o planeta inteiro, e a câmera mergulha até o boneco.
      const t = 1 - Math.pow(Math.max(0, this.intro / 3.2), 2.2);
      const longe = this.pos.clone().multiplyScalar(RAIO * 3.05).add(this.frente.clone().multiplyScalar(-RAIO * 0.9));
      this.camera.position.copy(longe).lerp(a.pos, t);
      this.camera.up.copy(this.pos);
      this.camera.lookAt(new THREE.Vector3().lerp(a.olha, t));
      this.camPos.copy(this.camera.position);
      this.camOlha.copy(a.olha);
      this.camCima.copy(a.cima);
    } else {
      this.camera.position.copy(this.camPos);
      // Evita a câmera dentro do chão quando o relevo sobe.
      const d = this.camera.position.clone().normalize();
      const minimo = RAIO + altura(d) + 0.5;
      if (this.camera.position.length() < minimo) this.camera.position.copy(d.multiplyScalar(minimo));
      this.camera.up.copy(this.camCima);
      this.camera.lookAt(this.camOlha);
    }
    void tRel;
    this.deslocamento.x += (this.deslocamento.ax - this.deslocamento.x) * Math.min(1, dt * 5);
    this.deslocamento.y += (this.deslocamento.ay - this.deslocamento.y) * Math.min(1, dt * 5);
    const w = this.tela.clientWidth;
    const h = this.tela.clientHeight;
    if (Math.abs(this.deslocamento.x) > 0.5 || Math.abs(this.deslocamento.y) > 0.5) this.camera.setViewOffset(w, h, this.deslocamento.x, this.deslocamento.y, w, h);
    else if (this.camera.view) this.camera.clearViewOffset();

    // Céu e luzes seguem o jogador: o lado dele está sempre no fim da tarde.
    this.ceu.position.copy(this.camera.position);
    const u = (this.ceu.material as THREE.ShaderMaterial).uniforms.uCima.value as THREE.Vector3;
    if (this.intro > 0) {
      // De longe o gradiente segue a tela; de perto, o horizonte.
      const telaCima = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
      u.copy(telaCima).lerp(this.pos, 1 - Math.pow(this.intro / 3.2, 2)).normalize();
    } else u.copy(this.camCima);
    const lado = SOL_REF.clone().sub(this.pos.clone().multiplyScalar(SOL_REF.dot(this.pos))).normalize();
    const dirSol = this.pos.clone().multiplyScalar(1).add(lado.multiplyScalar(0.62)).normalize();
    const centro = this.casca.position;
    this.sol.target.position.copy(centro);
    this.sol.position.copy(centro).add(dirSol.multiplyScalar(52));
    this.ceuLuz.position.copy(this.pos);
  }

  private laco = (agora: number) => {
    if (this.descartado) return;
    this.quadro = requestAnimationFrame(this.laco);
    const dt = Math.min(0.05, (agora - this.ultimo) / 1000);
    this.ultimo = agora;
    this.tempo += dt;
    if (this.intro > 0) this.intro = Math.max(0, this.intro - dt);
    this.passo(dt);
    this.jogador.atualizar(dt, this.tempo);
    this.guia.atualizar(dt, this.tempo + 1.7);
    this.posicionarCamera(dt, this.intro);
    this.renderer.render(this.cena, this.camera);
    this.qualidade(dt);
  };

  /** Se o aparelho não dá conta, baixa a resolução antes de o jogo ficar travado. */
  private qualidade(dt: number) {
    this.soma += dt;
    this.conta++;
    if (this.conta < 90) return;
    const media = this.soma / this.conta;
    this.soma = 0;
    this.conta = 0;
    if (media > 1 / 26 && this.dpr > 0.8) {
      this.dpr = Math.max(0.8, this.dpr - 0.3);
      this.renderer.setPixelRatio(this.dpr);
      this.passoHachura.value = 8 * this.dpr;
      this.ajustar();
    }
  }
}

const EIXO_NUVEM = new THREE.Vector3(0.3, 1, 0.2).normalize();
const SOL_REF = new THREE.Vector3(0.6, 0.35, 0.72).normalize();

/** Os estudantes vêm do Laboratório; aqui ganham o mesmo traço do planeta. */
function tingir(raiz: THREE.Object3D, m: ReturnType<typeof criarMateriais>) {
  raiz.traverse((o) => {
    const malha = o as THREE.Mesh;
    if (!malha.isMesh) return;
    const mt = malha.material as THREE.Material;
    if (mt instanceof THREE.ShaderMaterial && "cor" in mt.uniforms) {
      (mt.uniforms.cor.value as THREE.Color).set("#1d1836");
    } else if (mt instanceof THREE.MeshStandardMaterial && mt.vertexColors) {
      malha.material = m.dosDois;
    }
    if (mt instanceof THREE.MeshBasicMaterial && mt.transparent) malha.visible = true;
  });
}
