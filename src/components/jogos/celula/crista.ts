import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { acaso, bolhaProteina, criarRuido, fbm } from "./feitio";
import { POSICOES_CRISTA, type V3 } from "./mapa";
import { criarHalo, criarPoeira, type Ctx } from "./organelas";
import { vivo } from "./shaders";

// A final do jogo: dentro de uma crista. Uma membrana interna dobrada, as proteínas da cadeia enfiadas nela,
// prótons atravessando e várias ATP sintases girando. Fora de escala, mas com a ordem certa das peças.

export type Crista = {
  grupo: THREE.Group;
  particulas: THREE.Object3D[];
  poeiras: THREE.ShaderMaterial[];
  atualizar: (t: number, dt: number, cam: THREE.Vector3) => void;
  /** Risca a trilha do elétron entre dois pontos. */
  ligar: (de: THREE.Vector3, para: THREE.Vector3) => void;
  /** Acelera o giro das turbinas: os prótons começaram a voltar. */
  girar: () => void;
};

function chao(ctx: Ctx, tam: number, seg: number, y: number, inverte: boolean, cor: string, emissivo: string, veio: string) {
  const g = new THREE.PlaneGeometry(tam, tam, seg, seg);
  g.rotateX(inverte ? Math.PI / 2 : -Math.PI / 2);
  const ruido = criarRuido(inverte ? 12 : 4);
  const pos = g.attributes.position as THREE.BufferAttribute;
  // A altura dá as dobras largas; a normal vem por diferença finita, para a luz acompanhar.
  const alt = (x: number, z: number) => {
    const raio = Math.hypot(x, z);
    const borda = THREE.MathUtils.smoothstep(raio, 34, 130);
    return (fbm(ruido, x * 0.018, 0, z * 0.018, 3) * 9 + Math.sin(x * 0.06 + z * 0.02) * 1.2) * (0.35 + borda * 2.6) + borda * (inverte ? -6 : 14);
  };
  const nor = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = alt(x, z);
    const e = 0.8;
    const dx = alt(x + e, z) - h;
    const dz = alt(x, z + e) - h;
    const l = Math.hypot(dx, e, dz);
    nor.setXYZ(i, -dx / l, (inverte ? -e : e) / l, -dz / l);
    pos.setY(i, y + h);
  }
  const lip = ctx.lipidios.clone();
  lip.repeat.set(64, 64);
  lip.needsUpdate = true;
  const mat = vivo(
    new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.42, metalness: 0.02, normalMap: lip, normalScale: new THREE.Vector2(1.1, 1.1), clearcoat: 0.7, clearcoatRoughness: 0.34, sheen: 0.8, sheenColor: new THREE.Color("#ff8a50"), sheenRoughness: 0.5, emissive: emissivo, emissiveIntensity: 0.07, envMapIntensity: 0.7 }),
    ctx.partilha,
    { onda: { amp: 0.42, freq: 0.07, vel: 0.28 }, borda: { cor: "#ff6a2a", pot: 3, forca: 0.32 }, manchas: { cor: veio, escala: 3.4, vel: 0.012, forca: 0.34 } },
  );
  return new THREE.Mesh(g, mat);
}

/** Proteína grande, enfiada na membrana. */
function proteina(ctx: Ctx, geo: THREE.BufferGeometry, cor: string, emissivo: string, borda: string, pos: V3, esc: [number, number, number], rot = 0) {
  const mat = vivo(
    new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.26, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.14, vertexColors: true, iridescence: 0.55, iridescenceIOR: 1.45, iridescenceThicknessMinimum: 180, iridescenceThicknessMaximum: 560, sheen: 0.6, sheenColor: new THREE.Color(borda), emissive: emissivo, emissiveIntensity: 0.16, envMapIntensity: 1.3 }),
    ctx.partilha,
    { onda: { amp: 0.07, freq: 0.9, vel: 0.6 }, borda: { cor: borda, pot: 2.2, forca: 1.05 } },
  );
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.scale.set(...esc);
  m.rotation.y = rot;
  return m;
}

