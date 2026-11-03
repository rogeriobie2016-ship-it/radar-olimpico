"use client";

import Link from "@/components/L";
import { useEffect, useState } from "react";
import { CartaoOportunidade } from "@/components/CartaoOportunidade";
import { Icone } from "@/components/Icone";
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

  const salvos = itens.filter((i) => lista.includes(i.id)).sort((a, b) => compararPrazo(a, b, hoje));
  const eventos = eventosDe(salvos);

  if (!montado) return <p className="text-tinta-2">Carregando sua lista...</p>;

  if (!salvos.length)
    return (
      <div className="cartao flex flex-col items-center gap-3 p-8 text-center">
        <Icone nome="lista" tamanho={40} className="text-laranja-forte" />
        <p className="text-lg font-bold">Sua lista está vazia</p>
        <p className="max-w-sm text-sm text-tinta-2">Toque no marcador de qualquer oportunidade para guardar aqui. Ela fica salva neste aparelho, sem precisar de login.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/radar/" className="btn btn-primario">Ver o Radar</Link>
          <Link href="/descubra/" className="btn btn-secundario">Fazer o quiz</Link>
        </div>
      </div>
    );

  const texto = `Minha lista no Radar Olímpico:\n${salvos.map((s) => `- ${s.nome}: ${urlAbsoluta(`/oportunidade/${s.slug}/`)}`).join("\n")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:flex">
        <a href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
          <Icone nome="whatsapp" />
          Enviar pelo WhatsApp
        </a>
        <button type="button" className="btn btn-secundario" disabled={!eventos.length} onClick={() => baixarIcs("minha-lista-radar.ics", eventos)}>
          <Icone nome="calendario" />
          {eventos.length ? "Levar prazos para a agenda" : "Nenhum item tem data ainda"}
        </button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {salvos.map((item) => (
          <li key={item.id} className="grid">
            <CartaoOportunidade item={item} />
          </li>
        ))}
      </ul>
      <p className="text-xs text-tinta-2">Sua lista fica guardada só neste navegador. Se limpar os dados do navegador, ela some.</p>
    </div>
  );
}
