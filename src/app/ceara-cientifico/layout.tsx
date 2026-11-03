import { Archivo_Black } from "next/font/google";
import type { ReactNode } from "react";

// A fonte larga, próxima do logo do Ceará Científico, só é carregada nesta aba.
const fonte = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--fonte-cc", display: "swap" });

export default function LayoutCearaCientifico({ children }: { children: ReactNode }) {
  return <div className={`${fonte.variable} tema-cc`}>{children}</div>;
}
