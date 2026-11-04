import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AcoesOportunidade } from "./AcoesOportunidade";
import { ChecklistPerfil } from "./ChecklistPerfil";
import Link from "@/components/L";
import { LogoOlimpiada } from "@/components/LogoOlimpiada";
import { Mascote } from "@/components/Mascote";
import { Novidade } from "@/components/Novidade";
import { Seta } from "@/components/Seta";
import { Status } from "@/components/Status";
import { novidades, oportunidades, resumir } from "@/lib/dados";
import { jogosDe } from "@/lib/jogos";
import { dataExtenso, ROTULO_CUSTO, ROTULO_MODALIDADE, ROTULO_NIVEL, ROTULO_PARTICIPACAO, ROTULO_TIPO } from "@/lib/rotulos";
import type { Oportunidade } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => oportunidades.map((o) => ({ slug: o.slug }));

const buscar = (slug: string) => oportunidades.find((o) => o.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const o = buscar(slug);
  if (!o) return {};
  const descricao = o.descricao?.slice(0, 155) ?? `${o.nome} no Radar Olímpico: prazos, público e como participar.`;
  return {
    title: o.sigla ? `${o.sigla}, ${o.nome}` : o.nome,
    description: descricao,
    openGraph: { title: o.nome, description: descricao, images: [{ url: `og/${o.slug}.png`, width: 1200, height: 630, alt: o.nome }] },
  };
}

const AConfirmar = () => <span className="selo-confirmar">a confirmar</span>;

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-linha py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-[0.9375rem] text-tinta-2">{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="regua mb-3 titulo-3 !text-[1.5rem] uppercase">{titulo}</h2>
      {children}
    </section>
  );
}

function perfil(o: Oportunidade) {
  const lista: string[] = [];
  lista.push(o.publico.texto ? `Minha série ou idade se encaixa. ${o.publico.texto}` : "Conferi no site oficial se minha série pode participar.");
  if (o.participacao === "grupo") lista.push("Tenho uma equipe ou posso formar uma.");
  if (o.participacao === "individual") lista.push("Vou participar individualmente.");
  lista.push(o.formato === "projeto" ? "Vou desenvolver um projeto com a orientação de um professor." : "Vou me preparar para resolver questões de prova.");
  if (o.custo.tipo === "pago") lista.push("Consigo pagar a taxa de inscrição, ou a escola pode apoiar.");
  if (/professor|gestor/i.test(`${o.publico.texto} ${o.observacoes}`)) lista.push("Tenho um professor ou gestor da escola para apoiar a inscrição.");
  return lista;
}

