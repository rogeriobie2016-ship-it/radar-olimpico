import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { asset } from "@/lib/base";
import { meta } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Professores",
  description: "Como orientar um projeto, como registrar a participação da escola no Portal Educação Científica, e materiais úteis.",
};

const ORIENTAR = [
  { t: "Escolha com a turma", x: "Use a Escada Olímpica ou o Radar para achar eventos da série e da área dos estudantes. O Catálogo 2026 reúne as opções do ano." },
  { t: "Leia o regulamento oficial", x: "Veja prazo, formato e custo no site de cada evento. As regras mudam de um ano para o outro." },
  { t: "Monte a equipe", x: "O JOC apoia 1 professor orientador ou coorientador e até 3 estudantes por projeto. Considere esse limite desde o início." },
  { t: "Conecte com o tema do ano", x: "Projeto ligado ao tema 2026, Cidadania e Convivência Democrática, soma 10 pontos na prioridade do JOC." },
  { t: "Guarde os documentos", x: "Carta de aceite, programação e certificados serão pedidos no financiamento e na prestação de contas." },
  { t: "Abra o processo a tempo", x: "Estadual e regional, 30 dias antes. Nacional, 40 dias. Internacional, 70 dias. Sempre pela CREDE/SEFOR." },
];

const PORTAL = [
  "Acesse o Portal Educação Científica com o login e a senha da escola, os mesmos do Ceará Científico.",
  "Na tela principal, clique na logo do JOC.",
  "Clique em Cadastro/Participação em Eventos e depois em Novo.",
  "Selecione o ano de 2026, o tipo de evento e a abrangência. A lista de eventos depende desses campos.",
  "Escolha o evento e a área. Se o evento for de várias áreas, escolha a do trabalho inscrito.",
  "Escolha a turma e adicione os estudantes, um a um pelo sinal de mais ou com Adicionar Todos. Repita para cada turma.",
  "Na coluna Tipo de Premiação, marque o resultado de cada estudante.",
  "Adicione os professores participantes e clique em Salvar.",
];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="regua mb-4 pt-3">{titulo}</h2>
      {children}
    </section>
  );
}

function Material({ href, titulo, texto, interno }: { href: string; titulo: string; texto: string; interno?: boolean }) {
  const classe = "linha-lista flex min-h-16 items-center justify-between gap-3 py-3";
  const miolo = (
    <>
      <span>
        <span className="block font-semibold leading-tight">{titulo}</span>
        <span className="text-sm text-tinta-2">{texto}</span>
      </span>
      <Seta direcao={interno ? "direita" : "externo"} />
    </>
  );
  return <li>{interno ? <Link href={href} className={classe}>{miolo}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" className={classe}>{miolo}</a>}</li>;
}

export default function ProfessoresPagina() {
  const { links } = meta;
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-14 px-4 pt-6">
      <header className="flex flex-col gap-4">
        <h1>Professores</h1>
        <p className="max-w-2xl text-[1.1875rem] leading-snug">Como orientar um projeto, registrar a participação e organizar a escola.</p>
      </header>

      <section aria-label="A rede em 2025">
        <dl className="regua grid grid-cols-2 sm:grid-cols-4">
          {[
            ["104", "eventos registrados"],
            ["220", "escolas"],
            ["23.373", "participações de estudantes"],
            ["1.029", "participações de professores"],
          ].map(([n, t]) => (
            <div key={t} className="border-b border-linha py-3 pr-2 sm:border-b-0">
              <dd className="estreito num text-[2.75rem] font-bold leading-none">{n}</dd>
              <dt className="mt-1 text-[0.8125rem] leading-tight text-tinta-2">{t}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-sm text-tinta-2">Registros de 2025 no Portal Educação Científica, segundo o Tutorial da COPES 2026.</p>
      </section>

      <Secao titulo="Como orientar um projeto">
        <ol className="border-t border-linha">
          {ORIENTAR.map((p, i) => (
            <li key={p.t} className="grid grid-cols-[2.25rem_1fr] border-b border-linha py-3">
              <span className="estreito num text-[1.75rem] font-bold leading-none text-marca-forte">{i + 1}</span>
              <span>
                <span className="block font-semibold">{p.t}</span>
                <span className="text-[0.9375rem]">{p.x}</span>
              </span>
            </li>
          ))}
        </ol>
      </Secao>

      <Secao titulo="Como registrar a participação">
        <p className="mb-3 max-w-2xl text-[0.9375rem] text-tinta-2">Todo evento em que a escola participa deve ser registrado. O registro dá visibilidade ao trabalho e orienta as políticas da rede.</p>
        <ol className="border-t border-linha">
          {PORTAL.map((p, i) => (
            <li key={p} className="grid grid-cols-[2.25rem_1fr] border-b border-linha py-2.5 text-[0.9375rem]">
              <span className="estreito num font-bold">{i + 1}</span>
              {p}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.9375rem]">
          O evento não aparece na lista? Preencha{" "}
          <a href={links.cadastroEventoFaltante} target="_blank" rel="noopener noreferrer" className="link">
            este formulário
          </a>{" "}
          ou fale com a sua CREDE/SEFOR.
        </p>
        <a href={links.portal} target="_blank" rel="noopener noreferrer" className="btn btn-primario mt-4">
          Abrir o Portal Educação Científica
          <Seta direcao="externo" />
        </a>
      </Secao>

      <Secao titulo="Materiais">
        <ul className="grid border-t border-linha sm:grid-cols-2 sm:gap-x-8">
          <Material href={links.catalogo} titulo="Catálogo de Olimpíadas 2026" texto="PDF de 106 MB. Prefira o Wi-Fi." />
          <Material href={links.radarSetembro} titulo="Radar Olímpico de Setembro" texto="PDF de 125 MB. Prefira o Wi-Fi." />
          <Material href={links.regulamentoJOC} titulo="Regulamento JOC 2026" texto="PDF de 4 MB, com formulários e anexos" />
          <Material href={links.tutorial} titulo="Tutorial do Portal" texto="PDF de 8 MB, passo a passo com imagens" />
          <Material href={asset("/docs/checklist-joc-2026.pdf")} titulo="Checklist de documentos JOC" texto="PDF para imprimir" />
          <Material href={links.pastaDecretos} titulo="Decretos sobre diárias e auxílio" texto="Pasta da COPES no Drive" />
          <Material href="/joc/" titulo="Simulador e calculadora JOC" texto="Prioridade e prazo" interno />
          <Material href="/jogos/" titulo="Jogos para usar em sala" texto="Sete treinos ligados às olimpíadas" interno />
        </ul>
      </Secao>
    </div>
  );
}
