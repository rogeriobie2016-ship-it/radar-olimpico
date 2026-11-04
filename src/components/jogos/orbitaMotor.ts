// Motor da Órbita Numérica: simulação e desenho num canvas pequeno, ampliado sem suavizar.
// Fica fora do React de propósito. O React só recebe mudanças nos momentos de evento, nunca a cada quadro.
import { FASES, NOME_TEMA, criarRoteiro, type Questao, type Sorteio, type Tema } from "@/lib/estudo/orbita";
import { tocar } from "@/lib/som";
import { criarArte, criarAstro, criarCapsula, criarFundo, LARGURA_LETRA, larguraCapsula, textoPronto, type Arte } from "./orbitaArte";

export type Painel =
  | { tipo: "erro"; escolhida: string; resposta: string; explicacao: string; ultimo: boolean }
  | { tipo: "tempo"; resposta: string; explicacao: string }
  | { tipo: "fase"; numero: number; nome: string; chefe: string; acertos: number; contas: number; proxima: string | null; escudoGanho: boolean }
  | { tipo: "pausa" };

export type Tela = {
  rotulo: string;
  pontos: number;
  questao: Questao | null;
  aviso: string;
  tom: "neutro" | "certo" | "perigo";
  painel: Painel | null;
};

type Modo = "entrada" | "onda" | "intervalo" | "chefeEntra" | "chefeMorre" | "morte" | "fim";
type Capsula = { x: number; y: number; bx: number; vy: number; l: number; a: number; quadros: HTMLCanvasElement[]; viva: boolean; fase: number; folga: number };
type Rocha = { x: number; y: number; vx: number; vy: number; tipo: number; giro: number; vg: number };
type Tiro = { x: number; y: number; vx: number; vy: number };
type Faisca = { x: number; y: number; vx: number; vy: number; vida: number; cor: string };
type Letreiro = { texto: string; cor: string; x: number; y: number; vida: number };

const MAX_ESCUDOS = 3;
const VEL_TECLA = 125;
const VEL_PILOTO = 150;
const VEL_ARRASTO = 430;
const VEL_RECUO = 170;
const MAX_FAISCAS = 70;
const ARMAR = 1.2; // segundos em que a cápsula recém-chegada ainda não coleta, para ninguém errar por acidente
const CORES_ESTRELA = ["#51618a", "#9fb4dc", "#ffffff"];
const VEL_ESTRELA = [5, 12, 26];

