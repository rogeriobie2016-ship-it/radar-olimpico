"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { LinkFonte } from "@/components/estudos/Cabecalho";
import { chaveCarta, estaPendente, hojeLocal, limparEstados, proximaRevisao, responder, type EstadoCarta } from "@/lib/estudos-revisao";
import type { Baralhos } from "@/lib/schema";
import { tocar } from "@/lib/som";

const CHAVE = "radar-estudos-baralhos";

type Carta = { frente: string; verso: string };
type Baralho = { id: string; titulo: string; resumo: string; cartas: Carta[]; fonte?: Baralhos["baralhos"][number]["fonte"]; proprio: boolean };
type Sessao = { baralho: string; fila: string[]; virada: boolean; feitas: number; total: number; erradas: string[] };

const dataBr = (d: string) => d.split("-").reverse().join("/");

function lerSalvo() {
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    const proprios: Baralho[] = Array.isArray(b?.proprios)
      ? b.proprios
          .filter((x: Partial<Baralho>) => typeof x?.id === "string" && typeof x?.titulo === "string" && Array.isArray(x?.cartas))
          .map((x: Baralho) => ({
            id: x.id,
            titulo: x.titulo,
            resumo: "Feito por você",
            proprio: true,
            cartas: x.cartas.filter((c) => typeof c?.frente === "string" && typeof c?.verso === "string"),
          }))
      : [];
    return { proprios, estados: limparEstados(b?.estados) };
  } catch {
    return { proprios: [] as Baralho[], estados: {} as Record<string, EstadoCarta> };
  }
}

