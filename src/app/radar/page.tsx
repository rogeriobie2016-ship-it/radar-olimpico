import type { Metadata } from "next";
import { RadarCliente } from "./RadarCliente";
import { AvisoRadar } from "@/components/AvisoRadar";
import { meta, resumos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Radar",
  description: "Catálogo de olimpíadas, feiras e eventos científicos para a rede estadual do Ceará, com filtros por série, área e prazo.",
};

export default function RadarPagina() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-6">
      <h1>Radar</h1>
      <AvisoRadar itens={resumos} edicao={meta.ultimaEdicaoRadar} />
      <h2 className="sr-only">Oportunidades</h2>
      <RadarCliente itens={resumos} />
    </div>
  );
}
