"use client";

import { Carrossel } from "./Carrossel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "./L";
import { LogoOlimpiada } from "./LogoOlimpiada";
import { Mascote } from "./Mascote";
import { asset } from "@/lib/base";
import { carimbar, useGuia } from "@/lib/guia";

export type Escondida = { id: string; slug: string; nome: string; sigla: string | null; x: number; y: number; area: string };

const RAIO = 64;

/** Número pseudoaleatório estável, para o céu ser igual no servidor e no aparelho. */
const pr = (i: number) => {
  const v = Math.sin(i * 127.1) * 43758.5453;
  return v - Math.floor(v);
};

function CenaUniverso() {
  const estrelas = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ x: pr(i) * 400, y: pr(i + 300) * 700, r: 0.5 + pr(i + 600) * 1.5, c: ["#fff", "#fdc13f", "#3ee8e6"][i % 3] })), []);
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <radialGradient id="ceu" cx="60%" cy="28%" r="80%">
          <stop offset="0" stopColor="#14407a" />
          <stop offset=".55" stopColor="#0a2350" />
          <stop offset="1" stopColor="#05142a" />
        </radialGradient>
        <radialGradient id="sol" cx="40%" cy="35%">
          <stop offset="0" stopColor="#ffd28a" />
          <stop offset="1" stopColor="#f58a33" />
        </radialGradient>
        <radialGradient id="terra" cx="35%" cy="30%">
          <stop offset="0" stopColor="#5ff5ee" />
          <stop offset="1" stopColor="#00908f" />
        </radialGradient>
      </defs>
      <rect width="400" height="700" fill="url(#ceu)" />
      {estrelas.map((e, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={e.r} fill={e.c} opacity={0.5 + pr(i + 900) * 0.5} />
      ))}
      {/* Constelação */}
      <path className="lg:hidden" d="M36 340L78 302L122 328L150 286M122 328L104 378" stroke="#3ee8e6" strokeWidth="1" opacity=".55" fill="none" />
      {/* Planeta com anéis */}
      <g className="flutua" style={{ transformOrigin: "318px 330px" }}>
        <circle cx="318" cy="330" r="44" fill="url(#sol)" />
        <path d="M282 313q34 14 73 5M277 335q39 17 81 5" stroke="#c9641a" strokeWidth="4" fill="none" opacity=".5" />
        <ellipse cx="318" cy="332" rx="72" ry="15" fill="none" stroke="#fdc13f" strokeWidth="4" transform="rotate(-16 318 332)" />
      </g>
      {/* Planeta azul e lua */}
      <g className="flutua" style={{ animationDelay: "-3s", transformOrigin: "62px 470px" }}>
        <circle cx="62" cy="470" r="44" fill="url(#terra)" />
        <path d="M34 452q16-10 30 0t26 2M28 482q18 8 34-2t26 6" stroke="#b5fff6" strokeWidth="5" fill="none" opacity=".45" />
      </g>
      <g className="gira-lento" style={{ transformOrigin: "62px 470px" }}>
        <circle cx="62" cy="470" r="76" fill="none" stroke="#3ee8e6" strokeWidth="1" strokeDasharray="3 7" opacity=".6" />
        <circle cx="138" cy="470" r="9" fill="#f4fbff" />
      </g>
      {/* Átomo */}
      <g transform="translate(330 400)" fill="none" stroke="#f8a8c8" strokeWidth="2" opacity=".85">
        <g className="gira-lento">
          <ellipse rx="40" ry="14" />
          <ellipse rx="40" ry="14" transform="rotate(60)" />
          <ellipse rx="40" ry="14" transform="rotate(120)" />
        </g>
        <circle r="6" fill="#f8a8c8" stroke="none" />
      </g>
      {/* Folhas e DNA: a natureza também é céu */}
      <g transform="translate(120 410) scale(.8)" fill="#0fa85a">
        <path d="M0 40C-8 10 12-14 40-18C42 12 26 38 0 40Z" />
        <path d="M0 40C14 22 22 8 40 -18" stroke="#05472a" strokeWidth="2" fill="none" />
      </g>
      <g transform="translate(190 470)" fill="none" strokeWidth="3">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M-16 ${i * 24}Q0 ${i * 24 + 12} 16 ${i * 24 + 24}`} stroke="#fdc13f" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M16 ${i * 24}Q0 ${i * 24 + 12} -16 ${i * 24 + 24}`} stroke="#3ee8e6" />
        ))}
      </g>
    </svg>
  );
}

