"use client";

import { useEffect, useState } from "react";
import { Icone } from "./Icone";

export function AlternarTema() {
  const [tema, setTema] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTema(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const alternar = () => {
    const novo = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    setTema(novo);
    try {
      localStorage.setItem("radar-tema", novo);
    } catch {
      /* navegador sem armazenamento: o tema vale só nesta visita */
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      className="grid size-11 place-items-center rounded-xl text-tinta hover:bg-superficie-2"
      aria-label={tema === "dark" ? "Usar modo claro" : "Usar modo escuro"}
    >
      <Icone nome={tema === "dark" ? "sol" : "lua"} />
    </button>
  );
}
