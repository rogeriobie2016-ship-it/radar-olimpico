// Confere todos os JSON de /data antes de publicar. Roda sozinho no deploy.
// Em caso de erro, explica em português qual item e qual campo corrigir.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ZodType } from "zod";
import { CAMPOS } from "../src/lib/campos";
import { JOGOS } from "../src/lib/jogos";
import { areasEstudoSchema, baralhosSchema, cearaCientificoSchema, culturaSchema, jocSchema, metaSchema, novidadesSchema, oportunidadesSchema, problemasEstudos, tecnicasSchema, videosSchema, type AreasEstudo, type Oportunidade } from "../src/lib/schema";

const pasta = join(process.cwd(), "data");
const arquivos: [string, ZodType][] = [
  ["oportunidades.json", oportunidadesSchema],
  ["ceara-cientifico.json", cearaCientificoSchema],
  ["joc.json", jocSchema],
  ["meta.json", metaSchema],
  ["novidades.json", novidadesSchema],
  ["estudos/tecnicas.json", tecnicasSchema],
  ["estudos/areas.json", areasEstudoSchema],
  ["estudos/cultura.json", culturaSchema],
  ["estudos/baralhos.json", baralhosSchema],
  ["estudos/videos.json", videosSchema],
];

let erros = 0;
for (const [nome, schema] of arquivos) {
  const texto = readFileSync(join(pasta, nome), "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch (e) {
    erros++;
    console.error(`\n✗ ${nome}: o arquivo não é um JSON válido (vírgula ou aspas faltando?).\n  ${(e as Error).message}`);
    continue;
  }
  if (/[—–]/.test(texto)) {
    erros++;
    console.error(`\n✗ ${nome}: tem travessão (— ou –). Troque por vírgula, dois-pontos ou parênteses.`);
  }
  const r = schema.safeParse(json);
  if (!r.success) {
    for (const p of r.error.issues) {
      erros++;
      const i = typeof p.path[0] === "number" ? (json as { nome?: string }[])[p.path[0]]?.nome : null;
      console.error(`\n✗ ${nome}${i ? ` (item "${i}")` : ""}, campo ${p.path.join(".")}: ${p.message}`);
    }
  } else {
    console.log(`✓ ${nome}${Array.isArray(json) ? `: ${json.length} itens` : ""}`);
  }
}

// A Biblioteca de Estudos liga áreas a fichas e jogos: tudo o que ela cita precisa existir.
const lerJson = (nome: string) => JSON.parse(readFileSync(join(pasta, nome), "utf-8")) as unknown;
try {
  const ids = new Set((lerJson("oportunidades.json") as Oportunidade[]).map((o) => o.id));
  const problemas = problemasEstudos(lerJson("estudos/areas.json") as AreasEstudo, ids, new Set(JOGOS.map((j) => j.slug)));
  for (const p of problemas) {
    erros++;
    console.error(`\n✗ estudos/areas.json: ${p}`);
  }
} catch {
  // JSON inválido já foi avisado acima.
}

// Cada campo liga olimpíadas, jogos e estudos: as três portas precisam levar a algum lugar.
try {
  const fichas = lerJson("oportunidades.json") as Oportunidade[];
  const areasCatalogo = new Set(fichas.flatMap((o) => o.areas));
  const estudos = (lerJson("estudos/areas.json") as AreasEstudo).areas;
  const problemas: string[] = [];
  for (const j of JOGOS) {
    const n = CAMPOS.filter((c) => c.jogos.some(([s]) => s === j.slug)).length;
    if (n !== 1) problemas.push(`o jogo "${j.slug}" está em ${n} campos, e deve estar em 1`);
  }
  for (const a of areasCatalogo) if (!CAMPOS.some((c) => c.areas.includes(a))) problemas.push(`a área "${a}" do catálogo não leva a nenhum campo`);
  for (const c of CAMPOS) {
    for (const [s] of c.jogos) if (!JOGOS.some((j) => j.slug === s)) problemas.push(`campo "${c.id}": o jogo "${s}" não existe`);
    for (const a of c.areas) if (!areasCatalogo.has(a)) problemas.push(`campo "${c.id}": a área "${a}" não existe no catálogo`);
    if (c.areaEstudo) {
      const e = estudos.find((x) => x.slug === c.areaEstudo);
      if (!e) problemas.push(`campo "${c.id}": a área de estudo "${c.areaEstudo}" não existe`);
      else for (const [s] of c.jogos) if (!e.jogos.includes(s)) problemas.push(`estudos/areas.json: a área "${e.slug}" não cita o jogo "${s}"`);
    }
  }
  // Toda estante do Planeta Estante precisa de vídeo, e todo vídeo de uma estante.
  const vids = (lerJson("estudos/videos.json") as { videos: { id: string; campo: string }[] }).videos;
  for (const c of CAMPOS) {
    const n = vids.filter((x) => x.campo === c.id).length;
    if (n < 1 || n > 5) problemas.push(`a estante "${c.id}" tem ${n} vídeos, e cabem de 1 a 5`);
  }
  for (const x of vids) if (!CAMPOS.some((c) => c.id === x.campo)) problemas.push(`o vídeo "${x.id}" aponta para o campo "${x.campo}", que não existe`);
  for (const j of [...JOGOS.map((x) => x.slug), "planeta-estante"]) if (!existsSync(join(process.cwd(), "public/capas", `${j}.webp`))) problemas.push(`falta a capa public/capas/${j}.webp (veja scripts/capas/gerar.mjs)`);
  for (const p of problemas) {
    erros++;
    console.error(`\n✗ src/lib/campos.ts: ${p}`);
  }
} catch {
  // JSON inválido já foi avisado acima.
}

if (erros) {
  console.error(`\n${erros} problema(s) encontrado(s). Corrija antes de publicar.`);
  process.exit(1);
}
console.log("\nTudo certo com os dados.");
