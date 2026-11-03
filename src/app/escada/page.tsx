import type { Metadata } from "next";
import { EscadaCliente } from "./EscadaCliente";
import { cearaCientifico, oportunidades, resumos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Escada olímpica",
  description: "Da escola ao mundo: veja as oportunidades de cada nível e quais eventos levam a quais.",
};

export default function EscadaPagina() {
  const destinosExternos = oportunidades.flatMap((o) =>
    o.desbloqueia.filter((d) => d.tipo === "credenciamento" && !o.credenciaPara.length && o.id !== "ceara-cientifico" && o.id !== "alunos-que-inspiram").map((d) => ({ nome: o.sigla ?? o.nome, texto: d.texto })),
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5">
      <div>
        <h1 className="text-3xl font-black">Escada olímpica</h1>
        <p className="mt-1 text-tinta-2">Toque em um degrau para ver o que existe nele. Toque em um evento com o ícone de escada para ver para onde ele leva.</p>
      </div>
      <EscadaCliente itens={resumos} etapasCC={cearaCientifico.etapas.map((e) => ({ nivel: e.nivel, nome: e.nome }))} />
      {destinosExternos.length > 0 && (
        <section className="cartao p-4">
          <h2 className="mb-2 text-xl font-extrabold">Portas para fora do catálogo</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {destinosExternos.map((d) => (
              <li key={d.nome}>
                <strong>{d.nome}:</strong> {d.texto}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
