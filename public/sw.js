// Service worker do Radar Olímpico: abre rápido em 3G e continua útil sem internet.
const VERSAO = "radar-v1";
const BASE = self.location.pathname.replace(/sw\.js$/, "");
const ESSENCIAIS = [BASE, `${BASE}radar/`, `${BASE}minha-lista/`, `${BASE}descubra/`, `${BASE}calendario/`, `${BASE}icons/icon-192.png`, `${BASE}logos/joc-laranja.webp`];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSAO)
      .then((c) => Promise.allSettled(ESSENCIAIS.map((u) => c.add(u))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

const guardar = async (req, res) => {
  if (res.ok) {
    const c = await caches.open(VERSAO);
    await c.put(req, res.clone());
  }
  return res;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  // Arquivos com nome versionado e imagens: do cache primeiro.
  if (url.pathname.includes("/_next/static/") || /\/(logos|icons|og)\//.test(url.pathname)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => guardar(req, res))));
    return;
  }

  // Páginas e dados: rede primeiro, para os prazos estarem sempre atualizados. Sem internet, usa a última cópia.
  e.respondWith(
    fetch(req)
      .then((res) => guardar(req, res))
      .catch(async () => {
        const salvo = await caches.match(req, { ignoreSearch: true });
        if (salvo) return salvo;
        if (req.mode === "navigate") return (await caches.match(BASE)) || Response.error();
        return Response.error();
      }),
  );
});
