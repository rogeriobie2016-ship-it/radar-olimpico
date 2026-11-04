// Cenários de Crononauta, desenhados em SVG: cada viagem tem paisagem própria, além do mostrador do cronógrafo.
// São ilustrações livres, sem pretensão de reconstituir o lugar real com exatidão.
import type { Caso } from "@/lib/estudo/crononauta";

function aleatorio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function Estrelas({ semente, quantas, ate }: { semente: number; quantas: number; ate: number }) {
  const r = aleatorio(semente);
  return (
    <g fill="#eaf4ff">
      {Array.from({ length: quantas }, (_, i) => (
        <circle key={i} cx={r() * 800} cy={r() * ate} r={r() * 1.2 + 0.3} opacity={r() * 0.7 + 0.2} className={i % 8 === 0 ? "nv-pisca" : undefined} style={i % 8 === 0 ? { animationDelay: `${(i % 6) * 0.6}s` } : undefined} />
      ))}
    </g>
  );
}

function Jangada({ x, y, escala = 1, atraso = 0, cor = "#120a10" }: { x: number; y: number; escala?: number; atraso?: number; cor?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <g className="nv-boia" style={{ animationDelay: `${atraso}s` }}>
        <path d="M-46 0H52L44 8H-40Z" fill={cor} />
        <path d="M2 -2V-98" stroke={cor} strokeWidth="3" />
        <path d="M5 -96Q54 -52 48 -8L5 -8Z" fill={cor} opacity=".92" />
      </g>
    </g>
  );
}

function Porto() {
  return (
    <>
      <defs>
        <linearGradient id="cr-porto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101a3d" /><stop offset=".48" stopColor="#5b3a63" /><stop offset=".72" stopColor="#d96f3f" /><stop offset="1" stopColor="#f6b869" /></linearGradient>
        <linearGradient id="cr-mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3149" /><stop offset="1" stopColor="#070b18" /></linearGradient>
        <radialGradient id="cr-sol-porto" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffe2a8" /><stop offset=".35" stopColor="#ffb86a" stopOpacity=".6" /><stop offset="1" stopColor="#ffb86a" stopOpacity="0" /></radialGradient>
        <radialGradient id="cr-vapor" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#584a63" stopOpacity=".8" /><stop offset="1" stopColor="#584a63" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="800" height="290" fill="url(#cr-porto)" />
      <circle cx="400" cy="290" r="170" fill="url(#cr-sol-porto)" />
      {/* Vapor fundeado ao largo */}
      <g transform="translate(590 266)" fill="#1a1120">
        <path d="M-70 12H78L64 26H-58Z" />
        <rect x="-38" y="-2" width="72" height="14" />
        <rect x="-10" y="-30" width="12" height="28" />
        <g className="nv-fumaca"><circle cx="-4" cy="-42" r="14" fill="url(#cr-vapor)" /><circle cx="-18" cy="-58" r="20" fill="url(#cr-vapor)" opacity=".8" /><circle cx="-40" cy="-74" r="28" fill="url(#cr-vapor)" opacity=".55" /></g>
      </g>
      <rect y="290" width="800" height="170" fill="url(#cr-mar)" />
      <g stroke="#ffb86a" strokeWidth="2.5" fill="none" opacity=".35">
        {[304, 322, 346, 376].map((y, i) => <path key={y} d={`M${330 - i * 40} ${y}H${470 + i * 40}`} className="nv-pisca-lento" style={{ animationDelay: `${i * 0.4}s` }} />)}
      </g>
      <Jangada x={170} y={316} escala={1.12} />
      <Jangada x={318} y={296} escala={0.62} atraso={-1.2} cor="#201323" />
      <Jangada x={662} y={350} escala={1.45} atraso={-2.2} />
    </>
  );
}

function Aurora() {
  return (
    <>
      <defs>
        <linearGradient id="cr-aurora" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2554" /><stop offset=".5" stopColor="#b4577a" /><stop offset=".85" stopColor="#ffbf73" /></linearGradient>
        <radialGradient id="cr-sol" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff2c2" /><stop offset=".3" stopColor="#ffd27f" stopOpacity=".85" /><stop offset="1" stopColor="#ffd27f" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#cr-aurora)" />
      <g transform="translate(400 330)">
        <g className="nv-gira-lento" fill="#ffe6a8" opacity=".18">
          {Array.from({ length: 18 }, (_, i) => <path key={i} d="M-16 0L0 -470L16 0Z" transform={`rotate(${i * 20})`} />)}
        </g>
      </g>
      <circle cx="400" cy="330" r="200" fill="url(#cr-sol)" />
      <g fill="#150e1e">
        <path d="M0 460V340H70V316H128V350H190V330H262V460Z" />
        <path d="M540 460V336H600V312H668V344H730V322H800V460Z" />
        {/* Igreja de torres gêmeas, ao centro */}
        <path d="M300 460V300H322V262L332 244L342 262V300H458V262L468 244L478 262V300H500V460Z" />
        <path d="M384 300L400 276L416 300Z" />
      </g>
      <g fill="#ffd27f">
        <rect x="392" y="330" width="16" height="30" rx="8" />
        {[[28, 366], [150, 376], [216, 360], [572, 362], [640, 348], [760, 356]].map(([x, y], i) => <rect key={i} x={x} y={y} width="10" height="14" className="nv-pisca-lento" style={{ animationDelay: `${i * 0.5}s` }} />)}
      </g>
    </>
  );
}

