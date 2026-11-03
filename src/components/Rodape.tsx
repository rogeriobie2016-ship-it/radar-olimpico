import Link from "@/components/L";
import { asset } from "@/lib/base";

export function Rodape() {
  return (
    <footer className="mt-16 border-t border-linha bg-superficie-2 pb-24 lg:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/logos/seduc.webp")}
          alt="Governo do Estado do Ceará, Secretaria da Educação"
          width={136}
          height={45}
          loading="lazy"
          className="logo-seduc"
        />
        <div className="text-sm text-tinta-2">
          <p>Coordenadoria de Protagonismo Estudantil e Educação Complementar (COPES).</p>
          <p>
            Datas e regras podem mudar: confirme sempre no site oficial de cada evento.{" "}
            <Link href="/joc/" className="font-semibold underline">
              Financiamento JOC
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
