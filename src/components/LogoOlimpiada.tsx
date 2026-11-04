import { asset } from "@/lib/base";
import { COM_LOGO, PLACA_ESCURA } from "@/lib/logos";

const CORES = ["#f58a33", "#00c9c8", "#fdc13f"];

const cor = (id: string) => CORES[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 3];

/** Logo oficial sobre placa. Sem logo nos documentos, mostra só a sigla em um azulejo, sem imitar marca. */
export function LogoOlimpiada({ id, nome, sigla, className = "size-16", lazy = true }: { id: string; nome: string; sigla?: string | null; className?: string; lazy?: boolean }) {
  if (COM_LOGO.has(id))
    return (
      <span className={`placa ${PLACA_ESCURA.has(id) ? "placa-escura" : ""} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(`/olimpiadas/${id}.webp`)} alt={`Logo: ${nome}`} loading={lazy ? "lazy" : undefined} decoding="async" />
      </span>
    );
  return (
    <span className={`placa placa-sigla ${className}`} style={{ background: cor(id) }} aria-hidden="true">
      <span>{sigla ?? nome.replace(/^(Olimpíada|Prêmio|Torneio|Festival)( Brasileira| Nacional)?( d[aeo]s?)? ?/, "").split(" ")[0]}</span>
    </span>
  );
}
