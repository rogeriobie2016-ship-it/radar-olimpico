import * as THREE from "three";
import { criarCenario, RAIO_SALA, type Cenario, type PecaEstacao } from "./cenario";
import { criarPersonagem, type Personagem, type Quem } from "./personagem";
import type { IdEstacao } from "./estacoes";

export type Eventos = {
  aoPerto: (id: IdEstacao | null) => void;
  aoChegar: (id: IdEstacao) => void;
  aoMover: (x: number, z: number, angulo: number) => void;
  aoAndar?: () => void;
  aoPasso?: () => void;
  aoPronto: () => void;
  aoPerderContexto: () => void;
};

const VELOCIDADE = 6.2;
const RAIO_CORPO = 0.65;
const DIST_PERTO = 3.1;

/** Motor do laboratório: uma cena, um laço, sem React. A interface conversa com ele por métodos e eventos. */
export class Laboratorio {
  readonly cena = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cenario: Cenario;
  private jogador: Personagem;
  private guia: Personagem;
  private relogio = new THREE.Clock();
  private quadro = 0;
  private descartado = false;
  private resize: ResizeObserver;

  // Estado de navegação
  private pos = new THREE.Vector3(0, 0, 7.5);
  private guiaPos = new THREE.Vector3(2.4, 0, 8.5);
  private direcao = Math.PI;
  private teclas = new Set<string>();
  private joy = { x: 0, y: 0 };
  private destino: THREE.Vector3 | null = null;
  private destinoEstacao: IdEstacao | null = null;
  private perto: IdEstacao | null = null;
  private tempoPasso = 0;

  // Câmera
  private yaw = 0;
  private pitch = 0.36;
  private dist = 7.6;
  private distAlvo = 7.6;
  private camPos = new THREE.Vector3(0, 26, 3);
  private camOlha = new THREE.Vector3(0, 3, 0);
  private intro = 2.4;
  private movimentoReduzido: boolean;
  private focada: PecaEstacao | null = null;
  private deslocamento = { x: 0, y: 0, ax: 0, ay: 0 };

  // Ponteiro
  private arraste: { id: number; x0: number; y0: number; x: number; y: number; t: number; moveu: boolean } | null = null;
  private dedos = new Map<number, { x: number; y: number }>();
  private distPinca = 0;
  private marca: THREE.Mesh;

  // Qualidade adaptativa
  private dpr: number;
  private somaQuadros = 0;
  private contaQuadros = 0;
  private ray = new THREE.Raycaster();
  private alvosClique: THREE.Mesh[] = [];