/** ATP sintase: base na membrana, haste e a cabeça F1 com seis gomos, que é o que se vê girar. */
function criarSintase(ctx: Ctx, detalhe: number) {
  const n = (x: number) => Math.round(x * detalhe);
  const raiz = new THREE.Group();
  const gomoG = bolhaProteina(44, { seg: n(46), lobos: 4, amp: 0.04, freq: 2, forcaLobo: 0.45 });
  const matA = vivo(new THREE.MeshPhysicalMaterial({ color: "#c98a12", roughness: 0.22, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1, vertexColors: true, iridescence: 0.7, emissive: "#e08a10", emissiveIntensity: 0.22, envMapIntensity: 1.4 }), ctx.partilha, { borda: { cor: "#ffd070", pot: 2, forca: 1 } });
  const matB = vivo(new THREE.MeshPhysicalMaterial({ color: "#117a72", roughness: 0.24, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, vertexColors: true, iridescence: 0.7, emissive: "#10c8a8", emissiveIntensity: 0.2, envMapIntensity: 1.4 }), ctx.partilha, { borda: { cor: "#70ffe0", pot: 2, forca: 0.95 } });
  const cabeca = new THREE.Group();
  cabeca.position.y = 8.8;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const g = new THREE.Mesh(gomoG, i % 2 ? matA : matB);
    g.position.set(Math.cos(a) * 2.25, Math.sin(i * 1.7) * 0.15, Math.sin(a) * 2.25);
    g.scale.set(1.75, 2.1, 1.75);
    g.rotation.y = a;
    cabeca.add(g);
  }
  const eixo = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 6.4, 8, n(22)), new THREE.MeshPhysicalMaterial({ color: "#4a1c7a", roughness: 0.2, metalness: 0.4, clearcoat: 1, emissive: "#9a5cff", emissiveIntensity: 1.1 }));
  eixo.position.y = 4.6;
  const haste = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 6, 6, n(16)), new THREE.MeshPhysicalMaterial({ color: "#7a2a50", roughness: 0.3, metalness: 0.2, clearcoat: 1, emissive: "#ff5fa8", emissiveIntensity: 0.5 }));
  haste.position.set(3.1, 4.2, 0);
  const rotorG = new THREE.TorusGeometry(2.1, 0.62, n(18), n(48));
  rotorG.rotateX(Math.PI / 2);
  const rotor = new THREE.Mesh(rotorG, new THREE.MeshPhysicalMaterial({ color: "#3a1560", roughness: 0.24, metalness: 0.5, clearcoat: 1, emissive: "#a060ff", emissiveIntensity: 0.9 }));
  rotor.position.y = 0.55;
  raiz.add(cabeca, eixo, haste, rotor);
  const luz = new THREE.PointLight("#ffd070", 90, 22, 2);
  luz.position.y = 11.5;
  raiz.add(luz);
  return { raiz, cabeca, rotor };
}

