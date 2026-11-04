"use client";

import { Carrossel } from "./Carrossel";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "./L";
import { LogoOlimpiada } from "./LogoOlimpiada";
import { Seta } from "./Seta";
import { Status } from "./Status";
import { ROTULO_NIVEL } from "@/lib/rotulos";
import { calcularStatus, estaAberto, useHoje } from "@/lib/status";

export type Ponto = { id: string; slug: string; nome: string; sigla: string | null; nivel: string; area: string; inicio: string | null; fim: string | null };

const NIVEIS = ["escolar", "regional", "estadual", "nacional", "internacional"];
const RAIOS = [88, 178, 268, 358, 448]; // borda externa de cada nível
const AREAS = ["Matemática", "Ciências da Natureza", "Ciências Humanas e Sociais Aplicadas", "Linguagens e Códigos", "Tecnologia e Computação", "Meio Ambiente", "Educação Financeira e Gestão", "Multidisciplinar"];
const AREA_CURTA: Record<string, string> = {
  "Ciências Humanas e Sociais Aplicadas": "Humanas",
  "Ciências da Natureza": "Natureza",
  "Linguagens e Códigos": "Linguagens",
  "Tecnologia e Computação": "Tecnologia",
  "Educação Financeira e Gestão": "Finanças",
};
const C = 500;
const VOLTA = 9; // segundos da varredura

