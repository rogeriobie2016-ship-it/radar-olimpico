import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JogoCliente } from "./JogoCliente";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { TrilhaCampo } from "@/components/TrilhaCampo";
import { campoDoJogo } from "@/lib/campos";
import { oportunidades, resumos } from "@/lib/dados";
import { JOGOS } from "@/lib/jogos";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => JOGOS.map((j) => ({ slug: j.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const j = JOGOS.find((x) => x.slug === slug);
  return j ? { title: j.titulo, description: j.resumo } : {};
}

export default async function PaginaJogo({ params }: Props) {
  const { slug } = await params;
  const jogo = JOGOS.find((j) => j.slug === slug);
  if (!jogo) notFound();
  const ficha = oportunidades.find((o) => o.id === jogo.principal)!;
  const campo = campoDoJogo(jogo.slug);
  // Só a Escada usa dados do catálogo nas perguntas.
  const dados = slug === "escada" ? resumos.filter((r) => r.temFicha).map((r) => ({ id: r.id, sigla: r.sigla, nome: r.nome, nivel: r.nivel, area: r.areas[0], custo: r.custo, credenciaPara: r.credenciaPara })) : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-4">
      <Link href="/jogos/" className="inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-medium no-underline">
        <Seta direcao="esquerda" tamanho={16} />
        Jogos
      </Link>
      <header>
        <h1 className="!text-[clamp(2.75rem,10vw,4.5rem)]">{jogo.titulo}</h1>
        <p className="mt-2 text-tinta-2">{jogo.olimpiada}</p>
      </header>
      <JogoCliente jogo={jogo} nomeFicha={ficha.sigla && ficha.sigla.length <= 9 ? ficha.sigla : ficha.nome} slugFicha={ficha.slug} dados={dados} />
      {campo && <TrilhaCampo campo={campo} atual="jogos" />}
      <p className="text-sm text-tinta-2">Jogo de treino do Radar Olímpico, sem vínculo com a organização das olimpíadas. O recorde fica salvo só neste aparelho.</p>
    </div>
  );
}
