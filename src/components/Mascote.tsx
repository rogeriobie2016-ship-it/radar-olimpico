// Os dois estudantes do logo JOC. As camadas são recortadas da ilustração oficial (scripts/recortar_mascotes.py),
// então rosto, cabelo, óculos e jaleco são os do logo. O movimento vem de girar cabeça e mão, como em animação de recorte.
import type { CSSProperties, ReactNode } from "react";
import { asset } from "@/lib/base";
import { BONECOS } from "@/lib/bonecos";

export type Quem = "menino" | "menina";
export type Pose = "parado" | "acena" | "aponta" | "pensa" | "comemora" | "lupa" | "foguete" | "tubo" | "folha" | "triste";

const LARANJA = "#f58a33";
const AMARELO = "#fdc13f";
const TURQUESA = "#00c9c8";

// Giro em graus. Positivo vai para a cabeça do personagem no braço e para a frente na cabeça.
const POSES: Record<Pose, { braco: number; cabeca: number; objeto?: "lupa" | "foguete" | "folha" }> = {
  parado: { braco: 0, cabeca: 0 },
  tubo: { braco: 0, cabeca: 0 },
  acena: { braco: 0, cabeca: 2 },
  aponta: { braco: -12, cabeca: -2 },
  pensa: { braco: 9, cabeca: 5 },
  comemora: { braco: 0, cabeca: -3 },
  lupa: { braco: 0, cabeca: 2, objeto: "lupa" },
  foguete: { braco: -6, cabeca: -2, objeto: "foguete" },
  folha: { braco: 0, cabeca: 2, objeto: "folha" },
  triste: { braco: -8, cabeca: 7 },
};

function Lupa() {
  return (
    <g>
      <path d="M0 40L18 -92" stroke="#fff" strokeWidth="46" strokeLinecap="round" />
      <circle cx="30" cy="-170" r="94" fill="#fff" />
      <path d="M0 40L16 -86" stroke={LARANJA} strokeWidth="24" strokeLinecap="round" />
      <circle cx="30" cy="-170" r="70" fill="#bff5f4" fillOpacity=".7" stroke={AMARELO} strokeWidth="20" />
      <path d="M-4 -192Q6 -216 34 -218" stroke="#fff" strokeWidth="11" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Foguete() {
  const corpo = "M20 -270C70 -220 78 -130 60 -40H-20C-38 -130 -30 -220 20 -270Z";
  return (
    <g>
      <path d={corpo} fill="#fff" stroke="#fff" strokeWidth="44" strokeLinejoin="round" />
      <path d="M-22 -80L-70 -6L-14 -28ZM62 -80L110 -6L54 -28Z" fill={LARANJA} stroke="#fff" strokeWidth="26" strokeLinejoin="round" paintOrder="stroke" />
      <path d={corpo} fill="#f4fbff" stroke="#c7ced2" strokeWidth="3" />
      <path d="M20 -270C42 -248 56 -222 64 -192H-24C-16 -222 -2 -248 20 -270Z" fill={LARANJA} />
      <circle cx="20" cy="-140" r="26" fill={TURQUESA} stroke="#0b8f8c" strokeWidth="6" />
    </g>
  );
}

function FolhaObjeto() {
  return (
    <g>
      <path d="M0 30L14 -60" stroke="#fff" strokeWidth="34" strokeLinecap="round" />
      <path d="M22 -240C100 -180 96 -100 16 -56C-60 -104 -58 -184 22 -240Z" fill={AMARELO} stroke="#fff" strokeWidth="26" strokeLinejoin="round" paintOrder="stroke" />
      <path d="M0 30L18 -56M20 -220L18 -66M18 -170L54 -196M18 -130L-16 -158M18 -100L48 -126" stroke={LARANJA} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
  );
}

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function Camada({ quem, nome, cx, largura, altura, prioridade }: { quem: Quem; nome: "corpo" | "cabeca" | "braco" | "livre"; cx: number; largura: number; altura: number; prioridade?: boolean }) {
  const c = BONECOS[quem].camadas[nome];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`/joc/boneco/${quem}-${nome}.webp`)}
      alt=""
      draggable={false}
      loading={prioridade ? "eager" : "lazy"}
      fetchPriority={prioridade ? "high" : undefined}
      decoding={prioridade ? "sync" : "async"}
      width={Math.round(c.w / 2)}
      height={Math.round(c.h / 2)}
      className="absolute max-w-none select-none"
      style={{ left: pct(c.x - cx, largura), top: pct(c.y, altura), width: pct(c.w, largura), height: pct(c.h, altura) }}
    />
  );
}

/** Peça que gira em volta de um pivô, medido nas coordenadas da ilustração. */
function Peca({ pivo, cx, largura, altura, giro, classe, children }: { pivo: readonly number[]; cx: number; largura: number; altura: number; giro?: number; classe?: string; children: ReactNode }) {
  const origem = `${pct(pivo[0] - cx, largura)} ${pct(pivo[1], altura)}`;
  return (
    <span className="absolute inset-0 block" style={{ transformOrigin: origem, transform: giro ? `rotate(${giro}deg)` : undefined, transition: "transform 450ms cubic-bezier(.3,1.5,.5,1)" }}>
      <span className={`absolute inset-0 block ${classe ?? ""}`} style={{ transformOrigin: origem }}>
        {children}
      </span>
    </span>
  );
}

