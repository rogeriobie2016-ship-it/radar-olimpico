"use client";

import Link from "@/components/L";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icone } from "./Icone";
import { NAV_COMPLETA, NAV_PRINCIPAL } from "@/lib/navegacao";

/** Barra inferior no celular: tudo a um toque do polegar, sem depender de hover. */
export function NavInferior() {
  const caminho = usePathname();
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogo.current?.close();
  }, [caminho]);

  const classe = (ativo: boolean) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold no-underline ${
      ativo ? "text-laranja-forte" : "text-tinta-2"
    }`;

  return (
    <>
      <nav
        aria-label="Atalhos"
        className="sem-print fixed inset-x-0 bottom-0 z-40 flex border-t border-linha bg-superficie pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {NAV_PRINCIPAL.map((item) => {
          const ativo = item.href === "/" ? caminho === "/" : caminho.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={ativo ? "page" : undefined} className={classe(ativo)}>
              <Icone nome={item.icone} />
              {item.rotulo}
            </Link>
          );
        })}
        <button type="button" className={classe(false)} onClick={() => dialogo.current?.showModal()}>
          <Icone nome="menu" />
          Menu
        </button>
      </nav>

      <dialog
        ref={dialogo}
        aria-label="Menu completo"
        className="m-0 mt-auto w-full max-w-none rounded-t-3xl border-0 bg-superficie p-4 pb-8 text-tinta backdrop:bg-black/50"
        onClick={(e) => {
          if (e.target === dialogo.current) dialogo.current?.close();
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="font-display text-lg font-black">Menu</p>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl"
            aria-label="Fechar menu"
            onClick={() => dialogo.current?.close()}
          >
            <Icone nome="fechar" />
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {NAV_COMPLETA.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => dialogo.current?.close()}
                className="flex h-full min-h-20 flex-col gap-1 rounded-2xl bg-superficie-2 p-3 no-underline"
              >
                <Icone nome={item.icone} className="text-laranja-forte" />
                <span className="text-sm font-bold leading-tight">{item.rotulo}</span>
                <span className="text-xs text-tinta-2">{item.resumo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
