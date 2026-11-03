"use client";

import Link from "@/components/L";
import { useMemo, useState } from "react";
import { Icone } from "@/components/Icone";
import { PainelFiltros } from "@/components/PainelFiltros";
import { aplicarFiltros, useFiltros } from "@/lib/filtros";
import { baixarIcs, eventosDe, type Evento } from "@/lib/ics";
import { dataCurta, dataExtenso, nomeMes } from "@/lib/rotulos";
import { calcularStatus, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function LinhaEvento({ evento, hoje }: { evento: Evento; hoje: string }) {
  const passou = evento.data < hoje;
  return (
    <li>
      <Link href={`/oportunidade/${evento.item.slug}/`} className={`cartao flex min-h-14 items-center gap-3 p-3 no-underline ${passou ? "opacity-75" : ""}`}>
        <span className={`azulejo grid size-12 shrink-0 place-items-center font-display text-sm font-black !rounded-xl ${passou ? "bg-[var(--fim-fundo)] text-[var(--fim-tinta)]" : "bg-laranja text-[#24170e]"}`}>
          {dataCurta(evento.data)}
        </span>
        <span>
          <span className="block font-bold leading-tight">{evento.titulo}</span>
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
    <div className="flex flex-col gap-4">
      <PainelFiltros itens={itens} filtros={filtros} setFiltros={setFiltros} alternar={alternar} limpar={limpar} total={filtrados.length} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Forma de ver" className="flex rounded-xl border-2 border-linha p-0.5">
          {(["mes", "lista"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={`min-h-10 rounded-lg px-4 text-sm font-bold ${vista === v ? "bg-laranja text-[#24170e]" : ""}`}
            >
              {v === "mes" ? "Mês" : "Lista"}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-secundario !min-h-11 !py-1.5 text-sm" disabled={!eventos.length} onClick={() => baixarIcs("radar-olimpico.ics", eventos)}>
          <Icone nome="download" tamanho={18} />
          Exportar tudo (.ics)
        </button>
      </div>

      {vista === "mes" ? (
        <>
          <section className="cartao p-3" aria-label={`Calendário de ${nomeMes(mes)} de ${ano}`}>
            <div className="mb-2 flex items-center justify-between">
              <button type="button" className="grid size-11 place-items-center rounded-xl hover:bg-superficie-2" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>
                <Icone nome="seta" className="rotate-180" />
              </button>
              <h2 className="text-lg font-extrabold capitalize" aria-live="polite">
                {nomeMes(mes)} {ano}
              </h2>
              <button type="button" className="grid size-11 place-items-center rounded-xl hover:bg-superficie-2" aria-label="Próximo mês" onClick={() => mudarMes(1)}>
                <Icone nome="seta" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {SEMANA.map((s, i) => (
                <div key={i} className="py-1 text-xs font-bold text-tinta-2">
                  <abbr title={SEMANA_LONGA[i]} className="no-underline">{s}</abbr>
                </div>
              ))}
              {Array.from({ length: inicioSemana }).map((_, i) => (
                <div key={`vazio-${i}`} />
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
                    className={`relative grid aspect-square min-h-10 place-items-center rounded-lg text-sm ${
                      n ? "bg-laranja-suave font-extrabold" : "text-tinta-2"
                    } ${dia === d ? "!bg-laranja text-[#24170e]" : ""} ${ehHoje ? "ring-2 ring-[var(--turquesa-forte)]" : ""}`}
                  >
                    {i + 1}
                    {n > 1 && <span className="absolute right-0.5 top-0 text-[0.65rem] font-black">{n}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {mostrados.length ? (
            <ul className="flex flex-col gap-2">
              {mostrados.map((e) => (
                <LinhaEvento key={`${e.item.id}-${e.data}-${e.titulo}`} evento={e} hoje={hoje} />
              ))}
            </ul>
          ) : (
            <div className="cartao p-5 text-center">
              <p className="font-bold">Sem prazos conhecidos neste mês.</p>
              {ultimo && (
                <button
                  type="button"
                  className="btn btn-secundario mt-3"
                  onClick={() => {
                    setEscolhido({ ano: Number(ultimo.data.slice(0, 4)), mes: Number(ultimo.data.slice(5, 7)) - 1 });
                    setDia(null);
                  }}
                >
                  Ir para o último prazo ({dataExtenso(ultimo.data)})
                </button>
              )}
            </div>
          )}
        </>
      ) : eventos.length ? (
        <ul className="flex flex-col gap-2">
          {eventos.map((e) => (
            <LinhaEvento key={`${e.item.id}-${e.data}-${e.titulo}`} evento={e} hoje={hoje} />
          ))}
        </ul>
      ) : (
        <p className="cartao p-5 text-center font-bold">Nenhum prazo com esses filtros.</p>
      )}
    </div>
  );
}