function CenaRaioX() {
  const formulas = [
    ["E = mc²", 34, 90],
    ["a² + b² = c²", 190, 60],
    ["H₂O", 330, 120],
    ["π ≈ 3,14", 40, 300],
    ["F = m · a", 250, 300],
    ["6CO₂ + 6H₂O", 150, 245],
    ["1822", 300, 470],
    ["if (x) { }", 40, 410],
    ["Σ", 210, 400],
    ["DNA", 215, 480],
    ["1888", 40, 560],
    ["∫ f(x) dx", 160, 640],
    ["O que é ciência?", 120, 520],
  ] as const;
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <pattern id="malha" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#7ff5ef" strokeWidth=".6" opacity=".45" />
        </pattern>
      </defs>
      <rect width="400" height="700" fill="#0b5560" />
      <rect width="400" height="700" fill="url(#malha)" />
      <g fill="none" stroke="#c7fffb" strokeWidth="1.5" opacity=".9">
        <circle cx="318" cy="330" r="44" />
        <path d="M274 330H362M318 286V374M286 300Q318 330 350 300M286 360Q318 330 350 360" />
        <ellipse cx="318" cy="332" rx="72" ry="15" transform="rotate(-16 318 332)" />
        <circle cx="62" cy="470" r="44" />
        <path d="M18 470H106M62 426V514" />
        <path d="M330 366v68M296 400h68" />
      </g>
      {formulas.map(([t, x, y]) => (
        <text key={t} x={x} y={y} fill="#fdc13f" fontSize="19" fontWeight="800" fontFamily="var(--font-display)" opacity=".92">
          {t}
        </text>
      ))}
    </svg>
  );
}

