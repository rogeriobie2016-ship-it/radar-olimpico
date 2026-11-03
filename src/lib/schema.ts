import { z } from "zod";

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use o formato AAAA-MM-DD");

export const TIPOS = ["olimpiada", "feira", "evento", "programa", "bolsa", "intercambio"] as const;
export const NIVEIS = ["escolar", "regional", "estadual", "nacional", "internacional"] as const;
export const MODALIDADES = ["online", "presencial", "hibrida"] as const;
export const SERIES = ["EF-iniciais", "6EF", "7EF", "8EF", "9EF", "1EM", "2EM", "3EM", "TEC", "EJA"] as const;
export const CUSTOS = ["gratuito", "pago", "valor"] as const;

export const oportunidadeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "use só letras minúsculas, números e hífen"),
  nome: z.string().min(2),
  sigla: z.string().nullable(),
  tipo: z.enum(TIPOS),
  organizador: z.string().nullable(),
  areas: z.array(z.string()).min(1),
  publico: z.object({ texto: z.string().nullable(), series: z.array(z.enum(SERIES)) }),
  modalidade: z.enum(MODALIDADES).nullable(),
  participacao: z.enum(["individual", "grupo", "individual-ou-grupo"]).nullable(),
  nivel: z.enum(NIVEIS),
  formato: z.enum(["prova", "projeto"]),
  custo: z.object({ tipo: z.enum(CUSTOS).nullable(), observacao: z.string().nullable() }),
  descricao: z.string().nullable(),
  objetivo: z.string().nullable(),
  observacoes: z.string().nullable(),
  inscricoes: z.object({ inicio: data.nullable(), fim: data.nullable() }),
  provas: z.array(z.object({ fase: z.string(), data })),
  linkOficial: z.url().nullable(),
  comoParticipar: z.array(z.string()),
  desbloqueia: z.array(
    z.object({ tipo: z.enum(["medalha", "vaga-olimpica", "bolsa", "credenciamento"]), texto: z.string() }),
  ),
  credenciaPara: z.array(z.string()),
  financiavelJOC: z.boolean(),
  fonte: z.string().min(1),
  aConfirmar: z.boolean(),
  camposAConfirmar: z.array(z.string()),
  atualizadoEm: data,
});

export const oportunidadesSchema = z.array(oportunidadeSchema).superRefine((lista, ctx) => {
  const ids = new Set<string>();
  lista.forEach((item, i) => {
    if (ids.has(item.id)) ctx.addIssue({ code: "custom", path: [i, "id"], message: `id repetido: ${item.id}` });
    ids.add(item.id);
  });
  lista.forEach((item, i) => {
    item.credenciaPara.forEach((destino) => {
      if (!ids.has(destino))
        ctx.addIssue({ code: "custom", path: [i, "credenciaPara"], message: `id inexistente: ${destino}` });
    });
    if (item.inscricoes.inicio && item.inscricoes.fim && item.inscricoes.inicio > item.inscricoes.fim)
      ctx.addIssue({ code: "custom", path: [i, "inscricoes"], message: "início depois do fim" });
  });
});

export const metaSchema = z.object({
  ultimaEdicaoRadar: z.string(),
  ultimaEdicaoRadarData: data,
  atualizadoEm: data,
  links: z.object({
    portal: z.url(),
    cadastroEventoFaltante: z.url(),
    regulamentoJOC: z.url(),
    catalogo: z.url(),
    tutorial: z.url(),
    formularios: z.url(),
    pastaDecretos: z.url(),
    radarSetembro: z.url(),
  }),
});

const ganhador = z.object({
  ano: z.number(),
  categoria: z.string(),
  crede: z.string(),
  escola: z.string(),
  projeto: z.string(),
  colocacao: z.string().nullable(),
  municipio: z.string().nullable(),
});

export const cearaCientificoSchema = z.object({
  resumo: z.string(),
  portal: z.url(),
  etapas: z.array(z.object({ nivel: z.enum(NIVEIS), nome: z.string(), texto: z.string() })),
  categorias: z.object({ lista: z.array(z.string()), aConfirmar: z.boolean(), nota: z.string() }),
  edicoes: z.array(
    z.object({
      ano: z.number(),
      etapaEstadual: z.object({
        datas: z.string(),
        local: z.string(),
        projetos: z.number(),
        escolas: z.number(),
        estudantes: z.string(),
        municipios: z.number(),
      }),
      fonte: z.string(),
    }),
  ),
  ganhadores: z.array(ganhador),
  projetosDestaque: z.array(ganhador.extend({ resumo: z.string(), imagem: z.string().nullable() })),
  revista: z.object({ titulo: z.string(), capa: z.string().nullable(), link: z.url().nullable(), aConfirmar: z.boolean() }),
  comoChegar: z.array(z.object({ titulo: z.string(), texto: z.string() })),
});

export const jocSchema = z.object({
  resumo: z.string(),
  temaNorteador: z.string(),
  beneficios: z.array(z.object({ titulo: z.string(), texto: z.string() })),
  equipe: z.object({ professores: z.number(), estudantes: z.number(), financiamentosPorAno: z.number(), texto: z.string() }),
  prazosDias: z.object({ regional: z.number(), estadual: z.number(), nacional: z.number(), internacional: z.number() }),
  prazoBoletoDias: z.number(),
  matriz: z.array(z.object({ id: z.string(), texto: z.string(), pontos: z.number() })),
  faixas: z.array(z.object({ faixa: z.string(), minimo: z.number(), maximo: z.number() })),
  desempate: z.array(z.string()),
  documentosEscola: z.array(z.string()),
  documentosParticipante: z.array(z.string()),
  fluxo: z.array(z.object({ quem: z.string(), oQue: z.string() })),
  naoFinancia: z.array(z.string()),
  posEvento: z.array(z.string()),
  regrasConta: z.array(z.string()),
  fonte: z.string(),
});

export type Oportunidade = z.infer<typeof oportunidadeSchema>;
export type Meta = z.infer<typeof metaSchema>;
export type CearaCientifico = z.infer<typeof cearaCientificoSchema>;
export type Joc = z.infer<typeof jocSchema>;
