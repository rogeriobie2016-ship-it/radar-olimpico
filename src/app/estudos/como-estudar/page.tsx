import type { Metadata } from "next";
import { Cabecalho, LinkExterno } from "@/components/estudos/Cabecalho";
import Link from "@/components/L";
import { Seta } from "@/components/Seta";
import { fonteDe, tecnicas } from "@/lib/estudos";

export const metadata: Metadata = {
  title: "Como estudar",
  description: "Recuperação ativa, repetição espaçada, intercalação, explicar para alguém, prova antiga e sono. O que a pesquisa diz, com a fonte de cada afirmação.",
};

export default function ComoEstudarPagina() {
  return (
    <div className="est-ambiente">
      <div className="est-pagina">
        <Cabecalho titulo="Como estudar" frase={tecnicas.introducao} />

        {tecnicas.tecnicas.map((t) => (
          <section key={t.id} id={t.id} aria-labelledby={`${t.id}-titulo`} className="est-vidro est-bloco">
            <h2 id={`${t.id}-titulo`} className="est-secao">{t.titulo}</h2>
            <p className="est-frase">{t.gancho}</p>

            <div className="est-duas">
              <div>
                <h3 className="est-rotulo">Como fazer</h3>
                <ol className="est-passos">
                  {t.passos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="est-rotulo">O que a pesquisa diz</h3>
                <ul className="est-achados">
                  {t.pesquisa.map((p) => (
                    <li key={p.texto}>
                      {p.texto}{" "}
                      <span className="est-cita">
                        (
                        {p.fontes.map((id, i) => {
                          const f = fonteDe(id);
                          return f ? (
                            <span key={id}>
                              {i > 0 && "; "}
                              <LinkExterno href={f.url}>{f.citacao}</LinkExterno>
                            </span>
                          ) : null;
                        })}
                        )
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {t.cuidado && <p className="est-nota">{t.cuidado}</p>}
            {t.ferramenta && (
              <Link href={t.ferramenta.href} className="est-botao est-botao-sec self-start">
                {t.ferramenta.rotulo}
                <Seta tamanho={16} />
              </Link>
            )}
          </section>
        ))}

        <section aria-labelledby="fontes" className="flex flex-col gap-5">
          <h2 id="fontes" className="est-secao">Fontes</h2>
          <ul className="est-fontes">
            {tecnicas.fontes.map((f) => (
              <li key={f.id}>
                <LinkExterno href={f.url}>{f.referencia}</LinkExterno>
              </li>
            ))}
          </ul>
          <p className="est-nota">Referências e resumos conferidos em 04/11/2026. Alguns artigos estão em inglês e nem todos são de acesso livre.</p>
        </section>
      </div>
    </div>
  );
}