export function Expedicao({ escondidas, abertas }: { escondidas: Escondida[]; abertas: number }) {
  const { quem, outro, escolher } = useGuia();
  const palco = useRef<HTMLDivElement>(null);
  const aro = useRef<HTMLDivElement>(null);
  const raio = useRef<HTMLDivElement>(null);
  const alvo = useRef({ x: 0.3, y: 0.53, mexeu: false, arrastando: false });
  const pos = useRef({ x: 0.3, y: 0.53 });
  const [achadas, setAchadas] = useState<string[]>([]);
  const [ultima, setUltima] = useState<Escondida | null>(null);
  const achadasRef = useRef<string[]>([]);
  const [explorando, setExplorando] = useState(false);

  const mover = useCallback((clientX: number, clientY: number) => {
    const r = palco.current?.getBoundingClientRect();
    if (!r) return;
    alvo.current.x = (clientX - r.left) / r.width;
    alvo.current.y = (clientY - r.top) / r.height;
    alvo.current.mexeu = true;
    setExplorando(true);
  }, []);

  // Um só laço de animação move a lente suavemente. Sem toque, ela passeia para mostrar que é viva.
  useEffect(() => {
    const espera = setTimeout(() => setExplorando(true), 4000);
    return () => clearTimeout(espera);
  }, []);

  useEffect(() => {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let q = 0;
    let visivel = true;
    const obs = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    if (palco.current) obs.observe(palco.current);
    const laco = (t: number) => {
      q = requestAnimationFrame(laco);
      if (!visivel || !palco.current) return;
      const a = alvo.current;
      if (!a.mexeu && !reduzir) {
        a.x = 0.3 + Math.sin(t / 2600) * 0.12;
        a.y = 0.53 + Math.cos(t / 1900) * 0.05;
      }
      pos.current.x += (a.x - pos.current.x) * 0.12;
      pos.current.y += (a.y - pos.current.y) * 0.12;
      const L = palco.current.clientWidth;
      const A = palco.current.clientHeight;
      const px = pos.current.x * L;
      const py = pos.current.y * A;
      if (raio.current) {
        raio.current.style.setProperty("--x", `${px}px`);
        raio.current.style.setProperty("--y", `${py}px`);
      }
      if (aro.current) aro.current.style.transform = `translate(${px}px, ${py}px)`;
      // Só conta descoberta quando a pessoa está de fato procurando.
      if (a.mexeu) {
        for (const e of escondidas) {
          if (achadasRef.current.includes(e.id)) continue;
          if (Math.hypot((e.x / 100) * L - px, (e.y / 100) * A - py) < RAIO * 0.78) {
            achadasRef.current = [...achadasRef.current, e.id];
            setAchadas(achadasRef.current);
            setUltima(e);
            if (achadasRef.current.length === escondidas.length) carimbar("lupa");
          }
        }
      }
    };
    q = requestAnimationFrame(laco);
    return () => {
      cancelAnimationFrame(q);
      obs.disconnect();
    };
  }, [escondidas]);

  const total = escondidas.length;
  const falta = total - achadas.length;
  const fala = ultima
    ? falta === 0
      ? "Você achou todas! Olho de cientista. Agora monta a sua Escada."
      : `Achou: ${ultima.sigla && ultima.sigla.length <= 9 ? ultima.sigla : ultima.nome}! Faltam ${falta}.`
    : `Arrasta a lupa! Tem ${total} olimpíadas escondidas no universo.`;

  return (
    <section aria-label="Abertura: explore o universo com a lupa">
      <div
        ref={palco}
        className="cena-lupa h-[calc(100svh-7.4rem)] min-h-[36rem] max-h-[56rem] lg:h-[calc(100svh-3.5rem)]"
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" || alvo.current.arrastando) mover(e.clientX, e.clientY);
        }}
        onPointerDown={(e) => mover(e.clientX, e.clientY)}
      >
        <CenaUniverso />

        <div ref={raio} className="camada-raiox" style={{ "--r": `${RAIO}px` } as React.CSSProperties}>
          <CenaRaioX />
          {explorando && escondidas.map((e) => (
            <span key={e.id} className="achado" style={{ left: `${e.x}%`, top: `${e.y}%` }}>
              <LogoOlimpiada id={e.id} nome={e.nome} sigla={e.sigla} className="size-16" />
            </span>
          ))}
        </div>

        {/* Mascotes: tocar troca quem guia */}
        <button type="button" onClick={() => escolher(outro)} aria-label="Trocar de guia" className="absolute bottom-[6.6rem] right-1 z-10 w-[7.25rem] transition-transform duration-300 hover:-translate-y-2 sm:w-44 lg:bottom-6 lg:right-10 lg:w-64">
          <Mascote quem={quem} pose={achadas.length ? "comemora" : "lupa"} falando prioridade />
        </button>
        <div className="flutua pointer-events-none absolute bottom-[8.6rem] left-1 z-[5] w-[5.5rem] sm:w-32 lg:bottom-16 lg:left-auto lg:right-[22rem] lg:w-44" style={{ animationDelay: "-2s" }}>
          <Mascote quem={outro} pose={outro === "menino" ? "foguete" : "tubo"} prioridade />
        </div>

        {/* Texto da abertura */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2.5 p-4 lg:p-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/joc/logo.webp")} alt="Juventude Olímpica do Conhecimento" width={560} height={348} fetchPriority="high" className="h-auto w-28 lg:w-48" />
          </div>
          <h1 className="max-w-3xl drop-shadow-[0_3px_0_rgb(0_0_0_/_35%)]">
            Radar <span className="text-amarelo">Olímpico</span>
          </h1>
          <p className="max-w-md font-bold leading-snug drop-shadow-[0_2px_2px_rgb(0_0_0_/_60%)]">Espaço, natureza, números, história, código. Toda olimpíada do Ceará e do Brasil, num só universo. Qual é a sua?</p>
        </div>

        {/* Lente: arrastável */}
        <div ref={aro} className="lupa-aro z-30" aria-hidden="true">
          <div
            className="lupa-pega"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              alvo.current.arrastando = true;
              mover(e.clientX, e.clientY);
            }}
            onPointerUp={() => (alvo.current.arrastando = false)}
            onPointerCancel={() => (alvo.current.arrastando = false)}
          />
          <svg width="290" height="290" viewBox="-145 -145 290 290" className="pointer-events-none absolute -left-[145px] -top-[145px] overflow-visible">
            <circle r={RAIO + 2} fill="none" stroke="#fdc13f" strokeWidth="6" />
            <circle r={RAIO - 2} fill="none" stroke="#fff" strokeWidth="1.5" opacity=".65" />
            <path d="M-38 -40Q-24 -54 -6 -56" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".55" />
            <path d="M48 48L82 82" stroke="#f58a33" strokeWidth="12" strokeLinecap="round" />
            <path d="M46 46L54 54" stroke="#fdc13f" strokeWidth="8" />
          </svg>
        </div>

        {/* Fala e ações */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2.5 p-4 lg:max-w-xl lg:p-10">
          <p role="status" className="balao max-w-[15rem] self-start !text-[0.875rem] lg:max-w-[18rem]">
            {fala}
          </p>
          <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex [&_.btn]:whitespace-nowrap max-sm:[&_.btn]:px-3.5">
            <Link href="/escada/" className="btn btn-primario">
              Descobrir a minha
            </Link>
            <Link href="/radar/?abertas=1" className="btn btn-secundario">
              {abertas} {abertas === 1 ? "aberta" : "abertas"} agora
            </Link>
          </div>
        </div>
      </div>

      {achadas.length > 0 && (
        <Carrossel rotulo="Olimpíadas encontradas" compacto classe="rolagem-x !mx-0 border-b border-linha bg-fundo-2 py-2.5">
          {achadas.map((id) => {
            const e = escondidas.find((x) => x.id === id)!;
            return (
              <span key={id}>
                <Link href={`/oportunidade/${e.slug}/`} className="achado-link block" aria-label={`Ver ${e.nome}`}>
                  <LogoOlimpiada id={e.id} nome={e.nome} sigla={e.sigla} className="h-14 w-20" />
                </Link>
              </span>
            );
          })}
        </Carrossel>
      )}
    </section>
  );
}
