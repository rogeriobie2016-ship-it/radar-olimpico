"use client";

import { useState } from "react";
import { Carrossel } from "@/components/Carrossel";
import { LinkExterno } from "@/components/estudos/Cabecalho";
import { Seta } from "@/components/Seta";
import { TIPOS_CULTURA, type ItemCultura } from "@/lib/schema";

const NOMES: Record<ItemCultura["tipo"], string> = {
  filme: "Filmes",
  documentario: "Documentários",
  livro: "Livros",
  podcast: "Podcasts",
  canal: "Canais",
  lugar: "Lugares para visitar",
};

function Cartao({ item }: { item: ItemCultura }) {
  const selos = [
    item.dominioPublico ? "Domínio público" : item.gratuito === true ? "Gratuito" : item.gratuito === false ? "Pago ou por assinatura" : "Preço a confirmar",
    item.ceara ? "Ceará" : null,
  ].filter(Boolean);
  return (
    <article className="est-vidro est-cultura">
      {item.imagem && (
        <figure className="est-cultura-img">
          {/* Imagem de domínio público, servida pela própria fonte registrada em data/estudos/cultura.json. */}
          {/* crossOrigin anônimo: sem isso, a imagem externa grava cookie de terceiros no aparelho do estudante. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imagem.src} alt={item.imagem.alt} width={item.imagem.largura} height={item.imagem.altura} loading="lazy" decoding="async" referrerPolicy="no-referrer" crossOrigin="anonymous" />
          <figcaption className="est-meta">
            <LinkExterno href={item.imagem.fonte}>{item.imagem.licenca}</LinkExterno>
          </figcaption>
        </figure>
      )}
      <h3 className="est-cartao-titulo">{item.titulo}</h3>
      <p className="est-meta">
        {item.autoria}
        {item.ano ? `. ${item.ano}` : ""}
      </p>
      <p className="est-texto">{item.descricao}</p>
      <p className="est-meta">{selos.join(" · ")}</p>
      {item.classificacao && (
        <p className="est-meta">
          Classificação: <LinkExterno href={item.classificacao.url}>{item.classificacao.texto}</LinkExterno>
        </p>
      )}
      {item.nota && <p className="est-meta">{item.nota}</p>}
      <LinkExterno href={item.link.url} className="est-botao est-botao-sec mt-auto self-start">
        {item.link.rotulo}
        <Seta direcao="externo" tamanho={16} />
      </LinkExterno>
    </article>
  );
}

export function CulturaCliente({ itens }: { itens: ItemCultura[] }) {
  const [gratis, setGratis] = useState(false);
  const [ceara, setCeara] = useState(false);

  const visiveis = itens.filter((i) => (!gratis || i.gratuito === true) && (!ceara || i.ceara));

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros">
          <button type="button" className="est-chip" aria-pressed={gratis} onClick={() => setGratis(!gratis)}>
            Só gratuitos
          </button>
          <button type="button" className="est-chip" aria-pressed={ceara} onClick={() => setCeara(!ceara)}>
            Só Ceará
          </button>
        </div>
        <p className="est-meta" aria-live="polite">
          {visiveis.length} {visiveis.length === 1 ? "dica" : "dicas"}
        </p>
      </div>

      {TIPOS_CULTURA.map((t) => {
        const deste = visiveis.filter((i) => i.tipo === t);
        if (!deste.length) return null;
        return (
          <section key={t} aria-labelledby={`tipo-${t}`} className="flex flex-col gap-5">
            <h2 id={`tipo-${t}`} className="est-secao">{NOMES[t]}</h2>
            <Carrossel rotulo={NOMES[t]} classe="gap-3 pb-1">
              {deste.map((i) => (
                <Cartao key={i.id} item={i} />
              ))}
            </Carrossel>
          </section>
        );
      })}

      {visiveis.length === 0 && <p className="est-vidro est-nota est-aviso">Nada com esses filtros. Tire um deles para ver mais.</p>}
    </>
  );
}
