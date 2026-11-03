import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/base";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const raiz = `${BASE_PATH}/`;
  return {
    name: "Radar Olímpico",
    short_name: "Radar",
    description: "Olimpíadas, feiras e oportunidades para estudantes da rede estadual do Ceará.",
    lang: "pt-BR",
    start_url: raiz,
    scope: raiz,
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffaf3",
    theme_color: "#f58a33",
    icons: [
      { src: `${BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE_PATH}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Radar", url: `${BASE_PATH}/radar/` },
      { name: "Calendário", url: `${BASE_PATH}/calendario/` },
      { name: "Minha lista", url: `${BASE_PATH}/minha-lista/` },
    ],
  };
}
