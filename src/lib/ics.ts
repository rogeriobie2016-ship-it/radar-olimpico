import { urlAbsoluta } from "./base";
import type { Resumo } from "./tipos";

export type Evento = { data: string; titulo: string; item: Resumo; tipo: "inscricao" | "prova" };

/** Cada prazo ou prova vira um evento de calendário. */
export function eventosDe(itens: Resumo[]): Evento[] {
  return itens
    .flatMap<Evento>((item) => {
      const nome = item.sigla ?? item.nome;
      const lista: Evento[] = [];
      if (item.inicio) lista.push({ data: item.inicio, titulo: `Abrem as inscrições: ${nome}`, item, tipo: "inscricao" });
      if (item.fim) lista.push({ data: item.fim, titulo: `Último dia de inscrição: ${nome}`, item, tipo: "inscricao" });
      item.provas.forEach((p) => lista.push({ data: p.data, titulo: `${p.fase}: ${nome}`, item, tipo: "prova" }));
      return lista;
    })
    .sort((a, b) => a.data.localeCompare(b.data));
}

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// O formato .ics pede linhas curtas, com continuação começando por espaço.
const dobrar = (linha: string) => {
  const partes: string[] = [];
  for (let i = 0; i < linha.length; i += 70) partes.push((i ? " " : "") + linha.slice(i, i + 70));
  return partes.join("\r\n");
};

const compacta = (iso: string) => iso.replace(/-/g, "");
const diaSeguinte = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

export function gerarIcs(eventos: Evento[]) {
  const agora = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const linhas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SEDUC Ceara//Radar Olimpico//PT-BR", "CALSCALE:GREGORIAN"];
  eventos.forEach((e, i) => {
    const pagina = urlAbsoluta(`/oportunidade/${e.item.slug}/`);
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${e.item.id}-${compacta(e.data)}-${i}@radar-olimpico`,
      `DTSTAMP:${agora}`,
      `DTSTART;VALUE=DATE:${compacta(e.data)}`,
      `DTEND;VALUE=DATE:${compacta(diaSeguinte(e.data))}`,
      `SUMMARY:${esc(e.titulo)}`,
      `DESCRIPTION:${esc(`${e.item.nome}. Confirme no site oficial. ${pagina}`)}`,
      `URL:${pagina}`,
      "END:VEVENT",
    );
  });
  linhas.push("END:VCALENDAR");
  return linhas.map(dobrar).join("\r\n") + "\r\n";
}

export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const baixarIcs = (nome: string, eventos: Evento[]) => baixarArquivo(nome, gerarIcs(eventos), "text/calendar;charset=utf-8");

export const linkWhatsApp = (texto: string) => `https://wa.me/?text=${encodeURIComponent(texto)}`;
