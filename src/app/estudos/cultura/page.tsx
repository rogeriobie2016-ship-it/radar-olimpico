import type { Metadata } from "next";
import { Cabecalho } from "@/components/estudos/Cabecalho";
import { cultura } from "@/lib/estudos";
import { CulturaCliente } from "./CulturaCliente";

export const metadata: Metadata = {
  title: "Dicas culturais",
  description: "Filmes, documentários, livros, podcasts, canais e lugares para visitar no Ceará, com autoria, ano e fonte conferidos.",
};

export default function CulturaPagina() {
  return (
    <div className="est-ambiente">
      <div className="est-pagina">
        <Cabecalho titulo="Dicas culturais" frase="Para ver, ler, ouvir e visitar. De preferência de graça, e bem perto de você." />
        <CulturaCliente itens={cultura} />
        <p className="est-nota">Autoria, ano e links conferidos em 04/11/2026. A classificação aparece só quando há fonte; confira também com a sua família ou escola.</p>
      </div>
    </div>
  );
}
