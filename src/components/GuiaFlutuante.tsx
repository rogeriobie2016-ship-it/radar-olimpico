"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "./L";
import { Mascote, type Pose } from "./Mascote";
import { CARIMBOS, confete, useGuia } from "@/lib/guia";

type Dica = { fala: string; pose: Pose; href?: string; acao?: string };

const DICAS: [RegExp, Dica][] = [
  [/^\/laboratorio/, { fala: "Entra comigo! Lá dentro dá para andar e usar cada equipamento.", pose: "foguete" }],
  [/^\/radar/, { fala: "Toda olimpíada do Ceará e do Brasil está aqui. Filtra pela sua série que eu mostro só as que servem pra você.", pose: "lupa", href: "/escada/", acao: "Prefiro que você escolha" }],
  [/^\/escada/, { fala: "Responde com calma. Eu cruzo com as regras de cada olimpíada e monto o seu caminho.", pose: "pensa" }],
  [/^\/oportunidade/, { fala: "Curtiu essa? Salva na lista, chama a turma no WhatsApp e fala com um professor.", pose: "aponta", href: "/minha-lista/", acao: "Ver minha lista" }],
  [/^\/calendario/, { fala: "Toca num dia marcado para ver o prazo. Dá para levar tudo para a agenda do celular.", pose: "aponta" }],
  [/^\/ceara-cientifico/, { fala: "Uma pergunta boa pode te levar da escola até a etapa estadual. Testa na Jornada Científica?", pose: "tubo", href: "/jogos/jornada-cientifica/", acao: "Jogar agora" }],
  [/^\/joc/, { fala: "Sua equipe chegou à etapa final? O JOC pode ajudar na viagem. Simula a prioridade da escola aqui.", pose: "foguete" }],
  [/^\/professores/, { fala: "Professor, você é quem abre essa porta. Aqui tem o passo a passo.", pose: "acena" }],
  [/^\/novidades/, { fala: "Eu visito os sites oficiais todo dia. O que mudou aparece aqui, sempre com a fonte.", pose: "lupa" }],
  [/^\/minha-lista/, { fala: "Sua lista e seu passaporte moram aqui. Falta pouco para o próximo carimbo.", pose: "comemora" }],
  [/^\/$/, { fala: "Oi! Eu te guio por aqui. Pega a lupa e procura as olimpíadas escondidas no universo.", pose: "acena", href: "/escada/", acao: "Montar minha Escada" }],
];

/** Mascote que acompanha a pessoa pelo site, com uma dica de cada página. Também comemora conquistas. */
export function GuiaFlutuante() {
  const caminho = usePathname();
  const { quem, escolher, outro } = useGuia();
  const [aberto, setAberto] = useState(false);
  const [conquista, setConquista] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rolou, setRolou] = useState(false);
  // Jogos e Escada já têm narrador na própria tela.
  const nosJogos = (caminho.startsWith("/jogos/") && caminho.split("/").filter(Boolean).length > 1) || caminho.startsWith("/escada");
  // Na abertura, quem fala é a própria cena. O guia só aparece depois dela.
  const naAbertura = caminho === "/" && !rolou;

  useEffect(() => {
    const medir = () => setRolou(window.scrollY > window.innerHeight * 0.8);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, []);
  const dica = DICAS.find(([r]) => r.test(caminho))?.[1] ?? DICAS[DICAS.length - 1][1];

  // Na primeira visita a cada página, o guia fala sozinho e depois se recolhe.
  useEffect(() => {
    setAberto(false);
    if (nosJogos || caminho === "/") return;
    let visto = false;
    try {
      const k = `radar-dica-${caminho.split("/")[1] || "inicio"}`;
      visto = !!sessionStorage.getItem(k);
      sessionStorage.setItem(k, "1");
    } catch {
      visto = true;
    }
    if (visto) return;
    const abrir = setTimeout(() => setAberto(true), 1800);
    const fechar = setTimeout(() => setAberto(false), 7000);
    return () => {
      clearTimeout(abrir);
      clearTimeout(fechar);
    };
  }, [caminho, nosJogos]);

  useEffect(() => {
    const aoGanhar = (e: Event) => {
      const c = CARIMBOS.find((x) => x.id === (e as CustomEvent).detail);
      if (!c) return;
      setConquista(c.titulo);
      confete();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setConquista(null), 4200);
    };
    window.addEventListener("radar-carimbo", aoGanhar);
    return () => window.removeEventListener("radar-carimbo", aoGanhar);
  }, []);

  return (
    <>
      {conquista && (
        <div role="status" className="carimbo-toast sem-print">
          <Mascote quem={quem} pose="comemora" className="w-14 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amarelo">Carimbo novo no passaporte</p>
            <p className="titulo text-lg leading-tight">{conquista}</p>
          </div>
        </div>
      )}

      {!nosJogos && !naAbertura && (
        <div className="sem-print fixed bottom-[calc(4.1rem+env(safe-area-inset-bottom))] right-2 z-30 lg:bottom-3 lg:right-5">
          {aberto && (
            <div className="balao balao-guia absolute bottom-full right-0 mb-1 w-[17rem]">
              <p>{dica.fala}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {dica.href && (
                  <Link href={dica.href} onClick={() => setAberto(false)} className="font-extrabold text-[#a84a08] underline">
                    {dica.acao}
                  </Link>
                )}
                <button type="button" onClick={() => escolher(outro)} className="text-sm underline opacity-80">
                  Trocar de guia
                </button>
              </div>
            </div>
          )}
          <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto} aria-label={aberto ? "Fechar a dica do guia" : "Abrir a dica do guia"} className={`guia-botao ${aberto ? "" : "guia-espia"}`}>
            <Mascote quem={quem} pose={aberto ? dica.pose : "parado"} falando={aberto} prioridade className="w-[3.75rem] lg:w-24" />
          </button>
        </div>
      )}
    </>
  );
}
