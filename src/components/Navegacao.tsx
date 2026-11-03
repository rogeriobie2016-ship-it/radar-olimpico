"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Busca } from "./Busca";
import Link from "./L";
import { Seta } from "./Seta";
import { NAV_COMPLETA, NAV_INFERIOR } from "@/lib/navegacao";

function AlternarTema() {
  const [tema, setTema] = useState<"light" | "dark" | null>(null);
  useEffect(() => setTema(document.documentElement.dataset.theme === "dark" ? "dark" : "light"), []);
  const alternar = () => {
    const novo = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    setTema(novo);
    try {
      localStorage.setItem("radar-tema", novo);
    } catch {
      /* sem armazenamento, vale só nesta visita */
    }
  };
  return (
    <button type="button" onClick={alternar} className="min-h-11 text-[0.9375rem] font-medium">
      {tema === "dark" ? "Modo claro" : "Modo escuro"}
    </button>
  );
}

export function Navegacao({ ultimaNovidade }: { ultimaNovidade: string | null }) {
  const caminho = usePathname();
  const [temNovo, setTemNovo] = useState(false);
  useEffect(() => {
    const conferir = () => {
      try {
        setTemNovo(!!ultimaNovidade && (localStorage.getItem("radar-novidades-vistas") ?? "") < ultimaNovidade);
      } catch {
        setTemNovo(!!ultimaNovidade);
      }
    };
    conferir();
    window.addEventListener("radar-novidades", conferir);
    return () => window.removeEventListener("radar-novidades", conferir);
  }, [ultimaNovidade]);
  const sala = caminho === "/";
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    menu.current?.close();
  }, [caminho]);

  const ativo = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  return (
    <>
      <header className={`sticky top-0 z-40 border-b border-linha ${sala ? "cabecalho-sala" : "bg-fundo/95 backdrop-blur-sm"}`}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
          <Link href="/" className="estreito text-[1.3rem] font-bold tracking-tight no-underline">
            Radar Olímpico
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-5 lg:flex">
            {NAV_COMPLETA.slice(0, 7).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={ativo(n.href) ? "page" : undefined}
                className={`relative py-1 text-[0.9375rem] font-medium no-underline after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[1.5px] after:origin-left after:bg-tinta after:transition-transform after:duration-200 hover:after:scale-x-100 ${ativo(n.href) ? "after:scale-x-100" : "after:scale-x-0"}`}
              >
                {n.rotulo}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {temNovo && (
              <Link href="/novidades/" className="bg-marca px-1.5 py-1 text-[0.6875rem] font-bold leading-none tracking-[0.04em] text-[#111210] no-underline">
                NOVIDADE
              </Link>
            )}
            <Busca />
            <button type="button" onClick={() => menu.current?.showModal()} className="min-h-11 text-[0.9375rem] font-medium lg:hidden">
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Barra inferior só com texto: o polegar alcança, e nada compete com o conteúdo. */}
      <nav aria-label="Atalhos" className="sem-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-tinta bg-fundo pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV_INFERIOR.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={ativo(n.href) ? "page" : undefined}
            className={`relative flex min-h-[3.25rem] items-center justify-center text-[0.9375rem] no-underline ${ativo(n.href) ? "font-bold" : "font-medium text-tinta-2"}`}
          >
            {ativo(n.href) && <span aria-hidden="true" className="absolute inset-x-0 -top-px h-[3px] bg-marca" />}
            {n.rotulo}
          </Link>
        ))}
      </nav>

      <dialog ref={menu} aria-label="Menu" className="tela-cheia overflow-y-auto">
        <div className="flex h-14 items-center justify-between border-b border-linha px-4">
          <span className="estreito text-[1.3rem] font-bold">Radar Olímpico</span>
          <button type="button" onClick={() => menu.current?.close()} className="min-h-11 text-[0.9375rem] font-medium">
            Fechar
          </button>
        </div>
        <ul className="entrada-seq px-4 pb-6">
          {NAV_COMPLETA.map((n) => (
            <li key={n.href} className="border-b border-linha">
              <Link href={n.href} onClick={() => menu.current?.close()} className="flex items-center justify-between gap-4 py-3.5 no-underline">
                <span>
                  <span className="estreito block text-[2rem] font-bold leading-none">{n.rotulo}</span>
                  <span className="mt-1 block text-sm text-tinta-2">{n.resumo}</span>
                </span>
                <Seta tamanho={22} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-4 pb-8">
          <AlternarTema />
        </div>
      </dialog>
    </>
  );
}

export function RodapeTema() {
  return <AlternarTema />;
}
