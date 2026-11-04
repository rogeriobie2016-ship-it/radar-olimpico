// Cenários de Arquivo Perdido, desenhados em SVG: Titã, o lago de metano e a Estação Aracati por dentro.
import type { Cenario } from "@/lib/estudo/arquivo-perdido";

function aleatorio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function Estrelas({ quantas = 70, ate = 300 }: { quantas?: number; ate?: number }) {
  const r = aleatorio(4242 + quantas);
  return (
    <g fill="#fff4dc">
      {Array.from({ length: quantas }, (_, i) => (
        <circle key={i} cx={r() * 800} cy={r() * ate} r={r() * 1.3 + 0.3} opacity={r() * 0.7 + 0.2} className={i % 7 === 0 ? "nv-pisca" : undefined} style={i % 7 === 0 ? { animationDelay: `${(i % 5) * 0.7}s` } : undefined} />
      ))}
    </g>
  );
}

function Saturno({ x, y, escala = 1, opacidade = 1 }: { x: number; y: number; escala?: number; opacidade?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala}) rotate(-16)`} opacity={opacidade}>
      <ellipse rx="150" ry="30" fill="none" stroke="url(#ti-anel)" strokeWidth="14" />
      <ellipse rx="118" ry="22" fill="none" stroke="url(#ti-anel)" strokeWidth="5" opacity=".7" />
      <circle r="70" fill="url(#ti-planeta)" />
      <path d="M-68 14Q0 30 68 14M-70 -6Q0 8 70 -6M-62 -28Q0 -18 62 -28" stroke="#6d4a26" strokeWidth="3" fill="none" opacity=".4" />
      <path d="M-150 0A150 30 0 0 0 150 0" fill="none" stroke="url(#ti-anel)" strokeWidth="14" />
      <path d="M-118 0A118 22 0 0 0 118 0" fill="none" stroke="url(#ti-anel)" strokeWidth="5" opacity=".7" />
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ti-espaco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04030b" /><stop offset="1" stopColor="#1b0c24" /></linearGradient>
      <radialGradient id="ti-planeta" cx=".36" cy=".32" r=".8"><stop offset="0" stopColor="#f8dfa6" /><stop offset=".55" stopColor="#c89350" /><stop offset="1" stopColor="#4a2a18" /></radialGradient>
      <linearGradient id="ti-anel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff0c8" stopOpacity=".05" /><stop offset=".5" stopColor="#ffe6b0" stopOpacity=".8" /><stop offset="1" stopColor="#fff0c8" stopOpacity=".05" /></linearGradient>
      <radialGradient id="ti-tita" cx=".5" cy=".1" r=".75"><stop offset="0" stopColor="#f6a24a" /><stop offset=".6" stopColor="#a44d1b" /><stop offset="1" stopColor="#3a170d" /></radialGradient>
      <radialGradient id="ti-halo" cx=".5" cy=".5" r=".5"><stop offset=".76" stopColor="#ffb86a" stopOpacity="0" /><stop offset=".88" stopColor="#ffb86a" stopOpacity=".55" /><stop offset="1" stopColor="#ffb86a" stopOpacity="0" /></radialGradient>
      <linearGradient id="ti-neblina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a2b14" /><stop offset=".55" stopColor="#d9782f" /><stop offset="1" stopColor="#ffbd71" /></linearGradient>
      <linearGradient id="ti-lago" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5c2c15" /><stop offset=".2" stopColor="#241016" /><stop offset="1" stopColor="#0b0712" /></linearGradient>
      <linearGradient id="ti-parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120c1a" /><stop offset="1" stopColor="#241526" /></linearGradient>
      <radialGradient id="ti-brilho" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#6ff2d6" stopOpacity=".55" /><stop offset="1" stopColor="#6ff2d6" stopOpacity="0" /></radialGradient>
      <radialGradient id="ti-brilho-ambar" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffb24d" stopOpacity=".65" /><stop offset="1" stopColor="#ffb24d" stopOpacity="0" /></radialGradient>
    </defs>
  );
}

function Orbita() {
  return (
    <>
      <rect width="800" height="460" fill="url(#ti-espaco)" />
      <Estrelas />
      <g className="nv-deriva"><Saturno x={510} y={100} escala={0.8} /></g>
      <circle cx="400" cy="660" r="470" fill="url(#ti-halo)" />
      <circle cx="400" cy="660" r="400" fill="url(#ti-tita)" />
      <g className="nv-pisca-lento"><circle cx="400" cy="262" r="3.5" fill="#6ff2d6" /><circle cx="400" cy="262" r="22" fill="url(#ti-brilho)" /></g>
    </>
  );
}

function Corredor() {
  // Ponto de fuga no alto, para o fim do corredor ficar acima do texto.
  const fx = 400;
  const fy = 150;
  const ponto = (x: number, y: number, k: number) => `${fx + (x - fx) * k} ${fy + (y - fy) * k}`;
  const costelas = [1, 0.72, 0.52, 0.37, 0.26];
  return (
    <>
      <rect width="800" height="460" fill="#0a0610" />
      <path d={`M0 0H800L${ponto(800, 0, 0.17)}H${ponto(0, 0, 0.17)}Z`} fill="#17101f" />
      <path d={`M0 460H800L${ponto(800, 460, 0.17)}H${ponto(0, 460, 0.17)}Z`} fill="#1a1119" />
      <path d={`M0 0L${ponto(0, 0, 0.17)}V${150 + (460 - fy) * 0.17}L0 460Z`} fill="#120c1b" />
      <path d={`M800 0L${ponto(800, 0, 0.17)}V${150 + (460 - fy) * 0.17}L800 460Z`} fill="#120c1b" />
      {costelas.map((k, i) => (
        <path key={k} d={`M${ponto(0, 460, k)}L${ponto(0, 0, k)}H${fx + 400 * k}L${ponto(800, 460, k)}`} fill="none" stroke="#4d3650" strokeWidth={10 * k + 1} opacity={0.9 - i * 0.08} />
      ))}
      {/* Fitas de luz no teto, correndo para o fundo */}
      {[-210, 210].map((x) => (
        <path key={x} d={`M${fx + x} 0L${fx + x * 0.17} ${fy - 150 * 0.17}`} stroke="#ffb24d" strokeWidth="5" className="nv-pisca-lento" />
      ))}
      {[-300, 300].map((x, i) => (
        <path key={x} d={`M${fx + x} 460L${fx + x * 0.17} ${fy + 310 * 0.17}`} stroke="#6ff2d6" strokeWidth="2.5" opacity=".5" className="nv-pisca-lento" style={{ animationDelay: `${i + 1}s` }} />
      ))}
      {/* A bifurcação no fim do corredor */}
      <rect x="332" y="124" width="136" height="80" fill="#07040a" />
      <rect x="342" y="134" width="50" height="70" fill="#0e2622" stroke="#6ff2d6" strokeWidth="2" />
      <rect x="408" y="134" width="50" height="70" fill="#1d2a12" stroke="#b5e36b" strokeWidth="2" />
      <circle cx="367" cy="170" r="70" fill="url(#ti-brilho)" />
      <circle cx="433" cy="170" r="70" fill="url(#ti-brilho-ambar)" opacity=".75" />
    </>
  );
}

function Laboratorio() {
  const onda = (y: number, a: number, f: number) => Array.from({ length: 41 }, (_, i) => `${i ? "L" : "M"}${i * 6} ${y + Math.sin(i * f) * a * (i % 8 === 0 ? 2.2 : 1)}`).join("");
  return (
    <>
      <rect width="800" height="460" fill="url(#ti-parede)" />
      <g stroke="#3a2b42" strokeWidth="1" opacity=".55">
        {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${i * 66} 0V340`} />)}
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M0 ${i * 66}H800`} />)}
      </g>
      {[[70, 80, 0.55], [290, 50, 0.9], [540, 92, 0.42]].map(([x, y, f], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect width="240" height="150" rx="6" fill="#071412" stroke="#2c6a5f" strokeWidth="2.5" />
          <rect width="240" height="150" rx="6" fill="url(#ti-brilho)" opacity=".4" />
          <path d={onda(75, 18, f)} fill="none" stroke="#6ff2d6" strokeWidth="2.2" className="nv-onda" style={{ animationDelay: `${i * 0.5}s` }} transform="scale(1 1)" />
          <path d="M12 130H70M84 130H120" stroke="#6ff2d6" strokeWidth="2" opacity=".4" />
        </g>
      ))}
      <path d="M0 330H800V460H0Z" fill="#0d0813" />
      <path d="M0 330H800" stroke="#ffb24d" strokeWidth="2" opacity=".5" />
      <path d="M120 330V300H230V330M520 330V290L560 270H640V330" fill="#1b1220" stroke="#44304a" strokeWidth="2" />
    </>
  );
}

function Carnauba({ x, y, escala = 1, cor = "#0e2c26" }: { x: number; y: number; escala?: number; cor?: string }) {
  const folhas = Array.from({ length: 11 }, (_, i) => -75 + i * 15);
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} fill="none" stroke={cor} strokeLinecap="round">
      <path d="M0 0Q6 -70 0 -150" strokeWidth="9" />
      {folhas.map((a) => (
        <path key={a} d="M0 -150q0 -40 0 -78" strokeWidth="5" transform={`rotate(${a} 0 -150)`} />
      ))}
    </g>
  );
}

function Estufa() {
  return (
    <>
      <rect width="800" height="460" fill="#06140f" />
      <circle cx="400" cy="400" r="440" fill="url(#ti-neblina)" opacity=".42" />
      <g fill="none" stroke="#7ce6c4" strokeWidth="1.5" opacity=".42">
        {[120, 220, 320, 420].map((r) => <path key={r} d={`M${400 - r} 400A${r} ${r} 0 0 1 ${400 + r} 400`} />)}
        {Array.from({ length: 13 }, (_, i) => {
          const a = (Math.PI * i) / 12;
          return <path key={i} d={`M400 400L${400 + Math.cos(a) * 420} ${400 - Math.sin(a) * 420}`} />;
        })}
      </g>
      <circle cx="400" cy="210" r="250" fill="url(#ti-brilho)" opacity=".55" />
      <g className="nv-balanca"><Carnauba x={150} y={420} escala={1.15} /></g>
      <g className="nv-balanca" style={{ animationDelay: "-3s" }}><Carnauba x={640} y={430} escala={1.3} /></g>
      <g className="nv-balanca" style={{ animationDelay: "-1.5s" }}><Carnauba x={400} y={430} escala={0.8} cor="#16473a" /></g>
      <path d="M0 400Q200 372 400 396T800 388V460H0Z" fill="#071a14" />
      <g fill="#a7f5dd">
        {[[250, 90], [510, 70], [330, 170], [590, 180], [460, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" className="nv-pisca" style={{ animationDelay: `${i * 0.6}s` }} />)}
      </g>
    </>
  );
}

function Nucleo() {
  const colunas = Array.from({ length: 13 }, (_, i) => i);
  return (
    <>
      <rect width="800" height="460" fill="#050308" />
      <ellipse cx="400" cy="230" rx="170" ry="210" fill="url(#ti-brilho-ambar)" />
      {colunas.map((i) => {
        const d = (i - 6) / 6;
        const x = 400 + d * 380;
        const w = 46 - Math.abs(d) * 16;
        return (
          <g key={i}>
            <rect x={x - w / 2} y="0" width={w} height="460" fill={`rgb(${30 - Math.abs(d) * 12} ${20 - Math.abs(d) * 9} ${36 - Math.abs(d) * 14})`} />
            {Array.from({ length: 11 }, (_, j) => (
              <rect key={j} x={x - w / 2 + 6} y={18 + j * 42} width={w - 12} height="3" fill={(i + j) % 3 === 0 ? "#6ff2d6" : "#ffb24d"} opacity=".7" className="nv-pisca" style={{ animationDelay: `${((i * 3 + j) % 9) * 0.4}s` }} />
            ))}
          </g>
        );
      })}
      {[60, 120, 180].map((r, i) => <ellipse key={r} cx="400" cy="372" rx={r * 1.55} ry={r * 0.3} fill="none" stroke="#ffcf8a" strokeWidth="1.5" opacity={0.65 - i * 0.15} className="nv-pisca-lento" style={{ animationDelay: `${i * 0.4}s` }} />)}
    </>
  );
}

function Lago({ pulsos = true, cor = "#6ff2d6", neblina = 1 }: { pulsos?: boolean; cor?: string; neblina?: number }) {
  return (
    <>
      <rect width="800" height="270" fill="url(#ti-neblina)" opacity={neblina} />
      <g className="nv-deriva"><Saturno x={560} y={90} escala={0.72} opacidade={0.45} /></g>
      <path d="M0 268L90 226L170 248L270 210L350 250L470 222L560 256L680 214L800 250V290H0Z" fill="#3f1e12" />
      <path d="M0 278L120 254L240 276L380 250L520 278L660 256L800 276V300H0Z" fill="#26120f" />
      <rect y="280" width="800" height="180" fill="url(#ti-lago)" />
      <path d="M560 290Q572 340 552 380T560 456" stroke="#ffcf8a" strokeWidth="8" fill="none" opacity=".12" />
      <g transform="translate(92 268)">
        <path d="M-30 12V-14L-6 -30H34L58 -14V12Z" fill="#150c13" stroke="#6b4a44" strokeWidth="1.5" />
        <path d="M18 -30V-58" stroke="#6b4a44" strokeWidth="2" />
        <circle cx="18" cy="-60" r="3" fill={cor} className="nv-pisca-lento" />
        <rect x="-14" y="-10" width="8" height="5" fill="#ffb24d" /><rect x="2" y="-10" width="8" height="5" fill="#ffb24d" /><rect x="18" y="-10" width="8" height="5" fill="#ffb24d" opacity=".5" />
      </g>
      {pulsos && [0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="400" cy="350" rx="150" ry="30" fill="none" stroke={cor} strokeWidth="2" className="nv-pulso" style={{ animationDelay: `${i * 1.25}s` }} />
      ))}
    </>
  );
}

function Conversa() {
  return (
    <>
      <Lago cor="#6ff2d6" />
      <g fill="none" stroke="#6ff2d6" strokeWidth="2" opacity=".75">
        {[0, 1, 2].map((i) => <path key={i} d={`M92 ${210 - i * 18}Q400 ${60 - i * 18} 708 ${210 - i * 18}`} className="nv-onda" style={{ animationDelay: `${i * 0.5}s` }} />)}
      </g>
      <circle cx="400" cy="350" r="150" fill="url(#ti-brilho)" />
    </>
  );
}

function Aberto() {
  const r = aleatorio(77);
  const pontos = Array.from({ length: 16 }, () => [r() * 800, 280 + r() * 150]);
  return (
    <>
      <rect width="800" height="460" fill="url(#ti-espaco)" />
      <Estrelas quantas={50} />
      <circle cx="400" cy="640" r="350" fill="#0f2f4d" />
      <circle cx="400" cy="640" r="372" fill="none" stroke="#7fd8ff" strokeWidth="10" opacity=".25" />
      <g stroke="#ffb24d" strokeWidth="1.5" opacity=".55">
        {pontos.map(([x, y], i) => <path key={i} d={`M400 90L${x} ${y}`} className="nv-onda" style={{ animationDelay: `${i * 0.2}s` }} />)}
      </g>
      <g fill="#ffe6b0">{pontos.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" className="nv-pisca" style={{ animationDelay: `${i * 0.3}s` }} />)}</g>
      <circle cx="400" cy="90" r="7" fill="#ffb24d" /><circle cx="400" cy="90" r="50" fill="url(#ti-brilho-ambar)" />
    </>
  );
}

function Ruina() {
  const r = aleatorio(991);
  return (
    <>
      <Lago pulsos={false} neblina={0.45} />
      <rect width="800" height="460" fill="#0b0712" opacity=".55" />
      <g fill="#ffb24d">
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={r() * 800} y={r() * 460} width={r() * 150 + 20} height={r() * 4 + 1} opacity={r() * 0.32 + 0.06} className={i % 3 === 0 ? "nv-pisca" : undefined} />)}
      </g>
    </>
  );
}

export function CenarioTita({ nome }: { nome: Cenario }) {
  return (
    <svg key={nome} className="nv-arte" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Defs />
      {nome === "orbita" && <Orbita />}
      {nome === "corredor" && <Corredor />}
      {nome === "laboratorio" && <Laboratorio />}
      {nome === "estufa" && <Estufa />}
      {nome === "nucleo" && <Nucleo />}
      {nome === "lago" && <Lago />}
      {nome === "conversa" && <Conversa />}
      {nome === "aberto" && <Aberto />}
      {nome === "silencio" && <Lago pulsos={false} neblina={0.55} />}
      {nome === "ruina" && <Ruina />}
    </svg>
  );
}
