import type { MetadataRoute } from "next";
import { urlAbsoluta } from "@/lib/base";
import { meta, oportunidades } from "@/lib/dados";
import { ROTAS_ESTUDOS } from "@/lib/estudos";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixas = ["/", "/radar/", "/calendario/", "/novidades/", "/jogos/", "/escada/", "/ceara-cientifico/", "/joc/", "/professores/", ...ROTAS_ESTUDOS];
  return [
    ...fixas.map((c) => ({ url: urlAbsoluta(c), lastModified: meta.atualizadoEm })),
    ...oportunidades.map((o) => ({ url: urlAbsoluta(`/oportunidade/${o.slug}/`), lastModified: o.atualizadoEm })),
  ];
}
