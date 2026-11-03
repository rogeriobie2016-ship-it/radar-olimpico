// Monitor dos sites oficiais. Roda todo dia pelo GitHub Actions (.github/workflows/monitor.yml).
//
// Abre o site oficial de cada oportunidade, procura frases sobre inscrição, edital, prova e calendário
// e compara com a última visita. Regras para não inventar nada:
//  - Só vira prazo uma frase que fala de inscrição e traz data futura com ano escrito.
//  - Na primeira visita a um site nada vira novidade, exceto prazo.
//  - Todo item guarda o trecho e o link da fonte, e aparece no site como detecção automática.
//  - O que a COPES preencheu em oportunidades.json nunca é alterado.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const raiz = process.cwd();
const ler = (a, padrao) => (existsSync(join(raiz, a)) ? JSON.parse(readFileSync(join(raiz, a), "utf-8")) : padrao);
const oportunidades = ler("data/oportunidades.json", []);
const estado = ler("data/monitor-estado.json", {});
const novidades = ler("data/novidades.json", { verificadoEm: null, itens: [] });

const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(new Date());
const UA = "RadarOlimpicoBot/0.1 (+https://rogeriobie2016-ship-it.github.io/radar-olimpico/)";
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const TEMAS = /inscri[çc]|edital|regulamento|calend[áa]rio|cronograma|prazo|primeira fase|segunda fase|\bprovas?\b/i;
const diasDe = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const curto = (t) => createHash("sha1").update(t).digest("hex").slice(0, 12);

async function baixar(url, ms = 20000) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(ms) });
  const buf = Buffer.from(await r.arrayBuffer());
  const tipo = r.headers.get("content-type") ?? "";
  const cs = /charset=([\w-]+)/i.exec(tipo)?.[1] ?? /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.subarray(0, 2000).toString("latin1"))?.[1] ?? "utf-8";
  let texto;
  try {
    texto = new TextDecoder(cs).decode(buf);
  } catch {
    texto = buf.toString("utf-8");
  }
  return { ok: r.ok, status: r.status, tipo, texto };
}

/** Respeita o robots.txt: se o site pede para não visitar a página, o monitor não visita. */
async function permitido(url) {
  try {
    const u = new URL(url);
    const { ok, texto } = await baixar(`${u.origin}/robots.txt`, 8000);
    if (!ok) return true;
    let aplica = false;
    for (const linha of texto.split(/\r?\n/)) {
      const [k, ...v] = linha.split(":");
      const val = v.join(":").trim();
      if (/^user-agent$/i.test(k.trim())) aplica = val === "*" || /radarolimpico/i.test(val);
      else if (aplica && /^disallow$/i.test(k.trim()) && val && u.pathname.startsWith(val)) return false;
    }
    return true;
  } catch {
    return true;
  }
}

const ENTIDADES = { "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&ccedil;": "ç", "&atilde;": "ã", "&otilde;": "õ", "&aacute;": "á", "&eacute;": "é", "&iacute;": "í", "&oacute;": "ó", "&uacute;": "ú", "&ecirc;": "ê", "&ocirc;": "ô", "&agrave;": "à", "&acirc;": "â", "&ordm;": "º", "&ordf;": "ª" };

