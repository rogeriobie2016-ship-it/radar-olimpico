import type { Metadata } from "next";
import { VistoAgora } from "./VistoAgora";
import Link from "@/components/L";
import { LogoOlimpiada } from "@/components/LogoOlimpiada";
import { Mascote } from "@/components/Mascote";
import { Novidade } from "@/components/Novidade";
import { Seta } from "@/components/Seta";
import { novidades, oportunidades } from "@/lib/dados";
import { dataExtenso } from "@/lib/rotulos";

export const metadata: Metadata = {
  title: "Novidades",
  description: "Prazos e atualizações detectados nos sites oficiais das olimpíadas e em pesquisa na web, sempre com a fonte.",
};

const ORIGEM = {
  monitor: "Detecção automática no site oficial. Confirme na fonte.",
  pesquisa: "Pesquisa na web, com a fonte aberta e lida.",
  copes: "Publicado pela COPES.",
};

export default function NovidadesPagina() {
  const { itens, verificadoEm } = novidades;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6">
      <VistoAgora data={itens[0]?.detectadoEm ?? null} />
      <div className="flex items-end justify-between gap-2">
        <h1>Novidades</h1>
        <Mascote quem="menino" pose="lupa" className="w-24 shrink-0" />
      </div>
      <p className="text-[1.0625rem]">
        O Radar abre os sites oficiais todos os dias e compara com a visita anterior. Toda semana, uma pesquisa na web procura olimpíadas novas. Cada item traz o trecho e o link da fonte.
      </p>
      {verificadoEm && <p className="text-sm text-tinta-2">Última verificação: {dataExtenso(verificadoEm)}.</p>}

      {itens.length ? (
        <ul>
          {itens.map((n) => {
            const op = oportunidades.find((o) => o.id === n.oportunidadeId);
            return (
              <li key={n.id} className="linha-lista flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Novidade />
                  <span className="num text-sm text-tinta-2">{dataExtenso(n.detectadoEm)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {op && <LogoOlimpiada id={op.id} nome={op.nome} sigla={op.sigla} className="size-16" />}
                  <h2 className="text-[1.375rem] leading-[1.08]">{n.titulo}</h2>
                </div>
                {n.trecho && <p className="text-[0.9375rem]">{n.trecho}</p>}
                <p className="text-sm text-tinta-2">{ORIGEM[n.origem]}</p>
                <div className="flex flex-wrap gap-x-5">
                  {op && (
                    <Link href={`/oportunidade/${op.slug}/`} className="link inline-flex min-h-11 items-center text-[0.9375rem]">
                      Ver ficha
                    </Link>
                  )}
                  {n.url && (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem]">
                      Abrir a fonte
                      <Seta direcao="externo" tamanho={15} />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="regua pt-4 text-tinta-2">Nenhuma novidade registrada até agora.</p>
      )}
    </div>
  );
}
