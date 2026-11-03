import Link from "@/components/L";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-16">
      <h1>Página não encontrada</h1>
      <p className="max-w-md text-tinta-2">O endereço pode estar desatualizado. As oportunidades estão todas no catálogo.</p>
      <Link href="/radar/" className="btn btn-primario">
        Abrir o Radar
      </Link>
    </div>
  );
}
