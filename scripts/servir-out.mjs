// Serve a pasta out/ no mesmo caminho do GitHub Pages, para testar o site como ele será publicado.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_PATH ?? "/radar-olimpico";
const porta = Number(process.env.PORTA ?? 3211);
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (url === "/") {
    res.writeHead(302, { Location: `${base}/` });
    return res.end();
  }
  if (!url.startsWith(base)) {
    res.writeHead(404);
    return res.end("fora do basePath");
  }
  let arquivo = normalize(join(raiz, url.slice(base.length)));
  if (!arquivo.startsWith(raiz)) {
    res.writeHead(403);
    return res.end();
  }
  if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = join(arquivo, "index.html");
  const achou = existsSync(arquivo);
  if (!achou) arquivo = join(raiz, "404.html");
  res.writeHead(achou ? 200 : 404, {
    "Content-Type": tipos[extname(arquivo)] ?? "application/octet-stream",
    "Cache-Control": url.includes("/_next/static/") ? "public, max-age=31536000, immutable" : "no-cache",
  });
  createReadStream(arquivo).pipe(res);
}).listen(porta, () => console.log(`http://localhost:${porta}${base}/`));
