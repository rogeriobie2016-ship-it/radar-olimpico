import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Carrossel } from "@/components/Carrossel";
import { Cabecalho, LinkExterno, LinkFonte } from "@/components/estudos/Cabecalho";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { TrilhaCampo } from "@/components/TrilhaCampo";
import { campoDoEstudo, hrefRadar } from "@/lib/campos";
import { oportunidades } from "@/lib/dados";
import { areasEstudo } from "@/lib/estudos";
import { JOGOS } from "@/lib/jogos";

export const dynamicParams = false;

export function generateStaticParams() {
  return areasEstudo.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = areasEstudo.find((x) => x.slug === slug);
  return a ? { title: `Estudar ${a.titulo}`, description: `Por onde começar, o que costuma cair e materiais gratuitos para olimpíadas de ${a.titulo}. ${a.resumo}` } : {};
}

export default async function AreaPagina({ params }: Props) {
  const { slug } = await params;
  const area = areasEstudo.find((a) => a.slug === slug);
  if (!area) notFound();

  const campo = campoDoEstudo(area.slug);
  const grupos = [...new Set(area.materiais.map((m) => m.grupo))];
  const fichas = area.oportunidades.map((id) => oportunidades.find((o) => o.id === id)).filter((o): o is (typeof oportunidades)[number] => !!o);
  const jogos = area.jogos.map((s) => JOGOS.find((j) => j.slug === s)).filter((j): j is (typeof JOGOS)[number] => !!j);

  return (
    <div className="est-ambiente">
      <div className="est-pagina">
        <Cabecalho titulo={area.titulo} frase={area.resumo} />

        {campo && <TrilhaCampo campo={campo} atual="estudos" />}
        {campo && <Link href={`/estudos/planeta/#${campo.id}`} className="link w-fit text-[0.9375rem]">Vídeos desta área no Planeta Estante</Link>}

        {area.aviso && <p className="est-vidro est-nota est-aviso" role="note">{area.aviso}</p>}

        <section aria-labelledby="comecar" className="est-vidro est-bloco">
          <h2 id="comecar" className="est-secao">Por onde começar</h2>
          <ol className="est-passos est-passos-grande">
            {area.comecar.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cai" className="flex flex-col gap-5">
          <h2 id="cai" className="est-secao">O que costuma cair</h2>
          <ul className="est-achados">
            {area.oQueCai.map((c) => (
              <li key={c.texto}>
                {c.texto} <span className="est-cita">(<LinkFonte href={c.fonte.url}>{c.fonte.rotulo}</LinkFonte>)</span>
              </li>
            ))}
          </ul>
          <p className="est-nota">As regras mudam de um ano para o outro. Confira sempre o regulamento da edição.</p>
        </section>

        <section aria-labelledby="materiais" className="flex flex-col gap-6">
          <h2 id="materiais" className="est-secao">Materiais gratuitos</h2>
          {grupos.map((g) => (
            <div key={g ?? "todos"} className="flex flex-col gap-2">
              {g && <h3 className="est-rotulo">{g}</h3>}
              <ul className="est-vidro est-materiais">
                {area.materiais
                  .filter((m) => m.grupo === g)
                  .map((m) => (
                    <li key={m.url + m.titulo}>
                      <LinkExterno href={m.url} className="est-material">
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="est-cartao-titulo">{m.titulo}</span>
                          <span className="est-texto">{m.descricao}</span>
                          <span className="est-meta">
                            {m.tipo}
                            {m.oficial ? " · Oficial" : ""}
                          </span>
                          {m.nota && <span className="est-meta">{m.nota}</span>}
                        </span>
                        <Seta direcao="externo" />
                      </LinkExterno>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <p className="est-nota">Links abertos e conferidos em 04/11/2026. Viu um link quebrado? Avise a COPES.</p>
        </section>

        {jogos.length > 0 && (
          <section aria-labelledby="jogos" className="flex flex-col gap-5">
            <h2 id="jogos" className="est-secao">Treine jogando</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {jogos.map((j) => (
                <li key={j.slug}>
                  <Link href={`/jogos/${j.slug}/`} className="est-vidro est-cartao">
                    <span className="est-cartao-titulo">{j.titulo}</span>
                    <span className="est-texto">{j.resumo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="fichas" className="flex flex-col gap-5">
          <h2 id="fichas" className="est-secao">Olimpíadas da área</h2>
          <Carrossel rotulo={`Olimpíadas de ${area.titulo}`} classe="gap-2 pb-1">
            {fichas.map((o) => (
              <Link key={o.id} href={`/oportunidade/${o.slug}/`} className="est-chip est-chip-link" title={o.nome}>
                {o.sigla ?? o.nome}
              </Link>
            ))}
          </Carrossel>
          {campo && <Link href={hrefRadar(campo)} className="link w-fit text-[0.9375rem]">Ver todas: {campo.rotuloRadar}</Link>}
        </section>
      </div>
    </div>
  );
}
