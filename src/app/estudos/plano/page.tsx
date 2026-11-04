import type { Metadata } from "next";
import { Cabecalho } from "@/components/estudos/Cabecalho";
import { oportunidades } from "@/lib/dados";
import { areasEstudo } from "@/lib/estudos";
import { PlanoCliente, type OlimpiadaPlano } from "./PlanoCliente";

export const metadata: Metadata = {
  title: "Plano da semana",
  description: "Monte um plano semanal de estudos a partir do seu tempo e das olimpíadas que você escolheu. Fica só no seu aparelho.",
};

// Só o necessário para a escolha: a lista vai junto com a página.
const olimpiadas: OlimpiadaPlano[] = oportunidades
  .filter((o) => o.tipo === "olimpiada")
  .map((o) => ({ id: o.id, slug: o.slug, nome: o.nome, sigla: o.sigla, fim: o.inscricoes.fim, provas: o.provas }))
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

// A primeira olimpíada de cada área serve de sugestão para quem chega sem saber por onde começar.
const sugestoes = areasEstudo.map((a) => a.oportunidades[0]).filter(Boolean);

export default function PlanoPagina() {
  return (
    <div className="est-ambiente">
      <div className="est-pagina">
        <Cabecalho titulo="Plano da semana" frase="Diga quanto tempo tem e o que quer disputar. O plano espalha o estudo pelos dias e mistura os assuntos." />
        <PlanoCliente olimpiadas={olimpiadas} sugestoes={sugestoes} />
        <p className="est-nota">Fica salvo só neste aparelho. A divisão é uma sugestão, não uma regra da pesquisa: ajuste como funcionar para você. As datas vêm das fichas do Radar.</p>
      </div>
    </div>
  );
}
