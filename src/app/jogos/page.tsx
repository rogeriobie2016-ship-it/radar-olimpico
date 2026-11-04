import type { Metadata } from "next";
import { ArteCartaz } from "@/components/Cartaz";
import Link from "@/components/L";
import { Mascote } from "@/components/Mascote";
import { JOGOS } from "@/lib/jogos";

export const metadata: Metadata = {
  title: "Jogos",
  description: "Jogos para treinar para o Ceará Científico, OBMEP, OBA, OBI, ONHB e olimpíadas de Química.",
};

const ARTE: Record<string, string> = {
  "jornada-cientifica": "Multidisciplinar",
  escada: "Educação Financeira e Gestão",
  alvo: "Matemática",
  lancamento: "Ciências da Natureza",
  algoritmo: "Tecnologia e Computação",
  "linha-do-tempo": "Ciências Humanas e Sociais Aplicadas",
  balanco: "Meio Ambiente",
  "orbita-numerica": "Matemática",
};

export default function JogosPagina() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <div className="flex items-end justify-between gap-2">
        <h1>Jogos</h1>
        <Mascote quem="menino" pose="comemora" className="w-24 shrink-0 sm:w-32" />
      </div>
      <p className="max-w-xl text-[1.1875rem] leading-snug">Cada jogo treina o raciocínio de uma olimpíada, com um dos cientistas da JOC narrando. Bate o recorde e ganha carimbo no passaporte.</p>
      <ul className="grid gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {JOGOS.map((j) => (
          <li key={j.slug}>
            <Link href={`/jogos/${j.slug}/`} className="group block no-underline">
              <span className="azulejo block aspect-[3/2] overflow-hidden">
                <ArteCartaz id={j.slug} area={ARTE[j.slug]} className="size-full transition-transform duration-700 ease-out group-hover:scale-105" />
              </span>
              <span className="estreito mt-2.5 block text-[2.25rem] font-bold leading-none">{j.titulo}</span>
              <span className="mt-1 block text-sm font-medium text-marca-forte">{j.olimpiada}</span>
              <span className="mt-1 block text-[0.9375rem] text-tinta-2">{j.resumo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
