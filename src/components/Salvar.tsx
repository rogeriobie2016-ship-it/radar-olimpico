"use client";

import { useFavoritos } from "@/lib/favoritos";
import { carimbar } from "@/lib/guia";

/** Marcador de salvar. Na forma completa vira botão de largura total. */
export function Salvar({ id, nome, completo = false }: { id: string; nome: string; completo?: boolean }) {
  const { lista, alternar } = useFavoritos();
  const salvo = lista.includes(id);
  const trocar = () => {
    alternar(id);
    if (!salvo) carimbar("lista");
  };
  const marcador = (
    <svg aria-hidden="true" width="18" height="20" viewBox="0 0 18 20" fill={salvo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" style={{ transition: "fill 140ms" }}>
      <path d="M2 1.5h14v17l-7-4.6-7 4.6z" />
    </svg>
  );
  if (completo)
    return (
      <button type="button" onClick={trocar} aria-pressed={salvo} className="btn btn-secundario w-full">
        {marcador}
        {salvo ? "Salvo na minha lista" : "Salvar na minha lista"}
      </button>
    );
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        trocar();
      }}
      aria-pressed={salvo}
      aria-label={`${salvo ? "Remover da" : "Salvar na"} minha lista: ${nome}`}
      className={`relative z-10 grid size-11 place-items-center transition-transform duration-200 active:scale-75 ${salvo ? "text-amarelo" : "text-tinta-2"}`}
    >
      {marcador}
    </button>
  );
}
