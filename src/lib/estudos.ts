// Conteúdo da Biblioteca de Estudos, lido e validado no build. Se um JSON estiver errado, o site não publica.
import areasJson from "@data/estudos/areas.json";
import baralhosJson from "@data/estudos/baralhos.json";
import culturaJson from "@data/estudos/cultura.json";
import tecnicasJson from "@data/estudos/tecnicas.json";
import { oportunidades } from "./dados";
import { JOGOS } from "./jogos";
import { areasEstudoSchema, baralhosSchema, culturaSchema, problemasEstudos, tecnicasSchema } from "./schema";

export const tecnicas = tecnicasSchema.parse(tecnicasJson);
export const areasEstudo = areasEstudoSchema.parse(areasJson).areas;
export const cultura = culturaSchema.parse(culturaJson).itens;
export const baralhos = baralhosSchema.parse(baralhosJson).baralhos;

const problemas = problemasEstudos({ comentario: "", areas: areasEstudo }, new Set(oportunidades.map((o) => o.id)), new Set(JOGOS.map((j) => j.slug)));
if (problemas.length) throw new Error(`Biblioteca de Estudos: ${problemas.join("; ")}`);

export const ROTAS_ESTUDOS = ["/estudos/", "/estudos/como-estudar/", "/estudos/plano/", "/estudos/foco/", "/estudos/revisao/", "/estudos/cultura/", ...areasEstudo.map((a) => `/estudos/area/${a.slug}/`)];

export const fonteDe = (id: string) => tecnicas.fontes.find((f) => f.id === id);
