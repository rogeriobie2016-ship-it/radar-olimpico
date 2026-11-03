import type { Metadata } from "next";
import { ListaCliente } from "./ListaCliente";
import { resumos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Minha lista",
  description: "Suas oportunidades salvas neste aparelho, sem precisar de login.",
  robots: { index: false },
};

export default function MinhaListaPagina() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-5">
      <h1 className="text-3xl font-black">Minha lista</h1>
      <h2 className="sr-only">Oportunidades salvas</h2>
      <ListaCliente itens={resumos} />
    </div>
  );
}
