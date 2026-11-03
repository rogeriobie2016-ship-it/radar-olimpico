import type { Metadata } from "next";
import { CalendarioCliente } from "./CalendarioCliente";
import { AvisoRadar } from "@/components/AvisoRadar";
import { meta, resumos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Calendário",
  description: "Prazos de inscrição de olimpíadas e eventos científicos, com exportação para a agenda do celular.",
};

export default function CalendarioPagina() {
  const comData = resumos.filter((r) => r.fim || r.inicio || r.provas.length).length;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5">
      <div>
        <h1 className="text-3xl font-black">Calendário</h1>
        <p className="mt-1 text-tinta-2">
          {comData} de {resumos.length} oportunidades têm data confirmada nos documentos da COPES.
        </p>
      </div>
      <AvisoRadar itens={resumos} edicao={meta.ultimaEdicaoRadar} />
      <CalendarioCliente itens={resumos} />
    </div>
  );
}