  constructor(
    private tela: HTMLCanvasElement,
    quem: Quem,
    private eventos: Eventos,
    base: string,
  ) {
    this.movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, powerPreference: "high-performance", alpha: false });
    this.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.5 : 1.75);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);

    this.cena.background = new THREE.Color("#071a3a");
    this.cena.add(new THREE.AmbientLight("#ffffff", 2.1));
    const sol = new THREE.DirectionalLight("#fff6e6", 1.5);
    sol.position.set(6, 16, 9);
    this.cena.add(sol);

    this.cenario = criarCenario();
    this.cena.add(this.cenario.grupo);

    this.jogador = criarPersonagem(quem);
    this.guia = criarPersonagem(quem === "menino" ? "menina" : "menino");
    this.cena.add(this.jogador.raiz, this.guia.raiz);

    const marca = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 28), new THREE.MeshBasicMaterial({ color: "#fdc13f", transparent: true, opacity: 0, depthWrite: false }));
    marca.rotation.x = -Math.PI / 2;
    marca.position.y = 0.04;
    this.marca = marca;
    this.cena.add(marca);

    // Áreas de toque invisíveis, generosas, para cada equipamento
    for (const p of this.cenario.pecas) {
      const alvo = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 7.5, 10), new THREE.MeshBasicMaterial({ visible: false }));
      alvo.position.copy(p.posicao).setY(3.2);
      alvo.userData.id = p.estacao.id;
      this.alvosClique.push(alvo);
      this.cena.add(alvo);
    }

    new THREE.TextureLoader().load(`${base}/joc/logo.webp`, (t) => {
      if (this.descartado) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      const mat = this.cenario.logoCentro.material as THREE.SpriteMaterial;
      mat.map = t;
      mat.opacity = 1;
      mat.needsUpdate = true;
    });
    this.carregarLogos(base);

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
    this.yaw = 0;
    this.relogio.start();
    this.renderer.compile(this.cena, this.camera);
    this.quadro = requestAnimationFrame(this.laco);
    requestAnimationFrame(() => this.eventos.aoPronto());
  }

  // ------------------------------------------------------------ logos flutuantes

  private logoIds: Partial<Record<IdEstacao, string[]>> = {};

  /** Os logos oficiais só entram depois da cena pronta e sobre placa branca, sem alterar o desenho. */
  definirLogos(porEstacao: Partial<Record<IdEstacao, string[]>>) {
    this.logoIds = porEstacao;
  }

  private base = "";
  private carregarLogos(base: string) {
    this.base = base;
  }

  private colocarLogos(p: PecaEstacao) {
    p.logosCarregados = true;
    const ids = (this.logoIds[p.estacao.id] ?? []).slice(0, 3);
    ids.forEach((id, i) => {
      const img = new Image();
      img.onload = () => {
        if (this.descartado) return;
        const T = 256;
        const c = document.createElement("canvas");
        c.width = c.height = T;
        const g = c.getContext("2d")!;
        g.fillStyle = "#fff";
        g.beginPath();
        g.roundRect(0, 0, T, T, 44);
        g.fill();
        const e = Math.min(208 / img.width, 208 / img.height);
        g.drawImage(img, (T - img.width * e) / 2, (T - img.height * e) / 2, img.width * e, img.height * e);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false }));
        s.scale.setScalar(1.15);
        s.userData.base = 0;
        s.position.set((i - (ids.length - 1) / 2) * 1.45, 7.95, 0);
        p.logos.add(s);
      };
      img.src = `${this.base}/olimpiadas/${id}.webp`;
    });
  }

  // ------------------------------------------------------------ API para a interface

  /** Vai andando até o equipamento. Ao chegar, avisa a interface. */
  irPara(id: IdEstacao) {
    const p = this.peca(id);
    if (!p) return;
    this.destino = p.ponto.clone();
    this.destinoEstacao = id;
    this.eventos.aoAndar?.();
  }

  definirJoystick(x: number, y: number) {
    this.joy.x = x;
    this.joy.y = y;
    if (x || y) this.cancelarDestino();
  }

  /** Câmera se aproxima do equipamento e deixa espaço para o painel. */
  focar(id: IdEstacao, painel: { direita: number; baixo: number }) {
    const p = this.peca(id);
    if (!p) return;
    this.focada = p;
    this.cancelarDestino();
    this.pos.copy(p.ponto);
    this.jogador.estado.andando = 0;
    this.deslocamento.ax = painel.direita / 2;
    this.deslocamento.ay = painel.baixo / 2;
    this.teclas.clear();
    this.joy.x = this.joy.y = 0;
  }

  soltarFoco() {
    this.focada = null;
    this.deslocamento.ax = this.deslocamento.ay = 0;
  }

  controlar(id: IdEstacao, nome: string, valor?: unknown) {
    this.peca(id)?.controles[nome]?.(valor);
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

  guiaFala(falando: boolean) {
    this.guia.estado.falando = falando;
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

  private peca = (id: IdEstacao) => this.cenario.pecas.find((p) => p.estacao.id === id);

  private cancelarDestino() {
    this.destino = null;
    this.destinoEstacao = null;
  }

  private aoTecla = (e: KeyboardEvent) => {
    if (this.focada) return;
    const alvo = e.target as HTMLElement;
    if (alvo.closest?.("input, textarea, select")) return;
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      this.teclas.add(k);
      this.cancelarDestino();
      if (k.startsWith("arrow")) e.preventDefault();
    }
  };

  private aoSoltarTecla = (e: KeyboardEvent) => this.teclas.delete(e.key.toLowerCase());
  private aoPerderFoco = () => this.teclas.clear();
  private aoVisibilidade = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.quadro);
      this.teclas.clear();
    } else if (!this.descartado) {
      this.relogio.getDelta();
      this.quadro = requestAnimationFrame(this.laco);
    }
  };
  private aoContexto = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.quadro);
    this.eventos.aoPerderContexto();
  };

  private aoRoda = (e: WheelEvent) => {
    e.preventDefault();
    if (this.focada) return;
    this.distAlvo = THREE.MathUtils.clamp(this.distAlvo + e.deltaY * 0.01, 4.5, 15);
  };

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
    if (this.dedos.size === 2 && !this.focada) {
      const [a, b] = [...this.dedos.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      this.distAlvo = THREE.MathUtils.clamp(this.distAlvo - (d - this.distPinca) * 0.03, 4.5, 15);
      this.distPinca = d;
      return;
    }
    const a = this.arraste;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    a.x = e.clientX;
    a.y = e.clientY;
    if (Math.hypot(e.clientX - a.x0, e.clientY - a.y0) > 8) a.moveu = true;
    if (a.moveu && !this.focada) {
      this.yaw -= dx * 0.0062;
      this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.0042, 0.08, 1.15);
    }
  };

  private aoLevantar = (e: PointerEvent) => {
    this.dedos.delete(e.pointerId);
    const a = this.arraste;
    this.arraste = null;
    if (!a || a.id !== e.pointerId || a.moveu || this.focada || e.type === "pointercancel") return;
    if (performance.now() - a.t < 450) this.tocarEm(e.clientX, e.clientY);
  };

  /** Tocar no chão anda até lá. Tocar num equipamento vai até ele. */
  private tocarEm(cx: number, cy: number) {
    if (this.intro > 0) {
      this.intro = 0;
      return;
    }
    const r = this.tela.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(ndc, this.camera);
    const hit = this.ray.intersectObjects(this.alvosClique, false)[0];
    if (hit) {
      this.irPara(hit.object.userData.id as IdEstacao);
      return;
    }
    const dy = this.ray.ray.direction.y;
    if (dy >= -0.001) return;
    const t = -this.ray.ray.origin.y / dy;
    const p = this.ray.ray.origin.clone().addScaledVector(this.ray.ray.direction, t);
    if (p.length() > RAIO_SALA - 1) p.setLength(RAIO_SALA - 1);
    this.destino = p;
    this.destinoEstacao = null;
    this.marca.position.set(p.x, 0.04, p.z);
    (this.marca.material as THREE.MeshBasicMaterial).opacity = 1;
    this.eventos.aoAndar?.();
  }

  private ajustar() {
    const l = this.tela.clientWidth;
    const a = this.tela.clientHeight;
    if (!l || !a) return;
    this.renderer.setSize(l, a, false);
    this.camera.aspect = l / a;
    // Em tela em pé, abre um pouco o campo de visão para o laboratório caber.
    this.camera.fov = l < a ? 68 : 58;
    this.camera.updateProjectionMatrix();
  }

  // ------------------------------------------------------------ física simples

  private resolver(p: THREE.Vector3) {
    for (const o of this.cenario.obstaculos) {
      const dx = p.x - o.x;
      const dz = p.z - o.z;
      const d = Math.hypot(dx, dz);
      const min = o.r + RAIO_CORPO;
      if (d < min && d > 0.0001) {
        p.x = o.x + (dx / d) * min;
        p.z = o.z + (dz / d) * min;
      }
    }
    const lim = RAIO_SALA - 1;
    const l = Math.hypot(p.x, p.z);
    if (l > lim) {
      p.x *= lim / l;
      p.z *= lim / l;
    }
  }

  private mover(dt: number) {
    let ix = 0;
    let iz = 0;
    if (this.teclas.has("w") || this.teclas.has("arrowup")) iz -= 1;
    if (this.teclas.has("s") || this.teclas.has("arrowdown")) iz += 1;
    if (this.teclas.has("a") || this.teclas.has("arrowleft")) ix -= 1;
    if (this.teclas.has("d") || this.teclas.has("arrowright")) ix += 1;
    ix += this.joy.x;
    iz += this.joy.y;
    let intensidade = Math.min(1, Math.hypot(ix, iz));
    let mx = 0;
    let mz = 0;
    if (intensidade > 0.08) {
      // Direção relativa à câmera. yaw 0 olha para -Z.
      const n = Math.hypot(ix, iz) || 1;
      const cos = Math.cos(this.yaw);
      const sin = Math.sin(this.yaw);
      const nx = ix / n;
      const nz = iz / n;
      mx = nx * cos + nz * sin;
      mz = -nx * sin + nz * cos;
      // Andando de lado, a câmera vira devagar: dá para dirigir só com um dedo.
      if (!this.arraste) this.yaw -= (ix / n) * dt * 0.75 * intensidade;
    } else if (this.destino) {
      const dx = this.destino.x - this.pos.x;
      const dz = this.destino.z - this.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.25) {
        const chegou = this.destinoEstacao;
        this.cancelarDestino();
        (this.marca.material as THREE.MeshBasicMaterial).opacity = 0;
        if (chegou) this.eventos.aoChegar(chegou);
      } else {
        mx = dx / d;
        mz = dz / d;
        intensidade = Math.min(1, d / 0.8 + 0.3);
        // Desvia dos obstáculos em vez de empacar: soma uma força de lado.
        for (const o of this.cenario.obstaculos) {
          const ox = o.x - this.pos.x;
          const oz = o.z - this.pos.z;
          const od = Math.hypot(ox, oz);
          if (od > o.r + 2.4 || od > d + o.r) continue;
          if ((ox * mx + oz * mz) / (od || 1) < 0.35) continue;
          const lado = ox * mz - oz * mx > 0 ? 1 : -1;
          const forca = 1 - (od - o.r) / 2.4;
          mx += mz * lado * 1.3 * Math.max(0, forca);
          mz += -(dx / d) * lado * 1.3 * Math.max(0, forca);
        }
        const nn = Math.hypot(mx, mz) || 1;
        mx /= nn;
        mz /= nn;
      }
    } else {
      intensidade = 0;
    }

    const andando = intensidade > 0.08 && (mx !== 0 || mz !== 0);
    if (andando) {
      this.pos.x += mx * VELOCIDADE * intensidade * dt;
      this.pos.z += mz * VELOCIDADE * intensidade * dt;
      this.resolver(this.pos);
      const alvo = Math.atan2(mx, mz);
      let dif = alvo - this.direcao;
      dif = Math.atan2(Math.sin(dif), Math.cos(dif));
      this.direcao += dif * Math.min(1, dt * 12);
      this.tempoPasso -= dt * intensidade;
      if (this.tempoPasso <= 0) {
        this.tempoPasso = 0.32;
        this.eventos.aoPasso?.();
      }
    }
    this.jogador.estado.andando = andando ? intensidade : 0;
    this.jogador.raiz.position.x = this.pos.x;
    this.jogador.raiz.position.z = this.pos.z;
    this.jogador.raiz.rotation.y = this.direcao;

    // Quem guia segue de perto, sem atropelar
    // Anda ao lado, um pouco atrás: nunca entre a câmera e a pessoa.
    const lado = Math.sin(this.yaw - this.direcao) >= 0 ? 1 : -1;
    const atras = new THREE.Vector3(-Math.sin(this.direcao) * 0.7 + Math.cos(this.direcao) * 2.3 * lado, 0, -Math.cos(this.direcao) * 0.7 - Math.sin(this.direcao) * 2.3 * lado);
    const alvoGuia = this.pos.clone().add(atras);
    this.resolver(alvoGuia);
    const gx = alvoGuia.x - this.guiaPos.x;
    const gz = alvoGuia.z - this.guiaPos.z;
    const gd = Math.hypot(gx, gz);
    const gv = gd > 0.45 ? Math.min(1, gd / 2.2) : 0;
    if (gv) {
      this.guiaPos.x += (gx / gd) * VELOCIDADE * 1.05 * gv * dt;
      this.guiaPos.z += (gz / gd) * VELOCIDADE * 1.05 * gv * dt;
      this.resolver(this.guiaPos);
      this.guia.raiz.rotation.y = Math.atan2(gx, gz);
    } else {
      const v = Math.atan2(this.pos.x - this.guiaPos.x, this.pos.z - this.guiaPos.z);
      let d = v - this.guia.raiz.rotation.y;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.guia.raiz.rotation.y += d * Math.min(1, dt * 4);
    }
    this.guia.estado.andando = gv;
    this.guia.raiz.position.x = this.guiaPos.x;
    this.guia.raiz.position.z = this.guiaPos.z;
    this.guia.estado.acenando = !andando && gv === 0 && this.intro > 0;

    // Proximidade
    let maisPerto: IdEstacao | null = null;
    let melhor = DIST_PERTO;
    for (const p of this.cenario.pecas) {
      const d = Math.hypot(p.ponto.x - this.pos.x, p.ponto.z - this.pos.z);
      if (d < melhor) {
        melhor = d;
        maisPerto = p.estacao.id;
      }
    }
    if (maisPerto !== this.perto) {
      this.perto = maisPerto;
      this.eventos.aoPerto(maisPerto);
    }
    this.eventos.aoMover(this.pos.x, this.pos.z, this.direcao);
  }

  private camAlvo = new THREE.Vector3();
  private olhaAlvo = new THREE.Vector3();

  private moverCamera(dt: number) {
    if (this.focada) {
      const p = this.focada;
      const fora = p.ponto.clone().normalize();
      const lado = new THREE.Vector3(fora.z, 0, -fora.x);
      // Olha para o equipamento, um pouco de lado, deixando a pessoa no quadro
      this.camAlvo.copy(p.ponto).addScaledVector(fora, -2.6).addScaledVector(lado, 2.2).setY(p.foco.y + 1.5);
      this.olhaAlvo.copy(p.foco);
      const v = Math.min(1, dt * 2.6);
      this.camPos.lerp(this.camAlvo, v);
      this.camOlha.lerp(this.olhaAlvo, v);
    } else {
      this.dist += (this.distAlvo - this.dist) * Math.min(1, dt * 5);
      const cp = Math.cos(this.pitch);
      this.olhaAlvo.set(this.pos.x, 1.75, this.pos.z);
      this.camAlvo.set(this.pos.x + Math.sin(this.yaw) * cp * this.dist, 1.75 + Math.sin(this.pitch) * this.dist, this.pos.z + Math.cos(this.yaw) * cp * this.dist);
      // A câmera não atravessa a cúpula nem os equipamentos
      const lim = RAIO_SALA - 0.8;
      const l = Math.hypot(this.camAlvo.x, this.camAlvo.z);
      if (l > lim) {
        this.camAlvo.x *= lim / l;
        this.camAlvo.z *= lim / l;
      }
      for (const o of this.cenario.obstaculos.slice(1)) {
        const dx = this.camAlvo.x - o.x;
        const dz = this.camAlvo.z - o.z;
        const d = Math.hypot(dx, dz);
        if (d < o.r - 0.3 && this.camAlvo.y < 6.5) this.camAlvo.y = THREE.MathUtils.lerp(6.5, this.camAlvo.y, d / (o.r - 0.3));
      }
      if (this.intro > 0) {
        this.intro -= dt;
        const k = 1 - Math.max(0, this.intro) / 2.4;
        const e = k * k * (3 - 2 * k);
        // Entrada: desce da cúpula em espiral até o personagem
        const a = this.yaw + (1 - e) * 2.2;
        const r = THREE.MathUtils.lerp(17, this.dist, e);
        this.camAlvo.set(this.pos.x * e + Math.sin(a) * r, THREE.MathUtils.lerp(17, this.camAlvo.y, e), this.pos.z * e + Math.cos(a) * r);
        this.olhaAlvo.set(this.pos.x, THREE.MathUtils.lerp(3, 1.75, e), this.pos.z);
        this.camPos.copy(this.camAlvo);
        this.camOlha.copy(this.olhaAlvo);
      } else {
        const v = Math.min(1, dt * 7);
        this.camPos.lerp(this.camAlvo, v);
        this.camOlha.lerp(this.olhaAlvo, Math.min(1, dt * 9));
      }
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camOlha);

    // Painel aberto: desloca a imagem para o equipamento ficar visível ao lado
    const d = this.deslocamento;
    d.x += (d.ax - d.x) * Math.min(1, dt * 5);
    d.y += (d.ay - d.y) * Math.min(1, dt * 5);
    const l = this.tela.clientWidth;
    const a = this.tela.clientHeight;
    if (Math.abs(d.x) > 0.5 || Math.abs(d.y) > 0.5) this.camera.setViewOffset(l, a, d.x, d.y, l, a);
    else if (this.camera.view?.enabled) this.camera.clearViewOffset();
  }

  private qualidade(dt: number) {
    this.somaQuadros += dt;
    this.contaQuadros++;
    if (this.somaQuadros < 1.5) return;
    const media = this.somaQuadros / this.contaQuadros;
    this.somaQuadros = 0;
    this.contaQuadros = 0;
    if (media > 1 / 32 && this.dpr > 0.8) {
      this.dpr = Math.max(0.8, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.ajustar();
    }
  }

  private laco = () => {
    if (this.descartado) return;
    this.quadro = requestAnimationFrame(this.laco);
    const dt = Math.min(0.05, this.relogio.getDelta());
    const t = this.relogio.elapsedTime;

    if (!this.focada && this.intro <= 0) this.mover(dt);
    else if (this.intro > 0) {
      this.jogador.raiz.position.set(this.pos.x, this.jogador.raiz.position.y, this.pos.z);
      this.jogador.raiz.rotation.y = this.direcao;
      this.guia.raiz.position.set(this.guiaPos.x, this.guia.raiz.position.y, this.guiaPos.z);
      this.guia.raiz.rotation.y = -0.6;
      this.guia.estado.acenando = true;
      this.direcao = 0;
    } else {
      this.jogador.raiz.position.x = this.pos.x;
      this.jogador.raiz.position.z = this.pos.z;
      // Na frente do equipamento
      const p = this.focada!;
      this.jogador.raiz.rotation.y = Math.atan2(p.posicao.x - this.pos.x, p.posicao.z - this.pos.z);
      this.direcao = this.jogador.raiz.rotation.y;
      this.guia.estado.andando = 0;
    }

    this.jogador.atualizar(dt, t);
    this.guia.atualizar(dt, t);

    for (const p of this.cenario.pecas) {
      const d = Math.hypot(p.posicao.x - this.pos.x, p.posicao.z - this.pos.z);
      // Só o que está perto anima: em celular fraco, isso vale muitos quadros.
      if (d < 21 || this.focada === p) p.atualizar(t, dt);
      if (!p.logosCarregados && d < 13) this.colocarLogos(p);
      p.seta.position.y = 5.45 + Math.sin(t * 2.6 + p.posicao.x) * 0.14;
      p.seta.rotation.y = t * 1.4;
      const destaque = this.perto === p.estacao.id || this.destinoEstacao === p.estacao.id;
      const esc = destaque ? 1.1 + Math.sin(t * 5) * 0.08 : 1;
      p.anel.scale.setScalar(esc);
    }
    const marca = this.marca.material as THREE.MeshBasicMaterial;
    if (marca.opacity > 0) this.marca.scale.setScalar(1 + Math.sin(t * 8) * 0.12);

    this.cenario.atualizar(t);
    const logo = this.cenario.logoCentro;
    logo.position.y = 3.75 + Math.sin(t * 1.1) * 0.13;

    this.moverCamera(dt);
    this.qualidade(dt);
    this.renderer.render(this.cena, this.camera);
  };
}
