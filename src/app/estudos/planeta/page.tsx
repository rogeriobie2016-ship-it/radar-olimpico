import type { Metadata } from "next";
import { CAMPOS, hrefJogos, hrefRadar } from "@/lib/campos";
import { areasEstudo, videos } from "@/lib/estudos";
import { IDIOMAS, PlanetaCliente, type EstantePlaneta } from "@/planeta/PlanetaCliente";

export const metadata: Metadata = {
  title: "Planeta Estante",
  description: "Jogo em 3D no navegador: ande por um pequeno planeta e assista a vídeos de matemática, linguagens, línguas, ciências, humanas, tecnologia e pesquisa nas estantes de cada região.",
};

// Cor clara pede letra escura na placa e nos botões.
const tintaDe = (cor: string) => {
  const n = parseInt(cor.slice(1), 16);
  const lin = (c: number) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  const l = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return l > 0.2 ? "#1d1836" : "#ffffff";
};

function montarEstantes(): EstantePlaneta[] {
  return CAMPOS.map((c) => {
    const area = areasEstudo.find((a) => a.slug === c.areaEstudo);
    return {
      id: c.id,
      titulo: c.titulo,
      cor: c.cor,
      tinta: tintaDe(c.cor),
      videos: videos
        .filter((v) => v.campo === c.id)
        .map((v) => ({ id: v.id, fonte: v.fonte, titulo: v.titulo, canal: v.canal, duracao: v.duracao, idioma: v.idioma, pagina: v.pagina ?? `https://www.youtube.com/watch?v=${v.id}` })),
      materiais: (area?.materiais ?? []).map((m) => ({ titulo: m.titulo, tipo: m.tipo, url: m.url })),
      ligacoes: [
        { href: hrefRadar(c), rotulo: c.rotuloRadar },
        { href: hrefJogos(c), rotulo: c.rotuloJogos },
        { href: c.estudo, rotulo: c.rotuloEstudo },
      ],
    };
  });
}

export default function PlanetaPagina() {
  const estantes = montarEstantes();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6">
      <PlanetaCliente estantes={estantes} />

      <section id="lista-videos" aria-labelledby="lista-titulo" className="flex scroll-mt-20 flex-col gap-7">
        <div>
          <h2 id="lista-titulo">Os vídeos das estantes</h2>
          <p className="mt-1.5 max-w-2xl text-tinta-2">Os mesmos vídeos do jogo, sem 3D. Cada um abre na página original.</p>
        </div>
        {estantes.map((e) => (
          <section key={e.id} id={e.id} aria-label={e.titulo} className="flex scroll-mt-20 flex-col gap-2">
            <h3 className="flex items-center gap-2.5">
              <span aria-hidden="true" className="ponto-campo" style={{ background: e.cor }} />
              {e.titulo}
            </h3>
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {e.videos.map((v) => (
                <li key={v.id}>
                  <a href={v.pagina} target="_blank" rel="noopener noreferrer" className="cartao-vidro flex h-full flex-col gap-1 p-4 no-underline">
                    <span className="estreito text-[1.1rem] leading-tight">{v.titulo}</span>
                    <span className="mt-auto pt-1 text-[0.875rem] text-tinta-2">
                      {v.canal}
                      {v.duracao ? `. ${v.duracao}` : ""}. {IDIOMAS[v.idioma]}.
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </div>
  );
}
