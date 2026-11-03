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
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-6">
      <h1>Calendário</h1>
      <p className="text-tinta-2">
        {comData} das {resumos.length} oportunidades têm data confirmada nos documentos da COPES.
      </p>
      <AvisoRadar itens={resumos} edicao={meta.ultimaEdicaoRadar} />
      <CalendarioCliente itens={resumos} />
    </div>
  );
}
