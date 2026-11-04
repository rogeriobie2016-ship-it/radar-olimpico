import type { Metadata } from "next";
import { Cabecalho, LinkExterno } from "@/components/estudos/Cabecalho";
import { fonteDe, tecnicas } from "@/lib/estudos";
import { FocoCliente } from "./FocoCliente";

export const metadata: Metadata = {
  title: "Foco",
  description: "Temporizador de foco com pausa marcada. Funciona no aparelho, sem conta.",
};

export default function FocoPagina() {
  return (
    <div className="est-ambiente">
      <div className="est-pagina est-pagina-estreita">
        <Cabecalho titulo="Foco" frase="Um assunto por vez, celular longe, pausa com hora marcada." />
        <FocoCliente />
        <section aria-labelledby="pausa" className="flex flex-col gap-3">
          <h2 id="pausa" className="est-rotulo">Por que pausa marcada?</h2>
          <p className="est-texto">
            {tecnicas.pausas.texto}{" "}
            <span className="est-cita">
              (
              {tecnicas.pausas.fontes.map((id) => {
                const f = fonteDe(id);
                return f ? (
                  <LinkExterno key={id} href={f.url}>
                    {f.citacao}
                  </LinkExterno>
                ) : null;
              })}
              )
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}
