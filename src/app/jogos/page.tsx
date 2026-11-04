import type { Metadata } from "next";
import Link from "@/components/L";
import { JOGOS, type Jogo } from "@/lib/jogos";

export const metadata: Metadata = {
  title: "Jogos",
  description: "Jogos de todas as áreas para se preparar para as olimpíadas: matemática, linguagens, línguas estrangeiras, ciências da natureza, humanas e tecnologia.",
};

// Cada jogo aparece no campo que mais treina, com o estilo dele à vista.
const CAMPOS: { titulo: string; cor: string; jogos: [string, string][] }[] = [
  { titulo: "Matemática", cor: "#f58a33", jogos: [["orbita-numerica", "Arcade em pixel art"], ["alvo", "Desafio de cálculo"]] },
  { titulo: "Linguagens e línguas", cor: "#fdc13f", jogos: [["lingua-galactica", "Trilha de lições"], ["arquivo-perdido", "História com escolhas"]] },
  { titulo: "Ciências da natureza", cor: "#2fd27f", jogos: [["nave-celular", "Aventura em 3D"], ["lancamento", "Simulador de física"], ["balanco", "Quebra-cabeça de química"]] },
  { titulo: "História e humanas", cor: "#e8a06a", jogos: [["crononauta", "Investigação de documentos"], ["linha-do-tempo", "Linha do tempo"]] },
  { titulo: "Tecnologia", cor: "#00c9c8", jogos: [["algoritmo", "Programação em blocos"]] },
  { titulo: "Pesquisa e olimpíadas", cor: "#c9a0ff", jogos: [["jornada-cientifica", "História de pesquisa"], ["escada", "Ritmo e perguntas"]] },
];

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
      {CAMPOS.map((c) => {
        const lista = c.jogos.filter(([s]) => porSlug.has(s));
        if (!lista.length) return null;
        return (
          <section key={c.titulo} aria-label={c.titulo}>
            <h2 className="flex items-center gap-2.5">
              <span aria-hidden="true" className="ponto-campo" style={{ background: c.cor }} />
              {c.titulo}
            </h2>
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
