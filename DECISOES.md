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

## Funcionalidades (Fases 3 e 4)

- **Sem prefetch automático de links:** o padrão do Next baixaria dados de cada cartão visível, ruim em 3G. Trocado por `src/components/L.tsx`.
- **Status recalculado no aparelho:** o HTML estático nasce com a data do build e o navegador recalcula ao abrir. `?hoje=AAAA-MM-DD` na URL simula outra data, para a equipe conferir.
- **Filtros na URL:** copiar o link leva a busca junto.
- **Filtro de modalidade e custo esconde itens sem dado; filtro de série não:** se a série não está informada, o item continua visível, para não tirar oportunidade de ninguém.
- **Animações:** entradas importantes usam CSS, para o conteúdo aparecer antes do JavaScript chegar em 3G. Framer Motion cuida de filtros, contadores, expansão da escada, quiz e moléculas. Sem animação de saída que trave a tela.
- **Quiz:** a resposta on-line ou presencial só pesa onde há dado. Eventos que dependem de convite ou classificação (exemplo: OBM) perdem pontos, porque o quiz é para quem está começando.
- **Escada:** o Ceará Científico aparece como três etapas ligadas. Os demais caminhos são só os escritos nos documentos.
- **Ceará Científico:** sem dados de ganhadores, projetos e revista. A galeria funciona e mostra um aviso até a COPES preencher `data/ceara-cientifico.json`. Os passos de "Como meu projeto chega lá" foram escritos a partir do briefing e do Regulamento, e devem ser revisados pela equipe.
- **Checklist JOC em PDF:** gerado por `scripts/gerar_checklist_pdf.py`, a partir de `data/joc.json`.
- **PDFs pesados:** Regulamento, Catálogo e Radar são links para o Drive da COPES, não ficam no site. Se a pasta mudar, atualizar `data/meta.json`.

## PWA, desempenho e acessibilidade (Fase 5)

- **Lighthouse no celular, servido com gzip local:** desempenho 100, acessibilidade 100, boas práticas 96 a 100, SEO 100 em Início, Radar, Oportunidade, Ceará Científico, JOC e Calendário. Vale repetir no site publicado.
- **PWA:** manifesto, ícones a partir da grade do logo JOC e service worker. Páginas usam rede primeiro, para os prazos estarem sempre frescos, com a última cópia como reserva sem internet. Testado: Radar abre sem internet; página nunca visitada cai na Início.
- **Open Graph:** uma imagem por oportunidade, gerada no build (`scripts/gerar-og.tsx`), fora do Git. São cerca de 12 MB no site, baixados só por quem compartilha.
- **Verde do Ceará Científico em áreas com texto branco:** `#257C48`, levemente mais escuro que o logo (`#2E8F54`), para passar AA.
- **Ordem padrão do Radar:** prazo; sem data, fichas completas vêm antes dos itens só listados.

## Publicação (Fase 6)

- **Repositório público** na conta `rogeriobie2016-ship-it`: o GitHub Pages gratuito exige isso em conta pessoal. Sem dados pessoais de estudantes. Para ficar sob conta institucional, é só transferir o repositório e ajustar `NEXT_PUBLIC_SITE_URL`.
- **Identidade visual oficial em site de teste:** o site usa logos da SEDUC e do JOC e está em conta pessoal. Antes de divulgar à rede, vale validar com a COPES e a comunicação, e avaliar um endereço oficial.

## Revisão de interface e novos recursos (03/11/2026)

Pedido: "tá com muito cara de IA", site premium, jogos por olimpíada, atualização automática, abertura em estilo streaming e a Escada Olímpica.

- **Interface refeita do zero.** Saíram papel creme, cartões com sombra, pílulas, faixa colorida na lateral, quadrados coloridos com número, ícones de linha, passos em círculos e slogans. Entraram branco, tinta, réguas finas, listas em vez de cartões, tipografia condensada (Archivo com eixo de largura) e texto direto.
- **Abertura em duas partes.** Primeiro uma sala escura com destaque em tela cheia e fileiras de cartazes, com prévia que sobe sem sair da página. Depois o radar interativo e as seções institucionais.
- **Cartazes sem fotos.** O site não tem banco de imagens. Cada cartaz é um desenho gerado do nome da olimpíada: cor pela área, forma pelo nome. Fotos reais podem substituir no futuro.
- **Radar interativo.** Cada oportunidade é um ponto: o anel é o nível, o setor é a área. Prazo aberto pisca em laranja.
- **Busca em tela cheia** em qualquer página (botão, Ctrl+K ou /). O índice só é baixado ao abrir a busca.

### Escada Olímpica