export default async function PaginaOportunidade({ params }: Props) {
  const { slug } = await params;
  const o = buscar(slug);
  if (!o) notFound();

  const destinos = o.credenciaPara.map((id) => oportunidades.find((x) => x.id === id)!);
  const origens = oportunidades.filter((x) => x.credenciaPara.includes(o.id));
  const fases = [...o.provas].sort((a, b) => a.data.localeCompare(b.data));
  const jogos = jogosDe(o.id);
  const sigla = o.sigla && o.sigla.length <= 9 ? o.sigla : null;
  const novidade = novidades.itens.find((n) => n.oportunidadeId === o.id);

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 pt-4 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Link href="/radar/" className="sem-print inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-medium no-underline">
            <Seta direcao="esquerda" tamanho={16} />
            Radar
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Status inicio={o.inscricoes.inicio} fim={o.inscricoes.fim} />
            <span className="text-sm text-tinta-2">
              {ROTULO_TIPO[o.tipo]}, {ROTULO_NIVEL[o.nivel].toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LogoOlimpiada id={o.id} nome={o.nome} sigla={o.sigla} className="size-28 sm:size-36" lazy={false} />
            <h1 className="!text-[clamp(1.75rem,6.5vw,3.25rem)] !normal-case">{o.nome}</h1>
          </div>
          {o.descricao && <p className="max-w-2xl">{o.descricao}</p>}
        </header>

        {novidade && (
          <aside className="border-l-[3px] border-marca py-1 pl-3">
            <Novidade />
            <p className="estreito mt-2 text-[1.375rem] font-bold leading-tight">{novidade.titulo}</p>
            {novidade.trecho && <p className="mt-1 text-[0.9375rem]">{novidade.trecho}</p>}
            <p className="mt-1 text-sm text-tinta-2">
              {novidade.origem === "monitor" ? "Detecção automática" : "Pesquisa"} em {dataExtenso(novidade.detectadoEm)}.{" "}
              {novidade.url && (
                <a href={novidade.url} target="_blank" rel="noopener noreferrer" className="link">
                  Abrir a fonte
                </a>
              )}
            </p>
          </aside>
        )}

        <Bloco titulo="Calendário">
          <dl>
            <Linha rotulo="Inscrições">
              {o.inscricoes.fim ? (
                <span className="num">
                  {o.inscricoes.inicio ? `De ${dataExtenso(o.inscricoes.inicio)} até ` : "Até "}
                  {dataExtenso(o.inscricoes.fim)}
                </span>
              ) : (
                <AConfirmar />
              )}
            </Linha>
            {fases.length ? (
              fases.map((f) => (
                <Linha key={f.fase} rotulo={f.fase}>
                  <span className="num">{dataExtenso(f.data)}</span>
                </Linha>
              ))
            ) : (
              <Linha rotulo={o.formato === "projeto" ? "Fases" : "Provas"}>
                <AConfirmar />
              </Linha>
            )}
          </dl>
        </Bloco>

        {(o.desbloqueia.length > 0 || destinos.length > 0 || origens.length > 0) && (
          <Bloco titulo="O que isso abre">
            <ul>
              {o.desbloqueia.map((d) => (
                <li key={d.texto} className="border-b border-linha py-3">
                  {d.texto}
                </li>
              ))}
              {destinos.map((d) => (
                <li key={d.id} className="border-b border-linha">
                  <Link href={`/oportunidade/${d.slug}/`} className="flex min-h-12 items-center justify-between gap-3 py-3 no-underline">
                    <span>Leva a {d.nome}</span>
                    <Seta />
                  </Link>
                </li>
              ))}
              {origens.map((d) => (
                <li key={d.id} className="border-b border-linha">
                  <Link href={`/oportunidade/${d.slug}/`} className="flex min-h-12 items-center justify-between gap-3 py-3 no-underline">
                    <span>Acesso por {d.nome}</span>
                    <Seta />
                  </Link>
                </li>
              ))}
            </ul>
          </Bloco>
        )}

        <Bloco titulo="Ficha">
          <dl>
            {o.objetivo && <Linha rotulo="Objetivo">{o.objetivo}</Linha>}
            <Linha rotulo="Quem pode">{o.publico.texto ?? <AConfirmar />}</Linha>
            <Linha rotulo="Participação">{o.participacao ? ROTULO_PARTICIPACAO[o.participacao] : <AConfirmar />}</Linha>
            <Linha rotulo="Modalidade">{o.modalidade ? ROTULO_MODALIDADE[o.modalidade] : <AConfirmar />}</Linha>
            <Linha rotulo="Inscrição">
              {o.custo.tipo ? ROTULO_CUSTO[o.custo.tipo] : <AConfirmar />}
              {o.camposAConfirmar.includes("custo") && o.custo.tipo && (
                <>
                  {" "}
                  <AConfirmar />
                </>
              )}
              {o.custo.observacao && o.custo.observacao !== `${ROTULO_CUSTO[o.custo.tipo ?? ""]}.` && <span className="block text-[0.9375rem] text-tinta-2">{o.custo.observacao}</span>}
            </Linha>
            <Linha rotulo="Área">{o.areas.join(", ")}</Linha>
            <Linha rotulo="Organização">{o.organizador ?? <AConfirmar />}</Linha>
            {o.observacoes && <Linha rotulo="Observações">{o.observacoes}</Linha>}
            <Linha rotulo="Site oficial">
              {o.linkOficial ? (
                <a href={o.linkOficial} target="_blank" rel="noopener noreferrer" className="link break-words">
                  {o.linkOficial.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              ) : (
                <AConfirmar />
              )}
            </Linha>
          </dl>
        </Bloco>

        <p className="text-sm text-tinta-2">
          Fonte: {o.fonte}. Atualizado em {dataExtenso(o.atualizadoEm)}. Datas e regras podem mudar: confirme no site oficial.
        </p>
      </div>

      <aside className="flex flex-col gap-10 lg:sticky lg:top-20 lg:self-start">
        <AcoesOportunidade item={resumir(o)} />

        {jogos.length > 0 && (
          <Bloco titulo="Treine">
            <ul>
              {jogos.map((j) => (
                <li key={j.slug}>
                  <Link href={`/jogos/${j.slug}/`} className="linha-lista flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="estreito block text-[1.625rem] font-bold leading-none">{j.titulo}</span>
                      <span className="mt-1 block text-sm text-tinta-2">{j.resumo}</span>
                    </span>
                    <Seta />
                  </Link>
                </li>
              ))}
            </ul>
          </Bloco>
        )}

        <div className="flex items-end gap-1">
          <Mascote quem="menina" pose={o.formato === "projeto" ? "tubo" : "pensa"} className="w-20 shrink-0" />
          <p className="balao mb-3 flex-1">Vê se combina com você. Se sim, salva e chama a turma.</p>
        </div>

        <Bloco titulo="Tem o perfil?">
          <ChecklistPerfil itens={perfil(o)} />
        </Bloco>

        {o.comoParticipar.length > 0 && (
          <Bloco titulo="Como participar">
            <ol>
              {o.comoParticipar.map((p, i) => (
                <li key={p} className="grid grid-cols-[1.75rem_1fr] border-b border-linha py-3 text-[0.9375rem]">
                  <span className="num estreito font-bold">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </Bloco>
        )}

        {o.financiavelJOC && (
          <Bloco titulo="Financiamento">
            <p className="text-[0.9375rem]">
              Se a equipe se classificar para uma etapa final que exija viagem, a escola pode solicitar o apoio do JOC. A aprovação depende do orçamento, das regras do Regulamento 2026 e da análise da COPES.
            </p>
            <Link href="/joc/" className="link mt-3 inline-block text-[0.9375rem]">
              Simular a prioridade da escola
            </Link>
          </Bloco>
        )}
      </aside>
    </article>
  );
}
