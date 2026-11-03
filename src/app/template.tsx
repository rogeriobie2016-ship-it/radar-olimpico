import type { ReactNode } from "react";

/** Transição curta entre páginas. Só opacidade, para não atrasar a leitura. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="pagina">{children}</div>;
}
