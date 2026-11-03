"use client";

import { AnimatePresence, m } from "framer-motion";
import { useMemo, useState, type CSSProperties } from "react";
import Link from "@/components/L";
import { Icone } from "@/components/Icone";
import { ROTULO_NIVEL } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

type Etapa = { nivel: string; nome: string };

const NIVEIS = ["escolar", "regional", "estadual", "nacional", "internacional"] as const;
const COR: Record<string, string> = {
  escolar: "bg-amarelo text-[#24170e]",
  regional: "bg-[#ffd98a] text-[#24170e]",
  estadual: "bg-laranja text-[#24170e]",
  nacional: "bg-turquesa text-[#06312f]",
  internacional: "bg-[#2c5a88] text-white",
};
const TEXTO: Record<string, string> = {
  escolar: "Tudo começa na escola, com a turma e um professor.",
  regional: "A etapa da sua CREDE/SEFOR ou da sua região.",
  estadual: "Olimpíadas e feiras que reúnem o Ceará inteiro.",
  nacional: "Competir com estudantes de todo o Brasil.",
  internacional: "Representar o país fora dele.",
};

export function EscadaCliente({ itens, etapasCC }: { itens: Resumo[]; etapasCC: Etapa[] }) {
  const [aberto, setAberto] = useState<string>("estadual");
  const [foco, setFoco] = useState<string | null>(null);

  const porNivel = useMemo(() => {
    const mapa: Record<string, Resumo[]> = {};
    NIVEIS.forEach((n) => (mapa[n] = itens.filter((i) => i.nivel === n)));
    return mapa;
  }, [itens]);

  const porId = useMemo(() => new Map(itens.map((i) => [i.id, i])), [itens]);
  const ligacoes = useMemo(() => itens.flatMap((i) => i.credenciaPara.map((d) => ({ de: i, para: porId.get(d)! }))), [itens, porId]);

  const selecionado = foco ? porId.get(foco) : null;
  const destinos = new Set(selecionado?.credenciaPara ?? []);
  const origens = new Set(foco ? itens.filter((i) => i.credenciaPara.includes(foco)).map((i) => i.id) : []);

  return (
    <div className="flex flex-col gap-6">
      {/* Do degrau mais alto ao mais baixo: quem lê sobe a escada de baixo para cima. */}
      <ol className="flex flex-col-reverse gap-1.5" aria-label="Níveis, do escolar ao internacional">
        {NIVEIS.map((n, i) => {
          const qtd = porNivel[n].length + etapasCC.filter((e) => e.nivel === n).length;
          const ativo = aberto === n;
          return (
            <li key={n}>
              <button
                type="button"
                aria-expanded={ativo}
                onClick={() => setAberto(ativo ? "" : n)}
                className={`azulejo entrada-lateral flex min-h-16 w-[calc(100%-var(--d))] items-center justify-between gap-3 px-4 py-3 text-left ${COR[n]}`}
                style={{ marginLeft: "var(--d)", animationDelay: `${i * 70}ms`, "--d": `${i * 7}%` } as CSSProperties}
              >
                <span>
                  <span className="block font-display text-lg font-black leading-tight">{ROTULO_NIVEL[n]}</span>
                  <span className="block text-xs font-semibold">{qtd} {qtd === 1 ? "oportunidade" : "oportunidades"}</span>
                </span>
                <Icone nome="seta" className={`shrink-0 transition-transform ${ativo ? "rotate-90" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {ativo && (
                  <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <div className="py-2.5 pl-1">
                      <p className="mb-2 text-sm text-tinta-2">{TEXTO[n]}</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {etapasCC
                          .filter((e) => e.nivel === n)
                          .map((e) => (
                            <li key={e.nome}>
                              <Link href="/ceara-cientifico/" className="inline-flex min-h-11 items-center rounded-xl bg-cc-verde px-3 py-1.5 text-sm font-bold text-white no-underline">
                                Ceará Científico: {e.nome.toLowerCase()}
                              </Link>
                            </li>
                          ))}
                        {porNivel[n].map((i) => {
                          const liga = i.credenciaPara.length > 0 || itens.some((x) => x.credenciaPara.includes(i.id));
                          const destaque = foco === i.id ? "border-laranja bg-laranja text-[#24170e]" : destinos.has(i.id) ? "border-turquesa bg-turquesa-suave" : origens.has(i.id) ? "border-amarelo bg-amarelo-suave" : "border-linha bg-superficie";
                          return (
                            <li key={i.id}>
                              <button
                                type="button"
                                aria-pressed={foco === i.id}
                                onClick={() => setFoco(foco === i.id ? null : i.id)}
                                className={`inline-flex min-h-11 items-center gap-1 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold ${destaque}`}
                              >
                                {i.sigla ?? i.nome}
                                {liga && <Icone nome="escada" tamanho={14} />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        {selecionado && (
          <div className="cartao flex flex-col gap-2 p-4">
            <p className="font-display text-lg font-black">{selecionado.nome}</p>
            {destinos.size > 0 && (
              <p className="text-sm">
                <strong>Leva para:</strong> {[...destinos].map((d) => porId.get(d)?.sigla ?? porId.get(d)?.nome).join(", ")}
              </p>
            )}
            {origens.size > 0 && (
              <p className="text-sm">
                <strong>Chega aqui por:</strong> {[...origens].map((d) => porId.get(d)?.sigla ?? porId.get(d)?.nome).join(", ")}
              </p>
            )}
            {!destinos.size && !origens.size && <p className="text-sm text-tinta-2">Os documentos não informam ligação com outra etapa.</p>}
            <Link href={`/oportunidade/${selecionado.slug}/`} className="btn btn-primario self-start">
              Ver ficha completa
            </Link>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-black">Caminhos confirmados</h2>
        <p className="text-sm text-tinta-2">Só o que está escrito nos documentos da COPES. Conforme a equipe informar novas ligações, a escada cresce.</p>
        <ul className="flex flex-col gap-2">
          <li className="cartao flex flex-wrap items-center gap-2 p-3 text-sm font-bold">
            <span className="rounded-lg bg-cc-verde px-2.5 py-1 text-white">Etapa escolar</span>
            <Icone nome="seta" tamanho={16} />
            <span className="rounded-lg bg-cc-verde px-2.5 py-1 text-white">Etapa regional</span>
            <Icone nome="seta" tamanho={16} />
            <span className="rounded-lg bg-cc-verde px-2.5 py-1 text-white">Etapa estadual</span>
          </li>
          {ligacoes.map(({ de, para }) => (
            <li key={`${de.id}-${para.id}`} className="cartao flex flex-wrap items-center gap-2 p-3 text-sm font-bold">
              <Link href={`/oportunidade/${de.slug}/`} className="rounded-lg bg-superficie-2 px-2.5 py-1 underline">{de.sigla ?? de.nome}</Link>
              <Icone nome="seta" tamanho={16} />
              <Link href={`/oportunidade/${para.slug}/`} className="rounded-lg bg-superficie-2 px-2.5 py-1 underline">{para.sigla ?? para.nome}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
