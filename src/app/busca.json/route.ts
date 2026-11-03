import { resumos } from "@/lib/dados";

export const dynamic = "force-static";

/** Índice leve da busca: baixado só quando alguém abre a busca. */
export function GET() {
  const indice = resumos
    .map(({ id, slug, nome, sigla, nivel, inicio, fim, areas }) => ({ id, slug, nome, sigla, nivel, inicio, fim, areas }))
    .sort((a, b) => (b.fim ?? "").localeCompare(a.fim ?? ""));
  return Response.json(indice);
}
