"use client";

import { useEffect, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import {
  CASOS, ETAPAS, MINIMO_DE_CASOS, NOME_ETAPA,
  finalDe, lacunas, pontosDaEtapa, precisao,
  type Caso, type Documento, type Etapa, type Opcao,
} from "@/lib/estudo/crononauta";
import { tocar } from "@/lib/som";
import { CenarioTempo, Mostrador } from "./cenariosTempo";
import { Placar, type AoTerminar } from "./Molde";
import { BotaoSeguir, Explicacao, ListaOpcoes, menosMovimento, useTopoDaCena } from "./narrativa";

const ETAPAS_COM_PROGRESSO = ETAPAS.filter((e) => e !== "balanco");

/** O salto: o ano corre no mostrador até chegar ao destino. */
function Salto({ de, para, aoFim }: { de: number; para: number; aoFim: () => void }) {
  const [ano, setAno] = useState(de);
  useEffect(() => {
    if (menosMovimento()) {
      aoFim();
      return;
    }
    tocar("lancar");
    const inicio = performance.now();
    const duracao = 1300;
    let quadro = 0;
    let terminou = false;
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const curva = 1 - (1 - t) ** 3;
      setAno(Math.round(de + (para - de) * curva));
      if (t < 1) quadro = requestAnimationFrame(passo);
      else if (!terminou) {
        terminou = true;
        tocar("pouso");
        aoFim();
      }
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="cr-salto" role="status" aria-label={`Viajando para ${para}`}>
      <div className="cr-salto-palco">
        <div className="cr-salto-riscos" aria-hidden="true" />
        <Mostrador className="cr-salto-dial" />
        <span className="cr-salto-ano num" aria-hidden="true">{ano}</span>
      </div>
    </div>
  );
}

const TIPO_NOME: Record<Documento["tipo"], string> = { carta: "Carta", jornal: "Jornal", oficio: "Documento oficial", registro: "Registro", nota: "Nota de pesquisa", boletim: "Boletim", folheto: "Folheto", relato: "Relato" };

type Marca = "errado" | "certo" | "impossivel";

/** Um papel da mesa. Sempre mostra o carimbo de recriação. Em modo de marcar, cada trecho vira um botão. */
function Papel({ doc, marcar, marcas, selo }: { doc: Documento; marcar?: (trecho: string) => void; marcas?: Record<string, Marca>; selo?: string }) {
  return (
    <article className="cr-papel" data-tipo={doc.tipo}>
      <header className="cr-papel-topo">
        <span className="cr-papel-tipo">{TIPO_NOME[doc.tipo]}</span>
        <h3 className="cr-papel-titulo">{doc.titulo}</h3>
        <p className="cr-papel-origem">{doc.origem}</p>
      </header>
      <p className="cr-carimbo">{doc.rotulo}</p>
      {marcar ? (
        <ul className="cr-trechos">
          {doc.trechos.map((t, i) => {
            const m = marcas?.[t.id];
            return (
              <li key={t.id} className="cr-linha" style={{ animationDelay: `${i * 90}ms` }}>
                <button type="button" className="cr-trecho" data-marca={m} aria-disabled={!!m} onClick={() => marcar(t.id)}>
                  {t.t}
                  {m === "errado" && <small>Não é esse</small>}
                  {m === "certo" && <small>Marcado</small>}
                  {m === "impossivel" && <small className="cr-selo">{selo}</small>}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="cr-corpo">
          {doc.trechos.map((t, i) => (
            <p key={t.id} className="cr-linha" style={{ animationDelay: `${i * 110}ms` }}>{t.t}</p>
          ))}
        </div>
      )}
    </article>
  );
}

/** Mesa com todos os documentos do caso, um de cada vez. */
function Mesa({ documentos, inicial }: { documentos: Documento[]; inicial?: string }) {
  const [aberto, setAberto] = useState(inicial ?? documentos[0].id);
  const doc = documentos.find((d) => d.id === aberto)!;
  return (
    <div className="cr-mesa">
      <div className="cr-abas">
        {documentos.map((d) => (
          <button key={d.id} type="button" className="cr-aba" aria-pressed={d.id === aberto} onClick={() => {
            tocar("virar");
            setAberto(d.id);
          }}>
            {d.titulo}
          </button>
        ))}
      </div>
      <Papel key={doc.id} doc={doc} />
    </div>
  );
}

function MesaRecolhida({ documentos }: { documentos: Documento[] }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div>
      <button type="button" className="cr-consultar" aria-expanded={aberta} onClick={() => setAberta(!aberta)}>
        {aberta ? "Guardar os documentos" : "Consultar os documentos da mesa"}
      </button>
      {aberta && <Mesa documentos={documentos} />}
    </div>
  );
}

type PropsEtapa = { caso: Caso; aoErrar: () => void; aoConcluir: (errosNaEtapa: number) => void };

function EtapaFonte({ caso, aoErrar, aoConcluir }: PropsEtapa) {
  const { fonte } = caso;
  const [ultima, setUltima] = useState<Opcao | null>(null);
  const [erros, setErros] = useState(0);
  const certo = !!ultima?.certa;
  return (
    <>
      <p className="cr-missao"><span>Missão.</span> {caso.missao}</p>
      <Fala texto={caso.briefing} pose="lupa" tamanho={64} />
      <Mesa documentos={caso.documentos} inicial={fonte.doc} />
      <p className="nv-pergunta">{fonte.pergunta}</p>
      <ListaOpcoes chave={`${caso.id}-fonte`} opcoes={fonte.opcoes} resolvida={certo} aoResponder={(o) => {
        setUltima(o);
        if (o.certa) tocar("acerto");
        else {
          setErros((e) => e + 1);
          tocar("erro");
          aoErrar();
        }
      }} />
      {ultima && <Explicacao texto={ultima.porque} certo={certo} estudo={certo ? fonte.estudo : undefined} />}
      {certo && <BotaoSeguir aoTocar={() => aoConcluir(erros)}>Comparar versões</BotaoSeguir>}
    </>
  );
}

function EtapaComparar({ caso, aoErrar, aoConcluir }: PropsEtapa) {
  const { comparar } = caso;
  const docA = caso.documentos.find((d) => d.id === comparar.a)!;
  const docB = caso.documentos.find((d) => d.id === comparar.b)!;
  const [marcas, setMarcas] = useState<Record<string, Marca>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [erros, setErros] = useState(0);
  const okA = comparar.certosA.some((t) => marcas[t] === "certo");
  const okB = comparar.certosB.some((t) => marcas[t] === "certo");
  const pronto = okA && okB;

  const tocarEm = (lado: "a" | "b") => (t: string) => {
    if (marcas[t]) return;
    const certos = lado === "a" ? comparar.certosA : comparar.certosB;
    const jaOk = lado === "a" ? okA : okB;
    if (jaOk) return;
    if (certos.includes(t)) {
      setMarcas((m) => ({ ...m, [t]: "certo" }));
      setAviso(null);
      tocar("acerto");
    } else {
      setMarcas((m) => ({ ...m, [t]: "errado" }));
      setAviso((lado === "a" ? comparar.errosA : comparar.errosB)[t]);
      setErros((e) => e + 1);
      tocar("erro");
      aoErrar();
    }
  };

  return (
    <>
      <p className="nv-pergunta">{comparar.pergunta}</p>
      <div className="cr-par">
        <Papel doc={docA} marcar={tocarEm("a")} marcas={marcas} />
        <Papel doc={docB} marcar={tocarEm("b")} marcas={marcas} />
      </div>
      {pronto ? <Explicacao texto={comparar.explicacao} certo estudo={comparar.estudo} /> : aviso ? <Explicacao texto={aviso} certo={false} /> : <Fala texto={okA || okB ? "Boa. Agora marque o trecho do outro documento." : "Toque em um trecho de cada documento."} pose="aponta" tamanho={64} />}
      {pronto && <BotaoSeguir aoTocar={() => aoConcluir(erros)}>Caçar o anacronismo</BotaoSeguir>}
    </>
  );
}

function EtapaAnacronismo({ caso, aoErrar, aoConcluir }: PropsEtapa) {
  const { anacronismo: a } = caso;
  const [marcas, setMarcas] = useState<Record<string, Marca>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [erros, setErros] = useState(0);
  const pronto = marcas[a.impossivel] === "impossivel";
  return (
    <>
      <p className="nv-pergunta">Esta cópia caiu na mesa. Um dos trechos não pode ser da data escrita no papel. Qual?</p>
      <Papel doc={a.doc} selo={a.selo} marcas={marcas} marcar={(t) => {
        if (marcas[t] || pronto) return;
        if (t === a.impossivel) {
          setMarcas((m) => ({ ...m, [t]: "impossivel" }));
          setAviso(null);
          tocar("achou");
        } else {
          setMarcas((m) => ({ ...m, [t]: "errado" }));
          setAviso(a.compativeis[t]);
          setErros((e) => e + 1);
          tocar("erro");
          aoErrar();
        }
      }} />
      <MesaRecolhida documentos={caso.documentos} />
      {pronto ? <Explicacao texto={a.porque} certo estudo={a.estudo} /> : aviso ? <Explicacao texto={aviso} certo={false} /> : <Fala texto="Pergunte a cada trecho: isso já existia? Essa pessoa estava viva? Esse cargo já existia?" pose="pensa" tamanho={64} />}
      {pronto && <BotaoSeguir aoTocar={() => aoConcluir(erros)}>Montar a conclusão</BotaoSeguir>}
    </>
  );
}

function EtapaConclusao({ caso, aoErrar, aoConcluir }: PropsEtapa) {
  const { partes, estudo } = caso.conclusao;
  const vagas = lacunas(caso);
  const [preenchidas, setPreenchidas] = useState<string[]>([]);
  const [ultima, setUltima] = useState<Opcao | null>(null);
  const [erros, setErros] = useState(0);
  const pronto = preenchidas.length === vagas.length;
  const atual = vagas[preenchidas.length];

  let indice = 0;
  return (
    <>
      <p className="nv-pergunta">Escolha cada parte da conclusão. Cada peça precisa ter um documento por trás.</p>
      <p className="cr-conclusao" aria-live="polite">
        {partes.map((p, i) => {
          if (typeof p === "string") return <span key={i}>{p}</span>;
          const n = indice++;
          const texto = preenchidas[n];
          if (texto) return <strong key={i} className="cr-peca">{texto}</strong>;
          return <span key={i} className={n === preenchidas.length ? "cr-vaga cr-vaga-agora" : "cr-vaga"} aria-label="parte a preencher">{" "}</span>;
        })}
      </p>
      {!pronto && (
        <ListaOpcoes key={preenchidas.length} chave={`${caso.id}-conclusao-${preenchidas.length}`} opcoes={atual.opcoes} resolvida={false} aoResponder={(o) => {
          setUltima(o);
          if (o.certa) {
            setPreenchidas((l) => [...l, o.t]);
            tocar("acerto");
          } else {
            setErros((e) => e + 1);
            tocar("erro");
            aoErrar();
          }
        }} />
      )}
      <MesaRecolhida documentos={caso.documentos} />
      {pronto ? <Explicacao texto="Conclusão fechada, e cada parte aponta para uma fonte da mesa." certo estudo={estudo} /> : ultima ? <Explicacao texto={ultima.porque} certo={!!ultima.certa} /> : <Fala texto="Comece pela parte marcada no texto. Se precisar, consulte os documentos." pose="aponta" tamanho={64} />}
      {pronto && <BotaoSeguir aoTocar={() => aoConcluir(erros)}>Ver o que a pesquisa registra</BotaoSeguir>}
    </>
  );
}

function EtapaBalanco({ caso, ultimo, aoSeguir }: { caso: Caso; ultimo: boolean; aoSeguir: () => void }) {
  useEffect(() => tocar("achou"), []);
  return (
    <>
      <h2 className="cr-fato-titulo">O que a pesquisa registra</h2>
      <p className="cr-fato-aviso">Aqui acabou a recriação: estes são fatos conferidos em fontes públicas.</p>
      <ul className="cr-fatos">
        {caso.balanco.fatos.map((f, i) => <li key={f} className="cr-linha" style={{ animationDelay: `${i * 110}ms` }}>{f}</li>)}
      </ul>
      <p className="cr-fontes"><strong>Onde conferir:</strong> {caso.balanco.fontes}</p>
      <BotaoSeguir aoTocar={aoSeguir}>{ultimo ? "Entregar o relatório" : "Voltar ao cronógrafo"}</BotaoSeguir>
    </>
  );
}

function Cronografo({ feitos, acertos, erros, aoViajar, aoEntregar }: { feitos: string[]; acertos: number; erros: number; aoViajar: (c: Caso) => void; aoEntregar: () => void }) {
  const raiz = useTopoDaCena<HTMLDivElement>(`cronografo-${feitos.length}`);
  const fala = feitos.length === 0
    ? "Você é crononauta do Instituto de Tempo. Cada viagem traz papéis recriados para investigar. Escolha o destino que quiser."
    : feitos.length < CASOS.length
      ? `Casos fechados: ${feitos.length} de ${CASOS.length}, com ${precisao(acertos, erros)}% de precisão até aqui. Para onde agora?`
      : "Todas as viagens feitas. Hora de entregar o relatório à banca.";
  return (
    <div ref={raiz} tabIndex={-1} className="nv-cena cr-cronografo">
      <Mostrador className="cr-dial" />
      <h2 className="cr-titulo">Cronógrafo</h2>
      <Fala texto={fala} pose="foguete" tamanho={64} />
      <ol className="cr-destinos">
        {CASOS.map((c) => {
          const feito = feitos.includes(c.id);
          return (
            <li key={c.id}>
              <button type="button" className="cr-destino" data-feito={feito || undefined} disabled={feito} onClick={() => aoViajar(c)}>
                <span className="cr-destino-ano num">{c.ano}</span>
                <span className="cr-destino-texto">
                  <strong>{c.titulo}</strong>
                  <span>{c.lugar}</span>
                </span>
                {feito && <small>Investigado</small>}
              </button>
            </li>
          );
        })}
      </ol>
      {feitos.length === CASOS.length ? (
        <BotaoSeguir aoTocar={aoEntregar}>Entregar o relatório</BotaoSeguir>
      ) : feitos.length >= MINIMO_DE_CASOS ? (
        <button type="button" className="cr-consultar" onClick={aoEntregar}>Entregar o relatório agora, com {feitos.length} casos</button>
      ) : null}
    </div>
  );
}

function CenaFinal({ feitos, pontos, acertos, erros, aoFim }: { feitos: number; pontos: number; acertos: number; erros: number; aoFim: () => void }) {
  const final = finalDe(acertos, erros);
  const raiz = useTopoDaCena<HTMLDivElement>("final");
  useEffect(() => tocar("achou"), []);
  return (
    <div ref={raiz} tabIndex={-1} className="nv-cena cr-final" data-final={final.id}>
      <Mostrador className="cr-dial cr-dial-final" />
      <p className="nv-sobretitulo">Final</p>
      <h2 className="nv-titulo-final">{final.titulo}</h2>
      <p className="nv-paragrafo">{final.texto}</p>
      <dl className="cr-numeros">
        <div><dt>Casos</dt><dd className="num">{feitos} de {CASOS.length}</dd></div>
        <div><dt>Precisão</dt><dd className="num">{precisao(acertos, erros)}%</dd></div>
        <div><dt>Pontos</dt><dd className="num">{pontos.toLocaleString("pt-BR")}</dd></div>
      </dl>
      <p className="nv-estudo"><strong>O que fica.</strong> {final.licao}</p>
      <BotaoSeguir aoTocar={aoFim}>Ver resultado</BotaoSeguir>
    </div>
  );
}

export default function Crononauta({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const [tela, setTela] = useState<"cronografo" | "caso" | "final">("cronografo");
  const [caso, setCaso] = useState<Caso | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("fonte");
  const [salto, setSalto] = useState<{ de: number; para: number; caso: Caso | null } | null>(null);
  const [feitos, setFeitos] = useState<string[]>([]);
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const anoAtual = useRef(2026);
  const raizJogo = useRef<HTMLDivElement>(null);
  const raizCaso = useTopoDaCena<HTMLDivElement>(`${caso?.id}-${etapa}-${tela}`);

  const verSalto = () => {
    if (menosMovimento()) return;
    const el = raizJogo.current;
    if (el && el.getBoundingClientRect().top < 56) el.scrollIntoView({ block: "start", behavior: "auto" });
  };

  const viajar = (c: Caso) => {
    verSalto();
    setSalto({ de: anoAtual.current, para: c.ano, caso: c });
    anoAtual.current = c.ano;
  };

  const pousar = () => {
    if (!salto) return;
    if (salto.caso) {
      setCaso(salto.caso);
      setEtapa("fonte");
      setTela("caso");
    } else {
      setCaso(null);
      setTela("cronografo");
    }
    setSalto(null);
  };

  const concluirEtapa = (errosNaEtapa: number) => {
    setPontos((p) => p + pontosDaEtapa(errosNaEtapa));
    setAcertos((a) => a + 1);
    setEtapa(ETAPAS[ETAPAS.indexOf(etapa) + 1]);
  };

  const fecharCaso = () => {
    const novos = [...feitos, caso!.id];
    setFeitos(novos);
    if (novos.length === CASOS.length) {
      setCaso(null);
      setTela("final");
      return;
    }
    verSalto();
    setSalto({ de: anoAtual.current, para: 2026, caso: null });
    anoAtual.current = 2026;
  };

  const errar = () => setErros((e) => e + 1);
  const props = caso ? { caso, aoErrar: errar, aoConcluir: concluirEtapa } : null;

  return (
    <>
      <Placar esquerda={tela === "caso" && caso ? `${caso.periodo}, ${NOME_ETAPA[etapa]}` : tela === "final" ? "Relatório entregue" : "Base do Instituto de Tempo"} direita={pontos.toLocaleString("pt-BR")} />
      <div ref={raizJogo} className="nv nv-tempo">
        <div className="nv-fundo"><CenarioTempo nome={tela === "caso" && caso ? caso.cenario : "cronografo"} /></div>
        {tela === "cronografo" && <Cronografo feitos={feitos} acertos={acertos} erros={erros} aoViajar={viajar} aoEntregar={() => setTela("final")} />}
        {tela === "caso" && caso && props && (
          <div ref={raizCaso} tabIndex={-1} className="nv-cena cr-caso">
            <div className="nv-vista cr-vista">
              <p className="cr-lugar"><span className="num">{caso.periodo}</span><br />{caso.lugar}</p>
            </div>
            <h2 className="cr-titulo-caso">{caso.titulo}</h2>
            <ol className="cr-progresso" aria-label="Etapas da investigação">
              {ETAPAS_COM_PROGRESSO.map((e) => (
                <li key={e} data-estado={e === etapa ? "agora" : ETAPAS.indexOf(e) < ETAPAS.indexOf(etapa) ? "feita" : undefined} aria-current={e === etapa ? "step" : undefined}>
                  <i aria-hidden="true" />
                  <span>{NOME_ETAPA[e].split(" ").at(-1)}</span>
                </li>
              ))}
            </ol>
            <div key={etapa} className="cr-etapa">
              {etapa === "fonte" && <EtapaFonte {...props} />}
              {etapa === "comparar" && <EtapaComparar {...props} />}
              {etapa === "anacronismo" && <EtapaAnacronismo {...props} />}
              {etapa === "conclusao" && <EtapaConclusao {...props} />}
              {etapa === "balanco" && <EtapaBalanco caso={caso} ultimo={feitos.length + 1 === CASOS.length} aoSeguir={fecharCaso} />}
            </div>
          </div>
        )}
        {tela === "final" && <CenaFinal feitos={feitos.length} pontos={pontos} acertos={acertos} erros={erros} aoFim={() => {
          const final = finalDe(acertos, erros);
          const bonus = final.id === "firme" ? 300 : 0;
          const faltam = CASOS.length - feitos.length;
          aoTerminar(pontos + bonus, `Final: ${final.titulo}. ${feitos.length} ${feitos.length === 1 ? "caso" : "casos"} com ${precisao(acertos, erros)}% de precisão. ${final.licao}${faltam ? ` Ainda ${faltam === 1 ? "falta 1 viagem" : `faltam ${faltam} viagens`}.` : ""}`);
        }} />}
        {salto && <Salto de={salto.de} para={salto.para} aoFim={pousar} />}
      </div>
    </>
  );
}
