// Gera uma imagem de compartilhamento para cada oportunidade em public/og/.
// Roda antes do build, então imagem e dados nunca ficam diferentes.
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

const fonte = (peso: number) => readFileSync(join(raiz, `node_modules/@fontsource/archivo/files/archivo-latin-${peso}-normal.woff`));
const fontes = [
  { name: "Archivo", data: fonte(500), weight: 500 as const, style: "normal" as const },
  { name: "Archivo", data: fonte(800), weight: 800 as const, style: "normal" as const },
];
const logoJoc = `data:image/png;base64,${readFileSync(join(raiz, "public/logos/joc-laranja.png")).toString("base64")}`;

function Cartao({ titulo, sobre, rodape, marca = "#f58a33" }: { titulo: string; sobre: string; rodape: string; marca?: string }) {
  const tam = titulo.length > 62 ? 56 : titulo.length > 34 ? 72 : titulo.length > 14 ? 96 : 150;
  return (
    <div style={{ width: 1200, height: 630, display: "flex", background: "#0b0b0a", color: "#f3f3ef", fontFamily: "Archivo", padding: "56px 64px", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: marca }}>{sobre}</div>
        <div style={{ display: "flex", background: "#fff", padding: 10 }}>
          <img src={logoJoc} width={190} height={118} alt="" />
        </div>
      </div>
      <div style={{ display: "flex", fontSize: tam, fontWeight: 800, lineHeight: 1, letterSpacing: -2, maxWidth: 1040 }}>{titulo}</div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #f3f3ef", paddingTop: 20, fontSize: 28, fontWeight: 500 }}>
        <span>{rodape}</span>
        <span style={{ fontWeight: 800 }}>Radar Olímpico</span>
      </div>
    </div>
  );
}

async function gerar(nome: string, el: React.ReactElement) {
  const svg = await satori(el, { width: 1200, height: 630, fonts: fontes });
  writeFileSync(join(destino, `${nome}.png`), new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng());
}

async function principal() {
  await gerar("padrao", <Cartao titulo="Radar Olímpico" sobre="SEDUC Ceará" rodape="Olimpíadas, feiras e oportunidades da rede estadual" />);
  for (const o of lista) {
    const prazo = o.inscricoes.fim ? `Inscrições até ${dataExtenso(o.inscricoes.fim)}` : "Prazos, público e como participar";
    await gerar(
      o.slug,
      <Cartao titulo={o.sigla && o.sigla.length <= 9 ? o.sigla : o.nome} sobre={`${ROTULO_TIPO[o.tipo]}, ${ROTULO_NIVEL[o.nivel].toLowerCase()}`} rodape={prazo} marca={o.slug === "ceara-cientifico" ? "#4bd68c" : "#f58a33"} />,
    );
  }
  console.log(`✓ ${lista.length + 1} imagens de compartilhamento em public/og/`);
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
