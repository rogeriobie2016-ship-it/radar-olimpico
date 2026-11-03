import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/L";
import { Icone } from "@/components/Icone";
import { asset } from "@/lib/base";
import { meta } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Para professores",
  description: "Como orientar um projeto, como registrar a participação da escola no Portal Educação Científica, e materiais úteis.",
};

const ORIENTAR = [
  { t: "Escolha junto com a turma", x: "Use o Radar ou o quiz para achar eventos da série e da área dos estudantes. O Catálogo 2026 é o cardápio do ano." },
  { t: "Leia o regulamento oficial", x: "Veja prazos, formato e custo no site de cada evento. Datas e regras mudam de um ano para o outro." },
  { t: "Monte a equipe", x: "O JOC apoia 1 professor orientador ou coorientador e até 3 estudantes por projeto. Considere isso desde o início." },
  { t: "Conecte com o tema do ano", x: "Projeto ligado ao tema 2026, Cidadania e Convivência Democrática, soma 10 pontos na prioridade do JOC." },
  { t: "Registre tudo", x: "Guarde a carta de aceite, a programação e os certificados. Eles serão pedidos no financiamento e na prestação de contas." },
  { t: "Classificou? Corra para o processo", x: "Estadual e regional: 30 dias antes. Nacional: 40 dias. Internacional: 70 dias. Sempre pela CREDE/SEFOR." },
];

const PORTAL = [
  "Acesse o Portal Educação Científica com o login e a senha da escola (é o mesmo do Ceará Científico).",
  "Na tela principal, clique na logo do JOC.",
  "Clique em “Cadastro/Participação em Eventos” e depois em “Novo”.",
  "Selecione o ano de 2026, o tipo de evento e a abrangência. A lista de eventos depende desses campos.",
  "Escolha o evento e a área. Se o evento for de várias áreas, escolha a do trabalho inscrito.",
  "Escolha a turma e adicione os estudantes, um a um pelo “+” ou com “Adicionar Todos”. Repita para cada turma.",
  "Na coluna “Tipo de Premiação”, marque o resultado de cada estudante.",
  "Adicione os professores participantes e clique em “Salvar”.",
];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="cartao p-4 sm:p-5">
      <h2 className="mb-3 text-2xl font-black">{titulo}</h2>
      {children}
    </section>
  );
}

function Material({ href, titulo, texto, interno }: { href: string; titulo: string; texto: string; interno?: boolean }) {
  const classe = "flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-superficie-2 p-3 no-underline hover:underline";
  const miolo = (
    <>
      <span>
        <span className="block font-bold leading-tight">{titulo}</span>
        <span className="text-xs text-tinta-2">{texto}</span>
      </span>
      <Icone nome={interno ? "seta" : "externo"} tamanho={18} className="shrink-0" />
    </>
  );
  return (
    <li>
      {interno ? (
        <Link href={href} className={classe}>{miolo}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classe}>{miolo}</a>
      )}
    </li>
  );
}

export default function ProfessoresPagina() {
  const { links } = meta;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5">
      <header>
        <h1 className="text-3xl font-black sm:text-4xl">Para professores</h1>
        <p className="mt-1 text-tinta-2">Orientar um projeto, registrar a participação e organizar a escola.</p>
      </header>

      <section aria-label="A rede em 2025" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { n: "104", t: "eventos registrados", c: "bg-laranja text-[#24170e]" },
          { n: "220", t: "escolas", c: "bg-turquesa text-[#06312f]" },
          { n: "23.373", t: "participações de estudantes", c: "bg-amarelo text-[#24170e]" },
          { n: "1.029", t: "participações de professores", c: "bg-laranja-suave text-tinta" },
        ].map((x) => (
          <div key={x.t} className={`azulejo flex flex-col gap-1 p-3 ${x.c}`}>
            <span className="font-display text-2xl font-black leading-none">{x.n}</span>
            <span className="text-xs font-bold leading-tight">{x.t}</span>
          </div>
        ))}
        <p className="col-span-full text-xs text-tinta-2">Registros de 2025 no Portal Educação Científica (Tutorial COPES 2026).</p>
      </section>

      <Secao titulo="Como orientar um projeto">
        <ol className="flex flex-col gap-3">
          {ORIENTAR.map((p, i) => (
            <li key={p.t} className="flex gap-3">
              <span aria-hidden="true" className="azulejo grid size-9 shrink-0 place-items-center bg-amarelo font-black text-[#24170e] !rounded-xl">{i + 1}</span>
              <span>
                <span className="block font-bold">{p.t}</span>
                <span className="text-sm">{p.x}</span>
              </span>
            </li>
          ))}
        </ol>
      </Secao>

      <Secao titulo="Como registrar a participação da escola">
        <p className="mb-3 text-sm text-tinta-2">Todo evento em que a escola participa deve ser registrado. É isso que dá visibilidade ao trabalho e orienta as políticas da rede.</p>
        <ol className="ml-5 flex list-decimal flex-col gap-2 text-sm">
          {PORTAL.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <p className="mt-3 rounded-xl bg-amarelo-suave p-3 text-sm">
          O evento não aparece na lista?{" "}
          <a href={links.cadastroEventoFaltante} target="_blank" rel="noopener noreferrer" className="font-bold underline">
            Preencha este formulário
          </a>{" "}
          ou fale com a sua CREDE/SEFOR.
        </p>
        <a href={links.portal} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-3 w-full">
          Abrir o Portal Educação Científica
          <Icone nome="externo" tamanho={18} />
        </a>
      </Secao>

      <Secao titulo="Kits e links úteis">
        <ul className="grid gap-2 sm:grid-cols-2">
          <Material href={links.catalogo} titulo="Catálogo de Olimpíadas 2026" texto="PDF de 106 MB: prefira o Wi-Fi" />
          <Material href={links.radarSetembro} titulo="Radar Olímpico de Setembro" texto="PDF de 125 MB: prefira o Wi-Fi" />
          <Material href={links.regulamentoJOC} titulo="Regulamento JOC 2026" texto="PDF de 4 MB, com formulários e anexos" />
          <Material href={links.tutorial} titulo="Tutorial do Portal" texto="PDF de 8 MB, passo a passo com imagens" />
          <Material href={asset("/docs/checklist-joc-2026.pdf")} titulo="Checklist de documentos JOC" texto="PDF para imprimir" />
          <Material href={links.pastaDecretos} titulo="Decretos sobre diárias e auxílio" texto="Pasta da COPES no Drive" />
          <Material href="/joc/" titulo="Simulador e calculadora JOC" texto="Prioridade e prazo em segundos" interno />
          <Material href="/calendario/" titulo="Calendário com exportação" texto="Leve os prazos para a agenda" interno />
        </ul>
      </Secao>
    </div>
  );
}
