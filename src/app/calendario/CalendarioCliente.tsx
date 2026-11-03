"use client";

import { useMemo, useState } from "react";
import Link from "@/components/L";
import { PainelFiltros } from "@/components/PainelFiltros";
import { Seta } from "@/components/Seta";
import { aplicarFiltros, useFiltros } from "@/lib/filtros";
import { baixarIcs, eventosDe, type Evento } from "@/lib/ics";
import { dataCurta, dataExtenso, nomeMes } from "@/lib/rotulos";
import { calcularStatus, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function LinhaEvento({ evento, hoje }: { evento: Evento; hoje: string }) {
  const passou = evento.data < hoje;
  return (
    <li>
      <Link href={`/oportunidade/${evento.item.slug}/`} className="linha-lista grid grid-cols-[4.25rem_1fr] items-baseline gap-3 py-3">
        <span className={`estreito num text-[1.75rem] font-bold leading-none ${passou ? "text-tinta-2" : ""}`}>{dataCurta(evento.data)}</span>
        <span>
          <span className="block font-semibold leading-snug">{evento.titulo}</span>
          <span className="text-sm text-tinta-2">{passou ? "Prazo encerrado" : evento.item.nome}</span>
        </span>
      </Link>
    </li>
  );
}

export function CalendarioCliente({ itens }: { itens: Resumo[] }) {
  const { filtros, setFiltros, alternar, limpar } = useFiltros();
  const hoje = useHoje();
  const [vista, setVista] = useState<"mes" | "lista">("mes");
  const [escolhido, setEscolhido] = useState<{ ano: number; mes: number } | null>(null);
  const [dia, setDia] = useState<string | null>(null);

  const filtrados = useMemo(() => aplicarFiltros(itens, filtros, (i) => estaAberto(calcularStatus(i, hoje))), [itens, filtros, hoje]);
  const eventos = useMemo(() => eventosDe(filtrados), [filtrados]);

  const ano = escolhido?.ano ?? Number(hoje.slice(0, 4));
  const mes = escolhido?.mes ?? Number(hoje.slice(5, 7)) - 1;
  const prefixo = `${ano}-${String(mes + 1).padStart(2, "0")}`;
  const doMes = eventos.filter((e) => e.data.startsWith(prefixo));
  const inicioSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();

  const mudarMes = (delta: number) => {
    const d = new Date(Date.UTC(ano, mes + delta, 1));
    setEscolhido({ ano: d.getUTCFullYear(), mes: d.getUTCMonth() });
    setDia(null);
  };

  const ultimo = eventos.at(-1);
  const mostrados = dia ? eventos.filter((e) => e.data === dia) : doMes;

  return (
    <div className="flex flex-col gap-5">
      <PainelFiltros itens={itens} filtros={filtros} setFiltros={setFiltros} alternar={alternar} limpar={limpar} total={filtrados.length} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Forma de ver" className="flex gap-1">
          <button type="button" className="opcao" aria-pressed={vista === "mes"} onClick={() => setVista("mes")}>Mês</button>
          <button type="button" className="opcao" aria-pressed={vista === "lista"} onClick={() => setVista("lista")}>Lista</button>
        </div>
        <button type="button" className="link min-h-11 text-[0.9375rem] disabled:opacity-40" disabled={!eventos.length} onClick={() => baixarIcs("radar-olimpico.ics", eventos)}>
          Exportar tudo para a agenda
        </button>
      </div>

      {vista === "mes" ? (
        <>
          <section aria-label={`Calendário de ${nomeMes(mes)} de ${ano}`}>
            <div className="regua flex items-center justify-between py-2">
              <button type="button" className="grid size-11 place-items-center" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>
                <Seta direcao="esquerda" />
              </button>
              <h2 className="titulo-3 !text-[1.75rem] capitalize" aria-live="polite">
                {nomeMes(mes)} {ano}
              </h2>
              <button type="button" className="grid size-11 place-items-center" aria-label="Próximo mês" onClick={() => mudarMes(1)}>
                <Seta />
              </button>
            </div>
            <div className="grid grid-cols-7 border-l border-t border-linha">
              {SEMANA.map((s) => (
                <div key={s} className="border-b border-r border-linha py-1.5 text-center text-xs text-tinta-2">{s}</div>
              ))}
              {Array.from({ length: inicioSemana }).map((_, i) => (
                <div key={`v-${i}`} className="border-b border-r border-linha" />
              ))}
              {Array.from({ length: totalDias }).map((_, i) => {
                const d = `${prefixo}-${String(i + 1).padStart(2, "0")}`;
                const n = doMes.filter((e) => e.data === d).length;
                const ehHoje = d === hoje;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={!n}
                    aria-pressed={dia === d}
                    aria-label={`${i + 1} de ${nomeMes(mes)}${n ? `, ${n} ${n === 1 ? "prazo" : "prazos"}` : ""}`}
                    onClick={() => setDia(dia === d ? null : d)}
                    className={`num relative flex aspect-square min-h-11 flex-col items-start justify-between border-b border-r border-linha p-1.5 text-left text-sm transition-colors ${
                      dia === d ? "bg-tinta text-fundo" : n ? "font-bold hover:bg-fundo-2" : "text-tinta-2"
                    } ${ehHoje ? "underline decoration-2 underline-offset-2" : ""}`}
                  >
                    {i + 1}
                    {n > 0 && (
                      <span aria-hidden="true" className="flex gap-0.5">
                        {Array.from({ length: Math.min(n, 3) }).map((_, k) => (
                          <span key={k} className="size-1.5 bg-marca" />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {mostrados.length ? (
            <ul className="border-t border-linha">
              {mostrados.map((e) => (
                <LinhaEvento key={`${e.item.id}-${e.data}-${e.titulo}`} evento={e} hoje={hoje} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-tinta-2">Sem prazos conhecidos neste mês.</p>
              {ultimo && (
                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={() => {
                    setEscolhido({ ano: Number(ultimo.data.slice(0, 4)), mes: Number(ultimo.data.slice(5, 7)) - 1 });
                    setDia(null);
                  }}
                >
                  Ver o último prazo, {dataExtenso(ultimo.data)}
                </button>
              )}
            </div>
          )}
        </>
      ) : eventos.length ? (
        <ul className="regua">
          {eventos.map((e) => (
            <LinhaEvento key={`${e.item.id}-${e.data}-${e.titulo}`} evento={e} hoje={hoje} />
          ))}
        </ul>
      ) : (
        <p className="text-tinta-2">Nenhum prazo com esses filtros.</p>
      )}
    </div>
  );
}
