import type { Metadata } from "next";
import { EtapasAnimadas, Molecula, NumeroAtomo } from "./Animados";
import { Galeria } from "./Galeria";
import { Icone } from "@/components/Icone";
import { asset } from "@/lib/base";
import { cearaCientifico as cc } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Ceará Científico",
  description: "A feira de ciências da rede estadual: etapas escolar, regional e estadual, categorias, números e como levar seu projeto até lá.",
  openGraph: { images: [{ url: "og/ceara-cientifico.png", width: 1200, height: 630, alt: "Ceará Científico" }] },
};

export default function CearaCientificoPagina() {
  const ultima = [...cc.edicoes].sort((a, b) => b.ano - a.ano)[0];
  const e = ultima.etapaEstadual;
  const estudantes = Number(e.estudantes.replace(/\D/g, ""));

  return (
    <>
      <section className="relative overflow-hidden bg-[#143f26] text-white">
        <Molecula className="absolute -right-20 -top-12 w-[22rem] text-[#3fb56f] opacity-45 sm:right-4 sm:top-2 sm:w-[34rem] sm:opacity-90" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-8 pt-6 sm:pb-14 sm:pt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logos/ceara-cientifico.webp")} alt="Ceará Científico" width={640} height={337} fetchPriority="high" className="h-auto w-44 rounded-2xl bg-white p-2.5 sm:w-56" />
          <h1 className="max-w-xl text-[2.35rem] leading-[1.05] sm:text-6xl">
            A ciência da sua escola <span className="text-[#ff9a68]">em cena.</span>
          </h1>
          <p className="max-w-lg font-medium">{cc.resumo}</p>
          <a href={cc.portal} target="_blank" rel="noopener noreferrer" className="btn self-start bg-cc-laranja text-[#2b1206]">
            Abrir o Portal Educação Científica
            <Icone nome="externo" tamanho={18} />
          </a>
        </div>
      </section>

      <div className="bg-cc-fundo text-cc-tinta">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10">
          <section aria-labelledby="etapas">
            <h2 id="etapas" className="mb-6 text-3xl">Três etapas, um caminho</h2>
            <EtapasAnimadas etapas={cc.etapas} />
          </section>

          <section aria-labelledby="numeros">
            <h2 id="numeros" className="text-3xl">Última edição estadual</h2>
            <p className="mb-4 mt-1 text-sm">
              {e.datas}, {e.local}. Fonte: {ultima.fonte}.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumeroAtomo valor={ultima.etapaEstadual.projetos} rotulo="projetos" cor="bg-cc-verde text-white" />
              <NumeroAtomo valor={ultima.etapaEstadual.escolas} rotulo="escolas" cor="bg-cc-laranja text-[#2b1206]" />
              <NumeroAtomo valor={estudantes} prefixo={e.estudantes.includes("mais") ? "+" : ""} rotulo="estudantes" cor="bg-[#143f26] text-white" />
              <NumeroAtomo valor={e.municipios} rotulo="municípios" cor="bg-[#bfe8cf] text-[#143f26]" />
            </div>
          </section>

          <section aria-labelledby="categorias">
            <h2 id="categorias" className="mb-3 text-3xl">Categorias</h2>
            <ul className="flex flex-wrap gap-2">
              {cc.categorias.lista.map((c) => (
                <li key={c} className="rounded-xl border-2 border-cc-verde bg-superficie px-3 py-2 font-bold text-tinta">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {cc.categorias.aConfirmar && <span className="selo-confirmar">a confirmar</span>}
              {cc.categorias.nota}
            </p>
          </section>

          <section aria-labelledby="como-chegar">
            <h2 id="como-chegar" className="mb-4 text-3xl">Como meu projeto chega lá</h2>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cc.comoChegar.map((p, i) => (
                <li key={p.titulo} className="flex gap-3 rounded-2xl bg-superficie p-4 text-tinta">
                  <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-cc-verde font-cc text-white">{i + 1}</span>
                  <span>
                    <span className="block text-base font-extrabold">{p.titulo}</span>
                    <span className="text-sm">{p.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="galeria">
            <h2 id="galeria" className="mb-3 text-3xl">Projetos e ganhadores</h2>
            <Galeria ganhadores={cc.ganhadores} categorias={cc.categorias.lista} anos={cc.edicoes.map((x) => x.ano)} />
          </section>

          <section aria-labelledby="revista" className="grid items-center gap-4 rounded-3xl bg-[#143f26] p-5 text-white sm:grid-cols-[10rem_1fr]">
            <div className="grid aspect-[3/4] w-32 place-items-center rounded-xl border-2 border-dashed border-white/50 p-2 text-center text-xs sm:w-full">
              {cc.revista.capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(cc.revista.capa)} alt={`Capa da ${cc.revista.titulo}`} loading="lazy" className="size-full rounded-lg object-cover" />
              ) : (
                "Capa a confirmar"
              )}
            </div>
            <div>
              <h2 id="revista" className="text-2xl">{cc.revista.titulo}</h2>
              <p className="mt-1 text-sm">{cc.revista.link ? "Leia os projetos da rede na revista." : "Capa e link da edição atual ainda a confirmar com a COPES."}</p>
              {cc.revista.link && (
                <a href={cc.revista.link} target="_blank" rel="noopener noreferrer" className="btn mt-3 bg-cc-laranja text-[#2b1206]">
                  Ler a revista
                </a>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
