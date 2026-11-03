# Decisões do projeto (Radar Olímpico v0.1)

Registro das decisões tomadas sem perguntar, e das dúvidas para a COPES validar.

## Estrutura e design

- **Pasta do projeto:** `repos/radar-olimpico`. Os materiais não estavam no computador e foram baixados da pasta do Drive "JUVENTUDE OLÍMPICA DO CONHECIMENTO" (com autorização). `materiais/` fica fora do Git: são 430 MB.
- **Logo SEDUC:** não está na pasta "Logos Oficiais" do Drive. Usei o logo do Governo do Ceará/Secretaria da Educação que já estava no repositório do portfólio. Conferir se é a versão vigente.
- **Fontes:** Montserrat nos títulos (próxima do logo JOC) e fonte do sistema no corpo, para pesar pouco em 3G.
- **Paleta:** extraída dos logos. JOC: laranja `#F58A33`, turquesa `#00C9C8`, amarelo `#FDC13F`. Ceará Científico: verde `#2E8F54`, laranja `#F2763C`, grafite `#606062`. Laranja puro não passa AA como texto sobre branco: botões usam texto escuro sobre laranja e links usam laranja escurecido `#A84A08`.
- **Navegação:** barra inferior no celular com Início, Radar, Descubra, Minha lista e Menu.
- **TypeScript 5.9:** a versão 7 recém-lançada foi evitada por compatibilidade com o Next.

## Dados (Fase 2)

Relatório da extração em `data/RELATORIO-EXTRACAO.md`. Decisões:

- **Fontes usadas:** Catálogo 2026 (texto e links extraídos das páginas), Radar de Setembro e de Julho (QR Codes decodificados e abertos; os nomes de olimpíada que só aparecem como logo foram lidos nas imagens), Regulamento JOC 2026 e Tutorial do Portal.
- **Edição mais recente vale:** quando Radar e Catálogo divergem, vale o Radar mais novo, com aviso na ficha. A divergência fica em `observacoes` e o campo entra em `camposAConfirmar`.
- **Ano das datas:** os Radars trazem só dia e mês ("Até 19/08"). Assumi 2026, pelo ano das edições.
- **`inscricoes.inicio` é nulo em todos:** nenhum documento informa data de abertura. Por isso o status "Abre em breve" existe no código, mas hoje não aparece.
- **Campos a mais no schema:** `formato` (prova ou projeto, para o quiz), `participacao` (individual ou grupo; o Radar chama isso de "modalidade"), `descricao`, `objetivo`, `observacoes`, `camposAConfirmar` (diz exatamente o que falta). `publico` virou texto mais lista de séries, para filtrar. `custo` virou tipo mais observação.
- **`nivel`, `areas`, `series` e `formato` foram classificados por mim** a partir do texto de cada ficha e da seção do Catálogo (exemplo: "Cearense" = estadual). COPES deve revisar.
- **`aConfirmar`:** verdadeiro em todos os itens, porque nenhum tem data de prova. Mostrar o selo em todo cartão viraria ruído: o selo "a confirmar" aparece ao lado do campo que falta, e no cartão o status "Datas a confirmar" cumpre esse papel.
- **`financiavelJOC` (precisa de validação da COPES):** o Regulamento não traz lista de eventos financiáveis, só regras. Marquei `true` para tudo que está em fichas do Catálogo e nos Radares, sempre com o aviso de que depende de classificação para etapa final, orçamento e análise. Marquei `false` para os itens que só aparecem na lista da UFC.
- **"Vale vaga olímpica":** usei a lista oficial das p. 72 a 77 do Catálogo (olimpíadas aceitas no edital de ingresso da UFC). Itens dessa lista sem ficha própria entraram com dados mínimos.
- **`credenciaPara`:** só as ligações escritas nos documentos (GEPEMAC para OBM, OBMEP para OBM, OCQ para OBQ, OBA para OBAFOG). Destinos sem ficha (RoboCup, IOAI, MILSET global, Norte-Nordeste de Química) ficam em `desbloqueia`. A Escada ficará mais rica quando a COPES informar as outras ligações.
- **Correções de digitação do PDF:** "Estuantes", "Indiviual", "mostrandoa", "ensinoaprendizagem", "seletar", além de travessões trocados por vírgula. O conteúdo não foi reescrito.

## Dúvidas nos documentos

- **Regulamento 5.4:** o PDF escreve "Prioridade Alta" nas três faixas. O site mostra só A, B e C.
- **Regulamento 5.4:** a faixa A vai de 65 a 95, mas a pontuação máxima é 100 e somar todos os critérios dá 100. O simulador trata 100 como faixa A, com aviso.
- **Regulamento 6.2 e 6.5:** o item 6.2 diz "preferencialmente" Bradesco, Banco do Brasil e Caixa, e o 6.5 diz que não aceita contas de outros bancos. O site usa "de preferência" e avisa para confirmar com a CREDE.
- **Cadastro de 2026:** o cadastro de escolas (item 3.4) foi de 03/02 a 23/03/2026. O simulador pergunta se a escola está na lista, sem assumir nada.
- **Formulários:** a pasta do Drive tem "FORMULÁRIOS 2025". O Regulamento 2026 traz os anexos dentro do próprio PDF. O site aponta para o Regulamento 2026.
- **Radar de Setembro, p. 2:** OSCEAR com prazo 19/08, anterior à edição. Possível repetição do Radar de Julho.
- **Radar de Setembro, p. 8 e 9:** o QR da OBLI e o da ONE levam ao mesmo regulamento da ONE. O QR da OBLI parece errado.
- **Catálogo x Radar:** OBG, TBC e OBMF aparecem pagas no Catálogo e gratuitas no Radar.
- **Textos possivelmente copiados no Catálogo:** objetivo da OBG fala do Ceará, objetivo da ONC fala só de Física.
- **Catálogo com dados antigos:** MCEM aponta regulamento 2025, ONDA cita tema de 2023, OCI e ONFIL citam 2025, OBF aponta site de 2025.
