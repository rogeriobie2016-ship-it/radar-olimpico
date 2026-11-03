// Dados lidos e validados no build. Se um JSON estiver errado, o site não publica.
import ccJson from "@data/ceara-cientifico.json";
import jocJson from "@data/joc.json";
import metaJson from "@data/meta.json";
import oportunidadesJson from "@data/oportunidades.json";
import { cearaCientificoSchema, jocSchema, metaSchema, oportunidadesSchema } from "./schema";
import type { Oportunidade } from "./schema";
import type { Resumo } from "./tipos";

export const oportunidades = oportunidadesSchema.parse(oportunidadesJson);
export const meta = metaSchema.parse(metaJson);
export const cearaCientifico = cearaCientificoSchema.parse(ccJson);
export const joc = jocSchema.parse(jocJson);

/** Versão leve de cada item, para listas no navegador (sem textos longos). */
export const resumir = (o: Oportunidade): Resumo => ({
  id: o.id,
  slug: o.slug,
  nome: o.nome,
  sigla: o.sigla,
  tipo: o.tipo,
  areas: o.areas,
  series: o.publico.series,
  modalidade: o.modalidade,
  participacao: o.participacao,
  nivel: o.nivel,
  formato: o.formato,
  custo: o.custo.tipo,
  inicio: o.inscricoes.inicio,
  fim: o.inscricoes.fim,
  provas: o.provas,
  financiavelJOC: o.financiavelJOC,
  vagaOlimpica: o.desbloqueia.some((d) => d.tipo === "vaga-olimpica"),
  link: o.linkOficial,
  credenciaPara: o.credenciaPara,
  temFicha: !!o.descricao,
});

export const resumos: Resumo[] = oportunidades.map(resumir);
