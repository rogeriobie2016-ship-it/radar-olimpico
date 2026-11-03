"use client";

import { Icone } from "./Icone";
import { useFavoritos } from "@/lib/favoritos";

export function BotaoSalvar({ id, nome, comTexto = false }: { id: string; nome: string; comTexto?: boolean }) {
  const { lista, alternar } = useFavoritos();
  const salvo = lista.includes(id);
  return (
    <button
      type="button"
      onClick={() => alternar(id)}
      aria-pressed={salvo}
      aria-label={comTexto ? undefined : `${salvo ? "Tirar da" : "Salvar na"} minha lista: ${nome}`}
      className={
        comTexto
          ? `btn w-full ${salvo ? "btn-turquesa" : "btn-secundario"}`
          : `relative z-10 grid size-11 shrink-0 place-items-center rounded-xl ${salvo ? "bg-turquesa text-[#06312f]" : "text-tinta-2 hover:bg-superficie-2"}`
      }
    >
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill={salvo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
        <path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-4-6 4v-16a1 1 0 0 1 1-1Z" />
      </svg>
      {comTexto && (salvo ? "Salvo na minha lista" : "Salvar na minha lista")}
      {comTexto && salvo && <Icone nome="check" tamanho={18} />}
    </button>
  );
}
