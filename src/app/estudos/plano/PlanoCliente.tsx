"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { useFavoritos } from "@/lib/favoritos";
import { DIAS, gerarPlano } from "@/lib/estudos-plano";
import { hojeLocal } from "@/lib/estudos-revisao";

export type OlimpiadaPlano = {
  id: string;
  slug: string;
  nome: string;
  sigla: string | null;
  fim: string | null;
  provas: { fase: string; data: string }[];
};

const CHAVE = "radar-estudos-plano";
const MAX_OLIMPIADAS = 6;
const MAX_RESULTADOS = 8;
const INICIAL = { horas: 5, dias: [0, 2, 4], bloco: 25, ids: [] as string[] };

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const dataBr = (d: string) => d.split("-").reverse().join("/");

/** O que vem do armazenamento pode estar velho: só aceita valores válidos. */
function lerSalvo() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    if (!bruto || typeof bruto !== "object") return null;
    return {
      horas: Number.isFinite(bruto.horas) ? Math.min(30, Math.max(1, Math.round(bruto.horas))) : INICIAL.horas,
      dias: Array.isArray(bruto.dias) ? bruto.dias.filter((d: unknown) => Number.isInteger(d) && (d as number) >= 0 && (d as number) < 7) : INICIAL.dias,
      bloco: bruto.bloco === 50 ? 50 : 25,
      ids: Array.isArray(bruto.ids) ? bruto.ids.filter((v: unknown) => typeof v === "string") : [],
    };
  } catch {
    return null;
  }
}

