import Link from "@/components/L";
import { Seta } from "@/components/Seta";

/** Topo das páginas internas: volta para a biblioteca, título e uma frase. */
export function Cabecalho({ titulo, frase, voltar = true }: { titulo: string; frase: string; voltar?: boolean }) {
  return (
    <header className="flex flex-col gap-5">
      {voltar && (
        <Link href="/estudos/" className="est-voltar">
          <Seta direcao="esquerda" tamanho={16} />
          Biblioteca de Estudos
        </Link>
      )}
      <h1 className="est-titulo">{titulo}</h1>
      <p className="est-frase">{frase}</p>
    </header>
  );
}

export function LinkExterno({ href, children, className = "est-link" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

/** Fonte de uma afirmação: link externo ou página do próprio site. */
export function LinkFonte({ href, children }: { href: string; children: React.ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className="est-link">
      {children}
    </Link>
  ) : (
    <LinkExterno href={href}>{children}</LinkExterno>
  );
}
