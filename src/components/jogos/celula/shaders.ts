import * as THREE from "three";

// Tudo o que faz os materiais parecerem vivos: ondulação no vértice, com normal recalculada para a luz
// acompanhar a onda; borda brilhante; veios que correm pela superfície; e gel translúcido, em que a borda
// fica mais opaca que o miolo, sem o custo de uma passada de transmissão.

export type Uniforme<T> = { value: T };
export type Partilha = { tempo: Uniforme<number>; ruido: THREE.Texture };

const SIMPLEX = /* glsl */ `
vec3 m289v(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 m289v(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permv(vec4 x){return m289v(((x*34.)+10.)*x);}
float simplex(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=m289v(i);
  vec4 p=permv(permv(permv(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=1.79284291400159-.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 105.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export type OpVivo = {
  onda?: { amp: number; freq: number; vel: number };
  borda?: { cor: THREE.ColorRepresentation; pot: number; forca: number };
  veios?: { cor: THREE.ColorRepresentation; escala: number; vel: number; forca: number };
  /** Bolsões suaves de cor que mudam devagar. */
  manchas?: { cor: THREE.ColorRepresentation; escala: number; vel: number; forca: number };
  gel?: { min: number; max: number; pot: number };
  /** Instâncias que respiram: sobe e desce no eixo y local, com a fase vinda da posição da instância. */
  respira?: { amp: number; freq: number; vel: number };
};

export function vivo<M extends THREE.MeshStandardMaterial>(m: M, p: Partilha, op: OpVivo): M {
  const defs: Record<string, string> = {};
  if (op.onda) defs.V_ONDA = "";
  if (op.borda) defs.V_BORDA = "";
  if (op.veios) defs.V_VEIOS = "";
  if (op.manchas) defs.V_MANCHAS = "";
  if (op.gel) defs.V_GEL = "";
  if (op.respira) defs.V_RESPIRA = "";
  m.defines = { ...(m.defines ?? {}), ...defs };
  if (op.gel) {
    m.transparent = true;
    m.depthWrite = false;
  }
  m.customProgramCacheKey = () => Object.keys(defs).join("|");
  m.onBeforeCompile = (s) => {
    s.uniforms.uTempo = p.tempo;
    if (op.onda) s.uniforms.uOnda = { value: new THREE.Vector3(op.onda.amp, op.onda.freq, op.onda.vel) };
    if (op.respira) s.uniforms.uRespira = { value: new THREE.Vector3(op.respira.amp, op.respira.freq, op.respira.vel) };
    if (op.borda) {
      s.uniforms.uBordaCor = { value: new THREE.Color(op.borda.cor).multiplyScalar(op.borda.forca) };
      s.uniforms.uBordaPot = { value: op.borda.pot };
    }
    if (op.veios) {
      s.uniforms.uRuido = { value: p.ruido };
      s.uniforms.uVeioCor = { value: new THREE.Color(op.veios.cor).multiplyScalar(op.veios.forca) };
      s.uniforms.uVeio = { value: new THREE.Vector2(op.veios.escala, op.veios.vel) };
    }
    if (op.manchas) {
      s.uniforms.uRuido = { value: p.ruido };
      s.uniforms.uManchaCor = { value: new THREE.Color(op.manchas.cor).multiplyScalar(op.manchas.forca) };
      s.uniforms.uMancha = { value: new THREE.Vector2(op.manchas.escala, op.manchas.vel) };
    }
    if (op.gel) s.uniforms.uGel = { value: new THREE.Vector3(op.gel.min, op.gel.max, op.gel.pot) };

    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
uniform float uTempo;
#ifdef V_ONDA
uniform vec3 uOnda;
${SIMPLEX}
float onda(vec3 p){
  float t=uTempo*uOnda.z;
  return uOnda.x*(simplex(p*uOnda.y+vec3(t,t*.7,-t*.5))+.45*simplex(p*uOnda.y*2.3-vec3(t*.8,t,t*.3)));
}
#endif
#ifdef V_RESPIRA
uniform vec3 uRespira;
#endif
#if defined(V_VEIOS) || defined(V_MANCHAS)
varying vec2 vUvV;
#endif`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `vec3 objectNormal=vec3(normal);
vec3 deslocV=vec3(0.);
#ifdef V_ONDA
{
  vec3 n=normalize(normal);
  vec3 ta=normalize(abs(n.y)<.98?cross(n,vec3(0.,1.,0.)):cross(n,vec3(1.,0.,0.)));
  vec3 bi=cross(n,ta);
  float e=.18/max(uOnda.y,.001);
  float h0=onda(position);
  float h1=onda(position+ta*e);
  float h2=onda(position+bi*e);
  objectNormal=normalize(cross(ta*e+n*(h1-h0),bi*e+n*(h2-h0)));
  deslocV=n*h0;
}
#endif
#ifdef USE_TANGENT
vec3 objectTangent=vec3(tangent.xyz);
#endif`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `vec3 transformed=vec3(position)+deslocV;
#ifdef USE_ALPHAHASH
vPosition=vec3(position);
#endif
#if defined(V_RESPIRA) && defined(USE_INSTANCING)
{
  vec3 ip=instanceMatrix[3].xyz;
  transformed.y+=uRespira.x*sin(dot(ip,vec3(.37,.29,.41))*uRespira.y+uTempo*uRespira.z);
}
#endif
#if defined(V_VEIOS) || defined(V_MANCHAS)
vUvV=uv;
#endif`,
      );

    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
