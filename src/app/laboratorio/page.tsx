import type { Metadata } from "next";
import { oportunidades } from "@/lib/dados";
import { ESTACOES } from "@/lab/estacoes";
import { LabCliente, type FichaLab } from "@/lab/LabCliente";
import type { ItemInternacional } from "@/lab/Experimentos";

export const metadata: Metadata = {
  title: "Laboratório Vivo",
  description: "Um laboratório em 3D para explorar no navegador: ande, use os equipamentos e descubra as olimpíadas de cada campo do conhecimento.",
};

export default function Laboratorio() {
  const usados = new Set(ESTACOES.flatMap((e) => e.olimpiadas));
  const fichas: Record<string, FichaLab> = {};
  for (const o of oportunidades) if (usados.has(o.id)) fichas[o.id] = { id: o.id, slug: o.slug, nome: o.nome, sigla: o.sigla };

  const internacionais: ItemInternacional[] = oportunidades
    .filter((o) => o.nivel === "internacional")
    .map((o) => ({ id: o.id, slug: o.slug, nome: o.nome, sigla: o.sigla, tipo: o.tipo, idiomas: o.idiomas ?? null, bolsa: o.tipo === "bolsa" || o.tipo === "intercambio" }))
    .sort((a, b) => Number(b.bolsa) - Number(a.bolsa) || a.nome.localeCompare(b.nome, "pt-BR"));

  return <LabCliente fichas={fichas} internacionais={internacionais} />;
}
