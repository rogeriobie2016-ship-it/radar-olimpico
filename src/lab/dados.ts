import { oportunidades } from "@/lib/dados";
import { ESTACOES } from "./estacoes";
import type { ItemInternacional } from "./Experimentos";
import type { FichaLab } from "./LabCliente";

/** O que o laboratório precisa do catálogo, tanto na página própria quanto embutido no início. */
export function dadosLab() {
  const usados = new Set(ESTACOES.flatMap((e) => e.olimpiadas));
  const fichas: Record<string, FichaLab> = {};
  for (const o of oportunidades) if (usados.has(o.id)) fichas[o.id] = { id: o.id, slug: o.slug, nome: o.nome, sigla: o.sigla };

  const internacionais: ItemInternacional[] = oportunidades
    .filter((o) => o.nivel === "internacional")
    .map((o) => ({ id: o.id, slug: o.slug, nome: o.nome, sigla: o.sigla, tipo: o.tipo, idiomas: o.idiomas ?? null, bolsa: o.tipo === "bolsa" || o.tipo === "intercambio" }))
    .sort((a, b) => Number(b.bolsa) - Number(a.bolsa) || a.nome.localeCompare(b.nome, "pt-BR"));

  return { fichas, internacionais };
}
