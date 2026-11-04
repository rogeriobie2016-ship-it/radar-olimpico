# Radar Olímpico

Site da SEDUC Ceará (COPES) com olimpíadas do conhecimento, feiras científicas e oportunidades para estudantes da rede pública estadual.

**Site:** https://rogeriobie2016-ship-it.github.io/radar-olimpico/

---

## Para a equipe COPES: como atualizar todo mês

Você não precisa saber programar nem instalar nada. Tudo é feito no navegador, aqui no GitHub. Quando você salva, o site confere os dados e se atualiza sozinho em cerca de 3 minutos.

Antes da primeira vez: crie uma conta no GitHub e peça a quem administra este repositório para adicionar você em **Settings > Collaborators**.

### Atualizar um prazo (o caso mais comum)

1. Abra o arquivo [`data/oportunidades.json`](data/oportunidades.json).
2. Clique no **lápis** (Edit this file), no canto superior direito.
3. Aperte `Ctrl + F` e busque o nome ou a sigla. Exemplo: `"id": "obmep"`.
4. Altere estas linhas do item:

```json
"inscricoes": { "inicio": null, "fim": "2026-12-15" },
"fonte": "Radar Novembro 2026, p. 3; Catálogo 2026, p. 18",
"atualizadoEm": "2026-11-20",
```

5. Clique em **Commit changes**, escreva o que mudou (exemplo: `Radar de novembro: prazo da OBMEP`) e confirme.
6. Em [`data/meta.json`](data/meta.json), atualize `ultimaEdicaoRadar` e `ultimaEdicaoRadarData`. É o que aparece nos avisos do site.

Pronto. O status (Aberto, Fecha em N dias, Encerrado) é calculado sozinho a partir da data.

### Regras de ouro

- **Datas sempre em `AAAA-MM-DD`.** 15 de dezembro de 2026 é `2026-12-15`.
- **Não sabe a informação? Use `null` (sem aspas).** Nunca invente. O site mostra o selo "a confirmar".
- **Texto sempre entre aspas, com vírgula no fim da linha**, igual às linhas vizinhas.
- **Não use travessão** (— ou –). Use vírgula, dois-pontos ou parênteses. O sistema recusa o arquivo se tiver travessão.
- Quando um dado for confirmado, tire o nome dele da lista `camposAConfirmar`. Se a lista ficar vazia (`[]`), mude `aConfirmar` para `false`.

### Adicionar uma oportunidade nova

Copie este modelo e cole logo depois de um `},` no meio da lista:

```json
{
  "id": "minha-olimpiada",
  "slug": "minha-olimpiada",
  "nome": "Olimpíada Exemplo",
  "sigla": "OEX",
  "tipo": "olimpiada",
  "organizador": null,
  "areas": ["Matemática"],
  "publico": { "texto": "Estudantes do Ensino Médio.", "series": ["1EM", "2EM", "3EM"] },
  "modalidade": null,
  "participacao": "individual",
  "nivel": "nacional",
  "formato": "prova",
  "custo": { "tipo": "gratuito", "observacao": null },
  "descricao": "Uma ou duas frases sobre a olimpíada.",
  "objetivo": null,
  "observacoes": null,
  "inscricoes": { "inicio": null, "fim": "2026-12-15" },
  "provas": [{ "fase": "Primeira fase", "data": "2027-03-10" }],
  "linkOficial": "https://exemplo.org/",
  "comoParticipar": ["Veja regulamento, datas e inscrição no site oficial."],
  "desbloqueia": [],
  "credenciaPara": [],
  "financiavelJOC": true,
  "fonte": "Radar Novembro 2026, p. 4",
  "aConfirmar": true,
  "camposAConfirmar": ["modalidade"],
  "atualizadoEm": "2026-11-20"
},
```

O `id` e o `slug` devem ser iguais, únicos, com letras minúsculas sem acento e hífen. O `slug` vira o endereço da página.

### Valores permitidos

| Campo | Pode ser |
| --- | --- |
| `tipo` | `olimpiada`, `feira`, `evento`, `programa`, `bolsa`, `intercambio` |
| `nivel` | `escolar`, `regional`, `estadual`, `nacional`, `internacional` |
| `modalidade` | `online`, `presencial`, `hibrida`, `null` |
| `participacao` | `individual`, `grupo`, `individual-ou-grupo`, `null` |
| `formato` | `prova`, `projeto` |
| `custo.tipo` | `gratuito`, `pago`, `valor`, `null` |
| `publico.series` | `EF-iniciais`, `6EF`, `7EF`, `8EF`, `9EF`, `1EM`, `2EM`, `3EM`, `TEC`, `EJA` |
| `desbloqueia[].tipo` | `medalha`, `vaga-olimpica`, `bolsa`, `credenciamento` |
| `credenciaPara` | Lista de `id` de outros itens. É o que desenha a Escada |
| `areas` | `Matemática`, `Ciências da Natureza`, `Ciências Humanas e Sociais Aplicadas`, `Linguagens e Códigos`, `Tecnologia e Computação`, `Meio Ambiente`, `Educação Financeira e Gestão`, `Multidisciplinar` |

