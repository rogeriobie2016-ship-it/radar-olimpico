import type { Oportunidade } from "./schema";

export type Resumo = {
  id: string;
  slug: string;
  nome: string;
  sigla: string | null;
  tipo: Oportunidade["tipo"];
  areas: string[];
  series: Oportunidade["publico"]["series"];
  modalidade: Oportunidade["modalidade"];
  participacao: Oportunidade["participacao"];
  nivel: Oportunidade["nivel"];
  formato: Oportunidade["formato"];
  custo: Oportunidade["custo"]["tipo"];
  inicio: string | null;
  fim: string | null;
  provas: Oportunidade["provas"];
  financiavelJOC: boolean;
  vagaOlimpica: boolean;
  link: string | null;
  credenciaPara: string[];
  temFicha: boolean;
  novidade: string | null;
};
