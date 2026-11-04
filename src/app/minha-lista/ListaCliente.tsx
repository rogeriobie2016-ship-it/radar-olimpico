"use client";

import { useEffect, useState } from "react";
import Link from "@/components/L";
import { LinhaOportunidade } from "@/components/LinhaOportunidade";
import { Mascote } from "@/components/Mascote";
import { urlAbsoluta } from "@/lib/base";
import { useFavoritos } from "@/lib/favoritos";
import { CARIMBOS, useCarimbos, useGuia } from "@/lib/guia";
import { baixarIcs, eventosDe, linkWhatsApp } from "@/lib/ics";
import { compararPrazo, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

function Passaporte() {
  const meus = useCarimbos();
  const { quem } = useGuia();
  return (
    <section aria-label="Passaporte Científico" className="azulejo overflow-hidden bg-[#0a2a55] p-4 text-white">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="uppercase">Passaporte Científico</h2>
          <p className="num mt-1 font-bold">
            {meus.length} de {CARIMBOS.length} carimbos
          </p>
        </div>
        <Mascote quem={quem} pose={meus.length ? "comemora" : "acena"} className="w-20 shrink-0" />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CARIMBOS.map((c) => {
          const tem = meus.includes(c.id);
          return (
            <li key={c.id} className={`rounded-2xl p-2.5 transition-all ${tem ? "" : "opacity-60"}`} style={tem ? { background: c.cor, color: "#10201f" } : { boxShadow: "inset 0 0 0 1.5px #2c5f82" }}>
              <p className="estreito text-[0.9375rem] leading-tight">{c.titulo}</p>
              <p className="mt-1 text-[0.75rem] font-semibold leading-tight">{tem ? "Conquistado" : c.como}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ListaCliente({ itens }: { itens: Resumo[] }) {
  const { lista } = useFavoritos();
  const hoje = useHoje();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  if (!montado) return <Passaporte />;

  const salvos = itens.filter((i) => lista.includes(i.id)).sort((a, b) => compararPrazo(a, b, hoje));
  const eventos = eventosDe(salvos);

  if (!salvos.length)
    return (
      <div className="flex flex-col items-start gap-5">
        <Passaporte />
        <p className="max-w-md text-tinta-2">Nada salvo ainda. Use o marcador de qualquer oportunidade para guardá-la neste aparelho, sem precisar de login.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/radar/" className="btn btn-primario">Abrir o Radar</Link>
          <Link href="/escada/" className="btn btn-secundario">Descobrir a minha</Link>
        </div>
      </div>
    );

  const texto = `Minha lista no Radar Olímpico:\n${salvos.map((s) => `${s.nome}: ${urlAbsoluta(`/oportunidade/${s.slug}/`)}`).join("\n")}`;

  return (
    <div className="flex flex-col gap-4">
      <Passaporte />
      <div className="flex flex-wrap gap-x-5">
        <a href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center text-[0.9375rem]">
          Enviar pelo WhatsApp
        </a>
        {eventos.length > 0 && (
          <button type="button" className="link min-h-11 text-[0.9375rem]" onClick={() => baixarIcs("minha-lista-radar.ics", eventos)}>
            Levar prazos para a agenda
          </button>
        )}
      </div>
      <ul className="grid lg:grid-cols-2 lg:gap-x-3">
        {salvos.map((item) => (
          <li key={item.id}>
            <LinhaOportunidade item={item} />
          </li>
        ))}
      </ul>
      <p className="text-sm text-tinta-2">A lista fica guardada só neste navegador.</p>
    </div>
  );
}