### Ceará Científico e JOC

- **Ganhadores, projetos, categorias, revista:** [`data/ceara-cientifico.json`](data/ceara-cientifico.json). Cada ganhador entra na lista `ganhadores`:

```json
{ "ano": 2025, "categoria": "Linguagens", "crede": "CREDE 1", "escola": "EEMTI Exemplo", "projeto": "Nome do projeto", "colocacao": "1º lugar", "municipio": "Maracanaú" }
```

- **Capa da revista:** envie a imagem para `public/revista/` (Add file > Upload files), e preencha `"capa": "/revista/nome.webp"` e `"link"`.
- **Regras do JOC, prazos, matriz de pontos:** [`data/joc.json`](data/joc.json). Mudou o Regulamento? Atualize aqui e peça para gerar de novo o checklist em PDF (`scripts/gerar_checklist_pdf.py`).

### Salvei. Como sei se deu certo?

1. Abra a aba [**Actions**](../../actions). Sua alteração aparece no topo.
2. **Bolinha verde:** publicado. Atualize o site no celular.
3. **X vermelho:** o site antigo continua no ar e nada quebrou. Clique no item, depois em `build` e em **Validar e gerar o site**. O erro aparece em português, com o item e o campo:

```
✗ oportunidades.json (item "Olimpíada Exemplo"), campo inscricoes.fim: use o formato AAAA-MM-DD
```

Corrija o arquivo e salve de novo. Para desfazer de vez: abra o arquivo, clique em **History**, escolha a versão anterior.

### Novidades automáticas

Todo dia, um robô abre os sites oficiais e registra o que mudou em [`data/novidades.json`](data/novidades.json). Toda semana, uma pesquisa na web procura olimpíadas novas. O site mostra o selo NOVIDADE, com trecho e link da fonte.

- **Você não precisa fazer nada.** O que o robô encontra é sempre marcado como detecção automática.
- **Confirmou um prazo?** Passe a data para `oportunidades.json`, como no passo a passo acima.
- **Novidade errada?** Apague o bloco dela em `novidades.json`.
- **Quer publicar um aviso seu?** Copie um bloco, use `"origem": "copes"` e `"verificado": true`.

Acompanhe em [**Actions**](../../actions), no item **Monitorar sites oficiais**.

### Logos e mascotes

- **Logos das olimpíadas:** ficam em `public/olimpiadas/<id>.webp`, com o mesmo `id` de `oportunidades.json`. Para acrescentar um logo que falta, envie o arquivo com esse nome e inclua o `id` em `src/lib/logos.ts`.
- **Mascotes:** os dois estudantes do logo JOC, recortados da ilustração oficial por `scripts/recortar_mascotes.py`, são animados em `src/components/Mascote.tsx`. As falas do guia ficam em `src/components/GuiaFlutuante.tsx` e `src/app/escada/EscadaCliente.tsx`.

### Laboratório Vivo

- **Olimpíadas de cada equipamento:** em `src/lab/estacoes.ts`, na lista `olimpiadas` de cada um, usando os mesmos `id` de `oportunidades.json`.
- **Mundo Afora:** mostra sozinho tudo que tem `"nivel": "internacional"`. Bolsas, intercâmbios e feiras entram igual a qualquer item, com `"tipo": "bolsa"`, `"intercambio"` ou `"feira"`.
- **Instagram e idioma:** campos opcionais em `oportunidades.json`. Use `"instagram"` só com link conferido e `"idiomas": ["Inglês"]` quando o idioma for exigido.

### Testar como o site fica em outra data

Acrescente `?hoje=2026-12-10` ao endereço (exemplo: `.../radar/?hoje=2026-12-10`). Só muda na sua tela, e serve para conferir os status antes de divulgar.

---

## Para quem desenvolve

Next.js (App Router, exportação estática), TypeScript, Tailwind CSS, Framer Motion e Zod. Sem backend.

```bash
npm install
npm run dev       # http://localhost:3210/radar-olimpico/
npm run validar   # confere os JSON de /data
npm run testar    # regras da Escada Olímpica e conteúdo dos jogos
npm run build     # valida, gera imagens de compartilhamento e exporta para out/
npm run preview   # serve out/ como no GitHub Pages, em http://localhost:3211/radar-olimpico/
```

- **Monitor:** `scripts/monitorar-sites.mjs` roda todo dia via `.github/workflows/monitor.yml`.
- **Deploy:** todo push na `main` publica via `.github/workflows/deploy.yml`. Para outro repositório ou domínio, defina `BASE_PATH` e `NEXT_PUBLIC_SITE_URL`.
- **`materiais/`** (PDFs originais, 430 MB) fica fora do Git. `scripts/extrair_dados.py` fez a carga inicial e não deve rodar de novo: ele sobrescreveria as edições feitas à mão.
- **Decisões e dúvidas sobre os documentos:** [`DECISOES.md`](DECISOES.md). **Relatório da extração:** [`data/RELATORIO-EXTRACAO.md`](data/RELATORIO-EXTRACAO.md).
