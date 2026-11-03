// Gera uma imagem de compartilhamento (WhatsApp, Instagram) para cada oportunidade em public/og/.
// Roda sozinho antes do build, então imagem e dados nunca ficam diferentes.
/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { ROTULO_NIVEL, ROTULO_TIPO, dataExtenso } from "../src/lib/rotulos";
import { oportunidadesSchema } from "../src/lib/schema";

const raiz = process.cwd();
const lista = oportunidadesSchema.parse(JSON.parse(readFileSync(join(raiz, "data/oportunidades.json"), "utf-8")));
const destino = join(raiz, "public/og");
mkdirSync(destino, { recursive: true });

const fonte = (peso: number) => readFileSync(join(raiz, `node_modules/@fontsource/montserrat/files/montserrat-latin-${peso}-normal.woff`));
const fontes = [
  { name: "Montserrat", data: fonte(600), weight: 600 as const, style: "normal" as const },
  { name: "Montserrat", data: fonte(900), weight: 900 as const, style: "normal" as const },
];
const logoJoc = `data:image/png;base64,${readFileSync(join(raiz, "public/logos/joc-laranja.png")).toString("base64")}`;

function Cartao({ titulo, sobre, rodape, fundo = "#f58a33" }: { titulo: string; sobre: string; rodape: string; fundo?: string }) {
  const tam = titulo.length > 62 ? 54 : titulo.length > 38 ? 66 : 80;
  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: fundo, padding: 36, fontFamily: "Montserrat", color: "#24170e" }}>
      <div style={{ flex: 1, display: "flex", background: "#fffaf3", borderRadius: 40, padding: "48px 52px", gap: 28 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#a84a08" }}>{sobre}</div>
          <div style={{ display: "flex", fontSize: tam, fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5 }}>{titulo}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>{rodape}</div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 900, color: "#a84a08" }}>Radar Olímpico · SEDUC Ceará</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", width: 330 }}>
          <img src={logoJoc} width={330} height={205} alt="" />
        </div>
      </div>
    </div>
  );
}

async function gerar(nome: string, el: React.ReactElement) {
  const svg = await satori(el, { width: 1200, height: 630, fonts: fontes });
  writeFileSync(join(destino, `${nome}.png`), new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng());
}

async function principal() {
  await gerar(
    "padrao",
  <Cartao titulo="Sua próxima medalha está no radar" sobre="Olimpíadas, feiras e oportunidades" rodape="Para estudantes da rede estadual do Ceará" />,
);
for (const o of lista) {
  const prazo = o.inscricoes.fim ? `Inscrições até ${dataExtenso(o.inscricoes.fim)}` : "Veja prazos, público e como participar";
  await gerar(
    o.slug,
    <Cartao
      titulo={o.nome}
      sobre={`${ROTULO_TIPO[o.tipo]} ${ROTULO_NIVEL[o.nivel].toLowerCase()}${o.sigla && o.sigla.length < 10 ? ` · ${o.sigla}` : ""}`}
      rodape={prazo}
      fundo={o.slug === "ceara-cientifico" ? "#2e8f54" : "#f58a33"}
    />,
  );
}
console.log(`✓ ${lista.length + 1} imagens de compartilhamento em public/og/`);
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
