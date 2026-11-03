"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Placar, type AoTerminar } from "./Molde";

export type DadoEscada = { id: string; sigla: string | null; nome: string; nivel: string; area: string; custo: string | null; credenciaPara: string[] };
type Questao = { p: string; ops: string[]; certa: string };

const NIVEIS = ["Escolar", "Regional", "Estadual", "Nacional", "Internacional"];
const COR = ["#fdc13f", "#f5a13f", "#f58a33", "#00c9c8", "#7fb0ff"];
const POR_NIVEL = 14;
const TEMPO_INICIAL = 7;

const nomeDe = (d: DadoEscada) => (d.sigla && d.sigla.length <= 9 ? d.sigla : d.nome);
const embaralhar = <T,>(l: T[]) => [...l].sort(() => Math.random() - 0.5);

/** Perguntas montadas a partir do próprio catálogo. Quando os dados mudam, as perguntas acompanham. */
export function gerarQuestoes(dados: DadoEscada[]): Questao[] {
  const porId = new Map(dados.map((d) => [d.id, d]));
  const lista: Questao[] = [];
  const escolher = (l: DadoEscada[], n: number) => embaralhar(l).slice(0, n);

  // Caminhos confirmados entre olimpíadas.
  for (const d of dados) {
    for (const destino of d.credenciaPara) {
      const alvo = porId.get(destino);
      if (!alvo) continue;
      const outras = escolher(dados.filter((x) => x.id !== destino && x.id !== d.id && x.nivel === alvo.nivel), 2);
      if (outras.length === 2) lista.push({ p: `Ir bem na ${nomeDe(d)} pode levar a qual destas?`, certa: nomeDe(alvo), ops: embaralhar([nomeDe(alvo), ...outras.map(nomeDe)]) });
    }
  }
  // Nível.
  for (const nivel of ["estadual", "internacional"]) {
    const certas = dados.filter((d) => d.nivel === nivel);
    const erradas = dados.filter((d) => d.nivel !== nivel && d.nivel !== "regional");
    for (let i = 0; i < 3 && certas.length && erradas.length >= 2; i++) {
      const c = escolher(certas, 1)[0];
      const e = escolher(erradas, 2);
      lista.push({ p: nivel === "estadual" ? "Qual destas acontece aqui no Ceará?" : "Qual destas é internacional?", certa: nomeDe(c), ops: embaralhar([nomeDe(c), ...e.map(nomeDe)]) });
    }
  }
  // Área.
  for (const [area, rotulo] of [["Matemática", "de Matemática"], ["Tecnologia e Computação", "de tecnologia"], ["Ciências Humanas e Sociais Aplicadas", "de Ciências Humanas"], ["Ciências da Natureza", "de Ciências da Natureza"]]) {
    const certas = dados.filter((d) => d.area === area);
    const erradas = dados.filter((d) => d.area !== area);
    for (let i = 0; i < 2 && certas.length; i++) {
      const c = escolher(certas, 1)[0];
      const e = escolher(erradas, 2);
      lista.push({ p: `Qual destas é ${rotulo}?`, certa: nomeDe(c), ops: embaralhar([nomeDe(c), ...e.map(nomeDe)]) });
    }
  }
  return embaralhar(lista);
}

