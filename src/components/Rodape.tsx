import Link from "./L";
import { RodapeTema } from "./Navegacao";
import { asset } from "@/lib/base";
import { NAV_COMPLETA } from "@/lib/navegacao";

export function Rodape() {
  return (
    <footer className="regua mx-auto mt-20 max-w-6xl px-4 pb-24 pt-8 lg:pb-10">
      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logos/seduc.webp")} alt="Governo do Estado do Ceará, Secretaria da Educação" width={148} height={49} loading="lazy" className="logo-seduc" />
          <p className="max-w-md text-[0.9375rem] text-tinta-2">
            Coordenadoria de Protagonismo Estudantil e Educação Complementar (COPES). Datas e regras podem mudar. Confirme sempre no site oficial de cada evento.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-[0.9375rem]">
          {NAV_COMPLETA.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="link inline-block py-1 no-underline">
                {n.rotulo}
              </Link>
            </li>
          ))}
          <li>
            <RodapeTema />
          </li>
        </ul>
      </div>
    </footer>
  );
}