uniform float uTempo;
#ifdef V_BORDA
uniform vec3 uBordaCor;uniform float uBordaPot;
#endif
#if defined(V_VEIOS) || defined(V_MANCHAS)
uniform sampler2D uRuido;varying vec2 vUvV;
#endif
#ifdef V_VEIOS
uniform vec3 uVeioCor;uniform vec2 uVeio;
#endif
#ifdef V_MANCHAS
uniform vec3 uManchaCor;uniform vec2 uMancha;
#endif
#ifdef V_GEL
uniform vec3 uGel;
#endif`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
#ifdef V_BORDA
{
  float f=pow(1.-saturate(abs(dot(normalize(vViewPosition),normal))),uBordaPot);
  totalEmissiveRadiance+=uBordaCor*f;
}
#endif
#ifdef V_VEIOS
{
  vec2 q=vUvV*uVeio.x;float t=uTempo*uVeio.y;
  float a=texture2D(uRuido,q+vec2(t,t*.6)).g;
  float b=texture2D(uRuido,q*1.73-vec2(t*.8,-t*.5)).g;
  float v=smoothstep(.86,1.,1.-abs(a-b)*3.4);
  totalEmissiveRadiance+=uVeioCor*v;
}
#endif
#ifdef V_MANCHAS
{
  vec2 q=vUvV*uMancha.x;float t=uTempo*uMancha.y;
  float a=texture2D(uRuido,q+vec2(t,t*.6)).r;
  float b=texture2D(uRuido,q*.57-vec2(t*.5,-t*.8)).b;
  float v=smoothstep(.34,.86,a*.6+b*.45);
  totalEmissiveRadiance+=uManchaCor*v*v;
}
#endif`,
      )
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `#if defined(V_GEL) && !defined(USE_TRANSMISSION)
{
  float f=pow(1.-saturate(abs(dot(normalize(vViewPosition),normal))),uGel.z);
  float sp=dot(reflectedLight.directSpecular+reflectedLight.indirectSpecular,vec3(.333));
  float em=dot(totalEmissiveRadiance,vec3(.333));
  diffuseColor.a=clamp(mix(uGel.x,uGel.y,f)+sp*1.2+em*.15,0.,1.);
}
#endif
#include <opaque_fragment>`,
      );
  };
  return m;
}

/** Névoa igual à da cena, para os materiais próprios. */
const NEVOA = /* glsl */ `
uniform vec3 uNevoaCor;uniform float uNevoaDens;
float fatorNevoa(float d){float x=uNevoaDens*d;return 1.-exp(-x*x);}`;

export type Nevoa = { cor: Uniforme<THREE.Color>; dens: Uniforme<number> };

/** Halo atrás da organela: o centro é escondido pela própria organela, e sobra o clarão em volta. Funciona mesmo sem bloom. */
export function materialHalo(n: Nevoa, tempo: Uniforme<number>, cor: THREE.ColorRepresentation, forca: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uCor: { value: new THREE.Color(cor).multiplyScalar(forca) }, uRaio: { value: 1 }, uRecuo: { value: 0 }, uTempo: tempo, uNevoaDens: n.dens, uNevoaCor: n.cor, uFase: { value: Math.random() * 6.28 } },
    vertexShader: /* glsl */ `
      uniform float uRaio,uRecuo;varying vec2 vP;varying float vD;
      void main(){
        vP=position.xy;
        vec4 c=modelViewMatrix*vec4(0.,0.,0.,1.);
        vD=-c.z;
        c.z-=uRecuo;c.xy+=position.xy*uRaio;
        gl_Position=projectionMatrix*c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCor;uniform float uTempo,uFase;varying vec2 vP;varying float vD;
      ${NEVOA}
      void main(){
        float r=length(vP);if(r>=1.)discard;
        float g=pow(1.-r,2.6);
        float res=.9+.1*sin(uTempo*.7+uFase);
        gl_FragColor=vec4(uCor*g*res*(1.-fatorNevoa(vD)*.75),1.);
      }`,
  });
}