/** Hash estável: a posição de cada ponto é a mesma no servidor e no aparelho. */
function hash(t: string) {
  let h = 2166136261;
  for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

/** Cada setor é uma área; cada anel, um nível. O ponto cai na interseção. */
function posicionar(p: Ponto) {
  const setor = Math.max(AREAS.indexOf(p.area), 0);
  const largura = 360 / AREAS.length;
  const angulo = setor * largura + 6 + hash(p.id) * (largura - 12);
  const n = NIVEIS.indexOf(p.nivel);
  const interno = n === 0 ? 34 : RAIOS[n - 1] + 18;
  const raio = interno + hash(`${p.id}r`) * (RAIOS[n] - 18 - interno);
  const rad = ((angulo - 90) * Math.PI) / 180;
  return { x: C + raio * Math.cos(rad), y: C + raio * Math.sin(rad), angulo };
}

export function RadarEscopo({ pontos }: { pontos: Ponto[] }) {
  const hoje = useHoje();
  const svg = useRef<SVGSVGElement>(null);
  const [area, setArea] = useState<string | null>(null);

  const dados = useMemo(() => pontos.map((p) => ({ ...p, ...posicionar(p) })), [pontos]);
  const inicial = useMemo(() => {
    const comData = [...pontos].filter((p) => p.fim).sort((a, b) => (b.fim ?? "").localeCompare(a.fim ?? ""));
    return comData[0]?.id ?? pontos[0]?.id;
  }, [pontos]);
  const [selecionado, setSelecionado] = useState(inicial);
  const atual = dados.find((d) => d.id === selecionado) ?? dados[0];

  useEffect(() => {
    const aberto = pontos.filter((p) => estaAberto(calcularStatus(p, hoje))).sort((a, b) => (a.fim ?? "9").localeCompare(b.fim ?? "9"))[0];
    if (aberto) setSelecionado(aberto.id);
  }, [pontos, hoje]);

  const visiveis = area ? dados.filter((d) => d.area === area) : dados;

  // Aponta ou toca: seleciona o ponto mais próximo, sem exigir precisão num alvo de 7 unidades.
  const apontar = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 1000;
    const y = ((e.clientY - r.top) / r.height) * 1000;
    let melhor = null as (typeof dados)[number] | null;
    let dist = 62 ** 2;
    for (const d of visiveis) {
      const v = (d.x - x) ** 2 + (d.y - y) ** 2;
      if (v < dist) {
        dist = v;
        melhor = d;
      }
    }
    if (melhor) setSelecionado(melhor.id);
  };

  const teclado = (e: React.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const ordem = [...visiveis].sort((a, b) => a.angulo - b.angulo);
    const i = ordem.findIndex((d) => d.id === selecionado);
    const passo = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    setSelecionado(ordem[(i + passo + ordem.length) % ordem.length].id);
  };

  const estilo = (s: ReturnType<typeof calcularStatus>["tipo"]) => {
    if (s === "aberto" || s === "fecha") return { r: 12, fill: "var(--marca)" };
    if (s === "encerrado") return { r: 8, fill: "var(--amarelo)" };
    return { r: 6, fill: "var(--turquesa)" };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto aspect-square w-full max-w-[36rem]">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full"><div className="varredura" /></div>
        <svg
          ref={svg}
          viewBox="0 0 1000 1000"
          role="application"
          aria-label="Radar com todas as oportunidades. Use as setas para percorrer."
          tabIndex={0}
          onPointerDown={apontar}
          onPointerMove={(e) => e.pointerType === "mouse" && apontar(e)}
          onKeyDown={teclado}
          className="quadro-radar relative block size-full"
        >
          {RAIOS.map((r, i) => (
            <circle key={r} cx={C} cy={C} r={r} fill="none" stroke={i === 4 ? "var(--turquesa)" : "var(--linha)"} strokeWidth={i === 4 ? 2 : 1.5} />
          ))}
          {AREAS.map((a, i) => {
            const rad = ((i * (360 / AREAS.length) - 90) * Math.PI) / 180;
            return <line key={a} x1={C} y1={C} x2={C + 448 * Math.cos(rad)} y2={C + 448 * Math.sin(rad)} stroke="var(--linha)" strokeWidth="1.5" />;
          })}
          {area && (() => {
            const i = AREAS.indexOf(area);
            const a0 = ((i * 45 - 90) * Math.PI) / 180;
            const a1 = (((i + 1) * 45 - 90) * Math.PI) / 180;
            return <path d={`M${C} ${C} L${C + 448 * Math.cos(a0)} ${C + 448 * Math.sin(a0)} A448 448 0 0 1 ${C + 448 * Math.cos(a1)} ${C + 448 * Math.sin(a1)} Z`} fill="color-mix(in srgb, var(--marca) 12%, transparent)" />;
          })()}
          {dados.map((d) => {
            const st = calcularStatus(d, hoje);
            const e = estilo(st.tipo);
            const fora = area && d.area !== area;
            return (
              <g key={d.id} style={fora ? { opacity: 0.12 } : undefined}>
                {!fora && (st.tipo === "aberto" || st.tipo === "fecha") && <circle className="pulso" cx={d.x} cy={d.y} r={e.r} fill="none" stroke="var(--marca)" strokeWidth="3" />}
                <circle cx={d.x} cy={d.y} r={e.r} fill={e.fill} className={fora ? undefined : "eco"} style={{ animationDelay: `${(d.angulo / 360) * VOLTA - VOLTA}s` }} />
              </g>
            );
          })}
          {atual && (
            <g pointerEvents="none">
              <line x1={C} y1={C} x2={atual.x} y2={atual.y} stroke="#fff" strokeWidth="2" />
              <circle cx={atual.x} cy={atual.y} r="20" fill="none" stroke="#fff" strokeWidth="4" />
            </g>
          )}
        </svg>
      </div>

      {atual && (
        <div aria-live="polite" className="flex min-h-[7.5rem] flex-col gap-2 rounded-2xl bg-fundo-2 p-3">
          <div className="flex items-baseline justify-between gap-3">
            <Status inicio={atual.inicio} fim={atual.fim} />
            <span className="text-sm text-tinta-2">{ROTULO_NIVEL[atual.nivel]}, {AREA_CURTA[atual.area] ?? atual.area}</span>
          </div>
          <Link href={`/oportunidade/${atual.slug}/`} className="flex items-center gap-3 no-underline">
            <LogoOlimpiada id={atual.id} nome={atual.nome} sigla={atual.sigla} className="size-16" />
            <span className="estreito flex-1 text-[1.25rem] leading-[1.08]">{atual.nome}</span>
            <Seta tamanho={24} />
          </Link>
        </div>
      )}

      <Carrossel rotulo="Destacar área" compacto classe="rolagem-x" role="group">
        <button type="button" className="opcao" aria-pressed={!area} onClick={() => setArea(null)}>
          Todas as áreas
        </button>
        {AREAS.map((a) => (
          <button key={a} type="button" className="opcao" aria-pressed={area === a} onClick={() => setArea(area === a ? null : a)}>
            {AREA_CURTA[a] ?? a}
          </button>
        ))}
      </Carrossel>
      <p className="text-sm text-tinta-2">Do centro para a borda: escolar, regional, estadual, nacional e internacional. Cada setor é uma área do conhecimento.</p>
    </div>
  );
}
