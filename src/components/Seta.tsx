/** Seta desenhada na mesma espessura das réguas. É o único ícone recorrente do site. */
export function Seta({ tamanho = 18, direcao = "direita", className }: { tamanho?: number; direcao?: "direita" | "esquerda" | "externo" | "baixo"; className?: string }) {
  const giro = { direita: 0, esquerda: 180, externo: -45, baixo: 90 }[direcao];
  return (
    <svg aria-hidden="true" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} style={{ transform: `rotate(${giro}deg)`, flex: "none", transition: "transform 200ms var(--curva)" }}>
      <path d="M3 12h17.5M14 5.5l6.5 6.5-6.5 6.5" />
    </svg>
  );
}
