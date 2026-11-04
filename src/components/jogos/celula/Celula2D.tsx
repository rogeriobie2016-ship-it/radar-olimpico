"use client";

import { Fala } from "@/components/Fala";
import Link from "@/components/L";
import { alvosAtivos, desafioAtual, missaoAtual, MISSOES, passoAtual, type IdMissao, type Partida } from "@/lib/estudo/celula";
import { Placar } from "../Molde";
import { CORES_ALVO } from "./mapa";
import { PainelAbertura, PainelDesafio } from "./Paineis";

/** Mapa da célula em SVG, para quem não tem WebGL. A organela da missão atual fica acesa. */
function Mapa({ ativa }: { ativa: IdMissao }) {
  const op = (id: IdMissao | IdMissao[]) => ((Array.isArray(id) ? id.includes(ativa) : id === ativa) ? 1 : 0.42);
  return (
    <svg viewBox="0 0 360 240" className="nave-mapa" role="img" aria-label="Mapa da célula vegetal, com a organela da missão atual em destaque">
      <defs>
        <radialGradient id="celula2d" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#0c3a4d" />
          <stop offset="100%" stopColor="#04151f" />
        </radialGradient>
        <radialGradient id="nucleo2d" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#8d7bff" />
          <stop offset="100%" stopColor="#25207a" />
        </radialGradient>
        <filter id="brilho2d" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="8" y="10" width="344" height="220" rx="46" fill="#123d2a" stroke="#2c7a4e" strokeWidth="3" />
      <rect x="17" y="19" width="326" height="202" rx="38" fill="url(#celula2d)" stroke="#7a8cff" strokeWidth="3" opacity={ativa === "membrana" ? 1 : 0.65} filter={ativa === "membrana" ? "url(#brilho2d)" : undefined} />
      <text x="180" y="34" textAnchor="middle" className="nave-mapa-t">Membrana e parede</text>
      <ellipse cx="80" cy="150" rx="46" ry="46" fill="#14505a" stroke="#3df5e0" strokeWidth="1.5" opacity="0.6" />
      <text x="80" y="154" textAnchor="middle" className="nave-mapa-t">Vacúolo</text>
      <g opacity={op("nucleo")} filter={ativa === "nucleo" ? "url(#brilho2d)" : undefined}>
        <circle cx="178" cy="118" r="42" fill="url(#nucleo2d)" stroke="#41dcff" strokeWidth="2.5" />
        <circle cx="190" cy="108" r="11" fill="#ff9a2e" />
        <text x="172" y="142" textAnchor="middle" className="nave-mapa-t">Núcleo</text>
      </g>
      <g opacity={op("reticulo")} filter={ativa === "reticulo" ? "url(#brilho2d)" : undefined} fill="none" stroke="#4f9dff" strokeWidth="4" strokeLinecap="round">
        <path d="M222 86c14 8 20 22 21 38" />
        <path d="M232 76c18 11 26 28 26 50" />
        <path d="M244 66c20 15 30 34 30 62" />
        <text x="272" y="60" textAnchor="middle" className="nave-mapa-t" stroke="none" fill="currentColor">Retículo</text>
      </g>
      <g opacity={op("ribossomo")} filter={ativa === "ribossomo" ? "url(#brilho2d)" : undefined} fill="#ffb43a">
        {[[150, 186], [162, 192], [175, 196], [188, 197], [201, 194], [214, 189]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.5" />)}
        <text x="182" y="214" textAnchor="middle" className="nave-mapa-t" fill="currentColor">Ribossomos</text>
      </g>
      <g opacity={op("cloroplasto")} filter={ativa === "cloroplasto" ? "url(#brilho2d)" : undefined}>
        <ellipse cx="96" cy="72" rx="36" ry="19" fill="#0e6a2a" stroke="#4dff8a" strokeWidth="2" />
        {[72, 88, 104, 120].map((x) => <rect key={x} x={x - 3} y="62" width="6" height="20" rx="2" fill="#4dff8a" />)}
        <text x="96" y="104" textAnchor="middle" className="nave-mapa-t">Cloroplasto</text>
      </g>
      <g opacity={op(["mitocondria", "cadeia"])} filter={ativa === "mitocondria" || ativa === "cadeia" ? "url(#brilho2d)" : undefined}>
        <rect x="252" y="150" width="76" height="34" rx="17" fill="#7a2404" stroke="#ff8a4a" strokeWidth="2" />
        <path d="M262 180v-14M274 154v14M286 180v-14M298 154v14M310 180v-14" stroke="#ffb060" strokeWidth="3" strokeLinecap="round" />
        <text x="290" y="200" textAnchor="middle" className="nave-mapa-t">Mitocôndria</text>
      </g>
    </svg>
  );
}

export function Celula2D({ partida, aviso, aoTocar, aoChegar, aoComecar, aoResponder, aoContinuar, fala }: { partida: Partida; aviso: string; aoTocar: (id: string) => void; aoChegar: () => void; aoComecar: () => void; aoResponder: (i: number) => { certa: boolean; encerrou: boolean }; aoContinuar: () => void; fala: string }) {
  const m = missaoAtual(partida);
  const d = desafioAtual(partida);
  const total = MISSOES.length;
  return (
    <div className="nave-2d">
      <div className="nave-placar nave-placar-2d">
        <Placar esquerda={`Missão ${partida.m + 1} de ${total}`} direita={partida.pontos} />
      </div>
      {aviso && <p className="nave-aviso" role="status">{aviso}</p>}
      <Mapa ativa={m.id} />
      {partida.etapa === "viagem" && (
        <div className="nave-2d-bloco">
          {fala && <Fala texto={fala} pose="aponta" tamanho={52} />}
          <button type="button" className="nave-acao" onClick={aoChegar}>Ir até: {m.organela}</button>
        </div>
      )}
      {partida.etapa === "abertura" && <PainelAbertura key={m.id} m={m} indice={partida.m} total={total} aoComecar={aoComecar} lado={false} />}
      {partida.etapa === "alvos" && (
        <div className="nave-2d-bloco">
          <p className="nave-pedido nave-pedido-2d">{passoAtual(partida).pedido}</p>
          {fala && <Fala texto={fala} pose="aponta" tamanho={52} />}
          <div className="nave-2d-alvos">
            {alvosAtivos(partida).map((a) => (
              <button key={a.id} type="button" className="nave-2d-alvo" style={{ "--cor": CORES_ALVO[a.cor] } as React.CSSProperties} onClick={() => aoTocar(a.id)} data-som="nada">
                {a.rotulo}
              </button>
            ))}
          </div>
        </div>
      )}
      {partida.etapa === "desafio" && d && <PainelDesafio key={d.id} d={d} indice={partida.d} total={partida.desafios[partida.m].length} aoResponder={aoResponder} aoContinuar={aoContinuar} lado={false} />}
      <Link href="/jogos/" className="nave-botao nave-sair-2d">Sair</Link>
    </div>
  );
}