function frasesDe(html) {
  const limpo = html
    .replace(/<(script|style|noscript|svg|nav|footer)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h\d|tr|td|section|article|br)>|<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[#\w]+;/g, (e) => ENTIDADES[e] ?? " ")
    .replace(/[—–]/g, ",")
    .replace(/\s+/g, " ");
  return [...new Set(limpo.split(/(?<=[.!?;])\s+(?=[A-ZÀ-Ú0-9])|\.\s*\./).map((f) => f.trim().replace(/^[.\s,]+/, "")))].filter((f) => f.length > 24 && f.length < 320 && TEMAS.test(f));
}

/** Datas com ano escrito. Sem ano, não dá para saber de qual edição é: descarta. */
function datasCompletas(f) {
  const lista = [];
  for (const m of f.matchAll(/\b(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2}|\d{2})\b/g)) {
    const ano = m[3].length === 2 ? `20${m[3]}` : m[3];
    lista.push({ pos: m.index, iso: `${ano}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`, mes: +m[2], dia: +m[1] });
  }
  for (const m of f.matchAll(/\b(\d{1,2})º?\s+de\s+(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(?:de\s+)?(20\d{2})\b/gi)) {
    const mes = MESES.findIndex((n) => n.replace("ç", "c") === m[2].toLowerCase().replace("ç", "c")) + 1;
    lista.push({ pos: m.index, iso: `${m[3]}-${String(mes).padStart(2, "0")}-${m[1].padStart(2, "0")}`, mes, dia: +m[1] });
  }
  return lista.filter((d) => d.mes >= 1 && d.mes <= 12 && d.dia >= 1 && d.dia <= 31).sort((a, b) => a.pos - b.pos);
}

/**
 * Prazo: a palavra "inscrição" seguida, em até 80 caracteres, de um limite e de uma data.
 * Num intervalo ("de 01/03/2026 a 15/12/2026"), vale a segunda data. A data de outro assunto na mesma
 * frase é ignorada, porque só o trecho logo depois de "inscrição" conta.
 */
function acharPrazo(frases) {
  for (const f of frases) {
    for (const m of f.matchAll(/inscri[çc][õãa]\w*/gi)) {
      const janela = f.slice(m.index + m[0].length, m.index + m[0].length + 80);
      if (/resultado|recurso|gabarito|premia[çc]|isen[çc]|afilia/i.test(f.slice(Math.max(0, m.index - 40), m.index))) continue;
      const datas = datasCompletas(janela);
      if (!datas.length || !/\b(at[ée]|encerra\w*|termina\w*|t[ée]rmino|prazo|limite|fim|a|à)\b/i.test(janela)) continue;
      const fim = /\b(de|entre|in[íi]cio|abertas?)\b/i.test(janela.slice(0, datas[0].pos)) && datas[1] ? datas[1] : datas[0];
      const dias = diasDe(hoje, fim.iso);
      if (dias >= 0 && dias <= 300) return { fim: fim.iso, trecho: f };
    }
  }
  return null;
}

const recortar = (t, n = 170) => (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, "")}...` : t);

function registrar(item) {
  if (novidades.itens.some((n) => n.id === item.id)) return false;
  novidades.itens.unshift(item);
  return true;
}

async function visitar(o) {
  const anterior = estado[o.id] ?? { frases: [], visitas: 0 };
  const registro = { ...anterior, verificadoEm: hoje };
  try {
    if (!(await permitido(o.linkOficial))) return (estado[o.id] = { ...registro, situacao: "robots" }), "robots";
    const { ok, status, tipo, texto } = await baixar(o.linkOficial);
    if (!ok) return (estado[o.id] = { ...registro, situacao: `http ${status}` }), `http ${status}`;
    if (!/html|text/.test(tipo)) return (estado[o.id] = { ...registro, situacao: "nao-html" }), "nao-html";

    const frases = frasesDe(texto);
    if (process.env.DEBUG) for (const f of frases) if (/2026|2027/.test(f) && /inscri|edital|fase/i.test(f)) console.log(`[${o.id}]`, f.slice(0, 220));
    const hashes = frases.map(curto);
    const novas = anterior.visitas ? frases.filter((f) => !anterior.frases.includes(curto(f))) : [];
    const nome = o.sigla && o.sigla.length <= 9 ? o.sigla : o.nome;

    const prazo = acharPrazo(frases);
    const jaNoCadastro = o.inscricoes.fim && o.inscricoes.fim >= prazo?.fim;
    if (prazo && !jaNoCadastro) {
      registrar({ id: `${o.id}-prazo-${prazo.fim}`, oportunidadeId: o.id, tipo: "prazo", titulo: `${nome}: inscrições até ${prazo.fim.split("-").reverse().join("/")}`, trecho: recortar(prazo.trecho), url: o.linkOficial, prazoFim: prazo.fim, detectadoEm: hoje, origem: "monitor", verificado: false });
    } else if (novas.length) {
      const relevante = novas.find((f) => /inscri[çc]|edital/i.test(f)) ?? novas[0];
      registrar({ id: `${o.id}-site-${curto(relevante)}`, oportunidadeId: o.id, tipo: "atualizacao", titulo: `${nome}: site oficial atualizado`, trecho: recortar(relevante), url: o.linkOficial, prazoFim: null, detectadoEm: hoje, origem: "monitor", verificado: false });
    }
    estado[o.id] = { frases: [...new Set([...hashes, ...anterior.frases])].slice(0, 80), visitas: anterior.visitas + 1, verificadoEm: hoje, situacao: "ok" };
    return frases.length ? "ok" : "sem-texto";
  } catch (e) {
    estado[o.id] = { ...registro, situacao: "falhou" };
    return e.name === "TimeoutError" ? "demorou" : "falhou";
  }
}

const fila = oportunidades.filter((o) => o.linkOficial);
const resumo = {};
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (fila.length) {
      const o = fila.shift();
      const r = await visitar(o);
      resumo[r] = (resumo[r] ?? 0) + 1;
    }
  }),
);

// Novidade automática sai depois de 90 dias. As da COPES ficam até alguém tirar.
novidades.itens = novidades.itens
  .filter((n) => n.origem !== "monitor" || diasDe(n.detectadoEm, hoje) <= 90)
  .sort((a, b) => b.detectadoEm.localeCompare(a.detectadoEm));
novidades.verificadoEm = hoje;

writeFileSync(join(raiz, "data/monitor-estado.json"), `${JSON.stringify(estado, null, 1)}\n`);
writeFileSync(join(raiz, "data/novidades.json"), `${JSON.stringify(novidades, null, 2)}\n`);
console.log("Visitas:", resumo, "| Novidades:", novidades.itens.length);
