"use client";

import { useId, useState } from "react";

export function ChecklistPerfil({ itens }: { itens: string[] }) {
  const [marcados, setMarcados] = useState<number[]>([]);
  const prefixo = useId();
  const tudo = marcados.length === itens.length;
  return (
    <div>
      <ul>
        {itens.map((texto, i) => (
          <li key={i} className="border-b border-linha">
            <label htmlFor={`${prefixo}-${i}`} className="flex min-h-12 cursor-pointer items-start gap-3 py-3">
              <input
                id={`${prefixo}-${i}`}
                type="checkbox"
                checked={marcados.includes(i)}
                onChange={() => setMarcados((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))}
                className="marcar"
              />
              <span className="text-[0.9375rem]">{texto}</span>
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className={`mt-3 text-[0.9375rem] font-semibold ${tudo ? "text-ok" : "text-tinta-2"}`}>
        {tudo ? "Perfil compatível. Confira o regulamento e fale com a escola." : `${marcados.length} de ${itens.length} itens`}
      </p>
    </div>
  );
}
