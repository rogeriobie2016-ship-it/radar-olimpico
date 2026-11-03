import type { Metadata } from "next";
import Link from "@/components/L";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AcoesOportunidade } from "./AcoesOportunidade";
import { ChecklistPerfil } from "./ChecklistPerfil";
import { ChipStatus } from "@/components/ChipStatus";
import { Icone } from "@/components/Icone";
import { oportunidades, resumir } from "@/lib/dados";
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
    title: o.sigla ? `${o.sigla}: ${o.nome}` : o.nome,
    description: descricao,
    openGraph: {
      title: o.nome,
      description: descricao,
      images: [{ url: `og/${o.slug}.png`, width: 1200, height: 630, alt: o.nome }],
    },
  };
}

const AConfirmar = () => <span className="selo-confirmar">a confirmar</span>;

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-linha py-2.5 last:border-0 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <dt className="text-sm font-semibold text-tinta-2">{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="cartao p-4">
      <h2 className="mb-2 text-xl font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

function perfil(o: Oportunidade) {
  const lista: string[] = [];
  if (o.publico.texto) lista.push(`Minha série ou idade se encaixa: ${o.publico.texto}`);
  else lista.push("Conferi no site oficial se minha série pode participar.");
  if (o.participacao === "grupo") lista.push("Tenho uma equipe, ou quero formar uma.");
  if (o.participacao === "individual") lista.push("Posso participar por conta própria, sem equipe.");
  if (o.formato === "projeto") lista.push("Quero desenvolver um projeto, com ajuda de um professor.");
  else lista.push("Topo o desafio de resolver questões de prova.");
  if (o.custo.tipo === "pago") lista.push("Consigo pagar a taxa de inscrição, ou a escola pode ajudar.");
  if (/professor|gestor/i.test(`${o.publico.texto} ${o.observacoes}`)) lista.push("Tenho um professor ou gestor da escola para me apoiar na inscrição.");
  return lista;
}

const ICONE_DESBLOQUEIA: Record<string, string> = { "vaga-olimpica": "professor", credenciamento: "escada", medalha: "trofeu", bolsa: "trofeu" };

export default async function PaginaOportunidade({ params }: Props) {
  const { slug } = await params;
  const o = buscar(slug);
  if (!o) notFound();

  const destinos = o.credenciaPara.map((id) => oportunidades.find((x) => x.id === id)!);
  const origens = oportunidades.filter((x) => x.credenciaPara.includes(o.id));
  const fases = [...o.provas].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5">
      <nav aria-label="Caminho" className="sem-print">
        <Link href="/radar/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-laranja-forte no-underline hover:underline">
          <Icone nome="seta" tamanho={16} className="rotate-180" />
          Voltar ao Radar
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ChipStatus inicio={o.inscricoes.inicio} fim={o.inscricoes.fim} />
          <span className="chip bg-superficie-2">{ROTULO_TIPO[o.tipo]}</span>
          <span className="chip bg-superficie-2">{ROTULO_NIVEL[o.nivel]}</span>
        </div>
        <h1 className="text-[1.75rem] font-black sm:text-4xl">{o.nome}</h1>
        {o.sigla && <p className="font-display text-lg font-extrabold text-laranja-forte">{o.sigla}</p>}
        {o.descricao && <p>{o.descricao}</p>}
      </header>

      <AcoesOportunidade item={resumir(o)} />

      <Bloco titulo="Linha do tempo">
        <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-linha pl-5">
          <li className="relative">
            <span aria-hidden="true" className="absolute -left-[1.72rem] top-1 size-3.5 rounded-full bg-laranja ring-4 ring-superficie" />
            <p className="font-bold">Inscrições</p>
            {o.inscricoes.fim ? (
              <p className="text-sm">
                {o.inscricoes.inicio ? `De ${dataExtenso(o.inscricoes.inicio)} até ` : "Até "}
                {dataExtenso(o.inscricoes.fim)}
              </p>
            ) : (
              <AConfirmar />
            )}
          </li>
          {fases.length ? (
            fases.map((f) => (
              <li key={f.fase} className="relative">
                <span aria-hidden="true" className="absolute -left-[1.72rem] top-1 size-3.5 rounded-full bg-turquesa ring-4 ring-superficie" />
                <p className="font-bold">{f.fase}</p>
                <p className="text-sm">{dataExtenso(f.data)}</p>
              </li>
            ))
          ) : (
            <li className="relative">
              <span aria-hidden="true" className="absolute -left-[1.72rem] top-1 size-3.5 rounded-full border-2 border-dashed border-tinta-2 bg-superficie" />
              <p className="font-bold">{o.formato === "projeto" ? "Fases e apresentação" : "Provas"}</p>
              <AConfirmar />
            </li>
          )}
        </ol>
      </Bloco>

      {(o.desbloqueia.length > 0 || destinos.length > 0 || origens.length > 0) && (
        <Bloco titulo="O que isso desbloqueia">
          <ul className="flex flex-col gap-2.5">
            {o.desbloqueia.map((d) => (
              <li key={d.texto} className="flex gap-2.5">
                <Icone nome={ICONE_DESBLOQUEIA[d.tipo]} className="mt-0.5 shrink-0 text-laranja-forte" />
                <span>{d.texto}</span>
              </li>
            ))}
          </ul>
          {destinos.length > 0 && (
            <p className="mt-3 text-sm">
              <strong>Leva para: </strong>
              {destinos.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && ", "}
                  <Link href={`/oportunidade/${d.slug}/`} className="font-semibold underline">
                    {d.nome}
                  </Link>
                </span>
              ))}
            </p>
          )}
          {origens.length > 0 && (
            <p className="mt-2 text-sm">
              <strong>Chega aqui por: </strong>
              {origens.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && ", "}
                  <Link href={`/oportunidade/${d.slug}/`} className="font-semibold underline">
                    {d.nome}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </Bloco>
      )}

      <Bloco titulo="Você tem o perfil?">
        <ChecklistPerfil itens={perfil(o)} />
      </Bloco>

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
            {o.custo.observacao && o.custo.observacao !== `${ROTULO_CUSTO[o.custo.tipo ?? ""]}.` && <span className="block text-sm text-tinta-2">{o.custo.observacao}</span>}
          </Linha>
          <Linha rotulo="Área">{o.areas.join(", ")}</Linha>
          <Linha rotulo="Organização">{o.organizador ?? <AConfirmar />}</Linha>
          {o.observacoes && <Linha rotulo="Atenção">{o.observacoes}</Linha>}
          <Linha rotulo="Site oficial">
            {o.linkOficial ? (
              <a href={o.linkOficial} target="_blank" rel="noopener noreferrer" className="break-words font-semibold underline">
                {o.linkOficial.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            ) : (
              <AConfirmar />
            )}
          </Linha>
        </dl>
      </Bloco>

      {o.comoParticipar.length > 0 && (
        <Bloco titulo="Como participar">
          <ol className="flex flex-col gap-2">
            {o.comoParticipar.map((p, i) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden="true" className="azulejo grid size-7 shrink-0 place-items-center bg-amarelo text-sm font-black text-[#24170e] !rounded-lg">
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </Bloco>
      )}

      {o.financiavelJOC && (
        <section className="rounded-[1.25rem] bg-laranja-suave p-4">
          <h2 className="text-lg font-extrabold">Sua escola pode pedir apoio do JOC</h2>
          <p className="mt-1 text-sm">
            Se a equipe se classificar para uma etapa final que exija viagem, a escola pode solicitar financiamento. A aprovação depende do orçamento, das regras do Regulamento 2026 e da análise da COPES.
          </p>
          <Link href="/joc/" className="btn btn-primario mt-3">
            Simular prioridade
          </Link>
        </section>
      )}

      <p className="text-xs text-tinta-2">
        Fonte: {o.fonte}. Atualizado em {dataExtenso(o.atualizadoEm)}. Datas e regras podem mudar: sempre confirme no site oficial.
      </p>
    </article>
  );
}