export function Mascote({ quem, pose = "parado", falando = false, className, style, olhar = 0, prioridade = false }: { quem: Quem; pose?: Pose; falando?: boolean; className?: string; style?: CSSProperties; olhar?: number; prioridade?: boolean }) {
  const d = BONECOS[quem];
  const [cx, , largura, altura] = d.caixa;
  const p = POSES[pose];
  // No desenho o menino ergue a mão à esquerda e a menina à direita: o mesmo gesto tem sinais opostos.
  const lado = quem === "menino" ? 1 : -1;
  const objeto = p.objeto && !(quem === "menina" && p.objeto === "folha") ? p.objeto : undefined;
  const balanca = pose === "acena" || pose === "comemora";
  const caixa = `${cx} 0 ${largura} ${altura}`;
  const [mx, my] = d.maoPivo;
  const triste = pose === "triste";

  return (
    <span className={`m-boneco relative block ${className ?? ""}`} style={{ aspectRatio: `${largura} / ${altura}`, ...style }} aria-hidden="true">
      <span className={`absolute inset-0 block ${pose === "comemora" ? "m-pula" : "m-respira"}`} style={{ transformOrigin: "50% 100%" }}>
        <Camada quem={quem} nome="corpo" cx={cx} largura={largura} altura={altura} prioridade={prioridade} />

        <Peca pivo={d.bracoPivo} cx={cx} largura={largura} altura={altura} giro={p.braco * lado} classe={balanca ? "m-aceno" : undefined}>
          {objeto && (
            <svg viewBox={caixa} className="absolute inset-0 size-full overflow-visible">
              <g transform={`translate(${mx} ${my})`}>{objeto === "lupa" ? <Lupa /> : objeto === "foguete" ? <Foguete /> : <FolhaObjeto />}</g>
            </svg>
          )}
          <Camada quem={quem} nome={objeto ? "livre" : "braco"} cx={cx} largura={largura} altura={altura} prioridade={prioridade} />
        </Peca>

        <Peca pivo={d.cabecaPivo} cx={cx} largura={largura} altura={altura} giro={(p.cabeca + olhar) * lado} classe="m-cabeca">
          <Camada quem={quem} nome="cabeca" cx={cx} largura={largura} altura={altura} prioridade={prioridade} />
          <svg viewBox={caixa} className="absolute inset-0 size-full overflow-visible">
            {/* Piscar: pálpebra na cor da pele, por cima dos olhos do desenho */}
            <g className="m-palpebra">
              {d.olhos.map(([x, y, rx, ry]) => (
                <ellipse key={x} cx={x} cy={y} rx={rx + 3} ry={ry + 3} fill={d.pele} />
              ))}
            </g>
            {falando && !triste && <ellipse className="m-boca" cx={d.boca[0]} cy={d.boca[1]} rx={d.boca[2]} ry={d.boca[3]} fill="#5a1f22" transform={`rotate(${d.boca[4]} ${d.boca[0]} ${d.boca[1]})`} />}
            {triste && (
              <>
                <ellipse cx={d.boca[0]} cy={d.boca[1] - 22} rx={d.boca[2] + 22} ry={d.boca[3] + 16} fill={d.pele} />
                <path d={`M${d.boca[0] - 18} ${d.boca[1] - 14}q18 -14 36 0`} stroke="#5a1f22" strokeWidth="6" fill="none" strokeLinecap="round" />
              </>
            )}
          </svg>
        </Peca>

        {pose === "comemora" && (
          <svg viewBox={caixa} className="absolute inset-0 size-full overflow-visible">
            {[[0.04, 0.34, AMARELO, 0], [0.92, 0.22, TURQUESA, 240], [0.86, 0.5, LARANJA, 480]].map(([fx, fy, cor, atraso]) => (
              <path key={String(fx)} className="m-brilho" style={{ animationDelay: `${atraso}ms` }} transform={`translate(${cx + largura * Number(fx)} ${altura * Number(fy)})`} d="M0 -46Q6 -8 46 0Q6 8 0 46Q-6 8 -46 0Q-6 -8 0 -46Z" fill={String(cor)} />
            ))}
          </svg>
        )}
        {pose === "pensa" && (
          <svg viewBox={caixa} className="absolute inset-0 size-full overflow-visible">
            <text className="m-duvida" x={cx + largura * (quem === "menino" ? 0.86 : 0.1)} y={150} fontSize="170" fontWeight="900" fill={AMARELO} stroke="#fff" strokeWidth="18" paintOrder="stroke" fontFamily="var(--fonte-titulo)">
              ?
            </text>
          </svg>
        )}
      </span>
    </span>
  );
}
