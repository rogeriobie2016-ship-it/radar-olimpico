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
  instagram: z.url().nullable().optional(),
  idiomas: z.array(z.string()).nullable().optional(),
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

export const novidadeSchema = z.object({
  id: z.string().min(1),
  oportunidadeId: z.string().nullable(),
  tipo: z.enum(["prazo", "atualizacao", "nova"]),
  titulo: z.string().min(3),
  trecho: z.string().nullable(),
  url: z.url().nullable(),
  prazoFim: data.nullable(),
  detectadoEm: data,
  origem: z.enum(["monitor", "pesquisa", "copes"]),
  verificado: z.boolean(),
});

export const novidadesSchema = z.object({ verificadoEm: data.nullable(), itens: z.array(novidadeSchema) });

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
  areas: z.array(z.string()),
  regulamento: z.url(),
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
export type Novidade = z.infer<typeof novidadeSchema>;
export type CearaCientifico = z.infer<typeof cearaCientificoSchema>;
export type Joc = z.infer<typeof jocSchema>;

// Biblioteca de Estudos: conteúdo em data/estudos/, editável sem programar.
const conferido = data;
/** Link externo ou caminho interno do site, como /oportunidade/obmep/. */
const endereco = z.string().regex(/^(https:\/\/|http:\/\/|\/)/, "use um link completo (https://) ou um caminho do site (/estudos/)");
const textoCurto = z.string().min(2);
const idSimples = z.string().regex(/^[a-z0-9-]+$/, "use só letras minúsculas, números e hífen");

const fonteLink = z.object({ rotulo: textoCurto, url: endereco, conferidoEm: conferido });

export const tecnicasSchema = z
  .object({
    comentario: z.string(),
    introducao: textoCurto,
    tecnicas: z.array(
      z.object({
        id: idSimples,
        titulo: textoCurto,
        gancho: textoCurto,
        passos: z.array(textoCurto).min(1),
        pesquisa: z.array(z.object({ texto: textoCurto, fontes: z.array(z.string()).min(1, "toda afirmação precisa de fonte") })).min(1),
        cuidado: z.string().nullable(),
        ferramenta: z.object({ rotulo: textoCurto, href: endereco }).nullable(),
      }),
    ),
    pausas: z.object({ texto: textoCurto, fontes: z.array(z.string()).min(1, "toda afirmação precisa de fonte") }),
    fontes: z.array(z.object({ id: z.string(), citacao: textoCurto, referencia: textoCurto, url: z.url(), conferidoEm: conferido })),
  })
  .superRefine((d, ctx) => {
    const ids = new Set(d.fontes.map((f) => f.id));
    d.tecnicas.forEach((t, i) =>
      t.pesquisa.forEach((p, j) =>
        p.fontes.forEach((f) => {
          if (!ids.has(f)) ctx.addIssue({ code: "custom", path: ["tecnicas", i, "pesquisa", j, "fontes"], message: `fonte inexistente: ${f}` });
        }),
      ),
    );
    d.pausas.fontes.forEach((f) => {
      if (!ids.has(f)) ctx.addIssue({ code: "custom", path: ["pausas", "fontes"], message: `fonte inexistente: ${f}` });
    });
  });

export const areasEstudoSchema = z.object({
  comentario: z.string(),
  areas: z.array(
    z.object({
      slug: idSimples,
      titulo: textoCurto,
      resumo: textoCurto,
      comecar: z.array(textoCurto).min(1),
      aviso: z.string().nullable(),
      oQueCai: z.array(z.object({ texto: textoCurto, fonte: fonteLink })).min(1),
      materiais: z
        .array(
          z.object({
            grupo: z.string().nullable(),
            titulo: textoCurto,
            descricao: textoCurto,
            tipo: z.enum(["Provas", "Banco de questões", "Curso", "Guia", "Prática"]),
            url: z.url(),
            oficial: z.boolean(),
            nota: z.string().nullable(),
            conferidoEm: conferido,
          }),
        )
        .min(1),
      oportunidades: z.array(z.string()),
      jogos: z.array(z.string()),
    }),
  ),
});

export const TIPOS_CULTURA = ["filme", "documentario", "livro", "podcast", "canal", "lugar"] as const;

export const culturaSchema = z.object({
  comentario: z.string(),
  itens: z.array(
    z.object({
      id: idSimples,
      tipo: z.enum(TIPOS_CULTURA),
      titulo: textoCurto,
      autoria: textoCurto,
      ano: z.string().nullable(),
      descricao: textoCurto,
      classificacao: z.object({ texto: textoCurto, url: z.url() }).nullable(),
      gratuito: z.boolean().nullable(),
      dominioPublico: z.boolean(),
      ceara: z.boolean(),
      nota: z.string().nullable(),
      link: z.object({ rotulo: textoCurto, url: z.url() }),
      imagem: z
        .object({
          src: endereco,
          alt: textoCurto,
          fonte: z.url(),
          licenca: textoCurto,
          largura: z.number().positive(),
          altura: z.number().positive(),
        })
        .nullable(),
      conferidoEm: conferido,
    }),
  ),
});

export const baralhosSchema = z.object({
  comentario: z.string(),
  baralhos: z.array(
    z
      .object({
        id: idSimples,
        titulo: textoCurto,
        resumo: textoCurto,
        fonte: fonteLink,
        cartas: z.array(z.object({ frente: z.string().min(1), verso: z.string().min(1) })).min(1),
      })
      .superRefine((b, ctx) => {
        const vistas = new Set<string>();
        b.cartas.forEach((c, i) => {
          if (vistas.has(c.frente)) ctx.addIssue({ code: "custom", path: ["cartas", i, "frente"], message: `frente repetida: ${c.frente}` });
          vistas.add(c.frente);
        });
      }),
  ),
});

export type Tecnicas = z.infer<typeof tecnicasSchema>;
export const videosSchema = z.object({
  comentario: z.string(),
  videos: z.array(
    z.object({
      id: z.string().min(2),
      campo: idSimples,
      fonte: z.enum(["youtube", "commons"]),
      titulo: textoCurto,
      canal: textoCurto,
      duracao: z.string().nullable(),
      idioma: z.enum(["pt", "en", "de", "mudo"]),
      pagina: z.url().optional(),
      conferidoEm: conferido,
    }),
  ),
});

export type AreasEstudo = z.infer<typeof areasEstudoSchema>;
export type AreaEstudo = AreasEstudo["areas"][number];
export type Cultura = z.infer<typeof culturaSchema>;
export type ItemCultura = Cultura["itens"][number];
export type Baralhos = z.infer<typeof baralhosSchema>;

/** Ligações entre arquivos que o Zod sozinho não enxerga: fichas e jogos citados precisam existir. */
export function problemasEstudos(areas: AreasEstudo, idsOportunidades: Set<string>, slugsJogos: Set<string>): string[] {
  const problemas: string[] = [];
  const slugs = new Set<string>();
  for (const a of areas.areas) {
    if (slugs.has(a.slug)) problemas.push(`slug repetido em areas.json: ${a.slug}`);
    slugs.add(a.slug);
    for (const id of a.oportunidades) if (!idsOportunidades.has(id)) problemas.push(`área "${a.titulo}": a ficha "${id}" não existe em oportunidades.json`);
    for (const j of a.jogos) if (!slugsJogos.has(j)) problemas.push(`área "${a.titulo}": o jogo "${j}" não existe em src/lib/jogos.ts`);
  }
  return problemas;
}
