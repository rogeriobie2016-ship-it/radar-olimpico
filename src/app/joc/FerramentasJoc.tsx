"use client";

import { m } from "framer-motion";
import { useMemo, useState } from "react";
import { dataExtenso, ROTULO_NIVEL } from "@/lib/rotulos";
import { diasEntre, useHoje } from "@/lib/status";
import type { Joc } from "@/lib/schema";

export function Simulador({ matriz, faixas }: { matriz: Joc["matriz"]; faixas: Joc["faixas"] }) {
  const [marcados, setMarcados] = useState<string[]>([]);
  const [pendencia, setPendencia] = useState(false);
  const pontos = matriz.filter((c) => marcados.includes(c.id)).reduce((s, c) => s + c.pontos, 0);
  const faixa = faixas.find((f) => pontos >= f.minimo && pontos <= f.maximo)?.faixa ?? "A";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
      <ul className="border-t border-linha">
        {matriz.map((c) => (
          <li key={c.id} className="border-b border-linha">
            <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3 transition-colors hover:bg-fundo-2">
              <input type="checkbox" checked={marcados.includes(c.id)} onChange={() => setMarcados((a) => (a.includes(c.id) ? a.filter((x) => x !== c.id) : [...a, c.id]))} className="marcar" />
              <span className="flex-1 text-[0.9375rem]">{c.texto}</span>
              <span className="estreito num shrink-0 text-lg font-bold">+{c.pontos}</span>
            </label>
          </li>
        ))}
        <li className="border-b border-linha">
          <label className="flex min-h-12 cursor-pointer items-start gap-3 py-3 transition-colors hover:bg-fundo-2">
            <input type="checkbox" checked={pendencia} onChange={() => setPendencia((p) => !p)} className="marcar" />
            <span className="text-[0.9375rem]">A escola tem pendência de prestação de contas de 2025</span>
          </label>
        </li>
      </ul>

      <div aria-live="polite" className="lg:sticky lg:top-20 lg:self-start">
        {pendencia ? (
          <p className="estreito text-[1.75rem] font-bold leading-tight text-alerta">Com pendência de 2025, a escola não pode pedir financiamento. Regularize com a CREDE/SEFOR primeiro.</p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-4 border-b-[3px] border-tinta pb-3">
              <m.span key={pontos} initial={{ y: 10 }} animate={{ y: 0 }} transition={{ duration: 0.18 }} className="estreito num text-[6rem] font-bold leading-[0.8]">
                {pontos}
              </m.span>
              <span className="estreito text-[2.25rem] font-bold leading-none">Faixa {faixa}</span>
            </div>
            <p className="mt-2 text-sm text-tinta-2">de 100 pontos na matriz de prioridade.</p>
            {pontos === 100 && <p className="mt-2 text-sm">O Regulamento descreve a faixa A até 95 pontos, mas o máximo é 100. Consideramos A.</p>}
          </>
        )}
        <p className="mt-3 text-sm text-tinta-2">Simulação para planejamento. A decisão é da comissão da COPES, dentro do limite orçamentário.</p>
      </div>
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
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col text-[0.9375rem] font-medium">
          Primeiro dia do evento
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="campo" />
        </label>
        <label className="flex flex-col text-[0.9375rem] font-medium">
          Nível do evento
          <select value={nivel} onChange={(e) => setNivel(e.target.value as keyof Joc["prazosDias"])} className="campo bg-transparent">
            {(Object.keys(prazos) as (keyof Joc["prazosDias"])[]).map((n) => (
              <option key={n} value={n}>
                {ROTULO_NIVEL[n]}, {prazos[n]} dias antes
              </option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="min-h-24">
        {resultado ? (
          <>
            <p className="text-[0.9375rem] text-tinta-2">Abrir o processo até</p>
            <p className="estreito text-[2.5rem] font-bold leading-none sm:text-5xl">{dataExtenso(resultado.limite)}</p>
            <p className={`mt-2 text-[0.9375rem] font-medium ${resultado.faltam < 0 ? "text-alerta" : "text-ok"}`}>
              {resultado.faltam < 0
                ? `O prazo mínimo passou há ${Math.abs(resultado.faltam)} ${Math.abs(resultado.faltam) === 1 ? "dia" : "dias"}. Casos excepcionais precisam ser comprovados e são analisados pela COPES.`
                : resultado.faltam === 0
                  ? "O prazo é hoje. Fale agora com a CREDE/SEFOR."
                  : `Faltam ${resultado.faltam} ${resultado.faltam === 1 ? "dia" : "dias"}. A escola precisa enviar os documentos à CREDE/SEFOR antes disso.`}
            </p>
          </>
        ) : (
          <p className="text-tinta-2">Informe a data do evento para calcular.</p>
        )}
      </div>

      <ul className="text-sm text-tinta-2">
        <li className="border-t border-linha py-2">Com taxa de inscrição, o boleto precisa vencer pelo menos {boleto} dias depois que o processo chega à COPES.</li>
        <li className="border-t border-linha py-2">Em viagem internacional com visto, considere o tempo do visto. Valores pagos antes ou durante o processo não são reembolsados.</li>
      </ul>
    </div>
  );
}