export function criarMotor(canvas: HTMLCanvasElement, caixa: HTMLElement, opcoes: { sorteio: Sorteio; aoMudar: (t: Partial<Tela>) => void; aoFim: (pontos: number, resumo: string) => void }) {
  const { aoMudar, aoFim } = opcoes;
  const g = canvas.getContext("2d", { alpha: false })!;
  const arte: Arte = criarArte();
  const proxima = criarRoteiro(opcoes.sorteio);
  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)");
  const movimento = () => !calmo.matches;
  const toqueGrosso = window.matchMedia("(pointer: coarse)").matches;

  let L = 195;
  let A = 300;
  let escala = 2;
  let fundo: HTMLCanvasElement | null = null;
  let astro: HTMLCanvasElement | null = null;
  let fundoY = 0;
  let astroY = 0;
  const estrelas = VEL_ESTRELA.map(() => [] as { x: number; y: number; fase: number }[]);

  let modo: Modo = "entrada";
  let espera = false; // um painel está aberto: a simulação congela
  let rodando = false;
  let quadroId = 0;
  let antes = 0;
  let t = 0;
  let relogio = 0;
  let abertoEm = 0;
  let painelAtual: Painel["tipo"] | null = null;

  let fase = 0;
  let onda = 0;
  let questao: Questao | null = null;
  let capsulas: Capsula[] = [];
  let tempoDaOnda = 0;
  let inicioDaOnda = 0;
  let chefeAtivo = false;
  let chefeX = 0;
  let chefeY = -40;
  let chefeVida = 0;
  let chefePisca = 0;
  let proxTiroChefe = 0;
  let feixe = 0;

  const nave = { x: 97, y: 260, invuln: 0 };
  let piloto = -1;
  let alvo: { x: number; y: number; vel: number } | null = null;
  const teclas = { esq: false, dir: false, cima: false, baixo: false };
  let dedo: { id: number; dx: number; dy: number; x0: number; y0: number; em: number; moveu: boolean } | null = null;

  let rochas: Rocha[] = [];
  let tiros: Tiro[] = [];
  const faiscas: Faisca[] = [];
  let letreiros: Letreiro[] = [];
  let proxRocha = 0;
  let tremor = 0;
  let clarao = 0;
  let banner: { a: string; b: string; ate: number; cor: string } | null = null;

  let pontos = 0;
  let escudos = MAX_ESCUDOS;
  let sequencia = 0;
  let acertos = 0;
  let contas = 0;
  let acertosFase = 0;
  let contasFase = 0;
  const errosPorTema = new Map<Tema, number>();
  let resultado: { pontos: number; resumo: string } | null = null;

  const conf = () => FASES[fase];
  const chefe = () => arte.chefes[fase];
  const yMinimo = () => (chefeAtivo ? chefeY + 40 : 26);

  function medir() {
    const cx = caixa.clientWidth;
    const cy = caixa.clientHeight;
    if (!cx || !cy) return;
    // Pixel sempre inteiro: o mundo fica com cerca de 160 a 260 pixels de largura em qualquer tela.
    const novaEscala = Math.max(1, Math.min(Math.max(2, Math.floor(cx / 160)), Math.floor(cy / 150)));
    const nl = Math.floor(cx / novaEscala);
    const na = Math.floor(cy / novaEscala);
    if (nl === L && na === A && novaEscala === escala && fundo) return;
    const rx = nl / L;
    const ry = na / A;
    L = nl;
    A = na;
    escala = novaEscala;
    canvas.width = L;
    canvas.height = A;
    canvas.style.width = `${L * escala}px`;
    canvas.style.height = `${A * escala}px`;
    g.imageSmoothingEnabled = false;
    nave.x *= rx;
    nave.y *= ry;
    capsulas.forEach((c) => {
      c.bx *= rx;
      c.x *= rx;
      c.y *= ry;
    });
    rochas.forEach((r) => {
      r.x *= rx;
      r.y *= ry;
    });
    tiros.forEach((r) => {
      r.x *= rx;
      r.y *= ry;
    });
    chefeX *= rx;
    alvo = null;
    criarCenario();
    if (!rodando) desenhar();
  }

  function criarCenario() {
    fundo = criarFundo(fase, L, A);
    astro = criarAstro(fase);
    astroY = A * 0.12;
    const quantos = [Math.round((L * A) / 900), Math.round((L * A) / 1800), Math.round((L * A) / 4200)];
    estrelas.forEach((camada, i) => {
      camada.length = 0;
      for (let k = 0; k < quantos[i]; k++) camada.push({ x: Math.random() * L, y: Math.random() * A, fase: Math.random() * 6 });
    });
  }

  // Interface
  const rotulo = () => {
    const f = `Fase ${fase + 1} de ${FASES.length}`;
    if (chefeAtivo) return `${f}, chefe ${chefe().nome}`;
    return `${f}, conta ${Math.min(onda + 1, conf().ondas)} de ${conf().ondas}`;
  };
  const abrirPainel = (p: Painel) => {
    espera = true;
    painelAtual = p.tipo;
    abertoEm = performance.now();
    teclas.esq = teclas.dir = teclas.cima = teclas.baixo = false;
    dedo = null;
    aoMudar({ painel: p });
  };

  // Fluxo da partida
  function iniciarFase(i: number) {
    fase = i;
    onda = 0;
    acertosFase = 0;
    contasFase = 0;
    chefeAtivo = false;
    chefeVida = 0;
    chefeY = -40;
    questao = null;
    capsulas = [];
    rochas = [];
    tiros = [];
    modo = "entrada";
    relogio = 2.4;
    proxRocha = 1;
    nave.x = L / 2;
    nave.y = A - 24;
    piloto = -1;
    alvo = null;
    criarCenario();
    banner = { a: `FASE ${i + 1}`, b: conf().nome, ate: t + 2.4, cor: "#fdc13f" };
    const dica = toqueGrosso ? "Arraste a nave até a cápsula certa e desvie das outras." : "Use as setas ou arraste a nave até a cápsula certa. As teclas de 1 a 4 levam a nave sozinha.";
    aoMudar({ rotulo: rotulo(), questao: null, aviso: i === 0 ? dica : `${conf().nome}. Prepare a nave.`, tom: "neutro", painel: null });
    tocar("lancar");
  }

  function proximaConta() {
    if (!chefeAtivo && onda >= conf().ondas) {
      entrarChefe();
      return;
    }
    const f = conf();
    questao = proxima(fase, chefeAtivo);
    contas++;
    contasFase++;
    const n = questao.opcoes.length;
    const margem = 3;
    const faixa = (L - margem * 2) / n;
    const topo = chefeAtivo ? chefeY + 18 : -17;
    tempoDaOnda = (f.segundos + questao.enunciado.length * 0.03) * (movimento() ? 1 : 1.25);
    const vy = (A - topo) / tempoDaOnda;
    inicioDaOnda = t;
    const degraus = [0, 12, 6, 18].sort(() => Math.random() - 0.5);
    capsulas = questao.opcoes.map((texto, i) => {
      const l = Math.min(Math.floor(faixa) - 2, larguraCapsula(texto));
      const c = criarCapsula(texto, Math.max(l, texto.length * LARGURA_LETRA + 5));
      const bx = margem + faixa * (i + 0.5);
      return { x: bx, bx, y: topo - degraus[i % 4], vy, l: c.largura, a: c.altura, quadros: c.quadros, viva: true, fase: Math.random() * 6, folga: Math.max(1, (faixa - c.largura) / 2) };
    });
    piloto = -1;
    // A nave recua sozinha: assim a fileira nova nunca cai em cima de quem ficou no alto, e sempre dá tempo de ler.
    alvo = dedo ? null : { x: nave.x, y: A - 24, vel: VEL_RECUO };
    modo = "onda";
    aoMudar({ rotulo: rotulo(), questao, aviso: "", tom: "neutro" });
  }

  function entrarChefe() {
    chefeAtivo = true;
    chefeVida = conf().vidaChefe;
    chefeY = -30;
    chefeX = L / 2;
    modo = "chefeEntra";
    relogio = 2.2;
    questao = null;
    capsulas = [];
    banner = { a: "ALERTA", b: `CHEFE: ${chefe().nome}`, ate: t + 2.2, cor: "#ff6b6b" };
    tocar("virar");
    aoMudar({ rotulo: rotulo(), questao: null, aviso: `O ${chefe().nome} chegou. Cada resposta certa dispara o raio da nave.`, tom: "perigo" });
  }

  function faseConcluida() {
    const ganhou = escudos < MAX_ESCUDOS;
    escudos = Math.min(MAX_ESCUDOS, escudos + 1);
    const ultima = fase === FASES.length - 1;
    abrirPainel({ tipo: "fase", numero: fase + 1, nome: conf().nome, chefe: chefe().nome, acertos: acertosFase, contas: contasFase, proxima: ultima ? null : FASES[fase + 1].nome, escudoGanho: ganhou });
  }

  function terminar(como: "venceu" | "perdeu" | "saiu") {
    modo = "fim";
    const pl = (n: number) => `${n} ${n === 1 ? "acerto" : "acertos"} em ${contas} ${contas === 1 ? "conta" : "contas"}`;
    if (como === "venceu") {
      pontos += 1000 + escudos * 200;
      resultado = { pontos, resumo: `Você atravessou as ${FASES.length} fases e venceu o ${chefe().nome}, com ${pl(acertos)}. É esse raciocínio que a OBMEP e o Canguru pedem.` };
    } else {
      let pior: Tema | null = null;
      let qtd = 0;
      errosPorTema.forEach((v, k) => {
        if (v > qtd) {
          qtd = v;
          pior = k;
        }
      });
      const revisar = pior ? ` Vale revisar ${NOME_TEMA[pior as Tema]} antes da próxima órbita.` : "";
      const abertura = como === "saiu" ? "Você encerrou a viagem" : "Os escudos acabaram";
      resultado = { pontos, resumo: `${abertura} na fase ${fase + 1}, ${conf().nome}, com ${pl(acertos)}.${revisar}` };
    }
    aoFim(resultado.pontos, resultado.resumo);
  }

  function explodir(x: number, y: number, cores: string[], n: number, forca = 60) {
    if (!movimento()) return;
    for (let i = 0; i < n && faiscas.length < MAX_FAISCAS; i++) {
      const a = Math.random() * 6.283;
      const v = forca * (0.3 + Math.random());
      faiscas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0.35 + Math.random() * 0.4, cor: cores[i % cores.length] });
    }
  }
  const letreiro = (texto: string, cor: string, x: number, y: number) => letreiros.push({ texto, cor, x: Math.max(2, Math.min(L - texto.length * LARGURA_LETRA - 2, x - (texto.length * LARGURA_LETRA) / 2)), y, vida: 1.1 });

  function levarDano() {
    escudos--;
    sequencia = 0;
    nave.invuln = 1.7;
    if (movimento()) {
      tremor = 0.3;
      clarao = 0.14;
    }
    explodir(nave.x, nave.y, ["#ff6b6b", "#fdc13f", "#ffffff"], 14);
    tocar("pouso");
    if (navigator.vibrate) navigator.vibrate(50);
  }

  function morrer() {
    modo = "morte";
    relogio = 1.3;
    capsulas = [];
    questao = null;
    explodir(nave.x, nave.y, ["#ff6b6b", "#fdc13f", "#ffffff", "#3ee8e6"], 40, 90);
    tocar("erro");
    aoMudar({ questao: null, aviso: "Escudos esgotados.", tom: "perigo" });
  }

  function acertar(c: Capsula) {
    if (!questao) return;
    const resta = Math.max(0, 1 - (t - inicioDaOnda) / tempoDaOnda);
    sequencia++;
    acertos++;
    acertosFase++;
    const mult = 1 + Math.min(3, Math.floor(sequencia / 3));
    const ganho = (100 + Math.round(resta * 100)) * mult;
    pontos += ganho;
    tocar("acerto");
    explodir(c.x, c.y + 8, ["#4bd68c", "#ffffff", "#3ee8e6"], 16);
    letreiro(`+${ganho}`, "#4bd68c", c.x, c.y);
    capsulas.forEach((o) => {
      if (o !== c) explodir(o.x, o.y + 8, ["#315a7a"], 4, 26);
      o.viva = false;
    });
    let aviso = `Certo! +${ganho}`;
    if (mult > 1) aviso += `, sequência vezes ${mult}`;
    if (sequencia % 4 === 0 && escudos < MAX_ESCUDOS) {
      escudos++;
      letreiro("ESCUDO +1", "#3ee8e6", nave.x, nave.y - 22);
      aviso += ". Escudo recuperado";
    }
    aoMudar({ pontos, aviso: `${aviso}.`, tom: "certo", questao: null });
    questao = null;
    if (chefeAtivo) {
      chefeVida--;
      chefePisca = 0.5;
      feixe = 0.3;
      tocar("lancar");
      if (chefeVida <= 0) {
        pontos += 500 * (fase + 1);
        modo = "chefeMorre";
        relogio = movimento() ? 1.9 : 0.8;
        tiros = [];
        rochas = [];
        aoMudar({ pontos, aviso: `${chefe().nome} derrotado! +${(500 * (fase + 1)).toLocaleString("pt-BR")}`, tom: "certo" });
        tocar("festa");
        return;
      }
    } else {
      onda++;
    }
    modo = "intervalo";
    relogio = 0.9;
  }

  function errar(c: Capsula) {
    if (!questao) return;
    const q = questao;
    const tema = q.tema;
    errosPorTema.set(tema, (errosPorTema.get(tema) ?? 0) + 1);
    const i = capsulas.indexOf(c);
    levarDano();
    tocar("erro");
    explodir(c.x, c.y + 8, ["#ff6b6b", "#ffffff"], 12);
    capsulas.forEach((o) => (o.viva = false));
    if (!chefeAtivo) onda++;
    modo = "intervalo";
    relogio = 0.35;
    abrirPainel({ tipo: "erro", escolhida: q.opcoes[i], resposta: q.opcoes[q.certa], explicacao: q.explicacao, ultimo: escudos <= 0 });
    questao = null;
  }

  function passouDoTempo() {
    if (!questao) return;
    const q = questao;
    errosPorTema.set(q.tema, (errosPorTema.get(q.tema) ?? 0) + 1);
    sequencia = 0;
    capsulas = [];
    if (!chefeAtivo) onda++;
    modo = "intervalo";
    relogio = 0.35;
    tocar("pouso");
    abrirPainel({ tipo: "tempo", resposta: q.opcoes[q.certa], explicacao: q.explicacao });
    questao = null;
  }

  // Simulação
  function moverNave(dt: number) {
    const dx = (teclas.dir ? 1 : 0) - (teclas.esq ? 1 : 0);
    const dy = (teclas.baixo ? 1 : 0) - (teclas.cima ? 1 : 0);
    if (dx || dy) {
      piloto = -1;
      alvo = null;
      const k = dx && dy ? 0.71 : 1;
      nave.x += dx * k * VEL_TECLA * dt;
      nave.y += dy * k * VEL_TECLA * dt;
    } else {
      let destino: { x: number; y: number } | null = null;
      let vel = VEL_PILOTO;
      if (piloto >= 0) {
        const c = capsulas[piloto];
        if (c?.viva) destino = { x: c.x, y: c.y + c.a / 2 };
        else piloto = -1;
      } else if (alvo) {
        destino = alvo;
        vel = alvo.vel;
      }
      if (destino) {
        const ax = destino.x - nave.x;
        const ay = destino.y - nave.y;
        const d = Math.hypot(ax, ay);
        const passo = vel * dt;
        if (d <= passo) {
          nave.x = destino.x;
          nave.y = destino.y;
        } else {
          nave.x += (ax / d) * passo;
          nave.y += (ay / d) * passo;
        }
      }
    }
    nave.x = Math.max(9, Math.min(L - 9, nave.x));
    nave.y = Math.max(yMinimo(), Math.min(A - 12, nave.y));
    if (nave.invuln > 0) nave.invuln -= dt;
  }

  function tocaNave(x: number, y: number, m: number) {
    return Math.abs(x - nave.x) < 4 + m && Math.abs(y - nave.y) < 6 + m;
  }

  function simular(dt: number) {
    t += dt;
    if (modo === "fim") return;
    if (modo !== "morte") moverNave(dt);

    if (modo === "entrada" || modo === "intervalo" || modo === "chefeEntra" || modo === "chefeMorre" || modo === "morte") relogio -= dt;

    if (modo === "entrada" && relogio <= 0) proximaConta();
    else if (modo === "intervalo" && relogio <= 0) {
      if (escudos <= 0) morrer();
      else proximaConta();
    } else if (modo === "chefeEntra") {
      chefeY = Math.min(36, chefeY + dt * 45);
      if (relogio <= 0) {
        proxTiroChefe = 2;
        proximaConta();
      }
    } else if (modo === "chefeMorre") {
      if (movimento() && Math.random() < dt * 14) explodir(chefeX + (Math.random() - 0.5) * 34, chefeY + (Math.random() - 0.5) * 26, ["#fdc13f", "#ff6b6b", "#ffffff"], 8, 60);
      if (movimento()) tremor = Math.max(tremor, 0.12);
      if (relogio <= 0) {
        chefeAtivo = false;
        faseConcluida();
      }
    } else if (modo === "morte" && relogio <= 0) {
      terminar("perdeu");
      return;
    }

    if (chefeAtivo && modo !== "chefeMorre") chefeX = L / 2 + (movimento() ? Math.sin(t * 0.8) * (L / 2 - 28) : 0);
    if (chefePisca > 0) chefePisca -= dt;
    if (feixe > 0) feixe -= dt;

    // Cápsulas
    if (modo === "onda") {
      const ond = movimento() ? conf().ondulacao : 0;
      let todasPassaram = true;
      for (let i = 0; i < capsulas.length; i++) {
        const c = capsulas[i];
        c.y += c.vy * dt;
        // O balanço nunca sai da própria faixa: duas respostas não podem se encostar.
        c.x = c.bx + (ond ? Math.sin(t * 1.3 + c.fase) * Math.min(ond, c.folga) : 0);
        if (c.y < A + 2) todasPassaram = false;
      }
      for (let i = 0; i < capsulas.length; i++) {
        const c = capsulas[i];
        // Com o piloto ligado, vale só a resposta escolhida: passar raspando por outra não conta como erro.
        if (piloto >= 0 && i !== piloto) continue;
        if (t - inicioDaOnda > ARMAR && Math.abs(c.x - nave.x) < c.l / 2 + 3 && nave.y + 6 > c.y + 1 && nave.y - 6 < c.y + c.a - 1) {
          if (questao && i === questao.certa) acertar(c);
          else errar(c);
          break;
        }
      }
      if (modo === "onda" && todasPassaram) passouDoTempo();
    }

    // Asteroides
    if (modo === "onda" || modo === "intervalo") {
      proxRocha -= dt * (chefeAtivo ? 0.4 : 1);
      if (proxRocha <= 0 && t - inicioDaOnda > 1.2) {
        proxRocha = (0.65 + Math.random() * 0.7) / conf().asteroidesPorSegundo;
        const tipo = Math.random() < 0.45 ? 0 : 1;
        rochas.push({ x: 8 + Math.random() * (L - 16), y: -14, vx: (Math.random() - 0.5) * 10, vy: A * conf().velocidadeAsteroide * (0.8 + Math.random() * 0.5), tipo, giro: 0, vg: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3) });
      }
    }
    for (let i = rochas.length - 1; i >= 0; i--) {
      const r = rochas[i];
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.giro += r.vg * dt;
      if (r.y > A + 14) {
        rochas[i] = rochas[rochas.length - 1];
        rochas.pop();
      } else if (nave.invuln <= 0 && modo !== "morte" && tocaNave(r.x, r.y, r.tipo === 0 ? 3 : 1)) {
        explodir(r.x, r.y, ["#a39a92", "#544d4c"], 8);
        rochas[i] = rochas[rochas.length - 1];
        rochas.pop();
        levarDano();
        if (escudos <= 0) {
          morrer();
          break;
        }
      }
    }

    // Disparos do chefe
    if (chefeAtivo && modo === "onda") {
      proxTiroChefe -= dt;
      if (proxTiroChefe <= 0) {
        proxTiroChefe = 3 - fase * 0.25;
        const n = conf().disparosChefe;
        const base = Math.atan2(nave.y - chefeY, nave.x - chefeX);
        const v = A * (0.2 + fase * 0.025);
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.3;
          tiros.push({ x: chefeX, y: chefeY + 12, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
        }
      }
    }
    for (let i = tiros.length - 1; i >= 0; i--) {
      const r = tiros[i];
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      if (r.y > A + 6 || r.x < -6 || r.x > L + 6 || r.y < -6) {
        tiros[i] = tiros[tiros.length - 1];
        tiros.pop();
      } else if (nave.invuln <= 0 && modo !== "morte" && modo !== "chefeMorre" && tocaNave(r.x, r.y, 1)) {
        tiros[i] = tiros[tiros.length - 1];
        tiros.pop();
        levarDano();
        if (escudos <= 0) {
          morrer();
          break;
        }
      }
    }

    // Efeitos
    for (let i = faiscas.length - 1; i >= 0; i--) {
      const f = faiscas[i];
      f.vida -= dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.vida <= 0) {
        faiscas[i] = faiscas[faiscas.length - 1];
        faiscas.pop();
      }
    }
    for (const l of letreiros) {
      l.vida -= dt;
      if (movimento()) l.y -= dt * 16;
    }
    if (letreiros.length && letreiros[0].vida <= 0) letreiros = letreiros.filter((l) => l.vida > 0);
    if (tremor > 0) tremor -= dt;
    if (clarao > 0) clarao -= dt;
    if (banner && t > banner.ate) banner = null;
  }

  function moverCeu(dt: number) {
    if (!movimento()) return;
    const turbo = modo === "entrada" ? 3.5 : 1;
    fundoY = (fundoY + dt * 3 * turbo) % A;
    astroY += dt * 1.6;
    if (astroY > A + 10) astroY = -50;
    estrelas.forEach((camada, i) => {
      const v = VEL_ESTRELA[i] * turbo * dt;
      for (const e of camada) {
        e.y += v;
        if (e.y > A) {
          e.y -= A;
          e.x = Math.random() * L;
        }
      }
    });
  }

  // Desenho
  function desenhar() {
    if (!fundo) return;
    const mov = movimento();
    const fy = Math.floor(fundoY);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(fundo, 0, fy);
    if (fy > 0) g.drawImage(fundo, 0, fy - A);
    if (astro) g.drawImage(astro, Math.floor(L * 0.62), Math.floor(astroY));
    const turbo = modo === "entrada" && mov;
    estrelas.forEach((camada, i) => {
      g.fillStyle = CORES_ESTRELA[i];
      const alto = turbo ? 2 + i * 2 : 1;
      for (const e of camada) {
        if (mov && i === 2 && Math.sin(t * 3 + e.fase) < -0.6) continue;
        g.fillRect(Math.floor(e.x), Math.floor(e.y), 1, alto);
      }
    });

    if (tremor > 0 && mov) g.setTransform(1, 0, 0, 1, Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 4));

    for (const r of rochas) {
      const quadros = arte.rochas[r.tipo];
      const q = quadros[((Math.floor(mov ? r.giro : 0) % 4) + 4) % 4];
      g.drawImage(q, Math.round(r.x - q.width / 2), Math.round(r.y - q.height / 2));
    }

    if (chefeAtivo) {
      const visivel = !(chefePisca > 0 && Math.floor(t * 18) % 2 === 0 && mov);
      const fim = mov && modo === "chefeMorre" && Math.floor(t * 12) % 2 === 0;
      if (visivel && !fim) chefe().desenhar(g, { x: Math.round(chefeX), y: Math.round(chefeY), alvoX: nave.x, t, movimento: mov });
    }

    const quadroCap = mov ? Math.floor(t * 6) % 3 : 0;
    for (const c of capsulas) {
      if (!c.viva) continue;
      if (mov && t - inicioDaOnda < ARMAR && Math.floor(t * 10) % 2 === 0) continue;
      g.drawImage(c.quadros[quadroCap], Math.round(c.x - c.l / 2), Math.round(c.y));
    }

    const qt = mov ? Math.floor(t * 8) % 2 : 0;
    for (const r of tiros) g.drawImage(arte.tiro[qt], Math.round(r.x) - 1, Math.round(r.y) - 2);

    if (feixe > 0 && chefeAtivo) {
      const fx = Math.round(nave.x);
      const larg = feixe > 0.15 ? 5 : 3;
      g.fillStyle = "#3ee8e6";
      g.fillRect(fx - Math.floor(larg / 2) - 1, Math.round(chefeY), larg + 2, Math.max(0, Math.round(nave.y - chefeY)));
      g.fillStyle = "#ffffff";
      g.fillRect(fx - 1, Math.round(chefeY), 2, Math.max(0, Math.round(nave.y - chefeY)));
    }

    if (modo !== "morte" && modo !== "fim") {
      const pisca = nave.invuln > 0 && (mov ? Math.floor(t * 14) % 2 === 0 : false);
      if (!pisca) {
        const x = Math.round(nave.x) - 8;
        const y = Math.round(nave.y) - 8;
        const chama = arte.chamas[mov ? Math.floor(t * 12) % 2 : 0];
        g.drawImage(chama, x, y + 16);
        g.drawImage(arte.nave, x, y);
      }
    }

    for (const f of faiscas) {
      g.fillStyle = f.cor;
      const m = f.vida > 0.25 ? 2 : 1;
      g.fillRect(Math.round(f.x), Math.round(f.y), m, m);
    }
    for (const l of letreiros) g.drawImage(textoPronto(l.texto, l.cor), Math.round(l.x), Math.round(l.y));

    g.setTransform(1, 0, 0, 1, 0, 0);
    if (clarao > 0) {
      g.fillStyle = "rgb(255 80 80 / 0.22)";
      g.fillRect(0, 0, L, A);
    }

    // Escudos e sequência
    for (let i = 0; i < MAX_ESCUDOS; i++) g.drawImage(i < escudos ? arte.escudo : arte.escudoVazio, 3 + i * 9, 3);
    const mult = 1 + Math.min(3, Math.floor(sequencia / 3));
    if (mult > 1) g.drawImage(textoPronto(`X${mult}`, "#fdc13f"), 3, 9);

    // Vida do chefe
    if (chefeAtivo && chefeVida > 0) {
      const total = conf().vidaChefe;
      const larg = 11;
      const x0 = Math.round(L / 2 - (total * (larg + 1)) / 2);
      for (let i = 0; i < total; i++) {
        g.fillStyle = "#2a1020";
        g.fillRect(x0 + i * (larg + 1), 4, larg, 4);
        if (i < chefeVida) {
          g.fillStyle = "#ff5f7a";
          g.fillRect(x0 + i * (larg + 1), 4, larg, 3);
        }
      }
    }

    if (banner) {
      const my = Math.round(A * 0.42);
      g.fillStyle = "rgb(3 8 22 / 0.86)";
      g.fillRect(0, my - 14, L, 34);
      g.fillStyle = banner.cor;
      g.fillRect(0, my - 15, L, 1);
      g.fillRect(0, my + 20, L, 1);
      const a = textoPronto(banner.a, banner.cor);
      const b = textoPronto(banner.b, "#ffffff");
      g.drawImage(a, Math.round((L - a.width) / 2), my - 12);
      g.drawImage(b, Math.round((L - b.width) / 2), my + 2);
    }
  }

  function quadro(agora: number) {
    if (!rodando) return;
    quadroId = requestAnimationFrame(quadro);
    const dt = Math.min((agora - antes) / 1000, 0.05);
    antes = agora;
    if (dt <= 0) return;
    if (!espera) simular(dt);
    moverCeu(dt);
    desenhar();
  }

  function rodar() {
    if (rodando) return;
    rodando = true;
    antes = performance.now();
    quadroId = requestAnimationFrame(quadro);
  }
  function parar() {
    rodando = false;
    cancelAnimationFrame(quadroId);
  }

  // Entrada: teclado
  const mapaTecla = (k: string): keyof typeof teclas | null => {
    switch (k) {
      case "ArrowLeft": case "a": case "A": return "esq";
      case "ArrowRight": case "d": case "D": return "dir";
      case "ArrowUp": case "w": case "W": return "cima";
      case "ArrowDown": case "s": case "S": return "baixo";
      default: return null;
    }
  };
  const aoDescer = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest?.("input, textarea, select, dialog")) return;
    if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      pausar();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      e.preventDefault();
      if (!e.repeat) alternarPausa();
      return;
    }
    if (espera) return;
    const k = mapaTecla(e.key);
    if (k) {
      e.preventDefault();
      teclas[k] = true;
    } else if (/^[1-4]$/.test(e.key)) {
      pilotarPara(+e.key - 1);
    } else if (e.key === " ") {
      e.preventDefault();
    }
  };
  const aoSubir = (e: KeyboardEvent) => {
    const k = mapaTecla(e.key);
    if (k) teclas[k] = false;
  };

  // Entrada: toque e mouse
  const pos = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * L, y: ((e.clientY - r.top) / r.height) * A };
  };
  const aoPressionar = (e: PointerEvent) => {
    if (espera || dedo) return;
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    const p = pos(e);
    dedo = { id: e.pointerId, dx: nave.x - p.x, dy: nave.y - p.y, x0: e.clientX, y0: e.clientY, em: performance.now(), moveu: false };
    piloto = -1;
    alvo = null;
  };
  const aoArrastar = (e: PointerEvent) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    if (!dedo.moveu && Math.hypot(e.clientX - dedo.x0, e.clientY - dedo.y0) < 6) return;
    dedo.moveu = true;
    const p = pos(e);
    alvo = { x: p.x + dedo.dx, y: p.y + dedo.dy, vel: VEL_ARRASTO };
  };
  const aoSoltar = (e: PointerEvent) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    const curto = !dedo.moveu && performance.now() - dedo.em < 320;
    dedo = null;
    if (!curto) return;
    // Toque rápido: a nave voa até onde a pessoa tocou.
    const p = pos(e);
    const i = capsulas.findIndex((c) => c.viva && Math.abs(c.x - p.x) < c.l / 2 + 3 && p.y > c.y - 3 && p.y < c.y + c.a + 3);
    if (i >= 0) piloto = i;
    else alvo = { x: p.x, y: p.y, vel: VEL_PILOTO };
  };
  const aoCancelar = (e: PointerEvent) => {
    if (dedo && e.pointerId === dedo.id) dedo = null;
  };

  // Aba oculta: o laço para de vez e nada corre escondido.
  const aoMudarVisibilidade = () => {
    if (document.hidden) {
      pausar();
      parar();
    } else if (espera) {
      rodar();
    }
  };
  const aoPerderFoco = () => pausar();

  function pausar() {
    if (espera || modo === "fim") return;
    abrirPainel({ tipo: "pausa" });
  }
  function alternarPausa() {
    if (modo === "fim") return;
    if (!espera) pausar();
    else if (painelAtual === "pausa") continuar(true);
  }

  function pilotarPara(i: number) {
    if (espera || modo !== "onda" || !capsulas[i]?.viva) return;
    alvo = null;
    piloto = i;
  }

  /** Fecha o painel aberto. Um instante de carência evita fechar sem querer, no meio de um arrasto. */
  function continuar(forcar = false) {
    if (!painelAtual) return;
    if (!forcar && performance.now() - abertoEm < 320) return;
    const era = painelAtual;
    painelAtual = null;
    espera = false;
    antes = performance.now();
    rodar();
    aoMudar({ painel: null });
    // Depois de ler com calma, ninguém merece levar uma pedrada de surpresa.
    nave.invuln = Math.max(nave.invuln, 1.1);
    if (era === "fase") {
      if (fase === FASES.length - 1) terminar("venceu");
      else iniciarFase(fase + 1);
    }
  }

  const obs = new ResizeObserver(medir);

  return {
    iniciar() {
      obs.observe(caixa);
      medir();
      window.addEventListener("keydown", aoDescer);
      window.addEventListener("keyup", aoSubir);
      window.addEventListener("blur", aoPerderFoco);
      document.addEventListener("visibilitychange", aoMudarVisibilidade);
      canvas.addEventListener("pointerdown", aoPressionar);
      canvas.addEventListener("pointermove", aoArrastar);
      canvas.addEventListener("pointerup", aoSoltar);
      canvas.addEventListener("pointercancel", aoCancelar);
      iniciarFase(0);
      rodar();
    },
    continuar,
    pilotarPara,
    pausar,
    encerrar() {
      terminar("saiu");
    },
    destruir() {
      parar();
      obs.disconnect();
      window.removeEventListener("keydown", aoDescer);
      window.removeEventListener("keyup", aoSubir);
      window.removeEventListener("blur", aoPerderFoco);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      canvas.removeEventListener("pointerdown", aoPressionar);
      canvas.removeEventListener("pointermove", aoArrastar);
      canvas.removeEventListener("pointerup", aoSoltar);
      canvas.removeEventListener("pointercancel", aoCancelar);
    },
  };
}
