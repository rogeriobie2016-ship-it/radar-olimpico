"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import { Placar, type AoTerminar } from "./Molde";

const G = 9.8;
const TIROS = 6;
const MUNDO = 260; // metros visíveis

type Rastro = { x: number; y: number }[];

function pontuacao(erro: number) {
  if (erro <= 2) return 100;
  if (erro <= 5) return 70;
  if (erro <= 10) return 40;
  if (erro <= 20) return 15;
  return 0;
}

export default function Lancamento({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [angulo, setAngulo] = useState(45);
  const [velocidade, setVelocidade] = useState(30);
  const [tiro, setTiro] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [voando, setVoando] = useState(false);
  const [msg, setMsg] = useState("Sem vento, o maior alcance acontece perto de 45 graus.");
  const alvos = useRef(Array.from({ length: TIROS }, (_, i) => 50 + i * 26 + Math.random() * 24));
  const ventos = useRef(Array.from({ length: TIROS }, (_, i) => (i < 2 ? 0 : (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * (i * 0.25)))));
  const rastros = useRef<Rastro[]>([]);
  const atual = useRef<Rastro>([]);
  const quadro = useRef(0);

  const alvo = alvos.current[Math.min(tiro, TIROS - 1)];
  const vento = ventos.current[Math.min(tiro, TIROS - 1)];

  const desenhar = useCallback(
    (fogo?: { x: number; y: number }) => {
      const c = canvas.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const L = c.clientWidth;
      const A = c.clientHeight;
      if (c.width !== L * dpr) {
        c.width = L * dpr;
        c.height = A * dpr;
      }
      const g = c.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, L, A);
      const esc = (L - 32) / MUNDO;
      const chao = A - 34;
      const X = (m: number) => 16 + m * esc;
      const Y = (m: number) => chao - m * esc;

      // Régua do solo, de 50 em 50 metros.
      g.strokeStyle = "#2c5f82";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, chao);
      g.lineTo(L, chao);
      g.stroke();
      g.fillStyle = "#a9c6d8";
      g.font = "11px system-ui";
      for (let m = 0; m <= MUNDO; m += 50) {
        g.fillRect(X(m), chao, 1, 6);
        g.fillText(`${m}`, X(m) + 3, chao + 16);
      }

      // Alvo: faixas de 20, 10, 5 e 2 metros.
      [[20, "#5a3312"], [10, "#8a4f16"], [5, "#c76f1e"], [2, "#f58a33"]].forEach(([r, cor]) => {
        g.fillStyle = cor as string;
        g.fillRect(X(alvo - (r as number)), chao - 3, (r as number) * 2 * esc, 6);
      });
      g.fillStyle = "#f4fbff";
      g.fillRect(X(alvo) - 0.5, chao - 34, 1.5, 34);

      // Tiros anteriores, apagados.
      g.strokeStyle = "#2c5f82";
      rastros.current.forEach((r) => {
        g.beginPath();
        r.forEach((p, i) => (i ? g.lineTo(X(p.x), Y(p.y)) : g.moveTo(X(p.x), Y(p.y))));
        g.stroke();
      });

      if (fogo) {
        g.strokeStyle = "#f58a33";
        g.lineWidth = 2;
        g.beginPath();
        atual.current.forEach((p, i) => (i ? g.lineTo(X(p.x), Y(p.y)) : g.moveTo(X(p.x), Y(p.y))));
        g.stroke();
        g.fillStyle = "#f4fbff";
        g.beginPath();
        g.arc(X(fogo.x), Y(fogo.y), 4, 0, 7);
        g.fill();
      } else {
        // Direção da mira: mostra o começo do voo, nunca o ponto de queda.
        const rad = (angulo * Math.PI) / 180;
        g.strokeStyle = "#f58a33";
        g.lineWidth = 2;
        g.setLineDash([5, 5]);
        g.beginPath();
        g.moveTo(X(0), Y(0));
        const comp = velocidade * 1.6;
        g.lineTo(X(comp * Math.cos(rad)), Y(comp * Math.sin(rad)));
        g.stroke();
        g.setLineDash([]);
      }
    },
    [alvo, angulo, velocidade],
  );

  useEffect(() => {
    if (!voando) desenhar();
    const r = () => !voando && desenhar();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [desenhar, voando]);

  useEffect(() => () => cancelAnimationFrame(quadro.current), []);

  const lancar = () => {
    if (voando) return;
    setVoando(true);
    const rad = (angulo * Math.PI) / 180;
    let vx = velocidade * Math.cos(rad);
    const vy0 = velocidade * Math.sin(rad);
    let x = 0;
    let y = 0;
    let t = 0;
    atual.current = [];
    const v = vento;
    let antes = performance.now();
    const passo = (agora: number) => {
      const dt = Math.min((agora - antes) / 1000, 0.05) * 2.4;
      antes = agora;
      t += dt;
      vx += v * dt;
      x += vx * dt;
      y = vy0 * t - (G * t * t) / 2;
      if (y <= 0 && t > 0.05) {
        const queda = x;
        const erro = Math.abs(queda - alvo);
        const ganho = pontuacao(erro);
        rastros.current.push(atual.current);
        desenhar({ x: queda, y: 0 });
        const total = pontos + ganho;
        setPontos(total);
        setMsg(`Alcance de ${queda.toFixed(1)} m, a ${erro.toFixed(1)} m do alvo. +${ganho} pontos.`);
        setVoando(false);
        if (tiro + 1 >= TIROS) {
          setTimeout(() => aoTerminar(total, `Alcance depende do ângulo, da velocidade e da resistência do ar. Na OBAFOG, o foguete é de verdade, e o objetivo é o maior alcance.`), 1100);
        }
        setTiro((n) => n + 1);
        return;
      }
      atual.current.push({ x, y });
      desenhar({ x, y });
      quadro.current = requestAnimationFrame(passo);
    };
    quadro.current = requestAnimationFrame(passo);
  };

  // Arrastar no palco mira e define a força, como puxar um elástico.
  const mirar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (voando || e.buttons === 0) return;
    const r = canvas.current!.getBoundingClientRect();
    const dx = e.clientX - r.left - 16;
    const dy = r.height - 34 - (e.clientY - r.top);
    if (dx <= 0 || dy <= 0) return;
    setAngulo(Math.max(5, Math.min(85, Math.round((Math.atan2(dy, dx) * 180) / Math.PI))));
    setVelocidade(Math.max(10, Math.min(55, Math.round((Math.hypot(dx, dy) / r.width) * 70))));
  };

  const acabou = tiro >= TIROS;

  return (
    <>
      <Placar esquerda={`Lançamento ${Math.min(tiro + 1, TIROS)} de ${TIROS}`} direita={pontos} />
      <canvas ref={canvas} onPointerDown={mirar} onPointerMove={mirar} aria-label="Campo de lançamento" className="h-64 w-full touch-none sm:h-80" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
        <p className="num flex justify-between text-[0.9375rem]">
          <span>Alvo a <strong>{alvo.toFixed(0)} m</strong></span>
          <span>{vento === 0 ? "Sem vento" : `Vento ${vento > 0 ? "a favor" : "contra"}, ${Math.abs(vento).toFixed(1)} m/s²`}</span>
        </p>
        <label className="text-[0.9375rem]">
          <span className="num flex justify-between"><span>Ângulo</span><strong>{angulo}°</strong></span>
          <input type="range" min={5} max={85} value={angulo} onChange={(e) => setAngulo(+e.target.value)} className="regua-jogo" disabled={voando} />
        </label>
        <label className="text-[0.9375rem]">
          <span className="num flex justify-between"><span>Velocidade</span><strong>{velocidade} m/s</strong></span>
          <input type="range" min={10} max={55} value={velocidade} onChange={(e) => setVelocidade(+e.target.value)} className="regua-jogo" disabled={voando} />
        </label>
        <Fala texto={msg} pose={voando ? "foguete" : "pensa"} tamanho={60} />
        <button type="button" onClick={lancar} disabled={voando || acabou} className="tecla tecla-acesa mt-auto min-h-14 text-lg">
          {voando ? "Em voo" : "Lançar"}
        </button>
      </div>
    </>
  );
}
