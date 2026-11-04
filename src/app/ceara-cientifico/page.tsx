import type { Metadata } from "next";
import { EtapasAnimadas, Molecula, NumeroCC } from "./Animados";
import { Galeria } from "./Galeria";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { asset } from "@/lib/base";
import { cearaCientifico as cc } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Ceará Científico",
  description: "A feira de ciências da rede estadual: etapas escolar, regional e estadual, categorias, áreas, números e como levar um projeto até lá.",
  openGraph: { images: [{ url: "og/ceara-cientifico.png", width: 1200, height: 630, alt: "Ceará Científico" }] },
};

export default function CearaCientificoPagina() {
  const ultima = [...cc.edicoes].sort((a, b) => b.ano - a.ano)[0];
  const e = ultima.etapaEstadual;
  const estudantes = Number(e.estudantes.replace(/\D/g, ""));

  return (
    <>
      <section className="relative overflow-hidden bg-cc-fundo text-white">
        <Molecula className="absolute -right-24 -top-10 w-[26rem] text-[#2e8f54] opacity-50 sm:right-0 sm:top-4 sm:w-[38rem] sm:opacity-90" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 pb-10 pt-8 sm:pb-16 sm:pt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logos/ceara-cientifico.webp")} alt="Ceará Científico" width={640} height={337} fetchPriority="high" className="h-auto w-40 bg-white p-2.5 sm:w-52" />
          <h1 className="max-w-3xl">Ceará Científico</h1>
          <p className="max-w-xl text-[1.1875rem] leading-snug">{cc.resumo}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/jogos/jornada-cientifica/" className="btn btn-marca">
              Jogar a Jornada Científica
              <Seta />
            </Link>
            <a href={cc.portal} target="_blank" rel="noopener noreferrer" className="btn border-[1.5px] border-white hover:bg-white hover:text-[#111210]">
              Portal Educação Científica
              <Seta direcao="externo" />
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-10">
        <section aria-labelledby="etapas">
          <h2 id="etapas" className="mb-5">Três etapas</h2>
          <EtapasAnimadas etapas={cc.etapas} />
        </section>

        <section aria-labelledby="numeros">
          <h2 id="numeros">Etapa estadual de {ultima.ano}</h2>
          <p className="mb-4 mt-1 text-[0.9375rem] text-tinta-2">
            {e.datas}, {e.local}. Fonte: {ultima.fonte}.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
            <NumeroCC valor={e.projetos} rotulo="projetos" />
            <NumeroCC valor={e.escolas} rotulo="escolas" />
            <NumeroCC valor={estudantes} prefixo={e.estudantes.includes("mais") ? "+" : ""} rotulo="estudantes" />
            <NumeroCC valor={e.municipios} rotulo="municípios" />
          </dl>
        </section>

        <section className="grid gap-10 md:grid-cols-2" aria-label="Categorias e áreas">
          <div>
            <h2 className="regua mb-3 uppercase">Categorias</h2>
            <ul className="border-t border-linha">
              {cc.categorias.lista.map((c) => {
                const [nome, texto] = c.split(": ");
                return (
                  <li key={c} className="border-b border-linha py-2.5">
                    <span className="font-semibold">{nome}</span>
                    {texto && <span className="block text-[0.9375rem] text-tinta-2">{texto}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h2 className="regua mb-3 uppercase">Áreas de pesquisa</h2>
            <ul className="border-t border-linha">
              {cc.areas.map((a) => (
                <li key={a} className="border-b border-linha py-2.5 font-semibold">{a}</li>
              ))}
            </ul>
            <a href={cc.regulamento} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block text-[0.9375rem]">
              Regulamento 2026 (PDF)
            </a>
          </div>
        </section>

        <section aria-labelledby="como-chegar">
          <h2 id="como-chegar" className="regua mb-3 uppercase">Como um projeto chega lá</h2>
          <ol className="grid border-t border-linha md:grid-cols-2 md:gap-x-8">
            {cc.comoChegar.map((p, i) => (
              <li key={p.titulo} className="grid grid-cols-[2.25rem_1fr] border-b border-linha py-3">
                <span className="estreito num text-[1.75rem] font-bold leading-none text-cc-verde">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{p.titulo}</span>
                  <span className="text-[0.9375rem]">{p.texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="galeria">
          <h2 id="galeria" className="regua mb-4 uppercase">Projetos e ganhadores</h2>
          <Galeria ganhadores={cc.ganhadores} areas={cc.areas} anos={cc.edicoes.map((x) => x.ano)} />
        </section>

        <section aria-labelledby="revista" className="grid items-center gap-5 bg-cc-fundo p-5 text-white sm:grid-cols-[9rem_1fr]">
          <div className="grid aspect-[3/4] w-28 place-items-center border border-white/40 p-2 text-center text-sm sm:w-full">
            {cc.revista.capa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(cc.revista.capa)} alt={`Capa da ${cc.revista.titulo}`} loading="lazy" className="size-full object-cover" />
            ) : (
              <span className="italic">capa a confirmar</span>
            )}
          </div>
          <div>
            <h2 id="revista" className="titulo-2">{cc.revista.titulo}</h2>
            <p className="mt-1 text-[0.9375rem]">{cc.revista.link ? "Leia os projetos da rede na revista." : "Capa e link da edição atual a confirmar com a COPES."}</p>
            {cc.revista.link && (
              <a href={cc.revista.link} target="_blank" rel="noopener noreferrer" className="btn btn-marca mt-3">
                Ler a revista
              </a>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
