"use client";

// Os dois cientistas do logo JOC, redesenhados em vetor para poderem se mexer: acenar, falar, piscar, comemorar.
// Cores e traços seguem a ilustração oficial. O logo original continua intacto em /public/joc/logo.webp.
import type { CSSProperties, ReactNode } from "react";

export type Quem = "menino" | "menina";
export type Pose = "parado" | "acena" | "aponta" | "pensa" | "comemora" | "lupa" | "foguete" | "tubo" | "folha" | "triste";

const LUVA = "#0fcfcb";
const JALECO = "#ffffff";
const LINHA = "#b8bec2";
const VERDE = "#0fa85a";
const LARANJA = "#f58a33";

// Ângulo de cada braço por pose: [braço à esquerda da tela, braço à direita da tela]. Zero é pendurado.
const BRACOS: Record<Pose, [number, number]> = {
  parado: [8, -8],
  acena: [8, -150],
  aponta: [8, -92],
  pensa: [8, -128],
  comemora: [150, -150],
  lupa: [128, -8],
  foguete: [8, -142],
  tubo: [136, -8],
  folha: [8, -128],
  triste: [4, -4],
};

function Lupa() {
  return (
    <g transform="translate(0 88) rotate(-20)">
      <rect x="-5" y="-4" width="10" height="46" rx="5" fill={LARANJA} />
      <circle cx="0" cy="-30" r="30" fill="#bff5f4" fillOpacity=".55" stroke="#fdc13f" strokeWidth="8" />
      <path d="M-14 -40 Q-8 -50 4 -50" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Tubo({ cor = "#6cc24a" }: { cor?: string }) {
  return (
    <g transform="translate(0 76) rotate(16)">
      <rect x="-9" y="-48" width="18" height="60" rx="9" fill="#d8f6fb" stroke="#8fdfee" strokeWidth="2.5" />
      <path d="M-7 -14h14v18a7 7 0 0 1-14 0z" fill={cor} />
      <rect x="-13" y="-52" width="26" height="7" rx="3.5" fill="#8fdfee" />
    </g>
  );
}

function Folha() {
  return (
    <g transform="translate(0 72) rotate(30)">
      <rect x="-2" y="-28" width="4" height="34" fill="#a8adb0" />
      <path d="M0 -62C22 -48 22 -30 0 -22C-22 -30 -22 -48 0 -62Z" fill="#fdc13f" />
      <path d="M0 -58V-24M0 -46l9 -6M0 -38l-9 -6M0 -32l9 -6" stroke={LARANJA} strokeWidth="1.8" fill="none" />
    </g>
  );
}

function Foguete() {
  return (
    <g transform="translate(0 72) rotate(180)">
      <path d="M0 -44C16 -28 16 -6 11 12H-11C-16 -6 -16 -28 0 -44Z" fill="#fff" stroke={LINHA} strokeWidth="2" />
      <circle cy="-16" r="7" fill={LUVA} stroke="#0b8f8c" strokeWidth="2" />
      <path d="M-11 2L-22 20L-9 14ZM11 2L22 20L9 14Z" fill={LARANJA} />
      <path className="m-chama" d="M-7 14Q0 40 7 14Z" fill="#fdc13f" />
    </g>
  );
}

function Braco({ x, angulo, lado, prop, classe }: { x: number; angulo: number; lado: 1 | -1; prop?: ReactNode; classe?: string }) {
  const estilo: CSSProperties = { transform: `rotate(${angulo}deg)`, transformOrigin: `${x}px 176px`, transition: "transform 450ms cubic-bezier(.3,1.5,.5,1)" };
  return (
    <g style={estilo}>
      <g className={classe} style={{ transformOrigin: `${x}px 176px` }}>
        <g transform={`translate(${x} 176)`}>
          {prop}
          <path d={`M${-15 * lado} -6Q${-18 * lado} 34 ${-11 * lado} 66L${12 * lado} 66Q${18 * lado} 30 ${15 * lado} -6Z`} fill={JALECO} stroke={LINHA} strokeWidth="1.6" />
          <path d={`M${-11 * lado} 62Q0 58 ${12 * lado} 62`} stroke={LINHA} strokeWidth="1.4" fill="none" />
          <path d={`M${-11 * lado} 64L${11 * lado} 64L${13 * lado} 84Q0 96 ${-13 * lado} 84Z`} fill={LUVA} />
          <path d={`M${11 * lado} 70Q${22 * lado} 72 ${19 * lado} 82Q${14 * lado} 84 ${11 * lado} 78Z`} fill={LUVA} />
          <path d={`M${-5 * lado} 80V90M${2 * lado} 80V91`} stroke="#0b9f9c" strokeWidth="1.3" />
        </g>
      </g>
    </g>
  );
}

function Rosto({ quem, pose, falando }: { quem: Quem; pose: Pose; falando?: boolean }) {
  const uau = pose === "comemora" || pose === "acena";
  const triste = pose === "triste";
  const pele = quem === "menino" ? "#c8763a" : "#f9a8c9";
  const bochecha = quem === "menino" ? "#a9593a" : "#ee80a8";
  const olho = quem === "menino" ? "#2a1c17" : "#6b3a2a";
  return (
    <>
      <circle cx="96" cy="100" r="9" fill={bochecha} opacity=".75" />
      <circle cx="144" cy="100" r="9" fill={bochecha} opacity=".75" />
      <g className="m-olhos" style={{ transformOrigin: "120px 86px" }}>
        {uau ? (
          <>
            <path d="M99 88q7-9 14 0" stroke={olho} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M127 88q7-9 14 0" stroke={olho} strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="106" cy="86" rx="4.6" ry="5.6" fill={olho} />
            <ellipse cx="134" cy="86" rx="4.6" ry="5.6" fill={olho} />
            <circle cx="107.6" cy="84" r="1.5" fill="#fff" />
            <circle cx="135.6" cy="84" r="1.5" fill="#fff" />
          </>
        )}
      </g>
      {quem === "menino" && !uau && (
        <path d={triste ? "M98 74l14 4M142 74l-14 4" : "M97 76q9-6 17-1M126 75q8-5 17 1"} stroke="#2a1c17" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      )}
      {quem === "menina" && (
        <g fill="none" stroke="#12c4bf" strokeWidth="3.6">
          <circle cx="106" cy="86" r="13" />
          <circle cx="134" cy="86" r="13" />
          <path d="M119 85q1-2 2 0M93 84l-8-3M147 84l8-3" />
        </g>
      )}
      {triste ? (
        <path d="M110 116q10-8 20 0" stroke="#5a2a1c" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      ) : pose === "pensa" ? (
        <circle cx="126" cy="114" r="4" fill="#5a2a1c" />
      ) : (
        <g className={falando ? "m-boca" : undefined} style={{ transformOrigin: "120px 110px" }}>
          <path d={uau ? "M106 106Q120 130 134 106Z" : "M108 108Q120 122 132 108Z"} fill="#5a1f22" />
          <path d={uau ? "M108 107Q120 113 132 107L131 110Q120 115 109 110Z" : "M110 109Q120 113 130 109L129 111Q120 115 111 111Z"} fill="#fff" />
        </g>
      )}
    </>
  );
}

export function Mascote({ quem, pose = "parado", falando = false, className, style, olhar = 0 }: { quem: Quem; pose?: Pose; falando?: boolean; className?: string; style?: CSSProperties; olhar?: number }) {
  const [esq, dir] = BRACOS[pose];
  const prop = pose === "lupa" ? <Lupa /> : pose === "tubo" ? <Tubo cor={quem === "menino" ? "#6cc24a" : "#fdc13f"} /> : null;
  const propDir = pose === "foguete" ? <Foguete /> : pose === "folha" ? <Folha /> : null;
  const pele = quem === "menino" ? "#c8763a" : "#f9a8c9";
  const sombraPele = quem === "menino" ? "#a65f2c" : "#e98fb4";

  return (
    <svg viewBox="0 0 240 310" className={`m-sticker ${className ?? ""}`} style={style} aria-hidden="true">
      <g className={pose === "comemora" ? "m-pula" : "m-respira"} style={{ transformOrigin: "120px 300px" }}>
        {/* Cabelo atrás do corpo */}
        {quem === "menina" && <path d="M70 92C58 32 92 18 122 18C160 18 186 44 182 104C180 142 194 170 186 214L160 200L150 150H92L70 176L50 170C70 150 72 122 70 92Z" fill={LARANJA} />}

        {/* Corpo: jaleco, gola, calça */}
        <rect x="84" y="270" width="72" height="40" fill="#3f6c9c" />
        <path d="M56 310L62 194Q66 164 98 152L142 152Q174 164 178 194L184 310Z" fill={JALECO} stroke={LINHA} strokeWidth="1.8" />
        <path d="M120 188V310M98 152L120 204L108 222L88 196ZM142 152L120 204L132 222L152 196Z" fill="none" stroke="#6d7276" strokeWidth="1.5" />
        <rect x="74" y="264" width="30" height="7" rx="1" fill="none" stroke="#6d7276" strokeWidth="1.3" transform="rotate(4 89 267)" />
        <rect x="136" y="264" width="30" height="7" rx="1" fill="none" stroke="#6d7276" strokeWidth="1.3" transform="rotate(-4 151 267)" />
        <path d="M96 144L120 174L144 144L152 158L122 198L88 158Z" fill={LARANJA} />
        <path d="M98 144L120 170L142 144L148 154L121 188L92 154Z" fill={VERDE} />
        <path d="M104 132h32v18l-16 16l-16-16z" fill={sombraPele} />

        <Braco x={62} angulo={esq} lado={1} prop={prop} />
        <Braco x={178} angulo={dir} lado={-1} prop={propDir} classe={pose === "acena" ? "m-aceno" : pose === "comemora" ? "m-aceno" : undefined} />

        {/* Cabeça */}
        <g className="m-cabeca" style={{ transformOrigin: "120px 136px", transform: olhar ? `rotate(${olhar}deg)` : undefined }}>
          {quem === "menino" ? (
            <>
              <g fill="#3d2b2b">
                {[[70, 72, 20], [78, 46, 21], [100, 28, 22], [126, 22, 23], [152, 30, 22], [170, 52, 22], [176, 80, 20], [170, 104, 16], [86, 56, 24], [120, 44, 28], [150, 60, 24]].map(([x, y, r]) => (
                  <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
                ))}
              </g>
              <ellipse cx="166" cy="98" rx="11" ry="14" fill={sombraPele} />
              <path d="M78 90C78 62 96 50 122 50C148 50 164 66 164 96C164 124 144 142 120 142C96 142 78 120 78 90Z" fill={pele} />
              <path d="M84 66q14-16 34-12M122 56q22-4 36 14" stroke="#3d2b2b" strokeWidth="9" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="78" cy="94" rx="11" ry="14" fill={sombraPele} />
              <path d="M78 92C78 62 96 48 122 48C148 48 162 66 162 94C162 124 144 142 120 142C96 142 78 122 78 92Z" fill={pele} />
              <path d="M76 84C78 44 110 26 136 30C164 34 176 62 168 94C162 72 150 60 136 58C132 68 122 72 112 66C102 72 88 72 76 84Z" fill={LARANJA} />
            </>
          )}
          <Rosto quem={quem} pose={pose} falando={falando} />
        </g>
      </g>
    </svg>
  );
}
