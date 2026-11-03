"use client";

import Link from "@/components/L";
import { usePathname } from "next/navigation";
import { AlternarTema } from "./AlternarTema";
import { Icone } from "./Icone";
import { asset } from "@/lib/base";
import { NAV_COMPLETA } from "@/lib/navegacao";

export function Cabecalho() {
  const caminho = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-papel/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-display text-lg font-black no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/icons/favicon-48.png")} alt="" width={36} height={36} className="rounded-lg" />
          <span>Radar Olímpico</span>
        </Link>
        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_COMPLETA.slice(0, 7).map((item) => {
            const ativo = caminho.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`rounded-lg px-2.5 py-2 text-sm font-semibold no-underline hover:bg-superficie-2 ${ativo ? "bg-laranja-suave" : ""}`}
              >
                {item.rotulo.replace(": financiamento", "").replace(" sua olimpíada", "")}
              </Link>
            );
          })}
          <Link href="/minha-lista/" aria-label="Minha lista" className="grid size-11 place-items-center rounded-xl hover:bg-superficie-2">
            <Icone nome="lista" />
          </Link>
        </nav>
        <div className="ml-auto lg:ml-0">
          <AlternarTema />
        </div>
      </div>
    </header>
  );
}