- **Referência:** o pedido cita a "Porta de Entrada da Brazil Conference". Não encontrei registro público nem material local descrevendo esse formato (só um vídeo). Interpretei como diagnóstico guiado que termina em recomendação pessoal. Vale ajustar se o original tiver outra lógica.
- **Duas camadas:** regras eliminatórias vêm primeiro (série, rede, convite, exclusivo para meninas, taxa) e nunca são compensadas por pontos. Depois vem a afinidade (interesse, formato, objetivo, experiência, tempo, escola).
- **Explicável:** cada recomendação diz por quê, traz alertas e mostra o que ficou de fora e o motivo.
- **Testada:** `npm run testar:escada` percorre 13.440 combinações de respostas e casos conferidos à mão. O deploy para se uma regra falhar.
- **Dificuldade (1, 2 ou 3) foi classificada por mim** em `src/lib/escada.ts`, a partir do texto das fichas. A COPES deve revisar, porque isso define em qual degrau cada olimpíada aparece.
- **Sem envio de dados:** tudo roda no aparelho. O link de compartilhar guarda só as respostas codificadas.

### Atualização automática

- **Monitor diário** (`.github/workflows/monitor.yml`, sem custo): abre os sites oficiais, compara com a visita anterior e registra novidades em `data/novidades.json`, com trecho e link. Publica sozinho.
- **Regra conservadora de prazo:** só vira prazo a frase com a palavra inscrição seguida de data futura com ano escrito. Sem ano, pode ser de edição antiga, e por isso é descartada. O primeiro teste pegou um falso positivo na FENECIT, e a regra foi corrigida.
- **O que a COPES preenche nunca é alterado.** Prazo detectado só aparece se for mais novo que o cadastrado, e a ficha mostra que foi detecção automática.
- **Limite conhecido:** na primeira varredura, 59 de 101 sites deram texto útil. Em 31 o conteúdo depende de JavaScript, e 15 falharam (bloqueio, 404, fora do ar). Para esses, vale a pesquisa semanal.
- **Pesquisa semanal na web:** rotina agendada do Claude que procura olimpíadas novas, abre as fontes e registra com `origem: "pesquisa"`. Depende da conta Claude de quem agendou. Para ficar institucional, a COPES precisaria de conta própria.
- **Selo NOVIDADE** nas fileiras, no Radar, na ficha e no cabeçalho, até a pessoa visitar a página de Novidades.
- **Olimpíada da Coruja:** entrou por pesquisa e não consta do Catálogo. É de uma empresa privada de cursos (Estratégia). A COPES deve decidir se ela fica no Radar.
- **Dados atualizados pela pesquisa de 03/11:** FEBRACE, ONIA, Quimeninas, OBAdm, MOCICA, TNBio, OBMF, OBG, TFM, OBLI, OBGP e OBBS, com a fonte registrada. Categorias e áreas do Ceará Científico vieram do resumo do regulamento 2026 da SEDUC, porque o PDF bloqueou a leitura direta (erro 403). Conferir com o documento.

### Jogos

- **Sete jogos:** Jornada Científica (Ceará Científico), Escada (catálogo), Alvo (OBMEP), Lançamento (OBA e OBAFOG), Algoritmo (OBI e OBR), Linha do Tempo (ONHB e OCHE) e Balanço (Química). Mecânicas de gênero, com conteúdo original.
- **Testados:** `npm run testar:jogos` confirma que toda fase do Algoritmo tem solução e que o limite anunciado é o mínimo real, que as equações equilibram e que os alvos são válidos.
- **Conteúdo escrito por mim precisa de revisão pedagógica:** decisões da Jornada Científica e fatos da Linha do Tempo.
- **Acessibilidade:** Alvo, Algoritmo, Linha do Tempo, Balanço e Jornada usam botões e funcionam por teclado. Escada aceita setas e botões, mas o desenho é visual. Lançamento tem controles deslizantes e o desenho também é visual.

### Pesquisa semanal (pendente)

As instruções estão em `scripts/rotina-pesquisa.md`, para a equipe poder ajustar sem recriar a rotina. O usuário escolheu rodar na nuvem. Para agendar, faltam a conexão do GitHub com a conta Claude e um ambiente de nuvem. Horário previsto: segundas, 7h em Fortaleza (10:00 UTC).

## Logos buscados na web (04/11/2026)

Os itens sem logo nos PDFs tiveram o logo buscado no site oficial e no perfil oficial do Instagram (`scripts/buscar_logos.mjs`) e escolhido a olho (`scripts/aplicar_logos.py`). O desenho não é alterado. Quando a olimpíada não publica logo próprio, aparece o da organização: é o caso de OBOs do NOIC, Programa Nacional Olimpíadas de Química, UFC na OCF e Correios nos concursos de cartas. A fonte de cada um está em `data/logos-fontes.json`. A COPES pode trocar qualquer um enviando o arquivo em `public/olimpiadas/<id>.webp`.

## Laboratório Vivo (04/11/2026)

Laboratório em 3D no navegador (`src/lab/`), sem headset: anda com joystick, teclado ou tocando no chão, e cada equipamento abre um experimento real que leva às olimpíadas daquele campo. Fica logo abaixo da landing, na página inicial, e também tem endereço próprio. Three.js só é baixado quando a pessoa entra, então o resto do site continua leve. Os estudantes em 3D foram modelados no próprio código, com as cores e proporções do logo e contorno branco de adesivo; no painel, o narrador continua sendo a ilustração oficial. Todos os experimentos existem também na versão sem 3D, para aparelho sem WebGL. As contas e dados dos experimentos ficam em `src/lab/estacoes.ts`, cobertos por `npm run testar:lab`.

