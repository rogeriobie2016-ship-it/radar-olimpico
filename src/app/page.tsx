import { Carrossel } from "@/components/Carrossel";
import { dadosLab } from "@/lab/dados";
import { LabCliente } from "@/lab/LabCliente";
import { Numeros, QuadroPrazos } from "./InicioCliente";
import { AvisoRadar } from "@/components/AvisoRadar";
import { Expedicao, type Escondida } from "@/components/Expedicao";
import Link from "@/components/L";
import { Mascote } from "@/components/Mascote";
import { FitaLogos, Mundos, type DadosMundo, type ItemCarta } from "@/components/Mundos";
import { RadarEscopo, type Ponto } from "@/components/RadarEscopo";
import { Seta } from "@/components/Seta";
import { asset } from "@/lib/base";
import { cearaCientifico, meta, oportunidades, resumir, resumos } from "@/lib/dados";
import { REGRAS } from "@/lib/escada";
import { JOGOS } from "@/lib/jogos";
import { COM_LOGO } from "@/lib/logos";

// Onde cada logo fica escondido no universo, em porcentagem da cena.
const ESCONDIDAS: [string, number, number][] = [
  ["obmep", 18, 50],
  ["oba", 80, 47],
  ["obr", 50, 53],
  ["onhb", 84, 61],
  ["ocq", 16, 64],
  ["onia", 50, 66],
  ["febrace", 76, 72],
  ["ceara-cientifico", 30, 72],
];

const COR_JOGO = ["#f58a33", "#00c9c8", "#fdc13f", "#0a2a55", "#06393f", "#8a3f12", "#f8a8c8"];
const TINTA_JOGO = ["#1c0f05", "#04211f", "#1c0f05", "#f4fbff", "#f4fbff", "#f4fbff", "#2b0a1b"];

