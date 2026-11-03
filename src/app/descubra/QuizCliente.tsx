"use client";

import { m } from "framer-motion";
import { useMemo, useState } from "react";
import { CartaoOportunidade } from "@/components/CartaoOportunidade";
import { Icone } from "@/components/Icone";
import { urlAbsoluta } from "@/lib/base";
import { linkWhatsApp } from "@/lib/ics";
import { ROTULO_SERIE } from "@/lib/rotulos";
import { calcularStatus, estaAberto, useHoje } from "@/lib/status";
import type { Resumo } from "@/lib/tipos";

type Respostas = { serie: string; areas: string[]; formato: string; modalidade: string; participacao: string };
const INICIO: Respostas = { serie: "", areas: [], formato: "", modalidade: "", participacao: "" };

const AREAS = [
  { valor: "Matemática", rotulo: "Números e desafios lógicos" },
  { valor: "Ciências da Natureza", rotulo: "Física, química, biologia, astronomia" },
  { valor: "Ciências Humanas e Sociais Aplicadas", rotulo: "História, geografia, sociedade" },
  { valor: "Linguagens e Códigos", rotulo: "Leitura, escrita, línguas" },
  { valor: "Tecnologia e Computação", rotulo: "Programação, robótica, IA" },
  { valor: "Meio Ambiente", rotulo: "Natureza, oceano, clima" },
  { valor: "Educação Financeira e Gestão", rotulo: "Dinheiro e empreendedorismo" },
];

const TOTAL = 5;

function pontuar(i: Resumo, r: Respostas, hoje: string, exigeEtapa: Set<string>) {
  let pontos = 0;
  const motivos: string[] = [];
  const areas = i.areas.filter((a) => r.areas.includes(a));
  if (areas.length) {
    pontos += 4;
    motivos.push(areas[0]);
  } else if (i.areas.includes("Multidisciplinar")) {
    pontos += 1;
  }
  if (r.formato && r.formato === i.formato) {
    pontos += 2;
    motivos.push(i.formato === "prova" ? "tem prova" : "é por projeto");
  }
  if (r.participacao && i.participacao && (i.participacao === r.participacao || i.participacao === "individual-ou-grupo")) {
    pontos += 1.5;
    motivos.push(r.participacao === "grupo" ? "em equipe" : "individual");
  }
  if (r.modalidade && i.modalidade && (i.modalidade === r.modalidade || i.modalidade === "hibrida")) {
    pontos += 1;
    motivos.push(r.modalidade === "online" ? "on-line" : "presencial");
  }
  if (i.custo === "gratuito") {
    pontos += 1;
    motivos.push("gratuita");
  }
  if (estaAberto(calcularStatus(i, hoje))) pontos += 2;
  if (i.nivel === "estadual") pontos += 0.5;
  if (i.vagaOlimpica) pontos += 0.25;
  if (exigeEtapa.has(i.id)) pontos -= 3;
  return { pontos, motivos, temArea: areas.length > 0 };
}

function Opcao({ ativo, onClick, titulo, texto }: { ativo: boolean; onClick: () => void; titulo: string; texto?: string }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`flex min-h-14 w-full flex-col justify-center rounded-2xl border-2 px-4 py-2.5 text-left ${ativo ? "border-laranja bg-laranja text-[#24170e]" : "border-linha bg-superficie"}`}
    >
      <span className="font-bold">{titulo}</span>
      {texto && <span className={`text-sm ${ativo ? "" : "text-tinta-2"}`}>{texto}</span>}
    </button>
  );
}

