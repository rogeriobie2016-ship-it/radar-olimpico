import type { Metadata } from "next";
import { QuizCliente } from "./QuizCliente";
import { resumos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Descubra sua olimpíada",
  description: "Cinco perguntas rápidas para encontrar as olimpíadas e feiras que combinam com você.",
};

export default function DescubraPagina() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5">
      <div>
        <h1 className="text-3xl font-black">Descubra sua olimpíada</h1>
        <p className="mt-1 text-tinta-2">Nunca participou? Responda cinco perguntas e veja por onde começar.</p>
      </div>
      <QuizCliente itens={resumos} />
    </div>
  );
}
