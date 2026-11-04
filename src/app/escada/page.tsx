import type { Metadata } from "next";
import { EscadaCliente } from "./EscadaCliente";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { cearaCientifico, oportunidades, resumos } from "@/lib/dados";
import { ROTULO_NIVEL } from "@/lib/rotulos";

export const metadata: Metadata = {
  title: "Escada Olímpica",
  description: "Quiz para descobrir as olimpíadas e feiras certas para você e a sua escola, com um caminho em degraus e a explicação de cada escolha.",
};

const NIVEIS = ["internacional", "nacional", "estadual", "regional", "escolar"];

export default function EscadaPagina() {
  const ligacoes = oportunidades.flatMap((o) => o.credenciaPara.map((d) => ({ de: o, para: oportunidades.find((x) => x.id === d)! })));
  const externos = oportunidades.flatMap((o) => o.desbloqueia.filter((d) => d.tipo === "credenciamento" && !o.credenciaPara.length && !["ceara-cientifico", "alunos-que-inspiram"].includes(o.id)).map((d) => ({ o, texto: d.texto })));
  const nome = (o: { sigla: string | null; nome: string }) => o.sigla ?? o.nome;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 pt-6">
      <EscadaCliente itens={resumos} />

      <section className="sem-print">
        <div className="regua flex items-center justify-between gap-4 pt-3">
          <h2>Os degraus</h2>
          <Link href="/jogos/escada/" className="link shrink-0 text-[0.9375rem]">
            Jogar a Escada
          </Link>
        </div>
        <ol className="mt-4 flex flex-col gap-1.5">
          {NIVEIS.map((n, i) => {
            const lista = resumos.filter((r) => r.nivel === n);
            const etapas = cearaCientifico.etapas.filter((e) => e.nivel === n).length;
            return (
              <li key={n} style={{ marginRight: `${i * 7}%` }}>
                <details className="group">
                  <summary className="azulejo flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3" style={{ background: ["#f8a8c8", "#00c9c8", "#f58a33", "#fdc13f", "#ffffff"][i], color: "#10201f" }}>
                    <span className="estreito text-[1.5rem] leading-none">{ROTULO_NIVEL[n]}</span>
                    <span className="estreito num text-sm">{lista.length + etapas}</span>
                  </summary>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 p-3 text-[0.9375rem]">
                    {etapas > 0 && (
                      <li>
                        <Link href="/ceara-cientifico/" className="link">
                          Ceará Científico, etapa {n}
                        </Link>
                      </li>
                    )}
                    {lista.map((r) => (
                      <li key={r.id}>
                        <Link href={`/oportunidade/${r.slug}/`} className="link">
                          {nome(r)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="sem-print">
        <h2 className="regua uppercase">Caminhos confirmados</h2>
        <p className="mt-2 max-w-xl text-[0.9375rem] text-tinta-2">Só o que está escrito nos documentos da COPES e nas fichas oficiais.</p>
        <ul className="mt-4">
          <li className="linha-lista flex flex-wrap items-center gap-x-3 gap-y-1 py-3 font-bold">
            Etapa escolar <Seta tamanho={16} /> Etapa regional <Seta tamanho={16} /> Etapa estadual
          </li>
          {ligacoes.map(({ de, para }) => (
            <li key={`${de.id}-${para.id}`} className="linha-lista flex flex-wrap items-center gap-x-3 gap-y-1 py-3 font-bold">
              <Link href={`/oportunidade/${de.slug}/`} className="link">{nome(de)}</Link>
              <Seta tamanho={16} />
              <Link href={`/oportunidade/${para.slug}/`} className="link">{nome(para)}</Link>
            </li>
          ))}
          {externos.map(({ o, texto }) => (
            <li key={o.id} className="linha-lista py-3 text-[0.9375rem]">
              <Link href={`/oportunidade/${o.slug}/`} className="link font-semibold">{nome(o)}</Link>
              <span className="block text-tinta-2">{texto}.</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
