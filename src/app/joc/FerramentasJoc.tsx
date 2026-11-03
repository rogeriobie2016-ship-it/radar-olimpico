"use client";

import { m } from "framer-motion";
import { useMemo, useState } from "react";
import { Icone } from "@/components/Icone";
import { dataExtenso, ROTULO_NIVEL } from "@/lib/rotulos";
import { diasEntre, useHoje } from "@/lib/status";
import type { Joc } from "@/lib/schema";

const COR_FAIXA: Record<string, string> = {
  A: "bg-[var(--ok-fundo)] text-[var(--ok-tinta)]",
  B: "bg-amarelo-suave text-tinta",
  C: "bg-[var(--fim-fundo)] text-[var(--fim-tinta)]",
};

export function Simulador({ matriz, faixas }: { matriz: Joc["matriz"]; faixas: Joc["faixas"] }) {
  const [marcados, setMarcados] = useState<string[]>([]);
  const [pendencia, setPendencia] = useState(false);

  const pontos = matriz.filter((c) => marcados.includes(c.id)).reduce((s, c) => s + c.pontos, 0);
  const faixa = faixas.find((f) => pontos >= f.minimo && pontos <= f.maximo)?.faixa ?? "A";

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1">
        {matriz.map((c) => (
          <li key={c.id}>
            <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-superficie-2">
              <input
                type="checkbox"
                checked={marcados.includes(c.id)}
                onChange={() => setMarcados((a) => (a.includes(c.id) ? a.filter((x) => x !== c.id) : [...a, c.id]))}
                className="mt-0.5 size-5 shrink-0 accent-[var(--laranja)]"
              />
              <span className="flex-1 text-sm">{c.texto}</span>
              <span className="shrink-0 rounded-md bg-superficie-2 px-2 py-0.5 text-sm font-black">+{c.pontos}</span>
            </label>
          </li>
        ))}
        <li>
          <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 border-dashed border-linha p-2">
            <input type="checkbox" checked={pendencia} onChange={() => setPendencia((p) => !p)} className="mt-0.5 size-5 shrink-0 accent-[var(--laranja)]" />
            <span className="text-sm">A escola tem pendência de prestação de contas de 2025</span>
          </label>
        </li>
      </ul>

      <div aria-live="polite" className={`rounded-2xl p-4 ${pendencia ? "bg-[var(--alerta-fundo)] text-[var(--alerta-tinta)]" : COR_FAIXA[faixa]}`}>
        {pendencia ? (
          <p className="font-bold">Com pendência de 2025, a escola não pode pedir financiamento. Regularize com a CREDE/SEFOR primeiro.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="azulejo grid size-20 shrink-0 place-items-center bg-superficie text-tinta">
              <m.span key={pontos} initial={{ y: 10, scale: 0.9 }} animate={{ y: 0, scale: 1 }} transition={{ duration: 0.18 }} className="font-display text-3xl font-black">
                {pontos}
              </m.span>
            </div>
            <div>
              <p className="font-display text-2xl font-black">Faixa {faixa}</p>
              <p className="text-sm">{pontos} de 100 pontos na matriz de prioridade.</p>
              {pontos === 100 && <p className="mt-1 text-xs">O Regulamento descreve a faixa A até 95 pontos, mas a pontuação máxima é 100. Consideramos A.</p>}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-tinta-2">Simulação para planejamento. Não garante financiamento: a decisão é da comissão da COPES, dentro do limite orçamentário.</p>
    </div>
  );
}

const subtrairDias = (iso: string, dias: number) => new Date(Date.parse(`${iso}T00:00:00Z`) - dias * 86_400_000).toISOString().slice(0, 10);

export function CalculadoraPrazo({ prazos, boleto }: { prazos: Joc["prazosDias"]; boleto: number }) {
  const hoje = useHoje();
  const [data, setData] = useState("");
  const [nivel, setNivel] = useState<keyof Joc["prazosDias"]>("nacional");

  const resultado = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
    const limite = subtrairDias(data, prazos[nivel]);
    return { limite, faltam: diasEntre(hoje, limite) };
  }, [data, nivel, prazos, hoje]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Primeiro dia do evento
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="campo text-base font-normal" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Nível do evento
          <select value={nivel} onChange={(e) => setNivel(e.target.value as keyof Joc["prazosDias"])} className="campo text-base font-normal">
            {(Object.keys(prazos) as (keyof Joc["prazosDias"])[]).map((n) => (
              <option key={n} value={n}>
                {ROTULO_NIVEL[n]} ({prazos[n]} dias antes)
              </option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite">
        {resultado ? (
          <div className={`rounded-2xl p-4 ${resultado.faltam < 0 ? "bg-[var(--alerta-fundo)] text-[var(--alerta-tinta)]" : "bg-[var(--ok-fundo)] text-[var(--ok-tinta)]"}`}>
            <p className="text-sm font-semibold">Abrir o processo até</p>
            <p className="font-display text-2xl font-black">{dataExtenso(resultado.limite)}</p>
            <p className="mt-1 text-sm font-medium">
              {resultado.faltam < 0
                ? `O prazo mínimo passou há ${Math.abs(resultado.faltam)} ${Math.abs(resultado.faltam) === 1 ? "dia" : "dias"}. Casos excepcionais precisam ser comprovados e são analisados pela COPES.`
                : resultado.faltam === 0
                  ? "É hoje! Fale com a CREDE/SEFOR agora."
                  : `Faltam ${resultado.faltam} ${resultado.faltam === 1 ? "dia" : "dias"}. Lembre que a escola precisa enviar os documentos à CREDE/SEFOR antes disso.`}
            </p>
          </div>
        ) : (
          <p className="rounded-2xl bg-superficie-2 p-4 text-sm text-tinta-2">Escolha a data do evento para ver até quando abrir o processo.</p>
        )}
      </div>

      <ul className="flex flex-col gap-1.5 text-xs text-tinta-2">
        <li className="flex gap-1.5">
          <Icone nome="alerta" tamanho={15} className="shrink-0" />
          Com taxa de inscrição: o boleto precisa vencer pelo menos {boleto} dias depois que o processo chega à COPES.
        </li>
        <li className="flex gap-1.5">
          <Icone nome="alerta" tamanho={15} className="shrink-0" />
          Viagem internacional com visto: considere o tempo do visto. Valores pagos antes ou durante o processo não são reembolsados.
        </li>
      </ul>
    </div>
  );
}