export function QuizCliente({ itens }: { itens: Resumo[] }) {
  const hoje = useHoje();
  const [passo, setPasso] = useState(0);
  const [r, setR] = useState(INICIO);

  const resultado = useMemo(() => {
    if (passo < TOTAL) return [];
    // Quem depende de classificação ou convite em outra olimpíada não é o melhor primeiro passo.
    const exigeEtapa = new Set(itens.flatMap((i) => i.credenciaPara));
    return itens
      .filter((i) => i.temFicha && (i.series.length === 0 || i.series.includes(r.serie as Resumo["series"][number])))
      .map((i) => ({ item: i, ...pontuar(i, r, hoje, exigeEtapa) }))
      .filter((x) => x.temArea || r.areas.length === 0)
      .sort((a, b) => b.pontos - a.pontos || a.item.nome.localeCompare(b.item.nome, "pt-BR"))
      .slice(0, 8);
  }, [passo, itens, r, hoje]);

  const avancar = () => setPasso((p) => p + 1);
  const escolher = (campo: keyof Respostas, valor: string) => {
    setR((a) => ({ ...a, [campo]: valor }));
    avancar();
  };

  if (passo >= TOTAL) {
    const texto = `Fiz o quiz do Radar Olímpico e minhas olimpíadas são: ${resultado.slice(0, 3).map((x) => x.item.sigla ?? x.item.nome).join(", ")}. Faça o seu: ${urlAbsoluta("/descubra/")}`;
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-black">{resultado.length ? "Combinam com você" : "Não achamos uma combinação exata"}</h2>
          <p className="text-sm text-tinta-2">
            {resultado.length ? "Salve as que gostar e confira datas no site oficial." : "Tente marcar mais áreas ou dar uma olhada no Radar completo."}
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {resultado.map((x, i) => (
            <m.li key={x.item.id} className="flex flex-col gap-1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.25 }}>
              <CartaoOportunidade item={x.item} />
              {x.motivos.length > 0 && <p className="px-2 text-xs text-tinta-2">Por quê: {x.motivos.join(", ")}.</p>}
            </m.li>
          ))}
        </ul>
        <div className="grid gap-2 sm:flex">
          <a href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className="btn btn-secundario">
            <Icone nome="whatsapp" />
            Chamar a turma
          </a>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => {
              setR(INICIO);
              setPasso(0);
            }}
          >
            Refazer o quiz
          </button>
        </div>
        <p className="text-xs text-tinta-2">A resposta sobre on-line ou presencial só conta nos eventos que informam a modalidade. A maioria ainda não informa.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex justify-between text-sm font-semibold">
          <span>
            Pergunta {passo + 1} de {TOTAL}
          </span>
          {passo > 0 && (
            <button type="button" onClick={() => setPasso((p) => p - 1)} className="min-h-11 px-2 font-bold text-laranja-forte underline">
              Voltar
            </button>
          )}
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-superficie-2" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={passo + 1} aria-label="Progresso do quiz">
          <m.div className="h-full rounded-full bg-laranja" initial={false} animate={{ width: `${((passo + 1) / TOTAL) * 100}%` }} transition={{ duration: 0.25 }} />
        </div>
      </div>

      <m.div key={passo} initial={{ x: 18 }} animate={{ x: 0 }} transition={{ duration: 0.16 }} className="flex flex-col gap-3">
          {passo === 0 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-display text-2xl font-black">Em que série você está?</legend>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROTULO_SERIE).map(([valor, rotulo]) => (
                  <Opcao key={valor} ativo={r.serie === valor} titulo={rotulo} onClick={() => escolher("serie", valor)} />
                ))}
              </div>
            </fieldset>
          )}
          {passo === 1 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-display text-2xl font-black">O que você curte?</legend>
              <p className="-mt-2 text-sm text-tinta-2">Pode marcar mais de uma.</p>
              <div className="flex flex-col gap-2">
                {AREAS.map((a) => (
                  <Opcao
                    key={a.valor}
                    ativo={r.areas.includes(a.valor)}
                    titulo={a.valor}
                    texto={a.rotulo}
                    onClick={() => setR((x) => ({ ...x, areas: x.areas.includes(a.valor) ? x.areas.filter((v) => v !== a.valor) : [...x.areas, a.valor] }))}
                  />
                ))}
              </div>
              <button type="button" className="btn btn-primario" disabled={!r.areas.length} onClick={avancar}>
                Continuar
              </button>
            </fieldset>
          )}
          {passo === 2 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-display text-2xl font-black">Prova ou projeto?</legend>
              <Opcao ativo={r.formato === "prova"} titulo="Prova" texto="Gosto de resolver questões e desafios" onClick={() => escolher("formato", "prova")} />
              <Opcao ativo={r.formato === "projeto"} titulo="Projeto" texto="Gosto de pesquisar e construir algo" onClick={() => escolher("formato", "projeto")} />
              <Opcao ativo={false} titulo="Tanto faz" onClick={() => escolher("formato", "")} />
            </fieldset>
          )}
          {passo === 3 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-display text-2xl font-black">On-line ou presencial?</legend>
              <Opcao ativo={r.modalidade === "online"} titulo="On-line" texto="Faço do celular ou da escola" onClick={() => escolher("modalidade", "online")} />
              <Opcao ativo={r.modalidade === "presencial"} titulo="Presencial" texto="Quero ir até o evento" onClick={() => escolher("modalidade", "presencial")} />
              <Opcao ativo={false} titulo="Tanto faz" onClick={() => escolher("modalidade", "")} />
            </fieldset>
          )}
          {passo === 4 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-display text-2xl font-black">Sozinho ou em equipe?</legend>
              <Opcao ativo={r.participacao === "individual"} titulo="Sozinho" onClick={() => escolher("participacao", "individual")} />
              <Opcao ativo={r.participacao === "grupo"} titulo="Em equipe" onClick={() => escolher("participacao", "grupo")} />
              <Opcao ativo={false} titulo="Tanto faz" onClick={() => escolher("participacao", "")} />
            </fieldset>
          )}
      </m.div>
    </div>
  );
}
