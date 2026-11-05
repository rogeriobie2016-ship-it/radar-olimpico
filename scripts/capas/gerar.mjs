// Gera as capas de /public/capas a partir de scripts/capas/cenas.ts.
// Só é preciso rodar quando uma capa mudar. Precisa do Chrome e do playwright-core (fora das dependências do site):
//   npm install --no-save playwright-core
//   node scripts/capas/gerar.mjs [slug...]
// Se o playwright-core estiver em outra pasta, indique em PW_DIR.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const raiz = resolve(import.meta.dirname, "../..");
const require = createRequire(process.env.PW_DIR ? join(process.env.PW_DIR, "x.js") : import.meta.url);
const { chromium } = require("playwright-core");

const js = join(tmpdir(), `capas-${process.pid}.js`);
execFileSync(process.execPath, [join(raiz, "node_modules/esbuild/bin/esbuild"), join(raiz, "scripts/capas/cenas.ts"), "--bundle", "--format=iife", "--global-name=Capas", `--outfile=${js}`, "--log-level=error"], { cwd: raiz });

const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.error("erro:", e.message));
await p.setContent("<!doctype html><title>Capas</title><body></body>");
await p.addScriptTag({ content: readFileSync(js, "utf8") });
await p.evaluate(() => {
  window.gerador = window.Capas.iniciar();
});
const pedidos = process.argv.slice(2);
const slugs = pedidos.length ? pedidos : await p.evaluate(() => window.gerador.slugs);
mkdirSync(join(raiz, "public/capas"), { recursive: true });
for (const slug of slugs) {
  const url = await p.evaluate((s) => window.gerador.renderizar(s, 600, 840), slug);
  const dados = Buffer.from(url.split(",")[1], "base64");
  writeFileSync(join(raiz, "public/capas", `${slug}.webp`), dados);
  console.log(slug, Math.round(dados.length / 1024), "KB");
}
await b.close();
