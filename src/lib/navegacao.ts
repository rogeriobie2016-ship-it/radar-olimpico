export const NAV_PRINCIPAL = [
  { href: "/", rotulo: "Início", icone: "inicio" },
  { href: "/radar/", rotulo: "Radar", icone: "radar" },
  { href: "/descubra/", rotulo: "Descubra", icone: "descubra" },
  { href: "/minha-lista/", rotulo: "Minha lista", icone: "lista" },
] as const;

export const NAV_COMPLETA = [
  { href: "/radar/", rotulo: "Radar", icone: "radar", resumo: "Todas as oportunidades" },
  { href: "/calendario/", rotulo: "Calendário", icone: "calendario", resumo: "Prazos por mês" },
  { href: "/descubra/", rotulo: "Descubra sua olimpíada", icone: "descubra", resumo: "Quiz rápido" },
  { href: "/escada/", rotulo: "Escada", icone: "escada", resumo: "Da escola ao mundo" },
  { href: "/ceara-cientifico/", rotulo: "Ceará Científico", icone: "ciencia", resumo: "A feira da rede" },
  { href: "/joc/", rotulo: "JOC: financiamento", icone: "joc", resumo: "Para escolas e professores" },
  { href: "/professores/", rotulo: "Para professores", icone: "professor", resumo: "Orientar e inscrever" },
  { href: "/minha-lista/", rotulo: "Minha lista", icone: "lista", resumo: "Seus favoritos" },
] as const;
