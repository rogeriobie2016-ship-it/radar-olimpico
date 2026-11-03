import Link from "@/components/L";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <p className="font-display text-6xl font-black text-laranja-forte">404</p>
      <h1 className="text-2xl font-black">Essa página saiu do radar</h1>
      <p className="text-tinta-2">O link pode estar antigo. Que tal procurar no catálogo?</p>
      <Link href="/radar/" className="btn btn-primario">Ir para o Radar</Link>
    </div>
  );
}