function Mandacaru({ x, y, escala = 1 }: { x: number; y: number; escala?: number }) {
  return (
    <path transform={`translate(${x} ${y}) scale(${escala})`} d="M-7 0V-92Q-7 -100 0 -100Q7 -100 7 -92V-48H19V-74Q19 -80 25 -80Q31 -80 31 -74V-40Q31 -36 27 -36H7V0ZM-7 -28H-20Q-30 -28 -30 -38V-64Q-30 -70 -24 -70Q-18 -70 -18 -64V-40H-7Z" fill="#1d1208" />
  );
}

function Sertao() {
  return (
    <>
      <defs>
        <linearGradient id="cr-sertao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d1a2e" /><stop offset=".45" stopColor="#b9532b" /><stop offset=".78" stopColor="#f8b45c" /></linearGradient>
        <radialGradient id="cr-sol-sertao" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff0be" /><stop offset=".22" stopColor="#ffd27f" /><stop offset="1" stopColor="#ffd27f" stopOpacity="0" /></radialGradient>
        <linearGradient id="cr-terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f3d1d" /><stop offset="1" stopColor="#120a0c" /></linearGradient>
      </defs>
      <rect width="800" height="460" fill="url(#cr-sertao)" />
      <circle cx="240" cy="130" r="140" fill="url(#cr-sol-sertao)" />
      {/* Chapada no horizonte, de topo plano */}
      <path d="M0 232L70 226L120 206H600L650 224L800 232V290H0Z" fill="#5a2c28" />
      <path d="M0 262H800V300H0Z" fill="#6b3a23" />
      {/* Povoado e torre */}
      <g transform="translate(500 262)" fill="#26130f">
        <path d="M-30 0V-24H-6V-58L2 -74L10 -58V-24H30V0Z" />
        <path d="M-90 0V-16H-40V0ZM40 0V-14H98V0Z" />
      </g>
      <path d="M0 280Q200 262 400 280T800 276V460H0Z" fill="url(#cr-terra)" />
      {/* O valado cavado em volta da povoação */}
      <path d="M-10 370Q180 332 400 366T810 340" fill="none" stroke="#0f0806" strokeWidth="24" />
      <path d="M-10 356Q180 318 400 352T810 326" fill="none" stroke="#a3683a" strokeWidth="7" strokeDasharray="30 9" />
      <Mandacaru x={110} y={352} escala={0.95} />
      <Mandacaru x={690} y={340} escala={1.25} />
    </>
  );
}

