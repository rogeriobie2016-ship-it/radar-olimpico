"use client";

import { useEffect, useRef, useState } from "react";
import { Fala } from "@/components/Fala";
import {
  CAPITULOS, CENAS_POR_ID, INICIO, INTEGRIDADE_INICIAL, PERDA_POR_ERRO,
  entrarEm, escolhasDe, pontosDoDesafio,
  type CenaDesafio, type CenaFinal, type CenaNarrativa, type CenaOrdem, type Opcao,
} from "@/lib/estudo/arquivo-perdido";
import { tocar } from "@/lib/som";
import { CenarioTita } from "./cenariosTita";
import { Placar, type AoTerminar } from "./Molde";
import { BotaoSeguir, Explicacao, ListaOpcoes, TextoRevelado, comprimento, menosMovimento, useRevelacao, useTopoDaCena, useTrazerParaTela } from "./narrativa";

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
const nomeCapitulo = (c: number) => (c > 0 && c < CAPITULOS.length - 1 ? `Capítulo ${ROMANOS[c]}, ${CAPITULOS[c]}` : CAPITULOS[c]);

/** Cartão de capítulo: um respiro entre as partes da história, como em um filme. */
function Cartao({ capitulo, aoFim }: { capitulo: number; aoFim: () => void }) {
  useEffect(() => {
    tocar("virar");
    const t = setTimeout(aoFim, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <button type="button" className="nv-cartao" onClick={aoFim} aria-label={`${nomeCapitulo(capitulo)}. Continuar`}>
      {capitulo > 0 && capitulo < CAPITULOS.length - 1 && <span className="nv-cartao-num">Capítulo {ROMANOS[capitulo]}</span>}
      <span className="nv-cartao-titulo">{CAPITULOS[capitulo]}</span>
      <span className="nv-cartao-traco" />
    </button>
  );
}

function Integridade({ valor }: { valor: number }) {
  return (
    <div className="nv-integridade">
      <span>Integridade do arquivo</span>
      <span className="nv-integridade-barra" aria-hidden="true"><i style={{ width: `${valor}%` }} data-baixa={valor < 60 || undefined} /></span>
      <strong className="num">{valor}%</strong>
    </div>
  );
}

function CenaHistoria({ cena, marcas, integridade, aoEscolher }: { cena: CenaNarrativa; marcas: string[]; integridade: number; aoEscolher: (vai: string, marca?: string) => void }) {
  const { n, completo, completar } = useRevelacao(comprimento(cena.paragrafos));
  const raiz = useTopoDaCena<HTMLDivElement>(cena.id);
  const trazer = useTrazerParaTela<HTMLDivElement>(completo || null);
  return (
    <div ref={raiz} tabIndex={-1} className="nv-cena nv-cena-historia" onKeyDown={(e) => {
      if (!completo && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        completar();
      }
    }}>
      <div className="nv-vista" />
      <div className="nv-narrar" onClick={completar}>
        <TextoRevelado partes={cena.paragrafos} n={n} classeParte="nv-paragrafo" />
      </div>
      {!completo && <button type="button" className="nv-pular" onClick={completar}>Mostrar tudo</button>}
      {completo && (
        <div ref={trazer} className="nv-depois">
          {cena.fala && <Fala texto={cena.fala} pose={cena.pose ?? "parado"} tamanho={64} />}
          <ul className="nv-escolhas">
            {escolhasDe(cena, marcas, integridade).map((e) => (
              <li key={e.vai}>
                <button type="button" className="nv-escolha" onClick={() => {
                  tocar("passo");
                  aoEscolher(e.vai, e.marca);
                }}>
                  {e.t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Painel({ rotulo, autor, habilidade, children }: { rotulo: string; autor: string; habilidade: string; children: React.ReactNode }) {
  return (
    <section className="nv-painel" aria-label={`Mensagem: ${rotulo}`}>
      <header>
        <span className="nv-habilidade">{habilidade}</span>
        <span className="nv-rotulo">{rotulo}</span>
        <span className="nv-autor">{autor}</span>
      </header>
      <i className="nv-varre" aria-hidden="true" />
      {children}
    </section>
  );
}

function CenaPergunta({ cena, aoErrar, aoConcluir }: { cena: CenaDesafio; aoErrar: () => void; aoConcluir: (pontos: number) => void }) {
  const { mensagem } = cena;
  const lacunaTela = (ok: boolean) => mensagem.linhas.map((l) => l.replace("{lacuna}", ok ? mensagem.lacuna ?? "" : "▒▒▒▒▒▒▒"));
  const { n, completo, completar } = useRevelacao(comprimento(lacunaTela(false)));
  const [ultima, setUltima] = useState<Opcao | null>(null);
  const [erros, setErros] = useState(0);
  const [certo, setCerto] = useState(false);
  const raiz = useTopoDaCena<HTMLDivElement>(cena.id);

  const responder = (o: Opcao) => {
    setUltima(o);
    if (o.certa) {
      setCerto(true);
      tocar("achou");
    } else {
      setErros((e) => e + 1);
      tocar("erro");
      aoErrar();
    }
  };

  return (
    <div ref={raiz} tabIndex={-1} className="nv-cena" onKeyDown={(e) => {
      if (!completo && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        completar();
      }
    }}>
      <Painel rotulo={mensagem.rotulo} autor={mensagem.autor} habilidade={cena.habilidade}>
        <div onClick={completar}>
          <TextoRevelado partes={lacunaTela(certo)} n={certo ? Number.MAX_SAFE_INTEGER : n} modo="ruido" className={mensagem.verso ? "nv-mensagem nv-verso" : "nv-mensagem"} />
        </div>
        {cena.tabela && (
          <table className="nv-tabela">
            <caption className="sr-only">Dados do problema</caption>
            <tbody>
              {cena.tabela.map(([a, b]) => (
                <tr key={a}>
                  <th scope="row">{a}</th>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Painel>
      {!completo && <button type="button" className="nv-pular" onClick={completar}>Mostrar tudo</button>}
      {completo && (
        <div className="nv-depois">
          <p className="nv-pergunta">{cena.pergunta}</p>
          <ListaOpcoes chave={cena.id} opcoes={cena.opcoes} resolvida={certo} aoResponder={responder} />
          {ultima ? <Explicacao texto={ultima.porque} certo={!!ultima.certa} estudo={certo ? cena.estudo : undefined} /> : <Fala texto={cena.dica} pose="pensa" tamanho={64} />}
          {certo && <BotaoSeguir aoTocar={() => aoConcluir(pontosDoDesafio(erros))}>Restaurar e seguir</BotaoSeguir>}
        </div>
      )}
    </div>
  );
}

function CenaMontar({ cena, aoErrar, aoConcluir }: { cena: CenaOrdem; aoErrar: () => void; aoConcluir: (pontos: number) => void }) {
  const [feitos, setFeitos] = useState(0);
  const [erros, setErros] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const raiz = useTopoDaCena<HTMLDivElement>(cena.id);
  const pronto = feitos === cena.fragmentos.length;

  const tocarEm = (i: number) => {
    if (pronto || i < feitos) return;
    if (i === feitos) {
      setFeitos(feitos + 1);
      setAviso(null);
      tocar(feitos + 1 === cena.fragmentos.length ? "achou" : "acerto");
    } else {
      setErros((e) => e + 1);
      setAviso(cena.fragmentos[i].foraDeOrdem);
      tocar("erro");
      aoErrar();
    }
  };

  return (
    <div ref={raiz} tabIndex={-1} className="nv-cena">
      <Painel rotulo={cena.mensagem.rotulo} autor={cena.mensagem.autor} habilidade={cena.habilidade}>
        <ol className="nv-montada" aria-label="Frases já restauradas">
          {cena.fragmentos.slice(0, feitos).map((f) => <li key={f.t}>{f.t}</li>)}
          {!pronto && <li className="nv-montada-falta" aria-hidden="true">▒▒▒▒▒▒▒▒▒▒▒▒▒▒</li>}
        </ol>
      </Painel>
      <div className="nv-depois">
        <p className="nv-pergunta">{cena.pergunta}</p>
        {!pronto && (
          <ul className="nv-opcoes">
            {cena.mostrar.filter((i) => i >= feitos).map((i) => (
              <li key={i}>
                <button type="button" className="nv-op" data-estado="livre" onClick={() => tocarEm(i)}>
                  <span>{cena.fragmentos[i].t}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {pronto ? <Explicacao texto={cena.explicacao} certo estudo={cena.estudo} /> : aviso ? <Explicacao texto={aviso} certo={false} /> : <Fala texto={cena.dica} pose="pensa" tamanho={64} />}
        {pronto && <BotaoSeguir aoTocar={() => aoConcluir(pontosDoDesafio(erros))}>Restaurar e seguir</BotaoSeguir>}
      </div>
    </div>
  );
}

function CenaFim({ cena, aoFim }: { cena: CenaFinal; aoFim: () => void }) {
  const { n, completo, completar } = useRevelacao(comprimento(cena.paragrafos), 2);
  const raiz = useTopoDaCena<HTMLDivElement>(cena.id);
  useEffect(() => tocar("achou"), []);
  return (
    <div ref={raiz} tabIndex={-1} className="nv-cena nv-cena-historia">
      <div className="nv-vista nv-vista-final" />
      <p className="nv-sobretitulo">Final</p>
      <h2 className="nv-titulo-final">{cena.titulo}</h2>
      <div className="nv-narrar" onClick={completar}>
        <TextoRevelado partes={cena.paragrafos} n={n} classeParte="nv-paragrafo" />
      </div>
      {!completo && <button type="button" className="nv-pular" onClick={completar}>Mostrar tudo</button>}
      {completo && (
        <div className="nv-depois">
          <p className="nv-estudo"><strong>O que fica.</strong> {cena.licao}</p>
          <BotaoSeguir aoTocar={aoFim}>Ver resultado</BotaoSeguir>
        </div>
      )}
    </div>
  );
}

export default function ArquivoPerdido({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const inicio = useRef(entrarEm(INICIO, [], INTEGRIDADE_INICIAL));
  const [id, setId] = useState(inicio.current.id);
  const [marcas, setMarcas] = useState(inicio.current.marcas);
  const [integridade, setIntegridade] = useState(INTEGRIDADE_INICIAL);
  const [pontos, setPontos] = useState(0);
  const [cartao, setCartao] = useState<number | null>(() => (menosMovimento() ? null : 0));
  const [abertas, setAbertas] = useState(0);

  const cena = CENAS_POR_ID[id];
  if (cena.tipo === "ramo") return null;

  const ir = (vai: string, marca?: string, integ = integridade) => {
    const base = marca && !marcas.includes(marca) ? [...marcas, marca] : marcas;
    const proxima = entrarEm(vai, base, integ);
    const destino = CENAS_POR_ID[proxima.id];
    setMarcas(proxima.marcas);
    setId(proxima.id);
    setAbertas((a) => a + 1);
    if (destino.capitulo !== cena.capitulo && !menosMovimento()) setCartao(destino.capitulo);
  };

  const errar = () => setIntegridade((v) => Math.max(0, v - PERDA_POR_ERRO));
  const concluir = (ganho: number, vai: string) => {
    setPontos((p) => p + ganho);
    ir(vai);
  };

  return (
    <>
      <Placar esquerda={nomeCapitulo(cena.capitulo)} direita={pontos.toLocaleString("pt-BR")} />
      <div className="nv nv-tita">
        <div className="nv-fundo"><CenarioTita nome={cena.cenario} /></div>
        {cena.tipo !== "final" && <Integridade valor={integridade} />}
        {cena.tipo === "narrativa" && <CenaHistoria key={`${id}-${abertas}`} cena={cena} marcas={marcas} integridade={integridade} aoEscolher={ir} />}
        {cena.tipo === "desafio" && <CenaPergunta key={`${id}-${abertas}`} cena={cena} aoErrar={errar} aoConcluir={(g) => concluir(g, cena.vai)} />}
        {cena.tipo === "ordem" && <CenaMontar key={`${id}-${abertas}`} cena={cena} aoErrar={errar} aoConcluir={(g) => concluir(g, cena.vai)} />}
        {cena.tipo === "final" && <CenaFim key={id} cena={cena} aoFim={() => aoTerminar(pontos + cena.bonus, `Final: ${cena.titulo}. ${cena.licao} São quatro finais possíveis.`)} />}
        {cartao !== null && <Cartao key={cartao} capitulo={cartao} aoFim={() => setCartao(null)} />}
      </div>
    </>
  );
}
