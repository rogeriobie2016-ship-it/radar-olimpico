"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hojeLocal } from "@/lib/estudos-revisao";
import { tocar } from "@/lib/som";

const CHAVE = "radar-estudos-foco";
const RITMOS = [
  { id: "25", foco: 25, pausa: 5, rotulo: "25 de foco, 5 de pausa" },
  { id: "50", foco: 50, pausa: 10, rotulo: "50 de foco, 10 de pausa" },
  { id: "15", foco: 15, pausa: 3, rotulo: "15 de foco, 3 de pausa" },
] as const;

type Fase = "foco" | "pausa";
type Salvo = { ritmo: string; fase: Fase; fimEm: number | null; restanteMs: number; dia: string; feitos: number };

const duracaoMs = (ritmo: string, fase: Fase) => {
  const r = RITMOS.find((x) => x.id === ritmo) ?? RITMOS[0];
  return (fase === "foco" ? r.foco : r.pausa) * 60_000;
};

const INICIAL: Salvo = { ritmo: "25", fase: "foco", fimEm: null, restanteMs: duracaoMs("25", "foco"), dia: "", feitos: 0 };

function lerSalvo(): Salvo | null {
  try {
    const b = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    if (!b || typeof b !== "object") return null;
    const ritmo = RITMOS.some((r) => r.id === b.ritmo) ? b.ritmo : "25";
    const fase: Fase = b.fase === "pausa" ? "pausa" : "foco";
    return {
      ritmo,
      fase,
      fimEm: typeof b.fimEm === "number" ? b.fimEm : null,
      restanteMs: typeof b.restanteMs === "number" && b.restanteMs > 0 ? b.restanteMs : duracaoMs(ritmo, fase),
      dia: typeof b.dia === "string" ? b.dia : "",
      feitos: Number.isInteger(b.feitos) && b.feitos >= 0 ? b.feitos : 0,
    };
  } catch {
    return null;
  }
}

const relogio = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function FocoCliente() {
  const [estado, setEstado] = useState<Salvo>(INICIAL);
  const [agora, setAgora] = useState(0);
  const [aviso, setAviso] = useState("");
  const [pronto, setPronto] = useState(false);
  const tituloOriginal = useRef("");

  const { ritmo, fase, fimEm, restanteMs, feitos } = estado;
  const rodando = fimEm !== null;
  const restante = rodando ? Math.max(0, fimEm - agora) : restanteMs;
  const total = duracaoMs(ritmo, fase);
  const progresso = Math.min(1, Math.max(0, 1 - restante / total));
  const hojeFeitos = estado.dia === hojeLocal() ? feitos : 0;

  useEffect(() => {
    tituloOriginal.current = document.title;
    const salvo = lerSalvo();
    if (salvo) setEstado(salvo);
    setAgora(Date.now());
    setPronto(true);
    return () => {
      document.title = tituloOriginal.current;
    };
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* segue só nesta visita */
    }
  }, [estado, pronto]);

  // A conta usa a hora do relógio, e não contagem de ticks: o navegador freia abas em segundo plano.
  useEffect(() => {
    if (!rodando) {
      if (tituloOriginal.current) document.title = tituloOriginal.current;
      return;
    }
    const passo = () => setAgora(Date.now());
    passo();
    const t = window.setInterval(passo, 500);
    document.addEventListener("visibilitychange", passo);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", passo);
    };
  }, [rodando]);

  const terminar = useCallback(() => {
    setEstado((a) => {
      const proxima: Fase = a.fase === "foco" ? "pausa" : "foco";
      const dia = hojeLocal();
      const feitosHoje = a.dia === dia ? a.feitos : 0;
      return {
        ...a,
        fase: proxima,
        fimEm: null,
        restanteMs: duracaoMs(a.ritmo, proxima),
        dia,
        feitos: a.fase === "foco" ? feitosHoje + 1 : feitosHoje,
      };
    });
    setAviso(fase === "foco" ? "Bloco feito. Hora da pausa." : "Pausa encerrada. Pronto para o próximo bloco?");
    tocar("fim");
    // Sem toque recente na página, o navegador bloqueia a vibração e reclama no console.
    if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(200);
  }, [fase]);

  useEffect(() => {
    if (rodando && restante <= 0 && pronto) terminar();
  }, [rodando, restante, pronto, terminar]);

  useEffect(() => {
    if (rodando) document.title = `${relogio(restante)} ${fase === "foco" ? "Foco" : "Pausa"}`;
  }, [rodando, restante, fase]);

  const iniciar = () => {
    const t = Date.now();
    setAgora(t);
    setAviso("");
    setEstado((a) => ({ ...a, fimEm: t + a.restanteMs }));
  };
  const pausar = () => setEstado((a) => ({ ...a, restanteMs: Math.max(1000, (a.fimEm ?? Date.now()) - Date.now()), fimEm: null }));
  const zerar = () => {
    setAviso("");
    setEstado((a) => ({ ...a, fimEm: null, restanteMs: duracaoMs(a.ritmo, a.fase) }));
  };
  const trocarFase = (f: Fase) => {
    setAviso("");
    setEstado((a) => ({ ...a, fase: f, fimEm: null, restanteMs: duracaoMs(a.ritmo, f) }));
  };
  const trocarRitmo = (id: string) => {
    setAviso("");
    setEstado((a) => ({ ...a, ritmo: id, fimEm: null, restanteMs: duracaoMs(id, a.fase) }));
  };

  const R = 46;
  const volta = 2 * Math.PI * R;

  return (
    <section aria-label="Temporizador" className="est-vidro est-bloco">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Fase">
        <button type="button" className="est-chip" aria-pressed={fase === "foco"} onClick={() => trocarFase("foco")}>
          Foco
        </button>
        <button type="button" className="est-chip" aria-pressed={fase === "pausa"} onClick={() => trocarFase("pausa")}>
          Pausa
        </button>
      </div>

      <div className="est-relogio">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--linha)" strokeWidth="2" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--tinta)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={volta} strokeDashoffset={volta * (1 - progresso)} transform="rotate(-90 50 50)" />
        </svg>
        <div className="est-relogio-texto" role="timer" aria-label={`Tempo restante da ${fase}`}>
          {relogio(restante)}
        </div>
      </div>

      <p className="sr-only" aria-live="assertive">{aviso}</p>
      {aviso && <p className="est-frase text-center">{aviso}</p>}

      <div className="flex flex-wrap justify-center gap-3">
        {rodando ? (
          <button type="button" className="est-botao" onClick={pausar}>
            Pausar
          </button>
        ) : (
          <button type="button" className="est-botao" onClick={iniciar}>
            {restanteMs < total ? "Continuar" : fase === "foco" ? "Começar foco" : "Começar pausa"}
          </button>
        )}
        <button type="button" className="est-botao est-botao-sec" onClick={zerar}>
          Zerar
        </button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="est-rotulo mb-2">Ritmo</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {RITMOS.map((r) => (
            <button key={r.id} type="button" className="est-chip" aria-pressed={ritmo === r.id} onClick={() => trocarRitmo(r.id)}>
              {r.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="est-meta">
        {hojeFeitos === 0 ? "Nenhum bloco hoje ainda." : `${hojeFeitos} ${hojeFeitos === 1 ? "bloco feito" : "blocos feitos"} hoje.`} Fica salvo só neste aparelho.
      </p>
    </section>
  );
}