## Órbita Numérica (04/11/2026)

Oitavo jogo: arcade de Matemática em pixel art, para treinar OBMEP e Canguru. A nave atravessa cinco fases (frações; porcentagem e razão; potências e sequências; geometria; raciocínio lógico com revisão) e cada uma termina num chefe.

- **Questões geradas:** ficam em `src/lib/estudo/orbita.ts`. Os números são sorteados e a resposta é calculada. Não há banco de perguntas escrito à mão.
- **Teste:** `npm run testar:orbita` confere cerca de 470 mil questões. Ele lê o enunciado mostrado na tela, recalcula a resposta por outro caminho (força bruta quando dá) e também barra opção repetida, opção de mesmo valor (2/4 e 1/2) e letra que a fonte em pixels não desenha. O conteúdo foi escrito por mim e precisa de revisão pedagógica da COPES, como os demais jogos.
- **Errar ensina:** errar ou deixar as cápsulas passarem para o jogo e abre a conta explicada, sem tempo correndo. Errar tira um escudo. Deixar passar não tira, para quem ainda está calculando não ser punido duas vezes.
- **Celular:** durante a partida o jogo cobre a tela inteira, para a barra de baixo e a rolagem da página não atrapalharem o arrasto. No computador, fica dentro da página. A tela de jogo usa cores fixas e continua escura em qualquer tema.
- **Acessibilidade:** além de arrastar e das setas, os botões de resposta e as teclas de 1 a 4 levam a nave sozinha até a cápsula escolhida. Com movimento reduzido, o céu fica parado, sem tremor, clarão e faíscas, e há 25% mais tempo.
- **`?semente=123` na URL** repete a mesma sequência de contas. Serve para testar e para a equipe conferir uma partida, como o `?hoje=` nas páginas do Radar.

## Sons (04/11/2026)

Sons sintetizados com Web Audio (`src/lib/som.ts`), sem arquivos de áudio. Ficam ligados por padrão, mas o navegador só libera depois do primeiro toque ou tecla. O botão no topo desliga e a escolha fica salva no aparelho. Som é reforço: nenhuma informação depende dele.

## Oportunidades internacionais (04/11/2026)

O catálogo passou a incluir bolsas, intercâmbios, feiras e programas, além de olimpíadas. Cada item novo teve a página oficial lida; o que não foi confirmado fica como "a confirmar". O campo `instagram` só recebe post ou perfil confirmado, e `idiomas` lista o idioma exigido. Nenhuma bolsa da ONU aberta a menores de 18 anos foi confirmada: entraram concursos e programas de agências da ONU para jovens.

## Bonecos fiéis ao logo (03/11/2026)

Os mascotes não são mais redesenhados. `scripts/recortar_mascotes.py` recorta a ilustração oficial do logo em camadas (corpo, cabeça, mão) e o site as anima por rotação. Rosto, cabelo, óculos, jaleco e objetos são os do logo. Como o quadro central do logo esconde uma lateral de cada um, só esse pedaço do jaleco foi completado, em branco. Lupa, foguete e folha são objetos acrescentados, para variar as cenas; a pele do piscar e da boca vem da própria cor do desenho.

## Identidade JOC (03/11/2026)

Pedido: "muito sério", cara bem mais jovem, identidade e cores da JOC, logos reais das olimpíadas, vibe científica de várias áreas, mascotes como guias e narradores.

- **Universo azul profundo com as cores do logo** (laranja, turquesa, amarelo, rosa). Modo claro continua disponível, mas o padrão é o universo.
- **Fontes:** Exo 2 nos títulos, pelo clima de ficção científica. Nunito no texto, redonda e amigável.
- **Logos das olimpíadas não foram redesenhados.** `scripts/extrair_logos.py` tira do Catálogo e dos Radars, só apara a margem vazia. Sempre sobre placa, para qualquer cor funcionar. Dos 111 itens, 68 têm logo. Sem logo nos documentos, o site mostra a sigla ou a palavra-chave num azulejo, sem imitar marca. A COPES pode enviar os que faltam.
- **Mascotes:** são a própria ilustração do logo, recortada em camadas (ver "Bonecos fiéis ao logo"). Ainda sem nomes: "Cientista da folha" e "Cientista do microscópio" são rótulos provisórios.
- **Abertura com lupa:** a pessoa arrasta a lupa pelo universo e encontra oito olimpíadas escondidas. Ao achar todas, ganha carimbo.
- **Mundos do conhecimento:** uma seção por área, com mascote e cartas que viram ao toque.
- **Passaporte Científico:** carimbos por jogar, salvar e terminar a Escada. Fica só no aparelho.
- **Botão "Quero me inscrever"** leva ao site oficial. A inscrição continua sendo feita lá.
- **Jogos:** os mascotes narram em todos, comentando acertos e erros.