export function PlanoCliente({ olimpiadas, sugestoes }: { olimpiadas: OlimpiadaPlano[]; sugestoes: string[] }) {
  const [dados, setDados] = useState(INICIAL);
  const [pronto, setPronto] = useState(false);
  const [hoje, setHoje] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const { lista: salvos } = useFavoritos();
  const { horas, dias, bloco, ids } = dados;

  useEffect(() => {
    const salvo = lerSalvo();
    if (salvo) setDados({ ...salvo, ids: salvo.ids.filter((id: string) => olimpiadas.some((o) => o.id === id)) });
    setHoje(hojeLocal());
    setPronto(true);
  }, [olimpiadas]);

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch {
      /* segue só nesta visita */
    }
  }, [dados, pronto]);

  const porId = useMemo(() => new Map(olimpiadas.map((o) => [o.id, o])), [olimpiadas]);
  const nomeDe = (id: string) => {
    const o = porId.get(id);
    return o ? (o.sigla ?? o.nome) : id;
  };

  const alternarDia = (d: number) => setDados((a) => ({ ...a, dias: a.dias.includes(d) ? a.dias.filter((x) => x !== d) : [...a.dias, d] }));
  const alternarId = (id: string) =>
    setDados((a) => {
      if (a.ids.includes(id)) return { ...a, ids: a.ids.filter((x) => x !== id) };
      return a.ids.length >= MAX_OLIMPIADAS ? a : { ...a, ids: [...a.ids, id] };
    });

  const termo = semAcento(busca.trim());
  const opcoes = termo
    ? olimpiadas.filter((o) => semAcento(`${o.nome} ${o.sigla ?? ""}`).includes(termo)).slice(0, MAX_RESULTADOS)
    : sugestoes.map((id) => porId.get(id)).filter((o): o is OlimpiadaPlano => !!o);

  const salvosNoPlano = salvos.filter((id) => porId.has(id));
  const usarSalvos = () => setDados((a) => ({ ...a, ids: [...new Set([...a.ids, ...salvosNoPlano])].slice(0, MAX_OLIMPIADAS) }));

  const plano = useMemo(() => gerarPlano({ minutosSemana: horas * 60, dias, minutosBloco: bloco, ids }), [horas, dias, bloco, ids]);
  const minutosNoDiaMaximo = Math.max(0, ...plano.semana.map((d) => d.blocos.length * bloco));

  const faltando = !dias.length ? "Escolha pelo menos um dia." : !ids.length ? "Escolha pelo menos uma olimpíada." : !plano.totalBlocos ? "Esse tempo não fecha um bloco. Aumente as horas ou use blocos menores." : null;

  const datas = hoje
    ? ids
        .map((id) => {
          const o = porId.get(id);
          if (!o) return null;
          const prova = o.provas.filter((p) => p.data >= hoje).sort((a, b) => a.data.localeCompare(b.data))[0];
          const inscricao = o.fim && o.fim >= hoje ? o.fim : null;
          return { id, slug: o.slug, nome: o.sigla ?? o.nome, prova, inscricao };
        })
        .filter((d): d is NonNullable<typeof d> => !!d)
    : [];

  return (
    <>
      <section aria-labelledby="tempo" className="est-vidro est-bloco">
        <h2 id="tempo" className="est-secao">Seu tempo</h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="horas" className="est-rotulo">Horas por semana</label>
          <div className="flex items-center gap-4">
            <input id="horas" type="range" min={1} max={30} step={1} value={horas} onChange={(e) => setDados((a) => ({ ...a, horas: Number(e.target.value) }))} className="est-faixa" />
            <output htmlFor="horas" className="est-numero">{horas} h</output>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="est-rotulo mb-2">Dias livres</legend>
          <div className="flex flex-wrap gap-2">
            {DIAS.map((d, i) => (
              <button key={d} type="button" className="est-chip" aria-pressed={dias.includes(i)} onClick={() => alternarDia(i)}>
                {d}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="est-rotulo mb-2">Tamanho do bloco</legend>
          <div className="flex flex-wrap gap-2">
            {[25, 50].map((b) => (
              <button key={b} type="button" className="est-chip" aria-pressed={bloco === b} onClick={() => setDados((a) => ({ ...a, bloco: b }))}>
                {b} minutos
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="olimpiadas" className="est-vidro est-bloco">
        <h2 id="olimpiadas" className="est-secao">Suas olimpíadas</h2>

        {ids.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Olimpíadas escolhidas">
            {ids.map((id) => (
              <li key={id}>
                <button type="button" className="est-chip" aria-pressed="true" onClick={() => alternarId(id)} aria-label={`Tirar ${nomeDe(id)} do plano`}>
                  {nomeDe(id)} ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="busca-olimpiada" className="est-rotulo">Buscar pelo nome ou sigla</label>
          <input id="busca-olimpiada" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Exemplo: OBMEP" className="est-campo" autoComplete="off" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="est-meta" aria-live="polite">
            {termo ? (opcoes.length ? `${opcoes.length} encontrada${opcoes.length === 1 ? "" : "s"}` : "Nada com esse nome. Tente outra palavra.") : "Sugestões, uma por área"}
          </p>
          <ul className="flex flex-col">
            {opcoes.map((o) => {
              const marcada = ids.includes(o.id);
              const cheia = !marcada && ids.length >= MAX_OLIMPIADAS;
              return (
                <li key={o.id}>
                  <button type="button" className="est-opcao" aria-pressed={marcada} disabled={cheia} onClick={() => alternarId(o.id)}>
                    <span className="est-marca" aria-hidden="true">{marcada ? "✓" : "+"}</span>
                    <span>{o.nome}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {ids.length >= MAX_OLIMPIADAS && <p className="est-meta">Até {MAX_OLIMPIADAS} por vez. Foco também é escolher.</p>}
        </div>

        {salvosNoPlano.length > 0 && (
          <button type="button" className="est-botao est-botao-sec self-start" onClick={usarSalvos}>
            Usar as salvas em Minha lista
          </button>
        )}
      </section>

      <section aria-labelledby="resultado" className="flex flex-col gap-6">
        <h2 id="resultado" className="est-secao">Sua semana</h2>
        <p className="est-frase" aria-live="polite">
          {faltando ?? `${plano.totalBlocos} blocos de ${bloco} minutos em ${plano.semana.length} ${plano.semana.length === 1 ? "dia" : "dias"}.`}
        </p>

        {!faltando && (
          <>
            {plano.sobraMinutos > 0 && <p className="est-meta">Sobram {plano.sobraMinutos} minutos: use para descansar ou revisar.</p>}
            {minutosNoDiaMaximo > 240 && (
              <p className="est-vidro est-nota est-aviso">Tem dia passando de 4 horas. Se der, espalhe por mais dias e não abra mão do sono.</p>
            )}
            <ol className="est-semana">
              {plano.semana.map((d) => (
                <li key={d.dia} className="est-vidro est-dia">
                  <h3 className="est-cartao-titulo">{DIAS[d.dia]}</h3>
                  <ul className="flex flex-col gap-3">
                    {d.blocos.map((b, i) => (
                      <li key={`${b.id}-${i}`} className="flex flex-col gap-0.5">
                        <span className="font-bold">{nomeDe(b.id)}</span>
                        <Link href={`/estudos/como-estudar/#${b.atividade.tecnica}`} className="est-link est-texto">
                          {b.atividade.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap gap-3">
              <Link href="/estudos/foco/" className="est-botao">
                Começar um bloco
                <Seta tamanho={16} />
              </Link>
              <Link href="/estudos/#areas" className="est-botao est-botao-sec">
                Achar provas antigas
              </Link>
            </div>
          </>
        )}

        {datas.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="est-rotulo">Próximas datas registradas</h3>
            <ul className="est-vidro est-materiais">
              {datas.map((d) => (
                <li key={d.id}>
                  <Link href={`/oportunidade/${d.slug}/`} className="est-material">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-bold">{d.nome}</span>
                      <span className="est-meta">
                        {d.prova ? `${d.prova.fase}: ${dataBr(d.prova.data)}` : d.inscricao ? `Inscrições até ${dataBr(d.inscricao)}` : "Sem data futura confirmada. Veja a ficha."}
                      </span>
                    </span>
                    <Seta />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