export function criarCrista(ctx: Ctx, geoQuad: THREE.BufferGeometry): Crista {
  const n = (x: number) => Math.round(x * ctx.detalhe);
  const grupo = new THREE.Group();

  grupo.add(chao(ctx, 320, n(230), 0, false, "#4a1a14", "#ff4a14", "#e04a10"));
  grupo.add(chao(ctx, 320, n(120), 46, true, "#26102c", "#a02a70", "#a0206a"));

  // Complexos da cadeia, enfiados na membrana.
  const I = mergeGeometries([bolhaProteina(61, { seg: n(90), lobos: 8, amp: 0.07 }).scale(1.45, 0.62, 0.85), bolhaProteina(62, { seg: n(80), lobos: 8, amp: 0.07 }).scale(0.74, 1.15, 0.74).translate(-0.72, 1.1, 0)])!;
  const mapaP = POSICOES_CRISTA;
  const pos = (id: string, y = 0): V3 => [mapaP[id][0], y, mapaP[id][2]];
  grupo.add(proteina(ctx, I, "#128aa6", "#20d4ff", "#a8f6ff", pos("complexo-1", 1.8), [6.8, 6.8, 6.8], 0.6));
  grupo.add(proteina(ctx, bolhaProteina(63, { seg: n(110), lobos: 9, amp: 0.07 }), "#4a22a8", "#7a40f0", "#b89aff", pos("complexo-3", 3), [7, 5.6, 6], 1.2));
  grupo.add(proteina(ctx, bolhaProteina(64, { seg: n(110), lobos: 8, amp: 0.07 }), "#a01a6a", "#f03098", "#ff9ad0", pos("complexo-4", 3), [6.2, 5.4, 6.2], 0.2));

  // Carreadores móveis: a ubiquinona é pequena e lipofílica; o citocromo c é uma proteína vermelha com ferro.
  const ubi = proteina(ctx, bolhaProteina(65, { seg: n(60), lobos: 5, amp: 0.05 }), "#c07a10", "#ffb020", "#ffe8a0", pos("ubiquinona", 3.4), [2.1, 1.6, 2.1]);
  const cit = proteina(ctx, bolhaProteina(66, { seg: n(60), lobos: 5, amp: 0.05 }), "#a81820", "#ff3a2a", "#ffc0a8", pos("citocromo", 6.5), [2.5, 2.5, 2.5]);
  grupo.add(ubi, cit);

  // Oxigênio: duas esferas de vidro, o aceptor final.
  const oxi = new THREE.Group();
  const matO = vivo(new THREE.MeshPhysicalMaterial({ color: "#e8fbff", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.8, emissive: "#9adfff", emissiveIntensity: 0.5, envMapIntensity: 2 }), ctx.partilha, { borda: { cor: "#ffffff", pot: 2, forca: 1.2 } });
  const esfera = new THREE.SphereGeometry(1.7, n(40), n(28));
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(esfera, matO);
    e.position.x = s * 1.25;
    oxi.add(e);
  }
  oxi.position.set(mapaP.oxigenio[0], 10.5, mapaP.oxigenio[2]);
  grupo.add(oxi);

  // Turbinas: uma herói, no alvo da missão, e outras ao fundo.
  const sintases: { cabeca: THREE.Group; rotor: THREE.Mesh; vel: number }[] = [];
  const posS: [number, number, number, number][] = [
    [mapaP["atp-sintase"][0], 0, mapaP["atp-sintase"][2], 1],
    [-52, 0, -14, 0.9],
    [36, 0, 30, 0.95],
    [52, 0, -38, 0.85],
    [-8, 0, -52, 0.9],
    [-58, 0, 34, 0.8],
    [12, 0, 56, 0.85],
  ];
  const modelo = criarSintase(ctx, ctx.detalhe);
  posS.forEach(([x, y, z, e], i) => {
    const s = i === 0 ? modelo.raiz : modelo.raiz.clone();
    if (i > 0) s.children.filter((c) => (c as THREE.PointLight).isPointLight).forEach((c) => s.remove(c));
    s.position.set(x, y, z);
    s.scale.setScalar(e);
    grupo.add(s);
    const cabeca = s.children[0] as THREE.Group;
    const rotor = s.children[3] as THREE.Mesh;
    sintases.push({ cabeca, rotor, vel: 0.5 + i * 0.05 });
  });

  grupo.add(criarHalo(ctx, geoQuad, [mapaP["complexo-1"][0], 6, mapaP["complexo-1"][2]], "#2fc6ff", 22, 8, 0.32));
  grupo.add(criarHalo(ctx, geoQuad, [mapaP["complexo-3"][0], 6, mapaP["complexo-3"][2]], "#8a50ff", 20, 7, 0.32));
  grupo.add(criarHalo(ctx, geoQuad, [mapaP["complexo-4"][0], 6, mapaP["complexo-4"][2]], "#ff40a8", 20, 7, 0.34));
  grupo.add(criarHalo(ctx, geoQuad, [mapaP["atp-sintase"][0], 9, mapaP["atp-sintase"][2]], "#ffc040", 20, 7, 0.36));
  grupo.add(criarHalo(ctx, geoQuad, [mapaP.oxigenio[0], 10.5, mapaP.oxigenio[2]], "#b0e8ff", 12, 2.5, 0.3));

  // Luzes da cena, quentes por baixo e frias por cima.
  const luzes: [string, number, number, V3][] = [
    ["#ffa070", 640, 130, [0, 30, 6]],
    ["#20d4ff", 300, 56, [mapaP["complexo-1"][0], 17, mapaP["complexo-1"][2]]],
    ["#a070ff", 260, 50, [mapaP["complexo-3"][0], 16, mapaP["complexo-3"][2]]],
    ["#ff5ab0", 280, 50, [mapaP["complexo-4"][0], 16, mapaP["complexo-4"][2]]],
    ["#ffc860", 320, 54, [mapaP["atp-sintase"][0], 20, mapaP["atp-sintase"][2]]],
  ];
  for (const [c, f, d, p] of luzes) {
    const l = new THREE.PointLight(c, f, d, 2);
    l.position.set(p[0], p[1], p[2]);
    grupo.add(l);
  }
  const dl = new THREE.DirectionalLight("#ffd0b0", 0.28);
  dl.position.set(0.5, 1, 0.3);
  grupo.add(dl);

  // Prótons: rosa, atravessando os complexos em direção à membrana, e voltando pela turbina.
  const r = acaso(19);
  const qtd = n(620);
  const pp = new Float32Array(qtd * 3);
  const se = new Float32Array(qtd);
  const colunas: { x: number; z: number; r: number; dir: number }[] = [
    { x: mapaP["complexo-1"][0], z: mapaP["complexo-1"][2], r: 7, dir: -1 },
    { x: mapaP["complexo-3"][0], z: mapaP["complexo-3"][2], r: 6, dir: -1 },
    { x: mapaP["complexo-4"][0], z: mapaP["complexo-4"][2], r: 6, dir: -1 },
    { x: mapaP["atp-sintase"][0], z: mapaP["atp-sintase"][2], r: 3.4, dir: 1 },
  ];
  const col = new Float32Array(qtd * 4);
  for (let i = 0; i < qtd; i++) {
    const c = colunas[i % colunas.length];
    const a = r() * 6.28;
    const raio = Math.sqrt(r()) * c.r;
    pp[i * 3] = c.x + Math.cos(a) * raio;
    pp[i * 3 + 1] = r();
    pp[i * 3 + 2] = c.z + Math.sin(a) * raio;
    se[i] = r();
    col[i * 4] = c.dir;
  }
  const gp = new THREE.BufferGeometry();
  gp.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  gp.setAttribute("aSeed", new THREE.BufferAttribute(se, 1));
  gp.setAttribute("aDir", new THREE.BufferAttribute(new Float32Array(Array.from({ length: qtd }, (_, i) => col[i * 4])), 1));
  const tempo = ctx.partilha.tempo;
  const uFluxo = { value: 0.6 };
  const matP = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTempo: tempo, uFluxo, uEscala: { value: 800 }, uNevoaDens: ctx.nevoa.dens },
    vertexShader: /* glsl */ `
      attribute float aSeed,aDir;uniform float uTempo,uEscala,uFluxo;varying float vA;varying float vD;
      void main(){
        float t=fract(position.y+uTempo*(.06+aSeed*.09)*uFluxo*aDir);
        vec3 p=vec3(position.x,mix(-3.,20.,t),position.z);
        float s=aSeed*6.283;
        p.xz+=vec2(sin(uTempo*.7+s),cos(uTempo*.6+s*2.))*.5;
        vec4 mv=modelViewMatrix*vec4(p,1.);vD=-mv.z;
        gl_PointSize=clamp((.2+aSeed*.2)*uEscala/max(vD,.5),1.,40.);
        vA=smoothstep(0.,.1,t)*smoothstep(1.,.75,t);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uNevoaDens;varying float vA;varying float vD;
      void main(){
        vec2 c=gl_PointCoord*2.-1.;float r=dot(c,c);if(r>=1.)discard;
        float g=pow(1.-r,2.);float x=uNevoaDens*vD;
        gl_FragColor=vec4(vec3(1.,.34,.72)*2.6*g*vA*exp(-x*x),1.);
      }`,
  });
  const protons = new THREE.Points(gp, matP);
  protons.frustumCulled = false;
  grupo.add(protons);

  const fina = criarPoeira(ctx, 31, n(2200), { caixa: 60, tam: 0.1, cor1: "#ffd6a0", cor2: "#ff9ac8", forca: 1.5, suave: 2 });
  const bokeh = criarPoeira(ctx, 33, n(180), { caixa: 100, tam: 0.82, cor1: "#ff8a4a", cor2: "#ff4fa8", forca: 0.14, suave: 1.4 });
  grupo.add(fina, bokeh);
  const poeiras = [fina.material as THREE.ShaderMaterial, bokeh.material as THREE.ShaderMaterial, matP];

  // Trilha do elétron: fica riscada no ar, e dá para ver o caminho percorrido.
  const matTrilha = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd23a").multiplyScalar(1.7) });

  let giro = 0;
  return {
    grupo,
    particulas: [fina, bokeh, protons],
    poeiras,
    atualizar: (_t, dt, cam) => {
      fina.material.uniforms.uCentro.value.copy(cam);
      bokeh.material.uniforms.uCentro.value.copy(cam);
      giro = Math.max(0, giro - dt * 0.12);
      for (const s of sintases) {
        const w = s.vel + giro * 8;
        s.cabeca.rotation.y -= dt * w * 0.25;
        s.rotor.rotation.y += dt * w;
      }
      uFluxo.value = 0.6 + giro * 1.8;
      ubi.position.y = 3.4 + Math.sin(_t * 0.8) * 0.45;
      cit.position.y = 6.5 + Math.sin(_t * 0.6 + 1) * 0.7;
      oxi.rotation.y = _t * 0.3;
      oxi.rotation.z = Math.sin(_t * 0.4) * 0.3;
    },
    ligar: (de, para) => {
      const meio = de.clone().lerp(para, 0.5);
      meio.y += 2 + de.distanceTo(para) * 0.08;
      const curva = new THREE.QuadraticBezierCurve3(de, meio, para);
      grupo.add(new THREE.Mesh(new THREE.TubeGeometry(curva, n(60), 0.05, 8), matTrilha));
    },
    girar: () => {
      giro = 1;
    },
  };
}
