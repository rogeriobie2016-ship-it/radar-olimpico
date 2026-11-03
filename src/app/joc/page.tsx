import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { CalculadoraPrazo, Simulador } from "./FerramentasJoc";
import { Icone } from "@/components/Icone";
import { asset } from "@/lib/base";
import { joc, meta } from "@/lib/dados";

export const metadata: Metadata = {
  title: "JOC: financiamento",
  description: "Regras do financiamento JOC 2026 em linguagem simples, simulador de prioridade, calculadora de prazo e checklist de documentos.",
};

function Secao({ id, titulo, children }: { id?: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="cartao p-4 sm:p-5">
      <h2 className="mb-3 text-2xl font-black">{titulo}</h2>
      {children}
    </section>
  );
}

function ListaCheck({ itens }: { itens: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {itens.map((d) => (
        <li key={d} className="flex gap-2.5 text-sm">
          <Icone nome="check" tamanho={18} className="mt-0.5 shrink-0 text-turquesa-forte" />
          {d}
        </li>
      ))}
    </ul>
  );
}

export default function PaginaJoc() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-5">
      <header className="flex flex-col items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/logos/joc-laranja.webp")} alt="Juventude Olímpica do Conhecimento" width={720} height={447} className="h-auto w-56 rounded-2xl bg-white p-2" />
        <h1 className="text-3xl font-black sm:text-4xl">Financiamento para a sua equipe viajar</h1>
        <p>{joc.resumo}</p>
        <div className="grid w-full grid-cols-3 gap-2">
          {[
            { n: joc.equipe.professores, t: "professor orientador", c: "bg-laranja text-[#24170e]" },
            { n: joc.equipe.estudantes, t: "estudantes, no máximo", c: "bg-turquesa text-[#06312f]" },
            { n: joc.equipe.financiamentosPorAno, t: "pedidos por escola no ano", c: "bg-amarelo text-[#24170e]" },
          ].map((x) => (
            <div key={x.t} className={`azulejo flex flex-col gap-1 p-3 ${x.c}`}>
              <span className="font-display text-3xl font-black leading-none">{x.n}</span>
              <span className="text-xs font-bold leading-tight">{x.t}</span>
            </div>
          ))}
        </div>
        <nav aria-label="Nesta página" className="sem-print flex w-full flex-wrap gap-2">
          <a href="#simulador" className="btn btn-secundario flex-1 text-sm">Simular prioridade</a>
          <a href="#prazo" className="btn btn-secundario flex-1 text-sm">Calcular prazo</a>
          <a href="#documentos" className="btn btn-secundario flex-1 text-sm">Documentos</a>
        </nav>
      </header>

      <Secao titulo="O que o JOC paga">
        <ul className="grid gap-3 sm:grid-cols-2">
          {joc.beneficios.map((b) => (
            <li key={b.titulo} className="rounded-2xl bg-superficie-2 p-3">
              <h3 className="font-extrabold">{b.titulo}</h3>
              <p className="mt-0.5 text-sm">{b.texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-tinta-2">{joc.equipe.texto}</p>
      </Secao>

      <Secao id="simulador" titulo="Simulador de prioridade">
        <p className="mb-3 text-sm text-tinta-2">Marque o que vale para a sua escola e veja a pontuação e a faixa.</p>
        <Simulador matriz={joc.matriz} faixas={joc.faixas} />
        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 font-bold">Critérios de desempate</summary>
          <ol className="ml-5 list-decimal">
            {joc.desempate.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>
        </details>
      </Secao>

      <Secao id="prazo" titulo="Até quando abrir o processo?">
        <CalculadoraPrazo prazos={joc.prazosDias} boleto={joc.prazoBoletoDias} />
      </Secao>

      <Secao titulo="O caminho do processo">
        <ol className="flex flex-col items-stretch gap-0 sm:flex-row">
          {joc.fluxo.map((f, i) => (
            <Fragment key={f.quem}>
              <li className="flex-1 rounded-2xl bg-superficie-2 p-3">
                <p className="font-display text-lg font-black text-laranja-forte">{f.quem}</p>
                <p className="mt-0.5 text-sm">{f.oQue}</p>
              </li>
              {i < joc.fluxo.length - 1 && (
                <li aria-hidden="true" className="grid h-8 place-items-center sm:h-auto sm:w-7">
                  <Icone nome="seta" className="rotate-90 text-laranja-forte sm:rotate-0" />
                </li>
              )}
            </Fragment>
          ))}
        </ol>
        <p className="mt-3 text-sm text-tinta-2">Faltou documento? O processo volta para a CREDE/SEFOR e a escola, e pode não ser aprovado.</p>
      </Secao>

      <Secao id="documentos" titulo="Documentos">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-extrabold">Da escola</h3>
            <ListaCheck itens={joc.documentosEscola} />
          </div>
          <div>
            <h3 className="mb-2 font-extrabold">De cada participante</h3>
            <ListaCheck itens={joc.documentosParticipante} />
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-amarelo-suave p-3 text-sm">
          {joc.regrasConta.join(" ")} O Regulamento pede preferência por Bradesco, Banco do Brasil e Caixa e também diz que não aceita outros bancos: confirme com a CREDE/SEFOR antes de abrir a conta.
        </p>
        <div className="sem-print mt-3 grid gap-2 sm:grid-cols-2">
          <a href={asset("/docs/checklist-joc-2026.pdf")} download className="btn btn-primario">
            <Icone nome="download" />
            Baixar checklist (PDF)
          </a>
          <a href={meta.links.regulamentoJOC} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
            Regulamento 2026 (PDF, 4 MB)
            <Icone nome="externo" tamanho={18} />
          </a>
        </div>
      </Secao>

      <Secao titulo="O que não é financiado">
        <ListaCheck itens={joc.naoFinancia} />
      </Secao>

      <Secao titulo="Depois do evento">
        <ListaCheck itens={joc.posEvento} />
      </Secao>

      <p className="text-xs text-tinta-2">Fonte: {joc.fonte}. Em caso de divergência, vale o Regulamento.</p>
    </div>
  );
}
