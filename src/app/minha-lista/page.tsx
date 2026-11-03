import type { Metadata } from "next";
import { ListaCliente } from "./ListaCliente";
import { resumos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Minha lista",
  description: "Oportunidades salvas neste aparelho, sem precisar de login.",
  robots: { index: false },
};

export default function MinhaListaPagina() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-6">
      <h1>Minha lista</h1>
      <h2 className="sr-only">Oportunidades salvas</h2>
      <ListaCliente itens={resumos} />
    </div>
  );
}
