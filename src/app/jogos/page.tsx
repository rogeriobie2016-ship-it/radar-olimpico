import type { Metadata } from "next";
import { ArteCartaz } from "@/components/Cartaz";
import Link from "@/components/L";
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
};

export default function JogosPagina() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <h1>Jogos</h1>
      <p className="max-w-xl text-[1.1875rem] leading-snug">Treinos curtos, cada um ligado ao raciocínio de uma olimpíada. Funcionam no celular e guardam o seu recorde.</p>
      <ul className="regua grid gap-x-3 gap-y-6 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {JOGOS.map((j) => (
          <li key={j.slug}>
            <Link href={`/jogos/${j.slug}/`} className="group block no-underline">
              <span className="block aspect-[3/2] overflow-hidden">
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
