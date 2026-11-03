import Link from "@/components/L";
import { BuscaInicio, ContadoresInicio, FechamSemana } from "./InicioCliente";
import { Icone } from "@/components/Icone";
import { asset } from "@/lib/base";
import { meta, resumos } from "@/lib/dados";

const ATALHOS = [
  {
    titulo: "Sou estudante",
    texto: "Descubra em 5 perguntas qual olimpíada combina com você.",
    href: "/descubra/",
    icone: "descubra",
    cor: "bg-laranja text-[#24170e]",
    acao: "Fazer o quiz",
  },
  {
    titulo: "Sou professor",
    texto: "Como orientar um projeto e inscrever a escola.",
    href: "/professores/",
    icone: "professor",
    cor: "bg-turquesa text-[#06312f]",
    acao: "Ver o guia",
  },
  {
    titulo: "Sou da escola",
    texto: "Financiamento JOC: simule a prioridade e veja o prazo.",
    href: "/joc/",
    icone: "joc",
    cor: "bg-amarelo text-[#24170e]",
    acao: "Abrir o JOC",
  },
];

export default function Inicio() {
  // Só os itens com data vão para o navegador: a home fica bem mais leve em 3G.
  const comData = resumos.filter((r) => r.fim || r.inicio);
  return (
    <>
      <section className="relative overflow-hidden bg-laranja text-[#24170e]">
        <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute -right-24 -top-20 w-[26rem] text-[#24170e] opacity-[0.12] sm:right-0">
          <g fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="200" cy="200" r="60" />
            <circle cx="200" cy="200" r="110" />
            <circle cx="200" cy="200" r="160" />
            <circle cx="200" cy="200" r="198" />
            <path d="M200 200 340 60" strokeWidth="5" strokeLinecap="round" />
          </g>
        </svg>
        <div className="relative mx-auto grid max-w-6xl gap-5 px-4 pb-6 pt-5 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-10 lg:py-12">
          <div className="flex flex-col gap-4">
            <BuscaInicio />
            <h1 className="text-[2.1rem] font-black sm:text-5xl">Sua próxima medalha está no radar.</h1>
            <p className="max-w-xl font-medium">Olimpíadas, feiras e eventos científicos para estudantes da rede pública estadual do Ceará, sempre à mão.</p>
            <ContadoresInicio itens={comData} total={resumos.length} vagas={resumos.filter((r) => r.vagaOlimpica).length} />
          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-white p-3 lg:flex-col lg:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/logos/joc-laranja.webp")} alt="Juventude Olímpica do Conhecimento" width={480} height={298} fetchPriority="high" className="h-auto w-[52%] min-w-0 lg:w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/logos/seduc.webp")} alt="Governo do Estado do Ceará, Secretaria da Educação" width={400} height={132} className="h-auto w-[42%] min-w-0 lg:w-2/3" />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6">
        <FechamSemana itens={comData} edicao={meta.ultimaEdicaoRadar} />

        <section aria-labelledby="titulo-atalhos" className="flex flex-col gap-3">
          <h2 id="titulo-atalhos" className="text-2xl font-black">Por onde começar</h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {ATALHOS.map((a) => (
              <li key={a.href} className="grid">
                <Link href={a.href} className={`azulejo flex flex-col gap-1.5 !rounded-[1.25rem] p-4 no-underline ${a.cor}`}>
                  <Icone nome={a.icone} tamanho={28} />
                  <span className="font-display text-xl font-black">{a.titulo}</span>
                  <span className="text-sm font-medium">{a.texto}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-extrabold">
                    {a.acao}
                    <Icone nome="seta" tamanho={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/ceara-cientifico/" className="cartao flex items-center gap-4 p-4 no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/logos/ceara-cientifico.webp")} alt="" width={640} height={337} loading="lazy" className="h-auto w-28 shrink-0 rounded-lg bg-white p-1" />
            <span>
              <span className="block font-display text-lg font-black">Ceará Científico</span>
              <span className="text-sm text-tinta-2">Do projeto na escola até a etapa estadual.</span>
            </span>
          </Link>
          <Link href="/escada/" className="cartao flex items-center gap-4 p-4 no-underline">
            <span className="azulejo grid size-16 shrink-0 place-items-center bg-amarelo text-[#24170e]">
              <Icone nome="escada" tamanho={34} />
            </span>
            <span>
              <span className="block font-display text-lg font-black">Escada olímpica</span>
              <span className="text-sm text-tinta-2">Veja como uma etapa leva à próxima.</span>
            </span>
          </Link>
        </section>
      </div>
    </>
  );
}
