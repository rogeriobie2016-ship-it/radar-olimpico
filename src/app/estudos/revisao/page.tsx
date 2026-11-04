import type { Metadata } from "next";
import { Cabecalho } from "@/components/estudos/Cabecalho";
import { baralhos } from "@/lib/estudos";
import { RevisaoCliente } from "./RevisaoCliente";

export const metadata: Metadata = {
  title: "Baralhos de revisão",
  description: "Cartões com repetição espaçada simples, prontos ou feitos por você. Tudo salvo só no seu aparelho.",
};

export default function RevisaoPagina() {
  return (
    <div className="est-ambiente">
      <div className="est-pagina est-pagina-estreita">
        <Cabecalho titulo="Baralhos" frase="Tente lembrar antes de virar. Acertou, a carta volta mais tarde. Errou, volta amanhã." />
        <RevisaoCliente prontos={baralhos} />
        <p className="est-nota">Os intervalos (1, 2, 4, 8 e 16 dias) são uma regra simples que escolhemos. A pesquisa apoia espaçar a revisão, mas não define estes números. Tudo fica só neste aparelho: limpar os dados do navegador apaga o seu progresso.</p>
      </div>
    </div>
  );
}
