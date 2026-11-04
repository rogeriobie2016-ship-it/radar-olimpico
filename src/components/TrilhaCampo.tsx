import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { hrefJogos, hrefRadar, type Campo } from "@/lib/campos";
import { JOGOS } from "@/lib/jogos";

type Porta = "olimpiadas" | "jogos" | "estudos";

/** Os títulos dos jogos entram na própria porta: quem lê já sabe o que vai encontrar. */
function nomesDosJogos(c: Campo) {
  const nomes = c.jogos.map(([s]) => JOGOS.find((j) => j.slug === s)?.titulo).filter(Boolean);
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}` : (nomes[0] ?? "");
}

function portas(c: Campo, atual: Porta) {
  return [
    { porta: "olimpiadas", href: hrefRadar(c), titulo: c.rotuloRadar, texto: "Veja o que tem aberto no Radar." },
    { porta: "jogos", href: hrefJogos(c), titulo: c.rotuloJogos, texto: nomesDosJogos(c) },
    { porta: "estudos", href: c.estudo, titulo: c.rotuloEstudo, texto: c.areaEstudo ? "Por onde começar e materiais gratuitos." : "Técnicas de estudo com pesquisa por trás." },
  ].filter((p) => p.porta !== atual);
}

/** De uma olimpíada para o jogo e o estudo do mesmo campo, e de volta. */
export function TrilhaCampo({ campo, atual }: { campo: Campo; atual: Porta }) {
  return (
    <nav aria-label={`Continue em ${campo.titulo}`} className="flex flex-col gap-2.5">
      <p className="flex items-center gap-2 text-[0.9375rem] font-bold">
        <span aria-hidden="true" className="ponto-campo" style={{ background: campo.cor }} />
        Continue em {campo.titulo}
      </p>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {portas(campo, atual).map((p) => (
          <li key={p.porta}>
            <Link href={p.href} className="cartao-vidro flex h-full items-center justify-between gap-3 p-4 no-underline">
              <span className="flex min-w-0 flex-col gap-1">
                <span className="estreito text-[1.2rem] leading-tight">{p.titulo}</span>
                <span className="text-[0.9375rem] leading-snug text-tinta-2">{p.texto}</span>
              </span>
              <Seta className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Versão em lista, para a coluna estreita da ficha. */
export function TrilhaCampoLista({ campos }: { campos: Campo[] }) {
  return (
    <ul>
      {campos.flatMap((c) =>
        portas(c, "olimpiadas").map((p) => (
          <li key={c.id + p.porta}>
            <Link href={p.href} className="linha-lista flex items-center justify-between gap-3 py-3 no-underline">
              <span className="min-w-0">
                <span className="estreito block text-[1.25rem] font-bold leading-tight">{p.titulo}</span>
                <span className="mt-1 block text-sm text-tinta-2">{p.texto}</span>
              </span>
              <Seta className="shrink-0" />
            </Link>
          </li>
        )),
      )}
      {campos.map((c) => (
        <li key={c.id + "radar"}>
          <Link href={hrefRadar(c)} className="linha-lista flex items-center justify-between gap-3 py-3 no-underline">
            <span className="estreito block text-[1.25rem] font-bold leading-tight">{c.rotuloRadar}</span>
            <Seta className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
