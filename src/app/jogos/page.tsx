import type { Metadata } from "next";
import Link from "@/components/L";
import { CAMPOS, hrefRadar } from "@/lib/campos";
import { JOGOS, type Jogo } from "@/lib/jogos";

export const metadata: Metadata = {
  title: "Jogos",
  description: "Jogos de todas as áreas para se preparar para as olimpíadas: matemática, linguagens, línguas estrangeiras, ciências da natureza, humanas e tecnologia.",
};

const porSlug = new Map(JOGOS.map((j) => [j.slug, j]));

function Cartao({ j, estilo }: { j: Jogo; estilo: string }) {
  return (
    <Link href={`/jogos/${j.slug}/`} className="cartao-vidro flex h-full flex-col gap-1.5 p-4 no-underline">
      <span className="text-[0.8125rem] font-bold text-tinta-2">{estilo}</span>
      <span className="estreito text-[1.3rem] leading-tight">{j.titulo}</span>
      <span className="text-[0.9375rem] leading-snug text-tinta-2">{j.resumo}</span>
      <span className="mt-auto pt-2 text-[0.8125rem] font-bold">{j.olimpiada}</span>
    </Link>
  );
}

export default function JogosPagina() {
  const usados = new Set(CAMPOS.flatMap((c) => c.jogos.map(([s]) => s)));
  // Um jogo novo aparece mesmo antes de ganhar campo aqui.
  const outros = JOGOS.filter((j) => !usados.has(j.slug));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6">
      <header className="flex flex-col gap-2">
        <h1 className="!text-[clamp(2rem,6vw,3.25rem)] !normal-case">Jogos</h1>
        <p className="max-w-xl text-tinta-2">Escolha um campo e treine jogando. Cada jogo explica o erro, para você aprender de verdade.</p>
        <Link href="/estudos/" className="link w-fit text-[0.9375rem]">
          Quer um plano de estudo? Vá para a Biblioteca de Estudos
        </Link>
      </header>
      <Link href="/estudos/planeta/" className="cartao-vidro plan-porta flex flex-col gap-1.5 p-5 no-underline">
        <span className="text-[0.8125rem] font-bold text-tinta-2">Aventura em 3D com vídeos de todas as áreas</span>
        <span className="estreito text-[1.6rem] leading-tight">Planeta Estante</span>
        <span className="text-[0.9375rem] leading-snug text-tinta-2">Explore o planeta a pé, carimbe as estantes e procure as fitas douradas.</span>
      </Link>
      {CAMPOS.map((c) => {
        const lista = c.jogos.filter(([s]) => porSlug.has(s));
        if (!lista.length) return null;
        return (
          <section key={c.id} id={c.id} aria-label={c.titulo} className="scroll-mt-20">
            <h2 className="flex items-center gap-2.5">
              <span aria-hidden="true" className="ponto-campo" style={{ background: c.cor }} />
              {c.titulo}
            </h2>
            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem]">
              <Link href={hrefRadar(c)} className="link">{c.rotuloRadar}</Link>
              <Link href={c.estudo} className="link">{c.rotuloEstudo}</Link>
            </p>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map(([s, estilo]) => (
                <li key={s}>
                  <Cartao j={porSlug.get(s)!} estilo={estilo} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {outros.length > 0 && (
        <section aria-label="Outros jogos">
          <h2>Outros jogos</h2>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {outros.map((j) => (
              <li key={j.slug}>
                <Cartao j={j} estilo="Jogo" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
