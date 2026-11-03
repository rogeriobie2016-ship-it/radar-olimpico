"use client";

import { Salvar } from "@/components/Salvar";
import { Seta } from "@/components/Seta";
import { urlAbsoluta } from "@/lib/base";
import { baixarIcs, eventosDe, linkWhatsApp } from "@/lib/ics";
import { dataCurta } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

export function AcoesOportunidade({ item }: { item: Resumo }) {
  const eventos = eventosDe([item]);
  const url = urlAbsoluta(`/oportunidade/${item.slug}/`);
  const prazo = item.fim ? ` Inscrições até ${dataCurta(item.fim)}.` : "";
  const texto = `${item.nome} no Radar Olímpico.${prazo} ${url}`;

  return (
    <div className="sem-print grid gap-2 sm:grid-cols-2">
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primario sm:col-span-2">
          Abrir o site oficial
          <Seta direcao="externo" />
        </a>
      )}
      <Salvar id={item.id} nome={item.nome} completo />
      <a href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
        Compartilhar no WhatsApp
      </a>
      {eventos.length > 0 && (
        <button type="button" className="btn btn-secundario sm:col-span-2" onClick={() => baixarIcs(`${item.slug}.ics`, eventos)}>
          Adicionar ao calendário
        </button>
      )}
    </div>
  );
}
