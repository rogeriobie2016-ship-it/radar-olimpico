"use client";

import { BotaoSalvar } from "@/components/BotaoSalvar";
import { Icone } from "@/components/Icone";
import { urlAbsoluta } from "@/lib/base";
import { baixarIcs, eventosDe, linkWhatsApp } from "@/lib/ics";
import { dataCurta } from "@/lib/rotulos";
import type { Resumo } from "@/lib/tipos";

export function AcoesOportunidade({ item }: { item: Resumo }) {
  const eventos = eventosDe([item]);
  const url = urlAbsoluta(`/oportunidade/${item.slug}/`);
  const prazo = item.fim ? ` Inscrições até ${dataCurta(item.fim)}.` : "";
  const texto = `${item.nome}: olha essa oportunidade no Radar Olímpico.${prazo} ${url}`;

  return (
    <div className="sem-print grid gap-2 sm:grid-cols-2">
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-primario sm:col-span-2">
          Ir para o site oficial
          <Icone nome="externo" tamanho={18} />
        </a>
      )}
      <a href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
        <Icone nome="whatsapp" />
        Compartilhar no WhatsApp
      </a>
      <button
        type="button"
        className="btn btn-secundario"
        disabled={eventos.length === 0}
        onClick={() => baixarIcs(`${item.slug}.ics`, eventos)}
      >
        <Icone nome="calendario" />
        {eventos.length ? "Adicionar ao calendário" : "Sem data para o calendário"}
      </button>
      <div className="sm:col-span-2">
        <BotaoSalvar id={item.id} nome={item.nome} comTexto />
      </div>
    </div>
  );
}
