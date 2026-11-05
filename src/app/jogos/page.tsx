import type { Metadata } from "next";
import { Carrossel } from "@/components/Carrossel";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { asset } from "@/lib/base";
import { CAMPOS, hrefRadar } from "@/lib/campos";
import { JOGOS, type Jogo } from "@/lib/jogos";

export const metadata: Metadata = {
  title: "Jogos",
  description: "Jogos de todas as áreas para se preparar para as olimpíadas: matemática, linguagens, línguas estrangeiras, ciências da natureza, humanas e tecnologia.",
};

const porSlug = new Map(JOGOS.map((j) => [j.slug, j]));
const estiloDe = new Map(CAMPOS.flatMap((c) => c.jogos));

function Capa({ j }: { j: Jogo }) {
  return (
    <Link href={`/jogos/${j.slug}/`} className="capa-jogo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(`/capas/${j.slug}.webp`)} alt="" width={600} height={840} loading="lazy" decoding="async" />
      <span className="capa-jogo-texto">
        <span className="capa-jogo-estilo">{estiloDe.get(j.slug) ?? "Jogo"}</span>
        <span className="capa-jogo-titulo">{j.titulo}</span>
        <span className="capa-jogo-resumo">{j.resumo}</span>
      </span>
    </Link>
  );
}

function Fileira({ rotulo, jogos }: { rotulo: string; jogos: Jogo[] }) {
  return (
    <div className="-mx-4 min-w-0">
      <Carrossel rotulo={rotulo} classe="gap-3.5 px-4">
        {jogos.map((j) => (
          <div key={j.slug} className="capa-fileira">
            <Capa j={j} />
          </div>
        ))}
      </Carrossel>
    </div>
  );
}

export default function JogosPagina() {
  const usados = new Set(CAMPOS.flatMap((c) => c.jogos.map(([s]) => s)));
  // Um jogo novo aparece mesmo antes de ganhar campo aqui.
  const outros = JOGOS.filter((j) => !usados.has(j.slug));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 pt-6">
      <header className="flex flex-col gap-2">
        <h1 className="!text-[clamp(2rem,6vw,3.25rem)] !normal-case">Jogos</h1>
        <p className="max-w-xl text-tinta-2">Escolha uma capa e treine jogando. Cada jogo explica o erro, para você aprender de verdade.</p>
        <Link href="/estudos/" className="link w-fit text-[0.9375rem]">
          Quer um plano de estudo? Vá para a Biblioteca de Estudos
        </Link>
      </header>

      <Link href="/estudos/planeta/" className="capa-destaque">
        <picture>
          <source media="(min-width: 768px)" srcSet={asset("/capas/planeta-destaque.webp")} width={1600} height={640} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/capas/planeta-estante.webp")} alt="" width={600} height={840} fetchPriority="high" />
        </picture>
        <span className="capa-destaque-texto">
          <span className="capa-selo">Novo</span>
          <span className="capa-destaque-titulo">Planeta Estante</span>
          <span className="capa-destaque-frase">Explore um mundinho a pé, puxe vídeos das estantes de cada área e procure as fitas douradas.</span>
          <span className="capa-botao">
            Jogar agora
            <Seta />
          </span>
        </span>
      </Link>

      <section aria-labelledby="todos-jogos">
        <h2 id="todos-jogos">Todos os jogos</h2>
        <Fileira rotulo="Todos os jogos" jogos={JOGOS} />
      </section>

      {CAMPOS.map((c) => {
        const lista = c.jogos.map(([s]) => porSlug.get(s)).filter((j): j is Jogo => !!j);
        if (!lista.length) return null;
        return (
          <section key={c.id} id={c.id} aria-labelledby={`titulo-${c.id}`} className="scroll-mt-20">
            <h2 id={`titulo-${c.id}`} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="ponto-campo" style={{ background: c.cor }} />
              {c.titulo}
            </h2>
            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem]">
              <Link href={hrefRadar(c)} className="link">{c.rotuloRadar}</Link>
              <Link href={c.estudo} className="link">{c.rotuloEstudo}</Link>
            </p>
            <Fileira rotulo={`Jogos: ${c.titulo}`} jogos={lista} />
          </section>
        );
      })}

      {outros.length > 0 && (
        <section aria-labelledby="outros-jogos">
          <h2 id="outros-jogos">Outros jogos</h2>
          <Fileira rotulo="Outros jogos" jogos={outros} />
        </section>
      )}
    </div>
  );
}
