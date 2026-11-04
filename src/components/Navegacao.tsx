"use client";

import { BotaoSom } from "./Som";
import { BotaoTema } from "./Tema";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Busca } from "./Busca";
import Link from "./L";
import { asset } from "@/lib/base";
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
      {tema === "dark" ? "Modo claro" : "Modo universo"}
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
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    menu.current?.close();
  }, [caminho]);

  const ativo = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-linha bg-fundo/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-6">
          <Link href="/" className="estreito flex shrink-0 items-center gap-2 text-[1rem] min-[380px]:text-[1.15rem] uppercase leading-none no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/icons/favicon-96.png")} alt="" width={36} height={36} className="rounded-lg" />
            <span>
              Radar <span className="block text-amarelo xl:inline">Olímpico</span>
            </span>
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-0.5 xl:gap-2 lg:flex">
            {NAV_COMPLETA.filter((n) => n.href !== "/novidades/").slice(0, 7).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={ativo(n.href) ? "page" : undefined}
                className={`${n.href === "/ceara-cientifico/" || n.href === "/joc/" ? "max-xl:hidden " : ""}whitespace-nowrap rounded-full px-3 py-1.5 text-[0.9375rem] font-bold no-underline transition-colors hover:bg-fundo-2 ${ativo(n.href) ? "bg-turquesa !text-[#05272a]" : ""}`}
              >
                {n.rotulo}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-4">
            {temNovo && (
              <Link href="/novidades/" className="selo-novidade no-underline max-[379px]:hidden">
                NOVIDADE
              </Link>
            )}
            <Busca />
            <BotaoTema />
            <BotaoSom className="max-sm:hidden" />
            <button type="button" onClick={() => menu.current?.showModal()} className="min-h-11 text-[0.9375rem] font-medium xl:hidden">
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Barra inferior só com texto: o polegar alcança, e nada compete com o conteúdo. */}
      <nav aria-label="Atalhos" className="sem-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-linha bg-fundo/95 p-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        {NAV_INFERIOR.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={ativo(n.href) ? "page" : undefined}
            className={`estreito flex min-h-[2.9rem] items-center justify-center rounded-xl text-[0.9375rem] no-underline transition-all duration-200 ${ativo(n.href) ? "bg-marca text-[#1c0f05]" : "text-tinta-2"}`}
          >
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
        <ul className="entrada-seq grid grid-cols-2 gap-2 p-3">
          {NAV_COMPLETA.map((n, i) => (
            <li key={n.href} className="grid">
              <Link href={n.href} onClick={() => menu.current?.close()} className="azulejo flex min-h-28 flex-col justify-between gap-2 p-3.5 no-underline" style={{ background: ["#f58a33", "#00c9c8", "#fdc13f"][i % 3], color: "#10201f" }}>
                <span className="estreito block text-[1.4rem] leading-none">{n.rotulo}</span>
                <span className="block text-[0.8125rem] font-bold leading-tight">{n.resumo}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 px-4 pb-8">
          <BotaoSom className="sm:hidden" />
          <AlternarTema />
        </div>
      </dialog>
    </>
  );
}

export function RodapeTema() {
  return <AlternarTema />;
}
