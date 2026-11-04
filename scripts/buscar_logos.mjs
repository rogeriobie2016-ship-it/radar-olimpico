// Procura o logo de cada item sem logo no site oficial e no perfil oficial do Instagram.
// Só baixa candidatos para materiais/logos-web/: o que entra no site é decidido depois, olhando (scripts/aplicar_logos.py).
// Rodar da raiz: node scripts/buscar_logos.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const SAIDA = join(RAIZ, "materiais", "logos-web");
mkdirSync(SAIDA, { recursive: true });

const itens = JSON.parse(readFileSync(join(RAIZ, "data/oportunidades.json"), "utf8"));
const comLogo = new Set([...readFileSync(join(RAIZ, "src/lib/logos.ts"), "utf8").matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
const faltam = itens.filter((i) => !comLogo.has(i.id) && (i.linkOficial || i.instagram));

const CABECALHOS = { "user-agent": "Mozilla/5.0 (compatible; RadarOlimpicoLogos/1.0)", accept: "text/html,image/*,*/*" };

async function baixar(url, ms = 15000) {
  const r = await fetch(url, { headers: CABECALHOS, redirect: "follow", signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  return r;
}

const attr = (tag, nome) => tag.match(new RegExp(`${nome}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? "";

function candidatos(html, base, item) {
  const achados = [];
  const add = (u, nota, origem) => {
    if (!u || u.startsWith("data:")) return;
    try {
      achados.push({ url: new URL(u.replace(/&amp;/g, "&"), base).href, nota, origem });
    } catch {
      /* endereço inválido */
    }
  };
  const sigla = (item.sigla ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const t = m[0];
    const src = attr(t, "src") || attr(t, "data-src") || attr(t, "data-lazy-src");
    const texto = `${src} ${attr(t, "alt")} ${attr(t, "class")} ${attr(t, "id")}`.toLowerCase();
    let nota = 0;
    if (/logo|marca|brand/.test(texto)) nota += 6;
    if (sigla.length >= 3 && texto.includes(sigla)) nota += 3;
    if (/footer|rodape|parceir|patrocin|apoio|sponsor|partner/.test(texto)) nota -= 5;
    if (nota > 0) add(src, nota + Math.max(0, 2 - m.index / 20000), "img");
  }
  for (const m of html.matchAll(/"logo"\s*:\s*(?:\{[^}]*?"url"\s*:\s*)?"([^"]+)"/gi)) add(m[1].replace(/\\\//g, "/"), 6, "json-ld");
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(m[0], "rel").toLowerCase();
    if (rel.includes("apple-touch-icon")) add(attr(m[0], "href"), 4, "touch-icon");
    else if (rel.includes("icon")) add(attr(m[0], "href"), 1.5, "icon");
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const p = (attr(m[0], "property") || attr(m[0], "name")).toLowerCase();
    if (p === "og:image" || p === "twitter:image") add(attr(m[0], "content"), 3, "og");
  }
  const vistos = new Set();
  return achados.filter((a) => !vistos.has(a.url) && vistos.add(a.url)).sort((a, b) => b.nota - a.nota).slice(0, 5);
}

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg", "image/gif": "gif", "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico" };

async function pegarImagens(item, lista, manifesto) {
  let n = manifesto.length;
  for (const c of lista) {
    if (manifesto.length >= 4) break;
    try {
      const r = await baixar(c.url);
      const tipo = (r.headers.get("content-type") ?? "").split(";")[0].trim();
      const ext = EXT[tipo] ?? c.url.split("?")[0].split(".").pop()?.toLowerCase();
      if (!["png", "jpg", "jpeg", "webp", "svg", "gif", "ico"].includes(ext)) continue;
      const dados = Buffer.from(await r.arrayBuffer());
      if (dados.length < 300 || dados.length > 6_000_000) continue;
      const arquivo = `${item.id}__${n++}.${ext}`;
      writeFileSync(join(SAIDA, arquivo), dados);
      manifesto.push({ arquivo, url: c.url, origem: c.origem });
    } catch {
      /* candidato fora do ar: tenta o próximo */
    }
  }
}

async function processar(item) {
  const manifesto = [];
  const erros = [];
  if (item.linkOficial) {
    try {
      const r = await baixar(item.linkOficial);
      const tipo = r.headers.get("content-type") ?? "";
      if (tipo.includes("html")) await pegarImagens(item, candidatos(await r.text(), r.url, item), manifesto);
    } catch (e) {
      erros.push(`site: ${e.message}`);
    }
  }
  // O post não serve: só o perfil traz a foto.
  const perfil = item.instagram?.match(/instagram\.com\/([A-Za-z0-9._]+)/)?.[1];
  if (perfil && perfil !== "p") {
    try {
      const r = await baixar(`https://www.instagram.com/${perfil}/`);
      const og = (await r.text()).match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
      if (og) await pegarImagens(item, [{ url: og.replace(/&amp;/g, "&"), nota: 5, origem: "instagram" }], manifesto);
    } catch (e) {
      erros.push(`instagram: ${e.message}`);
    }
  }
  return { id: item.id, nome: item.nome, sigla: item.sigla, site: item.linkOficial, candidatos: manifesto, erros };
}

const resultado = [];
const fila = [...faltam];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (fila.length) {
      const item = fila.shift();
      resultado.push(await processar(item));
    }
  }),
);
writeFileSync(join(SAIDA, "manifesto.json"), JSON.stringify(resultado, null, 1));
const achou = resultado.filter((r) => r.candidatos.length).length;
console.log(`${faltam.length} sem logo, ${achou} com candidatos, ${resultado.reduce((s, r) => s + r.candidatos.length, 0)} imagens.`);
console.log("instagram:", resultado.filter((r) => r.candidatos.some((c) => c.origem === "instagram")).length);
console.log("sem nada:", resultado.filter((r) => !r.candidatos.length).map((r) => r.id).join(" "));
