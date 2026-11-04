import type { Metadata } from "next";
import { Carrossel } from "@/components/Carrossel";
import { Cabecalho } from "@/components/estudos/Cabecalho";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { areasEstudo } from "@/lib/estudos";

export const metadata: Metadata = {
  title: "Biblioteca de Estudos",
  description: "Como estudar com base em pesquisa, plano semanal, temporizador de foco, baralhos de revisão, provas antigas por área e dicas culturais. Tudo gratuito, sem conta.",
};

const FERRAMENTAS = [
  { href: "/estudos/plano/", titulo: "Plano da semana", texto: "Diga quanto tempo tem e quais olimpíadas quer. O plano sai pronto." },
  { href: "/estudos/foco/", titulo: "Foco", texto: "Temporizador com pausa marcada." },
  { href: "/estudos/revisao/", titulo: "Baralhos", texto: "Cartões que voltam na hora certa." },
];

export default function EstudosPagina() {
  return (
    <div className="est-ambiente">
      <div className="est-pagina">
        <Cabecalho titulo="Biblioteca de Estudos" frase="Aprenda a estudar e chegue pronto na olimpíada. Grátis, sem conta, tudo salvo só no seu aparelho." voltar={false} />

        <section aria-labelledby="planeta">
          <Link href="/estudos/planeta/" className="est-vidro est-destaque plan-porta">
            <span className="est-rotulo" id="planeta">Jogo em 3D</span>
            <span className="est-destaque-titulo">Planeta Estante</span>
            <span className="est-texto">Ande por um mundinho redondo, chegue nas estantes e puxe os vídeos de cada área.</span>
            <Seta className="mt-2" />
          </Link>
        </section>

        <section aria-labelledby="comece">
          <Link href="/estudos/como-estudar/" className="est-vidro est-destaque">
            <span className="est-rotulo" id="comece">Comece aqui</span>
            <span className="est-destaque-titulo">Como estudar</span>
            <span className="est-texto">Seis técnicas com pesquisa por trás, em linguagem direta.</span>
            <Seta className="mt-2" />
          </Link>
        </section>

        <section aria-labelledby="ferramentas" className="flex flex-col gap-5">
          <h2 id="ferramentas" className="est-secao">Ferramentas</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {FERRAMENTAS.map((f) => (
              <li key={f.href}>
                <Link href={f.href} className="est-vidro est-cartao">
                  <span className="est-cartao-titulo">{f.titulo}</span>
                  <span className="est-texto">{f.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="areas-titulo" id="areas" className="flex flex-col gap-5">
          <h2 id="areas-titulo" className="est-secao">Preparação por área</h2>
          <Carrossel rotulo="Áreas de estudo" classe="gap-3 pb-1">
            {areasEstudo.map((a) => (
              <Link key={a.slug} href={`/estudos/area/${a.slug}/`} className="est-vidro est-cartao est-cartao-area">
                <span className="est-cartao-titulo">{a.titulo}</span>
                <span className="est-texto">{a.resumo}</span>
              </Link>
            ))}
          </Carrossel>
        </section>

        <section aria-labelledby="cultura">
          <Link href="/estudos/cultura/" className="est-vidro est-destaque">
            <span className="est-rotulo" id="cultura">Fora da prova</span>
            <span className="est-destaque-titulo">Dicas culturais</span>
            <span className="est-texto">Filmes, livros, podcasts, canais e lugares para visitar, inclusive no Ceará.</span>
            <Seta className="mt-2" />
          </Link>
        </section>
      </div>
    </div>
  );
}
