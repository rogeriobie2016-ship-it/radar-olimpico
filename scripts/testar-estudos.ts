// Confere as regras do plano semanal e da repetição espaçada, e o conteúdo da Biblioteca de Estudos.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { atividadesDaSemana, gerarPlano } from "../src/lib/estudos-plano";
import { estaPendente, INTERVALOS, limparEstados, proximaRevisao, responder, somarDias } from "../src/lib/estudos-revisao";

const erros: string[] = [];
const conferir = (ok: boolean, msg: string) => void (ok || erros.push(msg));

// Plano: varre combinações e confere as garantias que a tela promete.
const IDS = ["a", "b", "c", "d", "e", "f"];
let casos = 0;
for (let horas = 0; horas <= 30; horas++) {
  for (const minutosBloco of [25, 50]) {
    for (let d = 1; d <= 7; d++) {
      for (let q = 1; q <= IDS.length; q++) {
        casos++;
        const dias = Array.from({ length: d }, (_, i) => i);
        const ids = IDS.slice(0, q);
        const p = gerarPlano({ minutosSemana: horas * 60, dias, minutosBloco, ids });
        const blocos = p.semana.flatMap((x) => x.blocos);
        const nome = `${horas}h, bloco ${minutosBloco}, ${d} dias, ${q} olimpíadas`;
        conferir(blocos.length === p.totalBlocos, `${nome}: número de blocos`);
        conferir(p.totalBlocos * minutosBloco + p.sobraMinutos === horas * 60, `${nome}: minutos não batem`);
        conferir(p.sobraMinutos < minutosBloco, `${nome}: sobrou bloco inteiro`);
        const tamanhos = p.semana.map((x) => x.blocos.length);
        if (tamanhos.length) conferir(Math.max(...tamanhos) - Math.min(...tamanhos) <= 1, `${nome}: dias desiguais`);
        for (const id of ids) {
          const deste = blocos.filter((b) => b.id === id);
          conferir(deste.length === (p.blocosPorOlimpiada[id] ?? 0), `${nome}: contagem de ${id}`);
          if (deste.length) conferir(deste[deste.length - 1].atividade.tecnica === "prova-antiga", `${nome}: ${id} não fecha com prova antiga`);
        }
        // Intercalação: com mais de uma olimpíada e blocos para todas, nada se repete em seguida.
        if (q > 1 && p.totalBlocos >= q) {
          for (const dia of p.semana) dia.blocos.forEach((b, i) => i && conferir(b.id !== dia.blocos[i - 1].id, `${nome}: ${b.id} repetida em seguida`));
        }
      }
    }
  }
}
conferir(atividadesDaSemana(0).length === 0, "zero blocos");
conferir(gerarPlano({ minutosSemana: 600, dias: [], minutosBloco: 25, ids: ["a"] }).semana.length === 0, "sem dias");
conferir(gerarPlano({ minutosSemana: 600, dias: [1], minutosBloco: 25, ids: [] }).semana.length === 0, "sem olimpíadas");
conferir(gerarPlano({ minutosSemana: 10, dias: [1], minutosBloco: 25, ids: ["a"] }).semana.length === 0, "tempo menor que um bloco");

// Repetição espaçada
const hoje = "2026-11-04";
conferir(somarDias("2026-12-31", 1) === "2027-01-01", "virada de ano");
conferir(somarDias("2028-02-28", 1) === "2028-02-29", "ano bissexto");
let e = responder(undefined, true, hoje);
conferir(e.caixa === 0 && e.proxima === somarDias(hoje, INTERVALOS[0]), "primeiro acerto");
e = responder(e, true, hoje);
conferir(e.caixa === 1 && e.proxima === somarDias(hoje, INTERVALOS[1]), "segundo acerto sobe de caixa");
for (let i = 0; i < 10; i++) e = responder(e, true, hoje);
conferir(e.caixa === INTERVALOS.length - 1 && e.proxima === somarDias(hoje, 16), "caixa máxima");
e = responder(e, false, hoje);
conferir(e.caixa === 0 && e.proxima === somarDias(hoje, 1), "erro volta para a primeira caixa");
conferir(estaPendente(undefined, hoje), "carta nova está pendente");
conferir(estaPendente({ caixa: 1, proxima: hoje }, hoje), "vence hoje");
conferir(!estaPendente({ caixa: 1, proxima: "2026-11-05" }, hoje), "vence amanhã");
conferir(proximaRevisao([{ caixa: 1, proxima: "2026-11-09" }, { caixa: 0, proxima: "2026-11-05" }], hoje) === "2026-11-05", "próxima revisão");
conferir(Object.keys(limparEstados({ a: { caixa: 9, proxima: hoje }, b: { caixa: 1, proxima: "ontem" }, c: { caixa: 1, proxima: hoje }, d: null })).join() === "c", "estado corrompido é descartado");
conferir(Object.keys(limparEstados("lixo")).length === 0, "armazenamento inválido");

// Conteúdo: toda afirmação com fonte e toda área com material oficial.
const ler = (a: string) => JSON.parse(readFileSync(join(process.cwd(), "data", a), "utf8"));
const t = ler("estudos/tecnicas.json");
const ids = new Set(t.fontes.map((f: { id: string }) => f.id));
const citadas = new Set<string>();
for (const tec of t.tecnicas) for (const p of tec.pesquisa) for (const f of p.fontes) { citadas.add(f); conferir(ids.has(f), `${tec.id}: fonte ${f}`); }
for (const f of t.pausas.fontes) citadas.add(f);
for (const f of ids) conferir(citadas.has(f as string), `fonte ${f} sem uso`);
for (const a of ler("estudos/areas.json").areas) conferir(a.materiais.some((m: { oficial: boolean }) => m.oficial), `${a.slug}: sem material oficial`);
for (const c of ler("estudos/cultura.json").itens) if (c.imagem) conferir(!!c.imagem.fonte && !!c.imagem.licenca, `${c.id}: imagem sem fonte`);

if (erros.length) {
  console.error(erros.slice(0, 40).join("\n"));
  console.error(`\n${erros.length} problema(s) na Biblioteca de Estudos.`);
  process.exit(1);
}
console.log(`✓ Biblioteca de Estudos: ${casos} planos e as regras de revisão conferidos.`);