export default function Inicio() {
  const comData = resumos.filter((r) => r.fim || r.inicio);
  const pontos: Ponto[] = resumos.map((r) => ({ id: r.id, slug: r.slug, nome: r.nome, sigla: r.sigla, nivel: r.nivel, area: r.areas[0], inicio: r.inicio, fim: r.fim }));
  const ed = cearaCientifico.edicoes[0];

  const fichas = oportunidades.filter((o) => o.descricao);
  // Todas as oportunidades entram nas fileiras, com ou sem ficha completa.
  const itens: ItemCarta[] = oportunidades.map((o) => ({ ...resumir(o), resumo: null }));
  const daArea = (a: string) => itens.filter((i) => i.areas.includes(a)).map((i) => i.id);
  const escondidas: Escondida[] = ESCONDIDAS.map(([id, x, y]) => {
    const o = oportunidades.find((p) => p.id === id)!;
    return { id, slug: o.slug, nome: o.nome, sigla: o.sigla, x, y, area: o.areas[0] };
  });
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(new Date());
  const abertasAgora = comData.filter((r) => r.fim && r.fim >= hoje).length;

  const mundos: DadosMundo[] = [
    { filtro: "", id: "comecar", titulo: "Comece aqui", frase: "Sem experiência? Estas são as melhores portas de entrada.", area: "Multidisciplinar", fundo: "#00a3a3", tinta: "#04211f", pose: "acena", quem: "guia", itens: itens.filter((i) => REGRAS[i.id]?.aberta).map((i) => i.id) },
    { filtro: "nivel=internacional", id: "afora", titulo: "Mundo afora", frase: "Fala inglês ou outra língua? Bolsas, intercâmbios, feiras e programas fora do Brasil.", area: "Multidisciplinar", fundo: "#0b3f73", tinta: "#f4fbff", pose: "foguete", quem: "guia", itens: itens.filter((i) => i.tipo !== "olimpiada" && (i.nivel === "internacional" || i.tipo === "bolsa" || i.tipo === "intercambio")).map((i) => i.id) },
    { filtro: `area=${encodeURIComponent("Ciências da Natureza")}`, id: "espaco", titulo: "Espaço e natureza", frase: "Das estrelas às células. Física, química, biologia e astronomia.", area: "Ciências da Natureza", fundo: "#0a2a55", tinta: "#f4fbff", pose: "foguete", quem: "menino", itens: daArea("Ciências da Natureza") },
    { filtro: `area=${encodeURIComponent("Matemática")}`, id: "numeros", titulo: "Números", frase: "Lógica, padrões e desafios. Tem medalha esperando.", area: "Matemática", fundo: "#f58a33", tinta: "#1c0f05", pose: "pensa", quem: "menina", itens: daArea("Matemática") },
    { filtro: `area=${encodeURIComponent("Tecnologia e Computação")}`, id: "codigo", titulo: "Código e robôs", frase: "Programação, robótica e inteligência artificial.", area: "Tecnologia e Computação", fundo: "#06393f", tinta: "#f4fbff", pose: "aponta", quem: "menino", itens: daArea("Tecnologia e Computação") },
    { filtro: `area=${encodeURIComponent("Ciências Humanas e Sociais Aplicadas")}`, id: "historia", titulo: "História e sociedade", frase: "Investigue fontes, mapas e as histórias do Ceará e do Brasil.", area: "Ciências Humanas e Sociais Aplicadas", fundo: "#8a3f12", tinta: "#f4fbff", pose: "lupa", quem: "menina", itens: daArea("Ciências Humanas e Sociais Aplicadas") },
    { filtro: `area=${encodeURIComponent("Linguagens e Códigos")}`, id: "palavras", titulo: "Palavras e línguas", frase: "Leitura, literatura, inglês e linguística.", area: "Linguagens e Códigos", fundo: "#fdc13f", tinta: "#1c0f05", pose: "acena", quem: "menino", itens: daArea("Linguagens e Códigos") },
    { filtro: `area=${encodeURIComponent("Meio Ambiente")}`, id: "planeta", titulo: "Planeta vivo", frase: "Oceano, clima e natureza. Projetos para mudar o seu território.", area: "Meio Ambiente", fundo: "#0d6b3c", tinta: "#f4fbff", pose: "folha", quem: "menina", itens: daArea("Meio Ambiente") },
    { filtro: `area=${encodeURIComponent("Educação Financeira e Gestão")}`, id: "dinheiro", titulo: "Dinheiro e futuro", frase: "Investimentos, empreendedorismo e gestão.", area: "Educação Financeira e Gestão", fundo: "#f8a8c8", tinta: "#2b0a1b", pose: "comemora", quem: "menino", itens: daArea("Educação Financeira e Gestão") },
    { filtro: "tipo=feira,programa", id: "feiras", titulo: "Feiras e projetos", frase: "Crie, apresente e viaje com a sua pesquisa.", area: "Multidisciplinar", fundo: "#23476b", tinta: "#f4fbff", pose: "tubo", quem: "menina", itens: itens.filter((i) => i.tipo === "feira" || i.tipo === "programa").map((i) => i.id) },
    { filtro: "nivel=internacional&tipo=olimpiada", id: "internacionais", titulo: "Olimpíadas internacionais", frase: "Para quem sonha com uma medalha fora do Brasil.", area: "Multidisciplinar", fundo: "#3b1d73", tinta: "#f4fbff", pose: "comemora", quem: "guia", itens: itens.filter((i) => i.tipo === "olimpiada" && i.nivel === "internacional").map((i) => i.id) },
  ];

  const fita = fichas.filter((o) => COM_LOGO.has(o.id) && (REGRAS[o.id]?.aberta || o.nivel === "estadual" || o.tipo === "feira")).slice(0, 20).map((o) => ({ id: o.id, nome: o.nome, slug: o.slug, sigla: o.sigla }));

  return (
    <>
      <Expedicao escondidas={escondidas} abertas={abertasAgora} />

      {/* Logo depois da landing: o Laboratório Vivo, sem sair da página */}
      <LabCliente embutido {...dadosLab()} />

      {/* Atalhos por campo do conhecimento */}
      <section id="campos" aria-label="Escolha seu campo" className="bg-fundo-2 py-5">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="uppercase">Escolha seu campo</h2>
          <p className="mt-1 font-bold">{resumos.length} oportunidades. Toca para ir direto. Nas fileiras, usa as setas ou arrasta para o lado, e toca na carta para virar.</p>
        </div>
        <div className="mx-auto mt-3 max-w-6xl">
          <Carrossel rotulo="Campos do conhecimento" classe="gap-2 px-4 pb-2">
            {mundos.map((m) => (
              <a key={m.id} href={`#${m.id}`} className="campo-azulejo" style={{ background: m.fundo, color: m.tinta }}>
                <span className="estreito uppercase leading-tight">{m.titulo}</span>
                <span className="text-sm font-bold">{m.itens.length}</span>
              </a>
            ))}
          </Carrossel>
        </div>
      </section>

      <FitaLogos itens={fita} />

      {/* Escada Olímpica: o convite principal */}
      <section className="relative overflow-hidden bg-marca text-[#1c0f05]">
        <div className="mx-auto grid max-w-6xl items-end gap-2 px-4 pt-8 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col items-start gap-3 pb-8">
            <h2 className="titulo-1 !text-[clamp(2.4rem,10vw,5rem)]">Escada Olímpica</h2>
            <p className="max-w-md text-lg font-bold leading-snug">Responda 14 perguntas e descubra as olimpíadas perfeitas para você e para a sua escola, degrau por degrau.</p>
            <Link href="/escada/" className="btn bg-[#071a2e] text-white shadow-[0_5px_0_#000]">
              Quero minha Escada
              <Seta />
            </Link>
          </div>
          <div aria-hidden="true" className="relative flex h-52 items-end gap-1 sm:h-72 sm:w-96">
            {[28, 42, 56, 70, 86, 100].map((a, i) => (
              <span key={a} className="azulejo subir-degrau flex-1" style={{ height: `${a}%`, background: ["#00c9c8", "#fdc13f", "#ffffff"][i % 3], animationDelay: `${i * 70}ms`, borderRadius: "12px 12px 0 0" }} />
            ))}
            <Mascote quem="menino" pose="acena" className="flutua absolute bottom-[34%] left-[6%] w-24 sm:w-32" />
            <Mascote quem="menina" pose="comemora" className="absolute bottom-[86%] right-0 w-20 sm:w-28" />
          </div>
        </div>
      </section>

      <Mundos itens={itens} mundos={mundos} />

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-12">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-14">
          <div className="flex flex-col gap-5">
            <h2 className="regua uppercase">O radar de verdade</h2>
            <p className="max-w-xl">Cada ponto é uma oportunidade. O anel mostra o nível e o setor mostra a área. Toque e descubra.</p>
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
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="t-jogos" className="regua uppercase">Treine jogando</h2>
            <Link href="/jogos/" className="link shrink-0 text-[0.9375rem]">
              Todos
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {JOGOS.map((j, i) => (
              <li key={j.slug} className="grid">
                <Link href={`/jogos/${j.slug}/`} className="azulejo flex min-h-36 min-w-0 flex-col justify-between gap-3 p-4 no-underline transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-[-1deg]" style={{ background: COR_JOGO[i], color: TINTA_JOGO[i] }}>
                  <span className="estreito text-[1.5rem] leading-none">{j.titulo}</span>
                  <span className="text-[0.8125rem] font-bold leading-tight opacity-90">{j.olimpiada}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="-mx-4 overflow-hidden bg-cc-fundo px-4 py-10 text-white lg:mx-0 lg:rounded-3xl lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="flex flex-col items-start gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/logos/ceara-cientifico.webp")} alt="Ceará Científico" width={640} height={337} loading="lazy" className="h-auto w-40 rounded-xl bg-white p-2" />
              <h2>Da pergunta na escola à etapa estadual</h2>
              <Link href="/ceara-cientifico/" className="btn btn-marca">
                Conhecer o Ceará Científico
                <Seta />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-x-6">
              {[
                [ed.etapaEstadual.projetos, "projetos"],
                [ed.etapaEstadual.escolas, "escolas"],
                [ed.etapaEstadual.municipios, "municípios"],
                [ed.ano, "última edição"],
              ].map(([n, t]) => (
                <div key={t} className="py-2">
                  <dd className="estreito text-5xl font-black leading-none text-amarelo">{n}</dd>
                  <dt className="mt-1 text-sm font-bold text-cc-claro">{t}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="t-caminhos" className="grid gap-2.5 sm:grid-cols-3">
          <h2 id="t-caminhos" className="sr-only">Por perfil</h2>
          {[
            { t: "Para professores", x: "Como orientar um projeto e registrar a participação.", h: "/professores/", p: "acena" as const, q: "menina" as const },
            { t: "Para a escola", x: "Simule a prioridade no JOC e calcule o prazo da viagem.", h: "/joc/", p: "foguete" as const, q: "menino" as const },
            { t: "Meu passaporte", x: "Salve oportunidades e colecione carimbos de cientista.", h: "/minha-lista/", p: "comemora" as const, q: "menina" as const },
          ].map((c) => (
            <Link key={c.h} href={c.h} className="linha-lista !mb-0 flex items-end gap-2 !px-3 pt-3">
              <span className="flex-1 pb-3">
                <span className="estreito block text-[1.5rem] leading-none">{c.t}</span>
                <span className="mt-1.5 block text-sm text-tinta-2">{c.x}</span>
              </span>
              <Mascote quem={c.q} pose={c.p} className="w-16 shrink-0" />
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
