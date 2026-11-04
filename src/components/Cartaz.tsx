// Arte tipográfica de cada oportunidade. Sem fotos: a cor vem da área e o desenho muda com o nome,
// então cada cartaz é único, e o conjunto continua coerente.

function h(t: string, n = 1) {
  let v = 2166136261 + n * 16777;
  for (const c of t) v = Math.imul(v ^ c.charCodeAt(0), 16777619);
  return (v >>> 0) / 4294967295;
}

const TEMAS: Record<string, { fundo: string; traco: string; texto: string }> = {
  Matemática: { fundo: "#f58a33", traco: "#3a1c05", texto: "#1c0f05" },
  "Ciências da Natureza": { fundo: "#0a2a55", traco: "#00c9c8", texto: "#f4fbff" },
  "Ciências Humanas e Sociais Aplicadas": { fundo: "#8a3f12", traco: "#fdc13f", texto: "#f4fbff" },
  "Linguagens e Códigos": { fundo: "#fdc13f", traco: "#3a2a05", texto: "#1c0f05" },
  "Tecnologia e Computação": { fundo: "#06393f", traco: "#3ee8e6", texto: "#f4fbff" },
  "Meio Ambiente": { fundo: "#0d6b3c", traco: "#a5f0c5", texto: "#f4fbff" },
  "Educação Financeira e Gestão": { fundo: "#f8a8c8", traco: "#6b1f45", texto: "#2b0a1b" },
  Multidisciplinar: { fundo: "#00a3a3", traco: "#f4fbff", texto: "#04211f" },
};

export const temaDe = (area: string) => TEMAS[area] ?? TEMAS.Multidisciplinar;

function Desenho({ area, id, cor }: { area: string; id: string; cor: string }) {
  const a = h(id, 1);
  const b = h(id, 2);
  const c = h(id, 3);
  const comum = { fill: "none", stroke: cor, strokeWidth: 1.6 };
  switch (area) {
    case "Matemática": {
      // Parábola sobre uma malha.
      const passo = 22 + Math.round(a * 14);
      const linhas = Array.from({ length: 14 }, (_, i) => i * passo);
      const k = 0.006 + b * 0.012;
      const d = Array.from({ length: 41 }, (_, i) => {
        const x = i * 5;
        return `${i ? "L" : "M"}${x} ${40 + k * (x - 60 - c * 80) ** 2}`;
      }).join("");
      return (
        <g {...comum}>
          <g opacity=".28">{linhas.map((v) => <path key={v} d={`M${v} 0V300M0 ${v}H200`} />)}</g>
          <path d={d} strokeWidth="3.5" />
        </g>
      );
    }
    case "Ciências da Natureza":
      return (
        <g {...comum} transform={`translate(${70 + a * 70} ${70 + b * 50}) rotate(${c * 90})`}>
          {[0, 60, 120].map((g) => <ellipse key={g} rx="96" ry="34" transform={`rotate(${g})`} />)}
          <circle r="11" fill={cor} stroke="none" />
          <circle cx={96} r="6" fill={cor} stroke="none" />
          <circle cx={-48} cy={-72} r="4.5" fill={cor} stroke="none" />
        </g>
      );
    case "Ciências Humanas e Sociais Aplicadas":
      // Curvas de nível, como em um mapa.
      return (
        <g {...comum} transform={`translate(${60 + a * 90} ${60 + b * 70})`}>
          {[20, 42, 66, 92, 120, 150, 182].map((r, i) => (
            <path key={r} d={`M${-r} 0C${-r} ${-r * (0.7 + c * 0.4)} ${r * 0.8} ${-r * 0.9} ${r} ${i * 3}S${-r * 0.4} ${r * (0.9 + a * 0.3)} ${-r} 0Z`} opacity={1 - i * 0.1} />
          ))}
        </g>
      );
    case "Linguagens e Códigos":
      return (
        <text x={-12 + a * 30} y={210} fontSize="260" fontWeight="800" fill={cor} opacity=".13" style={{ fontStretch: "75%" }}>
          {"AÇÉGQR"[Math.floor(b * 6)]}
        </text>
      );
    case "Tecnologia e Computação": {
      // Trilhas em ângulo reto, como em um circuito.
      const trilhas = Array.from({ length: 7 }, (_, i) => {
        const y = 18 + i * 26;
        const x = 20 + h(id, i + 4) * 120;
        return `M0 ${y}H${x}L${x + 22} ${y + 22}H200`;
      });
      return (
        <g {...comum}>
          {trilhas.map((d) => <path key={d} d={d} />)}
          {trilhas.map((_, i) => <rect key={i} x={36 + h(id, i + 12) * 130} y={14 + i * 26} width="7" height="7" fill={cor} stroke="none" />)}
        </g>
      );
    }
    case "Meio Ambiente":
      return (
        <g {...comum} strokeWidth="2.2">
          {Array.from({ length: 9 }, (_, i) => {
            const y = 20 + i * 22;
            const am = 6 + i * 2 + a * 8;
            return <path key={i} d={`M-10 ${y}q25 ${-am} 50 0t50 0t50 0t50 0t50 0`} opacity={0.35 + i * 0.07} transform={`translate(${-b * 40 * (i % 2)} 0)`} />;
          })}
        </g>
      );
    case "Educação Financeira e Gestão":
      return (
        <g fill={cor}>
          {Array.from({ length: 9 }, (_, i) => {
            const alt = 24 + i * 14 + h(id, i + 20) * 34;
            return <rect key={i} x={8 + i * 21} y={190 - alt} width="14" height={alt} opacity=".85" />;
          })}
        </g>
      );
    default: {
      // Rede de nós, mesma família da molécula do Ceará Científico.
      const nos = Array.from({ length: 9 }, (_, i) => [15 + h(id, i + 30) * 170, 12 + h(id, i + 40) * 170, 3 + h(id, i + 50) * 9] as const);
      return (
        <g {...comum}>
          {nos.slice(1).map(([x, y], i) => <line key={i} x1={nos[i][0]} y1={nos[i][1]} x2={x} y2={y} />)}
          {nos.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={cor} stroke="none" />)}
        </g>
      );
    }
  }
}

export function ArteCartaz({ id, area, className }: { id: string; area: string; className?: string }) {
  const t = temaDe(area);
  return (
    <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className} style={{ background: t.fundo }}>
      <Desenho area={area} id={id} cor={t.traco} />
    </svg>
  );
}
