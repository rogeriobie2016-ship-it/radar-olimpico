"use client";

// Sons do site, sintetizados na hora com Web Audio: nenhum arquivo para baixar.
// O navegador só libera áudio depois de um toque ou tecla, então nada toca antes disso.
import { useCallback, useSyncExternalStore } from "react";

export type NomeSom = "toque" | "surgir" | "virar" | "achou" | "festa" | "acerto" | "erro" | "fim" | "lancar" | "pouso" | "fala" | "passo" | "pisada";

const CHAVE = "radar-som";
const ouvintes = new Set<() => void>();
let ligadoAtual: boolean | null = null;
let ctx: AudioContext | null = null;
let saida: GainNode | null = null;
let ruido: AudioBuffer | null = null;
let ultimoSurgir = 0;

const lerLigado = () => {
  if (ligadoAtual === null) {
    try {
      ligadoAtual = localStorage.getItem(CHAVE) !== "0";
    } catch {
      ligadoAtual = true;
    }
  }
  return ligadoAtual;
};

const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
};

/** Chamado a cada gesto da pessoa: cria o áudio na primeira vez e religa se o navegador suspendeu. */
export function destravarSom() {
  if (!lerLigado()) return;
  const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Classe) return;
  if (!ctx) {
    ctx = new Classe();
    saida = ctx.createGain();
    saida.gain.value = 0.8;
    saida.connect(ctx.destination);
    const n = Math.floor(ctx.sampleRate * 0.8);
    ruido = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

function tom(freq: number, dur: number, vol: number, { tipo = "sine" as OscillatorType, para = 0, atraso = 0 } = {}) {
  if (!ctx || !saida) return;
  const t = ctx.currentTime + atraso;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  if (para) o.frequency.exponentialRampToValueAtTime(para, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(saida);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function sopro(dur: number, vol: number, de: number, ate: number) {
  if (!ctx || !saida || !ruido) return;
  const t = ctx.currentTime;
  const f = ctx.createBufferSource();
  f.buffer = ruido;
  f.loop = true;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.Q.value = 1.1;
  filtro.frequency.setValueAtTime(de, t);
  filtro.frequency.exponentialRampToValueAtTime(ate, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  f.connect(filtro).connect(g).connect(saida);
  f.start(t);
  f.stop(t + dur + 0.02);
}

const arpejo = (notas: number[], passo: number, dur: number, vol: number) => notas.forEach((n, i) => tom(n, dur, vol, { tipo: "triangle", atraso: i * passo }));

// Pentatônica: qualquer sequência soa bem, então rolar a página vira uma pequena melodia que sobe.
const ESCALA = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

export function tocar(nome: NomeSom, ajuste = 1) {
  if (!ctx || ctx.state !== "running" || !lerLigado()) return;
  switch (nome) {
    case "toque":
      tom(540, 0.06, 0.09, { para: 820 });
      break;
    case "surgir": {
      const agora = performance.now();
      if (agora - ultimoSurgir < 130) return;
      ultimoSurgir = agora;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const prog = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0.5;
      const f = ESCALA[Math.round(prog * (ESCALA.length - 1))];
      tom(f, 0.16, 0.05, { tipo: "triangle" });
      tom(f * 2, 0.1, 0.018);
      sopro(0.14, 0.025, 1400, 3200);
      break;
    }
    case "virar":
      sopro(0.2, 0.13, 800, 2800);
      tom(320, 0.14, 0.05, { para: 620, tipo: "triangle" });
      break;
    case "achou":
      arpejo([783.99, 987.77, 1174.66, 1567.98], 0.07, 0.16, 0.08);
      break;
    case "festa":
      arpejo([523.25, 659.25, 783.99, 1046.5], 0.09, 0.2, 0.09);
      tom(1318.51, 0.4, 0.06, { tipo: "triangle", atraso: 0.36 });
      tom(1567.98, 0.4, 0.05, { atraso: 0.36 });
      break;
    case "acerto":
      arpejo([659.25, 987.77], 0.08, 0.16, 0.09);
      break;
    case "erro":
      tom(233, 0.2, 0.1, { tipo: "triangle", para: 165 });
      break;
    case "fim":
      arpejo([392, 523.25, 659.25], 0.11, 0.22, 0.08);
      break;
    case "lancar":
      sopro(0.75, 0.16, 300, 2600);
      tom(170, 0.65, 0.06, { tipo: "triangle", para: 640 });
      break;
    case "pouso":
      sopro(0.14, 0.14, 500, 140);
      tom(150, 0.14, 0.11, { para: 70 });
      break;
    case "fala":
      tom(300 * ajuste * (0.92 + Math.random() * 0.16), 0.04, 0.03, { tipo: "triangle" });
      break;
    case "passo":
      tom(420 * ajuste, 0.07, 0.07, { tipo: "triangle", para: 560 * ajuste });
      break;
    case "pisada":
      sopro(0.07, 0.035, 520, 240);
      break;
  }
}

export function useSom() {
  const ligado = useSyncExternalStore(inscrever, lerLigado, () => true);
  const alternar = useCallback(() => {
    ligadoAtual = !lerLigado();
    try {
      localStorage.setItem(CHAVE, ligadoAtual ? "1" : "0");
    } catch {
      /* sem armazenamento, a escolha vale só nesta visita */
    }
    ouvintes.forEach((o) => o());
    if (ligadoAtual) {
      destravarSom();
      tocar("acerto");
    }
  }, []);
  return { ligado, alternar };
}
