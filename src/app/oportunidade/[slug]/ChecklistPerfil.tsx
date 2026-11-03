"use client";

import { useId, useState } from "react";

export function ChecklistPerfil({ itens }: { itens: string[] }) {
  const [marcados, setMarcados] = useState<number[]>([]);
  const prefixo = useId();
  const tudo = marcados.length === itens.length;

  return (
    <div>
      <ul className="flex flex-col gap-1">
        {itens.map((texto, i) => (
          <li key={i}>
            <label htmlFor={`${prefixo}-${i}`} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-superficie-2">
              <input
                id={`${prefixo}-${i}`}
                type="checkbox"
                checked={marcados.includes(i)}
                onChange={() => setMarcados((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))}
                className="mt-0.5 size-5 shrink-0 accent-[var(--laranja)]"
              />
              <span className="text-sm">{texto}</span>
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className={`mt-2 rounded-xl p-2.5 text-sm font-bold ${tudo ? "bg-[var(--ok-fundo)] text-[var(--ok-tinta)]" : "text-tinta-2"}`}>
        {tudo ? "Parece a sua cara! Confira o regulamento e fale com a escola." : `${marcados.length} de ${itens.length} marcados`}
      </p>
    </div>
  );
}
