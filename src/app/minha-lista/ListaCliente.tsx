"use client";

import { useEffect, useState } from "react";
import Link from "@/components/L";
import { LinhaOportunidade } from "@/components/LinhaOportunidade";
import { urlAbsoluta } from "@/lib/base";
import { useFavoritos } from "@/lib/favoritos";
import { baixarIcs, eventosDe, linkWhatsApp } from "@/lib/ics";
import { compararPrazo, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

export function ListaCliente({ itens }: { itens: Resumo[] }) {
  const { lista } = useFavoritos();
  const hoje = useHoje();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  if (!montado) return null;

  const salvos = itens.filter((i) => lista.includes(i.id)).sort((a, b) => compararPrazo(a, b, hoje));
  const eventos = eventosDe(salvos);

  if (!salvos.length)
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="max-w-md text-tinta-2">Nada salvo ainda. Use o marcador de qualquer oportunidade para guardá-la neste aparelho, sem precisar de login.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/radar/" className="btn btn-primario">Abrir o Radar</Link>
          <Link href="/descubra/" className="btn btn-secundario">Descobrir a minha</Link>
        </div>
      </div>
    );

  const texto = `Minha lista no Radar Olímpico:\n${salvos.map((s) => `${s.nome}: ${urlAbsoluta(`/oportunidade/${s.slug}/`)}`).join("\n")}`;

  return (
    <div className="flex flex-col gap-4">
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
      <ul className="regua grid lg:grid-cols-2 lg:gap-x-10">
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
