// Confere todos os JSON de /data antes de publicar. Roda sozinho no deploy.
// Em caso de erro, explica em português qual item e qual campo corrigir.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ZodType } from "zod";
import { cearaCientificoSchema, jocSchema, metaSchema, oportunidadesSchema } from "../src/lib/schema";

const pasta = join(process.cwd(), "data");
const arquivos: [string, ZodType][] = [
  ["oportunidades.json", oportunidadesSchema],
  ["ceara-cientifico.json", cearaCientificoSchema],
  ["joc.json", jocSchema],
  ["meta.json", metaSchema],
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

if (erros) {
  console.error(`\n${erros} problema(s) encontrado(s). Corrija antes de publicar.`);
  process.exit(1);
}
console.log("\nTudo certo com os dados.");
