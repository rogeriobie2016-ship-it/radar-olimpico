import { Numeros, QuadroPrazos } from "./InicioCliente";
import { AvisoRadar } from "@/components/AvisoRadar";
import Link from "@/components/L";
import { RadarEscopo, type Ponto } from "@/components/RadarEscopo";
import { Sala, type FileiraDados, type ItemSala } from "@/components/Sala";
import { Seta } from "@/components/Seta";
import { asset } from "@/lib/base";
import { cearaCientifico, meta, novidades, oportunidades, resumir, resumos } from "@/lib/dados";
import { REGRAS } from "@/lib/escada";
import { JOGOS } from "@/lib/jogos";

const CAMINHOS = [
  { titulo: "Estudante", texto: "Monte a sua Escada Olímpica em poucas perguntas", href: "/escada/" },
  { titulo: "Professor", texto: "Como orientar um projeto e registrar a participação", href: "/professores/" },
  { titulo: "Escola", texto: "Prioridade, prazos e documentos do financiamento JOC", href: "/joc/" },
];

export default function Inicio() {
  const comData = resumos.filter((r) => r.fim || r.inicio);
  const pontos: Ponto[] = resumos.map((r) => ({ id: r.id, slug: r.slug, nome: r.nome, sigla: r.sigla, nivel: r.nivel, area: r.areas[0], inicio: r.inicio, fim: r.fim }));
  const ed = cearaCientifico.edicoes[0];

  // Só itens com ficha completa viram cartaz. O texto curto vai junto para a prévia.
  const fichas = oportunidades.filter((o) => o.descricao);
  const itens: ItemSala[] = fichas.map((o) => ({ ...resumir(o), resumo: o.descricao ? o.descricao.slice(0, 190).replace(/\s+\S*$/, "") + (o.descricao.length > 190 ? "..." : "") : null }));
  const daArea = (a: string) => itens.filter((i) => i.areas.includes(a)).map((i) => i.id);
  const comNovidade = novidades.itens.map((n) => n.oportunidadeId).filter((id, i, l): id is string => !!id && l.indexOf(id) === i && itens.some((x) => x.id === id));
  const destaques = [...new Set([...comNovidade.slice(0, 2), "ceara-cientifico", "obmep", "onia", "obr"])].slice(0, 5);

  const fileiras: FileiraDados[] = [
    { id: "novidades", titulo: "Novidades", ids: comNovidade },
    { id: "abertas", titulo: "Inscrições abertas", dinamica: "abertas" },
    { id: "comecar", titulo: "Para começar", ids: itens.filter((i) => REGRAS[i.id]?.aberta).map((i) => i.id) },
    { id: "ceara", titulo: "Daqui do Ceará", ids: itens.filter((i) => i.nivel === "estadual" || i.nivel === "regional").map((i) => i.id) },
    { id: "matematica", titulo: "Matemática", ids: daArea("Matemática") },
    { id: "natureza", titulo: "Física, química, biologia e astronomia", ids: daArea("Ciências da Natureza") },
    { id: "tecnologia", titulo: "Tecnologia e computação", ids: daArea("Tecnologia e Computação") },
    { id: "humanas", titulo: "História, geografia e sociedade", ids: daArea("Ciências Humanas e Sociais Aplicadas") },
    { id: "feiras", titulo: "Feiras e projetos", ids: itens.filter((i) => i.tipo === "feira" || i.tipo === "programa").map((i) => i.id) },
    { id: "ufc", titulo: "Aceitas no edital de vagas olímpicas da UFC", ids: itens.filter((i) => i.vagaOlimpica).map((i) => i.id) },
  ];

  return (
    <>
      <Sala itens={itens} destaques={destaques} fileiras={fileiras} />

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-12">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-14">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/logos/joc-laranja.webp")} alt="Juventude Olímpica do Conhecimento" width={480} height={298} loading="lazy" className="h-auto w-28" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/logos/seduc.webp")} alt="Governo do Estado do Ceará, Secretaria da Educação" width={400} height={132} loading="lazy" className="logo-seduc h-auto w-32" />
            </div>
            <h1>Radar Olímpico</h1>
            <p className="max-w-xl text-[1.1875rem] leading-snug">
              Olimpíadas do conhecimento, feiras e eventos científicos para estudantes da rede pública estadual do Ceará. Publicação da COPES, com os sites oficiais verificados todos os dias.
            </p>
            <Numeros itens={comData} total={resumos.length} vagas={resumos.filter((r) => r.vagaOlimpica).length} />
            <AvisoRadar itens={comData} edicao={meta.ultimaEdicaoRadar} />
            <div className="hidden lg:block">
              <QuadroPrazos itens={comData} />
            </div>
          </div>
          <RadarEscopo pontos={pontos} />
        </section>

        <div className="lg:hidden">
          <QuadroPrazos itens={comData} />
        </div>

        <section aria-labelledby="t-jogos">
          <div className="regua flex items-baseline justify-between gap-4 pt-3">
            <h2 id="t-jogos">Treine jogando</h2>
            <Link href="/jogos/" className="link shrink-0 text-[0.9375rem]">
              Todos os jogos
            </Link>
          </div>
          <ul className="mt-4 grid border-t border-linha sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {JOGOS.slice(0, 6).map((j) => (
              <li key={j.slug}>
                <Link href={`/jogos/${j.slug}/`} className="linha-lista flex h-full items-start justify-between gap-4 py-3.5">
                  <span>
                    <span className="estreito block text-[1.625rem] font-bold leading-none">{j.titulo}</span>
                    <span className="mt-1.5 block text-sm text-tinta-2">{j.olimpiada}</span>
                  </span>
                  <Seta className="mt-1" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="-mx-4 bg-cc-fundo px-4 py-10 text-white lg:mx-0 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="flex flex-col items-start gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/logos/ceara-cientifico.webp")} alt="Ceará Científico" width={640} height={337} loading="lazy" className="h-auto w-36 bg-white p-2" />
              <h2>Do projeto na escola à etapa estadual</h2>
              <Link href="/ceara-cientifico/" className="btn bg-white text-[#111210] hover:bg-cc-laranja">
                Conhecer o Ceará Científico
                <Seta />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 border-t border-white/40 pt-3">
              {[
                [ed.etapaEstadual.projetos, "projetos"],
                [ed.etapaEstadual.escolas, "escolas"],
                [ed.etapaEstadual.municipios, "municípios"],
                [ed.ano, "última edição"],
              ].map(([n, t]) => (
                <div key={t} className="py-2">
                  <dd className="estreito text-5xl font-bold leading-none">{n}</dd>
                  <dt className="mt-1 text-sm text-cc-claro">{t}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="t-caminhos">
          <h2 id="t-caminhos" className="regua pt-3">
            Por perfil
          </h2>
          <ul className="mt-4 border-t border-linha">
            {CAMINHOS.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="linha-lista flex items-center justify-between gap-4 py-4">
                  <span>
                    <span className="estreito block text-[2.25rem] font-bold leading-none">{c.titulo}</span>
                    <span className="mt-1.5 block text-[0.9375rem] text-tinta-2">{c.texto}</span>
                  </span>
                  <Seta tamanho={24} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
