import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalculadoraPrazo, Simulador } from "./FerramentasJoc";
import { Seta } from "@/components/Seta";
import { asset } from "@/lib/base";
import { joc, meta } from "@/lib/dados";

export const metadata: Metadata = {
  title: "JOC",
  description: "Regras do financiamento JOC 2026 em linguagem simples, simulador de prioridade, calculadora de prazo e checklist de documentos.",
};

function Secao({ id, titulo, children }: { id?: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id}>
      <h2 className="regua mb-4 uppercase">{titulo}</h2>
      {children}
    </section>
  );
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="border-t border-linha">
      {itens.map((d) => (
        <li key={d} className="border-b border-linha py-2.5 text-[0.9375rem]">
          {d}
        </li>
      ))}
    </ul>
  );
}

export default function PaginaJoc() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-6">
      <header className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="!text-[clamp(2.2rem,8vw,4.5rem)]">Juventude Olímpica do <span className="text-marca">Conhecimento</span></h1>
          <p className="max-w-2xl text-[1.1875rem] leading-snug">{joc.resumo}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/joc/logo.webp")} alt="Logo da Juventude Olímpica do Conhecimento" width={560} height={348} className="h-auto w-56 lg:w-full" />
      </header>

      <dl className="grid grid-cols-3 gap-2">
        {[
          [joc.equipe.professores, "professor orientador"],
          [joc.equipe.estudantes, "estudantes, no máximo"],
          [joc.equipe.financiamentosPorAno, "pedidos por escola no ano"],
        ].map(([n, t], i) => (
          <div key={t} className="azulejo p-3" style={{ background: ["#f58a33", "#00c9c8", "#fdc13f"][i], color: "#10201f" }}>
            <dd className="estreito num text-6xl font-bold leading-none">{n}</dd>
            <dt className="mt-1 text-[0.8125rem] font-extrabold leading-tight sm:text-[0.9375rem]">{t}</dt>
          </div>
        ))}
      </dl>

      <Secao id="simulador" titulo="Simulador de prioridade">
        <Simulador matriz={joc.matriz} faixas={joc.faixas} />
        <details className="mt-5 border-t border-linha pt-2">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">Critérios de desempate</summary>
          <ol className="ml-5 list-decimal pb-2 text-[0.9375rem]">
            {joc.desempate.map((d) => (
              <li key={d} className="py-0.5">{d}</li>
            ))}
          </ol>
        </details>
      </Secao>

      <Secao id="prazo" titulo="Até quando abrir o processo">
        <CalculadoraPrazo prazos={joc.prazosDias} boleto={joc.prazoBoletoDias} />
      </Secao>

      <Secao titulo="O que o JOC cobre">
        <dl className="border-t border-linha">
          {joc.beneficios.map((b) => (
            <div key={b.titulo} className="grid gap-1 border-b border-linha py-3 sm:grid-cols-[16rem_1fr] sm:gap-6">
              <dt className="estreito text-[1.375rem] font-bold leading-tight">{b.titulo}</dt>
              <dd className="text-[0.9375rem]">{b.texto}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[0.9375rem] text-tinta-2">{joc.equipe.texto}</p>
      </Secao>

      <Secao titulo="O caminho do processo">
        <ol className="grid gap-2 md:grid-cols-4">
          {joc.fluxo.map((f, i) => (
            <li key={f.quem} className="azulejo p-3.5" style={{ background: ["#f58a33", "#fdc13f", "#00c9c8", "#f8a8c8"][i], color: "#10201f" }}>
              <span className="estreito num text-sm">{i + 1}</span>
              <p className="estreito text-[1.75rem] font-bold leading-none">{f.quem}</p>
              <p className="mt-1.5 text-[0.9375rem]">{f.oQue}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.9375rem] text-tinta-2">Se faltar documento, o processo volta para a CREDE/SEFOR e a escola, e pode não ser aprovado.</p>
      </Secao>

      <Secao id="documentos" titulo="Documentos">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2">Da escola</h3>
            <Lista itens={joc.documentosEscola} />
          </div>
          <div>
            <h3 className="mb-2">De cada participante</h3>
            <Lista itens={joc.documentosParticipante} />
          </div>
        </div>
        <p className="mt-4 border-l-[3px] border-marca pl-3 text-[0.9375rem]">
          {joc.regrasConta.join(" ")} O Regulamento pede preferência por Bradesco, Banco do Brasil e Caixa e também diz que não aceita outros bancos. Confirme com a CREDE/SEFOR antes de abrir a conta.
        </p>
        <div className="sem-print mt-4 grid gap-2 sm:flex">
          <a href={asset("/docs/checklist-joc-2026.pdf")} download className="btn btn-primario">
            Baixar checklist em PDF
          </a>
          <a href={meta.links.regulamentoJOC} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
            Regulamento 2026 (PDF, 4 MB)
            <Seta direcao="externo" />
          </a>
        </div>
      </Secao>

      <div className="grid gap-14 md:grid-cols-2 md:gap-8">
        <Secao titulo="O que não é financiado">
          <Lista itens={joc.naoFinancia} />
        </Secao>
        <Secao titulo="Depois do evento">
          <Lista itens={joc.posEvento} />
        </Secao>
      </div>

      <p className="text-sm text-tinta-2">Fonte: {joc.fonte}. Em caso de divergência, vale o Regulamento.</p>
    </div>
  );
}