export function RevisaoCliente({ prontos }: { prontos: Baralhos["baralhos"] }) {
  const [proprios, setProprios] = useState<Baralho[]>([]);
  const [estados, setEstados] = useState<Record<string, EstadoCarta>>({});
  const [hoje, setHoje] = useState<string | null>(null);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [aviso, setAviso] = useState("");
  const acao = useRef<HTMLButtonElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const campoFrente = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = lerSalvo();
    setProprios(s.proprios);
    setEstados(s.estados);
    setHoje(hojeLocal());
  }, []);

  useEffect(() => {
    if (!hoje) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ proprios: proprios.map(({ id, titulo: t, cartas }) => ({ id, titulo: t, cartas })), estados }));
    } catch {
      /* segue só nesta visita */
    }
  }, [proprios, estados, hoje]);

  const todos = useMemo<Baralho[]>(() => [...prontos.map((b) => ({ ...b, proprio: false })), ...proprios], [prontos, proprios]);
  const baralhoAtual = todos.find((b) => b.id === (sessao?.baralho ?? editando));

  const pendentes = (b: Baralho) => (hoje ? b.cartas.filter((c) => estaPendente(estados[chaveCarta(b.id, c.frente)], hoje)) : []);

  // Foco acompanha a sessão: quem usa teclado segue direto para a próxima ação.
  useEffect(() => {
    if (sessao?.fila.length) acao.current?.focus();
    else if (sessao) titulo.current?.focus();
  }, [sessao]);

  const estudar = (b: Baralho) => {
    const fila = pendentes(b).map((c) => c.frente);
    setConfirmar(null);
    setEditando(null);
    setSessao({ baralho: b.id, fila, virada: false, feitas: 0, total: fila.length, erradas: [] });
  };

  const responderCarta = (acertou: boolean) => {
    if (!sessao || !hoje) return;
    const f = sessao.fila[0];
    const k = chaveCarta(sessao.baralho, f);
    const jaErrouHoje = sessao.erradas.includes(f);
    // Quem errou revê a carta ainda hoje, mas isso não conta como acerto: ela segue marcada para amanhã.
    if (!jaErrouHoje) setEstados((a) => ({ ...a, [k]: responder(a[k], acertou, hoje) }));
    tocar(acertou ? "acerto" : "erro");
    setSessao({
      ...sessao,
      virada: false,
      feitas: acertou ? sessao.feitas + 1 : sessao.feitas,
      erradas: acertou || jaErrouHoje ? sessao.erradas : [...sessao.erradas, f],
      fila: acertou ? sessao.fila.slice(1) : [...sessao.fila.slice(1), f],
    });
  };

  const criarBaralho = (e: FormEvent) => {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;
    const id = `meu-${Date.now()}`;
    setProprios((a) => [...a, { id, titulo: nome, resumo: "Feito por você", cartas: [], proprio: true }]);
    setNovoNome("");
    setEditando(id);
    setAviso("");
  };

  const adicionarCarta = (e: FormEvent) => {
    e.preventDefault();
    const fr = frente.trim();
    const ve = verso.trim();
    if (!fr || !ve || !editando) return;
    const atual = proprios.find((b) => b.id === editando);
    if (atual?.cartas.some((c) => c.frente === fr)) {
      setAviso("Essa frente já existe neste baralho.");
      return;
    }
    setProprios((a) => a.map((b) => (b.id === editando ? { ...b, cartas: [...b.cartas, { frente: fr, verso: ve }] } : b)));
    setFrente("");
    setVerso("");
    setAviso("Carta guardada.");
    campoFrente.current?.focus();
  };

  const tirarCarta = (bId: string, fr: string) => {
    setProprios((a) => a.map((b) => (b.id === bId ? { ...b, cartas: b.cartas.filter((c) => c.frente !== fr) } : b)));
    setEstados((a) => {
      const n = { ...a };
      delete n[chaveCarta(bId, fr)];
      return n;
    });
  };

  const apagarOuRecomecar = (b: Baralho) => {
    setEstados((a) => Object.fromEntries(Object.entries(a).filter(([k]) => !k.startsWith(`${b.id}::`))));
    if (b.proprio) setProprios((a) => a.filter((x) => x.id !== b.id));
    setConfirmar(null);
    setEditando(null);
    setAviso(b.proprio ? `Baralho ${b.titulo} apagado.` : `Progresso de ${b.titulo} zerado.`);
  };

  // Sessão de estudo
  if (sessao && baralhoAtual) {
    const carta = baralhoAtual.cartas.find((c) => c.frente === sessao.fila[0]);
    if (!carta) {
      const proxima = hoje ? proximaRevisao(baralhoAtual.cartas.map((c) => estados[chaveCarta(baralhoAtual.id, c.frente)]), hoje) : null;
      return (
        <section aria-labelledby="fim" className="est-vidro est-bloco">
          <h2 id="fim" ref={titulo} tabIndex={-1} className="est-secao">
            {sessao.total ? "Feito por hoje" : "Nada para hoje"}
          </h2>
          <p className="est-frase">
            {sessao.total ? `${sessao.total} ${sessao.total === 1 ? "carta revista" : "cartas revistas"} em ${baralhoAtual.titulo}.` : `${baralhoAtual.titulo} não tem carta pendente agora.`}
            {proxima && proxima !== hoje ? ` Próxima revisão: ${dataBr(proxima)}.` : ""}
          </p>
          <button type="button" className="est-botao self-start" onClick={() => setSessao(null)}>
            Voltar aos baralhos
          </button>
        </section>
      );
    }
    return (
      <section aria-label={`Estudando ${baralhoAtual.titulo}`} className="est-vidro est-bloco">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="est-meta">
            {baralhoAtual.titulo}: {sessao.feitas} de {sessao.total}
          </p>
          <button type="button" className="est-botao est-botao-sec" onClick={() => setSessao(null)}>
            Parar
          </button>
        </div>
        <div className="est-carta" aria-live="polite">
          <p className="est-rotulo">{sessao.virada ? "Resposta" : "Pergunta"}</p>
          <p className="est-carta-frente">{sessao.virada ? carta.verso : carta.frente}</p>
          {sessao.virada && <p className="est-meta">{carta.frente}</p>}
        </div>
        {sessao.virada ? (
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="est-botao est-botao-sec" onClick={() => responderCarta(false)}>
              Errei
            </button>
            <button ref={acao} type="button" className="est-botao" onClick={() => responderCarta(true)}>
              Acertei
            </button>
          </div>
        ) : (
          <button ref={acao} type="button" className="est-botao" onClick={() => setSessao({ ...sessao, virada: true })}>
            Mostrar resposta
          </button>
        )}
      </section>
    );
  }

  // Edição de um baralho próprio
  if (editando && baralhoAtual?.proprio) {
    return (
      <section aria-labelledby="editar" className="est-vidro est-bloco">
        <h2 id="editar" className="est-secao">{baralhoAtual.titulo}</h2>
        <form onSubmit={adicionarCarta} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="frente" className="est-rotulo">Frente</label>
            <input id="frente" ref={campoFrente} value={frente} onChange={(e) => setFrente(e.target.value)} className="est-campo" maxLength={200} autoComplete="off" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="verso" className="est-rotulo">Verso</label>
            <input id="verso" value={verso} onChange={(e) => setVerso(e.target.value)} className="est-campo" maxLength={300} autoComplete="off" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="est-botao" disabled={!frente.trim() || !verso.trim()}>
              Guardar carta
            </button>
            <button type="button" className="est-botao est-botao-sec" onClick={() => setEditando(null)}>
              Pronto
            </button>
          </div>
          <p className="est-meta" aria-live="polite">{aviso}</p>
        </form>
        {baralhoAtual.cartas.length > 0 && (
          <ul className="est-materiais" aria-label="Cartas do baralho">
            {baralhoAtual.cartas.map((c) => (
              <li key={c.frente} className="est-material">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold">{c.frente}</span>
                  <span className="est-texto">{c.verso}</span>
                </span>
                <button type="button" className="est-botao est-botao-sec" onClick={() => tirarCarta(baralhoAtual.id, c.frente)} aria-label={`Tirar a carta ${c.frente}`}>
                  Tirar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  // Lista de baralhos
  return (
    <>
      <p className="sr-only" aria-live="polite">{aviso}</p>
      <ul className="flex flex-col gap-4">
        {todos.map((b) => {
          const n = pendentes(b).length;
          const pedindoConfirma = confirmar === b.id;
          const comecado = b.cartas.some((c) => estados[chaveCarta(b.id, c.frente)]);
          return (
            <li key={b.id} className="est-vidro est-bloco est-bloco-curto">
              <div className="flex flex-col gap-1">
                <h2 className="est-cartao-titulo">{b.titulo}</h2>
                <p className="est-texto">{b.resumo}</p>
                <p className="est-meta">
                  {b.cartas.length} {b.cartas.length === 1 ? "carta" : "cartas"}
                  {hoje ? ` · ${n === 0 ? "nada para hoje" : `${n} para hoje`}` : ""}
                </p>
                {b.fonte && (
                  <p className="est-meta">
                    Fonte: <LinkFonte href={b.fonte.url}>{b.fonte.rotulo}</LinkFonte>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="est-botao" disabled={!n} onClick={() => estudar(b)} aria-label={`Estudar ${b.titulo}`}>
                  Estudar
                </button>
                {b.proprio && (
                  <button type="button" className="est-botao est-botao-sec" onClick={() => { setAviso(""); setEditando(b.id); }} aria-label={`Editar ${b.titulo}`}>
                    Editar
                  </button>
                )}
                {(b.proprio || comecado) &&
                  (pedindoConfirma ? (
                    <button type="button" className="est-botao est-botao-sec" onClick={() => apagarOuRecomecar(b)}>
                      {b.proprio ? "Confirmar: apagar" : "Confirmar: zerar"}
                    </button>
                  ) : (
                    <button type="button" className="est-botao est-botao-sec" onClick={() => setConfirmar(b.id)} aria-label={`${b.proprio ? "Apagar" : "Zerar"} ${b.titulo}`}>
                      {b.proprio ? "Apagar" : "Zerar"}
                    </button>
                  ))}
              </div>
            </li>
          );
        })}
      </ul>

      <form onSubmit={criarBaralho} className="est-vidro est-bloco est-bloco-curto">
        <h2 className="est-cartao-titulo">Criar um baralho</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="novo" className="est-rotulo">Nome</label>
          <input id="novo" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="est-campo" maxLength={60} placeholder="Exemplo: Fórmulas de física" autoComplete="off" />
        </div>
        <button type="submit" className="est-botao est-botao-sec self-start" disabled={!novoNome.trim()}>
          Criar
        </button>
      </form>
    </>
  );
}
