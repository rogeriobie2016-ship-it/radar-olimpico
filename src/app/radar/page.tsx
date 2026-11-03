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
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-5">
      <div>
        <h1 className="text-3xl font-black">Radar</h1>
        <p className="mt-1 text-tinta-2">Olimpíadas, feiras e programas para estudantes da rede estadual do Ceará.</p>
      </div>
      <AvisoRadar itens={resumos} edicao={meta.ultimaEdicaoRadar} />
      <RadarCliente itens={resumos} />
    </div>
  );
}
