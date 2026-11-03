// Teste da Escada Olímpica: percorre milhares de combinações de respostas e verifica as regras que não podem falhar.
// Rodar: npm run testar:escada
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { recomendar, REGRAS, type Respostas } from "../src/lib/escada";
import type { Resumo } from "../src/lib/tipos";

type Bruto = {
  id: string; slug: string; nome: string; sigla: string | null; tipo: Resumo["tipo"]; areas: string[]; publico: { series: Resumo["series"] };
  modalidade: Resumo["modalidade"]; participacao: Resumo["participacao"]; nivel: Resumo["nivel"]; formato: Resumo["formato"];
  custo: { tipo: Resumo["custo"] }; inscricoes: { inicio: string | null; fim: string | null }; provas: Resumo["provas"];
  financiavelJOC: boolean; desbloqueia: { tipo: string }[]; linkOficial: string | null; credenciaPara: string[]; descricao: string | null;
};
const dados: Bruto[] = JSON.parse(readFileSync(join(process.cwd(), "data/oportunidades.json"), "utf-8"));
const itens: Resumo[] = dados.map((o) => ({
  id: o.id, slug: o.slug, nome: o.nome, sigla: o.sigla, tipo: o.tipo, areas: o.areas, series: o.publico.series, modalidade: o.modalidade,
  participacao: o.participacao, nivel: o.nivel, formato: o.formato, custo: o.custo.tipo, inicio: o.inscricoes.inicio, fim: o.inscricoes.fim, provas: o.provas,
  financiavelJOC: o.financiavelJOC, vagaOlimpica: o.desbloqueia.some((d) => d.tipo === "vaga-olimpica"), link: o.linkOficial, credenciaPara: o.credenciaPara, temFicha: !!o.descricao, novidade: null,
}));
const HOJE = "2026-11-03";
const AREAS = ["Matemática", "Ciências da Natureza", "Ciências Humanas e Sociais Aplicadas", "Linguagens e Códigos", "Tecnologia e Computação", "Meio Ambiente", "Educação Financeira e Gestão"];

let casos = 0;
const falhas: string[] = [];
const conferir = (ok: boolean, msg: string) => {
  if (!ok && falhas.length < 30) falhas.push(msg);
};
const ids = (r: ReturnType<typeof recomendar>) => Object.values(r.degraus).flat().map((x) => x.item);

for (const serie of ["EF-iniciais", "6EF", "9EF", "1EM", "2EM", "3EM", "TEC", "EJA"])
  for (const meninas of [true, false])
    for (const custo of ["gratuito", "qualquer"] as const)
      for (const experiencia of ["nunca", "escola", "premiado"] as const)
        for (const escola of ["regular", "integral", "profissional", "afirmativa", "ceja"] as const)
          for (const area of AREAS)
            for (const objetivo of ["aprender", "medalha", "universidade", "viajar"] as const) {
              const r: Respostas = { perfil: "estudante", series: [serie], escola, meninas, areas: [area], experiencia, formato: "ambos", participacao: "ambos", tempo: "medio", objetivo, custo, orientador: true, internet: true, viagem: true };
              const res = recomendar(itens, r, HOJE);
              casos++;
              const lista = ids(res);
              for (const i of lista) {
                const c = REGRAS[i.id] ?? {};
                const quem = `${i.id} para ${serie}/${escola}/${custo}`;
                conferir(!i.series.length || i.series.includes(serie as Resumo["series"][number]), `Série errada: ${quem}`);
                conferir(!c.meninas || meninas, `Exclusiva para meninas apareceu: ${quem}`);
                conferir(!c.convite, `Item só por convite apareceu: ${quem}`);
                conferir(!c.soIntegral || escola === "integral", `Exige integral: ${quem}`);
                conferir(custo !== "gratuito" || (i.custo !== "pago" && i.custo !== "valor"), `Item pago com filtro gratuito: ${quem}`);
                conferir(i.temFicha || !!i.fim, `Item sem informação: ${quem}`);
                conferir(i.areas.includes(area) || i.areas.includes("Multidisciplinar"), `Fora da área ${area}: ${quem}`);
              }
              conferir(new Set(lista.map((i) => i.id)).size === lista.length, `Item repetido em ${serie}/${area}`);
              // Quem nunca competiu não recebe, no primeiro degrau, nível de alto desempenho.
              if (experiencia === "nunca") for (const x of res.degraus[1]) conferir((REGRAS[x.item.id]?.dificuldade ?? 2) < 3 || res.degraus[1].length === 1, `Alto desempenho no degrau 1: ${x.item.id}`);
            }

// Casos de referência, conferidos à mão nas fichas do Catálogo 2026.
const base: Respostas = { perfil: "estudante", series: ["1EM"], escola: "regular", meninas: false, areas: ["Matemática"], experiencia: "nunca", formato: "prova", participacao: "individual", tempo: "medio", objetivo: "aprender", custo: "gratuito", orientador: false, internet: true, viagem: false };
const nomes = (r: Respostas) => ids(recomendar(itens, r, HOJE)).map((i) => i.id);
const mat = nomes(base);
conferir(mat.includes("mcem") || mat.includes("omifce"), `1ª série de Matemática deveria ver MCEM ou OMIFCE: ${mat}`);
conferir(!mat.includes("obm"), "OBM é só por convite");
conferir(!nomes({ ...base, series: ["9EF"] }).includes("mcem"), "MCEM é só para o Ensino Médio");
conferir(!nomes({ ...base, areas: ["Ciências da Natureza"] }).includes("quimeninas"), "Quimeninas é exclusiva para meninas");
conferir(nomes({ ...base, areas: ["Ciências da Natureza"], meninas: true }).length > 0, "Lista vazia para meninas em Ciências");
conferir(!nomes({ ...base, series: ["3EM"], areas: ["Ciências da Natureza"], meninas: true }).includes("quimeninas"), "Quimeninas vai só até a 2ª série");
conferir(!nomes({ ...base, series: ["1EM"], meninas: true, areas: ["Ciências da Natureza"] }).includes("futuras-cientistas"), "Futuras Cientistas é para a 2ª série");
conferir(nomes({ ...base, areas: ["Tecnologia e Computação"], objetivo: "universidade" }).some((i) => ["onia", "oci", "obi"].includes(i)), "Tecnologia + UFC deveria ver ONIA, OCI ou OBI");
conferir(!nomes({ ...base, areas: ["Ciências Humanas e Sociais Aplicadas"], custo: "gratuito" }).includes("obapo"), "OBAPO é paga");

console.log(`${casos.toLocaleString("pt-BR")} combinações testadas.`);
if (falhas.length) {
  console.error(`\n${falhas.length} problema(s):\n${falhas.join("\n")}`);
  process.exit(1);
}
console.log("Nenhuma regra violada.");
for (const [t, r] of Object.entries({ "1ª série, Matemática, nunca competiu": base, "3ª série, Tecnologia, premiada, UFC": { ...base, series: ["3EM"], areas: ["Tecnologia e Computação"], experiencia: "premiado", objetivo: "universidade", meninas: true } as Respostas, "2ª série, projeto, ambiente, viajar": { ...base, series: ["2EM"], areas: ["Meio Ambiente"], formato: "projeto", participacao: "grupo", objetivo: "viajar", orientador: true, viagem: true } as Respostas })) {
  const res = recomendar(itens, r, HOJE);
  console.log(`\n${t}`);
  for (const d of [1, 2, 3, 4] as const) console.log(`  degrau ${d}: ${res.degraus[d].map((x) => `${x.item.sigla ?? x.item.nome} ${x.compatibilidade}%`).join(", ")}`);
}
