"use client";

import { tocar } from "@/lib/som";
import { useMemo, useState } from "react";
import { Fala } from "@/components/Fala";
import { Placar, type AoTerminar } from "./Molde";

type Fato = { ano: number; texto: string };

// Fatos de amplo consenso na historiografia. Datas conferidas em referências públicas.
export const FATOS: Fato[] = [
  { ano: 1500, texto: "Chegada da esquadra de Cabral ao litoral da Bahia" },
  { ano: 1549, texto: "Fundação de Salvador, primeira capital do Brasil" },
  { ano: 1630, texto: "Holandeses ocupam Pernambuco" },
  { ano: 1695, texto: "Morte de Zumbi dos Palmares" },
  { ano: 1726, texto: "Fortaleza é elevada à condição de vila" },
  { ano: 1789, texto: "Inconfidência Mineira" },
  { ano: 1808, texto: "Chegada da família real portuguesa ao Brasil" },
  { ano: 1817, texto: "Revolução Pernambucana" },
  { ano: 1822, texto: "Independência do Brasil" },
  { ano: 1824, texto: "Confederação do Equador, com participação do Ceará" },
  { ano: 1884, texto: "Ceará abole a escravidão, antes do restante do país" },
  { ano: 1888, texto: "Lei Áurea" },
  { ano: 1889, texto: "Proclamação da República" },
  { ano: 1897, texto: "Fim da Guerra de Canudos" },
  { ano: 1922, texto: "Semana de Arte Moderna, em São Paulo" },
  { ano: 1930, texto: "Rachel de Queiroz publica O Quinze" },
  { ano: 1932, texto: "Mulheres conquistam o direito ao voto no Código Eleitoral" },
  { ano: 1937, texto: "Início do Estado Novo" },
  { ano: 1943, texto: "Criação da Consolidação das Leis do Trabalho" },
  { ano: 1960, texto: "Inauguração de Brasília" },
  { ano: 1964, texto: "Golpe militar" },
  { ano: 1988, texto: "Promulgação da Constituição Cidadã" },
  { ano: 1994, texto: "Lançamento do Plano Real" },
  { ano: 2003, texto: "Lei torna obrigatório o ensino de história e cultura afro-brasileira" },
];

const TOTAL = 12;
const VIDAS = 3;

function embaralhar<T>(l: T[]) {
  const a = [...l];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LinhaDoTempo({ aoTerminar }: { aoTerminar: AoTerminar }) {
  const baralho = useMemo(() => embaralhar(FATOS).slice(0, TOTAL + 1), []);
  const [linha, setLinha] = useState<Fato[]>([baralho[0]]);
  const [i, setI] = useState(1);
  const [vidas, setVidas] = useState(VIDAS);
  const [pontos, setPontos] = useState(0);
  const [seq, setSeq] = useState(0);
  const [retorno, setRetorno] = useState<{ ok: boolean; texto: string } | null>(null);
  const [ultimo, setUltimo] = useState<number | null>(null);

  const fato = baralho[i];

  const colocar = (pos: number) => {
    if (retorno) return;
    const antes = linha[pos - 1]?.ano ?? -Infinity;
    const depois = linha[pos]?.ano ?? Infinity;
    const certo = fato.ano >= antes && fato.ano <= depois;
    tocar(certo ? "acerto" : "erro");
    const ganho = certo ? 10 + seq * 5 : 0;
    const total = pontos + ganho;
    const restam = certo ? vidas : vidas - 1;
    setPontos(total);
    setSeq(certo ? seq + 1 : 0);
    setVidas(restam);
    setUltimo(fato.ano);
    setLinha([...linha, fato].sort((a, b) => a.ano - b.ano));
    setRetorno({ ok: certo, texto: certo ? `Certo: ${fato.ano}.` : `Foi em ${fato.ano}.` });
    setTimeout(() => {
      setRetorno(null);
      if (restam <= 0 || i + 1 >= baralho.length) {
        aoTerminar(total, `Você ordenou ${i} fatos. Na ONHB, o foco é interpretar fontes e entender o contexto, mais do que decorar datas.`);
        return;
      }
      setI(i + 1);
    }, 1000);
  };

  const Vaga = ({ pos }: { pos: number }) => (
    <li>
      <button type="button" disabled={!!retorno} onClick={() => colocar(pos)} aria-label={pos === 0 ? "Colocar antes de tudo" : pos === linha.length ? "Colocar depois de tudo" : `Colocar entre ${linha[pos - 1].ano} e ${linha[pos].ano}`} className="group flex min-h-11 w-full items-center gap-3 text-sm text-[#a9c6d8] transition-colors hover:text-marca disabled:opacity-40">
        <span className="h-px flex-1 bg-[#1f4a68] transition-colors group-hover:bg-marca" />
        Colocar aqui
        <span className="h-px flex-1 bg-[#1f4a68] transition-colors group-hover:bg-marca" />
      </button>
    </li>
  );

  return (
    <>
      <Placar esquerda={`Fato ${i} de ${TOTAL}, ${vidas} ${vidas === 1 ? "chance" : "chances"}`} direita={pontos} />
      <div className="sticky top-14 z-10 border-b border-[#1f4a68] bg-[#071f33] p-4 sm:p-6">
        <p key={fato.ano} className="estreito entrada-pergunta text-[1.875rem] font-bold leading-[1.05]">{fato.texto}</p>
        <div className="mt-2 min-h-[4.25rem]"><Fala texto={retorno?.texto ?? "Em que ponto da linha isso aconteceu?"} pose={retorno ? (retorno.ok ? "comemora" : "triste") : "pensa"} tamanho={54} /></div>
      </div>
      <ol className="flex-1 px-4 py-2 sm:px-6">
        <Vaga pos={0} />
        {linha.map((f, p) => (
          <div key={f.ano} className="contents">
            <li className={`grid grid-cols-[3.75rem_1fr] items-baseline gap-2 py-1.5 ${ultimo === f.ano ? "entrada-peca" : ""}`}>
              <span className={`estreito num text-[1.5rem] font-bold leading-none ${ultimo === f.ano && retorno ? (retorno.ok ? "text-[#4bd68c]" : "text-[#ff8d50]") : ""}`}>{f.ano}</span>
              <span className="text-[0.9375rem] leading-snug">{f.texto}</span>
            </li>
            <Vaga pos={p + 1} />
          </div>
        ))}
      </ol>
    </>
  );
}