export default function EscadaJogo({ aoTerminar, dados }: { aoTerminar: AoTerminar; dados: DadoEscada[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const totalDegraus = POR_NIVEL * NIVEIS.length;
  // 1 = próximo degrau à direita, -1 = à esquerda. Mudanças frequentes, sem sair da tela.
  const degraus = useMemo(() => {
    const l: number[] = [];
    let pos = 0;
    for (let i = 0; i < totalDegraus; i++) {
      let d = Math.random() < 0.5 ? 1 : -1;
      if (Math.abs(pos + d) > 3) d = -d;
      pos += d;
      l.push(d);
    }
    return l;
  }, [totalDegraus]);
  const questoes = useMemo(() => gerarQuestoes(dados), [dados]);

  const [passo, setPasso] = useState(0);
  const [questao, setQuestao] = useState<Questao | null>(null);
  const [resposta, setResposta] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const estado = useRef({ passo: 0, tempo: TEMPO_INICIAL, max: TEMPO_INICIAL, pausa: false, fim: false, tremer: 0, vista: 0, proxQ: 0 });
  const barra = useRef<HTMLDivElement>(null);
  const quadro = useRef(0);
  const acertosRef = useRef(0);

  const nivelAtual = Math.min(Math.floor(passo / POR_NIVEL), NIVEIS.length - 1);

  const encerrar = useCallback(
    (subiu: boolean) => {
      const e = estado.current;
      if (e.fim) return;
      e.fim = true;
      const nivel = NIVEIS[Math.min(Math.floor(e.passo / POR_NIVEL), NIVEIS.length - 1)];
      const pontos = e.passo * 10 + acertosRef.current * 50 + (subiu ? 500 : 0);
      aoTerminar(pontos, subiu ? `Você chegou ao topo, com ${acertosRef.current} respostas certas sobre o catálogo. Agora monte a sua Escada de verdade.` : `Você chegou ao nível ${nivel}, com ${acertosRef.current} respostas certas. O tempo acabou, mas o caminho continua.`);
    },
    [aoTerminar],
  );

  // Desenho e relógio no mesmo laço, para o movimento ficar contínuo.
  useEffect(() => {
    const c = canvas.current!;
    const g = c.getContext("2d")!;
    let antes = performance.now();
    const laco = (agora: number) => {
      const e = estado.current;
      const dt = Math.min((agora - antes) / 1000, 0.1);
      antes = agora;
      if (!e.pausa && !e.fim) {
        e.tempo -= dt * (1 + Math.floor(e.passo / POR_NIVEL) * 0.22);
        if (e.tempo <= 0) {
          e.tempo = 0;
          encerrar(false);
        }
      }
      if (barra.current) {
        barra.current.style.transform = `scaleX(${Math.max(0, e.tempo / e.max)})`;
        barra.current.style.background = e.tempo < 2 ? "#ff8d50" : "#f3f3ef";
      }
      e.vista += (e.passo - e.vista) * Math.min(1, dt * 16);
      e.tremer *= 0.86;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const L = c.clientWidth;
      const A = c.clientHeight;
      if (c.width !== L * dpr) {
        c.width = L * dpr;
        c.height = A * dpr;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, L, A);

      const larg = Math.min(58, L / 7.2);
      const alt = 34;
      const xDe = (i: number) => {
        let x = 0;
        for (let k = 0; k < i && k < degraus.length; k++) x += degraus[k];
        return x;
      };
      const base = Math.floor(e.vista);
      const frac = e.vista - base;
      const xVista = xDe(base) + (base < degraus.length ? degraus[base] * frac : 0);
      const cx = L / 2 - xVista * larg + (Math.random() - 0.5) * e.tremer * 8;
      const cy = A * 0.72 + e.vista * alt;

      for (let i = Math.max(0, base - 5); i <= Math.min(totalDegraus, base + 12); i++) {
        const nv = Math.min(Math.floor(i / POR_NIVEL), NIVEIS.length - 1);
        const x = cx + xDe(i) * larg;
        const y = cy - i * alt;
        const patamar = i % POR_NIVEL === 0;
        g.globalAlpha = i < e.passo ? 0.35 : 1;
        g.fillStyle = i === e.passo + 1 ? "#f3f3ef" : COR[nv];
        g.fillRect(x - larg / 2 + 1, y, larg - 2, patamar ? 12 : 8);
        if (patamar && i > 0 && i < totalDegraus) {
          g.globalAlpha = 1;
          g.fillStyle = "#a5a79f";
          g.font = "600 12px system-ui";
          g.textAlign = "center";
          g.fillText(NIVEIS[nv], x, y + 28);
        }
      }
      if (e.passo >= totalDegraus - 1) {
        g.globalAlpha = 1;
      }
      g.globalAlpha = 1;
      // Personagem: forma simples, sem rosto, na cor da marca.
      const px = cx + xVista * larg;
      const py = cy - e.vista * alt;
      const salto = Math.sin(frac * Math.PI) * 8;
      g.fillStyle = "#f58a33";
      g.fillRect(px - 8, py - 26 - salto, 16, 20);
      g.beginPath();
      g.arc(px, py - 33 - salto, 7, 0, 7);
      g.fill();

      quadro.current = requestAnimationFrame(laco);
    };
    quadro.current = requestAnimationFrame(laco);
    return () => cancelAnimationFrame(quadro.current);
  }, [degraus, totalDegraus, encerrar]);

  const pisar = useCallback(
    (dir: 1 | -1) => {
      const e = estado.current;
      if (e.pausa || e.fim) return;
      if (degraus[e.passo] !== dir) {
        e.tempo -= 1.4;
        e.tremer = 1;
        if (navigator.vibrate) navigator.vibrate(40);
        return;
      }
      e.passo += 1;
      e.tempo = Math.min(e.max, e.tempo + 0.42);
      setPasso(e.passo);
      if (e.passo >= totalDegraus) {
        encerrar(true);
        return;
      }
      if (e.passo % POR_NIVEL === 0 && questoes.length) {
        e.pausa = true;
        setQuestao(questoes[e.proxQ++ % questoes.length]);
        setResposta(null);
      }
    },
    [degraus, totalDegraus, encerrar, questoes],
  );

  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        pisar(-1);
      } else if (ev.key === "ArrowRight") {
        ev.preventDefault();
        pisar(1);
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [pisar]);

  const responder = (o: string) => {
    if (!questao || resposta) return;
    setResposta(o);
    const certa = o === questao.certa;
    if (certa) {
      acertosRef.current += 1;
      setAcertos(acertosRef.current);
    }
    setTimeout(() => {
      const e = estado.current;
      e.tempo = certa ? e.max : Math.max(e.tempo, 3);
      e.pausa = false;
      setQuestao(null);
    }, 950);
  };

  return (
    <>
      <Placar esquerda={`Nível ${NIVEIS[nivelAtual]}, ${acertos} ${acertos === 1 ? "resposta certa" : "respostas certas"}`} direita={passo * 10 + acertos * 50} />
      <div className="h-[4px] bg-[#33342f]">
        <div ref={barra} className="h-full origin-left bg-[#f3f3ef]" />
      </div>
      <div className="relative flex-1">
        <canvas ref={canvas} aria-label="Escada. Use as setas ou os botões para subir." className="absolute inset-0 size-full min-h-[22rem]" />
        {questao && (
          <div className="entrada-pergunta absolute inset-0 flex flex-col justify-end gap-3 bg-[#0f100e]/95 p-4 sm:p-6">
            <p className="text-[0.9375rem] text-[#a5a79f]">Patamar alcançado. Acerte e recupere o tempo.</p>
            <p className="titulo text-[1.875rem]">{questao.p}</p>
            <ul className="border-t border-[#33342f]">
              {questao.ops.map((o) => {
                const certo = resposta && o === questao.certa;
                const errado = resposta === o && o !== questao.certa;
                return (
                  <li key={o} className="border-b border-[#33342f]">
                    <button type="button" disabled={!!resposta} onClick={() => responder(o)} className={`min-h-12 w-full py-3 text-left font-semibold transition-colors ${certo ? "text-[#4bd68c]" : errado ? "text-[#ff8d50]" : "hover:text-marca"}`}>
                      {o}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#33342f]">
        <button type="button" onPointerDown={(e) => { e.preventDefault(); pisar(-1); }} disabled={!!questao} aria-label="Subir para a esquerda" className="grid min-h-24 touch-manipulation place-items-center bg-[#0f100e] text-lg font-semibold active:bg-marca active:text-[#111210] disabled:opacity-30">
          Esquerda
        </button>
        <button type="button" onPointerDown={(e) => { e.preventDefault(); pisar(1); }} disabled={!!questao} aria-label="Subir para a direita" className="grid min-h-24 touch-manipulation place-items-center bg-[#0f100e] text-lg font-semibold active:bg-marca active:text-[#111210] disabled:opacity-30">
          Direita
        </button>
      </div>
    </>
  );
}
