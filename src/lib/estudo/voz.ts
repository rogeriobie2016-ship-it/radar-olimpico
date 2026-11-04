"use client";

// Voz do navegador para os exercícios de escuta. Nem todo aparelho tem: quem não tem recebe "sem" e o jogo troca por escrita com pista.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Idioma } from "./tipos";

export type EstadoVoz = "carregando" | "pronta" | "sem";

const PREFERENCIA: Record<Idioma, string[]> = { en: ["en-us", "en-gb", "en"], es: ["es-es", "es-mx", "es-us", "es"] };
const ETIQUETA: Record<Idioma, string> = { en: "en-US", es: "es-ES" };
const ESPERA_VOZES = 1500; // alguns navegadores carregam a lista de vozes depois

function acharVoz(idioma: Idioma) {
  const vozes = window.speechSynthesis.getVoices();
  for (const pref of PREFERENCIA[idioma]) {
    const v = vozes.find((x) => x.lang.replace("_", "-").toLowerCase().startsWith(pref));
    if (v) return v;
  }
  return null;
}

export function useVoz(idioma: Idioma) {
  const [estado, setEstado] = useState<EstadoVoz>("carregando");
  const [falando, setFalando] = useState(false);
  const atual = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setEstado("sem");
      return;
    }
    const s = window.speechSynthesis;
    setEstado("carregando");
    const conferir = () => {
      if (!acharVoz(idioma)) return false;
      setEstado("pronta");
      return true;
    };
    conferir();
    const aoMudar = () => void conferir();
    s.addEventListener?.("voiceschanged", aoMudar);
    const t = setTimeout(() => {
      if (!conferir()) setEstado("sem");
    }, ESPERA_VOZES);
    return () => {
      s.removeEventListener?.("voiceschanged", aoMudar);
      clearTimeout(t);
      s.cancel();
    };
  }, [idioma]);

  const falar = useCallback(
    (texto: string, devagar = false) => {
      if (!("speechSynthesis" in window)) return;
      const s = window.speechSynthesis;
      s.cancel();
      const f = new SpeechSynthesisUtterance(texto);
      const v = acharVoz(idioma);
      if (v) f.voice = v;
      f.lang = v?.lang ?? ETIQUETA[idioma];
      f.rate = devagar ? 0.6 : 0.92;
      f.onstart = () => setFalando(true);
      f.onend = () => setFalando(false);
      f.onerror = (e) => {
        setFalando(false);
        // Interromper de propósito também chega aqui. Só falha de verdade troca o exercício por escrita.
        if (e.error !== "canceled" && e.error !== "interrupted" && e.error !== "not-allowed") setEstado("sem");
      };
      atual.current = f; // sem essa referência, alguns navegadores descartam a fala no meio
      s.speak(f);
    },
    [idioma],
  );

  return { estado, falando, falar };
}
