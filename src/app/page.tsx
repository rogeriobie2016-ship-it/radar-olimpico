import { Carrossel } from "@/components/Carrossel";
import { dadosLab } from "@/lab/dados";
import { LabCliente } from "@/lab/LabCliente";
import { Numeros, QuadroPrazos } from "./InicioCliente";
import { AvisoRadar } from "@/components/AvisoRadar";
import { Expedicao, type Escondida } from "@/components/Expedicao";
import Link from "@/components/L";
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

const COR_JOGO = ["#f58a33", "#00c9c8", "#fdc13f", "#0a2a55", "#06393f", "#8a3f12", "#f8a8c8", "#ffb24d", "#12254f", "#2b1a66"];

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
      <section id="campos" aria-label="Escolha seu campo" className="py-7">
        <div className="mx-auto max-w-6xl px-4">
          <h2>Escolha seu campo</h2>
          <p className="mt-1 text-tinta-2">{resumos.length} oportunidades. Use as setas para ver mais e toque na carta para virar.</p>
        </div>
        <div className="mx-auto mt-3 max-w-6xl">
          <Carrossel rotulo="Campos do conhecimento" classe="gap-2 px-4 pb-2">
            {mundos.map((m) => (
              <a key={m.id} href={`#${m.id}`} className="campo-azulejo">
                <span aria-hidden="true" className="ponto-campo" style={{ background: m.fundo }} />
                <span className="estreito leading-tight">{m.titulo}</span>
                <span className="text-sm text-tinta-2">{m.itens.length}</span>
              </a>
            ))}
          </Carrossel>
        </div>
      </section>

      <FitaLogos itens={fita} />

      {/* Escada Olímpica: o convite principal */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="vidro grid items-end gap-2 overflow-hidden px-5 pt-6 sm:grid-cols-[1fr_auto] sm:px-8">
          <div className="flex flex-col items-start gap-3 pb-6">
            <h2 className="!text-[clamp(2rem,6vw,3.25rem)]">Escada Olímpica</h2>
            <p className="max-w-md text-tinta-2">Responda 14 perguntas e descubra as olimpíadas perfeitas para você e para a sua escola, degrau por degrau.</p>
            <Link href="/escada/" className="btn btn-primario">
              Quero minha Escada
              <Seta />
            </Link>
          </div>
          <div aria-hidden="true" className="relative flex h-40 items-end gap-1 sm:h-56 sm:w-80">
            {[22, 36, 50, 64, 80, 100].map((a, i) => (
              <span key={a} className="subir-degrau flex-1 rounded-t-lg" style={{ height: `${a}%`, background: `linear-gradient(180deg, var(--marca), color-mix(in srgb, var(--marca) ${70 - i * 8}%, transparent))`, opacity: 0.35 + i * 0.13, animationDelay: `${i * 70}ms` }} />
            ))}
          </div>
        </div>
      </section>

      <Mundos itens={itens} mundos={mundos} />

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-12">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-14">
          <div className="flex flex-col gap-5">
            <h2>O radar de verdade</h2>
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
            <h2 id="t-jogos">Treine jogando</h2>
            <Link href="/jogos/" className="link shrink-0 text-[0.9375rem]">
              Todos
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {JOGOS.map((j, i) => (
              <li key={j.slug} className="grid">
                <Link href={`/jogos/${j.slug}/`} className="cartao-vidro flex min-h-32 min-w-0 flex-col justify-between gap-3 p-4 no-underline">
                  <span aria-hidden="true" className="ponto-campo" style={{ background: COR_JOGO[i % COR_JOGO.length] }} />
                  <span>
                    <span className="estreito block text-[1.25rem] leading-tight">{j.titulo}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-tight text-tinta-2">{j.olimpiada}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="vidro overflow-hidden px-5 py-8 lg:px-8">
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
                  <dd className="estreito text-4xl font-bold leading-none">{n}</dd>
                  <dt className="mt-1 text-sm text-tinta-2">{t}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="t-caminhos" className="grid gap-2.5 sm:grid-cols-3">
          <h2 id="t-caminhos" className="sr-only">Por perfil</h2>
          {[
            { t: "Para professores", x: "Como orientar um projeto e registrar a participação.", h: "/professores/" },
            { t: "Para a escola", x: "Simule a prioridade no JOC e calcule o prazo da viagem.", h: "/joc/" },
            { t: "Meu passaporte", x: "Salve oportunidades e colecione carimbos de cientista.", h: "/minha-lista/" },
          ].map((c) => (
            <Link key={c.h} href={c.h} className="cartao-vidro block p-4 no-underline">
              <span className="estreito block text-[1.25rem] leading-tight">{c.t}</span>
              <span className="mt-1.5 block text-sm text-tinta-2">{c.x}</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