function Rio() {
  const r = aleatorio(321);
  return (
    <>
      <defs>
        <linearGradient id="cr-rio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0f24" /><stop offset=".55" stopColor="#4a1f35" /><stop offset=".9" stopColor="#c7542b" /></linearGradient>
        <radialGradient id="cr-lampiao" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd98f" stopOpacity=".95" /><stop offset="1" stopColor="#ffd98f" stopOpacity="0" /></radialGradient>
        <radialGradient id="cr-fumaca-rio" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#6b3a4a" stopOpacity=".7" /><stop offset="1" stopColor="#6b3a4a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#cr-rio)" />
      <Estrelas semente={812} quantas={36} ate={160} />
      {/* Morros da baía */}
      <path d="M0 300L80 262L170 300L260 268Q320 120 372 122Q408 122 452 262L520 228L610 282L700 240L800 290V340H0Z" fill="#2c1730" stroke="#8a4c5c" strokeWidth="1.5" />
      <g className="nv-fumaca">
        {[[150, 262, 70], [190, 214, 90], [600, 250, 80], [650, 196, 104]].map(([x, y, raio], i) => <circle key={i} cx={x} cy={y} r={raio} fill="url(#cr-fumaca-rio)" />)}
      </g>
      {/* Sobrados, alguns já derrubados */}
      <g fill="#100a14">
        {[[0, 310, 96], [100, 290, 82], [186, 330, 70], [260, 300, 92], [356, 356, 70], [430, 296, 100], [534, 340, 62], [600, 306, 88], [692, 288, 110]].map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height={460 - y} />
        ))}
      </g>
      <g fill="#ffb86a">
        {Array.from({ length: 18 }, (_, i) => {
          const x = r() * 760 + 10;
          const y = 322 + r() * 110;
          return <rect key={i} x={x} y={y} width="8" height="13" opacity={r() * 0.5 + 0.25} />;
        })}
      </g>
      {/* Escombros e lampiões */}
      <path d="M356 460V400L380 382L400 402L422 378L440 410V460ZM186 460V402L208 376L232 398L256 384V460Z" fill="#241520" />
      {[148, 520].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 460V356`} stroke="#0b070d" strokeWidth="4" />
          <circle cx={x} cy="350" r="46" fill="url(#cr-lampiao)" className="nv-pisca-lento" style={{ animationDelay: `${i * 0.6}s` }} />
          <circle cx={x} cy="350" r="5" fill="#fff0c8" />
        </g>
      ))}
    </>
  );
}

function Ilha() {
  return (
    <>
      <defs>
        <linearGradient id="cr-ilha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04071a" /><stop offset=".55" stopColor="#1b1a44" /><stop offset=".85" stopColor="#7a2c2b" /></linearGradient>
        <radialGradient id="cr-fogo" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffe19a" /><stop offset=".3" stopColor="#ff8a3a" stopOpacity=".8" /><stop offset="1" stopColor="#ff5a2a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#cr-ilha)" />
      <Estrelas semente={55} quantas={80} ate={230} />
      <path d="M0 260L90 188L180 240L300 150L390 224L500 138L600 226L710 170L800 232V320H0Z" fill="#14133a" />
      <path d="M0 290L110 244L240 288L370 232L510 286L640 240L800 290V340H0Z" fill="#0d0d28" />
      {[[120, 306, 46], [270, 322, 66], [430, 300, 40], [590, 318, 74], [720, 304, 42]].map(([x, y, raio], i) => (
        <circle key={i} cx={x} cy={y} r={raio} fill="url(#cr-fogo)" className="nv-chama" style={{ animationDelay: `${i * 0.27}s` }} />
      ))}
      <path d="M0 330H800V460H0Z" fill="#090818" />
      <path d="M0 336Q200 318 400 336T800 330V350H0Z" fill="#0c0a1e" />
      {[[70, 420, 1.2], [738, 430, 1.4]].map(([x, y, e], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${e})`} fill="none" stroke="#04040f" strokeLinecap="round" className="nv-balanca" style={{ animationDelay: `${-i * 2}s` }}>
          <path d="M0 0Q10 -60 2 -126" strokeWidth="8" />
          {[-80, -46, -18, 14, 44, 78].map((a) => <path key={a} d="M2 -126q18 -22 58 -14" strokeWidth="5" transform={`rotate(${a} 2 -126)`} />)}
        </g>
      ))}
    </>
  );
}

/** O mostrador do cronógrafo, com anéis que giram em sentidos opostos. */
export function Mostrador({ className = "" }: { className?: string }) {
  const marcas = (raio: number, n: number, compr: number) => Array.from({ length: n }, (_, i) => <path key={i} d={`M0 ${-raio}V${-raio + (i % 5 === 0 ? compr * 2 : compr)}`} transform={`rotate(${(i * 360) / n})`} />);
  return (
    <svg className={className} viewBox="-260 -260 520 520" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cr-nucleo" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#7fd8ff" stopOpacity=".6" /><stop offset=".55" stopColor="#7fd8ff" stopOpacity=".08" /><stop offset="1" stopColor="#7fd8ff" stopOpacity="0" /></radialGradient>
      </defs>
      <circle r="250" fill="url(#cr-nucleo)" />
      <g className="nv-gira-lento" stroke="#f2c572" strokeWidth="2" fill="none" opacity=".75">
        <circle r="238" />
        {marcas(238, 60, 9)}
      </g>
      <g className="nv-gira-contra" stroke="#7fd8ff" strokeWidth="1.5" fill="none" opacity=".6">
        <circle r="186" strokeDasharray="4 8" />
        {marcas(186, 24, 12)}
      </g>
      <g className="nv-gira-lento" stroke="#f2c572" strokeWidth="1.5" fill="none" opacity=".5" style={{ animationDuration: "19s" }}>
        <circle r="128" />
        <path d="M0 -128V-34M0 128V34M-128 0H-34M128 0H34" />
      </g>
      <circle r="9" fill="#f2c572" />
    </svg>
  );
}

export function CenarioTempo({ nome }: { nome: Caso["cenario"] | "cronografo" }) {
  if (nome === "cronografo")
    return (
      <svg key={nome} className="nv-arte" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <rect width="800" height="460" fill="#070b18" />
        <Estrelas semente={91} quantas={90} ate={460} />
      </svg>
    );
  return (
    <svg key={nome} className="nv-arte" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {nome === "porto" && <Porto />}
      {nome === "aurora" && <Aurora />}
      {nome === "sertao" && <Sertao />}
      {nome === "rio" && <Rio />}
      {nome === "ilha" && <Ilha />}
    </svg>
  );
}