/** Poeira de moléculas: gira em volta da câmera (posição em módulo) e não custa nada ao processador. */
export function materialPoeira(n: Nevoa, tempo: Uniforme<number>, op: { caixa: number; tam: number; cor1: THREE.ColorRepresentation; cor2: THREE.ColorRepresentation; forca: number; suave: number }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTempo: tempo, uNevoaDens: n.dens, uNevoaCor: n.cor,
      uCaixa: { value: op.caixa }, uTam: { value: op.tam }, uEscala: { value: 800 }, uCentro: { value: new THREE.Vector3() },
      uCor1: { value: new THREE.Color(op.cor1).multiplyScalar(op.forca) }, uCor2: { value: new THREE.Color(op.cor2).multiplyScalar(op.forca) }, uSuave: { value: op.suave },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTempo,uCaixa,uTam,uEscala;uniform vec3 uCentro,uCor1,uCor2;
      varying vec3 vCor;varying float vA;varying float vD;
      void main(){
        vec3 p=position;
        float s=aSeed*6.283;
        p+=vec3(sin(uTempo*.21+s),cos(uTempo*.17+s*2.),sin(uTempo*.13+s*3.))*1.6;
        p=mod(p-uCentro+uCaixa*.5,uCaixa)-uCaixa*.5+uCentro;
        vec4 mv=modelViewMatrix*vec4(p,1.);
        float d=-mv.z;vD=d;
        gl_PointSize=clamp(uTam*(.45+aSeed*.9)*uEscala/max(d,.5),1.,140.);
        float borda=smoothstep(uCaixa*.5,uCaixa*.32,length(p-uCentro));
        vA=smoothstep(.6,3.,d)*borda*(.55+.45*sin(uTempo*(.4+aSeed)+s));
        vCor=mix(uCor1,uCor2,fract(aSeed*7.13));
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uSuave;varying vec3 vCor;varying float vA;varying float vD;
      ${NEVOA}
      void main(){
        vec2 c=gl_PointCoord*2.-1.;float r=dot(c,c);if(r>=1.)discard;
        float g=pow(1.-r,uSuave);
        gl_FragColor=vec4(vCor*g*vA*(1.-fatorNevoa(vD)*.8),1.);
      }`,
  });
}

/** Fibras do citoesqueleto, com pulsos de luz correndo por elas. */
export function materialFibra(n: Nevoa, tempo: Uniforme<number>, base: THREE.ColorRepresentation, pulso: THREE.ColorRepresentation) {
  return new THREE.ShaderMaterial({
    uniforms: { uTempo: tempo, uNevoaDens: n.dens, uNevoaCor: n.cor, uBase: { value: new THREE.Color(base) }, uPulso: { value: new THREE.Color(pulso) } },
    vertexShader: /* glsl */ `
      varying vec2 vU;varying float vD;varying float vF;
      void main(){
        vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;
        vec3 nv=normalize(normalMatrix*normal);vF=pow(1.-abs(dot(nv,normalize(-mv.xyz))),1.5);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase,uPulso;uniform float uTempo;varying vec2 vU;varying float vD;varying float vF;
      ${NEVOA}
      void main(){
        float t=fract(vU.x*5.-uTempo*.14);
        float p=smoothstep(.0,.015,t)*pow(1.-t,16.);
        vec3 c=uBase*(.22+vF*.9)+uPulso*p*3.;
        gl_FragColor=vec4(mix(c,uNevoaCor,fatorNevoa(vD)),1.);
      }`,
  });
}

/** Película de energia dentro dos portais. */
export function materialPortal(tempo: Uniforme<number>, cor: THREE.ColorRepresentation) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTempo: tempo, uCor: { value: new THREE.Color(cor) }, uForca: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCor;uniform float uTempo,uForca;varying vec2 vU;
      void main(){
        vec2 p=vU*2.-1.;float r=length(p);if(r>1.)discard;
        float a=atan(p.y,p.x);
        float s=sin(a*5.+uTempo*1.8-r*11.)*.5+.5;
        float s2=sin(a*11.-uTempo*2.6+r*17.)*.5+.5;
        float g=pow(r,4.)*.8+s*s2*.34*smoothstep(.15,.95,r)*smoothstep(1.,.85,r)+.015;
        gl_FragColor=vec4(uCor*g*uForca*.8,1.);
      }`,
  });
}

/** Fita aditiva com transparência por vértice: rastro dos motores e trilha do elétron. */
export function materialFita(cor: THREE.ColorRepresentation, forca: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uCor: { value: new THREE.Color(cor).multiplyScalar(forca) } },
    vertexShader: /* glsl */ `attribute float aA;varying float vA;void main(){vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */ `uniform vec3 uCor;varying float vA;void main(){gl_FragColor=vec4(uCor*vA*vA,1.);}`,
  });
}

/** Acabamento depois do tone mapping: vinheta e um grão fino, que também evita faixas nos gradientes escuros. */
export const ACABAMENTO = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, uTempo: { value: 0 }, uVinheta: { value: 0.32 }, uGrao: { value: 0.022 } },
  vertexShader: /* glsl */ `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;uniform float uTempo,uVinheta,uGrao;varying vec2 vUv;
    float az(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
    void main(){
      vec4 t=texture2D(tDiffuse,vUv);
      vec2 p=vUv-.5;
      float v=1.-uVinheta*smoothstep(.18,.85,dot(p,p)*2.);
      vec3 c=t.rgb*v;
      float g=az(gl_FragCoord.xy+fract(uTempo)*97.)+az(gl_FragCoord.yx*1.3+fract(uTempo*1.3)*61.)-1.;
      c+=g*uGrao*(1.-dot(c,vec3(.33))*.6);
      gl_FragColor=vec4(c,1.);
    }`,
};
